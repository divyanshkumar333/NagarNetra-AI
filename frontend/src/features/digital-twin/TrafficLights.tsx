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

  const intersections = useMemo(() => {
    return Array.from(cityData.nodes.values());
  }, []);

  const poleMeshRef = useRef<THREE.InstancedMesh>(null);
  const armMeshRef = useRef<THREE.InstancedMesh>(null);
  const housingMeshRef = useRef<THREE.InstancedMesh>(null);
  const bulbMeshRef = useRef<THREE.InstancedMesh>(null);

  const metalColor = isNight ? "#1e293b" : "#475569";

  // Build the structures once
  useLayoutEffect(() => {
    if (poleMeshRef.current && armMeshRef.current && housingMeshRef.current) {
      intersections.forEach((node, i) => {
        // 1. Vertical Pole
        dummy.position.set(node.pos.x - 7, 3.5, node.pos.z - 7);
        dummy.scale.set(0.2, 7, 0.2);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        poleMeshRef.current!.setMatrixAt(i, dummy.matrix);
        poleMeshRef.current!.setColorAt(i, colorObj.set(metalColor));

        // 2. Horizontal Arm (extending towards the road)
        dummy.position.set(node.pos.x - 5, 7, node.pos.z - 7);
        dummy.scale.set(0.12, 4.0, 0.12);
        dummy.rotation.set(0, 0, Math.PI / 2); // Rotate horizontal
        dummy.updateMatrix();
        armMeshRef.current!.setMatrixAt(i, dummy.matrix);
        armMeshRef.current!.setColorAt(i, colorObj.set(metalColor));

        // 3. Black Housing
        dummy.position.set(node.pos.x - 3, 6.5, node.pos.z - 7);
        dummy.scale.set(0.7, 1.8, 0.7);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        housingMeshRef.current!.setMatrixAt(i, dummy.matrix);
        housingMeshRef.current!.setColorAt(i, colorObj.set("#0f172a")); // Matte black
      });
      poleMeshRef.current.instanceMatrix.needsUpdate = true;
      armMeshRef.current.instanceMatrix.needsUpdate = true;
      housingMeshRef.current.instanceMatrix.needsUpdate = true;
      if (poleMeshRef.current.instanceColor) poleMeshRef.current.instanceColor.needsUpdate = true;
      if (armMeshRef.current.instanceColor) armMeshRef.current.instanceColor.needsUpdate = true;
      if (housingMeshRef.current.instanceColor) housingMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [intersections, metalColor]);

  // Animate the bulbs
  useFrame(() => {
    if (bulbMeshRef.current) {
      intersections.forEach((node, i) => {
        const lt = lightTimers.get(node.id);
        let activeColor = "#ef4444"; // Red
        let bulbY = 7.1; // Top slot

        if (lt) {
          if (lt.activeAxis === "h") {
            if (lt.timer < 60) {
              activeColor = "#eab308"; // Yellow
              bulbY = 6.5; // Middle slot
            } else {
              activeColor = "#22c55e"; // Green
              bulbY = 5.9; // Bottom slot
            }
          } else {
            if (lt.timer < 60) {
              activeColor = "#eab308"; // Yellow
              bulbY = 6.5; // Middle slot
            } else {
              activeColor = "#ef4444"; // Red
              bulbY = 7.1; // Top slot
            }
          }
        }

        // Active bulb is placed on the side of the housing facing incoming traffic
        dummy.position.set(node.pos.x - 3, bulbY, node.pos.z - 6.6);
        dummy.scale.set(0.3, 0.3, 0.3);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        bulbMeshRef.current!.setMatrixAt(i, dummy.matrix);
        bulbMeshRef.current!.setColorAt(i, colorObj.set(activeColor));
      });
      bulbMeshRef.current.instanceMatrix.needsUpdate = true;
      if (bulbMeshRef.current.instanceColor) {
        bulbMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Vertical Poles */}
      <instancedMesh ref={poleMeshRef} args={[undefined, undefined, intersections.length]} castShadow>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial roughness={0.4} metalness={0.7} />
      </instancedMesh>

      {/* Horizontal Arms */}
      <instancedMesh ref={armMeshRef} args={[undefined, undefined, intersections.length]} castShadow>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial roughness={0.4} metalness={0.7} />
      </instancedMesh>

      {/* Signal Housings */}
      <instancedMesh ref={housingMeshRef} args={[undefined, undefined, intersections.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.8} metalness={0.1} />
      </instancedMesh>

      {/* Active Light Bulbs */}
      <instancedMesh ref={bulbMeshRef} args={[undefined, undefined, intersections.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial 
          roughness={0.1} 
          metalness={0.9} 
          emissiveIntensity={isNight ? 5 : 2}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
