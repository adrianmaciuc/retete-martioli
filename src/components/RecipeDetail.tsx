import { Recipe } from '@/lib/types';
import { Clock, Users, ChefHat, X, Printer, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
}

const difficultyColors = {
  Easy: 'bg-teal-100 text-teal-700 border-teal-200',
  Medium: 'bg-accent/20 text-accent border-accent/30',
  Hard: 'bg-coral/20 text-coral border-coral/30',
};

export function RecipeDetail({ recipe, onClose }: RecipeDetailProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img
          src={recipe.coverImage}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-card/90 backdrop-blur-sm rounded-full text-foreground hover:bg-card transition-colors shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-3 bg-card/90 backdrop-blur-sm rounded-full text-foreground hover:bg-card transition-colors shadow-lg"
            aria-label="Print recipe"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <span className={cn(
              'inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 border',
              difficultyColors[recipe.difficulty]
            )}>
              {recipe.difficulty}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4 text-balance">
              {recipe.title}
            </h1>
            <p className="font-recipe text-lg text-primary-foreground/90 max-w-2xl">
              {recipe.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 -mt-8 relative">
        {/* Quick Info Card */}
        <div className="bg-card rounded-2xl shadow-card p-6 mb-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{totalTime}</p>
            <p className="text-sm text-muted-foreground">minutes total</p>
          </div>
          <div className="text-center border-x border-border">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{recipe.servings}</p>
            <p className="text-sm text-muted-foreground">servings</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
              <ChefHat className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{recipe.ingredients.length}</p>
            <p className="text-sm text-muted-foreground">ingredients</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl shadow-card p-6 sticky top-4">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">
                  🥗
                </span>
                Ingredients
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient) => (
                  <li
                    key={ingredient.id}
                    className="flex items-start gap-3 font-recipe text-foreground"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>
                      <strong className="text-primary">{ingredient.quantity}</strong>
                      {ingredient.unit && <span className="text-muted-foreground"> {ingredient.unit}</span>}
                      {' '}{ingredient.item}
                      {ingredient.notes && (
                        <span className="text-muted-foreground italic"> ({ingredient.notes})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm">
                📝
              </span>
              Instructions
            </h2>
            <ol className="space-y-6">
              {recipe.instructions.map((instruction) => (
                <li key={instruction.id} className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground font-display font-bold text-lg flex items-center justify-center">
                    {instruction.stepNumber}
                  </span>
                  <div className="flex-1 pt-2">
                    <p className="font-recipe text-lg text-foreground leading-relaxed">
                      {instruction.description}
                    </p>
                    {instruction.tips && (
                      <div className="mt-3 p-4 bg-secondary rounded-lg border-l-4 border-primary">
                        <p className="text-sm text-secondary-foreground">
                          <span className="font-semibold">💡 Tip:</span> {instruction.tips}
                        </p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
