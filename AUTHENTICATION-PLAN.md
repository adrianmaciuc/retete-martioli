# Authentication & User Roles Implementation Plan

**Recipe App User & Cook Authentication System**

---

## 📋 Overview

Implement role-based authentication with two user types:
- **User**: Can browse recipes, favorite them, subscribe to newsletter, manage profile
- **Cook**: Can manage recipes (CRUD), moderate content, access recipe dashboard

**Stack**: Strapi JWT auth + React Context + localStorage

---

## 🔐 Architecture Overview

### Authentication Flow

```
User/Cook Registration
        ↓
Choose Role (User/Cook)
        ↓
POST /api/auth/local/register
        ↓
JWT Token + User Object stored in localStorage
        ↓
React Context provides auth state to all components
        ↓
Protected routes check role and redirect if needed
```

### Role Permissions

| Feature | User | Cook |
|---------|------|------|
| View Recipes | ✅ | ✅ |
| Favorite Recipes | ✅ | ✅ |
| View Favorites | ✅ | ✅ |
| Newsletter Signup | ✅ | ✅ |
| Add Recipes | ❌ | ✅ |
| Edit Recipes | ❌ | ✅ |
| Delete Recipes | ❌ | ✅ |
| Create Tags | ❌ | ✅ |
| Manage Categories | ❌ | ✅ |
| Access CMS UI | ❌ | ✅ |

---

## 🗄️ Phase 1: Database & Backend Setup

### Step 1.1: Configure Strapi User Collection

**Status**: ❌ Not started

**Actions**:

1. In Strapi admin → Settings → Users & Permissions Plugin
2. Extend User collection with custom fields:
   - `role` (Enumeration: `user`, `cook`) - Default: `user`
   - `avatar` (Text: Short text) - URL to avatar image
   - `newsletterSubscribed` (Boolean) - Default: `false`
   - `bio` (Text: Long text) - Optional cook bio
   - `createdAt` (DateTime) - Auto

**File Changes**: None (Strapi admin UI only)

**Expected Result**:
- ✅ User table has custom fields
- ✅ Strapi admin can see role on users

---

### Step 1.2: Create Favorites Collection Type

**Status**: ❌ Not started

**Purpose**: Track which recipes users favorite (many-to-many relationship)

**Actions**:

1. Content-Type Builder → Create new collection type
2. Display name: `Favorite`
3. Fields:
   - `user` (Relation: Many-to-one with User)
   - `recipe` (Relation: Many-to-one with Recipe)
   - `favoritedAt` (DateTime, auto-set on creation)

**Alternative (simpler)**: Store favorite recipe IDs directly in User as JSON array

**File Changes**: None (Strapi admin UI only)

**Expected Result**:
- ✅ Favorites collection created
- ✅ Can track which user favorited which recipe

---

### Step 1.3: Update Strapi API Permissions

**Status**: ❌ Not started

**Actions**:

1. Settings → Users & Permissions → Roles

2. **Public Role**:
   - ✅ Recipe: find, findOne
   - ✅ Category: find, findOne
   - ✅ Auth/local: register, forgot-password, reset-password

3. **Authenticated Role** (applies to both User and Cook):
   - ✅ Recipe: find, findOne
   - ✅ Favorite: find, create, delete (only own)
   - ✅ User: me, update (only own profile)

4. **Custom Cook Role**:
   - ✅ Recipe: find, findOne, create, update, delete (own/all)
   - ✅ Category: find, findOne
   - ✅ All authenticated permissions

**File Changes**: None (Strapi admin UI only)

**Expected Result**:
- ✅ Public can register and login
- ✅ Users can favorite recipes
- ✅ Cooks can manage recipes

---

## 🎨 Phase 2: Frontend Setup - Auth Context & Hooks

### Step 2.1: Create Authentication Context

**Status**: ✅ DONE

**File**: `src/contexts/AuthContext.tsx`

**Code Structure**:

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'cook';
  avatar: string;
  newsletterSubscribed: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, role: 'user' | 'cook') => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isCook: boolean;
}

// Provider component that:
// - Loads JWT from localStorage on mount
// - Verifies token still valid
// - Provides user data to entire app
// - Handles login/logout/register
```

**Expected Result**:
- ✅ Auth context created and exported
- ✅ Can access auth state anywhere with useAuth hook

---

### Step 2.2: Create useAuth Hook

**Status**: ✅ DONE

**File**: `src/hooks/useAuth.ts`

**Functionality**:

```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**Expected Result**:
- ✅ Easy auth access in components
- ✅ Error thrown if used outside provider

---

### Step 2.3: Create Protected Route Component

**Status**: ✅ DONE

**File**: `src/components/ProtectedRoute.tsx`

**Functionality**:

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'cook';
}

// Component that:
// - Checks if user is authenticated
// - Checks if user has required role
// - Redirects to login if not authenticated
// - Redirects to unauthorized page if wrong role
```

**Expected Result**:
- ✅ Routes can be protected
- ✅ Role-based access control working

---

### Step 2.4: Create API Client for Auth

**Status**: ✅ DONE

**File**: `src/lib/auth.ts`

**Functions**:

```typescript
export const authAPI = {
  register: (email: string, username: string, password: string) => POST /api/auth/local/register,
  login: (identifier: string, password: string) => POST /api/auth/local,
  logout: () => Clear JWT from localStorage,
  me: (jwt: string) => GET /api/users/me,
  updateProfile: (jwt: string, data: Partial<User>) => PUT /api/users/me,
};
```

**Expected Result**:
- ✅ All auth API calls centralized
- ✅ JWT automatically included in requests

---

## 👤 Phase 3: User Authentication UI & Profile

### Step 3.1: Create Login Page

**Status**: ✅ DONE

**File**: `src/pages/Login.tsx`

**Features**:

- [ ] Email/username input field
- [ ] Password input field
- [ ] "Remember me" checkbox (optional)
- [ ] Login button
- [ ] Error message display
- [ ] Loading state
- [ ] Link to register page
- [ ] Link to forgot password (future feature)

**Styling**: Tailwind with turquoise/green theme

**Navigation**: On success → redirect to home page

**Expected Result**:
- ✅ Users can login
- ✅ Errors displayed clearly
- ✅ JWT stored in localStorage

---

### Step 3.2: Create Register Page

**Status**: ✅ DONE

**File**: `src/pages/Register.tsx`

**Features**:

- [ ] Email input (with validation)
- [ ] Username input
- [ ] Password input (with strength indicator)
- [ ] Confirm password input
- [ ] Role selection: "User" or "Cook" buttons/radio
- [ ] Terms & conditions checkbox
- [ ] Register button
- [ ] Error handling
- [ ] Loading state
- [ ] Link to login page

**Role Selection UI**:

```
Choose Your Role:
[User Card]     [Cook Card]
- Browse        - Manage recipes
- Favorite      - Create content
- Newsletter    - CMS access
```

**Expected Result**:
- ✅ New users can register
- ✅ Role selected during registration
- ✅ Token stored, auto-login on success

---

### Step 3.3: Create User Profile Page

**Status**: ✅ DONE

**File**: `src/pages/UserProfile.tsx`

**Layout**:

```
┌─ Header: User Avatar + Name
├─ Profile Section
│  ├─ Avatar (clickable → change)
│  ├─ Username (editable)
│  ├─ Email (read-only)
│  ├─ Bio (editable)
│  └─ Update Profile button
├─ Newsletter Section
│  ├─ Toggle "Subscribe to Newsletter"
│  └─ Last email date (if applicable)
├─ Favorites Section (Users only)
│  ├─ Display as grid of recipe cards
│  └─ Remove from favorites button on each card
├─ Stats Section
│  ├─ Total favorites
│  ├─ Member since
│  └─ Role badge
└─ Logout Button
```

**Features**:

- [ ] Display user avatar
- [ ] Edit username/bio
- [ ] Change avatar (random selection or upload)
- [ ] Toggle newsletter subscription
- [ ] View favorite recipes (grid)
- [ ] Remove favorites
- [ ] Edit password (optional)
- [ ] Delete account (optional)

**Avatar Options**:

- [ ] 10+ random avatar URLs (generate from service like DiceBear, Gravatar, or UI Avatars)
- [ ] "Randomize" button to assign new random avatar
- [ ] Display current avatar as preview

**Expected Result**:
- ✅ Users can manage their profile
- ✅ Avatar changes persist
- ✅ Newsletter preference saved
- ✅ Favorites displayed beautifully

---

### Step 3.4: Create Avatar Selection Component

**Status**: ✅ DONE

**File**: `src/components/AvatarSelector.tsx`

**Functionality**:

```typescript
interface AvatarSelectorProps {
  currentAvatar: string;
  onSelect: (avatarUrl: string) => void;
}

// Component that:
// - Shows grid of 10-12 random avatar options
// - Highlights currently selected avatar
// - Has "Randomize" button to generate new options
// - On selection, updates user profile
```

**Avatar API Service**:

```typescript
// Option 1: DiceBear Avatars (free, no auth needed)
// https://api.dicebear.com/8.x/avataaars/svg?seed={seed}

// Option 2: UI Avatars
// https://ui-avatars.com/api/?name={name}&background=0D8ABC

// Option 3: Gravatar (requires email hash)

// Recommended: DiceBear with random seeds
```

**Expected Result**:
- ✅ Users can choose from random avatars
- ✅ Avatar persists on profile
- ✅ Used in all UI elements (header, cards, etc.)

---

### Step 3.5: Add Auth State to Header

**Status**: ✅ DONE

**File**: `src/components/Header.tsx` (modify existing)

**Changes**:

```
Before:
Header with logo + "Add Recipe" button

After:
Header with:
├─ Logo (left)
├─ Add Recipe button (center, only for cooks)
└─ Auth Section (right)
   ├─ If logged out: Login | Register buttons
   └─ If logged in:
      ├─ User avatar (clickable → profile)
      ├─ Favorites icon with count (users)
      ├─ Dropdown menu:
         ├─ Profile
         ├─ Settings
         ├─ [Cook Dashboard] (cooks only)
         └─ Logout
```

**Expected Result**:
- ✅ Auth state reflected in header
- ✅ Easy access to profile/logout
- ✅ Cook features hidden from users

---

### Step 3.6: Create Favorite Feature

**Status**: ✅ DONE

**Files**:

- `src/lib/favorites.ts` - API calls
- `src/hooks/useFavorites.ts` - Custom hook
- Update `src/components/RecipeCard.tsx` - Add heart icon (NEXT)
- Update `src/components/RecipeDetail.tsx` - Add heart icon (NEXT)

**Functionality**:

```typescript
// useFavorites hook:
const { favorites, isFavorite, toggleFavorite } = useFavorites();

// API calls:
POST /api/favorites { recipeId }
DELETE /api/favorites/{id}
GET /api/favorites?populate=recipe
```

**UI Changes**:

- **RecipeCard**: Add heart icon (filled if favorited, outline if not)
- **RecipeDetail**: Add heart icon in hero section
- **Heart icon**: On click → toggle favorite (if authenticated)
- **Non-authenticated**: Show toast "Please login to favorite recipes"

**Heart Icon Styling**:

```
Outline heart (not favorited): lucide-react Heart
Filled heart (favorited): lucide-react Heart (className="fill-red-500")
Color: Turquoise on hover, Red when favorited
```

**Expected Result**:
- ✅ Users can favorite recipes
- ✅ Favorites persist
- ✅ Visual feedback (filled heart)
- ✅ Count updates in header

---

## 👨‍🍳 Phase 4: Cook Content Management UI

### Step 4.1: Create Cook Dashboard

**Status**: ❌ Not started

**File**: `src/pages/CookDashboard.tsx`

**Layout**:

```
┌─ Header: "Recipe Management"
├─ Action Bar
│  ├─ + Add New Recipe button
│  ├─ Search recipes input
│  └─ Filter dropdowns (category, difficulty, date)
├─ Recipes Table/Grid
│  ├─ Recipe image (thumbnail)
│  ├─ Title
│  ├─ Category
│  ├─ Difficulty
│  ├─ Last modified date
│  ├─ Published status (badge)
│  └─ Actions (Edit, Delete, View)
└─ Pagination (if many recipes)
```

**Features**:

- [ ] Table view of all recipes created by this cook
- [ ] Search recipes by title
- [ ] Filter by category
- [ ] Filter by difficulty
- [ ] Sort by date, title, difficulty
- [ ] Edit recipe (opens edit form)
- [ ] Delete recipe (with confirmation)
- [ ] View published recipe
- [ ] Publish/unpublish toggle
- [ ] Bulk delete (checkbox selection)

**Expected Result**:
- ✅ Cooks can see all their recipes
- ✅ Easy to manage content
- ✅ Better UX than Strapi admin

---

### Step 4.2: Create Recipe Editor Form

**Status**: ❌ Not started

**File**: `src/pages/RecipeEditor.tsx`

**Modes**:

- **Create**: New recipe form
- **Edit**: Edit existing recipe

**Form Sections**:

```
1. Basic Info
   ├─ Title (required)
   ├─ Slug (auto-generated from title)
   └─ Description (required, max 500 chars)

2. Media
   ├─ Cover image (upload or URL)
   └─ Gallery images (multi-upload)

3. Recipe Details
   ├─ Prep time (minutes)
   ├─ Cook time (minutes)
   ├─ Servings
   ├─ Difficulty (Easy/Medium/Hard)
   └─ Categories (multi-select)

4. Ingredients
   ├─ Add ingredient button
   ├─ For each ingredient:
   │  ├─ Item name
   │  ├─ Quantity
   │  ├─ Unit
   │  ├─ Notes (optional)
   │  └─ Remove button

5. Instructions
   ├─ Add instruction button
   ├─ For each instruction:
   │  ├─ Step number (auto)
   │  ├─ Description
   │  ├─ Optional image
   │  ├─ Tips (optional)
   │  └─ Remove button

6. Tags
   ├─ Tag input (comma-separated)
   └─ Suggested tags below

7. Actions
   ├─ Save as Draft button
   ├─ Publish button
   └─ Cancel button
```

**Form Validation**:

- [ ] Title: required, min 3 chars, max 200 chars
- [ ] Description: required, max 500 chars
- [ ] Prep/cook time: required, min 0
- [ ] Servings: required, min 1
- [ ] At least 1 ingredient required
- [ ] At least 1 instruction required
- [ ] Cover image required

**Smart Features**:

- [ ] Auto-calculate total time (prep + cook)
- [ ] Auto-generate slug from title
- [ ] Image drag-and-drop upload
- [ ] Ingredient quantity validation (numbers)
- [ ] Save progress indicator (unsaved changes warning)
- [ ] Auto-save draft every 30 seconds

**Expected Result**:
- ✅ Cooks can create recipes easily
- ✅ All Strapi fields editable
- ✅ Validation prevents bad data
- ✅ Better UX than Strapi admin

---

### Step 4.3: Create Recipe Preview Component

**Status**: ❌ Not started

**File**: `src/components/RecipePreview.tsx`

**Purpose**: Show how recipe will look before publishing

**Features**:

- [ ] Side-by-side editor and preview
- [ ] Real-time preview updates as user types
- [ ] Responsive preview (desktop/tablet/mobile toggle)
- [ ] Shows all content: images, ingredients, instructions
- [ ] Print preview option

**Expected Result**:
- ✅ Cooks can see final result
- ✅ Catch issues before publishing
- ✅ Professional workflow

---

### Step 4.4: Create Category Management (Optional)

**Status**: ❌ Not started

**File**: `src/pages/CategoryManagement.tsx`

**Features** (if cook can manage categories):

- [ ] List all categories
- [ ] Add new category
- [ ] Edit category name
- [ ] Delete category
- [ ] Assign color to category

**If not allowing cook to manage**: Remove this step, categories only managed by admin

**Expected Result**:
- ✅ Categories manageable via UI (or admin-only)

---

### Step 4.5: Add Cook Features to Header

**Status**: ❌ Not started

**File**: `src/components/Header.tsx` (modify)

**Changes for Cook Users**:

```
Header (cook view):
├─ Logo (left)
├─ + Add New Recipe button (prominent, center-left)
├─ Dashboard link (center)
└─ Auth Section (right)
   ├─ Avatar
   └─ Dropdown:
      ├─ Dashboard
      ├─ My Recipes
      ├─ Profile
      └─ Logout
```

**Expected Result**:
- ✅ Cook-specific features visible
- ✅ Easy access to content management

---

## 🔧 Phase 5: Technical Implementation Details

### Step 5.1: JWT Token Management

**Status**: ❌ Not started

**File**: `src/lib/auth.ts`

**Implementation**:

```typescript
// Store JWT in localStorage
localStorage.setItem('jwt', token);

// Retrieve JWT for API calls
const jwt = localStorage.getItem('jwt');

// Add JWT to all authenticated requests
headers: { Authorization: `Bearer ${jwt}` }

// Remove JWT on logout
localStorage.removeItem('jwt');

// Verify token validity on app load
GET /api/users/me with JWT
// If 401 → token expired → logout user
// If 200 → token valid → load user data
```

**Expected Result**:
- ✅ Tokens persisted and sent with requests
- ✅ Auto-logout on token expiration

---

### Step 5.2: Protected API Calls

**Status**: ❌ Not started

**File**: `src/lib/api.ts` (or modify existing)

**Implementation**:

```typescript
// All API calls check for JWT and include it
const apiCall = async (endpoint, options = {}) => {
  const jwt = localStorage.getItem('jwt');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(jwt && { Authorization: `Bearer ${jwt}` })
  };
  
  const response = await fetch(`${STRAPI_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  if (response.status === 401) {
    // Token invalid → logout
    logout();
  }
  
  return response.json();
};
```

**Expected Result**:
- ✅ All API calls include JWT automatically
- ✅ 401 errors handled gracefully

---

### Step 5.3: Avatar URL Generation Service

**Status**: ❌ Not started

**File**: `src/lib/avatars.ts`

**Implementation**:

```typescript
// Use DiceBear Avatars API
export const generateAvatarUrl = (seed: string): string => {
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}`;
};

// Generate random avatar for new users
export const getRandomAvatarUrl = (): string => {
  const randomSeed = Math.random().toString(36).substring(7);
  return generateAvatarUrl(randomSeed);
};

// Generate cook avatar with chef hat style
export const getCookAvatarUrl = (seed: string): string => {
  // Use different DiceBear style for cook avatars if desired
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${seed}&accessories=prescription03`;
};
```

**Expected Result**:
- ✅ Random avatars generated
- ✅ Consistent avatar URLs
- ✅ No authentication needed for avatar API

---

## 📊 Phase 6: Database Schema Additions

### Summary of Strapi Changes

**User Collection (extend existing)**:

```
- role: Enumeration (user, cook) - Default: user
- avatar: Text (URL)
- newsletterSubscribed: Boolean - Default: false
- bio: Text (optional)
```

**Favorites Collection (new, optional)**:

```
- user: Relation (Many-to-One User)
- recipe: Relation (Many-to-One Recipe)
- favoritedAt: DateTime (auto)
```

**Alternatively (simpler)**:

Add to User:
```
- favoriteRecipes: Relation (User has Many Recipes) via JSON array
```

**Recipe Collection (add fields if missing)**:

```
- author: Relation (Many-to-One User with role=cook)
- published: Boolean - Default: true
- createdAt: DateTime (auto)
- updatedAt: DateTime (auto)
```

**API Permissions**:

```
Public:
- Auth: register, login
- Recipe: find, findOne
- Category: find, findOne

Authenticated (all users):
- User: me, update (own only)
- Recipe: find, findOne
- Favorite: find, create, delete (own only)

Cook role:
- Recipe: find, findOne, create, update, delete
- Category: find, findOne
- All authenticated permissions
```

---

## 📋 Implementation Checklist

### Phase 1: Backend (Strapi)

- [ ] Extend User collection with role, avatar, newsletter fields
- [ ] Create Favorites collection type
- [ ] Update Recipe to have author field
- [ ] Configure API permissions for roles
- [ ] Test auth endpoints with Postman/Insomnia
- [ ] Generate new JWT secret for production

### Phase 2: Frontend Auth Infrastructure

- [ ] Create AuthContext.tsx
- [ ] Create useAuth hook
- [ ] Create ProtectedRoute component
- [ ] Create auth API client (src/lib/auth.ts)
- [ ] Setup localStorage JWT management
- [ ] Test context with sample login

### Phase 3: User Features

- [ ] Create Login page
- [ ] Create Register page
- [ ] Update Header with auth state
- [ ] Create User Profile page
- [ ] Create AvatarSelector component
- [ ] Implement favorites feature
- [ ] Add heart icons to recipes
- [ ] Test user registration and login flow

### Phase 4: Cook Features

- [ ] Create Cook Dashboard page
- [ ] Create Recipe Editor form
- [ ] Create Recipe Preview component
- [ ] Add cook-specific header features
- [ ] Test recipe creation/editing/deletion
- [ ] Test cook-only access control

### Phase 5: Polish & Testing

- [ ] Error handling and toast notifications
- [ ] Loading states on all forms
- [ ] Form validation and feedback
- [ ] Test logout functionality
- [ ] Test token expiration
- [ ] Test role-based access (try accessing cook features as user)
- [ ] Responsive design on all pages
- [ ] Cross-browser testing

### Phase 6: Deployment

- [ ] Update Strapi permissions in production
- [ ] Update environment variables
- [ ] Test full auth flow in production
- [ ] Verify JWT tokens work
- [ ] Monitor error logs

---

## 🎨 UI Component Map

### New Components to Create

```
src/
├── contexts/
│   └── AuthContext.tsx (provider + context)
├── hooks/
│   ├── useAuth.ts
│   └── useFavorites.ts
├── components/
│   ├── ProtectedRoute.tsx
│   ├── AvatarSelector.tsx
│   ├── RecipePreview.tsx
│   └── (modify existing: Header.tsx, RecipeCard.tsx, RecipeDetail.tsx)
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── UserProfile.tsx
│   ├── CookDashboard.tsx
│   └── RecipeEditor.tsx
└── lib/
    ├── auth.ts (new)
    ├── avatars.ts (new)
    └── favorites.ts (new)
```

---

## 🚀 Success Criteria

✅ **User Experience**:
- Users can register with email/username/password
- Users can login securely with JWT
- Users see their profile with avatar
- Users can favorite recipes
- Users can subscribe to newsletter
- Users can see their favorite recipes
- Logout works properly

✅ **Cook Experience**:
- Cooks can access dashboard
- Cooks can create recipes (full form)
- Cooks can edit recipes
- Cooks can delete recipes
- Cooks see only their recipes in dashboard
- Cook features hidden from regular users
- No need to access Strapi admin

✅ **Security**:
- JWT tokens stored securely
- Protected routes working
- Role-based access enforced
- Tokens expire and logout
- API respects permissions

✅ **Design**:
- Consistent with turquoise/green theme
- Mobile responsive
- Accessible forms
- Clear error messages
- Professional UI

---

## 📚 Implementation Order

**Recommended sequence**:

1. **Week 1**: Strapi backend setup + Auth context
2. **Week 2**: Login/Register pages + JWT management
3. **Week 3**: User profile + favorites feature
4. **Week 4**: Cook dashboard + recipe editor
5. **Week 5**: Polish, testing, deployment

---

## 🔗 Related Documentation

- Strapi Plugins: https://docs.strapi.io/user-docs/plugins
- Strapi Users Permissions: https://docs.strapi.io/user-docs/users-roles-permissions
- JWT Authentication: https://docs.strapi.io/dev-docs/plugins/users-permissions
- React Context: https://react.dev/reference/react/useContext
- Protected Routes: https://reactrouter.com/examples/auth

---

**Ready to implement? Start with Phase 1 (Strapi backend setup) or Phase 2 (React auth context).**
