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

output "docs_service_account_email" {
  description = "Documentation service account email"
  value       = google_service_account.docs.email
}

output "docs_service_account_id" {
  description = "Documentation service account ID"
  value       = google_service_account.docs.id
}

output "docs_service_account_name" {
  description = "Documentation service account name"
  value       = google_service_account.docs.name
}
