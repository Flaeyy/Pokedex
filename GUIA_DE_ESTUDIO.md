# Guía de Estudio - Proyecto Pokédex

> **Stack:** React Native + Expo + TypeScript | **API:** PokeAPI v2 | **Navegación:** React Navigation

---

## 1. Estructura del Proyecto

 + "" + "" + "" + 
src/
├── components/          # Componentes reutilizables de UI
│   ├── PokemonCard.tsx   # Tarjeta de Pokémon en la cuadrícula
│   ├── StatBar.tsx       # Barra animada de estadísticas
│   └── TypeBadge.tsx     # Etiquetas de tipos (Fire, Water, etc.)
├── constants/
│   └── typeColors.ts     # Mapa de colores por tipo de Pokémon
├── context/
│   └── FavoritesContext.tsx  # Contexto global de favoritos
├── hooks/
│   ├── useFavorites.ts   # Lógica de favoritos + persistencia
│   └── usePokemon.ts     # Hook para obtener lista de Pokémon
├── navigation/
│   └── index.ts          # Tipos de parámetros del Stack Navigator
├── screens/
│   ├── DetailScreen.tsx  # Pantalla de detalle de un Pokémon
│   └── HomeScreen.tsx    # Pantalla principal (grid, búsqueda, filtros)
├── services/
│   └── pokeApi.ts        # Capa HTTP para consumir PokeAPI
└── types/
    └── pokemon.ts        # Interfaces TypeScript de los datos
 + "" + "" + "" + 

---

## 2. Interfaces y Tipos TypeScript

###  + "" + "src/types/pokemon.ts" + "" + 

Se definen tres interfaces principales que modelan la respuesta de la API:

| Interfaz | Propósito |
|---|---|
| **Pokemon** | Estructura completa (id, name, height, weight, sprites, types, stats, abilities). **Es la interfaz central del proyecto.** |
| **PokemonListItem** | Elemento individual del endpoint de lista ({ name, url }). |
| **PokemonListResponse** | Respuesta del endpoint GET /pokemon?limit=N (count, results[]). |

###  + "" + "src/navigation/index.ts" + "" + 

Define los tipos del Stack Navigator. Al navegar a Detail, TypeScript exige pasar pokemonId como número.

###  + "" + "src/context/FavoritesContext.tsx" + "" + 

Define FavoritesContextType con: favorites (number[]), loading (boolean), toggleFavorite (función), isFavorite (función).

### Props de componentes

- **PokemonCardProps**: { pokemon: Pokemon; onPress?: (pokemon: Pokemon) => void }
- **TypeBadgeProps**: { types: string[] }
- **StatBarProps**: { name: string; value: number; color: string }

---

## 3. Cómo se Obtienen los Pokémon (API Calls)

### Capa de servicio:  + "" + "src/services/pokeApi.ts" + "" + 

Toda la comunicación con PokeAPI se centraliza aquí, usando fetch() nativo.

| Función | Qué hace |
|---|---|
| **getPokemonList(limit = 200)** | Primero obtiene la lista de nombres/URLs, luego hace 200 peticiones individuales EN PARALELO con Promise.all(). Retorna Pokemon[]. |
| **getPokemonByName(name)** | Obtiene un Pokémon por su nombre exacto. |
| **getPokemonById(id)** | Obtiene un Pokémon por ID numérico. Normaliza is_hidden a booleano. Usado en DetailScreen. |

### Flujo de datos

1. **usePokemon()** (hook) se ejecuta al montar HomeScreen.
2. Dispara **getPokemonList(200)**.
3. Mientras carga: **loading = true**, muestra spinner.
4. Si falla: muestra error + botón **Reintentar** (llama a refetch).
5. Al completar: guarda los 200 Pokémon en estado y los renderiza.

---

## 4. Cómo Funciona la Búsqueda

**Ubicación:** HomeScreen.tsx

- Es una búsqueda **LOCAL** sobre los 200 Pokémon ya descargados (NO hace más llamadas a la API).
- Busca sobre el campo **name** del Pokémon.
- Es **insensible a mayúsculas/minúsculas** (todo se convierte a minúsculas).
- Es por **SUBCADENA** (name.includes(query)), no solo por prefijo.
  - Ej: buscar "char" encuentra Charizard, Charmander, Charjabug, etc.
- Se ejecuta **en cada tecla presionada** (sin debounce), usando useMemo para eficiencia.
- Botón de limpiar (X) que resetea el searchQuery.

### Flujo de búsqueda:
1. TextInput captura el texto en estado **searchQuery**.
2. **useMemo** recalcula filteredPokemon cuando cambia searchQuery.
3. Si searchQuery está vacío: no se aplica filtro de búsqueda.
4. Si tiene texto: filtra con includes() sobre el nombre.
5. La búsqueda se **combina** con los otros filtros (tipo y favoritos).

---

## 5. Cómo Funciona el Filtro por Tipo

### El filtro

- Mantiene un array **selectedTypes: string[]** con los tipos seleccionados.
- El filtro usa: **pokemon.types.some(t => selectedTypes.includes(t.type.name))**
- Esto significa: muestra Pokémon que tengan **AL MENOS UNO** de los tipos elegidos.
- Si selectedTypes está vacío: **no se filtra por tipo** (se muestran todos).
- Está dentro del mismo **useMemo** que la búsqueda y favoritos (filtros acumulativos).

### La UI de los chips

- **ScrollView horizontal** con 18 botones (TouchableOpacity), uno por cada tipo.
- Los 18 tipos vienen de **Object.keys(typeColors)**.
- Al tocar un chip, **toggleType(type)** lo agrega/quita de selectedTypes.
- Efecto visual:
  - Sin tipos seleccionados: todos a 100% opacidad.
  - Con tipos seleccionados: los activos a 100%, los inactivos a 40%.

### typeColors.ts

Un Record<string, string> que mapea tipo a color hexadecimal (ej: fire='#F08030'). Se usa en:
- Chips de filtro
- Color de fondo de PokemonCard
- Color de fondo de DetailScreen
- TypeBadge

---

## 6. Cómo Funciona el Sistema de Favoritos

Usa un **PATRÓN DE DOS CAPAS:**

### Capa 1: Hook useFavorites ( + "" + "src/hooks/useFavorites.ts" + "" + ")

| Responsabilidad | Detalle |
|---|---|
| **Estado** | Array favorites: number[] con IDs de Pokémon marcados. |
| **Persistencia** | Usa expo-file-system (File API) para guardar/cargar favorites.json en el directorio de documentos. |
| **Carga inicial** | Lee favorites.json si existe; si no, inicia vacío. |
| **toggleFavorite(id)** | Si el ID ya está: lo quita. Si no: lo agrega. Después persiste al archivo. |
| **isFavorite(id)** | Retorna true/false según esté en el array. |
| **Optimización** | useCallback para no recrear funciones. Función updater en setFavorites para evitar estado stale. |

### Capa 2: Contexto FavoritesContext ( + "" + "src/context/FavoritesContext.tsx" + "" + ")

- Envuelve useFavorites en un React Context accesible desde toda la app.
- **FavoritesProvider** se coloca en App.tsx como wrapper raíz.
- **useFavoritesContext()** es un hook que consume el contexto (error si se usa fuera del provider).

### Dónde se usan los favoritos

| Lugar | Cómo |
|---|---|
| **HomeScreen** | Botón estrella en header activa showFavoritesOnly. El useMemo filtra: favorites.includes(p.id). |
| **PokemonCard** | Estrella en cada tarjeta (dorada = fav, hueca = no). Al tocar: toggleFavorite(id). |
| **DetailScreen** | Estrella en header. Misma lógica: dorada/hueca, toggle al presionar. |

### Flujo resumido:
Usuario toca estrella → toggleFavorite(id) → actualiza estado → persiste a JSON → UI re-renderiza
Usuario activa filtro → showFavoritesOnly=true → useMemo filtra → solo favoritos visibles

---

## 7. Pantallas Principales

### HomeScreen ( + "" + "src/screens/HomeScreen.tsx" + "" + ")

**Layout:**
- Header: título "Pokédex" + botón de favoritos (estrella).
- Barra de búsqueda: TextInput con ícono lupa y botón limpiar.
- Chips de tipos: ScrollView horizontal con los 18 tipos.
- Grid: FlatList con numColumns=2 renderizando PokemonCard.

**Estados manejados:**
| Estado | Qué muestra |
|---|---|
| loading | "Cargando Pokédex..." (spinner) |
| error | Mensaje + botón "Reintentar" (llama a refetch) |
| sin resultados | "No se encontraron Pokémon" |
| normal | Grid de tarjetas |

**Navegación:** handlePokemonPress(pokemon) → navigate("Detail", { pokemonId: pokemon.id })

### DetailScreen ( + "" + "src/screens/DetailScreen.tsx" + "" + ")

**Qué muestra:**
- Imagen oficial (artwork, con fallback al sprite frontal).
- Nombre + ID con padding de ceros (#001, #025, etc.).
- Tipos con TypeBadge.
- Altura (decímetros → metros) y peso (hectogramos → kilogramos).
- Habilidades (con etiqueta "Hidden" para ocultas).
- Stats base (HP, ATK, DEF, S.ATK, S.DEF, SPD) con StatBar animadas.

**Color dinámico:** El fondo completo cambia según el tipo primario, usando typeColors.

**Estados manejados:**
| Estado | Qué muestra |
|---|---|
| loading | "Cargando..." |
| sin datos | "Pokémon no encontrado" |

---

## 8. Componentes Reutilizables

### PokemonCard (src/components/PokemonCard.tsx)
- Color de fondo según tipo primario.
- Muestra: imagen oficial, ID formateado, nombre capitalizado, badges de tipo.
- Estrella de favoritos interactiva.
- Recibe onPress para navegación.

### TypeBadge (src/components/TypeBadge.tsx)
- Fila horizontal de etiquetas coloreadas por tipo.
- Texto en mayúsculas.

### StatBar (src/components/StatBar.tsx)
- Fila con: nombre stat, valor numérico, barra de progreso.
- Ancho = (valor / 255) * 100%. El máximo teórico base es 255.
- Colores por stat: HP=verde, ATK=rojo, DEF=naranja, S.ATK=azul, S.DEF=amarillo, SPD=rosa.

---

## 9. Hooks Personalizados

| Hook | Propósito | Retorna |
|---|---|---|
| **usePokemon()** | Carga los 200 Pokémon al montar HomeScreen. | { pokemonList, loading, error, refetch } |
| **useFavorites()** | Maneja favoritos + persistencia en archivo JSON. | { favorites, loading, toggleFavorite, isFavorite } |
| **useFavoritesContext()** | Accede al contexto desde cualquier componente. | Igual que useFavorites |

---

## 10. Flujo Completo de la App

App inicia → FavoritesProvider carga favoritos desde JSON → NavigationContainer envuelve Stack Navigator

**HomeScreen se monta:**
→ usePokemon() dispara getPokemonList(200)
→ Fetch a /pokemon?limit=200
→ 200 fetchs paralelos a /pokemon/{id}
→ Datos en pokemonList
→ FlatList renderiza PokemonCards en grid 2 columnas

**Usuario busca "char":**
→ useMemo filtra: name.includes("char")
→ Muestra Charmander, Charizard, etc.

**Usuario selecciona tipo "fire":**
→ selectedTypes = ["fire"]
→ useMemo combina: búsqueda + tipo
→ Solo Pokémon fuego que coincidan con búsqueda

**Usuario marca favorito:**
→ toggleFavorite(6) → guarda en favorites.json
→ Estrella cambia a dorada en tarjeta y detalle

**Usuario activa solo favoritos:**
→ showFavoritesOnly = true
→ useMemo triple filtro: búsqueda + tipo + favoritos

**Usuario ve detalle:**
→ navigate("Detail", { pokemonId: 6 })
→ DetailScreen llama getPokemonById(6)
→ Muestra stats, habilidades, altura, peso, tipos
→ Fondo coloreado por tipo del Pokémon
