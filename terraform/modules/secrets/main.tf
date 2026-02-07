# ===================================
# JWT Secret
# ===================================
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "${var.project_id}-jwt-secret"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "jwt_secret_version" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret

  lifecycle {
    ignore_changes = [secret_data]
  }
}

# ===================================
# Database Password
# ===================================
resource "google_secret_manager_secret" "db_password" {
  secret_id = "${var.project_id}-db-password"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "db_password_version" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.database_password

  lifecycle {
    ignore_changes = [secret_data]
  }
}

# ===================================
# IAM: Allow backend service account to access secrets
# ===================================
resource "google_secret_manager_secret_iam_member" "jwt_secret_access" {
  secret_id = google_secret_manager_secret.jwt_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"
}

resource "google_secret_manager_secret_iam_member" "db_password_access" {
  secret_id = google_secret_manager_secret.db_password.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"
}

# ===================================
# Resend API Key
# ===================================
resource "google_secret_manager_secret" "resend_api_key" {
  count = var.resend_api_key != "" ? 1 : 0

  secret_id = "${var.project_id}-resend-api-key"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "resend_api_key_version" {
  count = var.resend_api_key != "" ? 1 : 0

  secret      = google_secret_manager_secret.resend_api_key[0].id
  secret_data = var.resend_api_key

  depends_on = [google_secret_manager_secret.resend_api_key]

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "google_secret_manager_secret_iam_member" "resend_api_key_access" {
  count = var.resend_api_key != "" ? 1 : 0

  secret_id = google_secret_manager_secret.resend_api_key[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"

  depends_on = [google_secret_manager_secret.resend_api_key]
}

# ===================================
# Google OAuth Secrets (optional)
# ===================================
resource "google_secret_manager_secret" "google_client_id" {
  count = var.google_client_id != "" ? 1 : 0

  secret_id = "${var.project_id}-google-client-id"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "google_client_id_version" {
  count = var.google_client_id != "" ? 1 : 0

  secret      = google_secret_manager_secret.google_client_id[0].id
  secret_data = var.google_client_id

  depends_on = [google_secret_manager_secret.google_client_id]

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "google_secret_manager_secret_iam_member" "google_client_id_access" {
  count = var.google_client_id != "" ? 1 : 0

  secret_id = google_secret_manager_secret.google_client_id[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"

  depends_on = [google_secret_manager_secret.google_client_id]
}

resource "google_secret_manager_secret" "google_client_secret" {
  count = var.google_client_secret != "" ? 1 : 0

  secret_id = "${var.project_id}-google-client-secret"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "google_client_secret_version" {
  count = var.google_client_secret != "" ? 1 : 0

  secret      = google_secret_manager_secret.google_client_secret[0].id
  secret_data = var.google_client_secret

  depends_on = [google_secret_manager_secret.google_client_secret]

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "google_secret_manager_secret_iam_member" "google_client_secret_access" {
  count = var.google_client_secret != "" ? 1 : 0

  secret_id = google_secret_manager_secret.google_client_secret[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"

  depends_on = [google_secret_manager_secret.google_client_secret]
}

# ===================================
# Microsoft OAuth Secrets (optional)
# ===================================
resource "google_secret_manager_secret" "microsoft_client_id" {
  count = var.microsoft_client_id != "" ? 1 : 0

  secret_id = "${var.project_id}-microsoft-client-id"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "microsoft_client_id_version" {
  count = var.microsoft_client_id != "" ? 1 : 0

  secret      = google_secret_manager_secret.microsoft_client_id[0].id
  secret_data = var.microsoft_client_id

  depends_on = [google_secret_manager_secret.microsoft_client_id]

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "google_secret_manager_secret_iam_member" "microsoft_client_id_access" {
  count = var.microsoft_client_id != "" ? 1 : 0

  secret_id = google_secret_manager_secret.microsoft_client_id[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"

  depends_on = [google_secret_manager_secret.microsoft_client_id]
}

resource "google_secret_manager_secret" "microsoft_client_secret" {
  count = var.microsoft_client_secret != "" ? 1 : 0

  secret_id = "${var.project_id}-microsoft-client-secret"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "microsoft_client_secret_version" {
  count = var.microsoft_client_secret != "" ? 1 : 0

  secret      = google_secret_manager_secret.microsoft_client_secret[0].id
  secret_data = var.microsoft_client_secret

  depends_on = [google_secret_manager_secret.microsoft_client_secret]

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "google_secret_manager_secret_iam_member" "microsoft_client_secret_access" {
  count = var.microsoft_client_secret != "" ? 1 : 0

  secret_id = google_secret_manager_secret.microsoft_client_secret[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"

  depends_on = [google_secret_manager_secret.microsoft_client_secret]
}

# ===================================
# Apple OAuth Secrets (optional)
# ===================================
resource "google_secret_manager_secret" "github_client_id" {
  count = var.github_client_id != "" ? 1 : 0

  secret_id = "${var.project_id}-github-client-id"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "github_client_id_version" {
  count = var.github_client_id != "" ? 1 : 0

  secret      = google_secret_manager_secret.github_client_id[0].id
  secret_data = var.github_client_id

  depends_on = [google_secret_manager_secret.github_client_id]

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "google_secret_manager_secret_iam_member" "github_client_id_access" {
  count = var.github_client_id != "" ? 1 : 0

  secret_id = google_secret_manager_secret.github_client_id[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"

  depends_on = [google_secret_manager_secret.github_client_id]
}

resource "google_secret_manager_secret" "github_client_secret" {
  count = var.github_client_secret != "" ? 1 : 0

  secret_id = "${var.project_id}-github-client-secret"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "github_client_secret_version" {
  count = var.github_client_secret != "" ? 1 : 0

  secret      = google_secret_manager_secret.github_client_secret[0].id
  secret_data = var.github_client_secret

  depends_on = [google_secret_manager_secret.github_client_secret]

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "google_secret_manager_secret_iam_member" "github_client_secret_access" {
  count = var.github_client_secret != "" ? 1 : 0

  secret_id = google_secret_manager_secret.github_client_secret[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"

  depends_on = [google_secret_manager_secret.github_client_secret]
}

# ===================================
# Slack OAuth Secrets (optional)
# ===================================
resource "google_secret_manager_secret" "slack_client_id" {
  count = var.slack_client_id != "" ? 1 : 0

  secret_id = "${var.project_id}-slack-client-id"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "slack_client_id_version" {
  count = var.slack_client_id != "" ? 1 : 0

  secret      = google_secret_manager_secret.slack_client_id[0].id
  secret_data = var.slack_client_id

  depends_on = [google_secret_manager_secret.slack_client_id]

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "google_secret_manager_secret_iam_member" "slack_client_id_access" {
  count = var.slack_client_id != "" ? 1 : 0

  secret_id = google_secret_manager_secret.slack_client_id[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"

  depends_on = [google_secret_manager_secret.slack_client_id]
}

resource "google_secret_manager_secret" "slack_client_secret" {
  count = var.slack_client_secret != "" ? 1 : 0

  secret_id = "${var.project_id}-slack-client-secret"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "slack_client_secret_version" {
  count = var.slack_client_secret != "" ? 1 : 0

  secret      = google_secret_manager_secret.slack_client_secret[0].id
  secret_data = var.slack_client_secret

  depends_on = [google_secret_manager_secret.slack_client_secret]

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "google_secret_manager_secret_iam_member" "slack_client_secret_access" {
  count = var.slack_client_secret != "" ? 1 : 0

  secret_id = google_secret_manager_secret.slack_client_secret[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"

  depends_on = [google_secret_manager_secret.slack_client_secret]
}

# ===================================
# OAuth Callback URLs
# ===================================
resource "google_secret_manager_secret" "google_callback_url" {
  count = var.google_callback_url != "" ? 1 : 0

  secret_id = "${var.project_id}-google-callback-url"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "google_callback_url_version" {
  count = var.google_callback_url != "" ? 1 : 0

  secret      = google_secret_manager_secret.google_callback_url[0].id
  secret_data = var.google_callback_url

  depends_on = [google_secret_manager_secret.google_callback_url]

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "google_secret_manager_secret_iam_member" "google_callback_url_access" {
  count = var.google_callback_url != "" ? 1 : 0

  secret_id = google_secret_manager_secret.google_callback_url[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"

  depends_on = [google_secret_manager_secret.google_callback_url]
}

resource "google_secret_manager_secret" "microsoft_callback_url" {
  count = var.microsoft_callback_url != "" ? 1 : 0

  secret_id = "${var.project_id}-microsoft-callback-url"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "microsoft_callback_url_version" {
  count = var.microsoft_callback_url != "" ? 1 : 0

  secret      = google_secret_manager_secret.microsoft_callback_url[0].id
  secret_data = var.microsoft_callback_url

  depends_on = [google_secret_manager_secret.microsoft_callback_url]

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "google_secret_manager_secret_iam_member" "microsoft_callback_url_access" {
  count = var.microsoft_callback_url != "" ? 1 : 0

  secret_id = google_secret_manager_secret.microsoft_callback_url[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"

  depends_on = [google_secret_manager_secret.microsoft_callback_url]
}

resource "google_secret_manager_secret" "github_callback_url" {
  count = var.github_callback_url != "" ? 1 : 0

  secret_id = "${var.project_id}-github-callback-url"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "github_callback_url_version" {
  count = var.github_callback_url != "" ? 1 : 0

  secret      = google_secret_manager_secret.github_callback_url[0].id
  secret_data = var.github_callback_url

  depends_on = [google_secret_manager_secret.github_callback_url]

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "google_secret_manager_secret_iam_member" "github_callback_url_access" {
  count = var.github_callback_url != "" ? 1 : 0

  secret_id = google_secret_manager_secret.github_callback_url[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"

  depends_on = [google_secret_manager_secret.github_callback_url]
}

resource "google_secret_manager_secret" "slack_callback_url" {
  count = var.slack_callback_url != "" ? 1 : 0

  secret_id = "${var.project_id}-slack-callback-url"
  project   = var.project_id

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "slack_callback_url_version" {
  count = var.slack_callback_url != "" ? 1 : 0

  secret      = google_secret_manager_secret.slack_callback_url[0].id
  secret_data = var.slack_callback_url

  depends_on = [google_secret_manager_secret.slack_callback_url]

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "google_secret_manager_secret_iam_member" "slack_callback_url_access" {
  count = var.slack_callback_url != "" ? 1 : 0

  secret_id = google_secret_manager_secret.slack_callback_url[0].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.backend_service_account_email}"

  depends_on = [google_secret_manager_secret.slack_callback_url]
}
