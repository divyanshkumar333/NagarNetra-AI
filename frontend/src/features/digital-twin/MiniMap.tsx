import { useEffect, useRef } from "react";
import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { cityData, GRID_SIZE, SPACING, isRiverBlock } from "./useCityEngine";

export function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const followedPosition = useDigitalTwinStore((state) => state.followedPosition);
  const cameraMode = useDigitalTwinStore((state) => state.cameraMode);

  // Translate world units to canvas coordinates
  // City spans from -620 to 620
  const WORLD_BOUND = (GRID_SIZE * SPACING) / 2;

  const toCanvasCoords = (wx: number, wz: number, width: number, height: number) => {
    const cx = ((wx + WORLD_BOUND) / (WORLD_BOUND * 2)) * width;
    const cz = ((wz + WORLD_BOUND) / (WORLD_BOUND * 2)) * height;
    return [cx, cz];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;

    // Draw background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    // 1. Draw River
    ctx.fillStyle = "#1e3a8a";
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        if (isRiverBlock(x, z)) {
          const rx = x * SPACING - WORLD_BOUND + SPACING / 2;
          const rz = z * SPACING - WORLD_BOUND + SPACING / 2;
          const [cx, cz] = toCanvasCoords(rx, rz, width, height);
          ctx.fillRect(cx - 3, cz - 3, 6, 6);
        }
      }
    }

    // 2. Draw Roads
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.5;
    cityData.edges.forEach((edge) => {
      const start = edge.lanes[0].startPos;
      const end = edge.lanes[0].endPos;
      const [sx, sz] = toCanvasCoords(start.x, start.z, width, height);
      const [ex, ez] = toCanvasCoords(end.x, end.z, width, height);

      ctx.beginPath();
      ctx.moveTo(sx, sz);
      ctx.lineTo(ex, ez);
      ctx.stroke();
    });

    // 3. Draw Buildings (small squares)
    ctx.fillStyle = "#1e293b";
    cityData.buildings.forEach((bld) => {
      const [cx, cz] = toCanvasCoords(bld.position[0], bld.position[2], width, height);
      const bSize = (bld.scale[0] / (WORLD_BOUND * 2)) * width;
      ctx.fillRect(cx - bSize/2, cz - bSize/2, bSize, bSize);
    });

    // 4. Draw Current Position (Yellow Arrow or Dot)
    if (followedPosition) {
      const [wx, , wz] = followedPosition;
      const [cx, cz] = toCanvasCoords(wx, wz, width, height);
      
      // Draw pulsing circle
      ctx.beginPath();
      ctx.arc(cx, cz, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#f59e0b";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [followedPosition]);

  return (
    <div className="absolute bottom-6 left-6 p-2 bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-xl shadow-2xl flex flex-col items-center">
      <div className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mb-1.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        Tactical Minimap ({cameraMode.toUpperCase()})
      </div>
      <canvas 
        ref={canvasRef} 
        width={160} 
        height={160} 
        className="rounded-lg border border-slate-800 shadow-inner"
      />
    </div>
  );
}
