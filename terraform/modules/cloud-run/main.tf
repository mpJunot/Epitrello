# ===================================
# Cloud Run Service (Backend)
# ===================================
resource "google_cloud_run_v2_service" "backend" {
  name     = "${var.app_name}-backend"
  location = var.region
  project  = var.project_id

  template {
    service_account = var.service_account_email

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

      # Database connection (direct via public IP + SSL)
      dynamic "env" {
        for_each = var.database_connection != null && var.database_connection != "" ? [1] : []
        content {
          name  = "DATABASE_URL"
          value = var.database_connection
        }
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

      # Google OAuth Callback URL
      dynamic "env" {
        for_each = var.google_callback_url != null && var.google_callback_url != "" ? [1] : []
        content {
          name  = "GOOGLE_CALLBACK_URL"
          value = var.google_callback_url
        }
      }

      # Microsoft OAuth Callback URL
      dynamic "env" {
        for_each = var.microsoft_callback_url != null && var.microsoft_callback_url != "" ? [1] : []
        content {
          name  = "MICROSOFT_CALLBACK_URL"
          value = var.microsoft_callback_url
        }
      }

      # Apple OAuth Callback URL
      dynamic "env" {
        for_each = var.github_callback_url != null && var.github_callback_url != "" ? [1] : []
        content {
          name  = "GITHUB_CALLBACK_URL"
          value = var.github_callback_url
        }
      }

      # Slack OAuth Callback URL
      dynamic "env" {
        for_each = var.slack_callback_url != null && var.slack_callback_url != "" ? [1] : []
        content {
          name  = "SLACK_CALLBACK_URL"
          value = var.slack_callback_url
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
        for_each = var.github_client_id_secret_name != null ? [1] : []
        content {
          name = "GITHUB_CLIENT_ID"
          value_source {
            secret_key_ref {
              secret  = var.github_client_id_secret_name
              version = "latest"
            }
          }
        }
      }

      dynamic "env" {
        for_each = var.github_client_secret_secret_name != null ? [1] : []
        content {
          name = "GITHUB_CLIENT_SECRET"
          value_source {
            secret_key_ref {
              secret  = var.github_client_secret_secret_name
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

      # CORS origins (includes localhost for local development)
      env {
        name  = "CORS_ORIGINS"
        value = "https://*.run.app,http://localhost:3000"
      }

      # Frontend URL (for OAuth redirects and email links)
      dynamic "env" {
        for_each = var.frontend_url != null && var.frontend_url != "" ? [1] : []
        content {
          name  = "FRONTEND_URL"
          value = var.frontend_url
        }
      }

      # ===================================
      # Health Checks
      # ===================================

      startup_probe {
        http_get {
          path = "/health"
          port = 8080
        }
        initial_delay_seconds = 5
        timeout_seconds       = 1
        period_seconds        = 3
        failure_threshold     = 20
      }

      liveness_probe {
        http_get {
          path = "/health"
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

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image
    ]
  }
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

  depends_on = [google_cloud_run_v2_service.backend]
}

# ===================================
# IAM Permissions Note
# ===================================
# IAM permissions are managed elsewhere:
# - Secret Manager: Managed per-secret in the secrets module
# - Storage: Managed per-bucket in the cloud-storage module
# - Cloud SQL: Not needed for public IP connections with SSL
# These project-level IAM bindings were removed to avoid permission errors
# and follow the principle of least privilege (per-resource permissions)
