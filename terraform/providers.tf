# Provider configuration
# Terraform version and required_providers are defined in versions.tf

provider "google" {
  project = var.project_id
  region  = var.region
}
