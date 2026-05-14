import { Pokemon, PokemonListResponse } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const getPokemonList = async (limit: number = 200): Promise<Pokemon[]> => {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}`);
  const data: PokemonListResponse = await response.json();

  const pokemonDetails = await Promise.all(
    data.results.map(async (pokemon) => {
      const res = await fetch(pokemon.url);
      const pokeData = await res.json();
      pokeData.abilities = pokeData.abilities.map((a: any) => ({
        ...a,
        is_hidden: Boolean(a.is_hidden),
      }));
      return pokeData;
    })
  );

  return pokemonDetails;
};

export const getPokemonByName = async (name: string): Promise<Pokemon> => {
  const response = await fetch(`${BASE_URL}/pokemon/${name}`);
  return response.json();
};

export const getPokemonById = async (id: number): Promise<Pokemon> => {
  const response = await fetch(`${BASE_URL}/pokemon/${id}`);
  const data = await response.json();
  data.abilities = data.abilities.map((a: any) => ({
    ...a,
    is_hidden: Boolean(a.is_hidden),
  }));
  return data as Pokemon;
};