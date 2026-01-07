#!/bin/bash

# Script to automatically retrieve the service account key created by Terraform
# Usage: ./scripts/get-service-account-key.sh [environment]
# Example: ./scripts/get-service-account-key.sh staging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get environment from argument or default to staging
ENVIRONMENT=${1:-staging}

echo -e "${GREEN}=== Service Account Key Retrieval ===${NC}"
echo "Environment: $ENVIRONMENT"
echo ""

# Check if terraform directory exists
if [ ! -d "terraform" ]; then
    echo -e "${RED}ERROR: terraform directory not found${NC}"
    exit 1
fi

cd terraform

# Check if terraform is initialized
if [ ! -d ".terraform" ]; then
    echo -e "${YELLOW}Initializing Terraform...${NC}"
    terraform init
fi

# Check if service account key already exists in state
echo -e "${YELLOW}Checking if service account key exists in Terraform state...${NC}"
KEY_EXISTS=$(terraform output -raw service_account_key_decoded 2>/dev/null || echo "")

if [ -n "$KEY_EXISTS" ] && [ "$KEY_EXISTS" != "null" ]; then
    echo -e "${GREEN}✓ Service account key found in Terraform state${NC}"
    OUTPUT_FILE="../service-account-key-${ENVIRONMENT}.json"
    terraform output -raw service_account_key_decoded > "$OUTPUT_FILE"
    echo -e "${GREEN}✓ Key saved to: $OUTPUT_FILE${NC}"

    # Verify the key is valid JSON
    if jq empty "$OUTPUT_FILE" 2>/dev/null; then
        echo -e "${GREEN}✓ Key is valid JSON${NC}"

        # Extract service account email
        SA_EMAIL=$(jq -r '.client_email' "$OUTPUT_FILE")
        echo -e "${GREEN}Service Account: $SA_EMAIL${NC}"

        echo ""
        echo -e "${GREEN}=== Next Steps ===${NC}"
        echo "1. Copy the key content:"
        echo "   cat $OUTPUT_FILE"
        echo ""
        echo "2. Add to GitHub Secrets:"
        echo "   - Go to: Settings → Secrets and variables → Actions"
        echo "   - Create secret: GCP_SA_KEY"
        echo "   - Paste the entire JSON content"
        echo ""
        echo "3. Remove the local key file for security:"
        echo "   rm $OUTPUT_FILE"

        exit 0
else
    echo -e "${YELLOW}Service account key not found in Terraform state${NC}"
    echo -e "${YELLOW}Checking if service account exists...${NC}"

    # Check if service account exists
    SA_EMAIL=$(terraform output -raw deployer_service_account_email 2>/dev/null || terraform output -raw service_account_email 2>/dev/null || echo "")

    if [ -z "$SA_EMAIL" ] || [ "$SA_EMAIL" = "null" ]; then
        echo -e "${RED}ERROR: Service account does not exist in Terraform state${NC}"
        echo "Please run 'terraform apply' first to create the service account"
        exit 1
    fi

    echo -e "${GREEN}✓ Service account exists: $SA_EMAIL${NC}"
    echo ""
    echo -e "${YELLOW}Service account key not found in Terraform state${NC}"
    echo ""
    echo -e "${GREEN}Creating key automatically via Terraform...${NC}"

    # Try to create the key via Terraform
    echo "Running: terraform apply -var='create_service_account_key=true' -auto-approve"
    if terraform apply -var="create_service_account_key=true" -auto-approve -target=google_service_account_key.epitrello_deployer_key 2>&1 | tee /tmp/terraform-apply.log; then
        echo -e "${GREEN}✓ Key created successfully!${NC}"
        echo ""
        echo -e "${YELLOW}Retrieving the key...${NC}"

        # Now retrieve the key
        OUTPUT_FILE="../service-account-key-${ENVIRONMENT}.json"
        terraform output -raw service_account_key_decoded > "$OUTPUT_FILE"

        if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
            echo -e "${GREEN}✓ Key saved to: $OUTPUT_FILE${NC}"

            # Verify the key is valid JSON
            if command -v jq > /dev/null 2>&1; then
                if jq empty "$OUTPUT_FILE" 2>/dev/null; then
                    echo -e "${GREEN}✓ Key is valid JSON${NC}"

                    # Extract service account email
                    SA_EMAIL_FROM_KEY=$(jq -r '.client_email' "$OUTPUT_FILE")
                    echo -e "${GREEN}Service Account: $SA_EMAIL_FROM_KEY${NC}"
                fi
            fi

            echo ""
            echo -e "${GREEN}=== Next Steps ===${NC}"
            echo "1. Copy the key content:"
            echo "   cat $OUTPUT_FILE"
            echo ""
            echo "2. Add to GitHub Secrets:"
            echo "   - Go to: Settings → Secrets and variables → Actions"
            echo "   - Create/Update secret: GCP_SA_KEY"
            echo "   - Paste the entire JSON content"
            echo ""
            echo "3. Set create_service_account_key = false in your Terraform config"
            echo "   to prevent recreating the key on future applies"
            echo ""
            echo "4. Remove the local key file for security:"
            echo "   rm $OUTPUT_FILE"

            exit 0
        else
            echo -e "${RED}ERROR: Failed to retrieve key after creation${NC}"
            exit 1
        fi
    else
        echo -e "${RED}ERROR: Failed to create key via Terraform${NC}"
        echo ""
        echo -e "${YELLOW}Alternative: Create key manually with gcloud${NC}"
        PROJECT_ID=$(echo "$SA_EMAIL" | cut -d'@' -f2 | cut -d'.' -f1)
        echo "Run:"
        echo "  gcloud iam service-accounts keys create service-account-key.json \\"
        echo "    --iam-account=$SA_EMAIL \\"
        echo "    --project=$PROJECT_ID"
        exit 1
    fi
fi
