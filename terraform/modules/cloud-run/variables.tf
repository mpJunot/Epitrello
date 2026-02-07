variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "image" {
  description = "Docker image URL"
  type        = string
}

variable "cpu" {
  description = "CPU allocation (e.g., 1000m = 1 vCPU)"
  type        = string
  default     = "1000m"
}

variable "memory" {
  description = "Memory allocation (e.g., 512Mi, 1Gi)"
  type        = string
  default     = "512Mi"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 1
}

variable "database_connection" {
  description = "PostgreSQL connection string"
  type        = string
  sensitive   = true
  default     = null
}

variable "jwt_secret_name" {
  description = "JWT secret name in Secret Manager"
  type        = string
}

variable "resend_api_key_secret_name" {
  description = "Resend API key secret name in Secret Manager (optional)"
  type        = string
  default     = null
}

variable "google_client_id_secret_name" {
  description = "Google OAuth client ID secret name in Secret Manager (optional)"
  type        = string
  default     = null
}

variable "google_client_secret_secret_name" {
  description = "Google OAuth client secret secret name in Secret Manager (optional)"
  type        = string
  default     = null
}

variable "microsoft_client_id_secret_name" {
  description = "Microsoft OAuth client ID secret name in Secret Manager (optional)"
  type        = string
  default     = null
}

variable "microsoft_client_secret_secret_name" {
  description = "Microsoft OAuth client secret secret name in Secret Manager (optional)"
  type        = string
  default     = null
}

variable "github_client_id_secret_name" {
  description = "GitHub OAuth client ID secret name in Secret Manager (optional)"
  type        = string
  default     = null
}

variable "github_client_secret_secret_name" {
  description = "GitHub OAuth client secret secret name in Secret Manager (optional)"
  type        = string
  default     = null
}

variable "slack_client_id_secret_name" {
  description = "Slack OAuth client ID secret name in Secret Manager (optional)"
  type        = string
  default     = null
}

variable "slack_client_secret_secret_name" {
  description = "Slack OAuth client secret secret name in Secret Manager (optional)"
  type        = string
  default     = null
}

variable "google_callback_url" {
  description = "Google OAuth callback URL (optional)"
  type        = string
  default     = null
}

variable "microsoft_callback_url" {
  description = "Microsoft OAuth callback URL (optional)"
  type        = string
  default     = null
}

variable "github_callback_url" {
  description = "GitHub OAuth callback URL (optional)"
  type        = string
  default     = null
}

variable "slack_callback_url" {
  description = "Slack OAuth callback URL (optional)"
  type        = string
  default     = null
}

variable "storage_bucket" {
  description = "Cloud Storage bucket name"
  type        = string
}

variable "vpc_connector_id" {
  description = "VPC connector ID for private Cloud SQL access (optional)"
  type        = string
  default     = null
}

variable "service_account_email" {
  description = "Service account email for Cloud Run service"
  type        = string
}

variable "frontend_url" {
  description = "Frontend URL for CORS and OAuth redirects (optional, can be set after first deployment)"
  type        = string
  default     = ""
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}
