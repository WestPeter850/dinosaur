
import { AnimalType, AnimalStats, MovementType } from './types';

export const WORLD_SIZE = 8000;
export const MAX_FOOD = 3000; 
export const MAX_GEMS = 50;
export const MAX_CLOUDS = 50; 
export const MAX_GEM_NODES = 20;
export const MAX_AI = 200; // Increased to ensure screen population
export const INITIAL_XP = 0;
export const INITIAL_HEALTH = 100;
export const INITIAL_WATER = 100;
export const INITIAL_AIR = 100;

export const BOT_NAMES = [
  "RexHunter", "DinoKing", "LittleFoot", "Blue", "Echo", "Delta", "Charlie", 
  "Indominus", "Godzilla", "Barney", "Yoshi", "Grimlock", "Reptar", "SharpTooth", 
  "Petrie", "Ducky", "Spike", "Sinclair", "Denver", "Arlo", "Toothless", "Smaug", 
  "Drogon", "Rhaegal", "Viserion", "Norbert", "Falkor", "Saphira", "Mushu", "Elliot",
  "Tiny", "BigChungus", "Speedy", "chomp", "RawrXD", "MeteorMagnet", "FossilFinder",
  "Prehistoric", "Jurassic", "Cretaceous", "Triassic", "PangeaPro", "DinoNugget",
  "Herbivore", "Carnivore", "Omnivore", "ExtinctionEvent", "Paleo", "DinoMite",
  "TriceraOps", "VelociRapper", "DinoSore", "AsteroidCatcher", "LandBeforeTime", "JurassicParkRanger",
  "CleverGirl", "DinoMight", "Roar", "Stomp", "Chomp", "Bite", "Claw", "Tail"
];

export const BOT_MESSAGES = [
  "Anyone want to team?", "Help me!", "There's a T-Rex at center!", "How do I fly?",
  "gg", "Nice skin", "lol", "Stop chasing me", "Lag?", "Team?", "Go away",
  "Where is the water?", "I need xp", "Who is top 1?", "Run!!", "Scary...",
  "Hello from Brazil", "Noob", "Pro gamer here", "Evolution time!", "Ouch",
  "Friendly?", "Need water...", "Nice evolution!", "King of the server", "Pls no kill"
];

export const ANIMAL_DATA: Record<AnimalType, AnimalStats> = {
  // --- LAND ---
  [AnimalType.COMPSOGNATHUS]: {
    type: AnimalType.COMPSOGNATHUS,
    level: 1,
    xpRequired: 150,
    speed: 7.5, 
    radius: 18,
    color: '#8bc34a',
    name: 'Compy',
    movement: MovementType.LAND,
    abilityName: 'Burrow',
    abilityCooldown: 5000
  },
  [AnimalType.GALLIMIMUS]: {
    type: AnimalType.GALLIMIMUS,
    level: 2,
    xpRequired: 400,
    speed: 7.0,
    radius: 24,
    color: '#d4e157',
    name: 'Gallimimus',
    movement: MovementType.LAND,
    abilityName: 'Sprint',
    abilityCooldown: 4000
  },
  [AnimalType.VELOCIRAPTOR]: {
    type: AnimalType.VELOCIRAPTOR,
    level: 3,
    xpRequired: 900,
    speed: 6.8,
    radius: 30,
    color: '#ffb74d',
    name: 'Velociraptor',
    movement: MovementType.LAND,
    abilityName: 'Pounce',
    abilityCooldown: 4000
  },
  [AnimalType.PACHYCEPHALOSAURUS]: {
    type: AnimalType.PACHYCEPHALOSAURUS,
    level: 4,
    xpRequired: 1800,
    speed: 6.0,
    radius: 35,
    color: '#a1887f',
    name: 'Pachy',
    movement: MovementType.LAND,
    abilityName: 'Headbutt',
    abilityCooldown: 6000
  },
  [AnimalType.TRICERATOPS]: {
    type: AnimalType.TRICERATOPS,
    level: 10,
    xpRequired: 8000,
    speed: 5.0,
    radius: 55,
    color: '#795548',
    name: 'Triceratops',
    movement: MovementType.LAND,
    abilityName: 'Charge',
    abilityCooldown: 8000
  },
  [AnimalType.ANKYLOSAURUS]: {
    type: AnimalType.ANKYLOSAURUS,
    level: 12,
    xpRequired: 15000,
    speed: 4.5,
    radius: 60,
    color: '#5d4037',
    name: 'Ankylosaurus',
    movement: MovementType.LAND,
    abilityName: 'Tail Smash',
    abilityCooldown: 9000
  },
  [AnimalType.TREX]: {
    type: AnimalType.TREX,
    level: 18,
    xpRequired: 40000,
    speed: 5.5,
    radius: 85,
    color: '#bf360c',
    name: 'T-Rex',
    movement: MovementType.LAND,
    abilityName: 'Roar',
    abilityCooldown: 10000
  },

  // --- AIR ---
  [AnimalType.DRAGONFLY]: {
    type: AnimalType.DRAGONFLY,
    level: 1,
    xpRequired: 150,
    speed: 8.0,
    radius: 15,
    color: '#00bcd4',
    name: 'Dragonfly',
    movement: MovementType.AIR,
    abilityName: 'Hover',
    abilityCooldown: 2000
  },
  [AnimalType.PTERODACTYL]: {
    type: AnimalType.PTERODACTYL,
    level: 5,
    xpRequired: 2500,
    speed: 7.0,
    radius: 30,
    color: '#ef5350',
    name: 'Pterodactyl',
    movement: MovementType.AIR,
    abilityName: 'Dive',
    abilityCooldown: 6000
  },
  [AnimalType.QUETZALCOATLUS]: {
    type: AnimalType.QUETZALCOATLUS,
    level: 15,
    xpRequired: 50000, // High XP for boss like status
    speed: 6.5,
    radius: 110, // Huge
    color: '#7e57c2',
    name: 'Quetzal',
    movement: MovementType.AIR,
    abilityName: 'Sky Strike',
    abilityCooldown: 9000
  },

  // --- WATER ---
  [AnimalType.SHRIMP]: {
    type: AnimalType.SHRIMP,
    level: 1,
    xpRequired: 150,
    speed: 7.0,
    radius: 16,
    color: '#ff8a80',
    name: 'Shrimp',
    movement: MovementType.WATER,
    abilityName: 'Dash',
    abilityCooldown: 3000
  },
  [AnimalType.PLESIOSAUR]: {
    type: AnimalType.PLESIOSAUR,
    level: 6,
    xpRequired: 3000,
    speed: 6.5,
    radius: 40,
    color: '#0288d1',
    name: 'Plesiosaur',
    movement: MovementType.WATER,
    abilityName: 'Submerge',
    abilityCooldown: 7000
  },
  [AnimalType.MOSASAURUS]: {
    type: AnimalType.MOSASAURUS,
    level: 16,
    xpRequired: 35000,
    speed: 6.8,
    radius: 95,
    color: '#01579b',
    name: 'Mosasaurus',
    movement: MovementType.WATER,
    abilityName: 'Breach',
    abilityCooldown: 10000
  },

  // --- HYBRID ---
  [AnimalType.SPINOSAURUS]: {
    type: AnimalType.SPINOSAURUS,
    level: 20,
    xpRequired: 60000,
    speed: 5.8,
    radius: 100,
    color: '#ec407a',
    name: 'Spinosaurus',
    movement: MovementType.WATER, // Hybrid really, but treats water as home
    abilityName: 'Swamp Bite',
    abilityCooldown: 8000
  }
};

export const EVOLUTION_TREE: Record<string, AnimalType[]> = {
  // Land
  [AnimalType.COMPSOGNATHUS]: [AnimalType.GALLIMIMUS],
  [AnimalType.GALLIMIMUS]: [AnimalType.VELOCIRAPTOR],
  [AnimalType.VELOCIRAPTOR]: [AnimalType.PACHYCEPHALOSAURUS],
  [AnimalType.PACHYCEPHALOSAURUS]: [AnimalType.TRICERATOPS],
  [AnimalType.TRICERATOPS]: [AnimalType.ANKYLOSAURUS],
  [AnimalType.ANKYLOSAURUS]: [AnimalType.TREX],
  [AnimalType.TREX]: [AnimalType.SPINOSAURUS],

  // Air
  [AnimalType.DRAGONFLY]: [AnimalType.PTERODACTYL],
  [AnimalType.PTERODACTYL]: [AnimalType.QUETZALCOATLUS],
  [AnimalType.QUETZALCOATLUS]: [AnimalType.SPINOSAURUS], // Converge at top

  // Water
  [AnimalType.SHRIMP]: [AnimalType.PLESIOSAUR],
  [AnimalType.PLESIOSAUR]: [AnimalType.MOSASAURUS],
  [AnimalType.MOSASAURUS]: [AnimalType.SPINOSAURUS]
};