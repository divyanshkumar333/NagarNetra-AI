import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { cityData, ROAD_WIDTH } from "./useCityEngine";

const dummy = new THREE.Object3D();
const color = new THREE.Color();

interface CityEnvironmentProps {
  trees: { position: [number, number, number], scale: number }[];
  parks: { position: [number, number, number], scale: [number, number, number] }[];
}

export function CityEnvironment({ trees, parks }: CityEnvironmentProps) {
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const activeIncident = useDigitalTwinStore((state) => state.activeIncident);
  const isNight = timeOfDay === "night";
  const isSunset = timeOfDay === "sunset";
  const isBlackout = activeIncident === "Blackout";

  const parkRef = useRef<THREE.InstancedMesh>(null);
  const treeTrunkRef = useRef<THREE.InstancedMesh>(null);
  const treeLeavesRef = useRef<THREE.InstancedMesh>(null);

  // Streetlights
  const lightPoleRef = useRef<THREE.InstancedMesh>(null);
  const lightArmRef = useRef<THREE.InstancedMesh>(null);
  const lightBulbRef = useRef<THREE.InstancedMesh>(null);

  const edges = Array.from(cityData.edges.values());

  // Streetlight color depending on time of day and blackout
  const lightBulbColor = isBlackout ? "#111111" : (isNight || isSunset) ? "#fef08a" : "#e2e8f0";
  const dimColor = isNight ? "#1e293b" : "#475569";

  useLayoutEffect(() => {
    // 1. Parks
    if (parkRef.current) {
      parks.forEach((park, i) => {
        dummy.position.set(...park.position);
        dummy.scale.set(...park.scale);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        parkRef.current!.setMatrixAt(i, dummy.matrix);
      });
      parkRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Trees (Organic green leaf colors)
    if (treeTrunkRef.current && treeLeavesRef.current) {
      const leafColors = ["#15803d", "#166534", "#14532d", "#22c55e", "#10b981"];
      trees.forEach((tree, i) => {
        const randY = Math.random() * Math.PI * 2;
        const trunkHeight = 3 * tree.scale;
        
        // Trunk
        dummy.position.set(tree.position[0], 0.1 + trunkHeight / 2, tree.position[2]);
        dummy.scale.set(0.4 * tree.scale, trunkHeight, 0.4 * tree.scale);
        dummy.rotation.set(0, randY, 0);
        dummy.updateMatrix();
        treeTrunkRef.current!.setMatrixAt(i, dummy.matrix);
        
        // Leaves (low-poly layered sphere)
        dummy.position.set(tree.position[0], 0.1 + trunkHeight + 1.2 * tree.scale, tree.position[2]);
        dummy.scale.set(2.8 * tree.scale, 2.8 * tree.scale, 2.8 * tree.scale);
        dummy.rotation.set(0.1 * Math.random(), randY, 0.1 * Math.random());
        dummy.updateMatrix();
        treeLeavesRef.current!.setMatrixAt(i, dummy.matrix);
        treeLeavesRef.current!.setColorAt(i, color.set(leafColors[i % leafColors.length]));
      });
      treeTrunkRef.current.instanceMatrix.needsUpdate = true;
      treeLeavesRef.current.instanceMatrix.needsUpdate = true;
      if (treeLeavesRef.current.instanceColor) {
        treeLeavesRef.current.instanceColor.needsUpdate = true;
      }
    }

    // 3. Streetlights
    if (lightPoleRef.current && lightArmRef.current && lightBulbRef.current) {
      let streetlightIdx = 0;
      edges.forEach((edge) => {
        const start = edge.lanes[0].startPos;
        const end = edge.lanes[0].endPos;
        const midX = (start.x + end.x) / 2;
        const midZ = (start.z + end.z) / 2;
        const len = edge.isHorizontal ? Math.abs(end.x - start.x) : Math.abs(end.z - start.z);

        // Place 4 streetlights per road edge on the sidewalks
        const positions: [number, number, number, number][] = [];
        const gap = len * 0.25;
        const offset = ROAD_WIDTH / 2 + 0.6; // sit on the sidewalk curb

        if (edge.isHorizontal) {
          positions.push([midX - gap, 0.1, start.z - offset, 0]); // facing south
          positions.push([midX + gap, 0.1, start.z - offset, 0]);
          positions.push([midX - gap, 0.1, start.z + offset, Math.PI]); // facing north
          positions.push([midX + gap, 0.1, start.z + offset, Math.PI]);
        } else {
          positions.push([start.x - offset, 0.1, midZ - gap, -Math.PI / 2]); // facing east
          positions.push([start.x - offset, 0.1, midZ + gap, -Math.PI / 2]);
          positions.push([start.x + offset, 0.1, midZ - gap, Math.PI / 2]); // facing west
          positions.push([start.x + offset, 0.1, midZ + gap, Math.PI / 2]);
        }

        positions.forEach(([px, py, pz, rotY]) => {
          // Pole
          dummy.position.set(px, py + 2.5, pz);
          dummy.scale.set(0.08, 5.0, 0.08);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          lightPoleRef.current!.setMatrixAt(streetlightIdx, dummy.matrix);
          lightPoleRef.current!.setColorAt(streetlightIdx, color.set(dimColor));

          // Arm extending slightly over the street
          const armLen = 1.0;
          const armAngle = rotY;
          const armX = px + Math.sin(armAngle) * (armLen / 2);
          const armZ = pz + Math.cos(armAngle) * (armLen / 2);

          dummy.position.set(armX, py + 5.0, armZ);
          dummy.scale.set(0.06, armLen, 0.06);
          dummy.rotation.set(Math.PI / 2, 0, -armAngle);
          dummy.updateMatrix();
          lightArmRef.current!.setMatrixAt(streetlightIdx, dummy.matrix);
          lightArmRef.current!.setColorAt(streetlightIdx, color.set(dimColor));

          // Active light bulb at end of the arm
          const bulbX = px + Math.sin(armAngle) * armLen;
          const bulbZ = pz + Math.cos(armAngle) * armLen;
          dummy.position.set(bulbX, py + 4.8, bulbZ);
          dummy.scale.set(0.2, 0.12, 0.2);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          lightBulbRef.current!.setMatrixAt(streetlightIdx, dummy.matrix);
          lightBulbRef.current!.setColorAt(streetlightIdx, color.set(lightBulbColor));

          streetlightIdx++;
        });
      });
      lightPoleRef.current.instanceMatrix.needsUpdate = true;
      lightArmRef.current.instanceMatrix.needsUpdate = true;
      lightBulbRef.current.instanceMatrix.needsUpdate = true;
      
      if (lightPoleRef.current.instanceColor) lightPoleRef.current.instanceColor.needsUpdate = true;
      if (lightArmRef.current.instanceColor) lightArmRef.current.instanceColor.needsUpdate = true;
      if (lightBulbRef.current.instanceColor) lightBulbRef.current.instanceColor.needsUpdate = true;
    }
  }, [trees, parks, edges, lightBulbColor, dimColor]);

  const numStreetlights = edges.length * 4;

  return (
    <group>
      {/* Parks */}
      <instancedMesh ref={parkRef} args={[undefined, undefined, parks.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={isNight ? "#064e3b" : "#22c55e"} roughness={1} />
      </instancedMesh>

      {/* Tree Trunks */}
      <instancedMesh ref={treeTrunkRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </instancedMesh>

      {/* Tree Leaves */}
      <instancedMesh ref={treeLeavesRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow>
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>

      {/* Streetlight Poles */}
      <instancedMesh ref={lightPoleRef} args={[undefined, undefined, numStreetlights]} castShadow>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial roughness={0.4} metalness={0.8} />
      </instancedMesh>

      {/* Streetlight Arms */}
      <instancedMesh ref={lightArmRef} args={[undefined, undefined, numStreetlights]} castShadow>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial roughness={0.4} metalness={0.8} />
      </instancedMesh>

      {/* Streetlight Glowing Bulbs */}
      <instancedMesh ref={lightBulbRef} args={[undefined, undefined, numStreetlights]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial 
          roughness={0.1}
          metalness={0.9}
          emissive={(!isBlackout && (isNight || isSunset)) ? "#fef08a" : "#000000"}
          emissiveIntensity={isBlackout ? 0 : isNight ? 6 : isSunset ? 3 : 0}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
