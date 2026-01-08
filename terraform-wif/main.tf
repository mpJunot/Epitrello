# ===================================
# Service Account for CI/CD Deployments
# ===================================
# This service account is used by GitHub Actions to deploy infrastructure and applications.
resource "google_service_account" "epitrello_deployer" {
  account_id   = "epitrello-deployer"
  display_name = "Epitrello Deployer"
  description  = "Service account for deploying Epitrello application via CI/CD"
  project      = var.project_id
}

# Local values for service account email and GitHub repository
locals {
  # Service account email
  sa_mail = google_service_account.epitrello_deployer.email

  # Construct GitHub repository identifier from owner and repository name
  repo = "${var.github_owner}/${var.github_repo}"
}

# ===================================
# IAM Role Assignments
# ===================================
# Assign configured roles to the deployer service account
resource "google_project_iam_member" "deployer_roles" {
  for_each = toset(var.sa_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${local.sa_mail}"
}


# ===================================
# Workload Identity Pool
# ===================================
# Workload Identity Pool enables keyless authentication from GitHub Actions
# to Google Cloud Platform using OAuth2/OIDC tokens.
resource "google_iam_workload_identity_pool" "github_actions" {
  project                   = var.project_id
  workload_identity_pool_id = "github-actions-pool"
  display_name              = "GitHub Actions Pool"
  description               = "Workload Identity Pool for GitHub Actions CI/CD"
}

# ===================================
# Workload Identity Provider
# ===================================
# OIDC provider that establishes trust between GitHub Actions and Google Cloud.
# Maps GitHub OIDC token claims to Google Cloud attributes for fine-grained access control.
resource "google_iam_workload_identity_pool_provider" "github_actions" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-actions-provider"
  display_name                       = "GitHub Actions Provider"
  description                        = "OIDC provider for GitHub Actions"

  # Map GitHub OIDC token claims to Google Cloud attributes
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  attribute_condition = "attribute.repository == \"${local.repo}\""

  # OIDC configuration for GitHub Actions
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# ===================================
# Project Data Source
# ===================================
# Retrieve project number for constructing Workload Identity principal sets
data "google_project" "project" {
  project_id = var.project_id
}

# ===================================
# Service Account IAM Binding
# ===================================
# Allow GitHub Actions workflows from the specified repository to impersonate
# the deployer service account using Workload Identity Federation.
resource "google_service_account_iam_member" "github_actions_impersonation" {
  service_account_id = google_service_account.epitrello_deployer.id
  role               = "roles/iam.workloadIdentityUser"
  # Restrict access to workflows from the specified GitHub repository
  member = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_actions.name}/attribute.repository/${local.repo}"

  depends_on = [
    google_iam_workload_identity_pool.github_actions,
    google_iam_workload_identity_pool_provider.github_actions
  ]
}
