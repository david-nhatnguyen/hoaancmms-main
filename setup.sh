#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 CMMS Project Setup${NC}\n"

# Check if .env exists
if [ ! -f "apps/api/.env" ]; then
  echo -e "${YELLOW}📝 Creating .env file from .env.example...${NC}"
  cp apps/api/.env.example apps/api/.env
  echo -e "${GREEN}✓ Created apps/api/.env${NC}"
else
  echo -e "${GREEN}✓ apps/api/.env already exists${NC}"
fi

# Check if web .env exists
if [ ! -f "apps/web/.env" ]; then
  echo -e "${YELLOW}📝 Creating web .env file...${NC}"
  echo "VITE_API_URL=http://localhost:3000" > apps/web/.env
  echo -e "${GREEN}✓ Created apps/web/.env${NC}"
else
  echo -e "${GREEN}✓ apps/web/.env already exists${NC}"
fi

# Install dependencies
echo -e "\n${BLUE}📦 Installing dependencies...${NC}"
yarn install

# Check if Docker is running
if command -v docker &> /dev/null; then
  if docker info &> /dev/null; then
    echo -e "\n${BLUE}🐳 Starting Docker services (PostgreSQL + Redis)...${NC}"
    docker-compose up -d
    
    # Wait for PostgreSQL to be ready
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    sleep 5
    
    # Run Prisma migrations
    echo -e "\n${BLUE}🗄️  Running database migrations...${NC}"
    cd apps/api
    npx prisma migrate dev --name init
    npx prisma generate
    cd ../..
    
    echo -e "\n${GREEN}✅ Setup complete!${NC}"
    echo -e "\n${BLUE}To start development:${NC}"
    echo -e "  ${GREEN}yarn dev${NC}"
    echo -e "\n${BLUE}Services will be available at:${NC}"
    echo -e "  API:  ${GREEN}http://localhost:3000${NC}"
    echo -e "  Web:  ${GREEN}http://localhost:5173${NC}"
    echo -e "  DB:   ${GREEN}postgresql://admin:password123@localhost:5432/cmms${NC}"
    
  else
    echo -e "\n${YELLOW}⚠️  Docker is installed but not running${NC}"
    echo -e "Please start Docker Desktop and run: ${GREEN}./setup.sh${NC}"
  fi
else
  echo -e "\n${YELLOW}⚠️  Docker not found${NC}"
  echo -e "Please install Docker or setup PostgreSQL manually"
  echo -e "Then run: ${GREEN}cd apps/api && npx prisma migrate dev${NC}"
fi
