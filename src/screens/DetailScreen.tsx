import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pokemon } from '../types/pokemon';
import { getPokemonById } from '../services/pokeApi';
import { StatBar } from '../components/StatBar';
import { TypeBadge } from '../components/TypeBadge';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

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

export const DetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { pokemonId } = route.params;
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const data = await getPokemonById(pokemonId);
        setPokemon(data);
      } catch (error) {
        console.error('Error fetching pokemon:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPokemon();
  }, [pokemonId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  if (!pokemon) {
    return (
      <View style={styles.center}>
        <Text>Pokemon not found</Text>
      </View>
    );
  }

  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const backgroundColor = typeColors[primaryType] || '#A8A878';
  const types = pokemon.types.map((t) => t.type.name);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.id}>#{pokemon.id.toString().padStart(3, '0')}</Text>
        <Text style={styles.name}>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Text>
        <TypeBadge types={types} />
      </View>

      <ScrollView style={styles.content}>
        <Image
          source={{
            uri: pokemon.sprites.other['official-artwork'].front_default ||
                 pokemon.sprites.front_default,
          }}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Height</Text>
            <Text style={styles.infoValue}>{(pokemon.height / 10).toFixed(1)} m</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Weight</Text>
            <Text style={styles.infoValue}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
          </View>
        </View>

        <View style={styles.abilitiesContainer}>
          <Text style={styles.sectionTitle}>Abilities</Text>
          <View style={styles.abilitiesRow}>
            {pokemon.abilities.map((ability, index) => {
              const isHidden = ability.is_hidden;
              return (
                <View
                  key={index}
                  style={[
                    styles.abilityBadge,
                    isHidden ? styles.hiddenAbility : null,
                  ]}
                >
                  <Text style={styles.abilityText}>
                    {ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1)}
                  </Text>
                  {isHidden ? (
                    <Text style={styles.hiddenTag}>Hidden</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Base Stats</Text>
          {pokemon.stats.map((stat) => (
            <StatBar
              key={stat.stat.name}
              name={stat.stat.name}
              value={stat.base_stat}
              color={backgroundColor}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
  },
  backText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  id: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  abilitiesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  abilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  abilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  hiddenAbility: {
    backgroundColor: '#D4A4A4',
  },
  abilityText: {
    fontSize: 14,
    color: '#333',
  },
  hiddenTag: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  statsContainer: {
    marginBottom: 40,
  },
});