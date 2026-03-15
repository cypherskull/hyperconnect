# Variables for Terraform configuration

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "hyperconnect"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# RDS Configuration
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro" # Free tier eligible
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20 # Free tier limit
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "hyperconnect"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# App Runner Configuration
variable "app_runner_cpu" {
  description = "App Runner CPU units"
  type        = string
  default     = "0.25 vCPU"
}

variable "app_runner_memory" {
  description = "App Runner memory"
  type        = string
  default     = "0.5 GB"
}

# JWT Secret
variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

# ECR Repository (optional, for custom images)
variable "ecr_repository_url" {
  description = "ECR repository URL for backend image"
  type        = string
  default     = ""
}
