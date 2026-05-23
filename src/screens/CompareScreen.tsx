import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pokemon } from '../types/pokemon';
import { getPokemonById } from '../services/pokeApi';
import { TypeBadge } from '../components/TypeBadge';
import { RootStackParamList } from '../navigation';
import { typeColors } from '../constants/typeColors';

const statDisplay: Record<string, { label: string; color: string }> = {
  hp: { label: 'HP', color: '#FF5959' },
  attack: { label: 'ATK', color: '#F5AC78' },
  defense: { label: 'DEF', color: '#FAE078' },
  'special-attack': { label: 'S.ATK', color: '#9DB7F5' },
  'special-defense': { label: 'S.DEF', color: '#A7DB8D' },
  speed: { label: 'SPD', color: '#FAAD94' },
};

type Props = NativeStackScreenProps<RootStackParamList, 'Compare'>;

export const CompareScreen: React.FC<Props> = ({ route, navigation }) => {
  const { pokemonId1, pokemonId2 } = route.params;
  const [pokemon1, setPokemon1] = useState<Pokemon | null>(null);
  const [pokemon2, setPokemon2] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const { width: screenWidth } = useWindowDimensions();
  const imageSize = Math.min(screenWidth * 0.28, 120);

  useEffect(() => {
    const fetchBoth = async () => {
      try {
        const [p1, p2] = await Promise.all([
          getPokemonById(pokemonId1),
          getPokemonById(pokemonId2),
        ]);
        setPokemon1(p1);
        setPokemon2(p2);
      } catch (error) {
        console.error('Error fetching pokemon:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoth();
  }, [pokemonId1, pokemonId2]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Loading comparison...</Text>
      </View>
    );
  }

  if (!pokemon1 || !pokemon2) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Pokemon not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryButton}>
          <Text style={styles.retryText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const bg1 = typeColors[pokemon1.types[0]?.type.name || 'normal'] || '#A8A878';
  const bg2 = typeColors[pokemon2.types[0]?.type.name || 'normal'] || '#A8A878';

  const total1 = pokemon1.stats.reduce((sum, s) => sum + s.base_stat, 0);
  const total2 = pokemon2.stats.reduce((sum, s) => sum + s.base_stat, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pokémon Compare</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsRow}>
          <View style={[styles.pokeCard, { borderColor: bg1 }]}>
            <View style={[styles.pokeHeader, { backgroundColor: bg1 }]}>
              <Image
                source={{
                  uri:
                    pokemon1.sprites.other['official-artwork'].front_default ||
                    pokemon1.sprites.front_default,
                }}
                style={[styles.pokeImage, { width: imageSize, height: imageSize }]}
                resizeMode="contain"
              />
            </View>
            <View style={styles.pokeBody}>
              <Text style={styles.pokeId}>
                #{String(pokemon1.id).padStart(3, '0')}
              </Text>
              <Text style={styles.pokeName} numberOfLines={1}>
                {pokemon1.name.charAt(0).toUpperCase() + pokemon1.name.slice(1)}
              </Text>
              <TypeBadge types={pokemon1.types.map((t) => t.type.name)} />
            </View>
          </View>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={[styles.pokeCard, { borderColor: bg2 }]}>
            <View style={[styles.pokeHeader, { backgroundColor: bg2 }]}>
              <Image
                source={{
                  uri:
                    pokemon2.sprites.other['official-artwork'].front_default ||
                    pokemon2.sprites.front_default,
                }}
                style={[styles.pokeImage, { width: imageSize, height: imageSize }]}
                resizeMode="contain"
              />
            </View>
            <View style={styles.pokeBody}>
              <Text style={styles.pokeId}>
                #{String(pokemon2.id).padStart(3, '0')}
              </Text>
              <Text style={styles.pokeName} numberOfLines={1}>
                {pokemon2.name.charAt(0).toUpperCase() + pokemon2.name.slice(1)}
              </Text>
              <TypeBadge types={pokemon2.types.map((t) => t.type.name)} />
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Base Stats Comparison</Text>

          <View style={styles.statsLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#333' }]} />
              <Text style={styles.legendText}>P1</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#888' }]} />
              <Text style={styles.legendText}>P2</Text>
            </View>
          </View>

          {pokemon1.stats.map((stat1, index) => {
            const stat2 = pokemon2.stats[index];
            const name = stat1.stat.name;
            const display = statDisplay[name] || { label: name, color: '#999' };
            const pct1 = Math.min((stat1.base_stat / 255) * 100, 100);
            const pct2 = Math.min((stat2.base_stat / 255) * 100, 100);

            return (
              <View key={name} style={styles.statRow}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>{display.label}</Text>
                </View>

                <View style={styles.statBars}>
                  <View style={styles.barRow}>
                    <Text style={styles.val1}>{stat1.base_stat}</Text>
                    <View style={styles.barBg}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${pct1}%`,
                            backgroundColor: display.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.barRow}>
                    <Text style={styles.val2}>{stat2.base_stat}</Text>
                    <View style={styles.barBg}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${pct2}%`,
                            backgroundColor: display.color,
                            opacity: 0.45,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.sectionTitle}>Total Base Stats</Text>
          <View style={styles.totalsRow}>
            <View style={[styles.totalBox, { borderLeftColor: bg1 }]}>
              <Text style={styles.totalValue}>{total1}</Text>
            </View>
            <Text style={styles.totalDivider}>—</Text>
            <View style={[styles.totalBox, { borderLeftColor: bg2 }]}>
              <Text style={styles.totalValue}>{total2}</Text>
            </View>
          </View>
          {total1 > total2 && (
            <View style={[styles.winnerBadge, { backgroundColor: bg1 }]}>
              <Text style={styles.winnerText}>
                {pokemon1.name.charAt(0).toUpperCase() + pokemon1.name.slice(1)} wins!
              </Text>
            </View>
          )}
          {total2 > total1 && (
            <View style={[styles.winnerBadge, { backgroundColor: bg2 }]}>
              <Text style={styles.winnerText}>
                {pokemon2.name.charAt(0).toUpperCase() + pokemon2.name.slice(1)} wins!
              </Text>
            </View>
          )}
          {total1 === total2 && (
            <View style={[styles.winnerBadge, { backgroundColor: '#666' }]}>
              <Text style={styles.winnerText}>It's a tie!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#16213e',
  },
  backButton: {
    width: 70,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#aaa',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    gap: 6,
  },
  pokeCard: {
    flex: 1,
    maxWidth: 150,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#16213e',
    overflow: 'hidden',
  },
  pokeHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  pokeImage: {
    width: 90,
    height: 90,
  },
  pokeBody: {
    padding: 10,
    alignItems: 'center',
  },
  pokeId: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  pokeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
    marginBottom: 6,
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF0000',
    letterSpacing: 2,
  },
  statsSection: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  statsLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#888',
  },
  statRow: {
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ccc',
  },
  statBars: {
    gap: 3,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  val1: {
    width: 32,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
  },
  val2: {
    width: 32,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    textAlign: 'right',
  },
  barBg: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    borderRadius: 5,
  },
  totalSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 40,
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  totalBox: {
    alignItems: 'center',
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 8,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  totalDivider: {
    fontSize: 24,
    color: '#555',
    fontWeight: 'bold',
  },
  winnerBadge: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  winnerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
