import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { isAccessGranted } from "@/lib/access";
import { createRecipeFromAccess, getCategories } from "@/lib/strapi";

type Ingredient = {
  item: string;
  quantity: string;
  unit?: string;
  notes?: string;
};
type Instruction = { stepNumber: number; description: string; tips?: string };

const AddRecipe = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState<number>(0);
  const [cookTime, setCookTime] = useState<number>(0);
  const [servings, setServings] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { item: "", quantity: "" },
  ]);
  const [instructions, setInstructions] = useState<Instruction[]>([
    { stepNumber: 1, description: "" },
  ]);
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAccessGranted()) {
      navigate("/access");
      return;
    }
    getCategories().then(setCategories);
  }, [navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        navigate("/");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

  const addIngredient = () =>
    setIngredients([...ingredients, { item: "", quantity: "" }]);
  const removeIngredient = (idx: number) =>
    setIngredients(ingredients.filter((_, i) => i !== idx));
  const updateIngredient = (idx: number, patch: Partial<Ingredient>) =>
    setIngredients(
      ingredients.map((ing, i) => (i === idx ? { ...ing, ...patch } : ing))
    );

  const addInstruction = () =>
    setInstructions([
      ...instructions,
      { stepNumber: instructions.length + 1, description: "" },
    ]);
  const removeInstruction = (idx: number) =>
    setInstructions(
      instructions
        .filter((_, i) => i !== idx)
        .map((ins, i) => ({ ...ins, stepNumber: i + 1 }))
    );
  const updateInstruction = (idx: number, patch: Partial<Instruction>) =>
    setInstructions(
      instructions
        .map((ins, i) => (i === idx ? { ...ins, ...patch } : ins))
        .map((ins, i) => ({ ...ins, stepNumber: i + 1 }))
    );

  const onSubmit = async () => {
    // Basic client-side validation
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a recipe title.",
      });
      return;
    }
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a description.",
      });
      return;
    }
    if (!coverFile) {
      toast({
        title: "Cover image required",
        description: "Please select a cover image.",
      });
      return;
    }
    if (!galleryFiles.length) {
      toast({
        title: "Gallery images required",
        description: "Please add at least one gallery image.",
      });
      return;
    }

    const data = {
      title,
      description,
      prepTime: Number(prepTime) || 0,
      cookTime: Number(cookTime) || 0,
      servings: Number(servings) || 1,
      difficulty,
      ingredients,
      instructions,
      categorySlugs: selectedCats,
    };

    const fd = new FormData();
    fd.append("data", JSON.stringify(data));
    fd.append("coverImage", coverFile);
    for (const gf of galleryFiles) fd.append("galleryImage", gf);

    const res = await createRecipeFromAccess(fd);
    if (!res.ok || !res.slug) {
      setError(res.error || "Unknown error occurred while creating recipe");
      return;
    }
    toast({ title: "Recipe created", description: "Redirecting to recipe..." });
    navigate(`/recipe/${encodeURIComponent(res.slug)}`);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto mt-16 text-center">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-8">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Failed to Create Recipe
            </h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to home page in a few seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Add Recipe</h1>

      <div className="grid gap-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="block mb-2">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Spaghetti Carbonara"
            />
          </div>
          <div>
            <Label className="block mb-2">Difficulty</Label>
            <select
              className="w-full border rounded h-10 px-3 bg-background"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <Label className="block mb-2">Description</Label>
          <textarea
            className="w-full border rounded min-h-24 p-3 bg-background"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of the recipe"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label className="block mb-2">Prep Time (min)</Label>
            <Input
              type="number"
              min={0}
              value={prepTime}
              onChange={(e) => setPrepTime(Number(e.target.value))}
            />
          </div>
          <div>
            <Label className="block mb-2">Cook Time (min)</Label>
            <Input
              type="number"
              min={0}
              value={cookTime}
              onChange={(e) => setCookTime(Number(e.target.value))}
            />
          </div>
          <div>
            <Label className="block mb-2">Servings</Label>
            <Input
              type="number"
              min={1}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <h2 className="text-xl font-medium mb-2">Ingredients</h2>
          <div className="space-y-2">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="grid sm:grid-cols-4 gap-2">
                <Input
                  placeholder="Item"
                  value={ing.item}
                  onChange={(e) =>
                    updateIngredient(idx, { item: e.target.value })
                  }
                />
                <Input
                  placeholder="Quantity"
                  value={ing.quantity}
                  onChange={(e) =>
                    updateIngredient(idx, { quantity: e.target.value })
                  }
                />
                <Input
                  placeholder="Unit"
                  value={ing.unit || ""}
                  onChange={(e) =>
                    updateIngredient(idx, { unit: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => removeIngredient(idx)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" onClick={addIngredient} variant="secondary">
              Add Ingredient
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-xl font-medium mb-2">Instructions</h2>
          <div className="space-y-2">
            {instructions.map((ins, idx) => (
              <div key={idx} className="grid sm:grid-cols-6 gap-2 items-center">
                <div className="sm:col-span-1">
                  <Input readOnly value={ins.stepNumber} />
                </div>
                <div className="sm:col-span-5">
                  <Input
                    placeholder="Step description"
                    value={ins.description}
                    onChange={(e) =>
                      updateInstruction(idx, { description: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-6 flex gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => removeInstruction(idx)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" onClick={addInstruction} variant="secondary">
              Add Step
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-xl font-medium mb-2">Categories</h2>
          <div className="grid sm:grid-cols-3 gap-2">
            {categories.map((c) => (
              <label key={c.slug} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(c.slug)}
                  onChange={(e) => {
                    setSelectedCats((prev) =>
                      e.target.checked
                        ? [...prev, c.slug]
                        : prev.filter((s) => s !== c.slug)
                    );
                  }}
                />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Media */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="block mb-2">Cover Image</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <Label className="block mb-2">Gallery Images</Label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setGalleryFiles(Array.from(e.target.files || []))
              }
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onSubmit}>Create Recipe</Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddRecipe;
