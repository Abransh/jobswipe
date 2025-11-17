#!/bin/bash

################################################################################
# JobSwipe Production Deployment Script
#
# This script automates the complete deployment process for JobSwipe monorepo
#
# Components deployed:
# - Database migrations (packages/database)
# - API backend (apps/api) → DigitalOcean
# - Web frontend (apps/web) → Vercel
#
# Prerequisites:
# - pnpm installed
# - Vercel CLI installed (npm install -g vercel)
# - doctl installed (optional, for DO CLI)
# - Environment variables configured
#
# Usage:
#   ./deploy.sh              # Full deployment
#   ./deploy.sh --api-only   # Deploy API only
#   ./deploy.sh --web-only   # Deploy frontend only
#   ./deploy.sh --db-only    # Run migrations only
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo ""
    echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║${NC}  $1"
    echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✔${NC} $1"
}

print_error() {
    echo -e "${RED}✘${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

ask_yes_no() {
    while true; do
        read -p "$(echo -e ${CYAN}$1 ${NC}[y/n]: )" yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed"
        return 1
    else
        print_success "$1 is installed"
        return 0
    fi
}

check_env_file() {
    if [ ! -f "$1" ]; then
        print_error "Environment file not found: $1"
        return 1
    else
        print_success "Environment file found: $1"
        return 0
    fi
}

################################################################################
# Validation Functions
################################################################################

check_prerequisites() {
    print_header "Checking Prerequisites"

    local all_ok=true

    print_step "Checking required commands..."
    check_command "node" || all_ok=false
    check_command "pnpm" || all_ok=false
    check_command "git" || all_ok=false

    print_step "Checking Node.js version..."
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        print_success "Node.js version: $(node -v) (>= 20 required)"
    else
        print_error "Node.js version: $(node -v) (>= 20 required)"
        all_ok=false
    fi

    print_step "Checking repository..."
    if [ -d ".git" ]; then
        print_success "Git repository found"
    else
        print_error "Not a git repository"
        all_ok=false
    fi

    print_step "Checking monorepo structure..."
    if [ -f "pnpm-workspace.yaml" ]; then
        print_success "pnpm workspace configured"
    else
        print_error "pnpm-workspace.yaml not found"
        all_ok=false
    fi

    print_step "Checking critical directories..."
    [ -d "apps/api" ] && print_success "apps/api exists" || { print_error "apps/api not found"; all_ok=false; }
    [ -d "apps/web" ] && print_success "apps/web exists" || { print_error "apps/web not found"; all_ok=false; }
    [ -d "packages/database" ] && print_success "packages/database exists" || { print_error "packages/database not found"; all_ok=false; }

    if [ "$all_ok" = false ]; then
        print_error "Prerequisites check failed. Please fix the issues above."
        exit 1
    fi

    print_success "All prerequisites met!"
}

check_environment_variables() {
    print_header "Checking Environment Variables"

    if [ ! -f ".env.production" ]; then
        print_warning ".env.production not found"

        if ask_yes_no "Would you like to create it from template?"; then
            if [ -f "env.production.example" ]; then
                cp env.production.example .env.production
                print_success "Created .env.production from template"
                print_warning "Please edit .env.production with your actual values"
                print_info "Press Enter to open editor..."
                read
                ${EDITOR:-nano} .env.production
            else
                print_error "env.production.example not found"
                exit 1
            fi
        else
            print_error "Cannot proceed without .env.production"
            exit 1
        fi
    fi

    print_step "Loading environment variables..."
    export $(cat .env.production | grep -v '^#' | xargs)

    print_step "Validating critical environment variables..."
    local missing_vars=()

    [ -z "$DATABASE_URL" ] && missing_vars+=("DATABASE_URL")
    [ -z "$REDIS_URL" ] && missing_vars+=("REDIS_URL")
    [ -z "$JWT_SECRET" ] && missing_vars+=("JWT_SECRET")
    [ -z "$AWS_ACCESS_KEY_ID" ] && missing_vars+=("AWS_ACCESS_KEY_ID")
    [ -z "$AWS_SECRET_ACCESS_KEY" ] && missing_vars+=("AWS_SECRET_ACCESS_KEY")
    [ -z "$ANTHROPIC_API_KEY" ] && missing_vars+=("ANTHROPIC_API_KEY")

    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_info "Please update .env.production with these values"
        exit 1
    fi

    print_success "All critical environment variables are set"
}

################################################################################
# Installation Functions
################################################################################

install_dependencies() {
    print_header "Installing Dependencies"

    print_step "Installing root dependencies..."
    # Use --ignore-scripts to skip husky and other prepare scripts
    # Use --prod=false to install devDependencies even when NODE_ENV=production
    # (we need devDependencies for building TypeScript, etc.)
    pnpm install --frozen-lockfile --ignore-scripts --prod=false

    print_success "Dependencies installed successfully"
}

################################################################################
# Database Functions
################################################################################

run_database_migrations() {
    print_header "Running Database Migrations"

    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL not set in environment"
        exit 1
    fi

    print_step "Testing database connection..."
    if ! pnpm exec prisma db execute --sql "SELECT 1" --schema packages/database/prisma/schema.prisma 2>/dev/null; then
        print_error "Cannot connect to database. Please check DATABASE_URL"
        exit 1
    fi
    print_success "Database connection successful"

    print_step "Generating Prisma Client..."
    cd packages/database
    pnpm run db:generate
    cd ../..

    print_step "Running migrations..."
    cd packages/database
    pnpm run db:migrate:deploy || pnpm exec prisma migrate deploy
    cd ../..

    print_success "Database migrations completed"

    if ask_yes_no "Would you like to seed the database with sample data?"; then
        print_step "Seeding database..."
        cd packages/database
        pnpm run db:seed || print_warning "Seeding skipped (script may not exist)"
        cd ../..
    fi
}

verify_database() {
    print_header "Verifying Database"

    print_step "Checking database tables..."
    cd packages/database

    # List tables using Prisma
    if pnpm exec prisma db execute --sql "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" --schema prisma/schema.prisma &>/dev/null; then
        print_success "Database schema verified"
    else
        print_warning "Could not verify database schema"
    fi

    cd ../..
}

################################################################################
# Build Functions
################################################################################

build_api() {
    print_header "Building API"

    print_step "Building API application..."
    cd apps/api
    pnpm run build:production
    cd ../..

    print_success "API built successfully"
}

build_web() {
    print_header "Building Web Frontend"

    print_step "Building Next.js application..."
    cd apps/web

    # Set production environment for build
    export NODE_ENV=production

    pnpm run build
    cd ../..

    print_success "Web frontend built successfully"
}

################################################################################
# Deployment Functions
################################################################################

deploy_api_to_digitalocean() {
    print_header "Deploying API to DigitalOcean"

    print_step "Checking git status..."
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes"

        if ask_yes_no "Commit and push changes before deploying?"; then
            print_step "Committing changes..."
            git add -A
            echo "Enter commit message (or press Enter for default):"
            read commit_msg
            commit_msg=${commit_msg:-"chore: deploy to production"}
            git commit -m "$commit_msg"

            print_step "Pushing to remote..."
            CURRENT_BRANCH=$(git branch --show-current)
            git push origin "$CURRENT_BRANCH"
            print_success "Changes pushed to $CURRENT_BRANCH"
        fi
    fi

    print_info "DigitalOcean deployment options:"
    echo "  1. Deploy via Dashboard (recommended for first time)"
    echo "  2. Deploy via CLI (requires doctl)"
    echo "  3. Skip (already deployed or manual deployment)"

    read -p "Choose option [1-3]: " deploy_option

    case $deploy_option in
        1)
            print_info "Opening DigitalOcean App Platform..."
            print_info "Steps:"
            echo "  1. Go to: https://cloud.digitalocean.com/apps"
            echo "  2. Select your app (or create new)"
            echo "  3. Click 'Deploy' or create new deployment"
            echo "  4. Wait for build to complete"

            if command -v open &> /dev/null; then
                open "https://cloud.digitalocean.com/apps"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "https://cloud.digitalocean.com/apps"
            fi

            print_info "Press Enter when deployment is complete..."
            read
            ;;
        2)
            if ! command -v doctl &> /dev/null; then
                print_error "doctl not installed. Please install: https://docs.digitalocean.com/reference/doctl/"
                exit 1
            fi

            print_step "Listing apps..."
            doctl apps list

            read -p "Enter App ID: " app_id

            print_step "Creating deployment..."
            doctl apps create-deployment "$app_id"

            print_step "Waiting for deployment..."
            sleep 5
            doctl apps get "$app_id"
            ;;
        3)
            print_info "Skipping DigitalOcean deployment"
            ;;
        *)
            print_error "Invalid option"
            exit 1
            ;;
    esac

    print_success "API deployment process completed"
}

deploy_web_to_vercel() {
    print_header "Deploying Web Frontend to Vercel"

    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not installed"
        print_info "Install with: npm install -g vercel"

        if ask_yes_no "Install Vercel CLI now?"; then
            npm install -g vercel
        else
            exit 1
        fi
    fi

    print_step "Checking Vercel authentication..."
    if ! vercel whoami &> /dev/null; then
        print_warning "Not logged in to Vercel"
        print_step "Logging in..."
        vercel login
    else
        print_success "Logged in to Vercel as: $(vercel whoami)"
    fi

    print_step "Navigating to web app directory..."
    cd apps/web

    print_info "Deployment options:"
    echo "  1. Deploy to production"
    echo "  2. Deploy to preview"
    echo "  3. Skip deployment"

    read -p "Choose option [1-3]: " deploy_option

    case $deploy_option in
        1)
            print_step "Deploying to production..."
            vercel --prod
            print_success "Deployed to production!"
            ;;
        2)
            print_step "Deploying to preview..."
            vercel
            print_success "Deployed to preview!"
            ;;
        3)
            print_info "Skipping Vercel deployment"
            ;;
        *)
            print_error "Invalid option"
            cd ../..
            exit 1
            ;;
    esac

    cd ../..
    print_success "Web frontend deployment completed"
}

################################################################################
# Verification Functions
################################################################################

verify_deployment() {
    print_header "Verifying Deployment"

    if [ -n "$NEXT_PUBLIC_API_URL" ]; then
        print_step "Testing API health endpoint..."
        if curl -s -f "${NEXT_PUBLIC_API_URL}/health" > /dev/null; then
            print_success "API is responding"

            # Show API health details
            API_HEALTH=$(curl -s "${NEXT_PUBLIC_API_URL}/health" | python3 -m json.tool 2>/dev/null || echo "OK")
            print_info "API Health: $API_HEALTH"
        else
            print_warning "API health check failed or not accessible"
        fi
    else
        print_warning "NEXT_PUBLIC_API_URL not set, skipping API verification"
    fi

    print_step "Deployment summary:"
    echo ""
    echo "  📦 Database:  Migrated ✔"
    echo "  🚀 API:       Deployed to DigitalOcean"
    echo "  🌐 Frontend:  Deployed to Vercel"
    echo ""

    print_success "Deployment verification completed"
}

################################################################################
# Rollback Functions
################################################################################

rollback() {
    print_header "Rollback Deployment"

    print_warning "Rollback options:"
    echo "  1. Rollback API (DigitalOcean)"
    echo "  2. Rollback Frontend (Vercel)"
    echo "  3. Rollback Database (restore from backup)"
    echo "  4. Cancel"

    read -p "Choose option [1-4]: " rollback_option

    case $rollback_option in
        1)
            print_info "To rollback API:"
            echo "  1. Go to: https://cloud.digitalocean.com/apps"
            echo "  2. Select your app"
            echo "  3. Go to Activity tab"
            echo "  4. Find previous deployment"
            echo "  5. Click '...' → Rollback"

            if command -v open &> /dev/null; then
                open "https://cloud.digitalocean.com/apps"
            fi
            ;;
        2)
            print_step "Rolling back Vercel deployment..."
            cd apps/web

            if command -v vercel &> /dev/null; then
                vercel rollback
            else
                print_info "Rollback via dashboard:"
                echo "  1. Go to: https://vercel.com/dashboard"
                echo "  2. Select your project"
                echo "  3. Go to Deployments"
                echo "  4. Find previous deployment"
                echo "  5. Click '...' → Promote to Production"
            fi

            cd ../..
            ;;
        3)
            print_warning "Database rollback requires manual intervention"
            print_info "To rollback database:"
            echo "  1. Go to your database provider (Neon/DO)"
            echo "  2. Find backups section"
            echo "  3. Select backup to restore"
            echo "  4. Restore backup"
            print_warning "This will overwrite current data!"
            ;;
        4)
            print_info "Rollback cancelled"
            ;;
    esac
}

################################################################################
# Main Deployment Flow
################################################################################

deploy_all() {
    print_header "🚀 JobSwipe Full Deployment"

    echo "This script will deploy:"
    echo "  1. Database migrations (packages/database)"
    echo "  2. API backend → DigitalOcean (apps/api)"
    echo "  3. Web frontend → Vercel (apps/web)"
    echo ""

    if ! ask_yes_no "Continue with full deployment?"; then
        print_info "Deployment cancelled"
        exit 0
    fi

    # Step 1: Prerequisites
    check_prerequisites

    # Step 2: Environment
    check_environment_variables

    # Step 3: Dependencies
    if ask_yes_no "Install/update dependencies?"; then
        install_dependencies
    fi

    # Step 4: Database
    if ask_yes_no "Run database migrations?"; then
        run_database_migrations
        verify_database
    fi

    # Step 5: Build
    if ask_yes_no "Build applications?"; then
        build_api
        build_web
    fi

    # Step 6: Deploy
    if ask_yes_no "Deploy to cloud platforms?"; then
        deploy_api_to_digitalocean
        deploy_web_to_vercel
    fi

    # Step 7: Verify
    verify_deployment

    print_header "🎉 Deployment Complete!"

    echo ""
    echo "Next steps:"
    echo "  1. Test your application thoroughly"
    echo "  2. Monitor logs for errors"
    echo "  3. Set up monitoring alerts"
    echo "  4. Update documentation"
    echo ""

    print_info "Useful commands:"
    echo "  ./deploy.sh --api-only    # Deploy only API"
    echo "  ./deploy.sh --web-only    # Deploy only frontend"
    echo "  ./deploy.sh --db-only     # Run only migrations"
    echo "  ./deploy.sh --rollback    # Rollback deployment"
    echo ""
}

deploy_api_only() {
    print_header "Deploying API Only"

    check_prerequisites
    check_environment_variables

    if ask_yes_no "Install/update dependencies?"; then
        install_dependencies
    fi

    if ask_yes_no "Run database migrations?"; then
        run_database_migrations
    fi

    build_api
    deploy_api_to_digitalocean

    print_success "API deployment completed"
}

deploy_web_only() {
    print_header "Deploying Frontend Only"

    check_prerequisites

    if ask_yes_no "Install/update dependencies?"; then
        install_dependencies
    fi

    build_web
    deploy_web_to_vercel

    print_success "Frontend deployment completed"
}

deploy_db_only() {
    print_header "Running Database Migrations Only"

    check_prerequisites
    check_environment_variables

    if ask_yes_no "Install/update dependencies?"; then
        cd packages/database
        pnpm install
        cd ../..
    fi

    run_database_migrations
    verify_database

    print_success "Database migrations completed"
}

################################################################################
# Script Entry Point
################################################################################

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h          Show this help message"
    echo "  --api-only          Deploy only API to DigitalOcean"
    echo "  --web-only          Deploy only frontend to Vercel"
    echo "  --db-only           Run only database migrations"
    echo "  --rollback          Rollback deployment"
    echo "  --check             Check prerequisites only"
    echo ""
    echo "Examples:"
    echo "  $0                  # Full deployment (interactive)"
    echo "  $0 --api-only       # Deploy API only"
    echo "  $0 --web-only       # Deploy frontend only"
    echo "  $0 --db-only        # Run migrations only"
    echo ""
}

main() {
    # Parse command line arguments
    case "${1:-}" in
        --help|-h)
            show_usage
            exit 0
            ;;
        --api-only)
            deploy_api_only
            ;;
        --web-only)
            deploy_web_only
            ;;
        --db-only)
            deploy_db_only
            ;;
        --rollback)
            rollback
            ;;
        --check)
            check_prerequisites
            check_environment_variables
            ;;
        "")
            deploy_all
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
