import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { Edge, ROAD_WIDTH } from "./useCityEngine";

const dummy = new THREE.Object3D();

interface CityRoadsProps {
  edges: Map<string, Edge>;
}

export function CityRoads({ edges }: CityRoadsProps) {
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const isNight = timeOfDay === "night";

  const roadMeshRef = useRef<THREE.InstancedMesh>(null);
  const markingsMeshRef = useRef<THREE.InstancedMesh>(null);

  const edgeArray = Array.from(edges.values());

  useLayoutEffect(() => {
    if (roadMeshRef.current) {
      edgeArray.forEach((edge, i) => {
        // Calculate center of edge
        const start = edge.lanes[0].startPos;
        const end = edge.lanes[0].endPos;
        
        // Midpoint
        let midX = (start.x + end.x) / 2;
        let midZ = (start.z + end.z) / 2;
        let scaleX, scaleZ;
        
        if (edge.isHorizontal) {
          midZ = start.z - (ROAD_WIDTH / 4) / 2; // adjust back to center
          scaleX = Math.abs(end.x - start.x);
          scaleZ = ROAD_WIDTH;
        } else {
          midX = start.x + (ROAD_WIDTH / 4) / 2;
          scaleX = ROAD_WIDTH;
          scaleZ = Math.abs(end.z - start.z);
        }

        const yPos = edge.isHorizontal ? 0.052 : 0.05;
        dummy.position.set(midX, yPos, midZ);
        dummy.scale.set(scaleX + ROAD_WIDTH, 0.1, scaleZ + ROAD_WIDTH); // fill intersection overlaps
        dummy.updateMatrix();
        roadMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      roadMeshRef.current.instanceMatrix.needsUpdate = true;
    }
 
    if (markingsMeshRef.current) {
      edgeArray.forEach((edge, i) => {
        const start = edge.lanes[0].startPos;
        const end = edge.lanes[0].endPos;
        
        let midX = (start.x + end.x) / 2;
        let midZ = (start.z + end.z) / 2;
        let scaleX, scaleZ;
 
        if (edge.isHorizontal) {
          midZ = start.z - (ROAD_WIDTH / 4) / 2; // Center of road
          scaleX = Math.abs(end.x - start.x);
          scaleZ = 0.5; // Width of median line
        } else {
          midX = start.x + (ROAD_WIDTH / 4) / 2;
          scaleX = 0.5;
          scaleZ = Math.abs(end.z - start.z);
        }
 
        const yPos = edge.isHorizontal ? 0.112 : 0.11;
        dummy.position.set(midX, yPos, midZ); // slightly above road
        dummy.scale.set(scaleX, 0.05, scaleZ);
        dummy.updateMatrix();
        markingsMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      markingsMeshRef.current.instanceMatrix.needsUpdate = true;
    }

  }, [edgeArray]);

  return (
    <group>
      {/* Asphalt */}
      <instancedMesh ref={roadMeshRef} args={[undefined, undefined, edgeArray.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={isNight ? "#0f172a" : "#334155"} roughness={0.9} />
      </instancedMesh>
      
      {/* Yellow Medians */}
      <instancedMesh ref={markingsMeshRef} args={[undefined, undefined, edgeArray.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#facc15" roughness={1} />
      </instancedMesh>
    </group>
  );
}
