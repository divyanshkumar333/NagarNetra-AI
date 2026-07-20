import { useRef, useMemo, useLayoutEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const VEHICLE_COUNT = 300;
const BOUNDS = 240; // Approx half of 12 * 40
const dummy = new THREE.Object3D();
const color = new THREE.Color();

function generateTrafficData() {
  return Array.from({ length: VEHICLE_COUNT }).map((_, i) => {
    const isHorizontal = Math.random() > 0.5;
    const speed = (Math.random() * 0.5 + 0.2);
    
    // Determine vehicle type and color
    const rand = Math.random();
    let vColor = "#e2e8f0"; // Car
    let scale: [number, number, number] = [2, 1, 4]; // length 4, width 2
    let isEmergency = false;

    if (rand > 0.95) {
      vColor = "#ef4444"; // Ambulance/Fire
      scale = [2.5, 1.5, 5];
      isEmergency = true;
    } else if (rand > 0.85) {
      vColor = "#3b82f6"; // Police
    } else if (rand > 0.75) {
      vColor = "#f59e0b"; // Bus/Truck
      scale = [2.5, 2, 8];
    } else if (rand > 0.5) {
      vColor = "#0f172a"; // Dark car
    }

    // Start position (snap to lanes approx)
    const x = isHorizontal ? (Math.random() - 0.5) * BOUNDS * 2 : (Math.floor(Math.random() * 12) * 52 - 260) + (Math.random() > 0.5 ? 2 : -2);
    const z = !isHorizontal ? (Math.random() - 0.5) * BOUNDS * 2 : (Math.floor(Math.random() * 12) * 52 - 260) + (Math.random() > 0.5 ? 2 : -2);
    
    // Direction
    const dirX = isHorizontal ? (Math.random() > 0.5 ? 1 : -1) : 0;
    const dirZ = !isHorizontal ? (Math.random() > 0.5 ? 1 : -1) : 0;

    return {
      id: i,
      pos: new THREE.Vector3(x, 0.5, z),
      vel: new THREE.Vector3(dirX * speed, 0, dirZ * speed),
      color: vColor,
      scale,
      isEmergency,
      baseSpeed: speed,
      rotation: isHorizontal ? (dirX > 0 ? Math.PI / 2 : -Math.PI / 2) : (dirZ > 0 ? 0 : Math.PI)
    };
  });
}

export function TrafficSystem() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Initialize vehicle data: position, velocity (x, z), type
  const vehicles = useMemo(() => generateTrafficData(), []);

  // Update logic
  useFrame(() => {
    if (!meshRef.current) return;

    vehicles.forEach((v, i) => {
      // Move vehicle
      v.pos.add(v.vel);

      // Loop around bounds
      if (v.pos.x > BOUNDS) v.pos.x = -BOUNDS;
      if (v.pos.x < -BOUNDS) v.pos.x = BOUNDS;
      if (v.pos.z > BOUNDS) v.pos.z = -BOUNDS;
      if (v.pos.z < -BOUNDS) v.pos.z = BOUNDS;

      // Update dummy matrix
      dummy.position.copy(v.pos);
      dummy.rotation.set(0, v.rotation, 0);
      dummy.scale.set(...v.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
      if (meshRef.current!.instanceColor && i === 0) { // Set color only once per instance if possible, but instanceColor requires update if dynamic
        // optimization: color is static for vehicles
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  useLayoutEffect(() => {
    if (meshRef.current) {
      vehicles.forEach((v, i) => {
        meshRef.current!.setColorAt(i, color.set(v.color));
      });
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [vehicles]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, VEHICLE_COUNT]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.3} metalness={0.7} />
    </instancedMesh>
  );
}
