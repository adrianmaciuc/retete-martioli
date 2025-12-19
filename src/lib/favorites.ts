import { authenticatedFetch } from "./auth";

export interface Favorite {
  id: number;
  recipeId: number;
  userId: number;
  favoritedAt: string;
}

/**
 * Get all favorites for current user
 */
export const getFavorites = async (): Promise<number[]> => {
  try {
    const response = await authenticatedFetch("/api/favorites");
    if (!response.ok) {
      throw new Error("Failed to fetch favorites");
    }
    const data = await response.json();
    const favorites = Array.isArray(data) ? data : data.data || [];
    return favorites.map((fav: any) => fav.recipe?.id || fav.recipeId).filter(Boolean);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};

/**
 * Add recipe to favorites
 */
export const addFavorite = async (recipeId: number): Promise<boolean> => {
  try {
    const response = await authenticatedFetch("/api/favorites", {
      method: "POST",
      body: JSON.stringify({
        recipe: recipeId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add favorite");
    }
    return true;
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
};

/**
 * Remove recipe from favorites
 */
export const removeFavorite = async (favoriteId: number): Promise<boolean> => {
  try {
    const response = await authenticatedFetch(`/api/favorites/${favoriteId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to remove favorite");
    }
    return true;
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
};

/**
 * Check if recipe is favorited by finding it in user's favorite list
 */
export const isFavorited = async (recipeId: number): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.includes(recipeId);
};
