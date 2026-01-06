
import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { GameState, Player, AnimalType, MovementType } from '../types';
import { WORLD_SIZE, ANIMAL_DATA, EVOLUTION_TREE } from '../constants';

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onGameOver: () => void;
}

const GameCanvas: React.FC<Props> = ({ gameState, setGameState, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const requestRef = useRef<number | undefined>(undefined);
  const renderLoopRef = useRef<number | undefined>(undefined);
  const gameStateRef = useRef(gameState);
  const frameCountRef = useRef(0);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            setGameState(prev => {
                const stats = ANIMAL_DATA[prev.player.animalType];
                if (stats.movement === MovementType.WATER && prev.player.isUnderwater) {
                    return { ...prev, player: { ...prev.player, isDiving: !prev.player.isDiving } };
                }
                return prev;
            });
        }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setGameState]);

  const pangeaPath = useMemo(() => {
    const points = [];
    const cx = WORLD_SIZE / 2; const cy = WORLD_SIZE / 2; const r = WORLD_SIZE * 0.35; const steps = 100;
    for (let i = 0; i < steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        let radius = r + (Math.sin(theta * 3) * 600) + (Math.cos(theta * 7) * 300);
        if (theta > 0.2 && theta < 1.5) radius *= 0.4;
        points.push({ x: cx + Math.cos(theta) * radius, y: cy + Math.sin(theta) * radius });
    }
    return points;
  }, []);

  const isPointInPolygon = (x: number, y: number, polygon: {x: number, y: number}[]) => {
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const xi = polygon[i].x, yi = polygon[i].y, xj = polygon[j].x, yj = polygon[j].y;
          const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
      }
      return inside;
  };

  const update = useCallback(() => {
    frameCountRef.current++;
    setGameState(prev => {
      if (prev.status !== 'PLAYING') return prev;
      const player = { ...prev.player };
      const others = [...prev.others];
      const food = [...prev.food];
      const clouds = [...prev.clouds];
      const mapObjects = prev.mapObjects;
      
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const dx = mousePos.current.x - centerX;
      const dy = mousePos.current.y - centerY;
      const angle = Math.atan2(dy, dx);
      const distToMouse = Math.sqrt(dx * dx + dy * dy);
      
      const stats = ANIMAL_DATA[player.animalType];
      let moveSpeed = stats.speed * (distToMouse > 50 ? 1 : distToMouse / 50);
      
      const onLand = isPointInPolygon(player.x, player.y, pangeaPath);
      player.isUnderwater = !onLand;

      if (player.abilityActiveUntil && Date.now() < player.abilityActiveUntil) moveSpeed *= 1.8;
      if (player.isDiving || player.isHiding) moveSpeed *= 0.5;

      // Biome Survival Logic
      if (stats.movement === MovementType.WATER) {
          if (onLand) { player.water = Math.max(0, player.water - 2); player.health -= 0.5; } 
          else { player.water = Math.min(100, player.water + 2); player.health = Math.min(100, player.health + 0.5); }
          player.air = 100;
      } else if (stats.movement === MovementType.LAND) {
          if (!onLand) { player.water = Math.min(100, player.water + 1); player.air = Math.max(0, player.air - 1.5); } 
          else { player.air = Math.min(100, player.air + 1); player.water = Math.max(0, player.water - 0.05); }
      } else if (stats.movement === MovementType.AIR) {
          if (!onLand) player.water = Math.min(100, player.water + 1);
          else player.water = Math.max(0, player.water - 0.05);
          player.air = 100;
      }

      if (player.air <= 0 || player.water <= 0) player.health -= 0.5;
      if (player.health <= 0) { onGameOver(); return prev; }

      let inBurrow = false;
      for (const obj of mapObjects) {
          if (obj.objType === 'BURROW') {
              const d = Math.sqrt((player.x - obj.x)**2 + (player.y - obj.y)**2);
              if (d < obj.radius - 5) inBurrow = true;
          } else if (obj.objType === 'GEM_NODE') {
              const d = Math.sqrt((player.x - obj.x)**2 + (player.y - obj.y)**2);
              if (d < obj.radius + player.radius) {
                  player.xp += 2;
                  player.score += 2;
              }
          }
      }
      player.isHiding = inBurrow;

      if (!onLand && stats.movement === MovementType.LAND) moveSpeed *= 0.4;
      if (onLand && stats.movement === MovementType.WATER) moveSpeed *= 0.2;

      player.angle = angle;
      player.x += Math.cos(angle) * moveSpeed;
      player.y += Math.sin(angle) * moveSpeed;
      player.x = Math.max(0, Math.min(WORLD_SIZE, player.x));
      player.y = Math.max(0, Math.min(WORLD_SIZE, player.y));

      // CLOUD LOGIC
      for (let i = clouds.length - 1; i >= 0; i--) {
          const c = clouds[i];
          c.x += c.speed;
          if (c.x > WORLD_SIZE + 300) c.x = -300;
          const dist = Math.sqrt((player.x - c.x)**2 + (player.y - c.y)**2);
          if (dist < c.radius + player.radius) {
             c.hp -= 1; player.xp += 1; player.score += 1;
             if (c.hp <= 0) {
                 player.xp += c.xpReward; player.score += c.xpReward;
                 c.x = -300 - Math.random() * 500; c.y = Math.random() * WORLD_SIZE; c.hp = c.maxHp;
             }
          }
      }

      others.forEach(ai => {
        const aiStats = ANIMAL_DATA[ai.animalType];
        if (ai.xp >= aiStats.xpRequired) {
             const upgrades = EVOLUTION_TREE[ai.animalType];
             if (upgrades && upgrades.length > 0) {
                 const next = upgrades[Math.floor(Math.random() * upgrades.length)];
                 ai.animalType = next; ai.radius = ANIMAL_DATA[next].radius; ai.xp = 0; ai.health = 100;
             } else { ai.xp = 0; }
        }
        if (!ai.targetX || Math.abs(ai.x - ai.targetX) < 20 || Math.random() < 0.01) {
             ai.targetX = Math.random() * WORLD_SIZE; ai.targetY = Math.random() * WORLD_SIZE;
        }
        const desiredAngle = Math.atan2(ai.targetY - ai.y, ai.targetX - ai.x);
        let da = desiredAngle - ai.angle;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        ai.angle += da * 0.05;
        let aiSpeed = aiStats.speed * 0.5;
        const aiOnLand = isPointInPolygon(ai.x, ai.y, pangeaPath);
        if (aiStats.movement === MovementType.WATER && aiOnLand) aiSpeed = 0.5; 
        if (aiStats.movement === MovementType.LAND && !aiOnLand) aiSpeed = 1;
        ai.x += Math.cos(ai.angle) * aiSpeed;
        ai.y += Math.sin(ai.angle) * aiSpeed;
      });

      for (let i = food.length - 1; i >= 0; i--) {
        const f = food[i];
        if (f.isFlying) { f.x += (Math.random() - 0.5) * 4; f.y += (Math.random() - 0.5) * 4; }
        if (Math.sqrt((player.x - f.x)**2 + (player.y - f.y)**2) < player.radius + f.radius) {
           const canEat = (stats.movement === MovementType.AIR && (f.isFlying || f.isGem)) || 
                          (stats.movement === MovementType.WATER && (!f.isFlying || f.isGem)) ||
                          (stats.movement === MovementType.LAND && (!f.isFlying || f.isGem));
           if (canEat) { player.xp += f.xpValue; player.score += f.xpValue; food.splice(i, 1); continue; }
        }
        for (const ai of others) {
            if (Math.sqrt((ai.x - f.x)**2 + (ai.y - f.y)**2) < ai.radius + f.radius) {
                ai.xp += f.xpValue; ai.score += f.xpValue; food.splice(i, 1); break;
            }
        }
      }

      for (let i = others.length - 1; i >= 0; i--) {
          const ai = others[i];
          const dist = Math.sqrt((player.x - ai.x)**2 + (player.y - ai.y)**2);
          if (dist < player.radius + ai.radius) {
              if (player.radius > ai.radius * 1.2 && !ai.isHiding && !ai.isDiving) {
                  const aiStats = ANIMAL_DATA[ai.animalType];
                  if (aiStats.movement === MovementType.AIR && aiStats.level >= 15) {
                      ai.health -= 20;
                      const bumpAngle = Math.atan2(ai.y - player.y, ai.x - player.x);
                      ai.x += Math.cos(bumpAngle) * 50; ai.y += Math.sin(bumpAngle) * 50;
                      if (ai.health <= 0) { player.xp += 2000; player.score += 5000; others.splice(i, 1); }
                  } else { player.xp += 300; player.score += 1000; others.splice(i, 1); }
              } else if (ai.radius > player.radius * 1.2 && !player.isHiding && !player.isDiving) {
                  onGameOver(); return prev;
              }
          }
      }
      return { ...prev, player, others, food, clouds };
    });
    requestRef.current = requestAnimationFrame(update);
  }, [onGameOver, pangeaPath, setGameState]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [update]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    // --- HIGH DPI HANDLING ---
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);
    // -------------------------

    // High Quality Vector Drawing Logic
    const drawCharacter = (p: Player, isSelf: boolean) => {
      const stats = ANIMAL_DATA[p.animalType];
      if ((p.isHiding || p.isDiving) && !isSelf) return;

      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.isHiding || p.isDiving) ctx.globalAlpha = 0.4;
      
      ctx.rotate(p.angle);
      
      // SHAPE & COLOR LOGIC (Vector Art Style)
      
      const drawBody = (color: string, scaleX: number, scaleY: number, detailFn?: () => void) => {
          ctx.save();
          ctx.scale(scaleX, scaleY);
          
          // 3D Sphere Effect Gradient
          const grad = ctx.createRadialGradient(-p.radius*0.2, -p.radius*0.2, p.radius*0.2, 0, 0, p.radius);
          grad.addColorStop(0, color);
          grad.addColorStop(1, shadeColor(color, -20)); // Darker edge

          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, Math.PI*2); ctx.fill();
          
          // Texture Pattern (Scales)
          ctx.strokeStyle = 'rgba(0,0,0,0.1)';
          ctx.lineWidth = 1;
          for(let i=0; i<3; i++) {
              ctx.beginPath();
              ctx.arc(-p.radius*0.4 + (i*10), -p.radius*0.2, 5, 0, Math.PI);
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(-p.radius*0.4 + (i*10) + 5, -p.radius*0.2 + 8, 5, 0, Math.PI);
              ctx.stroke();
          }

          // Rim Lighting (Top Left)
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.beginPath(); ctx.arc(-p.radius*0.2, -p.radius*0.2, p.radius*0.9, 0, Math.PI*2); ctx.fill();
          
          // Clean Outline
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(0,0,0,0.4)';
          ctx.stroke();
          
          ctx.restore();
          
          if (detailFn) detailFn();
      };

      const breathe = Math.sin(frameCountRef.current * 0.05) * 0.02;
      const moveWag = Math.sin(frameCountRef.current * 0.2) * 0.1;
      const legMove = Math.sin(frameCountRef.current * 0.4) * 0.5;

      if (stats.movement === MovementType.AIR) {
          // Wings
          const wingSpeed = stats.name === 'Dragonfly' ? 0.8 : 0.2;
          const wingSpread = Math.sin(frameCountRef.current * wingSpeed) * 0.5;
          
          ctx.fillStyle = stats.name === 'Dragonfly' ? '#81d4fa' : 'rgba(255,255,255,0.8)';
          if (stats.name === 'Quetzal') ctx.fillStyle = '#e040fb';

          ctx.save(); ctx.rotate(-0.5 + wingSpread); 
          ctx.beginPath(); ctx.ellipse(0, p.radius, p.radius*1.5, p.radius*0.5, 0, 0, Math.PI*2); 
          ctx.fill(); ctx.stroke(); ctx.restore();
          
          ctx.save(); ctx.rotate(0.5 - wingSpread); 
          ctx.beginPath(); ctx.ellipse(0, -p.radius, p.radius*1.5, p.radius*0.5, 0, 0, Math.PI*2); 
          ctx.fill(); ctx.stroke(); ctx.restore();

          drawBody(stats.color, 1 + breathe, 0.8 + breathe, () => {
             ctx.fillStyle = '#ffecb3'; // Beak
             ctx.beginPath(); ctx.arc(p.radius*0.6, 0, p.radius*0.3, 0, Math.PI*2); ctx.fill(); ctx.stroke();
          });

      } else if (stats.movement === MovementType.WATER) {
          // Tail
          ctx.save(); ctx.translate(-p.radius, 0); ctx.rotate(moveWag * 2);
          ctx.fillStyle = stats.color;
          ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-p.radius, -p.radius*0.5); ctx.lineTo(-p.radius, p.radius*0.5); ctx.fill(); ctx.stroke();
          ctx.restore();

          // Fins with animation
          ctx.save(); ctx.rotate(moveWag * 0.5);
          ctx.fillStyle = stats.color;
          ctx.beginPath(); ctx.ellipse(0, p.radius*0.7, p.radius*0.3, p.radius*0.6, 0.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(0, -p.radius*0.7, p.radius*0.3, p.radius*0.6, -0.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
          ctx.restore();

          drawBody(stats.color, 1.2 + breathe, 0.7 + breathe, () => {
             ctx.fillStyle = 'rgba(0,0,0,0.1)';
             ctx.beginPath(); ctx.rect(-p.radius*0.5, -p.radius*0.5, p.radius*0.2, p.radius); ctx.fill();
          });

      } else {
          // Land Legs
          ctx.fillStyle = shadeColor(stats.color, -30);
          ctx.save(); ctx.translate(p.radius*0.2, p.radius*0.6); ctx.rotate(legMove);
          ctx.beginPath(); ctx.ellipse(0, 0, p.radius*0.2, p.radius*0.4, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore();
          
          ctx.save(); ctx.translate(p.radius*0.2, -p.radius*0.6); ctx.rotate(-legMove);
          ctx.beginPath(); ctx.ellipse(0, 0, p.radius*0.2, p.radius*0.4, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore();

          // Tail
          ctx.save(); ctx.rotate(moveWag);
          ctx.fillStyle = stats.color;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-p.radius*2.2, -5); ctx.lineTo(-p.radius*2.2, 5); ctx.fill(); ctx.stroke();
          ctx.restore();
          
          // Spine details
          if (p.animalType !== AnimalType.TREX && p.animalType !== AnimalType.COMPSOGNATHUS) {
              ctx.fillStyle = shadeColor(stats.color, -40);
              for(let i=0; i<4; i++) {
                 ctx.beginPath(); ctx.moveTo(-p.radius*0.5 + (i*15), -p.radius*0.8);
                 ctx.lineTo(-p.radius*0.3 + (i*15), -p.radius*1.1);
                 ctx.lineTo(-p.radius*0.1 + (i*15), -p.radius*0.8);
                 ctx.fill();
              }
          }

          drawBody(stats.color, 1 + breathe, 1 + breathe, () => {
             if (p.animalType === AnimalType.TRICERATOPS) {
                 ctx.fillStyle = '#fff';
                 ctx.beginPath(); ctx.moveTo(p.radius*0.5, -p.radius*0.3); ctx.lineTo(p.radius*1.5, -p.radius*0.6); ctx.lineTo(p.radius*0.6, -p.radius*0.1); ctx.fill();
                 ctx.beginPath(); ctx.moveTo(p.radius*0.5, p.radius*0.3); ctx.lineTo(p.radius*1.5, p.radius*0.6); ctx.lineTo(p.radius*0.6, p.radius*0.1); ctx.fill();
             }
             if (p.animalType === AnimalType.TREX || p.animalType === AnimalType.SPINOSAURUS) {
                 ctx.fillStyle = p.animalType === AnimalType.SPINOSAURUS ? '#f44336' : 'rgba(0,0,0,0.3)';
                 ctx.beginPath(); ctx.ellipse(-p.radius*0.2, 0, p.radius*0.8, p.radius*0.9, 0, 0, Math.PI*2); ctx.fill();
             }
          });
      }

      // High Res Eyes
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(p.radius*0.5, -p.radius*0.3, p.radius*0.25, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.radius*0.5, p.radius*0.3, p.radius*0.25, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      
      ctx.fillStyle = 'black';
      ctx.beginPath(); ctx.arc(p.radius*0.6, -p.radius*0.3, p.radius*0.1, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(p.radius*0.6, p.radius*0.3, p.radius*0.1, 0, Math.PI*2); ctx.fill();
      
      // Eye Shine
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(p.radius*0.65, -p.radius*0.35, p.radius*0.05, 0, Math.PI*2); ctx.fill();

      ctx.restore();
      
      const startY = p.y - p.radius - 20;
      const barW = p.radius * 2;
      ctx.fillStyle = '#222'; ctx.fillRect(p.x - barW/2, startY, barW, 4);
      ctx.fillStyle = '#4caf50'; ctx.fillRect(p.x - barW/2, startY, barW * (p.health/100), 4);
      
      ctx.fillStyle = 'white'; 
      ctx.font = '800 10px Inter'; 
      ctx.textAlign = 'center'; 
      ctx.fillText(p.name, p.x, startY - 5);
    };

    const render = () => {
      const gs = gameStateRef.current; const { player, others, food, clouds, mapObjects } = gs;
      const w = window.innerWidth; const h = window.innerHeight;
      ctx.save(); ctx.translate(w/2 - player.x, h/2 - player.y);
      
      // Ocean Background
      ctx.fillStyle = '#01579b'; ctx.fillRect(player.x-w, player.y-h, w*2, h*2);
      
      // Pangea Land
      ctx.fillStyle = '#4caf50'; ctx.beginPath(); pangeaPath.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)); ctx.fill();
      ctx.strokeStyle = '#388e3c'; ctx.lineWidth = 20; ctx.stroke();

      // Draw Objects
      mapObjects.forEach(obj => {
        if (Math.abs(obj.x - player.x) > w || Math.abs(obj.y - player.y) > h) return;
        ctx.save(); ctx.translate(obj.x, obj.y);
        if (obj.objType === 'ROCK') { ctx.fillStyle = '#616161'; ctx.beginPath(); ctx.arc(0,0,obj.radius, 0, Math.PI*2); ctx.fill(); ctx.stroke(); }
        else if (obj.objType === 'BURROW') { ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.arc(0,0,obj.radius, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0,0,obj.radius*0.7, 0, Math.PI*2); ctx.fill(); }
        else if (obj.objType === 'GEM_NODE') {
             ctx.fillStyle = '#e040fb'; ctx.shadowColor = '#e040fb'; ctx.shadowBlur = 20;
             ctx.beginPath(); for(let i=0; i<6; i++) { const th = (i * Math.PI * 2) / 6; const x = Math.cos(th) * obj.radius; const y = Math.sin(th) * obj.radius; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
        }
        else { ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.arc(0,0,obj.radius, 0, Math.PI*2); ctx.fill(); ctx.stroke(); }
        ctx.restore();
      });

      // Food & Gems
      food.forEach(f => {
        if (Math.abs(f.x - player.x) > w/2 + 50 || Math.abs(f.y - player.y) > h/2 + 50) return;
        if (f.isGem) {
             ctx.fillStyle = f.color; ctx.beginPath(); ctx.moveTo(f.x, f.y-f.radius); ctx.lineTo(f.x+f.radius, f.y); ctx.lineTo(f.x, f.y+f.radius); ctx.lineTo(f.x-f.radius, f.y); ctx.fill();
        } else {
             ctx.fillStyle = f.color; 
             if(f.isFlying) { ctx.beginPath(); ctx.arc(f.x, f.y, f.radius, 0, Math.PI*2); ctx.fill(); }
             else { ctx.beginPath(); ctx.arc(f.x, f.y, f.radius, 0, Math.PI*2); ctx.fill(); }
        }
      });

      others.forEach(o => drawCharacter(o, false));
      drawCharacter(player, true);

      // Improved Clouds
      clouds.forEach((c, idx) => {
          if (Math.abs(c.x - player.x) > w + 200 || Math.abs(c.y - player.y) > h + 200) return;
          ctx.save(); ctx.translate(c.x, c.y);
          
          // Soft Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.1)';
          ctx.beginPath(); ctx.arc(20, 40, c.radius, 0, Math.PI*2); ctx.fill();

          // Fluffy Cloud Procedural Draw
          ctx.fillStyle = `rgba(255,255,255,${c.opacity})`;
          const puffCount = 5 + (idx % 3);
          for(let i=0; i<puffCount; i++) {
              const angle = (i / puffCount) * Math.PI * 2;
              const dist = c.radius * 0.4;
              ctx.beginPath();
              ctx.arc(Math.cos(angle)*dist, Math.sin(angle)*dist, c.radius * 0.6, 0, Math.PI*2);
              ctx.fill();
          }
          ctx.beginPath(); ctx.arc(0,0,c.radius * 0.7, 0, Math.PI*2); ctx.fill();

          if(c.hp < c.maxHp) { ctx.fillStyle = '#f44336'; ctx.fillRect(-20, -10, 40 * (c.hp/c.maxHp), 4); }
          ctx.restore();
      });

      ctx.restore();
      renderLoopRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(renderLoopRef.current!);
  }, [pangeaPath]);

  return <canvas ref={canvasRef} className="w-full h-full cursor-default" />;
};

// Helper to darken/lighten hex color
function shadeColor(color: string, percent: number) {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);
    R = Math.floor(R * (100 + percent) / 100);
    G = Math.floor(G * (100 + percent) / 100);
    B = Math.floor(B * (100 + percent) / 100);
    R = (R<255)?R:255; G = (G<255)?G:255; B = (B<255)?B:255; 
    const RR = ((R.toString(16).length===1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length===1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length===1)?"0"+B.toString(16):B.toString(16));
    return "#"+RR+GG+BB;
}

export default GameCanvas;