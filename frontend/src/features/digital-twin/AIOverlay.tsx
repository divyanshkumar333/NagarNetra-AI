import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function AIOverlay() {
  const heatmapsEnabled = useDigitalTwinStore((state) => state.heatmapsEnabled);
  const activeIncident = useDigitalTwinStore((state) => state.activeIncident);
  
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (materialRef.current && heatmapsEnabled) {
      // Pulse effect
      materialRef.current.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
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
            opacity={0.3} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Incident Marker */}
      {activeIncident && (
        <mesh position={[-100, 1, -60]}>
          <cylinderGeometry args={[15, 15, 20, 32]} />
          <meshStandardMaterial 
            color="#ef4444" 
            emissive="#ef4444"
            emissiveIntensity={2}
            transparent
            opacity={0.6}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}
