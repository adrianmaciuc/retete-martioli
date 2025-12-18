import { ChefHat, Plus } from 'lucide-react';

interface HeaderProps {
  onAddRecipe?: () => void;
}

export function Header({ onAddRecipe }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-soft">
            <ChefHat className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Recipe Book
            </h1>
            <p className="text-xs text-muted-foreground">Delicious creations</p>
          </div>
        </div>

        <button
          onClick={onAddRecipe}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-soft"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Recipe</span>
        </button>
      </div>
    </header>
  );
}
