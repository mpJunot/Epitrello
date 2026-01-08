# GitHub Actions - Service Account & Workload Identity

Terraform module for creating the service account and Workload Identity Pool configuration for GitHub Actions CI/CD.

This module should be applied **locally** and **independently** from the main Terraform configuration.

## Overview

This module sets up:

- **Service Account**: `epitrello-deployer` with required IAM roles for CI/CD operations
- **Workload Identity Pool**: Enables keyless authentication from GitHub Actions to GCP
- **Workload Identity Provider**: OIDC provider that establishes trust with GitHub Actions
- **IAM Bindings**: Allows GitHub Actions workflows to impersonate the service account

## Structure

```
terraform-wif/
├── main.tf          # Service Account + Workload Identity resources
├── variables.tf     # Input variables
├── outputs.tf       # Output values for GitHub Secrets
├── README.md        # This file
└── env/             # Environment-specific configuration files
    ├── dev.tfvars.example
    ├── prod.tfvars.example
    └── .gitignore
```

## Prerequisites

1. **Service Account**: The `epitrello-deployer` service account must exist (created manually or via Terraform)
2. **APIs Enabled**: The following Google Cloud APIs must be enabled:
   - `iam.googleapis.com`
   - `iamcredentials.googleapis.com`
   - `sts.googleapis.com`
3. **Permissions**: Your GCP user/service account needs:
   - `roles/iam.workloadIdentityPoolAdmin`
   - `roles/iam.serviceAccountAdmin`
   - `roles/resourcemanager.projectIamAdmin`

## Usage

### 1. Create Configuration Files

Copy the example files from the `env/` directory:

```bash
cd terraform-wif
cp env/dev.tfvars.example env/dev.tfvars
cp env/prod.tfvars.example env/prod.tfvars
```

Update the values in your `.tfvars` files:

```hcl
project_id  = "your-project-id"
environment = "dev"  # or "prod"

# GitHub Repository Configuration
github_owner = "your-org"
github_repo  = "epitrello"

# Service Account IAM Roles (optional, defaults are used if not specified)
sa_roles = [
  "roles/run.admin",
  "roles/storage.admin",
  # ... add or remove roles as needed
]
```

### 2. Initialize Terraform

```bash
cd terraform-wif
terraform init
```

### 3. Review and Apply

**For development environment:**

```bash
# Review the planned changes
terraform plan -var-file="env/dev.tfvars"

# Apply the configuration
terraform apply -var-file="env/dev.tfvars"
```

**For production environment:**

```bash
# Review the planned changes
terraform plan -var-file="env/prod.tfvars"

# Apply the configuration
terraform apply -var-file="env/prod.tfvars"
```

### 4. Retrieve Values for GitHub Secrets

After successful deployment, retrieve the values:

```bash
terraform output -raw gcp_service_account
terraform output -raw gcp_workload_identity_provider
```

### 5. Configure GitHub Secrets

1. Navigate to your GitHub repository: **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add the following secrets:

   | Secret Name                      | Value                                        |
   | -------------------------------- | -------------------------------------------- |
   | `GCP_SERVICE_ACCOUNT`            | Output from `gcp_service_account`            |
   | `GCP_WORKLOAD_IDENTITY_PROVIDER` | Output from `gcp_workload_identity_provider` |

## Variables

| Variable       | Description                                                 | Type           | Required | Default                 |
| -------------- | ----------------------------------------------------------- | -------------- | -------- | ----------------------- |
| `project_id`   | Google Cloud Platform project ID                            | `string`       | Yes      | -                       |
| `github_owner` | GitHub repository owner (organization or username)          | `string`       | Yes      | -                       |
| `github_repo`  | GitHub repository name                                      | `string`       | Yes      | -                       |
| `environment`  | Environment name (e.g., dev, staging, prod)                 | `string`       | Yes      | -                       |
| `sa_roles`     | List of IAM roles to assign to the deployer service account | `list(string)` | No       | See default roles below |

### Default Service Account Roles

If `sa_roles` is not specified, the following roles are assigned by default:

- `roles/artifactregistry.admin` - Artifact Registry management
- `roles/artifactregistry.createOnPushWriter` - Artifact Registry push access
- `roles/artifactregistry.writer` - Artifact Registry write access
- `roles/cloudsql.admin` - Cloud SQL instance management
- `roles/compute.networkAdmin` - VPC network, subnet, and route management
- `roles/compute.securityAdmin` - Firewall rules and SSL certificates management
- `roles/iam.serviceAccountUser` - Service account impersonation
- `roles/run.admin` - Cloud Run service management
- `roles/secretmanager.admin` - Secret Manager management
- `roles/servicenetworking.networksAdmin` - Service networking connections (VPC peering)
- `roles/serviceusage.serviceUsageConsumer` - Service usage consumption
- `roles/storage.admin` - Cloud Storage bucket management

## Outputs

| Output                           | Description                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| `gcp_service_account`            | Service account email address for `GCP_SERVICE_ACCOUNT` GitHub secret                       |
| `gcp_workload_identity_provider` | Workload Identity Provider resource name for `GCP_WORKLOAD_IDENTITY_PROVIDER` GitHub secret |
| `service_account_email`          | Service account email address (alias)                                                       |
| `workload_identity_provider`     | Workload Identity Provider resource name (alias)                                            |
| `service_account_instructions`   | Instructions for managing the service account                                               |

## Example Workflow

**For development environment:**

```bash
# 1. Copy and configure environment file
cd terraform-wif
cp env/dev.tfvars.example env/dev.tfvars
# Edit env/dev.tfvars with your values

# 2. Initialize Terraform
terraform init

# 3. Review changes
terraform plan -var-file="env/dev.tfvars"

# 4. Apply configuration
terraform apply -var-file="env/dev.tfvars"

# 5. Retrieve values
echo "GCP_SERVICE_ACCOUNT:"
terraform output -raw gcp_service_account

echo "GCP_WORKLOAD_IDENTITY_PROVIDER:"
terraform output -raw gcp_workload_identity_provider
```

**For production environment:**

```bash
# 1. Copy and configure environment file
cd terraform-wif
cp env/prod.tfvars.example env/prod.tfvars
# Edit env/prod.tfvars with your values

# 2. Initialize Terraform
terraform init

# 3. Review changes
terraform plan -var-file="env/prod.tfvars"

# 4. Apply configuration
terraform apply -var-file="env/prod.tfvars"

# 5. Retrieve values
terraform output -raw gcp_service_account
terraform output -raw gcp_workload_identity_provider
```

## Security Considerations

- **No Service Account Keys**: This module uses Workload Identity Federation, eliminating the need for long-lived service account keys
- **Repository Scoping**: Access is restricted to workflows from the specified GitHub repository
- **Least Privilege**: Only the minimum required IAM roles are assigned
- **Audit Trail**: All impersonation events are logged in Cloud Audit Logs

## Troubleshooting

### Resources Already Exist

If the service account or Workload Identity resources already exist in GCP, you need to import them into Terraform state.

**Option 1: Use the import script (recommended)**

```bash
cd terraform-wif
./import-existing-resources.sh dev    # For development
./import-existing-resources.sh prod   # For production
```

**Option 2: Import manually**

```bash
# Import service account
terraform import -var-file="env/dev.tfvars" \
  google_service_account.epitrello_deployer \
  projects/YOUR_PROJECT_ID/serviceAccounts/epitrello-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Import Workload Identity Pool
terraform import -var-file="env/dev.tfvars" \
  google_iam_workload_identity_pool.github_actions \
  projects/YOUR_PROJECT_ID/locations/global/workloadIdentityPools/github-actions-pool

# Import Workload Identity Provider
terraform import -var-file="env/dev.tfvars" \
  google_iam_workload_identity_pool_provider.github_actions \
  projects/YOUR_PROJECT_ID/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider
```

### Permission Denied

Ensure your GCP user has the required permissions:

```bash
# Check your current permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:YOUR_EMAIL"
```

### Workload Identity Provider Creation Fails

Ensure the required APIs are enabled:

```bash
gcloud services enable \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  --project=YOUR_PROJECT_ID
```

## Additional Resources

- [Workload Identity Federation Documentation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Google GitHub Actions Auth](https://github.com/google-github-actions/auth)
