output "bucket_name" {
  description = "Documentation bucket name"
  value       = google_storage_bucket.docs.name
}

output "bucket_url" {
  description = "Documentation bucket URL"
  value       = google_storage_bucket.docs.url
}

output "bucket_self_link" {
  description = "Documentation bucket self link"
  value       = google_storage_bucket.docs.self_link
}

output "bucket_location" {
  description = "Bucket location"
  value       = google_storage_bucket.docs.location
}

output "public_url" {
  description = "Public URL to access the documentation"
  value       = "https://storage.googleapis.com/${google_storage_bucket.docs.name}/index.html"
}
