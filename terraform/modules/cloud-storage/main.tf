# ===================================
# Storage Bucket for File Uploads
# ===================================
resource "google_storage_bucket" "uploads" {
  name          = "${var.project_id}-${var.app_name}-uploads"
  location      = var.location
  project       = var.project_id
  force_destroy = var.force_destroy

  # Uniform bucket-level access (recommended)
  uniform_bucket_level_access = true

  # Storage class
  storage_class = var.storage_class

  # CORS configuration for web uploads
  cors {
    origin          = var.cors_origins
    method          = ["GET", "POST", "PUT", "DELETE", "HEAD"]
    response_header = ["Content-Type", "Content-Length", "Content-Range", "Accept-Ranges"]
    max_age_seconds = 3600
  }

  # Lifecycle rules
  lifecycle_rule {
    condition {
      age = 365 # Delete files older than 1 year
    }
    action {
      type = "Delete"
    }
  }

  lifecycle_rule {
    condition {
      age                   = 30
      matches_storage_class = ["STANDARD"]
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  # Versioning (recommended for production)
  versioning {
    enabled = var.versioning_enabled
  }

  # Labels
  labels = var.labels
}

# ===================================
# IAM: Backend service account can read/write
# ===================================
resource "google_storage_bucket_iam_member" "backend_admin" {
  bucket = google_storage_bucket.uploads.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.service_account_email}"

  depends_on = [google_storage_bucket.uploads]
}

# ===================================
# IAM: Cloud Run Service Account Access
# ===================================
# Note: The service account must exist before this resource is created
resource "google_storage_bucket_iam_member" "cloud_run_admin" {
  bucket = google_storage_bucket.uploads.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.cloud_run_service_account_email}"

  depends_on = [google_storage_bucket.uploads]
}

# ===================================
# IAM: Public read access (optional, for signed URLs)
# ===================================
resource "google_storage_bucket_iam_member" "public_read" {
  count = var.public_access ? 1 : 0

  bucket = google_storage_bucket.uploads.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"

  depends_on = [google_storage_bucket.uploads]
}

# ===================================
# Create folder structure
# ===================================
resource "google_storage_bucket_object" "avatars_folder" {
  name    = "avatars/.keep"
  content = "folder"
  bucket  = google_storage_bucket.uploads.name

  depends_on = [google_storage_bucket.uploads]
}

resource "google_storage_bucket_object" "attachments_folder" {
  name    = "attachments/.keep"
  content = "folder"
  bucket  = google_storage_bucket.uploads.name

  depends_on = [google_storage_bucket.uploads]
}

resource "google_storage_bucket_object" "thumbnails_folder" {
  name    = "thumbnails/.keep"
  content = "folder"
  bucket  = google_storage_bucket.uploads.name

  depends_on = [google_storage_bucket.uploads]
}

resource "google_storage_bucket_object" "backgrounds_folder" {
  name    = "backgrounds/.keep"
  content = "folder"
  bucket  = google_storage_bucket.uploads.name

  depends_on = [google_storage_bucket.uploads]
}
