output "jwt_secret_id" {
  description = "JWT secret ID"
  value       = google_secret_manager_secret.jwt_secret.secret_id
}

output "jwt_secret_name" {
  description = "JWT secret full name (for environment variables)"
  value       = google_secret_manager_secret.jwt_secret.name
}

output "db_password_secret_id" {
  description = "Database password secret ID"
  value       = google_secret_manager_secret.db_password.secret_id
}

output "db_password_secret_name" {
  description = "Database password secret full name"
  value       = google_secret_manager_secret.db_password.name
}

output "resend_api_key_secret_name" {
  description = "Resend API key secret full name"
  value       = length(google_secret_manager_secret.resend_api_key) > 0 ? google_secret_manager_secret.resend_api_key[0].name : null
}

output "google_client_id_secret_name" {
  description = "Google OAuth client ID secret full name"
  value       = length(google_secret_manager_secret.google_client_id) > 0 ? google_secret_manager_secret.google_client_id[0].name : null
}

output "google_client_secret_secret_name" {
  description = "Google OAuth client secret secret full name"
  value       = length(google_secret_manager_secret.google_client_secret) > 0 ? google_secret_manager_secret.google_client_secret[0].name : null
}

output "microsoft_client_id_secret_name" {
  description = "Microsoft OAuth client ID secret full name"
  value       = length(google_secret_manager_secret.microsoft_client_id) > 0 ? google_secret_manager_secret.microsoft_client_id[0].name : null
}

output "microsoft_client_secret_secret_name" {
  description = "Microsoft OAuth client secret secret full name"
  value       = length(google_secret_manager_secret.microsoft_client_secret) > 0 ? google_secret_manager_secret.microsoft_client_secret[0].name : null
}

output "github_client_id_secret_name" {
  description = "GitHub OAuth client ID secret full name"
  value       = length(google_secret_manager_secret.github_client_id) > 0 ? google_secret_manager_secret.github_client_id[0].name : null
}

output "github_client_secret_secret_name" {
  description = "GitHub OAuth client secret secret full name"
  value       = length(google_secret_manager_secret.github_client_secret) > 0 ? google_secret_manager_secret.github_client_secret[0].name : null
}

output "slack_client_id_secret_name" {
  description = "Slack OAuth client ID secret full name"
  value       = length(google_secret_manager_secret.slack_client_id) > 0 ? google_secret_manager_secret.slack_client_id[0].name : null
}

output "slack_client_secret_secret_name" {
  description = "Slack OAuth client secret secret full name"
  value       = length(google_secret_manager_secret.slack_client_secret) > 0 ? google_secret_manager_secret.slack_client_secret[0].name : null
}
