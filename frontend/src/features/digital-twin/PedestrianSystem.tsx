import { useRef, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { cityData } from "./useCityEngine";
import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { lightTimers } from "./TrafficSystem";

const PEDESTRIAN_COUNT = 850;

interface Pedestrian {
  id: number;
  edgeId: string;
  progress: number;
  speed: number;
  offset: number; // side of the road
  direction: number; // 1 or -1
  state: "walking" | "waiting" | "sitting" | "idling";
  idleFrames: number;
  sittingPos?: [number, number, number];
  sittingRot?: number;
}

const dummy = new THREE.Object3D();
const colorObj = new THREE.Color();

export function PedestrianSystem() {
  const bodyMeshRef = useRef<THREE.InstancedMesh>(null);
  const headMeshRef = useRef<THREE.InstancedMesh>(null);
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const isNight = timeOfDay === "night";

  const edgesArr = Array.from(cityData.edges.values());
  const parks = cityData.parks;

  const [pedestrians] = useState<Pedestrian[]>(() => {
    const arr: Pedestrian[] = [];
    
    // Allocate 50 sitting pedestrians on park benches
    let sitCount = 0;
    
    for (let i = 0; i < PEDESTRIAN_COUNT; i++) {
      // 5% chance of sitting in a park if parks exist
      if (parks.length > 0 && Math.random() > 0.94 && sitCount < 60) {
        const park = parks[Math.floor(Math.random() * parks.length)];
        // Bench positions on park boundaries
        const bx = park.position[0] + (Math.random() - 0.5) * park.scale[0] * 0.7;
        const bz = park.position[2] + (Math.random() - 0.5) * park.scale[2] * 0.7;
        arr.push({
          id: i,
          edgeId: "",
          progress: 0,
          speed: 0,
          offset: 0,
          direction: 1,
          state: "sitting",
          idleFrames: 0,
          sittingPos: [bx, 0.45, bz], // sit at seat height
          sittingRot: Math.random() * Math.PI * 2
        });
        sitCount++;
      } else {
        const edge = edgesArr[Math.floor(Math.random() * edgesArr.length)];
        arr.push({
          id: i,
          edgeId: edge.id,
          progress: Math.random(),
          speed: 0.0008 + Math.random() * 0.0006,
          offset: (Math.random() > 0.5 ? 1 : -1) * (14 / 2 + 1.2), // stand on sidewalk
          direction: Math.random() > 0.5 ? 1 : -1,
          state: "walking",
          idleFrames: 0
        });
      }
    }
    return arr;
  });

  useLayoutEffect(() => {
    if (bodyMeshRef.current && headMeshRef.current) {
      const colors = [
        "#38bdf8", "#0284c7", "#f43f5e", "#ec4899", 
        "#10b981", "#14b8a6", "#f59e0b", "#eab308", 
        "#8b5cf6", "#6366f1", "#64748b", "#cbd5e1"
      ];
      for (let i = 0; i < PEDESTRIAN_COUNT; i++) {
        const c = colorObj.set(colors[i % colors.length]);
        bodyMeshRef.current.setColorAt(i, c);
        // Skin tone / hair color for head
        const skinColor = Math.random() > 0.5 ? "#fed7aa" : "#fbcfe8";
        headMeshRef.current.setColorAt(i, colorObj.set(skinColor));
      }
      if (bodyMeshRef.current.instanceColor) bodyMeshRef.current.instanceColor.needsUpdate = true;
      if (headMeshRef.current.instanceColor) headMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [pedestrians]);

  useFrame((state) => {
    if (!bodyMeshRef.current || !headMeshRef.current || pedestrians.length === 0) return;
    const simulationSpeed = useDigitalTwinStore.getState().simulationSpeed;

    pedestrians.forEach((p, i) => {
      // 1. Sitting in Park
      if (p.state === "sitting" && p.sittingPos) {
        // Sit model position
        dummy.position.set(p.sittingPos[0], p.sittingPos[1], p.sittingPos[2]);
        dummy.scale.set(0.35, 0.45, 0.35); // squat/sitting scale height
        dummy.rotation.set(0, p.sittingRot || 0, 0);
        dummy.updateMatrix();
        bodyMeshRef.current!.setMatrixAt(i, dummy.matrix);

        dummy.position.set(p.sittingPos[0], p.sittingPos[1] + 0.45, p.sittingPos[2]);
        dummy.scale.set(0.32, 0.32, 0.32);
        dummy.updateMatrix();
        headMeshRef.current!.setMatrixAt(i, dummy.matrix);
        return;
      }

      // 2. Normal Pedestrian AI
      const edge = cityData.edges.get(p.edgeId)!;
      const startNode = cityData.nodes.get(edge.startNode)!;
      const endNode = cityData.nodes.get(edge.endNode)!;
      const targetNode = p.direction === 1 ? endNode : startNode;

      let speedFactor = p.speed;

      // Crosswalk Waiting logic
      const isNearIntersection = (p.direction === 1 && p.progress > 0.90) || (p.direction === -1 && p.progress < 0.10);
      if (isNearIntersection) {
        const lt = lightTimers.get(targetNode.id);
        const isGreenForCars = lt ? lt.activeAxis === (edge.isHorizontal ? 'h' : 'v') : false;
        
        if (isGreenForCars) {
          // Cars are running, pedestrian must WAIT at crosswalk!
          p.state = "waiting";
          speedFactor = 0;
        } else {
          // Cars are stopped, pedestrian can cross road!
          p.state = "walking";
        }
      } else if (p.state === "idling") {
        p.idleFrames--;
        speedFactor = 0;
        if (p.idleFrames <= 0) {
          p.state = "walking";
        }
      } else {
        // Random idling check (0.1% chance per frame)
        if (Math.random() > 0.998) {
          p.state = "idling";
          p.idleFrames = 60 + Math.floor(Math.random() * 120);
          speedFactor = 0;
        }
      }

      p.progress += speedFactor * p.direction * simulationSpeed;

      // Teleport or switch edges at the ends
      if (p.progress >= 1.0 || p.progress <= 0) {
        const newEdge = edgesArr[Math.floor(Math.random() * edgesArr.length)];
        p.edgeId = newEdge.id;
        p.progress = Math.random() > 0.5 ? 0 : 1;
        p.direction = p.progress === 0 ? 1 : -1;
        p.offset = (Math.random() > 0.5 ? 1 : -1) * (14 / 2 + 1.2);
        p.state = "walking";
      }

      const px = THREE.MathUtils.lerp(startNode.pos.x, endNode.pos.x, p.progress);
      const pz = THREE.MathUtils.lerp(startNode.pos.z, endNode.pos.z, p.progress);

      let fx = px;
      let fz = pz;
      
      // If crossing at the intersection end, visually cross the road stripes
      const isCrossing = isNearIntersection && p.state === "walking";
      if (isCrossing) {
        // Move towards the center line, crossing to the other side
        const crossOffset = THREE.MathUtils.lerp(p.offset, -p.offset, (p.progress > 0.90) ? (p.progress - 0.90)*10 : (0.10 - p.progress)*10);
        if (edge.isHorizontal) {
          fz += crossOffset;
        } else {
          fx += crossOffset;
        }
      } else {
        if (edge.isHorizontal) {
          fz += p.offset;
        } else {
          fx += p.offset;
        }
      }

      // Walking bobbing animation
      const bob = p.state === "walking" ? Math.abs(Math.sin(state.clock.getElapsedTime() * 10 * (p.speed / 0.001))) * 0.08 : 0;

      // Body (Capsule geometry)
      dummy.position.set(fx, 0.5 + bob, fz);
      dummy.scale.set(0.35, 0.75, 0.35);
      dummy.rotation.set(0, p.direction === 1 ? Math.atan2(endNode.pos.x-startNode.pos.x, endNode.pos.z-startNode.pos.z) : Math.atan2(startNode.pos.x-endNode.pos.x, startNode.pos.z-endNode.pos.z), 0);
      dummy.updateMatrix();
      bodyMeshRef.current!.setMatrixAt(i, dummy.matrix);

      // Head (Sphere geometry)
      dummy.position.set(fx, 0.98 + bob, fz);
      dummy.scale.set(0.32, 0.32, 0.32);
      dummy.updateMatrix();
      headMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    bodyMeshRef.current.instanceMatrix.needsUpdate = true;
    headMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Bodies (Capsules) */}
      <instancedMesh ref={bodyMeshRef} args={[undefined, undefined, PEDESTRIAN_COUNT]} castShadow>
        <capsuleGeometry args={[0.5, 0.8, 4, 8]} />
        <meshStandardMaterial roughness={0.7} metalness={0.1} />
      </instancedMesh>

      {/* Heads (Spheres) */}
      <instancedMesh ref={headMeshRef} args={[undefined, undefined, PEDESTRIAN_COUNT]} castShadow>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial roughness={0.8} metalness={0.1} />
      </instancedMesh>
    </group>
  );
}
