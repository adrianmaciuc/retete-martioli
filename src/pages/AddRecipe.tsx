import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileInput } from "@/components/ui/file-input";
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

  const toggleCategory = (slug: string) =>
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
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

      <div className="grid gap-6 bg-card rounded-xl shadow-card p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="block mb-2">Titlu</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Spaghetti Carbonara"
            />
          </div>
          <div>
            <Label className="block mb-2">Dificultate</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Usor</option>
              <option value="medium">Mediu</option>
              <option value="hard">Greu</option>
            </select>
          </div>
        </div>

        <div>
          <Label className="block mb-2">Descriere</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Scurta descriere a retetei"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label className="block mb-2">Timp pentru pregatire (min)</Label>
            <Input
              type="number"
              min={0}
              value={prepTime}
              onChange={(e) => setPrepTime(Number(e.target.value))}
            />
          </div>
          <div>
            <Label className="block mb-2">Timp pentru gatit (min)</Label>
            <Input
              type="number"
              min={0}
              value={cookTime}
              onChange={(e) => setCookTime(Number(e.target.value))}
            />
          </div>
          <div>
            <Label className="block mb-2">Portii</Label>
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
          <h2 className="text-xl font-medium mb-2">Ingrediente</h2>
          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="border rounded-lg p-3 space-y-2">
                <div className="grid sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="Ingredient*"
                    value={ing.item}
                    onChange={(e) =>
                      updateIngredient(idx, { item: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Cantitate*"
                    value={ing.quantity}
                    onChange={(e) =>
                      updateIngredient(idx, { quantity: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Unitate de masura"
                    value={ing.unit || ""}
                    onChange={(e) =>
                      updateIngredient(idx, { unit: e.target.value })
                    }
                  />
                </div>
                <Input
                  placeholder="Notite (optional)"
                  value={ing.notes || ""}
                  onChange={(e) =>
                    updateIngredient(idx, { notes: e.target.value })
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => removeIngredient(idx)}
                >
                  Scoate ingredient
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addIngredient} variant="secondary">
              Adauga ingredient
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-xl font-medium mb-2">Instructiuni</h2>
          <div className="space-y-3">
            {instructions.map((ins, idx) => (
              <div key={idx} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm w-8">
                    #{ins.stepNumber}
                  </span>
                  <Input
                    placeholder="Descriere pas*"
                    value={ins.description}
                    onChange={(e) =>
                      updateInstruction(idx, { description: e.target.value })
                    }
                  />
                </div>
                <Input
                  placeholder="Secret (optional)"
                  value={ins.tips || ""}
                  onChange={(e) =>
                    updateInstruction(idx, { tips: e.target.value })
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => removeInstruction(idx)}
                >
                  Sterge instructiune
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addInstruction} variant="secondary">
              Adauga pas
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-xl font-medium mb-2">Categorii</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const selected = selectedCats.includes(c.slug);
              return (
                <button
                  key={c.slug}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleCategory(c.slug)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selected
                      ? "bg-primary text-primary-foreground border-transparent shadow"
                      : "bg-transparent text-muted-foreground border-border hover:bg-secondary hover:text-secondary-foreground"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Media */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="block mb-2">Imaginea principala</Label>
            <FileInput
              files={coverFile ? [coverFile] : []}
              onChange={(files) => setCoverFile(files[0] || null)}
              accept="image/*"
            />
          </div>
          <div>
            <Label className="block mb-2">Imagini pentru galerie</Label>
            <FileInput
              multiple
              files={galleryFiles}
              onChange={(files) => setGalleryFiles(files)}
              accept="image/*"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onSubmit}>Creeaza Reteta</Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Anuleaza
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddRecipe;
