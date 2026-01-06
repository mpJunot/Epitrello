output "bucket_name" {
  description = "Storage bucket name"
  value       = google_storage_bucket.uploads.name
}

output "bucket_url" {
  description = "Storage bucket URL"
  value       = google_storage_bucket.uploads.url
}

output "bucket_self_link" {
  description = "Storage bucket self link"
  value       = google_storage_bucket.uploads.self_link
}

output "bucket_location" {
  description = "Bucket location"
  value       = google_storage_bucket.uploads.location
}
