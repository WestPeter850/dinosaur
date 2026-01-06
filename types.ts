
export enum AnimalType {
  // LAND
  COMPSOGNATHUS = 'COMPSOGNATHUS',
  GALLIMIMUS = 'GALLIMIMUS',
  VELOCIRAPTOR = 'VELOCIRAPTOR',
  PACHYCEPHALOSAURUS = 'PACHYCEPHALOSAURUS',
  TRICERATOPS = 'TRICERATOPS',
  ANKYLOSAURUS = 'ANKYLOSAURUS',
  TREX = 'TREX',
  
  // AIR
  DRAGONFLY = 'DRAGONFLY',
  PTERODACTYL = 'PTERODACTYL',
  QUETZALCOATLUS = 'QUETZALCOATLUS',
  
  // WATER
  SHRIMP = 'SHRIMP',
  PLESIOSAUR = 'PLESIOSAUR',
  MOSASAURUS = 'MOSASAURUS',
  
  // HYBRID / BOSS
  SPINOSAURUS = 'SPINOSAURUS'
}

export enum MovementType {
  LAND = 'LAND',
  WATER = 'WATER',
  AIR = 'AIR'
}

export enum GameMode {
  PARTY = 'PARTY',
  FFA = 'FREE_FOR_ALL',
  BR = 'BATTLE_ROYALE'
}

export interface AnimalStats {
  type: AnimalType;
  level: number;
  xpRequired: number;
  speed: number;
  radius: number;
  color: string;
  name: string;
  movement: MovementType;
  abilityName: string;
  abilityCooldown: number;
  description?: string; // For visual cues
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  color?: string; // For Twitch style
  isSystem?: boolean;
}

export interface Player extends Entity {
  angle: number;
  animalType: AnimalType;
  xp: number;
  health: number;
  water: number;
  air: number; // Oxygen
  name: string;
  isAI: boolean;
  score: number;
  targetX?: number;
  targetY?: number;
  abilityActiveUntil?: number;
  abilityOnCooldownUntil?: number;
  state?: 'WANDER' | 'EAT' | 'FLEE' | 'CHASE';
  isHiding?: boolean; // Inside burrow
  isDiving?: boolean; // Underwater invisible
  isUnderwater?: boolean; // Physically in water terrain
}

export interface Food extends Entity {
  xpValue: number;
  color: string;
  isFlying: boolean;
  isGem?: boolean;
  // Insect specific
  dx?: number;
  dy?: number;
}

export interface Cloud extends Entity {
  speed: number;
  opacity: number;
  hp: number;
  maxHp: number;
  xpReward: number;
}

export interface MapObject extends Entity {
  objType: 'ROCK' | 'TREE' | 'BUSH' | 'BURROW' | 'GEM_NODE';
}

export interface GameState {
  player: Player;
  others: Player[];
  food: Food[];
  clouds: Cloud[];
  mapObjects: MapObject[];
  worldSize: number;
  status: 'START' | 'PLAYING' | 'EVOLVING' | 'GAMEOVER';
  mode: GameMode;
  brZoneRadius: number;
  chatMessages: ChatMessage[];
  partyCode?: string;
  biomeChoice?: MovementType;
  evolutionTimer?: number; // 5 second countdown
  respawnTimer?: number; // 10 second countdown
}