import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { usePokemon } from '../hooks/usePokemon';
import { PokemonCard } from '../components/PokemonCard';
import { Pokemon } from '../types/pokemon';
import { RootStackParamList } from '../navigation';
import { typeColors, allTypes } from '../constants/typeColors';
import { useFavoritesContext } from '../context/FavoritesContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type HomeRouteProp = RouteProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<HomeRouteProp>();
  const { pokemonList, loading, error, refetch } = usePokemon();
  const { favorites } = useFavoritesContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);

  useEffect(() => {
    const preselected = route.params?.startCompareWith;
    if (preselected) {
      setCompareMode(true);
      setSelectedForCompare([preselected]);
      navigation.setParams({ startCompareWith: undefined });
    }
  }, [route.params?.startCompareWith]);

  const filteredPokemon = useMemo(() => {
    let result = pokemonList;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((p) => p.name.includes(query));
    }

    if (selectedTypes.length > 0) {
      result = result.filter((p) =>
        p.types.some((t) => selectedTypes.includes(t.type.name))
      );
    }

    if (showFavoritesOnly) {
      result = result.filter((p) => favorites.includes(p.id));
    }

    return result;
  }, [pokemonList, searchQuery, selectedTypes, showFavoritesOnly, favorites]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handlePokemonPress = useCallback((pokemon: Pokemon) => {
    if (compareMode) {
      setSelectedForCompare((prev) => {
        if (prev.includes(pokemon.id)) {
          return prev.filter((id) => id !== pokemon.id);
        }
        if (prev.length >= 2) {
          return [prev[1], pokemon.id];
        }
        return [...prev, pokemon.id];
      });
    } else {
      navigation.navigate('Detail', { pokemonId: pokemon.id });
    }
  }, [compareMode, navigation]);

  const toggleCompareMode = () => {
    setCompareMode((prev) => !prev);
    setSelectedForCompare([]);
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      navigation.navigate('Compare', {
        pokemonId1: selectedForCompare[0],
        pokemonId2: selectedForCompare[1],
      });
      setCompareMode(false);
      setSelectedForCompare([]);
    }
  };

  const renderItem = ({ item }: { item: Pokemon }) => (
    <PokemonCard
      pokemon={item}
      onPress={handlePokemonPress}
      selected={selectedForCompare.includes(item.id)}
      compareMode={compareMode}
    />
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Loading Pokemon...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF0000" />
      <View style={styles.header}>
        <Text style={styles.title}>Pokedex</Text>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Pokemon..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeChips}
          >
            {allTypes.map((type) => {
              const isSelected = selectedTypes.includes(type);
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: typeColors[type],
                      opacity: selectedTypes.length === 0 || isSelected ? 1 : 0.4,
                    },
                  ]}
                  onPress={() => toggleType(type)}
                >
                  <Text style={styles.typeChipText}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.favoritesToggle,
              showFavoritesOnly && styles.favoritesToggleActive,
            ]}
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Text style={styles.favoritesToggleIcon}>
              {showFavoritesOnly ? '★' : '☆'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.compareToggle,
              compareMode && styles.compareToggleActive,
            ]}
            onPress={toggleCompareMode}
          >
            <Text style={styles.compareToggleIcon}>VS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredPokemon.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.noResultsIcon}>🔍</Text>
          <Text style={styles.noResultsText}>No Pokemon found</Text>
          <Text style={styles.noResultsSubtext}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPokemon}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={[
            styles.list,
            compareMode && { paddingBottom: 100 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {compareMode && selectedForCompare.length > 0 && (
        <View style={styles.compareBar}>
          {[0, 1].map((slot) => {
            const id = selectedForCompare[slot];
            const pokemon = id ? pokemonList.find((p) => p.id === id) : null;
            return (
              <View key={slot} style={styles.compareSlot}>
                {pokemon ? (
                  <View style={styles.compareSlotFilled}>
                    <Image
                      source={{
                        uri:
                          pokemon.sprites.other['official-artwork'].front_default ||
                          pokemon.sprites.front_default,
                      }}
                      style={styles.compareSlotImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.compareSlotName} numberOfLines={1}>
                      {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedForCompare((prev) => prev.filter((i) => i !== id))
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.compareSlotRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.compareSlotEmpty}>
                    <Text style={styles.compareSlotPlaceholder}>?</Text>
                  </View>
                )}
              </View>
            );
          })}
          <TouchableOpacity
            style={[
              styles.compareButton,
              selectedForCompare.length < 2 && styles.compareButtonDisabled,
            ]}
            onPress={handleCompare}
            disabled={selectedForCompare.length < 2}
          >
            <Text
              style={[
                styles.compareButtonText,
                selectedForCompare.length < 2 && styles.compareButtonTextDisabled,
              ]}
            >
              Compare
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF0000',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    fontSize: 16,
    color: '#999',
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  typeChips: {
    gap: 6,
    paddingRight: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeChipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  favoritesToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  favoritesToggleActive: {
    backgroundColor: '#FFD700',
  },
  favoritesToggleIcon: {
    fontSize: 18,
    color: '#fff',
  },
  list: {
    padding: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
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
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  compareToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  compareToggleActive: {
    backgroundColor: '#FF0000',
  },
  compareToggleIcon: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '900',
  },
  compareBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    gap: 8,
  },
  compareSlot: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
  },
  compareSlotFilled: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  compareSlotImage: {
    width: 36,
    height: 36,
  },
  compareSlotName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  compareSlotRemove: {
    fontSize: 14,
    color: '#999',
    padding: 4,
  },
  compareSlotEmpty: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  compareSlotPlaceholder: {
    fontSize: 20,
    color: '#ccc',
    fontWeight: 'bold',
  },
  compareButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  compareButtonDisabled: {
    backgroundColor: '#ccc',
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  compareButtonTextDisabled: {
    color: '#999',
  },
});