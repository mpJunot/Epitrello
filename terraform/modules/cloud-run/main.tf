# ===================================
# Service Account for Cloud Run
# ===================================
resource "google_service_account" "backend" {
  account_id   = "${var.app_name}-backend-sa"
  display_name = "Cloud Run Backend Service Account"
  project      = var.project_id
}

# ===================================
# Cloud Run Service (Backend)
# ===================================
resource "google_cloud_run_v2_service" "backend" {
  name     = "${var.app_name}-backend"
  location = var.region
  project  = var.project_id

  template {
    service_account = google_service_account.backend.email

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
        cpu_idle          = false # Keep CPU allocated for WebSocket
        startup_cpu_boost = false
      }

      # Container port
      ports {
        name           = "http1"
        container_port = 4000
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
        value = "4000"
      }

      # Database connection (direct via public IP + SSL)
      env {
        name  = "DATABASE_URL"
        value = var.database_connection
      }

      # JWT Secret from Secret Manager
      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = var.jwt_secret_name
            version = "latest"
          }
        }
      }

      # Resend API Key from Secret Manager (optional)
      dynamic "env" {
        for_each = var.resend_api_key_secret_name != null ? [1] : []
        content {
          name = "RESEND_API_KEY"
          value_source {
            secret_key_ref {
              secret  = var.resend_api_key_secret_name
              version = "latest"
            }
          }
        }
      }

      # Google OAuth from Secret Manager (optional)
      dynamic "env" {
        for_each = var.google_client_id_secret_name != null ? [1] : []
        content {
          name = "GOOGLE_CLIENT_ID"
          value_source {
            secret_key_ref {
              secret  = var.google_client_id_secret_name
              version = "latest"
            }
          }
        }
      }

      dynamic "env" {
        for_each = var.google_client_secret_secret_name != null ? [1] : []
        content {
          name = "GOOGLE_CLIENT_SECRET"
          value_source {
            secret_key_ref {
              secret  = var.google_client_secret_secret_name
              version = "latest"
            }
          }
        }
      }

      # Microsoft OAuth from Secret Manager (optional)
      dynamic "env" {
        for_each = var.microsoft_client_id_secret_name != null ? [1] : []
        content {
          name = "MICROSOFT_CLIENT_ID"
          value_source {
            secret_key_ref {
              secret  = var.microsoft_client_id_secret_name
              version = "latest"
            }
          }
        }
      }

      dynamic "env" {
        for_each = var.microsoft_client_secret_secret_name != null ? [1] : []
        content {
          name = "MICROSOFT_CLIENT_SECRET"
          value_source {
            secret_key_ref {
              secret  = var.microsoft_client_secret_secret_name
              version = "latest"
            }
          }
        }
      }

      # Apple OAuth from Secret Manager (optional)
      dynamic "env" {
        for_each = var.apple_client_id_secret_name != null ? [1] : []
        content {
          name = "APPLE_CLIENT_ID"
          value_source {
            secret_key_ref {
              secret  = var.apple_client_id_secret_name
              version = "latest"
            }
          }
        }
      }

      dynamic "env" {
        for_each = var.apple_client_secret_secret_name != null ? [1] : []
        content {
          name = "APPLE_CLIENT_SECRET"
          value_source {
            secret_key_ref {
              secret  = var.apple_client_secret_secret_name
              version = "latest"
            }
          }
        }
      }

      # Slack OAuth from Secret Manager (optional)
      dynamic "env" {
        for_each = var.slack_client_id_secret_name != null ? [1] : []
        content {
          name = "SLACK_CLIENT_ID"
          value_source {
            secret_key_ref {
              secret  = var.slack_client_id_secret_name
              version = "latest"
            }
          }
        }
      }

      dynamic "env" {
        for_each = var.slack_client_secret_secret_name != null ? [1] : []
        content {
          name = "SLACK_CLIENT_SECRET"
          value_source {
            secret_key_ref {
              secret  = var.slack_client_secret_secret_name
              version = "latest"
            }
          }
        }
      }

      # Cloud Storage bucket
      env {
        name  = "STORAGE_BUCKET"
        value = var.storage_bucket
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }

      # WebSocket configuration (single instance mode)
      env {
        name  = "WEBSOCKET_SINGLE_INSTANCE"
        value = "true"
      }

      env {
        name  = "REDIS_ENABLED"
        value = "false"
      }

      # CORS origins
      env {
        name  = "CORS_ORIGINS"
        value = "https://${var.project_id}.appspot.com,https://*.run.app"
      }

      # ===================================
      # Health Checks
      # ===================================

      startup_probe {
        http_get {
          path = "/health"
          port = 4000
        }
        initial_delay_seconds = 10
        timeout_seconds       = 3
        period_seconds        = 10
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/health"
          port = 4000
        }
        initial_delay_seconds = 30
        timeout_seconds       = 3
        period_seconds        = 30
        failure_threshold     = 3
      }
    }

    # Request timeout
    timeout = "300s"

    # Max concurrent requests per instance
    max_instance_request_concurrency = 1000

    # VPC Access (for private Cloud SQL connection)
    dynamic "vpc_access" {
      for_each = var.vpc_connector_id != null ? [1] : []
      content {
        connector = var.vpc_connector_id
        egress    = "PRIVATE_RANGES_ONLY"
      }
    }
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
  name     = google_cloud_run_v2_service.backend.name
  location = var.region
  project  = var.project_id
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ===================================
# IAM: Cloud SQL Client
# ===================================
resource "google_project_iam_member" "cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# ===================================
# IAM: Storage Object Admin
# ===================================
resource "google_project_iam_member" "storage_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.backend.email}"
}

# ===================================
# IAM: Secret Manager Accessor
# ===================================
resource "google_project_iam_member" "secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.backend.email}"
}
