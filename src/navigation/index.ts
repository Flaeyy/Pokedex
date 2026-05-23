export type RootStackParamList = {
  Home: { startCompareWith?: number } | undefined;
  Detail: { pokemonId: number };
  Compare: { pokemonId1: number; pokemonId2: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}