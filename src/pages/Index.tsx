import { useState, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CategoryFilter } from '@/components/CategoryFilter';
import { RecipeGrid } from '@/components/RecipeGrid';
import { RecipeDetail } from '@/components/RecipeDetail';
import { sampleRecipes } from '@/lib/sample-recipes';
import { Recipe } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filteredRecipes = useMemo(() => {
    return sampleRecipes.filter((recipe) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        recipe.ingredients.some(ing => ing.item.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'all' ||
        recipe.categories.some(cat => cat.slug === selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleAddRecipe = () => {
    toast({
      title: "Coming Soon!",
      description: "Enable Lovable Cloud to add and save your own recipes.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAddRecipe={handleAddRecipe} />
      
      <main>
        <Hero onSearch={handleSearch} recipeCount={sampleRecipes.length} />
        
        <section className="container mx-auto px-4 pb-16">
          <CategoryFilter 
            selected={selectedCategory} 
            onSelect={setSelectedCategory} 
          />
          
          <RecipeGrid 
            recipes={filteredRecipes} 
            onRecipeClick={setSelectedRecipe}
          />
        </section>
      </main>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetail 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}

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
