variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "location" {
  description = "Bucket location (EU, US, ASIA)"
  type        = string
  default     = "EU"

  validation {
    condition     = contains(["EU", "US", "ASIA"], var.location)
    error_message = "Location must be EU, US, or ASIA."
  }
}

variable "storage_class" {
  description = "Storage class"
  type        = string
  default     = "STANDARD"

  validation {
    condition     = contains(["STANDARD", "NEARLINE", "COLDLINE", "ARCHIVE"], var.storage_class)
    error_message = "Storage class must be STANDARD, NEARLINE, COLDLINE, or ARCHIVE."
  }
}

variable "cors_origins" {
  description = "CORS allowed origins"
  type        = list(string)
  default     = ["*"]
}

variable "force_destroy" {
  description = "Allow bucket destruction even if not empty (use with caution!)"
  type        = bool
  default     = false
}

variable "versioning_enabled" {
  description = "Enable object versioning"
  type        = bool
  default     = true
}

variable "docs_service_account_email" {
  description = "Documentation service account email with full permissions on the bucket"
  type        = string
}

variable "ci_cd_service_account_email" {
  description = "CI/CD service account email (from Workload Identity Federation) that can impersonate the docs service account. Optional - if not provided, CI/CD will use its own permissions."
  type        = string
  default     = null
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}
