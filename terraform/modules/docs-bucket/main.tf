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
# IAM: Service account can write/update documentation
# ===================================
resource "google_storage_bucket_iam_member" "service_account_admin" {
  bucket = google_storage_bucket.docs.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.service_account_email}"

  depends_on = [google_storage_bucket.docs]
}

# ===================================
# IAM: Deployer service account (for CI/CD)
# ===================================
# Grant permissions to the deployer service account used by CI/CD
# This allows the GitHub Actions workflow to upload documentation
resource "google_storage_bucket_iam_member" "deployer_admin" {
  count = var.deployer_service_account_email != null && var.deployer_service_account_email != "" ? 1 : 0

  bucket = google_storage_bucket.docs.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.deployer_service_account_email}"

  depends_on = [google_storage_bucket.docs]
}
