import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useCityGenerator } from "./useCityGenerator";
import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { ThreeEvent } from "@react-three/fiber";

const dummy = new THREE.Object3D();
const color = new THREE.Color();

export function ProceduralCity() {
  const { buildings, roads, parks } = useCityGenerator();
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const setSelectedEntity = useDigitalTwinStore((state) => state.setSelectedEntity);
  
  const buildingMeshRef = useRef<THREE.InstancedMesh>(null);
  const roadMeshRef = useRef<THREE.InstancedMesh>(null);
  const parkMeshRef = useRef<THREE.InstancedMesh>(null);

  // Instanced geometry setup
  useLayoutEffect(() => {
    if (buildingMeshRef.current) {
      buildings.forEach((bld, i) => {
        dummy.position.set(...bld.position);
        dummy.scale.set(...bld.scale);
        dummy.updateMatrix();
        buildingMeshRef.current!.setMatrixAt(i, dummy.matrix);
        buildingMeshRef.current!.setColorAt(i, color.set(bld.color));
      });
      buildingMeshRef.current.instanceMatrix.needsUpdate = true;
      if (buildingMeshRef.current.instanceColor) buildingMeshRef.current.instanceColor.needsUpdate = true;
    }

    if (roadMeshRef.current) {
      roads.forEach((road, i) => {
        dummy.position.set(...road.position);
        dummy.scale.set(...road.scale);
        dummy.updateMatrix();
        roadMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      roadMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (parkMeshRef.current) {
      parks.forEach((park, i) => {
        dummy.position.set(...park.position);
        dummy.scale.set(...park.scale);
        dummy.updateMatrix();
        parkMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      parkMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [buildings, roads, parks]);

  // Click handler for buildings
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && buildingMeshRef.current) {
      const bld = buildings[e.instanceId];
      setSelectedEntity({ type: "building", ...bld, id: bld.id });
    }
  };

  const isNight = timeOfDay === "night";

  return (
    <group>
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color={isNight ? "#0f172a" : "#cbd5e1"} />
      </mesh>

      {/* Buildings InstancedMesh */}
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
          emissive={isNight ? "#0ea5e9" : "#000000"}
          emissiveIntensity={isNight ? 0.2 : 0}
        />
      </instancedMesh>

      {/* Roads InstancedMesh */}
      <instancedMesh ref={roadMeshRef} args={[undefined, undefined, roads.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={isNight ? "#1e293b" : "#475569"} roughness={0.9} />
      </instancedMesh>

      {/* Parks InstancedMesh */}
      <instancedMesh ref={parkMeshRef} args={[undefined, undefined, parks.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={isNight ? "#064e3b" : "#22c55e"} roughness={1} />
      </instancedMesh>
    </group>
  );
}
