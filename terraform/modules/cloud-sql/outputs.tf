output "instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.main.name
}

output "connection_name" {
  description = "Cloud SQL connection name (for Cloud SQL Proxy)"
  value       = google_sql_database_instance.main.connection_name
}

output "public_ip" {
  description = "Public IP address"
  value       = google_sql_database_instance.main.public_ip_address
}

output "private_ip" {
  description = "Private IP address (if enabled)"
  value       = google_sql_database_instance.main.private_ip_address
}

output "database_name" {
  description = "Database name"
  value       = google_sql_database.database.name
}

locals {
  # Support both public_ip_address and ip_address[].ip_address (provider version differences)
  db_host_public   = google_sql_database_instance.main.public_ip_address
  db_host_from_list = try([for ip in google_sql_database_instance.main.ip_address : ip.ip_address if ip.type == "PRIMARY"][0], try(google_sql_database_instance.main.ip_address[0].ip_address, ""), "")
  db_host = coalesce(
    var.enable_private_ip ? google_sql_database_instance.main.private_ip_address : null,
    local.db_host_public != null && local.db_host_public != "" ? local.db_host_public : null,
    local.db_host_from_list != "" ? local.db_host_from_list : null
  )
}

output "connection_string" {
  description = "PostgreSQL connection string"
  value = local.db_host != null && local.db_host != "" ? "postgresql://${var.db_user}:${nonsensitive(var.db_password)}@${local.db_host}:5432/${var.db_name}?sslmode=require" : null
  sensitive = true
}

output "ssl_cert" {
  description = "SSL certificate"
  value       = google_sql_ssl_cert.client_cert.cert
  sensitive   = true
}
