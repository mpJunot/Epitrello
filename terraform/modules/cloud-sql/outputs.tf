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

output "connection_string" {
  description = "PostgreSQL connection string"
  value       = var.enable_private_ip && google_sql_database_instance.main.private_ip_address != null ? "postgresql://${var.db_user}:${nonsensitive(var.db_password)}@${google_sql_database_instance.main.private_ip_address}:5432/${var.db_name}?sslmode=require" : "postgresql://${var.db_user}:${nonsensitive(var.db_password)}@${google_sql_database_instance.main.public_ip_address}:5432/${var.db_name}?sslmode=require"
  sensitive   = true
}

output "ssl_cert" {
  description = "SSL certificate"
  value       = google_sql_ssl_cert.client_cert.cert
  sensitive   = true
}
