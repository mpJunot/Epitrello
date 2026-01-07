
# Backend configuration for Terraform state
# Uncomment and configure after first apply

# Option 1: Local backend (default, good for single user)
# State is stored locally in terraform.tfstate
# No configuration needed - this is the default

# Option 2: GCS backend (recommended for team collaboration)
# Uncomment and configure after creating the bucket:
# terraform {
#   backend "gcs" {
#     bucket  = "epitrello-terraform-state"
#     prefix  = "terraform/state"
#   }
# }

# To migrate from local to GCS backend:
# 1. Create the bucket:
#    gcloud storage buckets create gs://epitrello-terraform-state --location=EU
# 2. Uncomment the backend block above
# 3. Run: terraform init -migrate-state

resource "google_storage_bucket" "terraform_state" {
  # Must match the backend configuration in versions.tf
  name          = "epitrello-terraform-state"
  location      = "EU"
  force_destroy = false

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      num_newer_versions = 3
    }
    action {
      type = "Delete"
    }
  }

  lifecycle {
    # Bucket already exists, ignore changes if it was created manually
    ignore_changes = []
  }
}

output "terraform_state_bucket" {
  description = "Bucket for storing Terraform state"
  value       = google_storage_bucket.terraform_state.name
}
