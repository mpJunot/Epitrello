# ===================================
# App Engine Application
# ===================================
resource "google_app_engine_application" "app" {
  project       = var.project_id
  location_id   = var.location
  database_type = "CLOUD_DATASTORE_COMPATIBILITY"
}

# ===================================
# Service Account for App Engine
# ===================================
resource "google_service_account" "frontend" {
  account_id   = "${var.app_name}-frontend-sa"
  display_name = "App Engine Frontend Service Account"
  project      = var.project_id
}

# ===================================
# IAM: Allow App Engine to invoke Cloud Run backend
# ===================================
resource "google_project_iam_member" "frontend_run_invoker" {
  project = var.project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.frontend.email}"
}

# ===================================
# IAM: Allow App Engine to read from Cloud Storage
# ===================================
resource "google_project_iam_member" "frontend_storage_viewer" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.frontend.email}"
}

# ===================================
# Note: Actual App Engine deployment is done via app.yaml + gcloud
# Terraform manages the application and IAM, deployment is separate
# ===================================
