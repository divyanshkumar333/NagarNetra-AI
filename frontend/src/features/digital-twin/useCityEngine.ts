import * as THREE from "three";

export const GRID_SIZE = 20; // Expanded metropolitan size
export const BLOCK_SIZE = 48;
export const ROAD_WIDTH = 14;
export const SPACING = BLOCK_SIZE + ROAD_WIDTH;

export type DistrictType = "downtown" | "commercial" | "residential" | "industrial" | "park" | "stadium" | "government" | "tech-park" | "hospital" | "police" | "fire";

export interface Node {
  id: string;
  gridX: number;
  gridZ: number;
  pos: THREE.Vector3;
  edges: string[]; // Edge IDs
}

export interface Lane {
  id: string;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  direction: THREE.Vector3;
}

export interface Edge {
  id: string;
  startNode: string;
  endNode: string;
  lanes: Lane[];
  isHorizontal: boolean;
}

export interface BuildingData {
  id: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  type: string;
  hasHelipad?: boolean;
  hasSpire?: boolean;
  poiType?: string;
}

export interface CityData {
  nodes: Map<string, Node>;
  edges: Map<string, Edge>;
  buildings: BuildingData[];
  trees: { position: [number, number, number], scale: number }[];
  parks: { position: [number, number, number], scale: [number, number, number] }[];
}

export const isRiverBlock = (_x: number, _z: number): boolean => {
  return false;
};

function determineDistrict(x: number, z: number, max: number): DistrictType {
  const cx = max / 2;
  const cz = max / 2;
  const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(z - cz, 2));

  if (x === 2 && z === 2) return "stadium";
  if (x === 4 && z === 12) return "government";
  if (x === max - 5 && z === 4) return "tech-park";
  if (x === 8 && z === 3) return "police";
  if (x === 12 && z === 16) return "fire";
  if (x === 10 && z === 10) return "hospital";
  if (x >= max - 4 && z >= max - 4) return "industrial";
  if (dist < 4.0) return "downtown";
  if (dist < 7.0) return "commercial";
  if (Math.random() > 0.88) return "park";
  return "residential";
}

function generateGraph() {
  const nodes = new Map<string, Node>();
  const edges = new Map<string, Edge>();
  const offset = (GRID_SIZE * SPACING) / 2;

  // 1. Generate Nodes (Intersections)
  for (let x = 0; x <= GRID_SIZE; x++) {
    for (let z = 0; z <= GRID_SIZE; z++) {
      const id = `n_${x}_${z}`;
      const pos = new THREE.Vector3(x * SPACING - offset, 0, z * SPACING - offset);
      nodes.set(id, { id, gridX: x, gridZ: z, pos, edges: [] });
    }
  }

  // 2. Generate Edges (Roads) and Lanes
  const laneOffset = ROAD_WIDTH / 4; // 2 lanes each way
  
  for (let x = 0; x <= GRID_SIZE; x++) {
    for (let z = 0; z <= GRID_SIZE; z++) {
      const currentNode = `n_${x}_${z}`;
      
      // Horizontal Edge (x to x+1)
      if (x < GRID_SIZE) {
        const rightNode = `n_${x+1}_${z}`;
        const edgeId = `e_h_${x}_${z}`;
        const start = nodes.get(currentNode)!.pos;
        const end = nodes.get(rightNode)!.pos;
        
        const roadStart = start.x + ROAD_WIDTH / 2;
        const roadEnd = end.x - ROAD_WIDTH / 2;
        
        const lanes: Lane[] = [
          { id: `${edgeId}_f1`, startPos: new THREE.Vector3(roadStart, 0, start.z + laneOffset / 2), endPos: new THREE.Vector3(roadEnd, 0, start.z + laneOffset / 2), direction: new THREE.Vector3(1, 0, 0) },
          { id: `${edgeId}_f2`, startPos: new THREE.Vector3(roadStart, 0, start.z + laneOffset * 1.5), endPos: new THREE.Vector3(roadEnd, 0, start.z + laneOffset * 1.5), direction: new THREE.Vector3(1, 0, 0) },
          { id: `${edgeId}_b1`, startPos: new THREE.Vector3(roadEnd, 0, start.z - laneOffset / 2), endPos: new THREE.Vector3(roadStart, 0, start.z - laneOffset / 2), direction: new THREE.Vector3(-1, 0, 0) },
          { id: `${edgeId}_b2`, startPos: new THREE.Vector3(roadEnd, 0, start.z - laneOffset * 1.5), endPos: new THREE.Vector3(roadStart, 0, start.z - laneOffset * 1.5), direction: new THREE.Vector3(-1, 0, 0) }
        ];

        edges.set(edgeId, { id: edgeId, startNode: currentNode, endNode: rightNode, lanes, isHorizontal: true });
        nodes.get(currentNode)!.edges.push(edgeId);
        nodes.get(rightNode)!.edges.push(edgeId);
      }

      // Vertical Edge (z to z+1)
      if (z < GRID_SIZE) {
        const bottomNode = `n_${x}_${z+1}`;
        const edgeId = `e_v_${x}_${z}`;
        const start = nodes.get(currentNode)!.pos;
        const end = nodes.get(bottomNode)!.pos;
        
        const roadStart = start.z + ROAD_WIDTH / 2;
        const roadEnd = end.z - ROAD_WIDTH / 2;

        const lanes: Lane[] = [
          { id: `${edgeId}_f1`, startPos: new THREE.Vector3(start.x - laneOffset / 2, 0, roadStart), endPos: new THREE.Vector3(start.x - laneOffset / 2, 0, roadEnd), direction: new THREE.Vector3(0, 0, 1) },
          { id: `${edgeId}_f2`, startPos: new THREE.Vector3(start.x - laneOffset * 1.5, 0, roadStart), endPos: new THREE.Vector3(start.x - laneOffset * 1.5, 0, roadEnd), direction: new THREE.Vector3(0, 0, 1) },
          { id: `${edgeId}_b1`, startPos: new THREE.Vector3(start.x + laneOffset / 2, 0, roadEnd), endPos: new THREE.Vector3(start.x + laneOffset / 2, 0, roadStart), direction: new THREE.Vector3(0, 0, -1) },
          { id: `${edgeId}_b2`, startPos: new THREE.Vector3(start.x + laneOffset * 1.5, 0, roadEnd), endPos: new THREE.Vector3(start.x + laneOffset * 1.5, 0, roadStart), direction: new THREE.Vector3(0, 0, -1) }
        ];

        edges.set(edgeId, { id: edgeId, startNode: currentNode, endNode: bottomNode, lanes, isHorizontal: false });
        nodes.get(currentNode)!.edges.push(edgeId);
        nodes.get(bottomNode)!.edges.push(edgeId);
      }
    }
  }

  return { nodes, edges };
}

function generateCityBlocks(): Pick<CityData, "buildings" | "trees" | "parks"> {
  const buildings: BuildingData[] = [];
  const trees: { position: [number, number, number], scale: number }[] = [];
  const parks: { position: [number, number, number], scale: [number, number, number] }[] = [];
  
  const offset = (GRID_SIZE * SPACING) / 2;

  // Blocks exist between nodes (0 to GRID_SIZE - 1)
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      // Winding diagonal river channel
      if (isRiverBlock(x, z)) {
        continue;
      }

      const district = determineDistrict(x, z, GRID_SIZE);
      const centerX = x * SPACING + SPACING / 2 - offset;
      const centerZ = z * SPACING + SPACING / 2 - offset;

      if (district === "park") {
        parks.push({ position: [centerX, 0.1, centerZ], scale: [BLOCK_SIZE, 0.2, BLOCK_SIZE] });
        // Generate trees in park
        for(let i=0; i<15; i++) {
          trees.push({
            position: [centerX + (Math.random() - 0.5) * BLOCK_SIZE * 0.8, 0, centerZ + (Math.random() - 0.5) * BLOCK_SIZE * 0.8],
            scale: Math.random() * 0.5 + 0.8
          });
        }
        continue;
      }

      if (district === "stadium") {
        buildings.push({
          id: `stadium_${x}_${z}`,
          position: [centerX, 15, centerZ],
          scale: [BLOCK_SIZE * 0.85, 30, BLOCK_SIZE * 0.85],
          color: "#94a3b8",
          type: "stadium"
        });
        continue;
      }

      if (district === "government") {
        // Grand civic hall with neoclassical stone texture
        buildings.push({
          id: `gov_hall_${x}_${z}`,
          position: [centerX, 20, centerZ],
          scale: [BLOCK_SIZE * 0.8, 40, BLOCK_SIZE * 0.6],
          color: "#e2e8f0",
          type: "government",
          hasHelipad: true
        });
        continue;
      }

      if (district === "tech-park") {
        // High-tech architectural campus
        const campusColors = ["#0891b2", "#0d9488", "#0f172a"];
        buildings.push({
          id: `tech_hq_${x}_${z}_1`,
          position: [centerX - BLOCK_SIZE/4, 25, centerZ - BLOCK_SIZE/4],
          scale: [BLOCK_SIZE * 0.45, 50, BLOCK_SIZE * 0.45],
          color: campusColors[0],
          type: "tech-park",
          hasSpire: true,
          poiType: "Tech Center"
        });
        buildings.push({
          id: `tech_hq_${x}_${z}_2`,
          position: [centerX + BLOCK_SIZE/4, 35, centerZ + BLOCK_SIZE/4],
          scale: [BLOCK_SIZE * 0.45, 70, BLOCK_SIZE * 0.45],
          color: campusColors[1],
          type: "tech-park",
          hasHelipad: true,
          poiType: "Innovation Hub"
        });
        continue;
      }

      if (district === "hospital") {
        buildings.push({
          id: `hospital_${x}_${z}`,
          position: [centerX, 15, centerZ],
          scale: [BLOCK_SIZE * 0.75, 30, BLOCK_SIZE * 0.75],
          color: "#f8fafc",
          type: "hospital",
          poiType: "Hospital",
          hasHelipad: true
        });
        continue;
      }

      if (district === "police") {
        buildings.push({
          id: `police_${x}_${z}`,
          position: [centerX, 18, centerZ],
          scale: [BLOCK_SIZE * 0.7, 36, BLOCK_SIZE * 0.7],
          color: "#334155", // Sleek Navy-charcoal
          type: "police",
          poiType: "Police Station",
          hasSpire: true
        });
        continue;
      }

      if (district === "fire") {
        buildings.push({
          id: `fire_${x}_${z}`,
          position: [centerX, 14, centerZ],
          scale: [BLOCK_SIZE * 0.8, 28, BLOCK_SIZE * 0.7],
          color: "#991b1b", // Rich dark red
          type: "fire",
          poiType: "Fire Station"
        });
        continue;
      }

      // Generate buildings based on district
      let numBuildings = 1;
      let minHeight = 10;
      let maxHeight = 30;
      let colorPalette = ["#64748b", "#475569", "#334155"]; // Sleek corporate steel

      if (district === "downtown") {
        numBuildings = Math.floor(Math.random() * 2) + 1;
        minHeight = 85;
        maxHeight = 260;
        // Premium Dark Corporate Sky-Scraper Palette (Navy, Obsidian, Slate)
        colorPalette = ["#090d16", "#1e293b", "#0f172a", "#2d3748", "#1a202c"];
      } else if (district === "commercial") {
        numBuildings = Math.floor(Math.random() * 3) + 1;
        minHeight = 40;
        maxHeight = 110;
        // Slate corporate buildings (grey/glass highlights)
        colorPalette = ["#1b263b", "#273549", "#3c4a5e", "#0d9488", "#1a2536"];
      } else if (district === "residential") {
        numBuildings = Math.floor(Math.random() * 4) + 2;
        minHeight = 10;
        maxHeight = 25;
        // Cozy townhouses (Brick red, warm terracotta, warm whites)
        colorPalette = ["#f8fafc", "#f1f5f9", "#b45309", "#9a3412", "#d97706"];
      } else if (district === "industrial") {
        numBuildings = Math.floor(Math.random() * 2) + 1;
        minHeight = 15;
        maxHeight = 35;
        colorPalette = ["#57534e", "#44403c", "#292524"];
      }

      for (let b = 0; b < numBuildings; b++) {
        // Divide block space with sidewalk padding
        const paddedBlockSize = BLOCK_SIZE - 4;
        const width = (Math.random() * 0.4 + 0.3) * paddedBlockSize;
        const depth = (Math.random() * 0.4 + 0.3) * paddedBlockSize;
        const height = Math.random() * (maxHeight - minHeight) + minHeight;
        
        // Random offset within the padded block boundaries (to avoid spilling onto roads)
        const maxOffsetX = (paddedBlockSize - width) / 2;
        const maxOffsetZ = (paddedBlockSize - depth) / 2;
        
        const bX = centerX + (Math.random() * 2 - 1) * maxOffsetX;
        const bZ = centerZ + (Math.random() * 2 - 1) * maxOffsetZ;
        
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        const hasHelipad = district === "downtown" && height > 160 && Math.random() > 0.5;
        const hasSpire = district === "downtown" && height > 110 && !hasHelipad && Math.random() > 0.4;

        buildings.push({
          id: `bld_${x}_${z}_${b}`,
          position: [bX, height / 2, bZ],
          scale: [width, height, depth],
          color,
          type: district,
          hasHelipad,
          hasSpire
        });
      }

      // Generate sidewalk trees
      trees.push({ position: [centerX - BLOCK_SIZE/2, 0, centerZ - BLOCK_SIZE/2], scale: 1 });
      trees.push({ position: [centerX + BLOCK_SIZE/2, 0, centerZ - BLOCK_SIZE/2], scale: 1 });
      trees.push({ position: [centerX - BLOCK_SIZE/2, 0, centerZ + BLOCK_SIZE/2], scale: 1 });
      trees.push({ position: [centerX + BLOCK_SIZE/2, 0, centerZ + BLOCK_SIZE/2], scale: 1 });
    }
  }

  return { buildings, trees, parks };
}

export const cityData: CityData = (() => {
  const { nodes, edges } = generateGraph();
  const { buildings, trees, parks } = generateCityBlocks();
  return { nodes, edges, buildings, trees, parks };
})();

export function useCityEngine(): CityData {
  return cityData;
}
