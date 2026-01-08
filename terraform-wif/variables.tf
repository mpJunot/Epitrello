variable "project_id" {
  description = "Google Cloud Platform project ID where resources will be created"
  type        = string
}

variable "github_owner" {
  description = "GitHub repository owner (organization or username)"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "sa_roles" {
  description = "List of IAM roles to assign to the deployer service account"
  type        = list(string)
  default = [
    "roles/artifactregistry.admin",
    "roles/artifactregistry.createOnPushWriter",
    "roles/artifactregistry.writer",
    "roles/cloudsql.admin",
    "roles/compute.networkAdmin",
    "roles/compute.securityAdmin",
    "roles/iam.serviceAccountUser",
    "roles/run.admin",
    "roles/secretmanager.admin",
    "roles/servicenetworking.networksAdmin",
    "roles/serviceusage.serviceUsageConsumer",
    "roles/storage.admin",
  ]
}
