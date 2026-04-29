# GitHub Quick Reference - DEKNA E-Commerce

## 🚀 Quick Setup (Choose One Method)

### Method 1: Automated Script (Recommended)

**Windows (PowerShell)**:
```powershell
.\setup-github.ps1
```

**Mac/Linux (Bash)**:
```bash
bash setup-github.sh
```

### Method 2: Manual Setup (5 Minutes)

```bash
# 1. Initialize Git
git init
git branch -m main

# 2. Stage and commit
git add .
git commit -m "Initial commit: DEKNA e-commerce application"

# 3. Create GitHub repo (replace YOUR_USERNAME)
gh repo create dekna-ecommerce --public --source=. --remote=origin --push

# OR manually:
# - Go to https://github.com/new
# - Create repo: dekna-ecommerce
# - Run: git remote add origin https://github.com/YOUR_USERNAME/dekna-ecommerce.git
# - Run: git push -u origin main
```

---

## 📝 Daily Git Commands

```bash
# Check status
git status

# Pull latest changes
git pull origin main

# Stage changes
git add .                    # All files
git add src/                 # Specific directory
git add src/components/*.tsx # Pattern match

# Commit
git commit -m "feat: add new feature"

# Push
git push origin main

# View history
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- filename.tsx
git restore filename.tsx     # Git 2.23+
```

---

## 🌿 Branch Workflow

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main
git switch main              # Git 2.23+

# List branches
git branch -a

# Push branch to GitHub
git push -u origin feature/new-feature

# Delete branch (local)
git branch -d feature/new-feature

# Delete branch (remote)
git push origin --delete feature/new-feature

# Merge branch
git checkout main
git merge feature/new-feature
```

---

## 🔄 Sync and Update

```bash
# Fetch changes without merging
git fetch origin

# Pull and rebase
git pull --rebase origin main

# Stash changes temporarily
git stash
git stash pop

# View stashed changes
git stash list
```

---

## 🏷️ Tags and Releases

```bash
# Create tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag
git push origin v1.0.0

# Push all tags
git push origin --tags

# List tags
git tag -l

# Delete tag (local)
git tag -d v1.0.0

# Delete tag (remote)
git push origin --delete v1.0.0
```

---

## 🔍 Inspection Commands

```bash
# View changes
git diff                     # Unstaged changes
git diff --staged            # Staged changes
git diff main feature/branch # Between branches

# View file history
git log --follow filename.tsx

# View commit details
git show commit-hash

# Search commits
git log --grep="search term"

# Find who changed a line
git blame filename.tsx
```

---

## 🚨 Emergency Commands

```bash
# Undo last commit (destructive)
git reset --hard HEAD~1

# Revert commit (safe)
git revert commit-hash

# Discard all local changes
git reset --hard origin/main

# Remove untracked files
git clean -fd

# Recover deleted branch
git reflog
git checkout -b recovered-branch commit-hash
```

---

## 🔐 Security Checks

```bash
# Check for accidentally committed secrets
git log --all --full-history -- "*.env"

# Remove file from history (DANGEROUS)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Better: Use BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## 🔧 Configuration

```bash
# Set user info
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch name
git config --global init.defaultBranch main

# Set default editor
git config --global core.editor "code --wait"

# View config
git config --list

# Aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm commit
git config --global alias.lg "log --oneline --graph --all"
```

---

## 📊 GitHub CLI Commands

```bash
# Authenticate
gh auth login

# Create repo
gh repo create dekna-ecommerce --public

# View repo
gh repo view
gh repo view --web

# Create PR
gh pr create --title "Add feature" --body "Description"

# List PRs
gh pr list

# View PR
gh pr view 123

# Merge PR
gh pr merge 123

# Create issue
gh issue create --title "Bug report" --body "Description"

# List issues
gh issue list

# Clone repo
gh repo clone username/repo
```

---

## 🎯 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Examples
```bash
git commit -m "feat(cart): add quantity selector"
git commit -m "fix(checkout): resolve payment validation error"
git commit -m "docs(readme): update installation instructions"
git commit -m "style(header): improve mobile navigation"
git commit -m "refactor(api): optimize database queries"
git commit -m "test(auth): add login flow tests"
git commit -m "chore(deps): update dependencies"
```

---

## 🔗 Useful Links

- **GitHub Docs**: https://docs.github.com/
- **Git Docs**: https://git-scm.com/doc
- **GitHub CLI**: https://cli.github.com/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf
- **Conventional Commits**: https://www.conventionalcommits.org/

---

## 💡 Pro Tips

1. **Always pull before push**
   ```bash
   git pull origin main && git push origin main
   ```

2. **Use .gitignore early**
   - Never commit `.env` files
   - Never commit `node_modules`
   - Never commit build artifacts

3. **Commit often, push regularly**
   - Small, focused commits
   - Descriptive commit messages
   - Push at least daily

4. **Use branches for features**
   - Keep `main` stable
   - Create feature branches
   - Use pull requests for review

5. **Review before committing**
   ```bash
   git diff --staged
   git status
   ```

6. **Use GitHub CLI for speed**
   ```bash
   gh pr create
   gh issue create
   gh repo view --web
   ```

---

## 🆘 Getting Help

```bash
# Git help
git help
git help commit
git help branch

# GitHub CLI help
gh help
gh repo help
gh pr help

# Man pages
man git
man git-commit
```

---

## ✅ Pre-Push Checklist

- [ ] Code builds successfully (`npm run build`)
- [ ] Tests pass (`npm run test:e2e`)
- [ ] Linter passes (`npm run lint`)
- [ ] No console errors
- [ ] No `.env` files committed
- [ ] Commit messages are descriptive
- [ ] Branch is up to date with main
- [ ] Changes reviewed locally

---

**Last Updated**: 2026-04-28  
**Version**: 1.0.0
