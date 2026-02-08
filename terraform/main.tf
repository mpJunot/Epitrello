locals {
  app_name      = "${var.environment}-epitrello"
  secret_prefix = "projects/${var.project_id}/secrets/${var.project_id}"
  common_labels = {
    app         = "epitrello"
    environment = var.environment
    managed_by  = "terraform"
  }
}

# ===================================
# Default Service Account
# ===================================
resource "google_service_account" "default" {
  account_id   = "${local.app_name}-sa"
  display_name = "EpiTrello Service Account"
  project      = var.project_id
}

# ===================================
# Networking Module (VPC, VPC Connector)
# ===================================
module "networking" {
  source = "./modules/networking"

  project_id  = var.project_id
  region      = var.region
  app_name    = local.app_name
  environment = var.environment

  enable_private_ip       = var.enable_private_ip
  subnet_cidr             = var.subnet_cidr
  connector_cidr          = var.connector_cidr
  connector_min_instances = var.connector_min_instances
  connector_max_instances = var.connector_max_instances
  connector_machine_type  = var.connector_machine_type
}

# ===================================
# Secret Manager Module
# ===================================
module "secrets" {
  source = "./modules/secrets"

  project_id                    = var.project_id
  jwt_secret                    = var.jwt_secret
  database_password             = var.database_password
  resend_api_key                = var.resend_api_key
  google_client_id              = var.google_client_id
  google_client_secret          = var.google_client_secret
  google_callback_url           = var.google_callback_url
  microsoft_client_id           = var.microsoft_client_id
  microsoft_client_secret       = var.microsoft_client_secret
  microsoft_callback_url        = var.microsoft_callback_url
  github_client_id              = var.github_client_id
  github_client_secret          = var.github_client_secret
  github_callback_url           = var.github_callback_url
  slack_client_id               = var.slack_client_id
  slack_client_secret           = var.slack_client_secret
  slack_callback_url            = var.slack_callback_url
  backend_service_account_email = module.service_accounts.backend_service_account_email
  labels                        = local.common_labels

  depends_on = [module.service_accounts]
}

# ===================================
# Cloud SQL Module (PostgreSQL)
# ===================================
module "cloud_sql" {
  source = "./modules/cloud-sql"

  project_id  = var.project_id
  region      = var.region
  app_name    = local.app_name
  db_tier     = var.db_tier
  db_name     = var.db_name
  db_user     = var.db_user
  db_password = var.database_password

  enable_private_ip         = var.enable_private_ip
  network_id                = module.networking.network_id
  private_vpc_connection_id = module.networking.private_vpc_connection_id

  create_ssl_client_cert = var.cloud_sql_create_ssl_client_cert

  labels = local.common_labels

  depends_on = [module.networking]
}

# ===================================
# Service Accounts Module
# ===================================
module "service_accounts" {
  source = "./modules/service-accounts"

  project_id = var.project_id
  app_name   = local.app_name
}

# ===================================
# Cloud Storage Module
# ===================================
# Note: We use the service account created above to avoid circular dependency
module "cloud_storage" {
  source = "./modules/cloud-storage"

  project_id                      = var.project_id
  app_name                        = local.app_name
  location                        = var.storage_location
  force_destroy                   = var.force_destroy_buckets
  service_account_email           = google_service_account.default.email
  cloud_run_service_account_email = module.service_accounts.backend_service_account_email

  # CORS configuration for frontend
  cors_origins = [
    "https://*.run.app",
    "http://localhost:3000" # For development
  ]

  labels = local.common_labels

  depends_on = [module.service_accounts]
}

# ===================================
# Cloud Run Module (Backend)
# ===================================
module "cloud_run" {
  source = "./modules/cloud-run"

  project_id            = var.project_id
  region                = var.region
  app_name              = local.app_name
  image                 = var.backend_image
  cpu                   = var.backend_cpu
  memory                = var.backend_memory
  min_instances         = var.backend_min_instances
  max_instances         = var.backend_max_instances
  service_account_email = module.service_accounts.backend_service_account_email

  database_connection                 = module.cloud_sql.connection_string
  jwt_secret_name                     = module.secrets.jwt_secret_name
  resend_api_key_secret_name          = module.secrets.resend_api_key_secret_name
  google_client_id_secret_name        = module.secrets.google_client_id_secret_name
  google_client_secret_secret_name    = module.secrets.google_client_secret_secret_name
  microsoft_client_id_secret_name     = module.secrets.microsoft_client_id_secret_name
  microsoft_client_secret_secret_name = module.secrets.microsoft_client_secret_secret_name
  github_client_id_secret_name        = module.secrets.github_client_id_secret_name
  github_client_secret_secret_name    = module.secrets.github_client_secret_secret_name
  slack_client_id_secret_name         = module.secrets.slack_client_id_secret_name
  slack_client_secret_secret_name     = module.secrets.slack_client_secret_secret_name
  storage_bucket                      = module.cloud_storage.bucket_name
  vpc_connector_id                    = var.enable_private_ip ? module.networking.vpc_connector_id : null
  frontend_url                        = ""
  google_callback_url                 = var.google_callback_url != "" ? var.google_callback_url : null
  microsoft_callback_url              = var.microsoft_callback_url != "" ? var.microsoft_callback_url : null
  github_callback_url                 = var.github_callback_url != "" ? var.github_callback_url : null
  slack_callback_url                  = var.slack_callback_url != "" ? var.slack_callback_url : null

  labels = local.common_labels

  depends_on = [
    module.cloud_sql,
    module.secrets,
    module.networking,
    module.cloud_storage,
    module.service_accounts,
    google_service_account.default
  ]
}

# ===================================
# Cloud Run Module (Frontend)
# ===================================
module "cloud_run_frontend" {
  source = "./modules/cloud-run-frontend"

  project_id    = var.project_id
  region        = var.region
  app_name      = local.app_name
  image         = var.frontend_image
  backend_url   = module.cloud_run.service_url
  cpu           = var.frontend_cpu
  memory        = var.frontend_memory
  min_instances = var.frontend_min_instances
  max_instances = var.frontend_max_instances

  labels = local.common_labels

  depends_on = [module.cloud_run]
}

# ===================================
# Documentation Bucket Module
# ===================================
module "docs_bucket" {
  source = "./modules/docs-bucket"

  project_id                  = var.project_id
  app_name                    = local.app_name
  location                    = var.storage_location
  force_destroy               = var.force_destroy_buckets
  docs_service_account_email  = module.service_accounts.docs_service_account_email
  ci_cd_service_account_email = var.ci_cd_service_account_email

  labels = local.common_labels

  depends_on = [module.service_accounts]
}
