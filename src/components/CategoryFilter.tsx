import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  emoji: string;
}

const categories: Category[] = [
  { id: 'all', name: 'All Recipes', emoji: '🍽️' },
  { id: 'italian', name: 'Italian', emoji: '🍝' },
  { id: 'seafood', name: 'Seafood', emoji: '🦐' },
  { id: 'thai', name: 'Thai', emoji: '🥢' },
  { id: 'desserts', name: 'Desserts', emoji: '🍰' },
  { id: 'healthy', name: 'Healthy', emoji: '🥗' },
  { id: 'japanese', name: 'Japanese', emoji: '🍱' },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (categoryId: string) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            selected === category.id
              ? 'bg-primary text-primary-foreground shadow-soft'
              : 'bg-card text-muted-foreground hover:bg-secondary hover:text-secondary-foreground border border-border'
          )}
        >
          <span>{category.emoji}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
