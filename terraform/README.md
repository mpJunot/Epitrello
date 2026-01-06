# EpiTrello Terraform Infrastructure

Infrastructure as Code for EpiTrello using Terraform on Google Cloud Platform.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Google Cloud Platform                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │  App Engine  │────────▶│  Cloud Run   │            │
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
├── production.tfvars        # Production environment config
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
    └── app-engine/          # Frontend Next.js
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

1. **Create GCP Projects**
   ```bash
   # Staging
   gcloud projects create epitrello-staging --name="EpiTrello Staging"

   # Production
   gcloud projects create epitrello-prod --name="EpiTrello Production"
   ```

2. **Enable Billing**
   - Go to https://console.cloud.google.com/billing
   - Link projects to billing account

3. **Enable Required APIs**
   ```bash
   # For each project
   gcloud config set project epitrello-staging

   gcloud services enable \
     compute.googleapis.com \
     run.googleapis.com \
     sqladmin.googleapis.com \
     storage-api.googleapis.com \
     secretmanager.googleapis.com \
     cloudbuild.googleapis.com \
     appengine.googleapis.com
   ```

4. **Create Configuration Files**
   ```bash
   # Copy example files
   cp terraform.tfvars.example staging.tfvars
   cp terraform.tfvars.example production.tfvars
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
   - Edit `production.tfvars` with production values
   - Update project IDs, secrets, and resource configurations

7. **Create Terraform State Bucket**
   ```bash
   # For staging
   gsutil mb -l europe-west1 gs://epitrello-terraform-state-staging

   # For production
   gsutil mb -l europe-west1 gs://epitrello-terraform-state-production
   ```

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

#### Deploy to Production

```bash
# Switch to production workspace
terraform workspace new production

# Plan deployment
terraform plan -var-file="production.tfvars" -out=production.tfplan

# Apply deployment
terraform apply production.tfplan

# Save outputs
terraform output -json > outputs-production.json
```

## 🔄 Daily Operations

### Switch Between Environments

```bash
# List workspaces
terraform workspace list

# Switch to staging
terraform workspace select staging

# Switch to production
terraform workspace select production
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
- **App Engine**: $0-15/month (scale to zero)
- **Cloud Run**: $5-15/month (scale to zero)
- **Cloud SQL**: $10/month (db-f1-micro)
- **Cloud Storage**: $1/month
- **Secrets**: $0.50/month
- **Total**: ~$17-42/month

### Production Environment
- **App Engine**: $15-30/month (always on)
- **Cloud Run**: $20-40/month (always on)
- **Cloud SQL**: $50/month (db-n1-standard-1)
- **Cloud Storage**: $2/month
- **Secrets**: $0.50/month
- **Total**: ~$87-123/month

## 🔐 Security

### Secrets Management

- All secrets stored in Google Secret Manager
- Never commit `*.tfvars` files to Git
- Use different secrets for staging and production
- Rotate secrets regularly

### Access Control

- Use service accounts with minimum required permissions
- Enable deletion protection on production database
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
- **App Engine**: https://cloud.google.com/appengine/docs
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
