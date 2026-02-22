# Tina Crazy 8s - Deployment Guide

This project is a React + Vite application. Follow these steps to sync to GitHub and deploy to Vercel.

## 1. Sync to GitHub

1. **Create a new repository** on GitHub (e.g., `tina-crazy-8s`).
2. **Initialize git** in your local project folder (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. **Link to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/tina-crazy-8s.git
   git branch -M main
   git push -u origin main
   ```

## 2. Deploy to Vercel

1. **Log in to Vercel** (vercel.com).
2. **Import Project**: Click "Add New" -> "Project".
3. **Connect GitHub**: Select your `tina-crazy-8s` repository.
4. **Configure Project**:
   - **Framework Preset**: Vite (should be auto-detected).
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist`.
5. **Environment Variables**:
   - Add `GEMINI_API_KEY` and paste your Google AI API Key.
6. **Deploy**: Click "Deploy".

## 3. Local Development

```bash
npm install
npm run dev
```
