# ===================================
# Cloud SQL PostgreSQL Instance
# ===================================
resource "google_sql_database_instance" "main" {
  name             = "${var.app_name}-db"
  database_version = "POSTGRES_15"
  region           = var.region
  project          = var.project_id

  # Deletion protection (disable for testing, enable for production)
  deletion_protection = var.deletion_protection

  # Wait for private VPC connection if using private IP
  # Note: depends_on cannot use conditional expressions directly,
  # so we rely on the module-level dependency in main.tf

  settings {
    tier              = var.db_tier
    availability_type = var.high_availability ? "REGIONAL" : "ZONAL"
    disk_type         = "PD_SSD"
    disk_size         = var.disk_size
    disk_autoresize   = true

    # IP configuration (public or private)
    ip_configuration {
      ipv4_enabled    = !var.enable_private_ip
      private_network = var.enable_private_ip && var.network_id != null ? var.network_id : null

      # SSL mode for all connections
      ssl_mode = "ENCRYPTED_ONLY"

      # Authorized networks (only for public IP)
      dynamic "authorized_networks" {
        for_each = !var.enable_private_ip ? (length(var.authorized_networks) > 0 ? var.authorized_networks : [{ name = "allow-all-with-ssl", value = "0.0.0.0/0" }]) : []
        content {
          name  = authorized_networks.value.name
          value = authorized_networks.value.value
        }
      }
    }

    # Automated backups
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7

      backup_retention_settings {
        retained_backups = 30
        retention_unit   = "COUNT"
      }
    }

    # Maintenance window
    maintenance_window {
      day          = 7 # Sunday
      hour         = 3 # 3 AM
      update_track = "stable"
    }

    # Database flags
    database_flags {
      name  = "max_connections"
      value = "100"
    }

    database_flags {
      name  = "shared_buffers"
      value = "262144" # 256MB in 8KB blocks
    }

    # Insights configuration
    insights_config {
      query_insights_enabled  = true
      query_plans_per_minute  = 5
      query_string_length     = 1024
      record_application_tags = true
    }
  }
}

# ===================================
# Database
# ===================================
resource "google_sql_database" "database" {
  name     = var.db_name
  instance = google_sql_database_instance.main.name
  project  = var.project_id
}

# ===================================
# Database User
# ===================================
resource "google_sql_user" "user" {
  name     = var.db_user
  instance = google_sql_database_instance.main.name
  password = var.db_password
  project  = var.project_id
}

# ===================================
# SSL Certificate
# ===================================
resource "google_sql_ssl_cert" "client_cert" {
  common_name = "${var.app_name}-client-cert"
  instance    = google_sql_database_instance.main.name
  project     = var.project_id
}
