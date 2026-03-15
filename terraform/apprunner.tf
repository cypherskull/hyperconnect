# AWS App Runner Configuration

# IAM Role for App Runner ECR Access
resource "aws_iam_role" "app_runner_ecr" {
  name = "${var.project_name}-apprunner-ecr-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "app_runner_ecr" {
  role       = aws_iam_role.app_runner_ecr.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# IAM Role for App Runner Instance
resource "aws_iam_role" "app_runner_instance" {
  name = "${var.project_name}-apprunner-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

# S3 Access Policy for App Runner
resource "aws_iam_role_policy" "app_runner_s3" {
  name = "${var.project_name}-apprunner-s3-policy"
  role = aws_iam_role.app_runner_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*"
        ]
      }
    ]
  })
}

# VPC Connector for App Runner
resource "aws_apprunner_vpc_connector" "main" {
  vpc_connector_name = "${var.project_name}-vpc-connector"
  subnets            = aws_subnet.private[*].id
  security_groups    = [aws_security_group.app_runner.id]
}

# App Runner Service
resource "aws_apprunner_service" "backend" {
  service_name = "${var.project_name}-backend"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.app_runner_ecr.arn
    }

    image_repository {
      image_configuration {
        port = "3001"
        runtime_environment_variables = {
          NODE_ENV     = var.environment
          DATABASE_URL = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.main.endpoint}/${var.db_name}?schema=public"
          JWT_SECRET   = var.jwt_secret
          JWT_EXPIRES_IN = "7d"
          AWS_REGION   = var.aws_region
          S3_BUCKET_NAME = aws_s3_bucket.uploads.bucket
        }
      }
      image_identifier      = var.ecr_repository_url != "" ? var.ecr_repository_url : "public.ecr.aws/docker/library/node:20-alpine"
      image_repository_type = var.ecr_repository_url != "" ? "ECR" : "ECR_PUBLIC"
    }

    auto_deployments_enabled = true
  }

  instance_configuration {
    cpu               = var.app_runner_cpu
    memory            = var.app_runner_memory
    instance_role_arn = aws_iam_role.app_runner_instance.arn
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.main.arn
    }
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/api/health"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  tags = {
    Name = "${var.project_name}-backend"
  }
}
