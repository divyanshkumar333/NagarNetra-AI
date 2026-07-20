import { useMemo, useRef, useLayoutEffect, useState, useEffect } from "react";
import * as THREE from "three";
import { useCityGenerator } from "./useCityGenerator";
import { useDigitalTwinStore } from "./useDigitalTwinStore";

const dummy = new THREE.Object3D();
const color = new THREE.Color();

export function TrafficLights() {
  const { roads } = useCityGenerator();
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const isNight = timeOfDay === "night";
  
  // Extract intersections from roads data (approximated for demo)
  const intersections = useMemo(() => {
    return roads.filter(r => r.scale[0] === 12 && r.scale[2] === 12);
  }, [roads]);

  const [state, setState] = useState<"green" | "yellow" | "red">("green");

  // Cycle lights
  useEffect(() => {
    const cycle = () => {
      setState("yellow");
      setTimeout(() => setState("red"), 3000);
      setTimeout(() => setState("green"), 8000);
    };
    const interval = setInterval(cycle, 12000);
    return () => clearInterval(interval);
  }, []);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const lightColor = state === "green" ? "#22c55e" : state === "yellow" ? "#eab308" : "#ef4444";
  const dimColor = isNight ? "#1e293b" : "#475569";

  useLayoutEffect(() => {
    if (meshRef.current) {
      intersections.forEach((intersection, i) => {
        // Place a light pole slightly offset from the intersection
        dummy.position.set(intersection.position[0] - 8, 4, intersection.position[2] - 8);
        dummy.scale.set(1, 8, 1);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [intersections]);

  // We will render two instanced meshes: the poles, and the light bulbs
  const bulbRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (bulbRef.current) {
      intersections.forEach((intersection, i) => {
        dummy.position.set(intersection.position[0] - 8, 7.5, intersection.position[2] - 7);
        dummy.scale.set(1.5, 1.5, 1.5);
        dummy.updateMatrix();
        bulbRef.current!.setMatrixAt(i, dummy.matrix);
        bulbRef.current!.setColorAt(i, color.set(lightColor));
      });
      bulbRef.current.instanceMatrix.needsUpdate = true;
      if (bulbRef.current.instanceColor) bulbRef.current.instanceColor.needsUpdate = true;
    }
  }, [intersections, lightColor]);

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
          color={lightColor}
          emissive={lightColor}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
