# Environment Configuration Files

This directory contains environment-specific Terraform variable files.

## Structure

```
env/
├── staging.tfvars.example    # Example configuration for staging environment
├── .gitignore                 # Ignore actual .tfvars files (not examples)
└── README.md                  # This file
```

## Usage

### 1. Create Your Configuration Files

Copy the example file and update it with your actual values:

```bash
cd terraform/env
cp staging.tfvars.example staging.tfvars
```

### 2. Update Configuration Values

Edit `staging.tfvars` with:

- **GCP Project IDs**: Your actual project IDs
- **Secrets**: Generate strong secrets (see below)
- **Resource configurations**: Adjust CPU, memory, instances as needed

### 3. Generate Secrets

```bash
echo "JWT Secret: $(openssl rand -base64 48)"
echo "DB Password: $(openssl rand -base64 24)"
```

### 4. Apply Configuration

```bash
cd terraform
terraform plan -var-file="env/staging.tfvars"
terraform apply -var-file="env/staging.tfvars"
```

## Security

⚠️ **IMPORTANT**: Never commit `.tfvars` files containing real secrets to Git!

- ✅ `.tfvars.example` files are safe to commit (they contain placeholder values)
- ❌ `.tfvars` files are ignored by Git (see `.gitignore`)
- 🔒 Store real secrets in:
  - GitHub Secrets (for CI/CD)
  - Google Secret Manager (for runtime)
  - Local `.tfvars` files (never commit)

## Variables

See `terraform/variables.tf` for a complete list of available variables and their descriptions.

## Staging Configuration

- **Database**: `db-f1-micro` (free tier) or higher
- **Instances**: Can scale to zero
- **Private IP**: Optional
- **Cost**: ~$10-30/month (scale to zero)
