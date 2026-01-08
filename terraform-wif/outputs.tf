# ===================================
# Service Account Outputs
# ===================================
output "service_account_email" {
  description = "Email address of the deployer service account"
  value       = local.sa_mail
}

output "service_account_instructions" {
  description = "Instructions for managing the service account"
  value       = "Service account created successfully. Use Workload Identity Federation for authentication (no service account keys required)."
}

# ===================================
# Workload Identity Outputs
# ===================================
output "gcp_service_account" {
  description = "Service account email address. Use this value for the GCP_SERVICE_ACCOUNT secret in GitHub Actions repository settings."
  value       = local.sa_mail
}

output "gcp_workload_identity_provider" {
  description = "Full resource name of the Workload Identity Provider. Use this value for the GCP_WORKLOAD_IDENTITY_PROVIDER secret in GitHub Actions repository settings."
  value       = google_iam_workload_identity_pool_provider.github_actions.name
}

output "workload_identity_provider" {
  description = "Full resource name of the Workload Identity Provider for GitHub Actions (alias)"
  value       = google_iam_workload_identity_pool_provider.github_actions.name
}
