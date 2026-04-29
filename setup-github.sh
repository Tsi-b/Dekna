#!/bin/bash

# ============================================
# DEKNA E-Commerce - GitHub Setup Script
# ============================================
# This script automates the GitHub repository setup
# Run: bash setup-github.sh
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================
# Step 1: Pre-flight Checks
# ============================================
print_header "Step 1: Pre-flight Checks"

# Check if Git is installed
if ! command_exists git; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi
print_success "Git is installed: $(git --version)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project root?"
    exit 1
fi
print_success "Found package.json - in correct directory"

# Check if GitHub CLI is installed
if command_exists gh; then
    print_success "GitHub CLI is installed: $(gh --version | head -n 1)"
    USE_GH_CLI=true
else
    print_warning "GitHub CLI not found. Will use manual setup."
    USE_GH_CLI=false
fi

# ============================================
# Step 2: Check Git Status
# ============================================
print_header "Step 2: Checking Git Status"

if git rev-parse --git-dir > /dev/null 2>&1; then
    print_warning "Git repository already initialized"
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes"
        read -p "Do you want to continue? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Setup cancelled"
            exit 0
        fi
    fi
else
    print_info "Initializing Git repository..."
    git init
    print_success "Git repository initialized"
    
    # Rename branch to main if needed
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        git branch -m main
        print_success "Renamed branch to 'main'"
    fi
fi

# ============================================
# Step 3: Update .gitignore
# ============================================
print_header "Step 3: Checking .gitignore"

if [ -f ".gitignore" ]; then
    print_success ".gitignore exists"
    
    # Check if enhanced version exists
    if [ -f ".gitignore.enhanced" ]; then
        print_info "Found enhanced .gitignore"
        read -p "Replace current .gitignore with enhanced version? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp .gitignore .gitignore.backup
            cp .gitignore.enhanced .gitignore
            print_success "Updated .gitignore (backup saved as .gitignore.backup)"
        fi
    fi
else
    print_error ".gitignore not found"
    if [ -f ".gitignore.enhanced" ]; then
        cp .gitignore.enhanced .gitignore
        print_success "Created .gitignore from enhanced template"
    fi
fi

# ============================================
# Step 4: Create Environment Templates
# ============================================
print_header "Step 4: Creating Environment Templates"

# Frontend .env.example
if [ ! -f ".env.example" ]; then
    cat > .env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend API URL
VITE_API_URL=http://localhost:8000

# Environment
VITE_ENV=development
EOF
    print_success "Created .env.example"
else
    print_info ".env.example already exists"
fi

# Backend .env.example
if [ ! -f "backend/.env.example" ]; then
    cat > backend/.env.example << 'EOF'
# Django Settings
SECRET_KEY=your_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dekna

# Supabase
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_service_key_here

# Payment Gateways
CHAPA_SECRET_KEY=your_chapa_secret_key_here
TELEBIRR_APP_ID=your_telebirr_app_id_here
TELEBIRR_APP_KEY=your_telebirr_app_key_here
EOF
    print_success "Created backend/.env.example"
else
    print_info "backend/.env.example already exists"
fi

# ============================================
# Step 5: Stage and Commit
# ============================================
print_header "Step 5: Staging and Committing Files"

# Check if there are files to commit
if [ -z "$(git status --porcelain)" ]; then
    print_info "No changes to commit"
else
    git add .
    
    # Show what will be committed
    print_info "Files to be committed:"
    git status --short
    
    echo
    read -p "Proceed with commit? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git commit -m "Initial commit: DEKNA e-commerce application

- React 18 + TypeScript + Vite frontend
- Django REST API backend
- PWA with service worker
- Supabase authentication
- Payment integration (Chapa, Telebirr)
- SEO optimized with dynamic titles
- Responsive design (mobile-first)
- Dark mode support
- Playwright E2E tests"
        print_success "Initial commit created"
    else
        print_info "Commit skipped"
    fi
fi

# ============================================
# Step 6: GitHub Repository Setup
# ============================================
print_header "Step 6: GitHub Repository Setup"

if [ "$USE_GH_CLI" = true ]; then
    print_info "Using GitHub CLI for repository creation"
    
    # Check if authenticated
    if ! gh auth status > /dev/null 2>&1; then
        print_warning "Not authenticated with GitHub CLI"
        print_info "Running: gh auth login"
        gh auth login
    fi
    
    # Get repository name
    read -p "Enter repository name (default: dekna-ecommerce): " REPO_NAME
    REPO_NAME=${REPO_NAME:-dekna-ecommerce}
    
    # Get visibility
    read -p "Make repository public? (y/n, default: y): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        VISIBILITY="--private"
    else
        VISIBILITY="--public"
    fi
    
    # Create repository
    print_info "Creating GitHub repository: $REPO_NAME"
    gh repo create "$REPO_NAME" \
        $VISIBILITY \
        --source=. \
        --remote=origin \
        --description="DEKNA Kids Goods E-Commerce - React PWA with Django backend" \
        --push
    
    print_success "Repository created and pushed to GitHub"
    
    # Open in browser
    read -p "Open repository in browser? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gh repo view --web
    fi
else
    print_info "Manual GitHub setup required"
    echo
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: dekna-ecommerce"
    echo "3. Description: DEKNA Kids Goods E-Commerce - React PWA with Django backend"
    echo "4. Choose visibility (Public/Private)"
    echo "5. DO NOT initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo
    read -p "Press Enter when repository is created..."
    
    # Get GitHub username
    read -p "Enter your GitHub username: " GH_USERNAME
    
    # Add remote
    REPO_URL="https://github.com/$GH_USERNAME/dekna-ecommerce.git"
    
    if git remote | grep -q "^origin$"; then
        print_warning "Remote 'origin' already exists"
        git remote set-url origin "$REPO_URL"
        print_success "Updated remote origin URL"
    else
        git remote add origin "$REPO_URL"
        print_success "Added remote origin"
    fi
    
    # Push to GitHub
    print_info "Pushing to GitHub..."
    git push -u origin main
    print_success "Pushed to GitHub"
fi

# ============================================
# Step 7: Create Initial Tag
# ============================================
print_header "Step 7: Creating Initial Release Tag"

read -p "Create v0.1.0 tag? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git tag -a v0.1.0 -m "Initial release: DEKNA e-commerce MVP"
    git push origin v0.1.0
    print_success "Created and pushed tag v0.1.0"
fi

# ============================================
# Final Summary
# ============================================
print_header "Setup Complete! 🎉"

echo -e "${GREEN}Your DEKNA repository is now set up on GitHub!${NC}\n"

echo "Repository Information:"
if [ "$USE_GH_CLI" = true ]; then
    gh repo view
else
    echo "URL: https://github.com/$GH_USERNAME/dekna-ecommerce"
fi

echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Review the repository on GitHub"
echo "2. Setup branch protection rules (optional)"
echo "3. Configure GitHub Actions for CI/CD (optional)"
echo "4. Invite collaborators"
echo "5. Start developing!"

echo -e "\n${BLUE}Useful Commands:${NC}"
echo "  git status              - Check repository status"
echo "  git pull origin main    - Pull latest changes"
echo "  git push origin main    - Push your changes"
echo "  gh repo view --web      - Open repo in browser"

print_success "Setup script completed successfully!"
