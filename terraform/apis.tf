
# Enable required GCP APIs
locals {
  required_apis = [
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "storage-api.googleapis.com",
    "artifactregistry.googleapis.com",
    "containerregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "compute.googleapis.com",
    "vpcaccess.googleapis.com",
    "servicenetworking.googleapis.com",
    "cloudbuild.googleapis.com",
    "iamcredentials.googleapis.com", # Required for Workload Identity Federation
    "sts.googleapis.com",            # Required for Workload Identity Federation
  ]
}

resource "google_project_service" "required_apis" {
  for_each = toset(local.required_apis)

  project = var.project_id
  service = each.value

  disable_on_destroy = false
}

# Wait for APIs to be fully enabled
resource "time_sleep" "wait_for_apis" {
  depends_on = [google_project_service.required_apis]

  create_duration = "30s"
}
