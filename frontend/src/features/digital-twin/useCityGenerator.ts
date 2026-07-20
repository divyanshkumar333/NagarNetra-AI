import { useMemo } from "react";

const GRID_SIZE = 12; // 12x12 blocks
const BLOCK_SIZE = 40;
const ROAD_WIDTH = 12;
const SPACING = BLOCK_SIZE + ROAD_WIDTH;

function generateCityData() {
  const buildings: { position: [number, number, number], scale: [number, number, number], color: string, id: string }[] = [];
  const roads: { position: [number, number, number], scale: [number, number, number] }[] = [];
  const parks: { position: [number, number, number], scale: [number, number, number] }[] = [];
  
  const centerOffset = (GRID_SIZE * SPACING) / 2;

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      const posX = x * SPACING - centerOffset;
      const posZ = z * SPACING - centerOffset;

      // 10% chance of a park, otherwise buildings
      if (Math.random() > 0.9 && x > 0 && z > 0 && x < GRID_SIZE - 1 && z < GRID_SIZE - 1) {
        parks.push({ position: [posX, 0.1, posZ], scale: [BLOCK_SIZE, 0.2, BLOCK_SIZE] });
      } else {
        // Generate 1-4 buildings per block
        const numBuildings = Math.floor(Math.random() * 4) + 1;
        for (let b = 0; b < numBuildings; b++) {
          const width = (Math.random() * 0.5 + 0.5) * (BLOCK_SIZE / 2);
          const depth = (Math.random() * 0.5 + 0.5) * (BLOCK_SIZE / 2);
          const height = Math.random() > 0.8 ? Math.random() * 80 + 40 : Math.random() * 30 + 10;
          
          const bX = posX + (Math.random() - 0.5) * (BLOCK_SIZE - width);
          const bZ = posZ + (Math.random() - 0.5) * (BLOCK_SIZE - depth);
          
          const isTall = height > 60;
          const color = isTall ? "#1e293b" : "#334155";

          buildings.push({
            id: `bld-${x}-${z}-${b}`,
            position: [bX, height / 2, bZ],
            scale: [width, height, depth],
            color
          });
        }
      }

      // Horizontal roads
      if (z < GRID_SIZE - 1) {
        roads.push({
          position: [posX, 0.05, posZ + BLOCK_SIZE / 2 + ROAD_WIDTH / 2],
          scale: [BLOCK_SIZE + ROAD_WIDTH, 0.1, ROAD_WIDTH]
        });
      }
      // Vertical roads
      if (x < GRID_SIZE - 1) {
        roads.push({
          position: [posX + BLOCK_SIZE / 2 + ROAD_WIDTH / 2, 0.05, posZ],
          scale: [ROAD_WIDTH, 0.1, BLOCK_SIZE + ROAD_WIDTH]
        });
      }
      // Intersections
      if (x < GRID_SIZE - 1 && z < GRID_SIZE - 1) {
        roads.push({
          position: [posX + BLOCK_SIZE / 2 + ROAD_WIDTH / 2, 0.06, posZ + BLOCK_SIZE / 2 + ROAD_WIDTH / 2],
          scale: [ROAD_WIDTH, 0.1, ROAD_WIDTH]
        });
      }
    }
  }
  return { buildings, roads, parks };
}

export function useCityGenerator() {
  return useMemo(() => generateCityData(), []);
}
