# Service Account for CI/CD deployments
resource "google_service_account" "epitrello_deployer" {
  account_id   = "epitrello-deployer"
  display_name = "Epitrello Deployer"
  description  = "Service account for deploying Epitrello application via CI/CD"
  project      = var.project_id
}

# Define all required roles
locals {
  required_roles = [
    "roles/run.admin",
    "roles/storage.admin",
    "roles/cloudsql.admin",
    "roles/iam.serviceAccountUser",
    "roles/artifactregistry.admin",
    "roles/artifactregistry.writer",
    "roles/artifactregistry.createOnPushWriter",
    "roles/secretmanager.admin",
    "roles/serviceusage.serviceUsageConsumer",
    "roles/appengine.admin",
  ]
}

# Assign roles to the service account
resource "google_project_iam_member" "deployer_roles" {
  for_each = toset(local.required_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.epitrello_deployer.email}"

  depends_on = [google_service_account.epitrello_deployer]
}

# Create a service account key ONLY if requested
# This should be created once and then managed outside Terraform
resource "google_service_account_key" "epitrello_deployer_key" {
  count = var.create_service_account_key ? 1 : 0

  service_account_id = google_service_account.epitrello_deployer.name
  public_key_type    = "TYPE_X509_PEM_FILE"

  depends_on = [google_project_iam_member.deployer_roles]

  lifecycle {
    create_before_destroy = false
    # Prevent accidental key recreation
    ignore_changes = []
  }
}

# Output the service account email
output "service_account_email" {
  description = "Email of the created service account"
  value       = google_service_account.epitrello_deployer.email
}

# Output the private key (base64 encoded) - only if created
output "service_account_key" {
  description = "Private key for the service account (base64 encoded)"
  value       = var.create_service_account_key ? google_service_account_key.epitrello_deployer_key[0].private_key : null
  sensitive   = true
}

# Output the decoded private key (use with caution) - only if created
output "service_account_key_decoded" {
  description = "Private key for the service account (decoded JSON)"
  value       = var.create_service_account_key ? base64decode(google_service_account_key.epitrello_deployer_key[0].private_key) : null
  sensitive   = true
}

# Output instructions
output "service_account_instructions" {
  description = "Instructions for managing the service account"
  value       = var.create_service_account_key ? "Service account key created. Extract it and add to GitHub Secrets, then set create_service_account_key=false" : "Service account exists. No key created. Manage keys manually if needed."
}
