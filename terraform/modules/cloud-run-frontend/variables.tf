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

variable "backend_url" {
  description = "Backend API URL"
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
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}
