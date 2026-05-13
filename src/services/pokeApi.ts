import { Pokemon, PokemonListResponse } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const getPokemonList = async (limit: number = 20): Promise<Pokemon[]> => {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}`);
  const data: PokemonListResponse = await response.json();

  const pokemonDetails = await Promise.all(
    data.results.map(async (pokemon) => {
      const res = await fetch(pokemon.url);
      return res.json();
    })
  );

  return pokemonDetails;
};

export const getPokemonByName = async (name: string): Promise<Pokemon> => {
  const response = await fetch(`${BASE_URL}/pokemon/${name}`);
  return response.json();
};