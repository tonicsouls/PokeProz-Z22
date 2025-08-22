import { POKEAPI_BASE_URL } from '../constants';
import type { PokemonStat, PokemonListItem, Move, DetailedPokemon, EvolutionStage, TypeEffectiveness, DetailedMove, PokedexEntry, BattlePokemon } from '../types';
import { calculateStats } from '../utils/statCalculator';

// --- Type definitions for PokeAPI responses ---
interface PokeApiType { slot: number; type: { name: string; url: string; }; }
interface PokeApiStat { base_stat: number; stat: { name: string; }; }
interface PokeApiAbility { ability: { name: string; }; is_hidden: boolean; }
interface PokeApiMove { move: { name: string; url: string; }; version_group_details: { level_learned_at: number; move_learn_method: { name: string; }; }[]; }
interface PokeApiSpecies { flavor_text_entries: { flavor_text: string; language: { name: string; }; version: { name: string; }; }[]; evolution_chain: { url: string; }; }
interface PokeApiEvolutionChain { chain: any; }
interface PokeApiTypeRelations { damage_relations: { double_damage_from: {name: string}[], half_damage_from: {name: string}[], no_damage_from: {name: string}[] } }
interface PokeApiMoveDetail { pp: number; power: number | null; type: { name: string; }; damage_class: { name: string; }; priority: number; }


const ALL_TYPES = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];


// --- Helper Functions ---

// Recursively parses the evolution chain from the API
const parseEvolutionChain = (chain: any): EvolutionStage => {
    const id = parseInt(chain.species.url.split('/').filter(Boolean).pop() || '0', 10);
    return {
        pokemon: {
            id,
            name: chain.species.name,
            spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        },
        evolvesTo: chain.evolves_to.map((nextChain: any) => parseEvolutionChain(nextChain)),
    };
};

const formatName = (name: string) => name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');


// --- Main Fetch Functions ---

// Fetches all data required for the detailed Pokedex view
export const fetchPokedexData = async (nameOrId: string): Promise<DetailedPokemon> => {
    const pokemonResponse = await fetch(`${POKEAPI_BASE_URL}/pokemon/${nameOrId.toLowerCase().replace(' ', '-')}`);
    if (!pokemonResponse.ok) throw new Error(`Pokémon "${nameOrId}" not found.`);
    const pokemonData = await pokemonResponse.json();

    const speciesResponse = await fetch(pokemonData.species.url);
    if (!speciesResponse.ok) throw new Error(`Could not fetch species data for "${nameOrId}".`);
    const speciesData: PokeApiSpecies = await speciesResponse.json();

    // Fetch Evolution Chain
    let evolutionChain: EvolutionStage | null = null;
    if (speciesData.evolution_chain?.url) {
        const evoResponse = await fetch(speciesData.evolution_chain.url);
        if (evoResponse.ok) {
            const evoData: PokeApiEvolutionChain = await evoResponse.json();
            evolutionChain = parseEvolutionChain(evoData.chain);
        }
    }

    // Fetch Type Effectiveness
    const typeEffectiveness: TypeEffectiveness = {};
    ALL_TYPES.forEach(t => typeEffectiveness[t] = 1);

    for (const typeInfo of pokemonData.types) {
        const typeResponse = await fetch(typeInfo.type.url);
        if (typeResponse.ok) {
            const typeData: PokeApiTypeRelations = await typeResponse.json();
            typeData.damage_relations.double_damage_from.forEach(t => typeEffectiveness[t.name] *= 2);
            typeData.damage_relations.half_damage_from.forEach(t => typeEffectiveness[t.name] *= 0.5);
            typeData.damage_relations.no_damage_from.forEach(t => typeEffectiveness[t.name] *= 0);
        }
    }
    
    // Process Pokedex Entries
    const pokedexEntries: PokedexEntry[] = speciesData.flavor_text_entries
        .filter(entry => entry.language.name === 'en')
        .map(entry => ({
            version: formatName(entry.version.name),
            text: entry.flavor_text.replace(/[\n\f]/g, ' '),
        }))
        // Remove duplicate entries
        .filter((entry, index, self) => self.findIndex(e => e.text === entry.text) === index);


    // Process Moves
    const learnableMoves: DetailedMove[] = pokemonData.moves.map((move: PokeApiMove) => {
        const details = move.version_group_details[move.version_group_details.length - 1]; // Get latest learn method
        return {
            name: formatName(move.move.name),
            learnMethod: details.move_learn_method.name.replace('-', ' '),
            level: details.level_learned_at,
        };
    }).sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
    });

    return {
        id: pokemonData.id,
        name: formatName(pokemonData.name),
        imageUrl: pokemonData.sprites.other['official-artwork'].front_default,
        shinyImageUrl: pokemonData.sprites.other['official-artwork'].front_shiny,
        spriteUrl: pokemonData.sprites.front_default,
        types: pokemonData.types.map((typeInfo: PokeApiType) => typeInfo.type.name),
        height: pokemonData.height,
        weight: pokemonData.weight,
        stats: pokemonData.stats.map((stat: PokeApiStat) => ({
            name: stat.stat.name.replace('special-attack', 'Sp. Atk').replace('special-defense', 'Sp. Def').replace('-', ' '),
            value: stat.base_stat,
        })),
        abilities: pokemonData.abilities.map((ability: PokeApiAbility) => formatName(ability.ability.name)),
        cryUrl: pokemonData.cries?.latest,
        pokedexEntries,
        evolutionChain,
        typeEffectiveness,
        learnableMoves,
    };
};

// Fetches the necessary data for a BattlePokemon instance
export const fetchPokemonForBattle = async (nameOrId: string): Promise<Omit<BattlePokemon, 'selectedMoves' | 'currentHp'>> => {
    const formattedNameOrId = nameOrId.toLowerCase().replace(/\s+/g, '-');
    const pokemonResponse = await fetch(`${POKEAPI_BASE_URL}/pokemon/${formattedNameOrId}`);
    if (!pokemonResponse.ok) throw new Error(`Pokémon "${nameOrId}" not found.`);
    const data = await pokemonResponse.json();

    // Fetch detailed move data
    const moveListPromises = data.moves.map(async (moveData: PokeApiMove): Promise<Move> => {
        const moveDetailResponse = await fetch(moveData.move.url);
        if (!moveDetailResponse.ok) return { name: formatName(moveData.move.name) }; // Fallback
        const moveDetail: PokeApiMoveDetail = await moveDetailResponse.json();
        return {
            name: formatName(moveData.move.name),
            pp: moveDetail.pp,
            maxPp: moveDetail.pp,
            power: moveDetail.power,
            type: moveDetail.type.name,
            damageClass: moveDetail.damage_class.name as 'physical' | 'special' | 'status',
            priority: moveDetail.priority,
        };
    });
    const moveList = await Promise.all(moveListPromises);

    // Fetch Type Effectiveness
    const typeEffectiveness: TypeEffectiveness = {};
    ALL_TYPES.forEach(t => typeEffectiveness[t] = 1);
    for (const typeInfo of data.types) {
        const typeResponse = await fetch(typeInfo.type.url);
        if (typeResponse.ok) {
            const typeData: PokeApiTypeRelations = await typeResponse.json();
            typeData.damage_relations.double_damage_from.forEach(t => typeEffectiveness[t.name] *= 2);
            typeData.damage_relations.half_damage_from.forEach(t => typeEffectiveness[t.name] *= 0.5);
            typeData.damage_relations.no_damage_from.forEach(t => typeEffectiveness[t.name] *= 0);
        }
    }
    
    const basePokemon = {
        id: data.id,
        name: formatName(data.name),
        imageUrl: data.sprites.other['official-artwork'].front_default,
        spriteUrl: data.sprites.front_default,
        backSpriteUrl: data.sprites.back_default,
        cryUrl: data.cries?.latest,
        types: data.types.map((typeInfo: PokeApiType) => typeInfo.type.name),
        height: data.height,
        weight: data.weight,
        stats: data.stats.map((stat: PokeApiStat) => ({
            name: stat.stat.name.replace('special-attack', 'Sp. Atk').replace('special-defense', 'Sp. Def').replace('-', ' '),
            value: stat.base_stat,
        })),
        abilities: data.abilities.map((ability: PokeApiAbility) => formatName(ability.ability.name)),
        moves: data.moves.slice(0, 4).map((move: PokeApiMove) => formatName(move.move.name)),
        moveList,
        typeEffectiveness,
        evs: { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 },
        ivs: { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 },
        nature: 'Serious' as const,
        status: 'ok' as const,
        item: null,
    };

    // Calculate initial stats and add them
    const calculatedStats = calculateStats(basePokemon);
    const finalMaxHp = calculatedStats.hp;

    return {
        ...basePokemon,
        maxHp: finalMaxHp,
        calculatedStats,
    };
};

// Fetches a lightweight list of all Pokémon for predictive search
export const fetchAllPokemonList = async (): Promise<PokemonListItem[]> => {
    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=1302`);
    if(!response.ok) throw new Error('Failed to fetch the complete Pokémon list.');
    const data = await response.json();

    return data.results.map((p: { name: string, url: string }) => {
        const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0', 10);
        return {
            id,
            name: formatName(p.name),
            spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        };
    });
};