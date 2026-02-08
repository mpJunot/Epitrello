# EpiTrello Terraform Infrastructure

Infrastructure as Code for EpiTrello using Terraform on Google Cloud Platform.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Google Cloud Platform                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │  Cloud Run   │────────▶│  Cloud Run   │            │
│  │  (Frontend)  │  HTTPS  │  (Backend)   │            │
│  │   Next.js    │         │   NestJS     │            │
│  └──────────────┘         └──────┬───────┘            │
│                                  │                      │
│                                  │ SSL/TLS             │
│                                  ▼                      │
│                           ┌──────────────┐             │
│                           │  Cloud SQL   │             │
│                           │ (PostgreSQL) │             │
│                           │  Public IP   │             │
│                           └──────────────┘             │
│                                  ▼                      │
│                           ┌──────────────┐             │
│                           │Cloud Storage │             │
│                           │   (Files)    │             │
│                           └──────────────┘             │
│                                                         │
│                           ┌──────────────┐             │
│                           │Secret Manager│             │
│                           │  (Secrets)   │             │
│                           └──────────────┘             │
└─────────────────────────────────────────────────────────┘
```

## 📁 Structure

```
terraform/
├── main.tf                  # Main configuration
├── variables.tf             # Input variables
├── outputs.tf               # Output values
├── versions.tf              # Provider versions
├── .gitignore               # Git ignore rules
│
├── staging.tfvars           # Staging environment config
├── terraform.tfvars.example # Example configuration
│
└── modules/
    ├── secrets/             # Secret Manager
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    ├── cloud-sql/           # PostgreSQL database
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    ├── cloud-run/           # Backend NestJS
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    ├── cloud-storage/       # File uploads
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    └── cloud-run-frontend/  # Frontend Next.js
        ├── main.tf
        ├── variables.tf
        └── outputs.tf

github-actions/              # Service Account + Workload Identity for CI/CD
├── main.tf
├── variables.tf
└── outputs.tf
```

## 🚀 Quick Start

### Prerequisites

1. **Install Terraform**

   ```bash
   # macOS
   brew install terraform

   # Ubuntu
   sudo apt-get install terraform

   # Or download from https://terraform.io
   ```

2. **Install Google Cloud SDK**

   ```bash
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   ```

3. **Authenticate**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

### Initial Setup

1. **Create GCP Project**

   ```bash
   gcloud projects create epitrello-staging --name="EpiTrello Staging"
   ```

2. **Enable Billing**
   - Go to https://console.cloud.google.com/billing
   - Link the project to a billing account

3. **Enable Required APIs**

   ```bash
   gcloud config set project epitrello-staging

   gcloud services enable \
     compute.googleapis.com \
     run.googleapis.com \
     sqladmin.googleapis.com \
     storage-api.googleapis.com \
     secretmanager.googleapis.com \
     cloudbuild.googleapis.com
   ```

4. **Create Configuration Files**

   ```bash
   # Copy example files
   cp terraform.tfvars.example staging.tfvars
   cp terraform.tfvars.example staging.tfvars
   ```

5. **Generate Secrets**

   ```bash
   # Staging secrets
   echo "Staging JWT: $(openssl rand -base64 48)"
   echo "Staging DB:  $(openssl rand -base64 24)"

   # Production secrets (DIFFERENT!)
   echo "Production JWT: $(openssl rand -base64 48)"
   echo "Production DB:  $(openssl rand -base64 32)"
   ```

6. **Update Configuration Files**
   - Edit `staging.tfvars` with staging values
   - Edit `staging.tfvars` with your values
   - Update project IDs, secrets, and resource configurations

7. **Create Terraform State Bucket**

   ```bash
   # For staging
   gsutil mb -l europe-west1 gs://epitrello-terraform-state-staging

   # For staging state
   gsutil mb -l europe-west1 gs://epitrello-terraform-state
   ```

### Destroy or replace environment

When Terraform destroys or replaces resources, you may hit:

- **Buckets not empty**
  Set `force_destroy_buckets = true` (default) so storage and docs buckets can be destroyed with objects. Buckets _already_ created with the old default must be emptied before destroy, then retry:

  ```bash
  gsutil -m rm -r gs://PROJECT_ID-ENV-epitrello-uploads/**
  gsutil -m rm -r gs://PROJECT_ID-ENV-epitrello-docs/**
  ```

- **Cloud SQL: "database is being accessed"**
  Stop all clients (Cloud Run backend, migration jobs) so no connections remain, then retry destroy. Optionally use the same project and scale backend to 0 before running destroy.

- **Cloud SQL: "role cannot be dropped because some objects depend on it"**
  Before destroying, connect to the instance as `postgres` and run (replace `epitrello_user` with your `db_user`):

  ```sql
  REASSIGN OWNED BY epitrello_user TO postgres;
  DROP OWNED BY epitrello_user;
  ```

  Then run `terraform destroy` again (or let the replace continue).

### Deploy Infrastructure

#### Deploy to Staging

```bash
# Initialize Terraform
terraform init

# Create staging workspace
terraform workspace new staging

# Plan deployment
terraform plan -var-file="staging.tfvars" -out=staging.tfplan

# Apply deployment
terraform apply staging.tfplan

# Save outputs
terraform output -json > outputs-staging.json
```

## 🔄 Daily Operations

### Switch Workspace (if using workspaces)

```bash
terraform workspace list
terraform workspace select staging
```

### View Resources

```bash
# Current state
terraform show

# List all resources
terraform state list

# Show specific resource
terraform state show module.cloud_run.google_cloud_run_v2_service.backend
```

### Update Infrastructure

```bash
# Plan changes
terraform plan -var-file="staging.tfvars"

# Apply changes
terraform apply -var-file="staging.tfvars"
```

### Destroy Resources (CAUTION!)

```bash
# Destroy specific resource
terraform destroy -target=module.cloud_run -var-file="staging.tfvars"

# Destroy everything (DANGER!)
terraform destroy -var-file="staging.tfvars"
```

## 📊 Cost Estimation

### Staging Environment

- **Cloud Run (Frontend)**: $0-10/month (scale to zero)
- **Cloud Run (Backend)**: $5-15/month (scale to zero)
- **Cloud SQL**: $10/month (db-f1-micro)
- **Cloud Storage**: $1/month
- **Secrets**: $0.50/month
- **Total**: ~$17-37/month

## 🔐 Security

### Secrets Management

- All secrets stored in Google Secret Manager
- Never commit `*.tfvars` files to Git
- Rotate secrets regularly

### Access Control

- Use service accounts with minimum required permissions
- Enable deletion protection on the database when needed
- Use SSL/TLS for all connections
- Regularly audit IAM permissions

### Backup & Recovery

- Automated daily backups (30 days retention)
- Point-in-time recovery enabled
- Test backup restoration regularly

## 🧪 Testing

### Validate Configuration

```bash
terraform validate
```

### Format Code

```bash
terraform fmt -recursive
```

### Check for Issues

```bash
# Terraform
terraform plan -var-file="staging.tfvars"

# Security scan (optional)
tfsec .
```

## 📚 Documentation

- **Terraform**: https://terraform.io
- **Google Cloud**: https://cloud.google.com/docs
- **Cloud Run**: https://cloud.google.com/run/docs
- **Cloud SQL**: https://cloud.google.com/sql/docs

## 🐛 Troubleshooting

### Common Issues

#### State Lock

```bash
# If state is locked
terraform force-unlock LOCK_ID
```

#### Resource Already Exists

```bash
# Import existing resource
terraform import module.MODULE.RESOURCE RESOURCE_ID
```

#### API Not Enabled

```bash
# Enable required API
gcloud services enable SERVICE_NAME.googleapis.com
```

### Get Help

```bash
# Terraform help
terraform -help

# Specific command help
terraform plan -help
```

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test with `terraform plan`
4. Submit pull request

## 📄 License

Private - EpiTrello Project

---

**Last Updated**: December 2024
**Terraform Version**: >= 1.6.0
**Provider Version**: google ~> 5.0
