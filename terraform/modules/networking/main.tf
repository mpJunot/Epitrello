# Networking Module
# Creates VPC network and Serverless VPC Connector for secure communication

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "${var.app_name}-vpc"
  auto_create_subnetworks = false
  project                 = var.project_id
}

# Subnet for the VPC
resource "google_compute_subnetwork" "subnet" {
  name          = "${var.app_name}-subnet"
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = google_compute_network.vpc.id
  project       = var.project_id

  private_ip_google_access = true
}

# Serverless VPC Connector for App Engine and Cloud Run
resource "google_vpc_access_connector" "connector" {
  name          = "${var.app_name}-vpc-connector"
  region        = var.region
  project       = var.project_id
  network       = google_compute_network.vpc.name
  ip_cidr_range = var.connector_cidr

  min_instances = var.connector_min_instances
  max_instances = var.connector_max_instances

  machine_type = var.connector_machine_type

  depends_on = [google_compute_network.vpc]
}

# Private Service Connection for Cloud SQL
resource "google_compute_global_address" "private_ip_address" {
  count = var.enable_private_ip ? 1 : 0

  name          = "${var.app_name}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
  project       = var.project_id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  count = var.enable_private_ip ? 1 : 0

  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address[0].name]

  depends_on = [google_compute_global_address.private_ip_address]
}

# Firewall rule to allow internal traffic
resource "google_compute_firewall" "allow_internal" {
  name    = "${var.app_name}-allow-internal"
  network = google_compute_network.vpc.name
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = [var.subnet_cidr]
  direction     = "INGRESS"
}

# Firewall rule to allow health checks
resource "google_compute_firewall" "allow_health_checks" {
  name    = "${var.app_name}-allow-health-checks"
  network = google_compute_network.vpc.name
  project = var.project_id

  allow {
    protocol = "tcp"
  }

  source_ranges = [
    "35.191.0.0/16",
    "130.211.0.0/22"
  ]

  direction = "INGRESS"
}
