import { useRef, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { cityData } from "./useCityEngine";
import { useDigitalTwinStore } from "./useDigitalTwinStore";

const PEDESTRIAN_COUNT = 800;

interface Pedestrian {
  id: number;
  edgeId: string;
  progress: number;
  speed: number;
  offset: number; // side of the road
  direction: number; // 1 or -1
}

const dummy = new THREE.Object3D();
const colorObj = new THREE.Color();

export function PedestrianSystem() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const isNight = timeOfDay === "night";

  const edgesArr = Array.from(cityData.edges.values());

  const [pedestrians] = useState<Pedestrian[]>(() => {
    const arr: Pedestrian[] = [];
    for (let i = 0; i < PEDESTRIAN_COUNT; i++) {
      const edge = edgesArr[Math.floor(Math.random() * edgesArr.length)];
      arr.push({
        id: i,
        edgeId: edge.id,
        progress: Math.random(),
        speed: 0.001 + Math.random() * 0.0005,
        offset: (Math.random() > 0.5 ? 1 : -1) * (14 / 2 + 1.5), 
        direction: Math.random() > 0.5 ? 1 : -1
      });
    }
    return arr;
  });

  useLayoutEffect(() => {
    if (meshRef.current && pedestrians.length > 0) {
      for (let i = 0; i < PEDESTRIAN_COUNT; i++) {
        const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#1e293b", "#cbd5e1"];
        meshRef.current.setColorAt(i, colorObj.set(colors[i % colors.length]));
      }
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [pedestrians]);

  useFrame(() => {
    if (!meshRef.current || pedestrians.length === 0) return;

    pedestrians.forEach((p, i) => {
      p.progress += p.speed * p.direction;

      if (p.progress >= 1.0 || p.progress <= 0) {
        // Switch to a new edge (for simplicity, random teleport to keep city alive)
        const newEdge = edgesArr[Math.floor(Math.random() * edgesArr.length)];
        p.edgeId = newEdge.id;
        p.progress = Math.random() > 0.5 ? 0 : 1;
        p.direction = p.progress === 0 ? 1 : -1;
        p.offset = (Math.random() > 0.5 ? 1 : -1) * (14 / 2 + 1.5);
      }

      const edge = cityData.edges.get(p.edgeId)!;
      const startNode = cityData.nodes.get(edge.startNode)!;
      const endNode = cityData.nodes.get(edge.endNode)!;

      const px = THREE.MathUtils.lerp(startNode.pos.x, endNode.pos.x, p.progress);
      const pz = THREE.MathUtils.lerp(startNode.pos.z, endNode.pos.z, p.progress);

      let fx = px;
      let fz = pz;
      
      if (edge.isHorizontal) {
        fz += p.offset;
      } else {
        fx += p.offset;
      }

      // Add simple walking bob
      const bob = Math.abs(Math.sin(p.progress * 200)) * 0.1;

      dummy.position.set(fx, 0.9 + bob, fz);
      dummy.scale.set(0.4, 0.8, 0.4);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Fade out pedestrians at night
  if (isNight) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PEDESTRIAN_COUNT]} castShadow>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  );
}
