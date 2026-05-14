export type RootStackParamList = {
  Home: undefined;
  Detail: { pokemonId: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}