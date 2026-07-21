import { useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { cityData } from "./useCityEngine";

export function AIDrone() {
  const groupRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const isNight = timeOfDay === "night";

  // Simple patrol path following random nodes
  const nodes = Array.from(cityData.nodes.values());
  const targetNode = useRef<import('./useCityEngine').Node | null>(null);
  const currentPos = useRef(new THREE.Vector3(0, 80, 0));

  useLayoutEffect(() => {
    targetNode.current = nodes[Math.floor(Math.random() * nodes.length)];
  }, [nodes]);

  useFrame((_, delta) => {
    if (!groupRef.current || !spotlightRef.current || !targetNode.current) return;

    const target = targetNode.current.pos.clone().setY(80); // fly at height 80
    
    // Move towards target
    const dir = target.clone().sub(currentPos.current);
    if (dir.length() < 5) {
      targetNode.current = nodes[Math.floor(Math.random() * nodes.length)];
    } else {
      dir.normalize();
      currentPos.current.add(dir.multiplyScalar(40 * delta)); // Speed 40 units per second
    }

    groupRef.current.position.copy(currentPos.current);
    groupRef.current.lookAt(target);

    // Report drone position for camera tracking if followed
    if (useDigitalTwinStore.getState().followTarget === "drone") {
      useDigitalTwinStore.getState().setFollowedPosition([currentPos.current.x, currentPos.current.y, currentPos.current.z]);
    }

    // Rotate rotor blades
    groupRef.current.children.forEach((child) => {
      if (child.name === "rotor") {
        child.rotation.y += 20 * delta;
      }
    });
    
    // Spotlight always points down to the ground
    spotlightRef.current.target.position.set(currentPos.current.x, 0, currentPos.current.z);
    spotlightRef.current.target.updateMatrixWorld();
  });

  return (
    <group ref={groupRef} name="ai-drone">
      {/* Drone Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 1, 3]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>


      {/* Rotors */}
      <mesh name="rotor" position={[1.5, 0.6, 1.5]}>
        <boxGeometry args={[2.5, 0.1, 0.2]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh name="rotor" position={[-1.5, 0.6, 1.5]}>
        <boxGeometry args={[2.5, 0.1, 0.2]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh name="rotor" position={[1.5, 0.6, -1.5]}>
        <boxGeometry args={[2.5, 0.1, 0.2]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh name="rotor" position={[-1.5, 0.6, -1.5]}>
        <boxGeometry args={[2.5, 0.1, 0.2]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* Patrol Spotlight */}
      <spotLight 
        ref={spotlightRef}
        color="#0ea5e9"
        intensity={isNight ? 5 : 0}
        angle={Math.PI / 6}
        penumbra={0.5}
        distance={200}
        castShadow
        position={[0, -1, 0]}
      />
    </group>
  );
}
