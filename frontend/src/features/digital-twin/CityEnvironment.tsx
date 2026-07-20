import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useDigitalTwinStore } from "./useDigitalTwinStore";

const dummy = new THREE.Object3D();

interface CityEnvironmentProps {
  trees: { position: [number, number, number], scale: number }[];
  parks: { position: [number, number, number], scale: [number, number, number] }[];
}

export function CityEnvironment({ trees, parks }: CityEnvironmentProps) {
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const isNight = timeOfDay === "night";

  const treeTrunkRef = useRef<THREE.InstancedMesh>(null);
  const treeLeavesRef = useRef<THREE.InstancedMesh>(null);
  const parkRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    if (parkRef.current) {
      parks.forEach((park, i) => {
        dummy.position.set(...park.position);
        dummy.scale.set(...park.scale);
        dummy.updateMatrix();
        parkRef.current!.setMatrixAt(i, dummy.matrix);
      });
      parkRef.current.instanceMatrix.needsUpdate = true;
    }

    if (treeTrunkRef.current && treeLeavesRef.current) {
      trees.forEach((tree, i) => {
        // Trunk (sitting at sidewalk level y=0.1)
        dummy.position.set(tree.position[0], 0.1 + 1.5 * tree.scale, tree.position[2]);
        dummy.scale.set(0.5 * tree.scale, 3 * tree.scale, 0.5 * tree.scale);
        dummy.updateMatrix();
        treeTrunkRef.current!.setMatrixAt(i, dummy.matrix);
        
        // Leaves
        dummy.position.set(tree.position[0], 0.1 + 4 * tree.scale, tree.position[2]);
        dummy.scale.set(3 * tree.scale, 3 * tree.scale, 3 * tree.scale);
        dummy.updateMatrix();
        treeLeavesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      treeTrunkRef.current.instanceMatrix.needsUpdate = true;
      treeLeavesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [trees, parks]);

  return (
    <group>
      {/* Parks (Grass areas) */}
      <instancedMesh ref={parkRef} args={[undefined, undefined, parks.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={isNight ? "#064e3b" : "#22c55e"} roughness={1} />
      </instancedMesh>

      {/* Tree Trunks */}
      <instancedMesh ref={treeTrunkRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </instancedMesh>

      {/* Tree Leaves */}
      <instancedMesh ref={treeLeavesRef} args={[undefined, undefined, trees.length]} castShadow receiveShadow>
        <sphereGeometry args={[1, 7, 7]} />
        <meshStandardMaterial color={isNight ? "#064e3b" : "#166534"} roughness={0.8} />
      </instancedMesh>
    </group>
  );
}
