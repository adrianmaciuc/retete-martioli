# Playwright E2E Testing Setup Guide

Complete step-by-step guide to setup and run Playwright E2E tests for the Recipe App

---

## 📋 Overview

This guide walks you through:

- Installing Playwright testing framework
- Configuring tests to use fallback (sample) data
- Writing your first E2E tests
- Running tests in different modes
- Integrating with CI/CD (optional)

**Estimated time**: 1-2 hours for full setup and first test run

---

## ✅ Prerequisites

Before starting, ensure:

- [ ] Node.js 18.x or higher installed
- [ ] npm or yarn installed
- [ ] Project repository cloned
- [ ] `npm install` completed in project root
- [ ] Vite dev server can run (`npm run dev`)

---

## Part 1: Install Playwright

### Step 1.1: Install Dependencies

Open terminal in project root and run:

```bash
npm install -D @playwright/test
```

This installs:

- Playwright test runner
- Browser automation (Chromium, Firefox, WebKit)
- Test utilities

**Output Expected**:

```
added XX packages
```

---

### Step 1.2: Install Browsers

Run:

```bash
npx playwright install
```

This downloads browsers for:

- Chromium
- Firefox
- WebKit (Safari)

**Note**: First time takes 2-3 minutes, downloads ~200MB

**Output Expected**:

```
Downloading Chromium...
Downloading Firefox...
Downloading WebKit...
✓ Success
```

---

### Step 1.3: Create Test Directory Structure

Create the following folder structure:

```
project-root/
├── playwright/
│   ├── tests/
│   │   ├── home.spec.ts
│   │   ├── recipe-detail.spec.ts
│   │   ├── search.spec.ts
│   │   └── navigation.spec.ts
│   ├── fixtures/
│   │   └── test-data.ts
│   └── playwright.config.ts
```

Run these commands:

```bash
mkdir -p playwright/tests
mkdir -p playwright/fixtures
```

---

## Part 2: Configure Playwright

### Step 2.1: Create playwright.config.ts

Create file: `playwright/playwright.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:5173",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
    /* Video on failure */
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**Key Settings Explained**:

- `testDir`: Where Playwright looks for test files
- `baseURL`: Dev server address (Vite default)
- `screenshot: 'only-on-failure'`: Capture screenshots when tests fail
- `video: 'retain-on-failure'`: Record videos for failed tests
- `webServer`: Automatically start dev server before tests
- `devices`: Test on Chrome, Firefox, Safari, and mobile browsers

---

### Step 2.2: Update package.json Scripts

Open `package.json` and add test scripts in the `"scripts"` section:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

**Script Explanation**:

- `test:e2e`: Run all tests (headless mode)
- `test:e2e:ui`: Run with UI (interactive mode)
- `test:e2e:headed`: Run with visible browser window
- `test:e2e:debug`: Run with step-by-step debugging
- `test:e2e:report`: View test report after running tests

---

### Step 2.3: Update .gitignore

Add Playwright artifacts to `.gitignore`:

```
# Playwright
test-results/
playwright-report/
playwright/.auth/
```

---

## Part 3: Create Test Data Fixtures

### Step 3.1: Create Test Data Helper

Create file: `playwright/fixtures/test-data.ts`

```typescript
export const testData = {
  // Sample recipe from fallback data
  sampleRecipe: {
    title: "Classic Margherita Pizza",
    slug: "classic-margherita-pizza",
    description: "A traditional Italian pizza with fresh ingredients",
  },

  // Wait times in milliseconds
  wait: {
    short: 500,
    medium: 1000,
    long: 2000,
  },

  // Selectors (adjust based on your actual HTML)
  selectors: {
    recipeCard: '[data-testid="recipe-card"]',
    recipesGrid: '[data-testid="recipes-grid"]',
    searchInput: '[data-testid="search-input"]',
    categoryFilter: '[data-testid="category-filter"]',
    heroSection: '[data-testid="hero-section"]',
    header: "header",
    recipeTitle: "h1",
    ingredientsList: '[data-testid="ingredients-list"]',
    instructionsList: '[data-testid="instructions-list"]',
  },
};
```

**Note**: These selectors assume your HTML has `data-testid` attributes. You may need to update based on your actual component structure.

---

## Part 4: Write Your First Test

### Step 4.1: Create Homepage Test

Create file: `playwright/tests/home.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home before each test
    await page.goto("/");
  });

  test("should load homepage", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Recipe App/i);
  });

  test("should display hero section", async ({ page }) => {
    // Check if hero section exists
    const hero = page.locator("text=Recipe").first();
    await expect(hero).toBeVisible();
  });

  test("should display recipe cards", async ({ page }) => {
    // Wait for at least one recipe card to be visible
    const recipeCards = page
      .locator("article")
      .filter({ hasText: /Classic|Easy|Medium|Hard/ });
    await expect(recipeCards.first()).toBeVisible();
  });

  test("should display search bar", async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();

    // Verify placeholder text
    await expect(searchInput).toHaveAttribute("placeholder", /search/i);
  });

  test("should display category filters", async ({ page }) => {
    // Look for "All Recipes" category button
    const categoryButton = page
      .locator("button", { hasText: /All Recipes/ })
      .first();
    await expect(categoryButton).toBeVisible();
  });

  test("should navigate to recipe detail on card click", async ({ page }) => {
    // Find first recipe card and click it
    const firstCard = page.locator("article").first();
    await firstCard.click();

    // Check if navigated to recipe page (URL changes)
    await page.waitForURL(/\/recipe\//);
    expect(page.url()).toContain("/recipe/");
  });
});
```

---

### Step 4.2: Run Your First Test

Terminal command:

```bash
npm run test:e2e
```

**What happens**:

1. Playwright starts Vite dev server (if not already running)
2. Opens browsers (Chrome, Firefox, Safari, Mobile)
3. Navigates to `http://localhost:5173`
4. Runs all tests in all browsers
5. Reports results

**Expected Output**:

```
Running tests...

✓ homepage › should load homepage (1.2s)
✓ homepage › should display hero section (0.8s)
✓ homepage › should display recipe cards (1.5s)
✓ homepage › should display search bar (0.7s)
✓ homepage › should display category filters (0.9s)
✓ homepage › should navigate to recipe detail on card click (2.1s)

6 passed (8.2s)

View full report: playwright-report/index.html
```

---

### Step 4.3: View Test Report

After tests complete, view detailed report:

```bash
npm run test:e2e:report
```

This opens an HTML report showing:

- All test results
- Screenshots of failures
- Videos of failed tests
- Execution times

---

## Part 5: Write More Tests

### Step 5.1: Create Recipe Detail Test

Create file: `playwright/tests/recipe-detail.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Recipe Detail Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a recipe detail page
    // Using the first available recipe from homepage
    await page.goto("/");
    await page.locator("article").first().click();
    await page.waitForURL(/\/recipe\//);
  });

  test("should display recipe title", async ({ page }) => {
    const title = page.locator("h1").first();
    await expect(title).toBeVisible();
    await expect(title).not.toHaveText("");
  });

  test("should display recipe description", async ({ page }) => {
    const description = page.locator("p").filter({ hasText: /.+/ }).first();
    await expect(description).toBeVisible();
  });

  test("should display ingredients", async ({ page }) => {
    // Look for section containing ingredients
    const ingredientsSection = page.locator("text=Ingredients").first();
    await expect(ingredientsSection).toBeVisible();

    // Check for ingredient items
    const ingredientItems = page.locator("li").filter({ hasText: /^[A-Z]/ });
    const count = await ingredientItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display instructions", async ({ page }) => {
    // Look for section containing instructions
    const instructionsSection = page.locator("text=Instructions").first();
    await expect(instructionsSection).toBeVisible();

    // Check for instruction steps
    const steps = page.locator("li").filter({ hasText: /Step|^[0-9]/ });
    const count = await steps.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display cooking times", async ({ page }) => {
    // Look for time indicators
    const timeText = page.locator("text=/min|minutes/");
    await expect(timeText.first()).toBeVisible();
  });

  test("should display servings", async ({ page }) => {
    // Look for servings indicator
    const servingsText = page.locator("text=/servings?/i");
    await expect(servingsText.first()).toBeVisible();
  });
});
```

---

### Step 5.2: Create Search Test

Create file: `playwright/tests/search.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should filter recipes by title", async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[type="text"]').first();

    // Type search term
    await searchInput.fill("Pizza");

    // Wait for results to update
    await page.waitForTimeout(500);

    // Check if results contain search term
    const resultCards = page.locator("article");
    const firstCard = resultCards.first();

    // At least one result should contain the search term
    const cardText = await firstCard.textContent();
    expect(cardText).toContain("Pizza");
  });

  test("should show all recipes with empty search", async ({ page }) => {
    // Count initial recipe cards
    const initialCards = page.locator("article");
    const initialCount = await initialCards.count();

    // Clear search (if there's a clear button)
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.clear();

    // Wait for update
    await page.waitForTimeout(500);

    // Should show multiple recipes
    expect(initialCount).toBeGreaterThan(0);
  });

  test("should handle no search results", async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();

    // Search for something unlikely to exist
    await searchInput.fill("XYZ123NOTEXIST");

    // Wait for results
    await page.waitForTimeout(500);

    // Should show either empty state or no results message
    const results = page.locator("article");
    const count = await results.count();

    // Results should be 0 or very minimal
    expect(count).toBeLessThan(3);
  });
});
```

---

### Step 5.3: Create Navigation Test

Create file: `playwright/tests/navigation.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate from recipe detail back to home via logo", async ({
    page,
  }) => {
    // Go to recipe detail
    await page.goto("/");
    await page.locator("article").first().click();
    await page.waitForURL(/\/recipe\//);

    // Click on logo/home link (usually in header)
    const homeLink = page.locator("header").locator("a").first();
    await homeLink.click();

    // Should return to home
    await page.waitForURL("/");
    expect(page.url()).not.toContain("/recipe/");
  });

  test("should update URL when clicking recipe card", async ({ page }) => {
    await page.goto("/");

    // Click first recipe card
    const firstCard = page.locator("article").first();
    const initialUrl = page.url();

    await firstCard.click();

    // URL should change to recipe page
    await page.waitForURL(/\/recipe\//);
    expect(page.url()).not.toBe(initialUrl);
    expect(page.url()).toContain("/recipe/");
  });

  test("should maintain state during navigation", async ({ page }) => {
    await page.goto("/");

    // Select a category filter
    const categoryButton = page
      .locator("button")
      .filter({ hasText: /Desserts|Italian|Healthy/ })
      .first();
    const categoryName = await categoryButton.textContent();
    await categoryButton.click();

    // Navigate to a recipe
    await page.locator("article").first().click();
    await page.waitForURL(/\/recipe\//);

    // Go back to home
    await page.locator("header").locator("a").first().click();
    await page.waitForURL("/");

    // Category filter should be reset (or preserved - depends on implementation)
    // Adjust this assertion based on expected behavior
  });
});
```

---

## Part 6: Run Tests in Different Modes

### Mode 1: Run All Tests (Headless)

```bash
npm run test:e2e
```

Fastest mode - runs all tests across all browsers without showing browser window.

---

### Mode 2: Interactive UI Mode

```bash
npm run test:e2e:ui
```

Opens Playwright Inspector with:

- Test files list on left
- Browser window in center
- Execution controls
- Step-by-step debugging

Great for development and debugging.

---

### Mode 3: Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

Runs tests with visible browser windows. Slower but easier to see what's happening.

---

### Mode 4: Debug Mode

```bash
npm run test:e2e:debug
```

Pauses at each step, lets you inspect elements and manually execute commands.

---

### Mode 5: Run Specific Test File

```bash
npx playwright test playwright/tests/home.spec.ts
```

Run only homepage tests.

---

### Mode 6: Run Specific Test

```bash
npx playwright test -g "should display recipe cards"
```

Run only tests matching the name pattern.

---

### Mode 7: Run on Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Test on single browser for faster feedback during development.

---

## Part 7: View Test Results

### View HTML Report

```bash
npm run test:e2e:report
```

Opens detailed report with:

- ✅/❌ test results
- Execution time for each test
- Screenshots of failures
- Videos of failed test runs

### View in Terminal

Tests print results to console:

```
✓ 12 passed (5.2s)
```

---

## Part 8: Troubleshooting

### Issue: Tests timeout

**Solution**:

- Increase timeout in `playwright.config.ts`:
  ```typescript
  use: {
    actionTimeout: 10000, // 10 seconds
    navigationTimeout: 30000, // 30 seconds
  }
  ```

---

### Issue: "Cannot find browser"

**Solution**:

- Reinstall browsers:
  ```bash
  npx playwright install
  ```

---

### Issue: Tests pass locally but fail in CI

**Solution**:

- Set `reuseExistingServer: false` in CI environment
- Add `headless: true` for CI
- Use `--workers=1` for single worker

---

### Issue: Port 5173 already in use

**Solution**:

- Kill existing Vite process
- Or change port in `playwright.config.ts`:
  ```typescript
  webServer: {
    command: 'npm run dev -- --port 3000',
    url: 'http://localhost:3000',
  }
  ```

---

### Issue: Selectors not finding elements

**Solution**:

- Update `test-data.ts` selectors to match your HTML
- Use Playwright Inspector to find correct selectors:
  ```bash
  npm run test:e2e:debug
  ```
- Use browser DevTools in Inspector to test selectors

---

## Part 9: Best Practices

### ✅ DO

- Use `data-testid` attributes in components for reliable selectors
- Wait for navigation with `page.waitForURL()`
- Use meaningful test names
- Group related tests with `test.describe()`
- Use `test.beforeEach()` for common setup
- Keep tests independent (no test depends on another)
- Test user behavior, not implementation

### ❌ DON'T

- Use fragile CSS selectors that depend on styling
- Use hard-coded waits - use proper wait methods instead
- Test too much in one test
- Rely on test execution order
- Use selectors like `div > span > p > a` (fragile)

---

## Part 10: Next Steps

1. **Add more tests** for edge cases and error scenarios
2. **Setup CI/CD** to run tests on every commit
3. **Add visual regression tests** to catch UI changes
4. **Expand test coverage** to all pages
5. **Setup GitHub Actions** to run tests on pull requests

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Locator Strategies](https://playwright.dev/docs/locators)
- [Assertions](https://playwright.dev/docs/test-assertions)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [Test Configuration](https://playwright.dev/docs/test-configuration)

---

**Happy Testing! 🎭**
