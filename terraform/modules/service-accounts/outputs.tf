output "backend_service_account_email" {
  description = "Backend service account email"
  value       = google_service_account.backend.email
}

output "backend_service_account_id" {
  description = "Backend service account ID"
  value       = google_service_account.backend.id
}

output "backend_service_account_name" {
  description = "Backend service account name"
  value       = google_service_account.backend.name
}
