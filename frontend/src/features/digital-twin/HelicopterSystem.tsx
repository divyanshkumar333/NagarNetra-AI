"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { cityData, GRID_SIZE, SPACING } from "./useCityEngine";

interface HeliState {
  id: string;
  type: "police" | "rescue";
  color: string;
  altitude: number;
  speed: number;
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  patrolAngle: number;
}

export function HelicopterSystem() {
  const { activeIncident, incidentLocation, timeOfDay, simulationSpeed } = useDigitalTwinStore();
  const isNight = timeOfDay === "night";

  const policeHeliRef = useRef<THREE.Group>(null);
  const rescueHeliRef = useRef<THREE.Group>(null);
  const policeLightRef = useRef<THREE.SpotLight>(null);
  const rescueLightRef = useRef<THREE.SpotLight>(null);

  // Generate patrol intersections
  const nodes = Array.from(cityData.nodes.values());
  const getRandomPatrolPos = (alt: number) => {
    const node = nodes[Math.floor(Math.random() * nodes.length)];
    return new THREE.Vector3(node.pos.x, alt, node.pos.z);
  };

  const [helis] = useState<HeliState[]>(() => [
    {
      id: "heli-police",
      type: "police",
      color: "#1e3a8a", // Navy Blue
      altitude: 120,
      speed: 70,
      currentPos: new THREE.Vector3(0, 120, 0),
      targetPos: new THREE.Vector3(100, 120, 100),
      patrolAngle: 0
    },
    {
      id: "heli-rescue",
      type: "rescue",
      color: "#dc2626", // Red / White rescue
      altitude: 100,
      speed: 65,
      currentPos: new THREE.Vector3(-100, 100, -100),
      targetPos: new THREE.Vector3(-200, 100, 200),
      patrolAngle: Math.PI
    }
  ]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1) * simulationSpeed;
    
    helis.forEach((heli) => {
      const isPolice = heli.type === "police";
      const groupRef = isPolice ? policeHeliRef : rescueHeliRef;
      const lightRef = isPolice ? policeLightRef : rescueLightRef;

      if (!groupRef.current) return;

      // 1. Determine target position
      if (activeIncident && incidentLocation) {
        // Dispatch to incident immediately
        heli.targetPos.set(incidentLocation[0], heli.altitude, incidentLocation[2]);
      } else {
        // Keep patrolling random nodes
        const distToTarget = heli.currentPos.distanceTo(heli.targetPos);
        if (distToTarget < 10) {
          const nextPos = getRandomPatrolPos(heli.altitude);
          heli.targetPos.copy(nextPos);
        }
      }

      // 2. Drive movement
      const dir = new THREE.Vector3().subVectors(heli.targetPos, heli.currentPos);
      const dist = dir.length();

      if (activeIncident && dist < 30) {
        // Hover and circle around the incident zone
        heli.patrolAngle += 1.5 * dt;
        const radius = 25;
        const targetX = heli.targetPos.x + Math.sin(heli.patrolAngle) * radius;
        const targetZ = heli.targetPos.z + Math.cos(heli.patrolAngle) * radius;
        
        heli.currentPos.x = THREE.MathUtils.damp(heli.currentPos.x, targetX, 2, dt);
        heli.currentPos.z = THREE.MathUtils.damp(heli.currentPos.z, targetZ, 2, dt);
        
        groupRef.current.position.copy(heli.currentPos);
        // Face the incident center
        groupRef.current.lookAt(new THREE.Vector3(heli.targetPos.x, heli.altitude, heli.targetPos.z));
      } else {
        // Normal direct flight path
        dir.normalize();
        heli.currentPos.addScaledVector(dir, heli.speed * dt);
        groupRef.current.position.copy(heli.currentPos);
        
        // Tilt nose down while flying forward
        groupRef.current.lookAt(heli.targetPos);
      }

      // Report helicopter position for camera tracking if followed
      if (useDigitalTwinStore.getState().followTarget === "helicopter" && heli.type === "police") {
        useDigitalTwinStore.getState().setFollowedPosition([heli.currentPos.x, heli.currentPos.y, heli.currentPos.z]);
      }

      // 3. Spin rotors
      groupRef.current.children.forEach((child) => {
        if (child.name === "rotor-main") {
          child.rotation.y += 35 * dt;
        }
        if (child.name === "rotor-tail") {
          child.rotation.z += 40 * dt;
        }
      });

      // 4. Update spotlights pointing down
      if (lightRef.current) {
        // If incident is active, point light directly at accident, otherwise point straight down
        const targetLookX = activeIncident && incidentLocation ? incidentLocation[0] : heli.currentPos.x;
        const targetLookZ = activeIncident && incidentLocation ? incidentLocation[2] : heli.currentPos.z;
        
        lightRef.current.target.position.set(targetLookX, 0, targetLookZ);
        lightRef.current.target.updateMatrixWorld();
      }
    });
  });

  const renderHeliMesh = (ref: React.RefObject<THREE.Group | null>, color: string, spotlightRef: React.RefObject<THREE.SpotLight | null>) => (
    <group ref={ref}>
      {/* Cockpit / Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 2.5, 6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* Front Windshield */}
      <mesh position={[0, 0.4, 3.01]}>
        <boxGeometry args={[2.5, 1.2, 0.1]} />
        <meshStandardMaterial color="#0ea5e9" opacity={0.6} transparent roughness={0.1} />
      </mesh>

      {/* Tail Boom */}
      <mesh position={[0, 0.6, -4.5]}>
        <boxGeometry args={[0.8, 0.8, 4.5]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>

      {/* Vertical Stabilizer */}
      <mesh position={[0, 1.8, -6.5]}>
        <boxGeometry args={[0.3, 2, 1.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Skid Landing Gear Left */}
      <mesh position={[-1.2, -1.8, 0]}>
        <boxGeometry args={[0.2, 0.2, 5.5]} />
        <meshStandardMaterial color="#334155" metalness={0.9} />
      </mesh>
      <mesh position={[-1.2, -1.5, 1]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[-1.2, -1.5, -1]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Skid Landing Gear Right */}
      <mesh position={[1.2, -1.8, 0]}>
        <boxGeometry args={[0.2, 0.2, 5.5]} />
        <meshStandardMaterial color="#334155" metalness={0.9} />
      </mesh>
      <mesh position={[1.2, -1.5, 1]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[1.2, -1.5, -1]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Main Rotor Shaft */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {/* Main Rotor Blades */}
      <group name="rotor-main" position={[0, 2.0, 0]}>
        <mesh>
          <boxGeometry args={[14, 0.05, 0.6]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[14, 0.05, 0.6]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Tail Rotor Blade */}
      <group name="rotor-tail" position={[0.4, 2.2, -6.7]}>
        <mesh>
          <boxGeometry args={[0.1, 3, 0.2]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>

      {/* Underbelly Spotlight */}
      <spotLight 
        ref={spotlightRef}
        color={color === "#1e3a8a" ? "#0ea5e9" : "#ffffff"} // Cyan searchlight for police, bright white for rescue
        intensity={activeIncident ? 8 : (isNight ? 4 : 0)}
        angle={Math.PI / 8}
        penumbra={0.4}
        distance={250}
        castShadow
        position={[0, -1.3, 1]}
      />
    </group>
  );

  return (
    <group>
      {renderHeliMesh(policeHeliRef, helis[0].color, policeLightRef)}
      {renderHeliMesh(rescueHeliRef, helis[1].color, rescueLightRef)}
    </group>
  );
}
