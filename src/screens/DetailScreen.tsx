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
import { typeColors } from '../constants/typeColors';
import { useFavoritesContext } from '../context/FavoritesContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export const DetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { pokemonId } = route.params;
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavoritesContext();

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
  const favorite = isFavorite(pokemon.id);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleFavorite(pokemon.id)}
          style={styles.favoriteButton}
        >
          <Text style={styles.favoriteIcon}>
            {favorite ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Home', { startCompareWith: pokemon.id });
          }}
          style={styles.compareButton}
        >
          <Text style={styles.compareIcon}>VS</Text>
        </TouchableOpacity>
        <Text style={styles.id}>#{pokemon.id.toString().padStart(3, '0')}</Text>
        <Text style={styles.name}>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Text>
        <TypeBadge types={types} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: pokemon.sprites.other['official-artwork'].front_default ||
                   pokemon.sprites.front_default,
            }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Height</Text>
            <Text style={styles.infoValue}>{(pokemon.height / 10).toFixed(1)} m</Text>
          </View>
          <View style={styles.infoDivider} />
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
  favoriteButton: {
    position: 'absolute',
    right: 20,
    top: 50,
  },
  favoriteIcon: {
    fontSize: 28,
    color: '#FFD700',
  },
  compareButton: {
    position: 'absolute',
    right: 60,
    top: 50,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareIcon: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -10,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: -80,
    marginBottom: 8,
  },
  image: {
    width: 240,
    height: 240,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ddd',
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