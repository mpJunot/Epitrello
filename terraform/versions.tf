terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "~> 0.9"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Store Terraform state in Google Cloud Storage
  # Create bucket first: gsutil mb -l europe-west1 gs://epitrello-terraform-state
  backend "gcs" {
    bucket = "epitrello-terraform-state"
    prefix = "terraform/state"
  }
}
