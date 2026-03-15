# HyperConnect Backend & Infrastructure

Complete backend infrastructure for the HyperConnect platform with AWS deployment automation.

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   App Runner    │────▶│   RDS Postgres  │
│   (Vite/React)  │     │   (Node.js)     │     │   (db.t3.micro) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   S3 + CloudFront│
                        │   (File Storage) │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- AWS CLI (for deployment)
- Terraform (for infrastructure)

### Local Development

1. **Start the full stack with Docker:**
   ```bash
   docker-compose up -d
   ```

2. **Or run manually:**
   ```bash
   # Terminal 1: Start PostgreSQL
   docker run -d --name hyperconnect-db \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=hyperconnect \
     -p 5432:5432 postgres:15

   # Terminal 2: Start backend
   cd backend
   cp .env.example .env
   npm install
   npx prisma migrate dev
   npx prisma db seed
   npm run dev

   # Terminal 3: Start frontend
   npm run dev
   ```

3. **Access the services:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api/health

### Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@hyperconnect.com | password123 | Admin |
| alice@globalretail.com | password123 | Buyer |
| bob@innovate.com | password123 | Seller |

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/verify` | Verify JWT token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update profile |
| GET | `/api/users/:id` | Get user by ID |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List posts (paginated) |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/:id` | Get post details |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/like` | Like/unlike post |
| POST | `/api/posts/:id/bookmark` | Bookmark post |
| POST | `/api/posts/:id/comments` | Add comment |

### Sellers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sellers` | List sellers |
| GET | `/api/sellers/:id` | Get seller profile |
| POST | `/api/sellers/:id/follow` | Follow/unfollow |
| POST | `/api/sellers/:id/like` | Like seller |

### File Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/single` | Upload single file |
| POST | `/api/upload/multiple` | Upload multiple files |

## 🌐 AWS Deployment

### Option 1: Shell Script (Recommended for first-time setup)

```bash
# 1. Configure Terraform variables
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# 2. Run deployment
./deploy.sh all
```

### Option 2: GitHub Actions (CI/CD)

1. Add secrets to your GitHub repository:
   - `AWS_ROLE_ARN` - IAM role for OIDC authentication
   - `APP_RUNNER_SERVICE_ARN` - App Runner service ARN

2. Push to `main` branch to trigger deployment

### AWS Resources Created

| Resource | Spec | Free Tier |
|----------|------|-----------|
| VPC | 2 public + 2 private subnets | ✅ |
| RDS PostgreSQL | db.t3.micro, 20GB | ✅ 12 months |
| S3 | Private bucket + CloudFront | ✅ 5GB |
| App Runner | 0.25 vCPU, 0.5GB | ✅ 3 months |

### Estimated Monthly Cost

| Period | Cost |
|--------|------|
| First 12 months | ~$5-10/month |
| After free tier | ~$15-25/month |

## 📁 Project Structure

```
Hyperconnect-main/
├── backend/
│   ├── src/
│   │   ├── config/        # Database, S3 config
│   │   ├── middleware/    # Auth, error handling
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Data migration
│   ├── Dockerfile
│   └── package.json
├── terraform/
│   ├── main.tf            # Provider config
│   ├── vpc.tf             # Networking
│   ├── rds.tf             # Database
│   ├── s3.tf              # Storage + CDN
│   └── apprunner.tf       # Compute
├── docker-compose.yml     # Local development
├── deploy.sh              # Deployment script
└── .github/workflows/     # CI/CD
```

## 🔐 Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `AWS_REGION` | AWS region for S3 |
| `S3_BUCKET_NAME` | S3 bucket for uploads |

## 📖 License

MIT
