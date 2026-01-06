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

variable "db_tier" {
  description = "Database tier (db-f1-micro, db-g1-small, db-n1-standard-1)"
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

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "disk_size" {
  description = "Disk size in GB"
  type        = number
  default     = 10
}

variable "high_availability" {
  description = "Enable high availability (REGIONAL)"
  type        = bool
  default     = false
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "enable_private_ip" {
  description = "Enable private IP for Cloud SQL (requires VPC)"
  type        = bool
  default     = false
}

variable "network_id" {
  description = "VPC network ID for private IP (optional)"
  type        = string
  default     = null
}

variable "private_vpc_connection_id" {
  description = "Private VPC connection ID (optional)"
  type        = string
  default     = null
}

variable "authorized_networks" {
  description = "List of authorized networks for public IP access"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}
