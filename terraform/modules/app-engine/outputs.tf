output "app_id" {
  description = "App Engine application ID"
  value       = google_app_engine_application.app.app_id
}

output "app_url" {
  description = "App Engine default URL"
  value       = "https://${var.project_id}.appspot.com"
}

output "app_location" {
  description = "App Engine location"
  value       = google_app_engine_application.app.location_id
}

output "service_account_email" {
  description = "Frontend service account email"
  value       = google_service_account.frontend.email
}

output "service_account_name" {
  description = "Frontend service account name"
  value       = google_service_account.frontend.name
}
