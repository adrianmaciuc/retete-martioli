# Recipe App - Complete Implementation Plan

**Free & Open Source Stack | Step-by-Step Guide**

---

## 📋 Project Overview

**Goal**: Build a personal recipe management system with beautiful turquoise/green design

**Stack**:

- Backend: Strapi 4.x + SQLite (local) → PostgreSQL (production)
- Frontend: Vite + React + TypeScript + Tailwind CSS (current repo uses Vite + React components)
- Media: Local files → Cloudinary
- Deployment: Railway (free tier)
- Search: Strapi built-in search

**Timeline**: 4 weeks

---

## 🎯 Phase 1: Initial Setup (Week 1)

### Step 1.1: Environment Setup

**Time: 15 minutes**

Prerequisites check:

- [ ] Node.js 18.x or higher installed (`node --version`)
- [ ] npm or yarn installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Code editor ready (VS Code recommended)

**Actions**:

1. Create project directory: `mkdir recipe-app && cd recipe-app`
2. Initialize git: `git init`
3. Create GitHub repository (optional but recommended)

---

### Step 1.2: Backend Setup (Strapi)

**Time: 30 minutes**

**Actions**:

1. Run setup script (will be provided as artifact)
2. Navigate to backend: `cd backend`
3. Install dependencies: `npm install`
4. Install Cloudinary provider: `npm install @strapi/provider-upload-cloudinary`
5. Start Strapi: `npm run develop`
6. Create admin user at `http://localhost:1337/admin`
   - Email: your-email@example.com
   - Password: strong-password (save this!)
7. Keep Strapi running in this terminal

**Expected Result**:

- ✅ Strapi admin panel accessible
- ✅ SQLite database created at `backend/.tmp/data.db`
- ✅ Admin user created

**Troubleshooting**:

- If port 1337 is busy: Check `.env.local` and change PORT
- If build fails: Delete `node_modules` and run `npm install` again

---

### Step 1.3: Configure Strapi Content Types

**Time: 45 minutes**

#### Create Category Collection Type (Optional but recommended)

1. In Strapi admin → Content-Type Builder
2. Click "Create new collection type"
3. Display name: `Category`
4. Add fields:
   - `name` (Text, Short text, Required)
   - `slug` (UID, Attached to "name", Required)
5. Click "Finish" then "Save"

#### Create Ingredient Component

1. Content-Type Builder → Components → "Create new component"
2. Category: `recipe` (create new)
3. Name: `ingredient`
4. Add fields:
   - `item` (Text, Short text, Required)
   - `quantity` (Text, Short text, Required)
   - `unit` (Text, Short text)
   - `notes` (Text, Short text)
5. Click "Finish" then "Save"

#### Create Instruction Component

1. Content-Type Builder → Components → Use category `recipe`
2. Name: `instruction`
3. Add fields:
   - `stepNumber` (Number, Integer, Required)
   - `description` (Text, Long text, Required)
   - `image` (Media, Single media, Type: Images)
   - `tips` (Text, Short text)
4. Click "Finish" then "Save"

#### Create Recipe Collection Type

1. Content-Type Builder → "Create new collection type"
2. Display name: `Recipe`
3. Click "Continue"
4. Add fields in this order:

**Text Fields**:

- `title` (Text, Short text, Required, Max length: 200)
- `slug` (UID, Attached to "title", Required)
- `description` (Text, Long text, Required, Max length: 500)

**Media Fields**:

- `coverImage` (Media, Single media, Required, Type: Images only)
- `galleryImages` (Media, Multiple media, Type: Images only)

**Component Fields**:

- `ingredients` (Component, Repeatable, Select: recipe.ingredient, Required)
- `instructions` (Component, Repeatable, Select: recipe.instruction, Required)

**Number Fields**:

- `prepTime` (Number, Integer, Required, Min: 0)
- `cookTime` (Number, Integer, Required, Min: 0)
- `servings` (Number, Integer, Required, Default: 4, Min: 1)

**Enumeration Field**:

- `difficulty` (Enumeration, Values: Easy, Medium, Hard, Default: Medium, Required)

**Relation Field**:

- `categories` (Relation, Recipe has and belongs to many Categories)

**JSON Field**:

- `tags` (JSON, Default value: `[]`)

5. Click "Finish" then "Save"
6. Wait for server to restart

**Expected Result**:

- ✅ Category, Recipe collection types created
- ✅ Ingredient, Instruction components created
- ✅ Server restarted successfully

---

### Step 1.4: Configure API Permissions

**Time: 10 minutes**

1. Settings → Users & Permissions Plugin → Roles → Public
2. Permissions → Recipe:
   - ✅ Check `find`
   - ✅ Check `findOne`
3. Permissions → Category (if created):
   - ✅ Check `find`
   - ✅ Check `findOne`
4. Click "Save"

**Expected Result**:

- ✅ Public can read recipes
- ✅ Public can read categories

---

### Step 1.5: Add Sample Recipes

**Time: 20 minutes**

1. Content Manager → Recipe → "Create new entry"
2. Add 2-3 sample recipes with:
   - Title
   - Description
   - Cover image (upload any food image)
   - At least 3 ingredients
   - At least 3 instruction steps
   - Prep/cook time, servings
   - Difficulty level
3. Click "Save" then "Publish" for each

**Sample Recipe Structure**:

```
Title: Classic Margherita Pizza
Description: A traditional Italian pizza with fresh ingredients
Prep Time: 30 minutes
Cook Time: 15 minutes
Servings: 4
Difficulty: Medium

Ingredients:
- Pizza dough, 500g, grams
- Tomato sauce, 200ml, ml
- Fresh mozzarella, 250g, grams
- Fresh basil leaves, 10, leaves

Instructions:
Step 1: Preheat oven to 250°C (480°F)
Step 2: Roll out the dough into a circle
Step 3: Spread tomato sauce evenly
Step 4: Add torn mozzarella pieces
Step 5: Bake for 12-15 minutes until crust is golden
```

**Expected Result**:

- ✅ At least 2 published recipes
- ✅ Each recipe has cover image
- ✅ All required fields filled

---

### Step 1.6: Frontend Setup (Vite + React)

**Time: 30 minutes**

**Actions**:

1. Open new terminal (keep Strapi running in first terminal)
2. Navigate to project root
3. Install dependencies: `npm install` (already set up in this repo)
4. Create environment file from `.env.example` and set `VITE_STRAPI_URL` if you have a backend
5. Start dev server: `npm run dev` (Vite default)
6. Visit `http://localhost:5173` (or the port Vite shows)

**Expected Result**:

- ✅ Vite dev server running
- ✅ App loads at Vite dev URL
- ✅ No console errors

**Notes**:

- This repository uses a client-side fetch model to get recipes; if `VITE_STRAPI_URL` is not set we fall back to the sample data in `src/lib/sample-recipes.ts`. Later we can add SSR or static export strategies if needed.

---

## 🎨 Phase 2: Frontend Development (Week 2)

### Step 2.1: Configure Tailwind with Theme

**Time: 20 minutes**

**Actions**:

1. Update `tailwind.config.ts` (artifact will be provided)
2. Update `src/index.css` (artifact will be provided)
3. Import Google Fonts
4. Restart Vite dev server

**Expected Result**:

- ✅ Turquoise and green colors available
- ✅ Custom fonts loaded
- ✅ Base styles applied

---

### Step 2.2: Create TypeScript Types

**Time: 15 minutes**

**Actions**:

1. Create `src/lib/types.ts` (artifact will be provided)
2. Review type definitions
3. Ensure all Recipe fields are typed

**Expected Result**:

- ✅ Full TypeScript support for Strapi data
- ✅ No type errors

---

### Step 2.3: Create Strapi API Client

**Time: 20 minutes**

**Actions**:

1. Create `src/lib/strapi.ts` (artifact will be provided)
2. Test API connection:
   ```typescript
   // Test in src/pages/Index.tsx temporarily
   import { getRecipes } from "@/lib/strapi";
   const recipes = await getRecipes();
   console.log(recipes);
   ```

**Expected Result**:

- ✅ API client connects to Strapi
- ✅ Sample recipes returned
- ✅ Images URLs are correct

---

### Step 2.4: Build Core Components

**Time: 2-3 hours**

#### Component 1: RecipeCard

**Time: 45 minutes**

**Actions**:

1. Create `src/components/RecipeCard.tsx` (artifact will be provided)
2. Features:
   - Cover image with standard img tag
   - Title, description (truncated)
   - Prep/cook time badges
   - Difficulty badge
   - Hover effect (lift + shadow)
   - Click → navigate to recipe page

**Test**:

- Import in Index.tsx
- Display with sample data
- Check responsive behavior
- Test hover effects

#### Component 2: RecipeGrid

**Time: 30 minutes**

**Actions**:

1. Create `src/components/RecipeGrid.tsx` (artifact will be provided)
2. Features:
   - Responsive grid: 4-3-2-1 cards
   - Proper gap spacing
   - Loading state
   - Empty state

**Test**:

- Display with multiple RecipeCards
- Resize browser window
- Verify breakpoints work

#### Component 3: IngredientList

**Time: 30 minutes**

**Actions**:

1. Create `src/components/IngredientList.tsx` (artifact will be provided)
2. Features:
   - Poetic font (Crimson Text)
   - Clean, readable layout
   - Quantity + unit + item format
   - Optional notes display

**Test**:

- Display with sample ingredients
- Check font rendering
- Verify readability

#### Component 4: InstructionSteps

**Time: 45 minutes**

**Actions**:

1. Create `src/components/InstructionSteps.tsx` (artifact will be provided)
2. Features:
   - Large, bold step numbers
   - Clear description text
   - Optional step images
   - Optional tips display
   - Print-friendly styling

**Test**:

- Display with sample instructions
- Check number styling
- Test with/without images

#### Component 5: SearchBar

**Time: 30 minutes**

**Actions**:

1. Create `src/components/SearchBar.tsx` (artifact will be provided)
2. Features:
   - Input with search icon
   - Clear button
   - Debounced search (500ms)
   - Loading indicator

**Test**:

- Type in search box
- Verify debounce works
- Check clear functionality

---

### Step 2.5: Build Homepage

**Time: 1 hour**

**Actions**:

1. Update `src/pages/Index.tsx` (artifact will be provided)
2. Features:
   - Hero section with title
   - Search bar
   - Recipe grid with all published recipes
   - Loading state
   - Error handling

**Test**:

- Visit `http://localhost:8080`
- See all published recipes
- Test search functionality
- Resize window to check responsive grid

**Expected Result**:

- ✅ Beautiful homepage with cards
- ✅ Recipes load from Strapi
- ✅ Grid responsive (4-3-2-1)
- ✅ Images display correctly

---

### Step 2.6: Build Recipe Detail Page

**Time: 1.5 hours**

**Actions**:

1. Create `src/pages/RecipePage.tsx` (artifact will be provided)
2. Features:
   - Hero image (full width)
   - Title and description
   - Time and servings info
   - Two-column layout (desktop):
     - Left: Ingredients
     - Right: Instructions
   - Single column (mobile)
   - Back button
   - Print button

**Test**:

- Click on recipe card from homepage
- Verify recipe loads
- Check layout on desktop
- Check layout on mobile
- Test print view

**Expected Result**:

- ✅ Recipe displays beautifully
- ✅ Ingredients clearly readable
- ✅ Instructions easy to follow
- ✅ Responsive layout works

---

### Step 2.7: Build Search Page

**Time: 45 minutes**

**Actions**:

1. Create `src/pages/Search.tsx` (artifact will be provided)
2. Features:
   - Search bar (auto-focus)
   - Search results as grid
   - "No results" message
   - Search within: title, description, ingredients, instructions

**Test**:

- Search from homepage
- Search for ingredient name
- Search for cooking term
- Test with no results

**Expected Result**:

- ✅ Search works across all fields
- ✅ Results display as cards
- ✅ Proper handling of no results

---

## 🧪 Phase 3: Testing & Polish (Week 3)

### Step 3.1: Cross-Browser Testing

**Time: 1 hour**

**Test Checklist**:

- [ ] Chrome/Edge (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop, if on Mac)
- [ ] Chrome (mobile - use DevTools)
- [ ] Safari (mobile - use DevTools or real device)

**Test Points**:

- Homepage loads correctly
- Recipe cards display properly
- Recipe detail page layouts correctly
- Search functionality works
- Images load and optimize
- Fonts render correctly
- Colors match design
- Hover effects work (desktop)
- Touch interactions work (mobile)

---

### Step 3.2: Responsive Design Testing

**Time: 1 hour**

**Breakpoints to Test**:

- [ ] Mobile S (320px) - 1 card
- [ ] Mobile M (375px) - 1 card
- [ ] Mobile L (425px) - 2 cards
- [ ] Tablet (768px) - 3 cards
- [ ] Laptop (1024px) - 4 cards
- [ ] Desktop (1440px) - 4 cards

**Actions**:

- Use browser DevTools responsive mode
- Test all breakpoints
- Fix any layout issues
- Ensure text remains readable
- Check image sizes

---

### Step 3.3: Performance Optimization

**Time: 1 hour**

**Actions**:

1. Run Lighthouse audit in Chrome DevTools
2. Check metrics:
   - Performance score > 90
   - Accessibility score > 90
   - Best Practices score > 90
   - SEO score > 90

**Optimization Tasks**:

- [ ] Images optimized (lazy loading, proper sizes)
- [ ] Fonts preloaded
- [ ] Unused CSS removed
- [ ] JavaScript minified
- [ ] Lazy loading implemented

---

### Step 3.4: Add Loading & Error States

**Time: 1 hour**

**Actions**:

1. Add loading skeletons for:
   - Recipe cards
   - Recipe detail page
   - Search results
2. Add error boundaries
3. Add 404 page for missing recipes
4. Test error scenarios:
   - Network offline
   - API returns error
   - Recipe not found

**Expected Result**:

- ✅ Smooth loading experience
- ✅ Graceful error handling
- ✅ User-friendly error messages

---

### Step 3.5: Accessibility Improvements

**Time: 1 hour**

**Actions**:

- [ ] Add alt text to all images
- [ ] Ensure proper heading hierarchy (h1, h2, h3)
- [ ] Add ARIA labels to interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader (optional)
- [ ] Verify color contrast ratios (4.5:1 minimum)

**Tools**:

- Chrome Lighthouse
- axe DevTools extension
- Keyboard navigation (Tab, Enter, Space, Arrow keys)

---

## 🚀 Phase 4: Deployment (Week 4)

### Step 4.1: Prepare for Production

**Time: 1 hour**

**Actions**:

1. Generate new security keys for production
2. Review all environment variables
3. Test local build:
   ```bash
   npm run build
   npm run preview
   ```
4. Ensure build succeeds
5. Test production build locally

**Expected Result**:

- ✅ Production build successful
- ✅ No build errors
- ✅ App works in production mode

---

### Step 4.2: Setup Railway Account

**Time: 15 minutes**

**Actions**:

1. Go to https://railway.app
2. Sign up with GitHub
3. Verify email
4. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

**Expected Result**:

- ✅ Railway account created
- ✅ CLI authenticated

---

### Step 4.3: Setup Cloudinary Account

**Time: 15 minutes**

**Actions**:

1. Go to https://cloudinary.com
2. Sign up for free account
3. Navigate to Dashboard
4. Copy credentials:
   - Cloud Name
   - API Key
   - API Secret
5. Save these securely

**Expected Result**:

- ✅ Cloudinary account created
- ✅ Credentials saved

---

### Step 4.4: Create Railway Project

**Time: 30 minutes**

**Actions**:

1. Create new Railway project:
   ```bash
   railway init
   ```
2. Name it: `recipe-app`
3. In Railway dashboard:
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Wait for provisioning

**Expected Result**:

- ✅ Railway project created
- ✅ PostgreSQL database provisioned
- ✅ DATABASE_URL available

---

### Step 4.5: Export Local Data

**Time: 15 minutes**

**Actions**:

1. Stop Strapi (if running)
2. Navigate to backend folder
3. Export data:
   ```bash
   npm run strapi export -- --no-encrypt --file ../recipe-backup.tar.gz
   ```
4. Verify backup file created

**Expected Result**:

- ✅ Backup file created
- ✅ Contains all recipes and data

---

### Step 4.6: Deploy Backend to Railway

**Time: 1 hour**

**Actions**:

1. In Railway dashboard, create new service:

   - Select "GitHub Repo" or "Empty Service"
   - If GitHub: connect your repo, select backend folder
   - If Empty: will deploy via CLI

2. Add environment variables in Railway dashboard:

   ```
   NODE_ENV=production
   DATABASE_CLIENT=postgres
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   DATABASE_SSL=true

   UPLOAD_PROVIDER=cloudinary
   CLOUDINARY_NAME=your-cloudinary-name
   CLOUDINARY_KEY=your-cloudinary-key
   CLOUDINARY_SECRET=your-cloudinary-secret
   CLOUDINARY_FOLDER=recipes

   APP_KEYS=generate-new-random-keys-here
   API_TOKEN_SALT=generate-new-random-salt
   ADMIN_JWT_SECRET=generate-new-jwt-secret
   TRANSFER_TOKEN_SALT=generate-new-token-salt
   JWT_SECRET=generate-new-jwt-secret

   HOST=0.0.0.0
   PORT=1337
   ```

   **Generate random keys**:

   ```bash
   # Run this 5 times for each secret
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. Deploy:

   ```bash
   cd backend
   railway up
   ```

4. Get backend URL from Railway dashboard

**Expected Result**:

- ✅ Backend deployed successfully
- ✅ Can access admin at: https://your-backend.railway.app/admin
- ✅ Database connected

---

### Step 4.7: Import Data to Production

**Time: 20 minutes**

**Actions**:

1. Create admin user on production (first time accessing admin)
2. Import backup data:

   ```bash
   # Set environment variable temporarily
   export STRAPI_ADMIN_URL=https://your-backend.railway.app

   # Import data
   cd backend
   npm run strapi import -- --file ../recipe-backup.tar.gz
   ```

3. Check admin panel - recipes should appear
4. Images will be in Cloudinary

**Expected Result**:

- ✅ All recipes imported
- ✅ Images uploaded to Cloudinary
- ✅ Data visible in admin

---

### Step 4.8: Deploy Frontend to Railway

**Time: 30 minutes**

**Actions**:

1. In Railway project, create another service
2. Add environment variables:

   ```
   VITE_STRAPI_URL=https://your-backend.railway.app
   ```

3. Deploy:

   ```bash
   railway up
   ```

4. Get frontend URL from Railway

**Expected Result**:

- ✅ Frontend deployed
- ✅ Can access at: https://your-frontend.railway.app
- ✅ Connects to backend successfully

---

### Step 4.9: Final Testing

**Time: 30 minutes**

**Test Checklist**:

- [ ] Visit production URL
- [ ] Homepage loads with recipes
- [ ] Recipe images display from Cloudinary
- [ ] Click on recipe → detail page works
- [ ] Search functionality works
- [ ] All recipes accessible
- [ ] Mobile responsive
- [ ] Fast loading times
- [ ] No console errors

---

### Step 4.10: Setup Custom Domain (Optional)

**Time: 20 minutes**

**Actions**:

1. In Railway dashboard
2. Select frontend service
3. Settings → Domains
4. Add custom domain
5. Update DNS records at your domain provider

---

## 📚 Phase 5: Documentation & Maintenance

### Step 5.1: Create Documentation

**Time: 1 hour**

**Documents to Create**:

1. README.md - Project overview, setup instructions
2. DEPLOYMENT.md - Deployment guide
3. USAGE.md - How to add recipes, manage content
4. TROUBLESHOOTING.md - Common issues and solutions

---

### Step 5.2: Backup Strategy

**Time: 30 minutes**

**Setup**:

1. Schedule regular exports (weekly)
2. Store backups in GitHub or cloud storage
3. Document restore process
4. Test restore procedure

**Backup Command**:

```bash
# Add to cron job or run manually weekly
npm run strapi export -- --no-encrypt --file backup-$(date +%Y%m%d).tar.gz
```

---

## 🎓 Learning Resources

### Strapi Documentation

- https://docs.strapi.io/
- Content Type Builder
- API documentation
- Plugins

### Vite Documentation

- https://vitejs.dev/
- React integration
- Build optimization
- Environment variables

### Tailwind CSS

- https://tailwindcss.com/docs
- Responsive Design
- Custom Configuration

---

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

---

## ✅ Project Completion Checklist

### Development

- [ ] Strapi configured with Recipe content type
- [ ] Sample recipes added
- [ ] Frontend components built
- [ ] Homepage working
- [ ] Recipe detail pages working
- [ ] Search functionality working
- [ ] Responsive design tested
- [ ] Cross-browser tested

### Production

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Railway
- [ ] Database migrated to PostgreSQL
- [ ] Images migrated to Cloudinary
- [ ] All features work in production
- [ ] Performance optimized
- [ ] Accessibility verified

### Documentation

- [ ] README.md created
- [ ] Deployment guide written
- [ ] Usage instructions documented
- [ ] Backup strategy implemented

---

## 🎉 Success Metrics

Your app is ready when:

- ✅ You can add recipes via Strapi admin
- ✅ Recipes appear on homepage immediately
- ✅ Search finds recipes by any field
- ✅ Design looks beautiful with turquoise/green theme
- ✅ Works perfectly on mobile
- ✅ Loads fast (<3 seconds)
- ✅ Images are optimized
- ✅ Easy to add new recipes

---

## 📞 Next Steps After Completion

1. **Add more recipes** - Start building your collection
2. **Customize design** - Adjust colors, fonts to your taste
3. **Add features**:
   - Recipe ratings
   - Cooking timer
   - Print view
   - Share functionality
   - Recipe collections/meal plans
4. **Share with friends** - Get feedback
5. **Keep learning** - Explore Strapi plugins, Vite and React Router features

---

**Ready to start? Let's build! 🚀**

Request the first artifact to begin: "Create the setup script"
