# ===================================
# Storage Bucket for GraphQL Documentation
# ===================================
resource "google_storage_bucket" "docs" {
  name          = "${var.project_id}-${var.app_name}-docs"
  location      = var.location
  project       = var.project_id
  force_destroy = var.force_destroy

  # Uniform bucket-level access (recommended)
  uniform_bucket_level_access = true

  # Storage class for static website hosting
  storage_class = var.storage_class


  # CORS configuration for web access
  cors {
    origin          = var.cors_origins
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type", "Content-Length", "Content-Range", "Accept-Ranges"]
    max_age_seconds = 3600
  }

  # Lifecycle rules
  lifecycle_rule {
    condition {
      age = 90 # Delete old versions after 90 days
    }
    action {
      type = "Delete"
    }
  }

  # Versioning (recommended for documentation)
  versioning {
    enabled = var.versioning_enabled
  }

  # Labels
  labels = var.labels
}

# ===================================
# IAM: Public read access for documentation
# ===================================
resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.docs.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# ===================================
# IAM: Documentation service account has full permissions
# ===================================
# Grant full permissions to the documentation service account
# This service account is used by CI/CD to upload documentation
# It has storage.objectAdmin role for full read/write access
resource "google_storage_bucket_iam_member" "docs_service_account_admin" {
  bucket = google_storage_bucket.docs.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.docs_service_account_email}"

  depends_on = [google_storage_bucket.docs]
}

# ===================================
# IAM: Allow CI/CD service account to impersonate docs service account
# ===================================
# Grant serviceAccountUser role to allow CI/CD to impersonate the docs service account
# This allows the CI/CD service account (via Workload Identity) to act as the docs service account
resource "google_service_account_iam_member" "ci_cd_impersonate_docs" {
  count = var.ci_cd_service_account_email != null && var.ci_cd_service_account_email != "" ? 1 : 0

  service_account_id = var.docs_service_account_email
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${var.ci_cd_service_account_email}"
}
