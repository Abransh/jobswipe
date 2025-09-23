#!/bin/bash

# ==============================================================================
# JobSwipe API - DigitalOcean Deployment Script
# ==============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_NAME="jobswipe-api"
DOMAIN="your-domain.com"  # Replace with your actual domain
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${BLUE}🚀 JobSwipe API Deployment Script${NC}"
echo "=================================="

# Function to print colored messages
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.production .env
    print_error "Please edit .env file with your actual configuration values"
    exit 1
fi

print_status "Starting deployment..."

# Pull latest images
print_status "Pulling latest images..."
docker-compose -f $DOCKER_COMPOSE_FILE pull

# Build the application
print_status "Building JobSwipe API..."
docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f $DOCKER_COMPOSE_FILE down

# Start new containers
print_status "Starting new containers..."
docker-compose -f $DOCKER_COMPOSE_FILE up -d

# Wait for health check
print_status "Waiting for application to be healthy..."
sleep 30

# Check if containers are running
if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "Up"; then
    print_status "Containers are running successfully!"
else
    print_error "Some containers failed to start. Check logs:"
    docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=50
    exit 1
fi

# Test health endpoint
print_status "Testing health endpoint..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_status "Health check passed!"
else
    print_warning "Health check failed. API might still be starting up."
fi

# Show running containers
print_status "Running containers:"
docker-compose -f $DOCKER_COMPOSE_FILE ps

# Show logs
print_status "Recent logs (last 20 lines):"
docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20

echo ""
print_status "🎉 Deployment completed successfully!"
echo "API is available at: http://localhost:3001"
echo "Health check: http://localhost:3001/health"

if [ "$DOMAIN" != "your-domain.com" ]; then
    echo "Public URL: https://$DOMAIN"
fi

echo ""
echo "Useful commands:"
echo "  View logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
echo "  Stop: docker-compose -f $DOCKER_COMPOSE_FILE down"
echo "  Restart: docker-compose -f $DOCKER_COMPOSE_FILE restart"
echo "  Update: ./deploy.sh"