#!/bin/bash
# HyperConnect AWS Deployment Script
# This script deploys the entire infrastructure to AWS

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 HyperConnect AWS Deployment Script${NC}"
echo "========================================"

# Check prerequisites
check_prerequisites() {
    echo -e "\n${YELLOW}Checking prerequisites...${NC}"
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}Error: Terraform is not installed${NC}"
        echo "Please install Terraform: https://www.terraform.io/downloads"
        exit 1
    fi
    echo "✓ Terraform installed: $(terraform version | head -n 1)"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}Error: AWS CLI is not installed${NC}"
        echo "Please install AWS CLI: https://aws.amazon.com/cli/"
        exit 1
    fi
    echo "✓ AWS CLI installed: $(aws --version)"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed${NC}"
        echo "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    echo "✓ Docker installed: $(docker --version)"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}Error: AWS credentials not configured${NC}"
        echo "Please run 'aws configure' to set up your credentials"
        exit 1
    fi
    echo "✓ AWS credentials configured"
}

# Initialize Terraform
init_terraform() {
    echo -e "\n${YELLOW}Initializing Terraform...${NC}"
    cd terraform
    terraform init
    cd ..
    echo -e "${GREEN}✓ Terraform initialized${NC}"
}

# Plan Terraform changes
plan_terraform() {
    echo -e "\n${YELLOW}Planning Terraform changes...${NC}"
    cd terraform
    terraform plan -out=tfplan
    cd ..
    echo -e "${GREEN}✓ Terraform plan created${NC}"
}

# Apply Terraform changes
apply_terraform() {
    echo -e "\n${YELLOW}Applying Terraform changes...${NC}"
    cd terraform
    
    read -p "Do you want to apply these changes? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    terraform apply tfplan
    
    # Get outputs
    echo -e "\n${GREEN}📋 Deployment Outputs:${NC}"
    terraform output
    
    cd ..
    echo -e "${GREEN}✓ Infrastructure deployed${NC}"
}

# Build and push Docker image
build_and_push_image() {
    echo -e "\n${YELLOW}Building and pushing Docker image...${NC}"
    
    # Get AWS account ID and region
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    AWS_REGION=$(aws configure get region)
    ECR_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/hyperconnect-backend"
    
    # Create ECR repository if it doesn't exist
    aws ecr describe-repositories --repository-names hyperconnect-backend 2>/dev/null || \
        aws ecr create-repository --repository-name hyperconnect-backend
    
    # Login to ECR
    aws ecr get-login-password --region ${AWS_REGION} | \
        docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
    
    # Build image
    cd backend
    docker build -t hyperconnect-backend .
    docker tag hyperconnect-backend:latest ${ECR_REPO}:latest
    
    # Push image
    docker push ${ECR_REPO}:latest
    cd ..
    
    echo -e "${GREEN}✓ Docker image pushed to ECR${NC}"
}

# Run database migrations
run_migrations() {
    echo -e "\n${YELLOW}Running database migrations...${NC}"
    
    # This would typically be done through App Runner environment
    # or by connecting to RDS via bastion host
    echo "Database migrations will run automatically on App Runner startup"
    
    echo -e "${GREEN}✓ Migration setup complete${NC}"
}

# Main deployment flow
main() {
    echo -e "\n${YELLOW}Starting deployment...${NC}"
    
    check_prerequisites
    
    # Parse arguments
    case "${1:-all}" in
        init)
            init_terraform
            ;;
        plan)
            plan_terraform
            ;;
        apply)
            apply_terraform
            ;;
        build)
            build_and_push_image
            ;;
        all)
            init_terraform
            plan_terraform
            apply_terraform
            build_and_push_image
            run_migrations
            ;;
        *)
            echo "Usage: $0 {init|plan|apply|build|all}"
            exit 1
            ;;
    esac
    
    echo -e "\n${GREEN}🎉 Deployment complete!${NC}"
    echo -e "\nNext steps:"
    echo "1. Update your frontend to use the App Runner URL"
    echo "2. Configure your domain in Route 53 (optional)"
    echo "3. Monitor your application in AWS Console"
}

main "$@"
