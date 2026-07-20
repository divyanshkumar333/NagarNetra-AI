import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { useAIEngineStore } from "../ai-engine/useAIEngineStore";
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { cityData } from "./useCityEngine";

export function AIOverlay() {
  const heatmapsEnabled = useDigitalTwinStore((state) => state.heatmapsEnabled);
  const hotspots = useAIEngineStore((state) => state.hotspots);
  
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (materialRef.current && heatmapsEnabled) {
      // Pulse effect
      materialRef.current.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group position={[0, 0.2, 0]}>
      {heatmapsEnabled && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1000, 1000, 32, 32]} />
          <meshStandardMaterial 
            ref={materialRef}
            color="#ef4444" 
            transparent 
            opacity={0.15} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Holographic AI Neural Grid Overlay */}
      {heatmapsEnabled && Array.from(cityData.edges.values()).map((edge) => {
         const isCongested = edge.id.includes("main") || edge.id.includes("junction") || edge.id.includes("accident");
         const color = isCongested ? "#ef4444" : "#0ea5e9"; // Neon Red vs Neon Cyan
         const emissiveIntensity = isCongested ? 2.5 : 1.0;
         
         return edge.lanes.map((lane) => {
           const dx = lane.endPos.x - lane.startPos.x;
           const dz = lane.endPos.z - lane.startPos.z;
           const posX = lane.startPos.x + dx / 2;
           const posZ = lane.startPos.z + dz / 2;
           
           return (
             <mesh key={lane.id} position={[posX, 0.05, posZ]}>
               <boxGeometry args={[Math.max(0.6, Math.abs(dx)), 0.1, Math.max(0.6, Math.abs(dz))]} />
               <meshStandardMaterial 
                 color={color} 
                 emissive={color}
                 emissiveIntensity={emissiveIntensity}
                 transparent
                 opacity={0.35}
                 depthWrite={false}
               />
             </mesh>
           );
         });
      })}

      {/* Dynamic AI Hotspots */}
      {heatmapsEnabled && hotspots.map((hotspot) => (
        <mesh key={hotspot.id} position={[hotspot.location[0], 1, hotspot.location[1]]}>
          <cylinderGeometry args={[15, 15, 20, 32]} />
          <meshStandardMaterial 
            color="#ef4444" 
            emissive="#ef4444"
            emissiveIntensity={2}
            transparent
            opacity={0.6 * (hotspot.severity / 100)}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}
