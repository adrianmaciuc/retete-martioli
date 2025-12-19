import { useState, useEffect, useCallback } from "react";
import { getFavorites, addFavorite, removeFavorite } from "../lib/favorites";
import { useAuth } from "./useAuth";

export function useFavorites() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load favorites on mount or when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error("Failed to load favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFavorite = useCallback((recipeId: number) => {
    return favorites.includes(recipeId);
  }, [favorites]);

  const toggleFavorite = useCallback(
    async (recipeId: number) => {
      if (!isAuthenticated) {
        return false;
      }

      try {
        if (isFavorite(recipeId)) {
          // Remove favorite
          const favoriteIndex = favorites.indexOf(recipeId);
          if (favoriteIndex > -1) {
            // In a real app, we'd need the favorite ID from the API
            // For now, we'll use the recipeId as a temporary ID
            await removeFavorite(recipeId);
            setFavorites((prev) => prev.filter((id) => id !== recipeId));
          }
        } else {
          // Add favorite
          await addFavorite(recipeId);
          setFavorites((prev) => [...prev, recipeId]);
        }
        return true;
      } catch (error) {
        console.error("Failed to toggle favorite:", error);
        return false;
      }
    },
    [isAuthenticated, isFavorite, favorites]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoading,
    loadFavorites,
  };
}
