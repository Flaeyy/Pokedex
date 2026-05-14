import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatBarProps {
  name: string;
  value: number;
  color: string;
}

const statColors: Record<string, string> = {
  hp: '#FF5959',
  attack: '#F5AC78',
  defense: '#FAE078',
  'special-attack': '#9DB7F5',
  'special-defense': '#A7DB8D',
  speed: '#FAAD94',
};

export const StatBar: React.FC<StatBarProps> = ({ name, value, color }) => {
  const barColor = statColors[name] || color;
  const percentage = Math.min((value / 255) * 100, 100);

  return (
    <View style={styles.container}>
      <Text style={styles.statName}>{name.toUpperCase()}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  statName: {
    width: 100,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  statValue: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginLeft: 8,
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
});