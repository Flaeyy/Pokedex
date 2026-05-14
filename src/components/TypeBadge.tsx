import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TypeBadgeProps {
  types: string[];
}

const typeColors: Record<string, string> = {
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
  normal: '#A8A878',
};

export const TypeBadge: React.FC<TypeBadgeProps> = ({ types }) => {
  return (
    <View style={styles.container}>
      {types.map((type, index) => (
        <View
          key={index}
          style={[styles.badge, { backgroundColor: typeColors[type] || '#A8A878' }]}
        >
          <Text style={styles.text}>{type.toUpperCase()}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});