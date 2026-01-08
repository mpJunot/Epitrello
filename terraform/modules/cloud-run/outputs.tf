output "service_name" {
  description = "Cloud Run service name"
  value       = google_cloud_run_v2_service.backend.name
}

output "service_url" {
  description = "Cloud Run service URL"
  value       = google_cloud_run_v2_service.backend.uri
}

output "service_account_email" {
  description = "Service account email"
  value       = var.service_account_email
}

output "service_id" {
  description = "Service ID"
  value       = google_cloud_run_v2_service.backend.id
}
