import { useState, useEffect } from 'react';
import { Pokemon } from '../types/pokemon';
import { getPokemonList } from '../services/pokeApi';

export const usePokemon = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPokemon = async () => {
    try {
      setLoading(true);
      const data = await getPokemonList(200);
      setPokemonList(data);
    } catch (err) {
      setError('Failed to fetch Pokemon');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemon();
  }, []);

  return { pokemonList, loading, error, refetch: fetchPokemon };
};