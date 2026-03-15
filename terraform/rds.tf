# RDS PostgreSQL Configuration (Free Tier Optimized)

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db"

  # Engine
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = var.db_instance_class
  allocated_storage    = var.db_allocated_storage
  max_allocated_storage = 30 # Allow autoscaling up to 30GB

  # Database
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  multi_az               = false # Single AZ for cost optimization

  # Storage
  storage_type          = "gp2"
  storage_encrypted     = true

  # Backup
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  # Performance Insights (free for db.t3.micro)
  performance_insights_enabled = true
  performance_insights_retention_period = 7

  # Other settings
  skip_final_snapshot = true
  deletion_protection = false # Set to true in production

  tags = {
    Name = "${var.project_name}-db"
  }
}
