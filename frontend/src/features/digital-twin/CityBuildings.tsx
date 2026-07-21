import { useLayoutEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { BuildingData } from "./useCityEngine";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

const dummy = new THREE.Object3D();
const color = new THREE.Color();

interface CityBuildingsProps {
  buildings: BuildingData[];
}

export function CityBuildings({ buildings }: CityBuildingsProps) {
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const theme = useDigitalTwinStore((state) => state.theme);
  const setSelectedEntity = useDigitalTwinStore((state) => state.setSelectedEntity);
  const isNight = timeOfDay === "night";

  // Split into multiple instanced meshes: foundations, buildings, helipads, spires, mechanical hvac boxes
  const buildingMeshRef = useRef<THREE.InstancedMesh>(null);
  const foundationMeshRef = useRef<THREE.InstancedMesh>(null);
  const helipadMeshRef = useRef<THREE.InstancedMesh>(null);
  const spireMeshRef = useRef<THREE.InstancedMesh>(null);
  const spireLightMeshRef = useRef<THREE.InstancedMesh>(null);
  const hvacMeshRef = useRef<THREE.InstancedMesh>(null);

  const helipads = buildings.filter(b => b.hasHelipad);
  const spires = buildings.filter(b => b.hasSpire);
  const hvacs = buildings.filter(b => b.type === "downtown" || b.type === "commercial" || b.type === "industrial" || b.type === "government" || b.type === "tech-park" || b.type === "hospital");

  const markerBuildings = useMemo(() => {
    // Select 5 random tall buildings for data markers
    return buildings
      .filter(b => b.scale[1] > 20)
      .sort((a, b) => parseInt(a.id, 16) % 10 - parseInt(b.id, 16) % 10)
      .slice(0, 5);
  }, [buildings]);

  useLayoutEffect(() => {
    if (foundationMeshRef.current) {
      buildings.forEach((bld, i) => {
        const fHeight = 0.4;
        dummy.position.set(bld.position[0], fHeight / 2, bld.position[2]);
        dummy.scale.set(bld.scale[0] + 1.2, fHeight, bld.scale[2] + 1.2);
        dummy.updateMatrix();
        foundationMeshRef.current!.setMatrixAt(i, dummy.matrix);
        foundationMeshRef.current!.setColorAt(i, color.set("#1e293b")); // Sleek concrete base
      });
      foundationMeshRef.current.instanceMatrix.needsUpdate = true;
      if (foundationMeshRef.current.instanceColor) {
        foundationMeshRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (buildingMeshRef.current) {
      buildings.forEach((bld, i) => {
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

    if (hvacMeshRef.current) {
      hvacs.forEach((bld, i) => {
        const bHeight = bld.scale[1] + 0.4;
        dummy.position.set(bld.position[0], bHeight + 1.0, bld.position[2]);
        dummy.scale.set(bld.scale[0] * 0.35, 2, bld.scale[2] * 0.35);
        dummy.updateMatrix();
        hvacMeshRef.current!.setMatrixAt(i, dummy.matrix);
        hvacMeshRef.current!.setColorAt(i, color.set("#334155")); // Metallic HVAC dark grey
      });
      hvacMeshRef.current.instanceMatrix.needsUpdate = true;
      if (hvacMeshRef.current.instanceColor) {
        hvacMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [buildings, helipads, spires, hvacs]);

  useFrame((state) => {
    const introActive = useDigitalTwinStore.getState().introActive;

    if (introActive && buildingMeshRef.current) {
      const elapsed = state.clock.getElapsedTime();
      const ratio = Math.min(1, elapsed / 7.0);
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

      if (hvacMeshRef.current) {
        hvacs.forEach((bld, i) => {
          const heightOffset = (1 - ease) * -120;
          const currentHeight = (bld.scale[1] * ease) + 0.4;
          dummy.position.set(bld.position[0], currentHeight + 1.0 * ease + heightOffset, bld.position[2]);
          dummy.scale.set(bld.scale[0] * 0.35, 2 * ease, bld.scale[2] * 0.35);
          dummy.updateMatrix();
          hvacMeshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        hvacMeshRef.current.instanceMatrix.needsUpdate = true;
      }
    }

    if (spireLightMeshRef.current) {
      const time = state.clock.getElapsedTime();
      const ease = introActive ? 1 - Math.pow(1 - Math.min(1, time / 7.0), 3) : 1;
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

  const isCyberpunk = theme === "cyberpunk";

  return (
    <group>
      <instancedMesh
        ref={foundationMeshRef}
        args={[undefined, undefined, buildings.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.8} metalness={0.2} color="#1b2536" />
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
          key={theme}
          roughness={0.3} 
          metalness={0.7}
          onBeforeCompile={(shader) => {
            shader.vertexShader = shader.vertexShader.replace(
              'void main() {',
              `varying vec3 vWorldPos;
               varying vec3 vNormalVec;
               void main() {`
            );
            shader.vertexShader = shader.vertexShader.replace(
              '#include <worldpos_vertex>',
              `#include <worldpos_vertex>
               vWorldPos = worldPosition.xyz;
               vNormalVec = normalize(normalMatrix * normal);`
            );
            
            shader.fragmentShader = 'varying vec3 vWorldPos;\nvarying vec3 vNormalVec;\n' + shader.fragmentShader;
            
            shader.fragmentShader = shader.fragmentShader.replace(
              'vec3 totalEmissiveRadiance = emissive;',
              `
              vec3 totalEmissiveRadiance = emissive;
              
              // Spacing parameters for vertical window columns and horizontal floor ledges
              float wallSpacingX = 2.5;
              float wallSpacingY = 3.2;
              
              vec3 norm = normalize(vNormalVec);
              float faceX = abs(norm.x);
              float faceZ = abs(norm.z);
              float faceY = abs(norm.y);
              
              float u = 0.0;
              if (faceX > 0.4) {
                u = vWorldPos.z;
              } else if (faceZ > 0.4) {
                u = vWorldPos.x;
              }
              
              float v = vWorldPos.y;
              
              float gridX = fract(u / wallSpacingX);
              float gridY = fract(v / wallSpacingY);
              
              // Procedural window mapping inside the grid cell
              float inWindowX = step(0.18, gridX) * step(gridX, 0.82);
              float inWindowY = step(0.20, gridY) * step(gridY, 0.68);
              float isWindow = inWindowX * inWindowY * (1.0 - step(0.5, faceY));
              
              // Floor ledge bands
              float isLedge = step(0.88, fract(v / 3.2));
              
              // Random glow generator per window cell
              vec2 cell = floor(vec2(u / wallSpacingX, v / wallSpacingY));
              float randVal = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
              
              // Glow color
              vec3 windowColor = vec3(0.98, 0.75, 0.35) * 3.8;
              if (${isCyberpunk ? 'true' : 'false'}) {
                windowColor = randVal > 0.5 ? vec3(0.0, 1.0, 1.0) * 8.0 : vec3(1.0, 0.0, 1.0) * 8.0; // Cyan or Magenta
              } else if (randVal > 0.85) {
                windowColor = vec3(0.45, 0.82, 0.98) * 3.2;
              }
              
              vec3 customEmissive = vec3(0.0);
              if (isWindow > 0.5) {
                if (${(isNight || isCyberpunk) ? 'true' : 'false'}) {
                  if (randVal > 0.72 || ${isCyberpunk ? 'randVal > 0.2' : 'false'}) {
                    customEmissive = windowColor;
                  } else {
                    customEmissive = vec3(0.01, 0.02, 0.04);
                  }
                } else {
                  customEmissive = vec3(0.005, 0.01, 0.02); // reflection shadow
                }
                diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.07, 0.09, 0.12), 0.78);
              }
              
              if (isLedge > 0.5) {
                customEmissive += ${isCyberpunk ? 'vec3(0.0, 0.5, 0.8)' : 'vec3(0.02)'}; // decorative floor band highlight
                diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.82, 0.82, 0.84), 0.28);
              }
              
              totalEmissiveRadiance += customEmissive;
              `
            );
          }}
        />
      </instancedMesh>

      <instancedMesh
        ref={helipadMeshRef}
        args={[undefined, undefined, helipads.length]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1, 1, 1, 16]} />
        <meshStandardMaterial roughness={0.9} color="#b91c1c" />
      </instancedMesh>

      <instancedMesh
        ref={spireMeshRef}
        args={[undefined, undefined, spires.length]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial roughness={0.5} metalness={0.8} color="#64748b" />
      </instancedMesh>

      <instancedMesh
        ref={spireLightMeshRef}
        args={[undefined, undefined, spires.length]}
      >
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </instancedMesh>

      <instancedMesh
        ref={hvacMeshRef}
        args={[undefined, undefined, hvacs.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.6} metalness={0.8} color="#475569" />
      </instancedMesh>

      {markerBuildings.map((bld, idx) => (
        <Html
          key={`marker-${idx}`}
          position={[bld.position[0], bld.position[1] * 2 + 5, bld.position[2]]}
          center
          distanceFactor={150}
          zIndexRange={[100, 0]}
        >
          <div className="bg-primary/20 backdrop-blur-sm border border-primary/50 text-primary px-2 py-1 rounded-md text-[8px] font-mono whitespace-nowrap pointer-events-none select-none flex flex-col items-center">
            <span className="font-bold border-b border-primary/30 w-full text-center pb-0.5 mb-0.5">{`Building ${bld.id}`}</span>
            <span>PWR: {Math.floor((bld.scale[1] * 7) % 40 + 60)}%</span>
            <span>NET: OK</span>
          </div>
        </Html>
      ))}
    </group>
  );
}
