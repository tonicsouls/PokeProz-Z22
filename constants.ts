import { PresetPokemon, Nature } from "./types";

export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export const BATTLE_ITEMS = [
    { name: "Life Orb", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/life-orb.png" },
    { name: "Choice Scarf", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-scarf.png" },
    { name: "Choice Specs", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-specs.png" },
    { name: "Choice Band", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/choice-band.png" },
    { name: "Leftovers", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/leftovers.png" },
    { name: "Focus Sash", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/focus-sash.png" },
    { name: "Assault Vest", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/assault-vest.png" },
    { name: "Heavy-Duty Boots", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/heavy-duty-boots.png" },
    { name: "Expert Belt", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/expert-belt.png" },
    { name: "Rocky Helmet", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rocky-helmet.png" },
    { name: "Eviolite", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/eviolite.png" },
    { name: "Black Sludge", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/black-sludge.png" },
    { name: "Protective Pads", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/protective-pads.png" },
    { name: "Safety Goggles", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/safety-goggles.png" },
    { name: "Terrain Extender", spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/terrain-extender.png" },
].sort((a,b) => a.name.localeCompare(b.name));


export const PRESET_TRAINERS: { [key: string]: PresetPokemon[] } = {
    "Red (Champion)": [
        { name: "pikachu", item: "Light Ball", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Thunderbolt", "Surf", "Nasty Plot", "Volt Switch"] },
        { name: "charizard", item: "Heavy-Duty Boots", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Flamethrower", "Solar Beam", "Focus Blast", "Roost"] },
        { name: "blastoise", item: "White Herb", nature: "Modest", evs: { hp: 252, attack: 0, defense: 4, spAtk: 252, spDef: 0, speed: 0 }, moves: ["Shell Smash", "Surf", "Ice Beam", "Aura Sphere"] },
        { name: "venusaur", item: "Black Sludge", nature: "Bold", evs: { hp: 252, attack: 0, defense: 252, spAtk: 0, spDef: 4, speed: 0 }, moves: ["Giga Drain", "Sludge Bomb", "Leech Seed", "Sleep Powder"] },
        { name: "snorlax", item: "Leftovers", nature: "Careful", evs: { hp: 252, attack: 4, defense: 0, spAtk: 0, spDef: 252, speed: 0 }, moves: ["Curse", "Body Slam", "Rest", "Sleep Talk"] },
        { name: "lapras", item: "Assault Vest", nature: "Modest", evs: { hp: 252, attack: 0, defense: 0, spAtk: 252, spDef: 4, speed: 0 }, moves: ["Hydro Pump", "Freeze-Dry", "Thunderbolt", "Ice Shard"] },
    ],
    "Cynthia (Champion)": [
        { name: "garchomp", item: "Rocky Helmet", nature: "Jolly", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Stealth Rock", "Swords Dance", "Earthquake", "Dragon Claw"] },
        { name: "spiritomb", item: "Leftovers", nature: "Calm", evs: { hp: 252, attack: 0, defense: 4, spAtk: 0, spDef: 252, speed: 0 }, moves: ["Will-O-Wisp", "Hex", "Dark Pulse", "Nasty Plot"] },
        { name: "milotic", item: "Flame Orb", nature: "Bold", evs: { hp: 252, attack: 0, defense: 252, spAtk: 0, spDef: 4, speed: 0 }, moves: ["Scald", "Recover", "Ice Beam", "Mirror Coat"] },
        { name: "lucario", item: "Life Orb", nature: "Jolly", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Swords Dance", "Close Combat", "Meteor Mash", "Extreme Speed"] },
        { name: "roserade", item: "Focus Sash", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Spikes", "Leaf Storm", "Sludge Bomb", "Sleep Powder"] },
        { name: "gastrodon", item: "Leftovers", nature: "Bold", evs: { hp: 252, attack: 0, defense: 252, spAtk: 4, spDef: 0, speed: 0 }, moves: ["Scald", "Earth Power", "Recover", "Toxic"] },
    ],
    "Giovanni (Gym Leader)": [
        { name: "persian", item: "Life Orb", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Nasty Plot", "Hyper Voice", "Dark Pulse", "Thunderbolt"] },
        { name: "nidoking", item: "Life Orb", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Earth Power", "Sludge Wave", "Ice Beam", "Thunderbolt"] },
        { name: "nidoqueen", item: "Life Orb", nature: "Modest", evs: { hp: 252, attack: 0, defense: 0, spAtk: 252, spDef: 4, speed: 0 }, moves: ["Stealth Rock", "Earth Power", "Sludge Wave", "Ice Beam"] },
        { name: "rhyperior", item: "Choice Band", nature: "Adamant", evs: { hp: 252, attack: 252, defense: 4, spAtk: 0, spDef: 0, speed: 0 }, moves: ["Earthquake", "Stone Edge", "Megahorn", "Fire Punch"] },
        { name: "golem", item: "Focus Sash", nature: "Adamant", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Stealth Rock", "Rock Blast", "Earthquake", "Sucker Punch"] },
        { name: "dugtrio", item: "Focus Sash", nature: "Jolly", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Stealth Rock", "Earthquake", "Stone Edge", "Sucker Punch"] },
    ],
    "Lance (Dragon Master)": [
        { name: "dragonite", item: "Heavy-Duty Boots", nature: "Adamant", evs: { hp: 252, attack: 252, defense: 4, spAtk: 0, spDef: 0, speed: 0 }, moves: ["Dragon Dance", "Roost", "Dual Wingbeat", "Earthquake"] },
        { name: "gyarados", item: "Leftovers", nature: "Jolly", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Dragon Dance", "Waterfall", "Bounce", "Power Whip"] },
        { name: "aerodactyl", item: "Focus Sash", nature: "Jolly", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Stealth Rock", "Stone Edge", "Dual Wingbeat", "Taunt"] },
        { name: "charizard", item: "Choice Specs", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Flamethrower", "Air Slash", "Focus Blast", "Dragon Pulse"] },
        { name: "salamence", item: "Heavy-Duty Boots", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Draco Meteor", "Hurricane", "Flamethrower", "Roost"] },
        { name: "kingdra", item: "Choice Specs", nature: "Modest", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Hydro Pump", "Draco Meteor", "Hurricane", "Flip Turn"] },
    ],
    "Steven (Stone Enthusiast)": [
        { name: "skarmory", item: "Rocky Helmet", nature: "Bold", evs: { hp: 252, attack: 0, defense: 252, spAtk: 0, spDef: 4, speed: 0 }, moves: ["Spikes", "Roost", "Body Press", "Iron Defense"] },
        { name: "metagross", item: "Assault Vest", nature: "Adamant", evs: { hp: 252, attack: 252, defense: 4, spAtk: 0, spDef: 0, speed: 0 }, moves: ["Meteor Mash", "Zen Headbutt", "Earthquake", "Bullet Punch"] },
        { name: "aggron", item: "Choice Band", nature: "Adamant", evs: { hp: 252, attack: 252, defense: 4, spAtk: 0, spDef: 0, speed: 0 }, moves: ["Head Smash", "Heavy Slam", "Earthquake", "Aqua Tail"] },
        { name: "cradily", item: "Leftovers", nature: "Calm", evs: { hp: 252, attack: 0, defense: 4, spAtk: 0, spDef: 252, speed: 0 }, moves: ["Stealth Rock", "Recover", "Giga Drain", "Toxic"] },
        { name: "armaldo", item: "Focus Sash", nature: "Adamant", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Rapid Spin", "Stone Edge", "X-Scissor", "Aqua Jet"] },
        { name: "claydol", item: "Leftovers", nature: "Bold", evs: { hp: 252, attack: 0, defense: 252, spAtk: 0, spDef: 4, speed: 0 }, moves: ["Stealth Rock", "Rapid Spin", "Psychic", "Earth Power"] },
    ],
    "Wallace (Water Artist)": [
        { name: "wailord", item: "Choice Specs", nature: "Modest", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Water Spout", "Hydro Pump", "Ice Beam", "Surf"] },
        { name: "tentacruel", item: "Black Sludge", nature: "Timid", evs: { hp: 252, attack: 0, defense: 4, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Rapid Spin", "Scald", "Sludge Bomb", "Haze"] },
        { name: "ludicolo", item: "Life Orb", nature: "Modest", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Hydro Pump", "Giga Drain", "Ice Beam", "Focus Blast"] },
        { name: "sharpedo", item: "Focus Sash", nature: "Adamant", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Protect", "Waterfall", "Crunch", "Close Combat"] },
        { name: "whiscash", item: "Leftovers", nature: "Adamant", evs: { hp: 252, attack: 252, defense: 4, spAtk: 0, spDef: 0, speed: 0 }, moves: ["Dragon Dance", "Earthquake", "Waterfall", "Stone Edge"] },
        { name: "milotic", item: "Leftovers", nature: "Bold", evs: { hp: 252, attack: 0, defense: 252, spAtk: 4, spDef: 0, speed: 0 }, moves: ["Scald", "Recover", "Ice Beam", "Haze"] },
    ],
    "N (Team Plasma)": [
        { name: "zoroark", item: "Focus Sash", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Nasty Plot", "Dark Pulse", "Flamethrower", "Sludge Bomb"] },
        { name: "carracosta", item: "White Herb", nature: "Adamant", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Shell Smash", "Liquidation", "Stone Edge", "Aqua Jet"] },
        { name: "archeops", item: "Heavy-Duty Boots", nature: "Jolly", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Head Smash", "Brave Bird", "Earthquake", "U-turn"] },
        { name: "vanilluxe", item: "Choice Specs", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Blizzard", "Freeze-Dry", "Flash Cannon", "Explosion"] },
        { name: "klinklang", item: "Leftovers", nature: "Adamant", evs: { hp: 252, attack: 252, defense: 4, spAtk: 0, spDef: 0, speed: 0 }, moves: ["Shift Gear", "Gear Grind", "Wild Charge", "Substitute"] },
        { name: "reshiram", item: "Heavy-Duty Boots", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Blue Flare", "Draco Meteor", "Roost", "Defog"] },
    ],
    "Ghetsis (Neo Plasma)": [
        { name: "cofagrigus", item: "Leftovers", nature: "Bold", evs: { hp: 252, attack: 0, defense: 252, spAtk: 4, spDef: 0, speed: 0 }, moves: ["Nasty Plot", "Shadow Ball", "Will-O-Wisp", "Hex"] },
        { name: "bouffalant", item: "Choice Band", nature: "Adamant", evs: { hp: 252, attack: 252, defense: 4, spAtk: 0, spDef: 0, speed: 0 }, moves: ["Head Charge", "Earthquake", "Megahorn", "Close Combat"] },
        { name: "seismitoad", item: "Leftovers", nature: "Relaxed", evs: { hp: 252, attack: 0, defense: 252, spAtk: 0, spDef: 4, speed: 0 }, moves: ["Stealth Rock", "Scald", "Earth Power", "Toxic"] },
        { name: "drapion", item: "Black Sludge", nature: "Jolly", evs: { hp: 252, attack: 4, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Swords Dance", "Knock Off", "Poison Jab", "Aqua Tail"] },
        { name: "hydreigon", item: "Life Orb", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Nasty Plot", "Draco Meteor", "Dark Pulse", "Flash Cannon"] },
        { name: "kyurem-black", item: "Choice Band", nature: "Jolly", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Icicle Spear", "Dragon Claw", "Fusion Bolt", "Roost"] },
    ],
    "Diantha (Kalos Champion)": [
        { name: "hawlucha", item: "Grassy Seed", nature: "Adamant", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Swords Dance", "Close Combat", "Acrobatics", "Taunt"] },
        { name: "tyrantrum", item: "Choice Scarf", nature: "Jolly", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Head Smash", "Dragon Claw", "Earthquake", "Crunch"] },
        { name: "aurorus", item: "Heavy-Duty Boots", nature: "Timid", evs: { hp: 252, attack: 0, defense: 4, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Stealth Rock", "Blizzard", "Freeze-Dry", "Earth Power"] },
        { name: "gourgeist-super", item: "Leftovers", nature: "Impish", evs: { hp: 252, attack: 4, defense: 252, spAtk: 0, spDef: 0, speed: 0 }, moves: ["Will-O-Wisp", "Leech Seed", "Poltergeist", "Synthesis"] },
        { name: "goodra", item: "Assault Vest", nature: "Modest", evs: { hp: 248, attack: 0, defense: 0, spAtk: 252, spDef: 8, speed: 0 }, moves: ["Draco Meteor", "Thunderbolt", "Sludge Bomb", "Fire Blast"] },
        { name: "gardevoir", item: "Choice Scarf", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Moonblast", "Psyshock", "Mystical Fire", "Trick"] },
    ],
    "Leon (Galar Champion)": [
        { name: "aegislash", item: "Leftovers", nature: "Adamant", evs: { hp: 252, attack: 252, defense: 0, spAtk: 0, spDef: 4, speed: 0 }, moves: ["Swords Dance", "King's Shield", "Iron Head", "Shadow Sneak"] },
        { name: "dragapult", item: "Choice Specs", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Draco Meteor", "Shadow Ball", "U-turn", "Flamethrower"] },
        { name: "rillaboom", item: "Choice Band", nature: "Adamant", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Grassy Glide", "Wood Hammer", "U-turn", "Knock Off"] },
        { name: "cinderace", item: "Heavy-Duty Boots", nature: "Jolly", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Pyro Ball", "U-turn", "Sucker Punch", "Court Change"] },
        { name: "haxorus", item: "Life Orb", nature: "Jolly", evs: { hp: 4, attack: 252, defense: 0, spAtk: 0, spDef: 0, speed: 252 }, moves: ["Dragon Dance", "Close Combat", "Iron Head", "Dragon Claw"] },
        { name: "charizard", item: "Heavy-Duty Boots", nature: "Timid", evs: { hp: 4, attack: 0, defense: 0, spAtk: 252, spDef: 0, speed: 252 }, moves: ["Flamethrower", "Hurricane", "Roost", "Focus Blast"] },
    ],
};


export const BATTLE_BACKGROUNDS = [
    "https://raw.githubusercontent.com/smogon/pokemon-showdown/master/sprites/battlebg/bg-stadium.png",
    "https://raw.githubusercontent.com/smogon/pokemon-showdown/master/sprites/battlebg/bg-forest.png",
    "https://raw.githubusercontent.com/smogon/pokemon-showdown/master/sprites/battlebg/bg-sky.png",
    "https://raw.githubusercontent.com/smogon/pokemon-showdown/master/sprites/battlebg/bg-city.png",
    "https://raw.githubusercontent.com/smogon/pokemon-showdown/master/sprites/battlebg/bg-beach.png",
    "https://raw.githubusercontent.com/smogon/pokemon-showdown/master/sprites/battlebg/bg-cave.png",
];