# ===================================
# Import existing resources to avoid 409 "already exists".
# Terraform imports these into state instead of creating them.
# After first apply, these blocks are a no-op.
# Add an import block here if you get 409 for another resource.
# ===================================

# Default service account (main.tf)
import {
  to = google_service_account.default
  id = "projects/${var.project_id}/serviceAccounts/${local.app_name}-sa@${var.project_id}.iam.gserviceaccount.com"
}

# Networking: VPC, subnet, connector, firewalls
import {
  to = module.networking.google_compute_network.vpc
  id = "projects/${var.project_id}/global/networks/${local.app_name}-vpc"
}

import {
  to = module.networking.google_compute_subnetwork.subnet
  id = "projects/${var.project_id}/regions/${var.region}/subnetworks/${local.app_name}-subnet"
}

import {
  to = module.networking.google_vpc_access_connector.connector
  id = "projects/${var.project_id}/locations/${var.region}/connectors/staging-vpc-conn"
}

import {
  to = module.networking.google_compute_firewall.allow_internal
  id = "projects/${var.project_id}/global/firewalls/${local.app_name}-allow-internal"
}

import {
  to = module.networking.google_compute_firewall.allow_health_checks
  id = "projects/${var.project_id}/global/firewalls/${local.app_name}-allow-health-checks"
}

# Storage buckets (import id: project_id/bucket_name)
import {
  to = module.cloud_storage.google_storage_bucket.uploads
  id = "${var.project_id}/${var.project_id}-${local.app_name}-uploads"
}

import {
  to = module.docs_bucket.google_storage_bucket.docs
  id = "${var.project_id}/${var.project_id}-${local.app_name}-docs"
}

# Cloud SQL instance (import id: project_id/instance_name)
import {
  to = module.cloud_sql.google_sql_database_instance.main
  id = "${var.project_id}/${local.app_name}-db"
}

# Service accounts module: backend + docs
import {
  to = module.service_accounts.google_service_account.backend
  id = "projects/${var.project_id}/serviceAccounts/${local.app_name}-backend-sa@${var.project_id}.iam.gserviceaccount.com"
}

import {
  to = module.service_accounts.google_service_account.docs
  id = "projects/${var.project_id}/serviceAccounts/${local.app_name}-docs-sa@${var.project_id}.iam.gserviceaccount.com"
}

# Cloud Run backend
import {
  to = module.cloud_run.google_cloud_run_v2_service.backend
  id = "projects/${var.project_id}/locations/${var.region}/services/${local.app_name}-backend"
}

# Cloud Run frontend (remove block if the service does not exist yet)
import {
  to = module.cloud_run_frontend.google_cloud_run_v2_service.frontend
  id = "projects/${var.project_id}/locations/${var.region}/services/${local.app_name}-frontend"
}

# Secret Manager (remove optional blocks if you don't use that secret)
import {
  to = module.secrets.google_secret_manager_secret.jwt_secret
  id = "${local.secret_prefix}-jwt-secret"
}

import {
  to = module.secrets.google_secret_manager_secret.db_password
  id = "${local.secret_prefix}-db-password"
}

import {
  to = module.secrets.google_secret_manager_secret.resend_api_key[0]
  id = "${local.secret_prefix}-resend-api-key"
}

import {
  to = module.secrets.google_secret_manager_secret.google_client_id[0]
  id = "${local.secret_prefix}-google-client-id"
}

import {
  to = module.secrets.google_secret_manager_secret.google_client_secret[0]
  id = "${local.secret_prefix}-google-client-secret"
}

import {
  to = module.secrets.google_secret_manager_secret.microsoft_client_id[0]
  id = "${local.secret_prefix}-microsoft-client-id"
}

import {
  to = module.secrets.google_secret_manager_secret.microsoft_client_secret[0]
  id = "${local.secret_prefix}-microsoft-client-secret"
}

import {
  to = module.secrets.google_secret_manager_secret.github_client_id[0]
  id = "${local.secret_prefix}-github-client-id"
}

import {
  to = module.secrets.google_secret_manager_secret.github_client_secret[0]
  id = "${local.secret_prefix}-github-client-secret"
}

import {
  to = module.secrets.google_secret_manager_secret.slack_client_id[0]
  id = "${local.secret_prefix}-slack-client-id"
}

import {
  to = module.secrets.google_secret_manager_secret.slack_client_secret[0]
  id = "${local.secret_prefix}-slack-client-secret"
}

# import {
#   to = module.secrets.google_secret_manager_secret.google_callback_url[0]
#   id = "${local.secret_prefix}-google-callback-url"
# }

import {
  to = module.secrets.google_secret_manager_secret.microsoft_callback_url[0]
  id = "${local.secret_prefix}-microsoft-callback-url"
}

import {
  to = module.secrets.google_secret_manager_secret.github_callback_url[0]
  id = "${local.secret_prefix}-github-callback-url"
}

import {
  to = module.secrets.google_secret_manager_secret.slack_callback_url[0]
  id = "${local.secret_prefix}-slack-callback-url"
}
