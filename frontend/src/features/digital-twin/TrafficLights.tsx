import { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { cityData } from "./useCityEngine";
import { lightTimers } from "./TrafficSystem";
import { useDigitalTwinStore } from "./useDigitalTwinStore";

const dummy = new THREE.Object3D();
const colorObj = new THREE.Color();

export function TrafficLights() {
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const isNight = timeOfDay === "night";
  
  // Extract all nodes (intersections) directly from the 20x20 city grid
  const intersections = useMemo(() => {
    return Array.from(cityData.nodes.values());
  }, []);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const bulbRef = useRef<THREE.InstancedMesh>(null);
  
  const dimColor = isNight ? "#1e293b" : "#475569";

  // Update light pole positions once
  useLayoutEffect(() => {
    if (meshRef.current) {
      intersections.forEach((node, i) => {
        // Place a light pole slightly offset from the intersection
        dummy.position.set(node.pos.x - 8, 4, node.pos.z - 8);
        dummy.scale.set(1, 8, 1);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [intersections]);

  // Sync visual light bulbs with the real-time AI traffic timers in useFrame
  useFrame(() => {
    if (bulbRef.current) {
      intersections.forEach((node, i) => {
        // Position the bulb on top of the pole
        dummy.position.set(node.pos.x - 8, 7.5, node.pos.z - 7);
        dummy.scale.set(1.5, 1.5, 1.5);
        dummy.updateMatrix();
        bulbRef.current!.setMatrixAt(i, dummy.matrix);

        // Fetch this intersection's timer
        const lt = lightTimers.get(node.id);
        let activeColor = "#ef4444"; // Default Red

        if (lt) {
          // If horizontal axis is green, horizontal gets green, vertical gets red.
          // For visual simplicity, we toggle green/red cycles in sync with vehicles.
          if (lt.activeAxis === 'h') {
            activeColor = lt.timer < 60 ? "#eab308" : "#22c55e"; // Yellow vs Green
          } else {
            activeColor = lt.timer < 60 ? "#eab308" : "#ef4444"; // Yellow vs Red
          }
        }

        bulbRef.current!.setColorAt(i, colorObj.set(activeColor));
      });
      bulbRef.current.instanceMatrix.needsUpdate = true;
      if (bulbRef.current.instanceColor) {
        bulbRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Poles */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, intersections.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={dimColor} metalness={0.8} roughness={0.2} />
      </instancedMesh>
      
      {/* Lights */}
      <instancedMesh ref={bulbRef} args={[undefined, undefined, intersections.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          roughness={0.2}
          metalness={0.8}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
