# ===================================
# Backend Outputs
# ===================================
output "backend_url" {
  description = "Backend Cloud Run service URL"
  value       = module.cloud_run.service_url
}

output "backend_service_name" {
  description = "Backend Cloud Run service name"
  value       = module.cloud_run.service_name
}

output "backend_service_account" {
  description = "Backend service account email"
  value       = module.cloud_run.service_account_email
}

# ===================================
# Frontend Outputs
# ===================================
output "frontend_url" {
  description = "Frontend App Engine URL"
  value       = module.app_engine.app_url
}

output "frontend_service_account" {
  description = "Frontend service account email"
  value       = module.app_engine.service_account_email
}

# ===================================
# Database Outputs
# ===================================
output "database_instance_name" {
  description = "Cloud SQL instance name"
  value       = module.cloud_sql.instance_name
}

output "database_connection_name" {
  description = "Cloud SQL connection name (for Cloud SQL Proxy)"
  value       = module.cloud_sql.connection_name
}

output "database_public_ip" {
  description = "Database public IP address"
  value       = module.cloud_sql.public_ip
}

output "database_name" {
  description = "Database name"
  value       = var.db_name
}

# ===================================
# Storage Outputs
# ===================================
output "storage_bucket_name" {
  description = "Cloud Storage bucket name"
  value       = module.cloud_storage.bucket_name
}

output "storage_bucket_url" {
  description = "Cloud Storage bucket URL"
  value       = module.cloud_storage.bucket_url
}

# ===================================
# Secrets Outputs
# ===================================
output "jwt_secret_name" {
  description = "JWT secret name in Secret Manager"
  value       = module.secrets.jwt_secret_name
}

output "db_password_secret_name" {
  description = "Database password secret name in Secret Manager"
  value       = module.secrets.db_password_secret_name
}

# ===================================
# Deployment Summary
# ===================================
output "deployment_summary" {
  description = "Complete deployment information"
  value = {
    environment     = var.environment
    frontend_url    = module.app_engine.app_url
    backend_url     = module.cloud_run.service_url
    database_ip     = module.cloud_sql.public_ip
    storage_bucket  = module.cloud_storage.bucket_name
    single_instance = var.backend_max_instances == 1
    redis_enabled   = false
  }
}

# ===================================
# Networking Outputs
# ===================================
output "vpc_network_name" {
  description = "VPC network name"
  value       = module.networking.network_name
}

output "vpc_connector_name" {
  description = "VPC connector name"
  value       = module.networking.vpc_connector_name
}

# ===================================
# Connection Information
# ===================================
output "connection_info" {
  description = "Database connection information"
  value = {
    host       = var.enable_private_ip ? module.cloud_sql.private_ip : module.cloud_sql.public_ip
    port       = 5432
    database   = var.db_name
    user       = var.db_user
    ssl_mode   = "require"
    private_ip = var.enable_private_ip
  }
  sensitive = true
}

# ===================================
# Next Steps
# ===================================
output "next_steps" {
  description = "Next steps after infrastructure deployment"
  value       = <<-EOT

  ✅ Infrastructure deployed successfully!

  📝 Configuration:
     Environment: ${var.environment}
     Project:     ${var.project_id}
     Region:      ${var.region}

  🔗 URLs:
     Frontend:    ${module.app_engine.app_url}
     Backend:     ${module.cloud_run.service_url}

  📊 Database:
     Host:        ${module.cloud_sql.public_ip}
     Database:    ${var.db_name}
     User:        ${var.db_user}
     SSL:         Required

  📦 Storage:
     Bucket:      ${module.cloud_storage.bucket_name}

  🚀 Next steps:

  1. Build and push backend Docker image:
     cd backend
     docker build -t ${var.backend_image} .
     docker push ${var.backend_image}

  2. Update Cloud Run with new image:
     gcloud run services update ${module.cloud_run.service_name} \
       --image ${var.backend_image} \
       --region ${var.region}

  3. Run database migrations:
     cd backend
     DATABASE_URL="postgresql://${var.db_user}:PASSWORD@${module.cloud_sql.public_ip}:5432/${var.db_name}?sslmode=require" \
     npx prisma migrate deploy

  4. Deploy frontend to App Engine:
     cd frontend
     NEXT_PUBLIC_API_URL="${module.cloud_run.service_url}/graphql" npm run build
     gcloud app deploy

  5. Test your application:
     open ${module.app_engine.app_url}

  ⚠️  Notes:
     - Running in SINGLE INSTANCE mode (no Redis)
     - Max ${var.backend_max_instances} backend instance(s)
     - Suitable for MVP and < 50 concurrent users
     - To scale with Redis, update backend_max_instances > 1 and add Redis module

  📚 Documentation:
     - Terraform: terraform.io
     - Cloud Run: cloud.google.com/run
     - App Engine: cloud.google.com/appengine

  EOT
}
