import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Pokemon } from '../types/pokemon';
import { typeColors } from '../constants/typeColors';
import { useFavoritesContext } from '../context/FavoritesContext';

interface PokemonCardProps {
  pokemon: Pokemon;
  onPress?: (pokemon: Pokemon) => void;
  selected?: boolean;
  compareMode?: boolean;
}

const getTypeColor = (type: string): string => {
  return typeColors[type] || '#A8A878';
};

export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onPress, selected, compareMode }) => {
  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const backgroundColor = getTypeColor(primaryType);
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const favorite = isFavorite(pokemon.id);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor },
        selected && styles.cardSelected,
      ]}
      onPress={() => onPress?.(pokemon)}
      activeOpacity={0.8}
    >
      {compareMode && (
        <View style={[styles.checkCircle, selected && styles.checkCircleActive]}>
          {selected && <Text style={styles.checkMark}>✓</Text>}
        </View>
      )}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(pokemon.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.favoriteIcon}>
          {favorite ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
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
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  favoriteIcon: {
    fontSize: 20,
    color: '#FFD700',
  },
  cardSelected: {
    borderWidth: 3,
    borderColor: '#FFD700',
    transform: [{ scale: 0.96 }],
  },
  checkCircle: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  checkMark: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
});