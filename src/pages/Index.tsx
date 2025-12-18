import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryFilter } from "@/components/CategoryFilter";
import { RecipeGrid } from "@/components/RecipeGrid";
import { sampleRecipes } from "@/lib/sample-recipes";
import { Recipe } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { getRecipes, getCategories } from "@/lib/strapi";

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [recipes, setRecipes] = useState<Recipe[]>(sampleRecipes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        recipe.ingredients.some((ing) =>
          ing.item.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Category filter
      const matchesCategory =
        selectedCategory === "all" ||
        recipe.categories.some((cat) => cat.slug === selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, recipes]);

  const handleSearch = useCallback((query: string) => {
    // Navigate to search page so results are shareable/bookmarkable
    const encoded = encodeURIComponent(query);
    window.history.replaceState({}, "", `/search?q=${encoded}`);
    setSearchQuery(query);
  }, []);

  const handleAddRecipe = () => {
    toast({
      title: "Coming Soon!",
      description: "Recipe creation feature coming soon.",
    });
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // fetch recipes
    getRecipes()
      .then((data) => {
        if (!mounted) return;
        setRecipes(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load recipes. Showing sample data.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // fetch categories in parallel (non-blocking)
    getCategories()
      .then((data) => {
        if (!mounted) return;
        setCategories(data);
      })
      .catch((err) => {
        console.error(err);
        setCategoriesError("Could not fetch categories. Using defaults.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header onAddRecipe={handleAddRecipe} />

      <main>
        <Hero onSearch={handleSearch} recipeCount={recipes.length} />

        <section className="container mx-auto px-4 pb-16">
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            categories={[
              { id: "all", name: "All Recipes", slug: "all", emoji: "🍽️" },
              ...categories,
            ]}
          />

          {error && (
            <div className="mb-6 text-sm text-amber-600 text-center">
              {error}
            </div>
          )}

          <RecipeGrid
            recipes={filteredRecipes}
            onRecipeClick={(recipe) => {
              navigate(`/recipe/${encodeURIComponent(recipe.slug)}`);
            }}
            loading={loading}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Made with 💚 for food lovers everywhere
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
