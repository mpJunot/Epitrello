# ===================================
# Import existing Secret Manager secrets (avoid 409 "already exists")
# Run once: terraform plan then terraform apply. After that, these imports are a no-op.
# If you don't use an optional secret (e.g. Slack), remove or comment out its import block.
# Remove this file entirely if you prefer to manage imports manually.
# ===================================

locals {
  secret_prefix = "projects/${var.project_id}/secrets/${var.project_id}"
}

import {
  to = module.secrets.google_secret_manager_secret.jwt_secret
  id = "${local.secret_prefix}-jwt-secret"
}

import {
  to = module.secrets.google_secret_manager_secret.db_password
  id = "${local.secret_prefix}-db-password"
}

import {
  to = module.secrets.google_secret_manager_secret.resend_api_key[0]
  id = "${local.secret_prefix}-resend-api-key"
}

import {
  to = module.secrets.google_secret_manager_secret.google_client_id[0]
  id = "${local.secret_prefix}-google-client-id"
}

import {
  to = module.secrets.google_secret_manager_secret.google_client_secret[0]
  id = "${local.secret_prefix}-google-client-secret"
}

import {
  to = module.secrets.google_secret_manager_secret.microsoft_client_id[0]
  id = "${local.secret_prefix}-microsoft-client-id"
}

import {
  to = module.secrets.google_secret_manager_secret.microsoft_client_secret[0]
  id = "${local.secret_prefix}-microsoft-client-secret"
}

import {
  to = module.secrets.google_secret_manager_secret.github_client_id[0]
  id = "${local.secret_prefix}-github-client-id"
}

import {
  to = module.secrets.google_secret_manager_secret.github_client_secret[0]
  id = "${local.secret_prefix}-github-client-secret"
}

import {
  to = module.secrets.google_secret_manager_secret.slack_client_id[0]
  id = "${local.secret_prefix}-slack-client-id"
}

import {
  to = module.secrets.google_secret_manager_secret.slack_client_secret[0]
  id = "${local.secret_prefix}-slack-client-secret"
}

import {
  to = module.secrets.google_secret_manager_secret.google_callback_url[0]
  id = "${local.secret_prefix}-google-callback-url"
}

import {
  to = module.secrets.google_secret_manager_secret.microsoft_callback_url[0]
  id = "${local.secret_prefix}-microsoft-callback-url"
}

import {
  to = module.secrets.google_secret_manager_secret.github_callback_url[0]
  id = "${local.secret_prefix}-github-callback-url"
}

import {
  to = module.secrets.google_secret_manager_secret.slack_callback_url[0]
  id = "${local.secret_prefix}-slack-callback-url"
}
