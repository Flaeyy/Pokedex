import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typeColors } from '../constants/typeColors';

interface TypeBadgeProps {
  types: string[];
}

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