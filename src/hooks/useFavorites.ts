import { useState, useEffect, useCallback } from 'react';
import { File, Paths } from 'expo-file-system';

const favoritesFile = new File(Paths.document, 'favorites.json');

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        if (favoritesFile.exists) {
          const content = await favoritesFile.text();
          setFavorites(JSON.parse(content));
        }
      } catch (e) {
        console.error('Failed to load favorites:', e);
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, []);

  const persistFavorites = useCallback((ids: number[]) => {
    try {
      if (!favoritesFile.exists) {
        favoritesFile.create({ intermediates: true });
      }
      favoritesFile.write(JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  }, []);

  const toggleFavorite = useCallback((pokemonId: number) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(pokemonId)
        ? prev.filter((id) => id !== pokemonId)
        : [...prev, pokemonId];
      persistFavorites(newFavorites);
      return newFavorites;
    });
  }, [persistFavorites]);

  const isFavorite = useCallback(
    (pokemonId: number) => favorites.includes(pokemonId),
    [favorites]
  );

  return { favorites, loading, toggleFavorite, isFavorite };
};
