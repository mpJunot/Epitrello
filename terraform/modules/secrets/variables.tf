variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "jwt_secret" {
  description = "JWT Secret (minimum 32 characters)"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.jwt_secret) >= 32
    error_message = "JWT secret must be at least 32 characters long."
  }
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

variable "service_account_email" {
  description = "Service account email that needs access to secrets"
  type        = string
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

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}
