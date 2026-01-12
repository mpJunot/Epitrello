# ===================================
# Backend Service Account
# ===================================
# Service account for Cloud Run backend service
# This service account is used by the backend to access:
# - Secret Manager (JWT, database password, OAuth secrets)
# - Cloud Storage (file uploads)
resource "google_service_account" "backend" {
  account_id   = "${var.app_name}-backend-sa"
  display_name = "Cloud Run Backend Service Account"
  description  = "Service account for Cloud Run backend service"
  project      = var.project_id
}
