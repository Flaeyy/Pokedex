import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Pokemon } from '../types/pokemon';

interface PokemonCardProps {
  pokemon: Pokemon;
  onPress?: (pokemon: Pokemon) => void;
}

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    fire: '#F08030',
    water: '#6890F0',
    grass: '#78C850',
    electric: '#F8D030',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };
  return colors[type] || '#A8A878';
};

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onPress }) => {
  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const backgroundColor = getTypeColor(primaryType);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      onPress={() => onPress?.(pokemon)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.id}>#{pokemon.id.toString().padStart(3, '0')}</Text>
      <Text style={styles.name}>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</Text>
      <View style={styles.typesContainer}>
        {pokemon.types.map((t) => (
          <View key={t.slot} style={styles.typeBadge}>
            <Text style={styles.typeText}>{t.type.name}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 180,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: 100,
    height: 100,
  },
  id: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginTop: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  typesContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});