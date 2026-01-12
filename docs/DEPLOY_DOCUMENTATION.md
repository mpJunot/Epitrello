# Deploying GraphQL Documentation

This guide explains how to deploy the GraphQL documentation to Google Cloud Storage.

## Overview

The GraphQL documentation is automatically generated using SpectaQL and deployed to a GCS bucket that is publicly accessible. The documentation is generated from the GraphQL schema file (`backend/src/graphql/schema.gql`).

## Infrastructure Setup

### Terraform Module

The documentation bucket is managed by the `docs-bucket` Terraform module located in `terraform/modules/docs-bucket/`.

**Features:**

- Public read access for documentation
- Service account permissions for CI/CD deployment
- CORS configuration for web access
- Versioning enabled
- Lifecycle rules for old versions

### Bucket Configuration

The bucket is created with:

- **Name**: `{project_id}-{environment}-epitrello-docs`
- **Location**: EU (configurable)
- **Storage Class**: STANDARD
- **Public Access**: Enabled for reading documentation

### Terraform Outputs

After applying Terraform, you can get the documentation URL:

```bash
cd terraform
terraform output docs_bucket_public_url
```

The output will be:

```
https://storage.googleapis.com/{project_id}-{environment}-epitrello-docs/index.html
```

## Automatic Deployment

### CI/CD Pipeline

The documentation is automatically generated and deployed in the `deploy-docs` job of the `deploy.yml` workflow.

**Workflow Steps:**

1. Build the backend application
2. Generate GraphQL schema (if needed)
3. Generate documentation with SpectaQL
4. Upload documentation to GCS bucket

**Trigger Conditions:**

- Runs on push to `master` or `dev` branches
- Requires successful Terraform apply
- Requires successful backend build

### Manual Deployment

To manually deploy the documentation:

```bash
cd backend

# 1. Ensure schema exists
pnpm build

# 2. Generate documentation
pnpm docs:generate

# 3. Upload to GCS
BUCKET_NAME="your-project-id-staging-epitrello-docs"
gsutil -m rsync -r -d docs/graphql/ gs://${BUCKET_NAME}/
```

## Accessing the Documentation

Once deployed, the documentation is accessible at:

```
https://storage.googleapis.com/{project_id}-{environment}-epitrello-docs/index.html
```

### Finding the URL

**From Terraform:**

```bash
cd terraform
terraform output docs_bucket_public_url
```

**From GCP Console:**

1. Go to Cloud Storage
2. Find the bucket: `{project_id}-{environment}-epitrello-docs`
3. Click on `index.html`
4. Copy the public URL

**From gcloud CLI:**

```bash
gcloud storage buckets list --filter="name~docs"
```

## Local Development

To generate and view documentation locally:

```bash
cd backend

# Generate documentation
pnpm docs:generate

# Serve locally
cd docs/graphql
python3 -m http.server 8000

# Or with Node.js
npx http-server docs/graphql -p 8000
```

Then open `http://localhost:8000` in your browser.

## Troubleshooting

### Documentation Not Generated

**Issue**: `pnpm docs:generate` fails

**Solutions:**

1. Ensure the schema file exists: `backend/src/graphql/schema.gql`
2. If missing, build the application: `pnpm build`
3. Check SpectaQL configuration: `backend/spectaql.config.yml`

### Upload Fails in CI/CD

**Issue**: `gsutil rsync` fails with permission error

**Solutions:**

1. Verify service account has `roles/storage.objectAdmin` on the bucket
2. Check Workload Identity Federation is configured correctly
3. Ensure the bucket exists (run Terraform apply)

### Documentation Not Accessible

**Issue**: 403 Forbidden when accessing the public URL

**Solutions:**

1. Verify public read access is enabled:
   ```bash
   gsutil iam get gs://{bucket-name}
   ```
2. Check bucket IAM policy includes `allUsers` with `roles/storage.objectViewer`
3. Ensure `uniform_bucket_level_access = true` in Terraform

### Bucket Not Found

**Issue**: Bucket doesn't exist

**Solutions:**

1. Run Terraform apply to create the bucket:
   ```bash
   cd terraform
   terraform apply
   ```
2. Verify the module is included in `terraform/main.tf`
3. Check Terraform outputs for bucket name

## Updating Documentation

The documentation is automatically updated when:

- Code is pushed to `master` or `dev` branches
- Backend code changes (schema updates)
- `spectaql.config.yml` is modified

To force a regeneration:

1. Make a commit to trigger the workflow
2. Or manually run the deployment steps locally

## Customization

### Modify Documentation Style

Edit `backend/spectaql.config.yml` to customize:

- Title and description
- Introduction text
- Server URLs
- Display options

### Change Bucket Configuration

Edit `terraform/modules/docs-bucket/main.tf` to modify:

- Bucket location
- Storage class
- Lifecycle rules
- CORS configuration

## Security Considerations

- **Public Access**: The documentation bucket has public read access. This is intentional for API documentation.
- **Write Access**: Only the service account used by CI/CD has write permissions.
- **Content**: The documentation contains only schema information, no sensitive data.

## Resources

- [SpectaQL Documentation](https://github.com/anvilco/spectaql)
- [GCS Static Website Hosting](https://cloud.google.com/storage/docs/hosting-static-website)
- [Terraform GCS Module](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/storage_bucket)
