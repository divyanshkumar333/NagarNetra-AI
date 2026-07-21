import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { Edge, ROAD_WIDTH, isRiverBlock, cityData } from "./useCityEngine";

const dummy = new THREE.Object3D();
const color = new THREE.Color();

interface CityRoadsProps {
  edges: Map<string, Edge>;
}

export function CityRoads({ edges }: CityRoadsProps) {
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const isNight = timeOfDay === "night";

  const roadMeshRef = useRef<THREE.InstancedMesh>(null);
  const pillarsMeshRef = useRef<THREE.InstancedMesh>(null);

  const edgeArray = Array.from(edges.values());

  const bridges = edgeArray.filter((edge) => {
    const startNode = cityData.nodes.get(edge.startNode)!;
    const endNode = cityData.nodes.get(edge.endNode)!;
    const midX = Math.floor((startNode.gridX + endNode.gridX) / 2);
    const midZ = Math.floor((startNode.gridZ + endNode.gridZ) / 2);
    return isRiverBlock(midX, midZ);
  });

  useLayoutEffect(() => {
    if (roadMeshRef.current) {
      edgeArray.forEach((edge, i) => {
        const start = edge.lanes[0].startPos;
        const end = edge.lanes[0].endPos;
        
        let midX = (start.x + end.x) / 2;
        let midZ = (start.z + end.z) / 2;
        let scaleX, scaleZ;
        
        if (edge.isHorizontal) {
          midZ = start.z - (ROAD_WIDTH / 4) / 2;
          scaleX = Math.abs(end.x - start.x);
          scaleZ = ROAD_WIDTH;
        } else {
          midX = start.x + (ROAD_WIDTH / 4) / 2;
          scaleX = ROAD_WIDTH;
          scaleZ = Math.abs(end.z - start.z);
        }

        // 1. Asphalt Road Bed
        const yPos = edge.isHorizontal ? 0.052 : 0.05;
        dummy.position.set(midX, yPos, midZ);
        dummy.scale.set(scaleX + ROAD_WIDTH, 0.1, scaleZ + ROAD_WIDTH);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        roadMeshRef.current!.setMatrixAt(i, dummy.matrix);

      });
      roadMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (pillarsMeshRef.current && bridges.length > 0) {
      let pillarIdx = 0;
      bridges.forEach((edge) => {
        const start = edge.lanes[0].startPos;
        const end = edge.lanes[0].endPos;
        const midX = (start.x + end.x) / 2;
        const midZ = (start.z + end.z) / 2;
        
        const pHeight = 20.0;
        const positions = edge.isHorizontal 
          ? [[midX - 10, -pHeight / 2 + 0.1, midZ], [midX + 10, -pHeight / 2 + 0.1, midZ]]
          : [[midX, -pHeight / 2 + 0.1, midZ - 10], [midX, -pHeight / 2 + 0.1, midZ + 10]];
          
        positions.forEach(([px, py, pz]) => {
          dummy.position.set(px, py, pz);
          dummy.scale.set(1.5, pHeight, 1.5);
          dummy.updateMatrix();
          pillarsMeshRef.current!.setMatrixAt(pillarIdx, dummy.matrix);
          pillarsMeshRef.current!.setColorAt(pillarIdx, color.set("#334155"));
          pillarIdx++;
        });
      });
      pillarsMeshRef.current.instanceMatrix.needsUpdate = true;
      if (pillarsMeshRef.current.instanceColor) {
        pillarsMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [edgeArray, bridges]);

  return (
    <group>
      {/* Procedural Asphalt Road Bed */}
      <instancedMesh ref={roadMeshRef} args={[undefined, undefined, edgeArray.length]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          roughness={0.95} 
          metalness={0.05}
          onBeforeCompile={(shader) => {
            shader.vertexShader = shader.vertexShader.replace(
              'void main() {',
              `varying vec3 vWorldPos;
               varying vec3 vLocalPos;
               varying vec3 vScale;
               void main() {`
            );
            shader.vertexShader = shader.vertexShader.replace(
              '#include <worldpos_vertex>',
              `#include <worldpos_vertex>
               vWorldPos = worldPosition.xyz;
               vLocalPos = position;
               vScale = vec3(
                 length(modelMatrix[0].xyz),
                 length(modelMatrix[1].xyz),
                 length(modelMatrix[2].xyz)
               );`
            );
            
            shader.fragmentShader = `
              varying vec3 vWorldPos;
              varying vec3 vLocalPos;
              varying vec3 vScale;
            ` + shader.fragmentShader;
            
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <color_fragment>',
              `
              #include <color_fragment>
              
              float t = 0.0;
              float u = 0.0;
              float len = 0.0;
              
              if (vScale.x > vScale.z) {
                t = vLocalPos.z;
                u = vWorldPos.x;
                len = vScale.x;
              } else {
                t = vLocalPos.x;
                u = vWorldPos.z;
                len = vScale.z;
              }
              
              // Intersection exclusion boundary
              float roadWidth = 14.0;
              float activeBoundary = (len - roadWidth) / (2.0 * len);
              float localAlongRoad = (vScale.x > vScale.z) ? vLocalPos.x : vLocalPos.z;
              float inIntersection = step(activeBoundary, abs(localAlongRoad));
              
              vec3 roadColor = vec3(0.05, 0.05, 0.05); // black asphalt
              vec3 whiteColor = vec3(1.0, 1.0, 1.0); // white markings
              
              vec3 surfaceColor = roadColor;
              float absT = abs(t);
              
              // 1. Center double lines (now white)
              float isCenterMedian = step(absT, 0.015) * (1.0 - inIntersection);
              float isCenterGap = step(absT, 0.003) * (1.0 - inIntersection);
              float isCenterLine = isCenterMedian * (1.0 - isCenterGap);
              
              // 2. White lane division lines
              float isLaneDivider = step(abs(absT - 0.20), 0.008) * (1.0 - inIntersection);
              float isDash = step(0.55, fract(u / 4.5));
              float whiteLaneLine = isLaneDivider * isDash;
              
              // 5. Zebra Crosswalks
              float crosswalkStart = activeBoundary - 4.5 / len;
              float isCrosswalkRegion = step(crosswalkStart, abs(localAlongRoad)) * (1.0 - inIntersection);
              float crossAxis = (vScale.x > vScale.z) ? vWorldPos.z : vWorldPos.x;
              float isZebra = step(0.5, fract(crossAxis / 1.5));
              float zebraColor = isCrosswalkRegion * isZebra;
              
              // 6. Outer solid edge lines
              float isOuterBoundary = step(0.47, absT) * step(absT, 0.49) * (1.0 - inIntersection);

              if (zebraColor > 0.5) {
                surfaceColor = whiteColor;
              } else if (isOuterBoundary > 0.5) {
                surfaceColor = whiteColor;
              } else if (isCenterLine > 0.5) {
                surfaceColor = whiteColor;
              } else if (whiteLaneLine > 0.5) {
                surfaceColor = whiteColor;
              }
              
              diffuseColor = vec4(surfaceColor, 1.0);
              `
            );
          }}
        />
      </instancedMesh>


      {/* Concrete Bridge Pillar Supports */}
      {bridges.length > 0 && (
        <instancedMesh ref={pillarsMeshRef} args={[undefined, undefined, bridges.length * 2]} castShadow receiveShadow>
          <cylinderGeometry args={[1, 1, 1, 12]} />
          <meshStandardMaterial roughness={0.7} metalness={0.1} />
        </instancedMesh>
      )}
    </group>
  );
}
