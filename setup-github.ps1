# ============================================
# DEKNA E-Commerce - GitHub Setup Script (PowerShell)
# ============================================
# This script automates the GitHub repository setup for Windows
# Run: .\setup-github.ps1
# ============================================

$ErrorActionPreference = "Stop"

# Colors
function Write-Header {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "========================================`n" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

# ============================================
# Step 1: Pre-flight Checks
# ============================================
Write-Header "Step 1: Pre-flight Checks"

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Success "Git is installed: $gitVersion"
} catch {
    Write-Error "Git is not installed. Please install Git first."
    Write-Info "Download from: https://git-scm.com/download/win"
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Are you in the project root?"
    exit 1
}
Write-Success "Found package.json - in correct directory"

# Check if GitHub CLI is installed
$useGhCli = $false
try {
    $ghVersion = gh --version 2>$null
    Write-Success "GitHub CLI is installed: $($ghVersion[0])"
    $useGhCli = $true
} catch {
    Write-Warning "GitHub CLI not found. Will use manual setup."
    Write-Info "Install with: winget install --id GitHub.cli"
}

# ============================================
# Step 2: Check Git Status
# ============================================
Write-Header "Step 2: Checking Git Status"

try {
    git rev-parse --git-dir 2>$null | Out-Null
    Write-Warning "Git repository already initialized"
    
    # Check if there are uncommitted changes
    $status = git status --porcelain
    if ($status) {
        Write-Warning "You have uncommitted changes"
        $continue = Read-Host "Do you want to continue? (y/n)"
        if ($continue -ne 'y') {
            Write-Info "Setup cancelled"
            exit 0
        }
    }
} catch {
    Write-Info "Initializing Git repository..."
    git init
    Write-Success "Git repository initialized"
    
    # Rename branch to main if needed
    $currentBranch = git branch --show-current
    if ($currentBranch -ne "main") {
        git branch -m main
        Write-Success "Renamed branch to 'main'"
    }
}

# ============================================
# Step 3: Update .gitignore
# ============================================
Write-Header "Step 3: Checking .gitignore"

if (Test-Path ".gitignore") {
    Write-Success ".gitignore exists"
    
    # Check if enhanced version exists
    if (Test-Path ".gitignore.enhanced") {
        Write-Info "Found enhanced .gitignore"
        $replace = Read-Host "Replace current .gitignore with enhanced version? (y/n)"
        if ($replace -eq 'y') {
            Copy-Item .gitignore .gitignore.backup
            Copy-Item .gitignore.enhanced .gitignore
            Write-Success "Updated .gitignore (backup saved as .gitignore.backup)"
        }
    }
} else {
    Write-Error ".gitignore not found"
    if (Test-Path ".gitignore.enhanced") {
        Copy-Item .gitignore.enhanced .gitignore
        Write-Success "Created .gitignore from enhanced template"
    }
}

# ============================================
# Step 4: Create Environment Templates
# ============================================
Write-Header "Step 4: Creating Environment Templates"

# Frontend .env.example
if (-not (Test-Path ".env.example")) {
    @"
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend API URL
VITE_API_URL=http://localhost:8000

# Environment
VITE_ENV=development
"@ | Out-File -FilePath ".env.example" -Encoding UTF8
    Write-Success "Created .env.example"
} else {
    Write-Info ".env.example already exists"
}

# Backend .env.example
if (-not (Test-Path "backend/.env.example")) {
    @"
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
"@ | Out-File -FilePath "backend/.env.example" -Encoding UTF8
    Write-Success "Created backend/.env.example"
} else {
    Write-Info "backend/.env.example already exists"
}

# ============================================
# Step 5: Stage and Commit
# ============================================
Write-Header "Step 5: Staging and Committing Files"

# Check if there are files to commit
$status = git status --porcelain
if (-not $status) {
    Write-Info "No changes to commit"
} else {
    git add .
    
    # Show what will be committed
    Write-Info "Files to be committed:"
    git status --short
    
    $proceed = Read-Host "`nProceed with commit? (y/n)"
    if ($proceed -eq 'y') {
        git commit -m @"
Initial commit: DEKNA e-commerce application

- React 18 + TypeScript + Vite frontend
- Django REST API backend
- PWA with service worker
- Supabase authentication
- Payment integration (Chapa, Telebirr)
- SEO optimized with dynamic titles
- Responsive design (mobile-first)
- Dark mode support
- Playwright E2E tests
"@
        Write-Success "Initial commit created"
    } else {
        Write-Info "Commit skipped"
    }
}

# ============================================
# Step 6: GitHub Repository Setup
# ============================================
Write-Header "Step 6: GitHub Repository Setup"

if ($useGhCli) {
    Write-Info "Using GitHub CLI for repository creation"
    
    # Check if authenticated
    try {
        gh auth status 2>$null | Out-Null
    } catch {
        Write-Warning "Not authenticated with GitHub CLI"
        Write-Info "Running: gh auth login"
        gh auth login
    }
    
    # Get repository name
    $repoName = Read-Host "Enter repository name (default: dekna-ecommerce)"
    if (-not $repoName) { $repoName = "dekna-ecommerce" }
    
    # Get visibility
    $visibility = Read-Host "Make repository public? (y/n, default: y)"
    if ($visibility -eq 'n') {
        $visibilityFlag = "--private"
    } else {
        $visibilityFlag = "--public"
    }
    
    # Create repository
    Write-Info "Creating GitHub repository: $repoName"
    gh repo create $repoName `
        $visibilityFlag `
        --source=. `
        --remote=origin `
        --description="DEKNA Kids Goods E-Commerce - React PWA with Django backend" `
        --push
    
    Write-Success "Repository created and pushed to GitHub"
    
    # Open in browser
    $openBrowser = Read-Host "Open repository in browser? (y/n)"
    if ($openBrowser -eq 'y') {
        gh repo view --web
    }
} else {
    Write-Info "Manual GitHub setup required"
    Write-Host ""
    Write-Host "1. Go to: https://github.com/new"
    Write-Host "2. Repository name: dekna-ecommerce"
    Write-Host "3. Description: DEKNA Kids Goods E-Commerce - React PWA with Django backend"
    Write-Host "4. Choose visibility (Public/Private)"
    Write-Host "5. DO NOT initialize with README, .gitignore, or license"
    Write-Host "6. Click 'Create repository'"
    Write-Host ""
    Read-Host "Press Enter when repository is created..."
    
    # Get GitHub username
    $ghUsername = Read-Host "Enter your GitHub username"
    
    # Add remote
    $repoUrl = "https://github.com/$ghUsername/dekna-ecommerce.git"
    
    try {
        git remote get-url origin 2>$null | Out-Null
        Write-Warning "Remote 'origin' already exists"
        git remote set-url origin $repoUrl
        Write-Success "Updated remote origin URL"
    } catch {
        git remote add origin $repoUrl
        Write-Success "Added remote origin"
    }
    
    # Push to GitHub
    Write-Info "Pushing to GitHub..."
    git push -u origin main
    Write-Success "Pushed to GitHub"
}

# ============================================
# Step 7: Create Initial Tag
# ============================================
Write-Header "Step 7: Creating Initial Release Tag"

$createTag = Read-Host "Create v0.1.0 tag? (y/n)"
if ($createTag -eq 'y') {
    git tag -a v0.1.0 -m "Initial release: DEKNA e-commerce MVP"
    git push origin v0.1.0
    Write-Success "Created and pushed tag v0.1.0"
}

# ============================================
# Final Summary
# ============================================
Write-Header "Setup Complete! 🎉"

Write-Host "Your DEKNA repository is now set up on GitHub!`n" -ForegroundColor Green

Write-Host "Repository Information:"
if ($useGhCli) {
    gh repo view
} else {
    Write-Host "URL: https://github.com/$ghUsername/dekna-ecommerce"
}

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Review the repository on GitHub"
Write-Host "2. Setup branch protection rules (optional)"
Write-Host "3. Configure GitHub Actions for CI/CD (optional)"
Write-Host "4. Invite collaborators"
Write-Host "5. Start developing!"

Write-Host "`nUseful Commands:" -ForegroundColor Cyan
Write-Host "  git status              - Check repository status"
Write-Host "  git pull origin main    - Pull latest changes"
Write-Host "  git push origin main    - Push your changes"
Write-Host "  gh repo view --web      - Open repo in browser"

Write-Success "Setup script completed successfully!"
