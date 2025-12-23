## 🔧 Troubleshooting Guide

### Common Issues

**Issue**: Strapi won't start

- Solution: Delete `.tmp` folder and restart
- Check Node.js version (needs 18+)

**Issue**: Images not displaying

- Solution: Check CORS settings in Strapi
- Verify image URLs in browser DevTools

**Issue**: Search not working

- Solution: Check API permissions (find, findOne enabled)
- Verify Strapi is running

**Issue**: Build fails

- Solution: Delete `node_modules` and `dist` folders
- Run `npm install` again
- Check for TypeScript errors

**Issue**: Railway deployment fails

- Solution: Check environment variables
- Verify DATABASE_URL is correct
- Check build logs for specific errors

**Issue**: Frontend requests an incorrect backend URL (e.g. requests like `https://retete.martioli.com/retete-martioli-be.up.railway.app/api/categories`)

- Cause: The frontend reads `VITE_STRAPI_URL` at build time. If this environment variable is set incorrectly in your frontend service (missing protocol or containing multiple domains), Vite will embed the wrong URL into the built app.
- Solution:
  - Check the frontend service's environment variables (Railway → Service → Settings → Environment Variables) and ensure `VITE_STRAPI_URL` is a single absolute URL with protocol, for example:
    - `https://retete-martioli-be.up.railway.app`
    - or `https://api.retete.martioli.com` (if you use a custom domain)
  - Do not concatenate domains or omit `https://`.
  - After fixing the variable, rebuild/redeploy the frontend so Vite can inline the updated value.
- Tip: If `VITE_STRAPI_URL` is not set or the backend is unreachable, the frontend falls back to local sample data.
