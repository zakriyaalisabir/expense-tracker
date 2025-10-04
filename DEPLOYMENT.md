# Deployment Guide

## Deploy to Vercel

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - First deployment creates a preview
   - Use `vercel --prod` for production deployment

### Option 2: Using Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js settings

3. **Add Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Automatic deployments on every git push

## Build Commands

- **Development**: `npm run dev`
- **Production Build**: `npm run build`
- **Start Production**: `npm start`
- **Lint**: `npm run lint`

## Environment Variables

Create `.env.local` for local development:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Post-Deployment

1. **Test your deployment**
   - Visit your Vercel URL
   - Test authentication
   - Verify data persistence

2. **Custom Domain** (Optional)
   - Vercel Dashboard → Settings → Domains
   - Add your custom domain
   - Update DNS records

3. **Monitor**
   - Check Vercel Analytics
   - Review build logs
   - Monitor performance

## Troubleshooting

- **Build fails**: Check build logs in Vercel dashboard
- **Environment variables**: Ensure they're set in Vercel settings
- **404 errors**: Verify routing in `next.config.js`
- **Supabase connection**: Check URL and API keys

## Production Checklist

- [ ] Environment variables configured
- [ ] Supabase project set up
- [ ] Build successful locally (`npm run build`)
- [ ] Git repository created
- [ ] Vercel project connected
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
