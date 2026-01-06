variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "location" {
  description = "App Engine location (e.g., europe-west, us-central)"
  type        = string
  default     = "europe-west"

  validation {
    condition     = can(regex("^(europe-west|us-central|us-east|asia-northeast|australia-southeast)", var.location))
    error_message = "Invalid App Engine location. Must be a valid App Engine region."
  }
}

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "backend_url" {
  description = "Backend URL (Cloud Run service URL)"
  type        = string
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0

  validation {
    condition     = var.min_instances >= 0 && var.min_instances <= 100
    error_message = "Min instances must be between 0 and 100."
  }
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 10

  validation {
    condition     = var.max_instances >= 1 && var.max_instances <= 1000
    error_message = "Max instances must be between 1 and 1000."
  }
}
