# Push to GitHub (reallyshadydev/wojakwallet-android)

This project is ready to push. Create the GitHub repo first, then push using your configured credentials.

## 1. Create the repository on GitHub

1. Go to **https://github.com/new**
2. **Repository name:** `wojakwallet-android`
3. **Owner:** `reallyshadydev`
4. Leave it **empty** (no README, .gitignore, or license—we already have them).
5. Click **Create repository**.

## 2. Use your config for credentials

Use your existing Git config so pushes use your credentials (HTTPS token or SSH key):

- **HTTPS:** If you use a credential helper or token, ensure `git config --global credential.helper` is set (e.g. `store` or `cache`). Push will prompt once, then reuse.
- **SSH:** Set the remote to SSH and use your SSH key:
  ```bash
  git remote set-url origin git@github.com:reallyshadydev/wojakwallet-android.git
  ```

## 3. Push from this folder

```bash
cd /root/wojakwallet-android
git push -u origin main
```

If you use SSH instead of HTTPS:

```bash
git remote set-url origin git@github.com:reallyshadydev/wojakwallet-android.git
git push -u origin main
```

Repo URL after creation: **https://github.com/reallyshadydev/wojakwallet-android**
