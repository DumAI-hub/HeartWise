#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🫀 Cardiovascular Health App - Development Setup${NC}"
echo "=================================================="
echo ""

# Check if all directories exist
if [ ! -d "frontend" ] || [ ! -d "backend" ] || [ ! -d "ml_service" ]; then
    echo -e "${RED}❌ Error: Project directories not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
fi

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Python: $(python3 --version)${NC}"
fi

if ! command_exists mysql; then
    echo -e "${YELLOW}⚠️  MySQL client not found (optional)${NC}"
else
    echo -e "${GREEN}✅ MySQL client installed${NC}"
fi

echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend && npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi
cd ..

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend && npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
cd ..

# Install ML service dependencies
echo -e "${BLUE}📦 Installing ML service dependencies...${NC}"
cd ml_service
if [ ! -d "../.venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv ../.venv
fi
source ../.venv/bin/activate
pip install -r requirements.txt
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ML service dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install ML service dependencies${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${GREEN}✅ All dependencies installed successfully!${NC}"
echo ""
echo -e "${YELLOW}================================================${NC}"
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. Configure environment variables:"
echo "   - frontend/.env  (copy from .env.example)"
echo "   - backend/.env   (copy from .env.example)"
echo "   - ml_service/.env (copy from .env.example)"
echo ""
echo "2. Setup database:"
echo "   - Create MySQL database"
echo "   - Import schema and data"
echo ""
echo "3. Start development servers in separate terminals:"
echo ""
echo -e "   ${GREEN}Terminal 1 - Backend:${NC}"
echo "   cd backend && node server.js"
echo ""
echo -e "   ${GREEN}Terminal 2 - ML Service:${NC}"
echo "   source .venv/bin/activate"
echo "   cd ml_service && python app.py"
echo ""
echo -e "   ${GREEN}Terminal 3 - Frontend:${NC}"
echo "   cd frontend && npm run dev"
echo ""
echo -e "${YELLOW}================================================${NC}"
echo -e "${BLUE}🚀 Access your app at: http://localhost:5173${NC}"
echo ""
