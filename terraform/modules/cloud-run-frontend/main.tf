# ===================================
# Service Account for Cloud Run Frontend
# ===================================
resource "google_service_account" "frontend" {
  account_id   = "${var.app_name}-frontend-sa"
  display_name = "Cloud Run Frontend Service Account"
  project      = var.project_id
}

# ===================================
# Cloud Run Service (Frontend)
# ===================================
resource "google_cloud_run_v2_service" "frontend" {
  name     = "${var.app_name}-frontend"
  location = var.region
  project  = var.project_id

  template {
    service_account = google_service_account.frontend.email

    # Scaling configuration
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    containers {
      image = var.image

      # Resource limits
      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
        cpu_idle          = true
        startup_cpu_boost = false
      }

      # Container port (Cloud Run standard is 8080)
      ports {
        name           = "http1"
        container_port = 8080
      }

      # ===================================
      # Environment Variables
      # ===================================

      # Node environment
      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = "8080"
      }

      env {
        name  = "HOSTNAME"
        value = "0.0.0.0"
      }

      # Next.js API URL
      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = var.backend_url
      }

      # ===================================
      # Health Checks
      # ===================================

      startup_probe {
        http_get {
          path = "/"
          port = 8080
        }
        initial_delay_seconds = 5
        timeout_seconds       = 10
        period_seconds        = 3
        failure_threshold     = 20
      }

      liveness_probe {
        http_get {
          path = "/"
          port = 8080
        }
        initial_delay_seconds = 30
        timeout_seconds       = 10
        period_seconds        = 30
        failure_threshold     = 3
      }
    }

    # Request timeout
    timeout = "300s"

    # Max concurrent requests per instance
    max_instance_request_concurrency = 80
  }

  # Traffic configuration
  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  labels = var.labels
}

# ===================================
# IAM: Allow public access
# ===================================
resource "google_cloud_run_v2_service_iam_member" "noauth" {
  name     = google_cloud_run_v2_service.frontend.name
  location = var.region
  project  = var.project_id
  role     = "roles/run.invoker"
  member   = "allUsers"

  depends_on = [google_cloud_run_v2_service.frontend]
}

# ===================================
# IAM: Storage Object Viewer (for static assets if needed)
# ===================================
resource "google_project_iam_member" "storage_viewer" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.frontend.email}"
}
