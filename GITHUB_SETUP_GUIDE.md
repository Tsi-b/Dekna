# GitHub Repository Setup Guide - DEKNA E-Commerce

## 📋 Project Detection

**Project Type**: React + TypeScript + Vite PWA E-Commerce Application  
**Stack**: React 18, Vite 5, TypeScript, TailwindCSS, Supabase, Django Backend  
**Git Status**: ❌ Not initialized  
**Existing .gitignore**: ✅ Present (needs enhancement)

---

## 🔍 Pre-Setup Verification

```bash
# Check current directory
pwd

# Verify you're in the project root (should see package.json)
ls package.json

# Check Git status
git status
# Expected: "fatal: not a git repository" (confirmed)
```

---

## 📝 Step 1: Enhance .gitignore

The existing `.gitignore` is good but needs additions for:
- Python/Django backend
- Playwright test results
- PWA build artifacts
- IDE-specific files

**Action**: Update `.gitignore` with the enhanced version below.

---

## 🚀 Step 2: Initialize Git Repository

```bash
# Initialize Git repository
git init

# Verify initialization
git status
# Expected: "On branch master" or "On branch main"

# Check current branch name
git branch --show-current

# If branch is "master", rename to "main" (modern standard)
git branch -m master main

# Verify branch name
git branch --show-current
# Expected: "main"
```

---

## 📦 Step 3: Stage and Commit Files

```bash
# Stage all files (respects .gitignore)
git add .

# Verify what will be committed
git status

# Check for accidentally staged files
git status | grep -E "(node_modules|dist|\.env|\.vite|__pycache__|\.pyc)"
# Expected: No output (these should be ignored)

# Create initial commit
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

# Verify commit
git log --oneline
# Expected: Shows your initial commit
```

---

## 🌐 Step 4: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

```bash
# Install GitHub CLI if not already installed
# Windows: winget install --id GitHub.cli
# Mac: brew install gh
# Linux: See https://github.com/cli/cli#installation

# Authenticate with GitHub
gh auth login
# Follow prompts: GitHub.com → HTTPS → Login with browser

# Create repository
gh repo create dekna-ecommerce \
  --public \
  --source=. \
  --remote=origin \
  --description="DEKNA Kids Goods E-Commerce - React PWA with Django backend" \
  --push

# Verify remote
git remote -v
# Expected: Shows origin pointing to your GitHub repo
```

### Option B: Manual GitHub Setup

```bash
# 1. Go to https://github.com/new
# 2. Repository name: dekna-ecommerce
# 3. Description: DEKNA Kids Goods E-Commerce - React PWA with Django backend
# 4. Visibility: Public (or Private)
# 5. DO NOT initialize with README, .gitignore, or license
# 6. Click "Create repository"

# 7. Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/dekna-ecommerce.git

# 8. Verify remote
git remote -v
# Expected: Shows origin URL

# 9. Push to GitHub
git push -u origin main

# 10. Verify on GitHub
# Visit: https://github.com/YOUR_USERNAME/dekna-ecommerce
```

---

## 🔐 Step 5: Protect Sensitive Files

```bash
# Verify .env files are NOT tracked
git ls-files | grep "\.env"
# Expected: No output

# If .env files are tracked (CRITICAL FIX):
git rm --cached .env
git rm --cached backend/.env
git commit -m "Remove sensitive environment files from tracking"
git push

# Add .env.example templates (safe to commit)
# See Step 7 for template creation
```

---

## ✅ Step 6: Verification Checklist

```bash
# 1. Verify Git is initialized
git status
# Expected: "On branch main" with clean working tree

# 2. Verify remote is configured
git remote -v
# Expected: Shows origin with fetch and push URLs

# 3. Verify branch is "main"
git branch --show-current
# Expected: main

# 4. Verify commit history
git log --oneline
# Expected: Shows initial commit

# 5. Verify files are tracked correctly
git ls-files | wc -l
# Expected: ~100-200 files (no node_modules, dist, etc.)

# 6. Verify ignored files
git status --ignored
# Expected: Shows node_modules, dist, .env, etc. as ignored

# 7. Verify GitHub sync
git fetch origin
git status
# Expected: "Your branch is up to date with 'origin/main'"
```

---

## 📄 Step 7: Create Environment Templates

Create `.env.example` files for documentation:

```bash
# Frontend .env.example
cat > .env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend API URL
VITE_API_URL=http://localhost:8000

# Environment
VITE_ENV=development
EOF

# Backend .env.example
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

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password_here
EOF

# Stage and commit templates
git add .env.example backend/.env.example
git commit -m "Add environment variable templates"
git push
```

---

## 🏷️ Step 8: Create Initial Release Tag

```bash
# Create annotated tag for initial release
git tag -a v0.1.0 -m "Initial release: DEKNA e-commerce MVP

Features:
- Product browsing and search
- Shopping cart and checkout
- Payment integration (Chapa, Telebirr)
- User authentication (Supabase)
- Wishlist and order management
- PWA with offline support
- SEO optimized
- Responsive design
- Dark mode"

# Push tag to GitHub
git push origin v0.1.0

# Verify tag
git tag -l
# Expected: Shows v0.1.0
```

---

## 📚 Step 9: Add Repository Documentation

```bash
# Stage documentation files
git add README.md
git add CROSS_BROWSER_TESTING_GUIDE.md
git add SEO_PWA_IMPLEMENTATION_GUIDE.md
git add DYNAMIC_TITLE_IMPLEMENTATION.md
git add NEWSLETTER_IMPLEMENTATION.md

# Commit documentation
git commit -m "Add comprehensive project documentation

- Cross-browser testing guide
- SEO and PWA implementation guide
- Dynamic title implementation details
- Newsletter subscription setup
- Testing strategies and checklists"

# Push to GitHub
git push
```

---

## 🔄 Step 10: Setup Branch Protection (Optional)

Via GitHub Web Interface:
1. Go to: `https://github.com/YOUR_USERNAME/dekna-ecommerce/settings/branches`
2. Click "Add rule"
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators
5. Click "Create"

---

## 🚨 Common Issues & Solutions

### Issue 1: "fatal: not a git repository"
```bash
# Solution: Initialize Git
git init
git branch -m main
```

### Issue 2: "remote origin already exists"
```bash
# Solution: Update remote URL
git remote set-url origin https://github.com/YOUR_USERNAME/dekna-ecommerce.git

# Or remove and re-add
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/dekna-ecommerce.git
```

### Issue 3: ".env file is tracked"
```bash
# Solution: Remove from tracking
git rm --cached .env
git rm --cached backend/.env
git commit -m "Remove sensitive files from tracking"

# Verify .gitignore includes .env
grep "\.env" .gitignore
```

### Issue 4: "node_modules is being tracked"
```bash
# Solution: Remove from tracking
git rm -r --cached node_modules
git commit -m "Remove node_modules from tracking"

# Verify .gitignore includes node_modules
grep "node_modules" .gitignore
```

### Issue 5: "Permission denied (publickey)"
```bash
# Solution: Setup SSH key or use HTTPS
# For HTTPS (easier):
git remote set-url origin https://github.com/YOUR_USERNAME/dekna-ecommerce.git

# For SSH (more secure):
# 1. Generate SSH key: ssh-keygen -t ed25519 -C "your_email@example.com"
# 2. Add to GitHub: https://github.com/settings/keys
# 3. Use SSH URL: git@github.com:YOUR_USERNAME/dekna-ecommerce.git
```

### Issue 6: "Large files detected"
```bash
# Solution: Use Git LFS for large files
git lfs install
git lfs track "*.psd"
git lfs track "*.mp4"
git add .gitattributes
git commit -m "Add Git LFS tracking"
```

---

## 📋 Daily Git Workflow

```bash
# 1. Check status before starting work
git status

# 2. Pull latest changes
git pull origin main

# 3. Create feature branch (optional)
git checkout -b feature/new-feature

# 4. Make changes and stage
git add .

# 5. Commit with descriptive message
git commit -m "Add new feature: description"

# 6. Push to GitHub
git push origin feature/new-feature
# Or for main branch: git push origin main

# 7. Create Pull Request on GitHub (if using branches)
# Visit: https://github.com/YOUR_USERNAME/dekna-ecommerce/pulls
```

---

## 🎯 Git Best Practices

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:
```bash
git commit -m "feat(cart): add quantity selector to cart items"
git commit -m "fix(checkout): resolve payment validation error"
git commit -m "docs(readme): update installation instructions"
git commit -m "style(header): improve mobile navigation layout"
```

### Branch Naming
```
feature/feature-name
bugfix/bug-description
hotfix/critical-fix
release/v1.0.0
```

---

## ✅ Final Verification

```bash
# Run all verification commands
echo "=== Git Status ==="
git status

echo -e "\n=== Remote Configuration ==="
git remote -v

echo -e "\n=== Branch Information ==="
git branch -a

echo -e "\n=== Recent Commits ==="
git log --oneline -5

echo -e "\n=== Tracked Files Count ==="
git ls-files | wc -l

echo -e "\n=== Ignored Files ==="
git status --ignored | head -20

echo -e "\n=== GitHub Repository ==="
gh repo view --web
# Or manually visit: https://github.com/YOUR_USERNAME/dekna-ecommerce
```

---

## 🎉 Setup Complete!

Your DEKNA e-commerce repository is now:
- ✅ Initialized with Git
- ✅ Connected to GitHub
- ✅ Properly ignoring sensitive files
- ✅ Tagged with initial release
- ✅ Documented with comprehensive guides
- ✅ Ready for collaborative development

**Next Steps**:
1. Setup GitHub Actions for CI/CD (optional)
2. Configure Dependabot for dependency updates
3. Add issue templates and PR templates
4. Setup GitHub Projects for task management
5. Invite collaborators

**Repository URL**: `https://github.com/YOUR_USERNAME/dekna-ecommerce`
