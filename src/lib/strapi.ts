import { Recipe } from "./types";
import { sampleRecipes } from "./sample-recipes";

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL as string | undefined;

let backendHealthy = true;
let healthCheckCompleted = false;

export async function checkBackendHealth(): Promise<{
  isHealthy: boolean;
  message: string;
}> {
  if (!STRAPI_URL) {
    return {
      isHealthy: false,
      message: "Backend URL not configured. Loaded sample data.",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Ping root to avoid 400s when content types aren't defined yet
    const res = await fetch(`${STRAPI_URL.replace(/\/$/, "")}/`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      backendHealthy = true;
      healthCheckCompleted = true;
      return {
        isHealthy: true,
        message: "Backend connected successfully.",
      };
    } else {
      backendHealthy = false;
      healthCheckCompleted = true;
      return {
        isHealthy: false,
        message: `Backend returned ${res.status}. Loaded sample data.`,
      };
    }
  } catch (err) {
    backendHealthy = false;
    healthCheckCompleted = true;
    return {
      isHealthy: false,
      message: "Backend not available. Loaded sample data.",
    };
  }
}

export function getBackendStatus(): {
  isHealthy: boolean;
  healthCheckCompleted: boolean;
} {
  return { isHealthy: backendHealthy, healthCheckCompleted };
}

function mapStrapiToRecipe(data: any): Recipe {
  // Defensive mapping: if fields are missing, fall back to reasonable defaults

  // Helper to construct full image URL
  const getImageUrl = (url: any): string => {
    if (!url || typeof url !== "string") return "";
    if (url.startsWith("http")) return url;
    return `${STRAPI_URL}${url}`;
  };

  // Extract tags from object format to array
  const extractTags = (tagsData: any): string[] => {
    if (!tagsData) return [];
    if (Array.isArray(tagsData))
      return tagsData.filter((t) => typeof t === "string");
    if (typeof tagsData === "object") {
      return Object.keys(tagsData).filter(
        (key) => key && typeof key === "string"
      );
    }
    return [];
  };

  return {
    id: String(data.id ?? data.documentId ?? Math.random()),
    slug: data.slug ?? String(data.id ?? ""),
    title: data.title ?? "Untitled",
    description: data.description ?? "",
    coverImage: getImageUrl(
      data.coverImage?.formats?.medium?.url ||
        data.coverImage?.formats?.small?.url ||
        data.coverImage?.url
    ),
    galleryImages: (data.galleryImages || []).map((img: any) =>
      getImageUrl(
        img?.formats?.medium?.url || img?.formats?.small?.url || img?.url
      )
    ),
    ingredients: (data.ingredients || []).map((ing: any, idx: number) => ({
      id: String(ing.id ?? idx),
      item: ing.item ?? "",
      quantity: ing.quantity ?? "",
      unit: ing.unit ?? "",
      notes: ing.notes ?? "",
    })),
    instructions: (data.instructions || []).map((ins: any, idx: number) => ({
      id: String(ins.id ?? idx),
      stepNumber: ins.stepNumber ?? idx + 1,
      description: ins.description ?? "",
      image: ins.image?.url ? getImageUrl(ins.image.url) : undefined,
      tips: ins.tips ?? undefined,
    })),
    prepTime: Number(data.prepTime ?? 0),
    cookTime: Number(data.cookTime ?? 0),
    servings: Number(data.servings ?? 1),
    difficulty: (data.difficulty ?? "Medium") as any,
    categories: (data.categories || []).map((c: any) => ({
      id: String(c.id ?? c.documentId),
      name: c.name ?? "Unknown",
      slug: c.slug ?? String(c.id ?? ""),
    })),
    tags: extractTags(data.tags),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as Recipe;
}

export async function getRecipes(): Promise<Recipe[]> {
  if (!STRAPI_URL) {
    return Promise.resolve(sampleRecipes);
  }

  try {
    const res = await fetch(
      `${STRAPI_URL.replace(/\/$/, "")}/api/recipes?populate=*`
    );
    if (!res.ok) {
      backendHealthy = false;
      return sampleRecipes;
    }
    const json = await res.json();
    const data = json.data || [];
    backendHealthy = true;
    return data.map((item: any) => mapStrapiToRecipe(item));
  } catch (err) {
    backendHealthy = false;
    return sampleRecipes;
  }
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  if (!STRAPI_URL) {
    return Promise.resolve(sampleRecipes.find((r) => r.slug === slug) ?? null);
  }

  try {
    const res = await fetch(
      `${STRAPI_URL.replace(/\/$/, "")}/api/recipes?filters[slug][$eq]=${encodeURIComponent(
        slug
      )}&populate=*`
    );
    if (!res.ok) {
      backendHealthy = false;
      return sampleRecipes.find((r) => r.slug === slug) ?? null;
    }
    const json = await res.json();
    const item = json.data?.[0];
    if (!item) {
      return null;
    }
    backendHealthy = true;
    return mapStrapiToRecipe(item);
  } catch (err) {
    backendHealthy = false;
    return sampleRecipes.find((r) => r.slug === slug) ?? null;
  }
}

export async function getCategories(): Promise<
  { id: string; name: string; slug: string }[]
> {
  if (!STRAPI_URL) {
    return Promise.resolve([
      { id: "italian", name: "Italian", slug: "italian" },
      { id: "seafood", name: "Seafood", slug: "seafood" },
      { id: "thai", name: "Thai", slug: "thai" },
      { id: "desserts", name: "Desserts", slug: "desserts" },
      { id: "healthy", name: "Healthy", slug: "healthy" },
    ]);
  }

  try {
    const res = await fetch(`${STRAPI_URL.replace(/\/$/, "")}/api/categories`);
    if (!res.ok) {
      backendHealthy = false;
      return [];
    }
    const json = await res.json();
    const categories = (json.data || []).map((c: any) => ({
      id: String(c.id ?? c.documentId ?? ""),
      name: c.name ?? "Unknown",
      slug: c.slug ?? `cat-${c.id}`,
    }));
    backendHealthy = true;
    return categories;
  } catch (err) {
    backendHealthy = false;
    return [];
  }
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const q = (query || "").trim();
  if (!q) return getRecipes();

  if (!STRAPI_URL) {
    const lower = q.toLowerCase();
    return sampleRecipes.filter(
      (r) =>
        r.title.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower) ||
        r.tags.some((t) => t.toLowerCase().includes(lower)) ||
        r.ingredients.some((ing) => ing.item.toLowerCase().includes(lower)) ||
        r.instructions.some((ins) =>
          (ins.description || "").toLowerCase().includes(lower)
        )
    );
  }

  try {
    // Try server-side filtering on common fields (title, description, tags)
    const encoded = encodeURIComponent(q);
    const url = `${STRAPI_URL.replace(
      /\/$/,
      ""
    )}/api/recipes?filters[$or][0][title][$containsi]=${encoded}&filters[$or][1][description][$containsi]=${encoded}&filters[$or][2][tags][$containsi]=${encoded}&populate=*`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Strapi responded ${res.status}`);
    const json = await res.json();
    const data = json.data || [];

    if (data.length > 0) {
      return data.map((item: any) => mapStrapiToRecipe(item));
    }

    const all = await getRecipes();
    const lower = q.toLowerCase();
    return all.filter(
      (r) =>
        r.title.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower) ||
        r.tags.some((t) => t.toLowerCase().includes(lower)) ||
        r.ingredients.some((ing) => ing.item.toLowerCase().includes(lower)) ||
        r.instructions.some((ins) =>
          (ins.description || "").toLowerCase().includes(lower)
        )
    );
  } catch (err) {
    const lower = q.toLowerCase();
    return (await getRecipes()).filter(
      (r) =>
        r.title.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower) ||
        r.tags.some((t) => t.toLowerCase().includes(lower)) ||
        r.ingredients.some((ing) => ing.item.toLowerCase().includes(lower)) ||
        r.instructions.some((ins) =>
          (ins.description || "").toLowerCase().includes(lower)
        )
    );
  }
}
