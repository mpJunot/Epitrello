# Environment Configuration Files

This directory contains environment-specific Terraform variable files.

## Structure

```
env/
├── staging.tfvars.example    # Example configuration for staging environment
├── production.tfvars.example  # Example configuration for production environment
├── .gitignore                 # Ignore actual .tfvars files (not examples)
└── README.md                  # This file
```

## Usage

### 1. Create Your Configuration Files

Copy the example files and update them with your actual values:

```bash
cd terraform/env
cp staging.tfvars.example staging.tfvars
cp production.tfvars.example production.tfvars
```

### 2. Update Configuration Values

Edit `staging.tfvars` and `production.tfvars` with:

- **GCP Project IDs**: Your actual project IDs
- **Secrets**: Generate strong secrets (see below)
- **Resource configurations**: Adjust CPU, memory, instances as needed

### 3. Generate Secrets

**For staging:**

```bash
echo "Staging JWT Secret: $(openssl rand -base64 48)"
echo "Staging DB Password: $(openssl rand -base64 24)"
```

**For production (use DIFFERENT secrets):**

```bash
echo "Production JWT Secret: $(openssl rand -base64 48)"
echo "Production DB Password: $(openssl rand -base64 32)"
```

### 4. Apply Configuration

**For staging:**

```bash
cd terraform
terraform plan -var-file="env/staging.tfvars"
terraform apply -var-file="env/staging.tfvars"
```

**For production:**

```bash
cd terraform
terraform plan -var-file="env/production.tfvars"
terraform apply -var-file="env/production.tfvars"
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

## Environment Differences

### Staging

- **Database**: `db-f1-micro` (free tier)
- **Instances**: Can scale to zero
- **Private IP**: Usually disabled
- **Cost**: Lower (~$10-30/month)

### Production

- **Database**: `db-n1-standard-1` (paid tier)
- **Instances**: Always on (min=1)
- **Private IP**: Enabled (recommended)
- **Cost**: Higher (~$80-120/month)
