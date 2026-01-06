output "network_name" {
  description = "VPC network name"
  value       = google_compute_network.vpc.name
}

output "network_id" {
  description = "VPC network ID"
  value       = google_compute_network.vpc.id
}

output "network_self_link" {
  description = "VPC network self link"
  value       = google_compute_network.vpc.self_link
}

output "subnet_name" {
  description = "Subnet name"
  value       = google_compute_subnetwork.subnet.name
}

output "subnet_id" {
  description = "Subnet ID"
  value       = google_compute_subnetwork.subnet.id
}

output "vpc_connector_id" {
  description = "VPC connector ID"
  value       = google_vpc_access_connector.connector.id
}

output "vpc_connector_name" {
  description = "VPC connector name"
  value       = google_vpc_access_connector.connector.name
}

output "private_ip_address" {
  description = "Private IP address for Cloud SQL"
  value       = var.enable_private_ip ? google_compute_global_address.private_ip_address[0].address : null
}

output "private_vpc_connection_id" {
  description = "Private VPC connection ID"
  value       = var.enable_private_ip ? google_service_networking_connection.private_vpc_connection[0].id : null
}
