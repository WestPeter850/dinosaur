
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import Menu from './components/Menu';
import EvolutionSelector from './components/EvolutionSelector';
import HamburgerMenu from './components/HamburgerMenu';
import MusicPlayer from './components/MusicPlayer';
import { Player, GameState, AnimalType, Food, GameMode, ChatMessage, MapObject, Cloud, MovementType } from './types';
import { WORLD_SIZE, MAX_FOOD, MAX_GEMS, MAX_CLOUDS, MAX_AI, ANIMAL_DATA, EVOLUTION_TREE, BOT_NAMES, BOT_MESSAGES, MAX_GEM_NODES } from './constants';

const PLAYLIST_FILENAMES = ['Little Brother', 'Jungle Theme', 'Tiny Dino', 'Ancient Ocean', 'Carry On', 'YaYaYa', 'Run'];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    player: {
      id: 'player-1', x: WORLD_SIZE / 2, y: WORLD_SIZE / 2, radius: ANIMAL_DATA[AnimalType.COMPSOGNATHUS].radius,
      type: 'PLAYER', angle: 0, animalType: AnimalType.COMPSOGNATHUS, xp: 0, health: 100, water: 100, air: 100,
      name: 'You', isAI: false, score: 0, isHiding: false
    },
    others: [], food: [], clouds: [], mapObjects: [], worldSize: WORLD_SIZE, status: 'START', mode: GameMode.FFA,
    brZoneRadius: WORLD_SIZE, chatMessages: []
  });

  const [isChatVisible, setIsChatVisible] = useState(true);
  const [playerName, setPlayerName] = useState<string>('');
  const [availableEvolutions, setAvailableEvolutions] = useState<AnimalType[]>([]);
  const [respawnXP, setRespawnXP] = useState(0);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [masterVolume, setMasterVolume] = useState(50);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [audioProgress, setAudioProgress] = useState({ currentTime: 0, duration: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const activeAudio = useRef<HTMLAudioElement | null>(null);
  const hasUserInteracted = useRef(false);

  // Audio Init
  useEffect(() => {
    if (!hasUserInteracted.current) setNeedsInteraction(true);
    PLAYLIST_FILENAMES.forEach(t => {
      const audio = new Audio(`./${t}.wav`);
      audio.preload = 'none'; audio.volume = (masterVolume / 100) * 0.4;
      audio.ontimeupdate = () => { if (activeAudio.current === audio) setAudioProgress({ currentTime: audio.currentTime, duration: audio.duration || 0 }); };
      audio.onended = () => { if (activeAudio.current === audio) playTrack((PLAYLIST_FILENAMES.indexOf(t) + 1) % PLAYLIST_FILENAMES.length); };
      audioRefs.current[t] = audio;
    });
  }, []);

  useEffect(() => { Object.values(audioRefs.current).forEach((audio) => { (audio as HTMLAudioElement).volume = (masterVolume / 100) * 0.4; }); }, [masterVolume]);

  const playTrack = useCallback((index: number) => {
    if (!hasUserInteracted.current || !isMusicOn) { setIsPlaying(false); return; }
    if (activeAudio.current) activeAudio.current.pause();
    const trackName = PLAYLIST_FILENAMES[index % PLAYLIST_FILENAMES.length];
    const audio = audioRefs.current[trackName] || new Audio(`./${trackName}.wav`);
    audioRefs.current[trackName] = audio;
    if (audio) {
      activeAudio.current = audio; setCurrentTrackIndex(index);
      audio.play().then(() => setIsPlaying(true)).catch(() => { setIsPlaying(false); setTimeout(() => playTrack(index + 1), 1000); });
    }
  }, [isMusicOn]);

  const handleInteraction = () => {
    if (!hasUserInteracted.current) {
      hasUserInteracted.current = true; setNeedsInteraction(false);
      if (isMusicOn && !activeAudio.current) playTrack(0);
    } else { setNeedsInteraction(false); }
  };

  // Live Chat Simulation (Active)
  useEffect(() => {
    if (gameState.status !== 'PLAYING') return;
    const interval = setInterval(() => {
        if (Math.random() > 0.5) return; // 50% chance per tick (increased frequency)
        const randomBot = gameState.others[Math.floor(Math.random() * gameState.others.length)];
        if (!randomBot) return;
        const msg = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];
        
        setGameState(prev => {
             const newMsg: ChatMessage = { 
                 id: Date.now().toString() + Math.random(), 
                 sender: randomBot.name, 
                 text: msg, 
                 timestamp: Date.now(),
                 color: ANIMAL_DATA[randomBot.animalType].color
             };
             return { ...prev, chatMessages: [...prev.chatMessages, newMsg].slice(-20) };
        });
    }, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, [gameState.status, gameState.others]);

  const getEvolutionOptions = (currentType: AnimalType): AnimalType[] => {
      const currentLevel = ANIMAL_DATA[currentType].level;
      const allTypes = Object.values(AnimalType);
      
      const findBestCandidate = (moveType: MovementType) => {
          const candidates = allTypes
             .filter(t => ANIMAL_DATA[t].movement === moveType && ANIMAL_DATA[t].level > currentLevel)
             .sort((a, b) => ANIMAL_DATA[a].level - ANIMAL_DATA[b].level);
          return candidates.length > 0 ? candidates[0] : null;
      };

      const landOption = findBestCandidate(MovementType.LAND);
      const waterOption = findBestCandidate(MovementType.WATER);
      const airOption = findBestCandidate(MovementType.AIR);

      return [landOption, waterOption, airOption].filter((t): t is AnimalType => t !== null);
  };

  // Evolution Timer Logic
  useEffect(() => {
    let interval: any;
    if (gameState.status === 'EVOLVING') {
        if ((gameState.evolutionTimer ?? 0) > 0) {
            interval = setInterval(() => {
                setGameState(prev => ({ ...prev, evolutionTimer: (prev.evolutionTimer ?? 5) - 1 }));
            }, 1000);
        } else {
            // Timer expired, auto select
            const options = availableEvolutions;
            if(options.length > 0) {
                 const currentBiome = ANIMAL_DATA[gameState.player.animalType].movement;
                 const sameBiome = options.find(t => ANIMAL_DATA[t].movement === currentBiome);
                 handleEvolutionSelect(sameBiome || options[0]);
            }
        }
    }
    return () => clearInterval(interval);
  }, [gameState.status, gameState.evolutionTimer, availableEvolutions]);

  // Respawn Timer
  useEffect(() => {
    let interval: any;
    if (gameState.status === 'GAMEOVER') {
        if ((gameState.respawnTimer ?? 0) > 0) {
            interval = setInterval(() => {
                setGameState(prev => ({ ...prev, respawnTimer: (prev.respawnTimer ?? 10) - 1 }));
            }, 1000);
        } else {
            setGameState(prev => ({ ...prev, status: 'START' }));
        }
    }
    return () => clearInterval(interval);
  }, [gameState.status, gameState.respawnTimer]);

  const handleEvolutionSelect = (type: AnimalType) => {
      const newStats = ANIMAL_DATA[type];
      let newX = gameState.player.x;
      let newY = gameState.player.y;

      // Biome Transfer Logic
      const cx = WORLD_SIZE / 2;
      const cy = WORLD_SIZE / 2;
      
      // Basic Pangea check logic (simplified from GameCanvas)
      // Land is roughly within radius 2800 of center, Water is outside.
      // We'll use a safe buffer.
      
      if (newStats.movement === MovementType.WATER) {
          // If we are likely on land (distance from center < 2500), move to water
          const distFromCenter = Math.sqrt((newX - cx)**2 + (newY - cy)**2);
          if (distFromCenter < 2800) {
              const angle = Math.random() * Math.PI * 2;
              const dist = 3600 + Math.random() * 500; // Deep water
              newX = cx + Math.cos(angle) * dist;
              newY = cy + Math.sin(angle) * dist;
          }
      } else if (newStats.movement === MovementType.LAND) {
          // If we are likely in water (distance from center > 3000), move to land
          const distFromCenter = Math.sqrt((newX - cx)**2 + (newY - cy)**2);
          if (distFromCenter > 3000) {
              const angle = Math.random() * Math.PI * 2;
              const dist = Math.random() * 2000; // Safe land
              newX = cx + Math.cos(angle) * dist;
              newY = cy + Math.sin(angle) * dist;
          }
      }
      // Air doesn't strictly need moving, but we keep position

      setGameState(prev => ({ 
          ...prev, 
          player: { 
              ...prev.player, 
              animalType: type, 
              radius: ANIMAL_DATA[type].radius, 
              xp: 0, 
              health: 100,
              x: newX,
              y: newY
          }, 
          status: 'PLAYING',
          evolutionTimer: undefined,
          chatMessages: [...prev.chatMessages, { id: 'sys-evolve', sender: 'SYSTEM', text: `You evolved into a ${newStats.name}!`, timestamp: Date.now(), isSystem: true, color: '#ff9800' }]
      }));
  };

  // Evolution Trigger
  useEffect(() => {
    if (gameState.status !== 'PLAYING') return;
    const stats = ANIMAL_DATA[gameState.player.animalType];
    if (gameState.player.xp >= stats.xpRequired) {
        const nextOptions = getEvolutionOptions(gameState.player.animalType);
        if (nextOptions.length > 0) {
            setAvailableEvolutions(nextOptions);
            setGameState(prev => ({ ...prev, status: 'EVOLVING', evolutionTimer: 5 }));
        } else {
             setGameState(prev => ({ ...prev, player: { ...prev.player, xp: 0 }}));
        }
    }
  }, [gameState.player.xp, gameState.player.animalType, gameState.status]);

  const startGame = (name: string, mode: GameMode, biome: MovementType, partyCode?: string) => {
    handleInteraction();
    
    let starterType: AnimalType = AnimalType.COMPSOGNATHUS;
    if (biome === MovementType.WATER) starterType = AnimalType.SHRIMP;
    else if (biome === MovementType.AIR) starterType = AnimalType.DRAGONFLY;

    let currentType = starterType;
    let currentXP = respawnXP;

    // Fast forward logic (simple)
    while (true) {
         const nextOptions = EVOLUTION_TREE[currentType];
         if (!nextOptions || nextOptions.length === 0) break;
         const nextType = nextOptions[0];
         const req = ANIMAL_DATA[nextType].xpRequired;
         if (currentXP >= req) {
             currentType = nextType;
         } else {
             break;
         }
    }

    // Spawn location based on biome
    let startX = WORLD_SIZE / 2;
    let startY = WORLD_SIZE / 2;
    const cx = WORLD_SIZE / 2;
    const cy = WORLD_SIZE / 2;

    if (biome === MovementType.WATER) {
         const angle = Math.random() * Math.PI * 2;
         const dist = 3500 + Math.random() * 1000;
         startX = cx + Math.cos(angle) * dist;
         startY = cy + Math.sin(angle) * dist;
    } else {
         const angle = Math.random() * Math.PI * 2;
         const dist = Math.random() * 2000;
         startX = cx + Math.cos(angle) * dist;
         startY = cy + Math.sin(angle) * dist;
    }

    const initialFood: Food[] = Array.from({length: MAX_FOOD}, (_, i) => ({
        id: `food-${i}`, x: Math.random() * WORLD_SIZE, y: Math.random() * WORLD_SIZE, radius: Math.random() > 0.7 ? 4 : 6,
        type: 'FOOD', xpValue: 25, color: Math.random() > 0.7 ? '#ffeb3b' : '#d32f2f', isFlying: Math.random() > 0.7
    }));

    const clouds: Cloud[] = Array.from({length: MAX_CLOUDS}, (_, i) => ({
        id: `cloud-${i}`, x: Math.random() * WORLD_SIZE, y: Math.random() * WORLD_SIZE, 
        radius: 80 + Math.random() * 100, type: 'CLOUD', speed: 0.5, opacity: 0.8, hp: 50, maxHp: 50, xpReward: 1000
    }));

    const mapObjects: MapObject[] = Array.from({length: 400}, (_, i) => ({
        id: `obj-${i}`, x: Math.random() * WORLD_SIZE, y: Math.random() * WORLD_SIZE,
        radius: 40, type: 'MAP_OBJ', objType: Math.random() > 0.8 ? 'BURROW' : 'TREE'
    }));

    // Generate AI near player initially to populate screen
    const aiPlayers: Player[] = [];
    for (let i = 0; i < MAX_AI; i++) {
      const r = Math.random();
      let aiType: AnimalType = AnimalType.COMPSOGNATHUS;
      if (r > 0.98) aiType = AnimalType.TREX; 
      else if (r > 0.96) aiType = AnimalType.TRICERATOPS;
      else if (r > 0.92) aiType = AnimalType.VELOCIRAPTOR;
      else if (r > 0.88) aiType = AnimalType.GALLIMIMUS;
      else if (r > 0.75) aiType = AnimalType.PLESIOSAUR;
      else if (r > 0.55) aiType = AnimalType.PTERODACTYL;
      
      const startXp = ANIMAL_DATA[aiType].xpRequired * 0.1;
      
      // 20% of AI spawn near player
      let aix, aiy;
      if (i < MAX_AI * 0.2) {
          aix = startX + (Math.random() - 0.5) * 1500;
          aiy = startY + (Math.random() - 0.5) * 1500;
      } else {
          aix = Math.random() * WORLD_SIZE;
          aiy = Math.random() * WORLD_SIZE;
      }

      aiPlayers.push({
        id: `ai-${i}`, x: aix, y: aiy,
        radius: ANIMAL_DATA[aiType].radius, type: 'AI', angle: Math.random() * Math.PI * 2,
        animalType: aiType, xp: startXp, health: 100, water: 100, air: 100,
        name: BOT_NAMES[i % BOT_NAMES.length], isAI: true, score: startXp,
        targetX: Math.random() * WORLD_SIZE, targetY: Math.random() * WORLD_SIZE
      });
    }

    setGameState(prev => ({
      ...prev,
      player: { 
        ...prev.player, name: name || 'DinoPlayer', animalType: currentType,
        radius: ANIMAL_DATA[currentType].radius, xp: currentXP, health: 100,
        x: startX, y: startY
      },
      others: aiPlayers,
      food: initialFood, mapObjects: mapObjects, clouds: clouds, status: 'PLAYING',
      biomeChoice: biome
    }));
    setRespawnXP(0);
  };

  const onGameOver = useCallback(() => {
    const runIndex = PLAYLIST_FILENAMES.indexOf('Run');
    if (runIndex !== -1) playTrack(runIndex);
    
    setGameState(prev => {
        setRespawnXP(Math.floor(prev.player.xp * 0.5));
        return { ...prev, status: 'GAMEOVER', respawnTimer: 10 };
    });
  }, [playTrack]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-inter" onClick={handleInteraction}>
      {needsInteraction && (
        <div className="absolute inset-0 z-[500] bg-black/80 flex items-center justify-center pointer-events-auto cursor-pointer">
           <div className="text-center animate-bounce"><p className="text-white font-black text-2xl">Click to Start</p></div>
        </div>
      )}

      {gameState.status === 'START' && (
        <Menu onStart={startGame} challenge="" onNameChange={setPlayerName} name={playerName} />
      )}
      {(gameState.status === 'PLAYING' || gameState.status === 'EVOLVING' || gameState.status === 'GAMEOVER') && (
        <>
          {gameState.status !== 'GAMEOVER' && (
            <GameCanvas gameState={gameState} setGameState={setGameState} onGameOver={onGameOver} />
          )}
          <HUD player={gameState.player} others={gameState.others} isChatVisible={isChatVisible} onCloseChat={() => setIsChatVisible(false)} chatMessages={gameState.chatMessages} onSendMessage={(text) => setGameState(prev => ({ ...prev, chatMessages: [...prev.chatMessages, { id: Date.now().toString(), sender: playerName, text, timestamp: Date.now() }] }))} gameState={gameState} />
          <HamburgerMenu onMainMenu={() => setGameState(prev=>({...prev, status: 'START'}))} isMusicOn={isMusicOn} onToggleMusic={()=>{}} showMusicPlayer={showMusicPlayer} onToggleMusicPlayer={()=>setShowMusicPlayer(!showMusicPlayer)} volume={masterVolume} onVolumeChange={setMasterVolume} />
          {showMusicPlayer && <MusicPlayer currentTrack={PLAYLIST_FILENAMES[currentTrackIndex]} isPlaying={isPlaying} onTogglePlay={()=>playTrack(currentTrackIndex)} onNext={()=>playTrack(currentTrackIndex+1)} onPrev={()=>playTrack(currentTrackIndex-1)} volume={masterVolume} onVolumeChange={setMasterVolume} currentTime={audioProgress.currentTime} duration={audioProgress.duration} onSeek={()=>{}} />}
        </>
      )}
      
      {gameState.status === 'EVOLVING' && (
        <div className="absolute inset-0 z-[300]">
           <EvolutionSelector options={availableEvolutions} onSelect={handleEvolutionSelect} />
           <div className="absolute top-10 w-full text-center pointer-events-none">
              <p className="text-4xl font-black text-white drop-shadow-lg animate-pulse">{gameState.evolutionTimer}</p>
              <p className="text-sm font-bold text-zinc-300">SECONDS TO CHOOSE</p>
           </div>
        </div>
      )}

      {gameState.status === 'GAMEOVER' && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
          <div className="p-16 text-center bg-zinc-900 border border-white/10 rounded-[4rem] max-w-xl w-full">
            <h1 className="text-8xl font-black text-orange-600 mb-6 italic uppercase">Extinct</h1>
            <p className="text-white text-3xl font-black mb-8">{gameState.respawnTimer}s to Respawn</p>
            <button onClick={() => startGame(playerName, gameState.mode, MovementType.LAND)} className="w-full py-6 bg-green-600 rounded-3xl text-2xl font-black text-white uppercase mb-4">Respawn Now</button>
            <button onClick={() => setGameState(prev => ({ ...prev, status: 'START' }))} className="text-zinc-500 font-bold uppercase">Main Menu</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
