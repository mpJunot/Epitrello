variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "europe-west1"
}

variable "zone" {
  description = "GCP Zone"
  type        = string
  default     = "europe-west1-b"
}

variable "environment" {
  description = "Environment (staging or production)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

# ===================================
# Database Configuration
# ===================================
variable "db_tier" {
  description = "Cloud SQL tier (db-f1-micro, db-g1-small, db-n1-standard-1)"
  type        = string
  default     = "db-f1-micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_user" {
  description = "Database user"
  type        = string
}

variable "database_password" {
  description = "Database password (minimum 16 characters)"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.database_password) >= 16
    error_message = "Database password must be at least 16 characters long."
  }
}

# ===================================
# Backend (Cloud Run) Configuration
# ===================================
variable "backend_image" {
  description = "Backend Docker image URL (e.g., gcr.io/PROJECT_ID/epitrello-backend:latest)"
  type        = string
}

variable "backend_cpu" {
  description = "Backend CPU allocation (e.g., 1000m = 1 vCPU)"
  type        = string
  default     = "1000m"
}

variable "backend_memory" {
  description = "Backend memory allocation (e.g., 512Mi, 1Gi)"
  type        = string
  default     = "512Mi"
}

variable "backend_min_instances" {
  description = "Minimum number of backend instances (0 to scale to zero, 1 for always on)"
  type        = number
  default     = 1

  validation {
    condition     = var.backend_min_instances >= 0 && var.backend_min_instances <= 10
    error_message = "Min instances must be between 0 and 10."
  }
}

variable "backend_max_instances" {
  description = "Maximum number of backend instances (keep at 1 for single instance mode)"
  type        = number
  default     = 1

  validation {
    condition     = var.backend_max_instances >= 1 && var.backend_max_instances <= 100
    error_message = "Max instances must be between 1 and 100."
  }
}

# ===================================
# Frontend (Cloud Run) Configuration
# ===================================
variable "frontend_image" {
  description = "Frontend Docker image URL (e.g., gcr.io/PROJECT_ID/epitrello-frontend:latest). Can be empty initially, will be updated after first build."
  type        = string
  default     = "gcr.io/PLACEHOLDER/epitrello-frontend:latest"
}

variable "frontend_cpu" {
  description = "Frontend CPU allocation (e.g., 1000m = 1 vCPU)"
  type        = string
  default     = "1000m"
}

variable "frontend_memory" {
  description = "Frontend memory allocation (e.g., 512Mi, 1Gi)"
  type        = string
  default     = "512Mi"
}

# ===================================
# Secrets Configuration
# ===================================
variable "jwt_secret" {
  description = "JWT Secret for authentication (minimum 32 characters)"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.jwt_secret) >= 32
    error_message = "JWT secret must be at least 32 characters long."
  }
}

variable "resend_api_key" {
  description = "Resend API key for email service"
  type        = string
  sensitive   = true
  default     = ""
}

variable "google_client_id" {
  description = "Google OAuth client ID (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth client secret (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "microsoft_client_id" {
  description = "Microsoft OAuth client ID (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "microsoft_client_secret" {
  description = "Microsoft OAuth client secret (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "apple_client_id" {
  description = "Apple OAuth client ID (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "apple_client_secret" {
  description = "Apple OAuth client secret (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "slack_client_id" {
  description = "Slack OAuth client ID (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "slack_client_secret" {
  description = "Slack OAuth client secret (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

# ===================================
# OAuth Callback URLs (optional)
# ===================================
variable "google_callback_url" {
  description = "Google OAuth callback URL. Format: https://{backend-url}/auth/google/callback. Can be left empty and set manually after first deployment using terraform output backend_url."
  type        = string
  sensitive   = false
  default     = ""
}

variable "microsoft_callback_url" {
  description = "Microsoft OAuth callback URL. Format: https://{backend-url}/auth/microsoft/callback. Can be left empty and set manually after first deployment using terraform output backend_url."
  type        = string
  sensitive   = false
  default     = ""
}

variable "apple_callback_url" {
  description = "Apple OAuth callback URL. Format: https://{backend-url}/auth/apple/callback. Can be left empty and set manually after first deployment using terraform output backend_url."
  type        = string
  sensitive   = false
  default     = ""
}

variable "slack_callback_url" {
  description = "Slack OAuth callback URL. Format: https://{backend-url}/auth/slack/callback. Can be left empty and set manually after first deployment using terraform output backend_url."
  type        = string
  sensitive   = false
  default     = ""
}


# ===================================
# Frontend (Cloud Run) Configuration
# ===================================
variable "frontend_min_instances" {
  description = "Minimum number of frontend instances (0 to scale to zero)"
  type        = number
  default     = 0

  validation {
    condition     = var.frontend_min_instances >= 0 && var.frontend_min_instances <= 100
    error_message = "Frontend min instances must be between 0 and 100."
  }
}

variable "frontend_max_instances" {
  description = "Maximum number of frontend instances"
  type        = number
  default     = 10

  validation {
    condition     = var.frontend_max_instances >= 1 && var.frontend_max_instances <= 1000
    error_message = "Frontend max instances must be between 1 and 1000."
  }
}

# ===================================
# Storage Configuration
# ===================================
variable "storage_location" {
  description = "Cloud Storage bucket location (EU, US, ASIA)"
  type        = string
  default     = "EU"

  validation {
    condition     = contains(["EU", "US", "ASIA"], var.storage_location)
    error_message = "Storage location must be EU, US, or ASIA."
  }
}

# ===================================
# Networking Configuration
# ===================================
variable "enable_private_ip" {
  description = "Enable private IP for Cloud SQL (requires VPC)"
  type        = bool
  default     = false
}

variable "subnet_cidr" {
  description = "CIDR range for the VPC subnet"
  type        = string
  default     = "10.0.0.0/24"
}

variable "connector_cidr" {
  description = "CIDR range for VPC connector"
  type        = string
  default     = "10.8.0.0/28"
}

variable "connector_min_instances" {
  description = "Minimum number of VPC connector instances"
  type        = number
  default     = 2
}

variable "connector_max_instances" {
  description = "Maximum number of VPC connector instances"
  type        = number
  default     = 3
}

variable "connector_machine_type" {
  description = "Machine type for VPC connector"
  type        = string
  default     = "e2-micro"
}

# ===================================
# CI/CD Configuration
# ===================================
variable "ci_cd_service_account_email" {
  description = "CI/CD service account email (from Workload Identity Federation) that can impersonate the docs service account. Optional - if not provided, CI/CD will use its own permissions."
  type        = string
  default     = null
}

