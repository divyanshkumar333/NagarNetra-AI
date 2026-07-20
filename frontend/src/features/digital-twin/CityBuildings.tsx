import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { BuildingData } from "./useCityEngine";
import { ThreeEvent, useFrame } from "@react-three/fiber";

const dummy = new THREE.Object3D();
const color = new THREE.Color();

interface CityBuildingsProps {
  buildings: BuildingData[];
}

export function CityBuildings({ buildings }: CityBuildingsProps) {
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const setSelectedEntity = useDigitalTwinStore((state) => state.setSelectedEntity);
  const isNight = timeOfDay === "night";

  // We split into multiple instanced meshes: foundations, buildings, helipads/roof details
  const buildingMeshRef = useRef<THREE.InstancedMesh>(null);
  const foundationMeshRef = useRef<THREE.InstancedMesh>(null);
  const helipadMeshRef = useRef<THREE.InstancedMesh>(null);
  const spireMeshRef = useRef<THREE.InstancedMesh>(null);
  const spireLightMeshRef = useRef<THREE.InstancedMesh>(null);
 
  const helipads = buildings.filter(b => b.hasHelipad);
  const spires = buildings.filter(b => b.hasSpire);
 
  useLayoutEffect(() => {
    if (foundationMeshRef.current) {
      buildings.forEach((bld, i) => {
        // Foundation is slightly wider than the building, with a height of 0.4
        const fHeight = 0.4;
        dummy.position.set(bld.position[0], fHeight / 2, bld.position[2]);
        dummy.scale.set(bld.scale[0] + 1.2, fHeight, bld.scale[2] + 1.2);
        dummy.updateMatrix();
        foundationMeshRef.current!.setMatrixAt(i, dummy.matrix);
        foundationMeshRef.current!.setColorAt(i, color.set("#1e293b")); // Sleek concrete slate
      });
      foundationMeshRef.current.instanceMatrix.needsUpdate = true;
      if (foundationMeshRef.current.instanceColor) {
        foundationMeshRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (buildingMeshRef.current) {
      buildings.forEach((bld, i) => {
        // Shift building up by 0.4 units
        dummy.position.set(bld.position[0], bld.position[1] + 0.4, bld.position[2]);
        dummy.scale.set(...bld.scale);
        dummy.updateMatrix();
        buildingMeshRef.current!.setMatrixAt(i, dummy.matrix);
        buildingMeshRef.current!.setColorAt(i, color.set(bld.color));
      });
      buildingMeshRef.current.instanceMatrix.needsUpdate = true;
      if (buildingMeshRef.current.instanceColor) {
        buildingMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
 
    if (helipadMeshRef.current) {
      helipads.forEach((hp, i) => {
        // Shift up by 0.4 units
        dummy.position.set(hp.position[0], hp.position[1] * 2 + 0.4 + 0.1, hp.position[2]);
        dummy.scale.set(hp.scale[0] * 0.4, 0.2, hp.scale[2] * 0.4);
        dummy.updateMatrix();
        helipadMeshRef.current!.setMatrixAt(i, dummy.matrix);
        helipadMeshRef.current!.setColorAt(i, color.set("#ef4444"));
      });
      helipadMeshRef.current.instanceMatrix.needsUpdate = true;
      if (helipadMeshRef.current.instanceColor) {
        helipadMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
 
    if (spireMeshRef.current) {
      spires.forEach((sp, i) => {
        // Shift up by 0.4 units
        dummy.position.set(sp.position[0], sp.position[1] * 2 + 0.4 + 7.5, sp.position[2]);
        dummy.scale.set(0.2, 15, 0.2);
        dummy.updateMatrix();
        spireMeshRef.current!.setMatrixAt(i, dummy.matrix);
        spireMeshRef.current!.setColorAt(i, color.set("#475569"));
      });
      spireMeshRef.current.instanceMatrix.needsUpdate = true;
      if (spireMeshRef.current.instanceColor) {
        spireMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [buildings, helipads, spires]);
 
  useFrame((state) => {
    const introActive = useDigitalTwinStore.getState().introActive;
    
    // Animate building growth during intro
    if (introActive && buildingMeshRef.current) {
      const elapsed = state.clock.getElapsedTime();
      const ratio = Math.min(1, elapsed / 7.0); // Match 7s intro duration
      const ease = 1 - Math.pow(1 - ratio, 3); // Cubic ease out
      
      buildings.forEach((bld, i) => {
        const heightOffset = (1 - ease) * -120;
        dummy.position.set(bld.position[0], bld.position[1] + 0.4 + heightOffset, bld.position[2]);
        dummy.scale.set(bld.scale[0], bld.scale[1] * ease, bld.scale[2]);
        dummy.updateMatrix();
        buildingMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      buildingMeshRef.current.instanceMatrix.needsUpdate = true;

      if (foundationMeshRef.current) {
        buildings.forEach((bld, i) => {
          const heightOffset = (1 - ease) * -120;
          dummy.position.set(bld.position[0], 0.2 + heightOffset, bld.position[2]);
          dummy.scale.set(bld.scale[0] + 1.2, 0.4 * ease, bld.scale[2] + 1.2);
          dummy.updateMatrix();
          foundationMeshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        foundationMeshRef.current.instanceMatrix.needsUpdate = true;
      }
 
      if (helipadMeshRef.current) {
        helipads.forEach((hp, i) => {
          const heightOffset = (1 - ease) * -120;
          dummy.position.set(hp.position[0], (hp.position[1] * 2 + 0.4 + 0.1) + heightOffset, hp.position[2]);
          dummy.scale.set(hp.scale[0] * 0.4, 0.2 * ease, hp.scale[2] * 0.4);
          dummy.updateMatrix();
          helipadMeshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        helipadMeshRef.current.instanceMatrix.needsUpdate = true;
      }
 
      if (spireMeshRef.current) {
        spires.forEach((sp, i) => {
          const heightOffset = (1 - ease) * -120;
          dummy.position.set(sp.position[0], (sp.position[1] * 2 + 0.4 + 7.5) + heightOffset, sp.position[2]);
          dummy.scale.set(0.2, 15 * ease, 0.2);
          dummy.updateMatrix();
          spireMeshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        spireMeshRef.current.instanceMatrix.needsUpdate = true;
      }
    }
 
    // Always animate red pulsing aviation lights
    if (spireLightMeshRef.current) {
      const time = state.clock.getElapsedTime();
      const ease = introActive ? 1 - Math.pow(1 - Math.min(1, time / 7.0), 3) : 1;
      
      // Fast warning blinker rate
      const pulse = 0.5 + Math.sin(time * 6) * 0.5;
      const scaleVal = (0.5 + pulse * 0.5) * ease;
      
      spires.forEach((sp, i) => {
        const heightOffset = introActive ? (1 - ease) * -120 : 0;
        const currentHeight = (sp.position[1] * 2 + 0.4) * ease;
        dummy.position.set(sp.position[0], currentHeight + 15 + heightOffset, sp.position[2]);
        dummy.scale.set(scaleVal, scaleVal, scaleVal);
        dummy.updateMatrix();
        spireLightMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      spireLightMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });
 
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && buildingMeshRef.current) {
      const bld = buildings[e.instanceId];
      setSelectedEntity({ ...bld, type: "building" as const, id: bld.id });
    }
  };
 
  return (
    <group>
      <instancedMesh
        ref={foundationMeshRef}
        args={[undefined, undefined, buildings.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.8} metalness={0.3} color="#1b2536" />
      </instancedMesh>

      <instancedMesh
        ref={buildingMeshRef}
        args={[undefined, undefined, buildings.length]}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          roughness={0.4} 
          metalness={0.6}
          emissive={isNight ? "#0c4a6e" : "#000000"}
          emissiveIntensity={isNight ? 0.25 : 0}
        />
      </instancedMesh>
 
      <instancedMesh
        ref={helipadMeshRef}
        args={[undefined, undefined, helipads.length]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1, 1, 1, 16]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
 
      <instancedMesh
        ref={spireMeshRef}
        args={[undefined, undefined, spires.length]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial roughness={0.5} metalness={0.8} />
      </instancedMesh>
 
      <instancedMesh
        ref={spireLightMeshRef}
        args={[undefined, undefined, spires.length]}
      >
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </instancedMesh>
    </group>
  );
}
