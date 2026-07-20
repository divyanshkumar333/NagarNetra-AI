import { useRef, useMemo, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { cityData } from "./useCityEngine";
import { useDigitalTwinStore } from "./useDigitalTwinStore";

const VEHICLE_COUNT = 600;

type VehicleType = "sedan" | "suv" | "bus" | "truck" | "emergency";

interface Vehicle {
  id: number;
  type: VehicleType;
  color: string;
  edgeId: string;
  laneId: string;
  laneIndex: number;
  progress: number;
  baseSpeed: number;
  currentSpeed: number;
  isEmergency: boolean;
  scale: [number, number, number];
}

const dummy = new THREE.Object3D();
const colorObj = new THREE.Color();

// Simple traffic light manager
export const lightTimers = new Map<string, { timer: number, activeAxis: 'h' | 'v' }>();
cityData.nodes.forEach(node => {
  lightTimers.set(node.id, { timer: Math.random() * 200, activeAxis: Math.random() > 0.5 ? 'h' : 'v' });
});

export function TrafficSystem() {
  const sedanRef = useRef<THREE.InstancedMesh>(null);
  const suvRef = useRef<THREE.InstancedMesh>(null);
  const busRef = useRef<THREE.InstancedMesh>(null);
  const truckRef = useRef<THREE.InstancedMesh>(null);
  const emergencyRef = useRef<THREE.InstancedMesh>(null);

  const edgesArr = Array.from(cityData.edges.values());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lanes = useMemo(() => edgesArr.flatMap(e => e.lanes.map(l => ({ ...l, edgeId: e.id, isHorizontal: e.isHorizontal }))), []);

  const [vehicles] = useState<Vehicle[]>(() => {
    const arr: Vehicle[] = [];
    for (let i = 0; i < VEHICLE_COUNT; i++) {
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      
      const rand = Math.random();
      let type: VehicleType = "sedan";
      let vColor = "#e2e8f0";
      let scale: [number, number, number] = [1.8, 0.8, 4];
      let isEmergency = false;
      let baseSpeed = 0.003 + Math.random() * 0.001;

      if (rand > 0.95) {
        type = "emergency";
        vColor = "#ef4444";
        scale = [2.2, 1.2, 4.5];
        isEmergency = true;
        baseSpeed = 0.006;
      } else if (rand > 0.85) {
        type = "bus";
        vColor = "#f59e0b";
        scale = [2.5, 1.8, 8];
        baseSpeed = 0.002;
      } else if (rand > 0.75) {
        type = "truck";
        vColor = "#0f172a";
        scale = [2.4, 2, 6];
        baseSpeed = 0.002;
      } else if (rand > 0.5) {
        type = "suv";
        vColor = "#334155";
        scale = [2, 1.2, 4.2];
      }

      arr.push({
        id: i,
        type,
        color: vColor,
        edgeId: lane.edgeId,
        laneId: lane.id,
        laneIndex: 0, 
        progress: Math.random(),
        baseSpeed,
        currentSpeed: baseSpeed,
        isEmergency,
        scale
      });
    }
    return arr;
  });

  const groupedVehicles = useMemo(() => {
    const groups: Record<VehicleType, Vehicle[]> = { sedan: [], suv: [], bus: [], truck: [], emergency: [] };
    vehicles.forEach(v => {
      v.laneIndex = groups[v.type].length;
      groups[v.type].push(v);
    });
    return groups;
  }, [vehicles]);

  useLayoutEffect(() => {
    const refs = { sedan: sedanRef, suv: suvRef, bus: busRef, truck: truckRef, emergency: emergencyRef };
    Object.entries(groupedVehicles).forEach(([type, list]) => {
      const ref = refs[type as VehicleType].current;
      if (ref) {
        list.forEach((v, i) => {
          ref.setColorAt(i, colorObj.set(v.color));
        });
        if (ref.instanceColor) ref.instanceColor.needsUpdate = true;
      }
    });
  }, [groupedVehicles]);

  useFrame(() => {
    if (vehicles.length === 0) return;
    const refs = { sedan: sedanRef, suv: suvRef, bus: busRef, truck: truckRef, emergency: emergencyRef };

    cityData.nodes.forEach(node => {
      const lt = lightTimers.get(node.id)!;
      lt.timer -= 1;
      if (lt.timer <= 0) {
        lt.activeAxis = lt.activeAxis === 'h' ? 'v' : 'h';
        lt.timer = 300 + Math.random() * 100; 
      }
    });

    const laneMap = new Map<string, Vehicle[]>();
    vehicles.forEach(v => {
      if (!laneMap.has(v.laneId)) laneMap.set(v.laneId, []);
      laneMap.get(v.laneId)!.push(v);
    });
    
    laneMap.forEach(list => list.sort((a, b) => b.progress - a.progress));

    let emergencyPos: [number, number, number] | null = null;
    let trafficPos: [number, number, number] | null = null;

    const activeIncident = useDigitalTwinStore.getState().activeIncident;
    const incidentLoc = useDigitalTwinStore.getState().incidentLocation;
    
    const isNodeBlocked = (nodeId: string) => {
      if (!activeIncident || !incidentLoc) return false;
      if (activeIncident.toLowerCase() !== "accident") return false;
      const node = cityData.nodes.get(nodeId);
      if (!node) return false;
      const dx = node.pos.x - incidentLoc[0];
      const dz = node.pos.z - incidentLoc[2];
      return Math.sqrt(dx * dx + dz * dz) < 80; // Block nodes within 80 units of accident
    };

    vehicles.forEach(v => {
      const edge = cityData.edges.get(v.edgeId)!;
      const endNode = cityData.nodes.get(edge.endNode)!;
      
      let speedLimit = v.baseSpeed;

      const laneList = laneMap.get(v.laneId)!;
      const myIdx = laneList.indexOf(v);

      // Check if an emergency vehicle is coming from behind in this lane
      const hasEmergencyBehind = !v.isEmergency && laneList.slice(myIdx + 1).some(
        other => other.isEmergency && (v.progress - other.progress) < 0.28
      );

      if (myIdx > 0) {
        const carAhead = laneList[myIdx - 1];
        const dist = carAhead.progress - v.progress;
        if (dist < 0.08) {
          // If we are an emergency vehicle and the car ahead has pulled over/yielding, we can squeeze past it!
          const isAheadYielding = !carAhead.isEmergency && laneList.slice(myIdx).some(
            other => other.isEmergency && (carAhead.progress - other.progress) < 0.28
          );

          if (v.isEmergency && isAheadYielding) {
            speedLimit = v.baseSpeed * 0.8; // Weave past at slightly reduced speed
          } else {
            speedLimit = 0; // standard queueing stop
          }
        } else if (dist < 0.15) {
          speedLimit *= 0.5; 
        }
      }

      // If emergency vehicle has arrived at incident site
      if (v.isEmergency && activeIncident && incidentLoc) {
        const distToIncident = endNode.pos.distanceTo(new THREE.Vector3(incidentLoc[0], 0, incidentLoc[2]));
        if (distToIncident < 60 && v.progress > 0.75) {
          speedLimit = 0; // Park at scene
        }
      }

      // Stop normal vehicles if the intersection node is blocked by an accident
      if (isNodeBlocked(endNode.id) && v.progress > 0.82 && !v.isEmergency) {
        speedLimit = 0;
      }

      // Pull over to the side of the road if yielding to an emergency vehicle
      if (hasEmergencyBehind) {
        speedLimit *= 0.3; // Slow down
      }

      // Traffic lights check
      if (v.progress > 0.90 && v.progress < 0.98 && !v.isEmergency && !isNodeBlocked(endNode.id)) {
        const lt = lightTimers.get(endNode.id)!;
        const isGreen = lt.activeAxis === (edge.isHorizontal ? 'h' : 'v');
        if (!isGreen) {
           speedLimit = 0;
        }
      }

      v.currentSpeed += (speedLimit - v.currentSpeed) * 0.1;
      v.progress += v.currentSpeed;

      if (v.progress >= 1.0) {
        // Dynamic path rerouting: filter out outgoing edges that lead into the blocked incident area
        const outEdges = endNode.edges.filter(eId => {
          if (eId === v.edgeId) return false;
          const nextEdge = cityData.edges.get(eId)!;
          const nextNodeId = nextEdge.startNode === endNode.id ? nextEdge.endNode : nextEdge.startNode;
          return !isNodeBlocked(nextNodeId);
        });

        let finalEdges = outEdges.length > 0 ? outEdges : endNode.edges.filter(eId => eId !== v.edgeId);

        // Emergency vehicle: dispatch routing directly towards the accident location
        if (v.isEmergency && activeIncident && incidentLoc) {
          const rawEdges = endNode.edges.filter(eId => eId !== v.edgeId);
          if (rawEdges.length > 0) {
            let bestEdgeId = rawEdges[0];
            let minDist = Infinity;
            rawEdges.forEach(eId => {
              const nextEdge = cityData.edges.get(eId)!;
              const nextNode = nextEdge.startNode === endNode.id ? cityData.nodes.get(nextEdge.endNode)! : cityData.nodes.get(nextEdge.startNode)!;
              const dist = nextNode.pos.distanceTo(new THREE.Vector3(incidentLoc[0], 0, incidentLoc[2]));
              if (dist < minDist) {
                minDist = dist;
                bestEdgeId = eId;
              }
            });
            finalEdges = [bestEdgeId];
          }
        }

        if (finalEdges.length > 0) {
          const nextEdgeId = finalEdges[Math.floor(Math.random() * finalEdges.length)];
          const nextEdge = cityData.edges.get(nextEdgeId)!;
          const isOutgoing = nextEdge.startNode === endNode.id;
          const possibleLanes = nextEdge.lanes.filter(l => isOutgoing ? l.id.includes('_f') : l.id.includes('_b'));

          if (possibleLanes.length > 0) {
            const nextLane = possibleLanes[Math.floor(Math.random() * possibleLanes.length)];
            v.edgeId = nextEdgeId;
            v.laneId = nextLane.id;
            v.progress = 0;
          } else {
             v.progress = 0.99; 
          }
        } else {
          v.progress = 0; 
        }
      }

      const curLane = cityData.edges.get(v.edgeId)!.lanes.find(l => l.id === v.laneId)!;
      const px = THREE.MathUtils.lerp(curLane.startPos.x, curLane.endPos.x, v.progress);
      const pz = THREE.MathUtils.lerp(curLane.startPos.z, curLane.endPos.z, v.progress);
      
      if (v.type === "emergency" && !emergencyPos) {
        emergencyPos = [px, 0.5, pz];
      }
      if ((v.type === "sedan" || v.type === "suv") && !trafficPos) {
        trafficPos = [px, 0.5, pz];
      }

      const dirX = curLane.endPos.x - curLane.startPos.x;
      const dirZ = curLane.endPos.z - curLane.startPos.z;
      const rotY = Math.atan2(dirX, dirZ);

      // Perform physical pull-over offset if yielding to siren
      let pullOverX = 0;
      let pullOverZ = 0;
      if (hasEmergencyBehind) {
        const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
        if (length > 0) {
          const ux = dirX / length;
          const uz = dirZ / length;
          // Perpendicular offset vector to the right (relative to direction)
          pullOverX = -uz * 2.6;
          pullOverZ = ux * 2.6;
        }
      }

      dummy.position.set(px + pullOverX, 0.1 + v.scale[1] / 2, pz + pullOverZ);
      dummy.rotation.set(0, rotY, 0);
      dummy.scale.set(...v.scale);
      dummy.updateMatrix();

      const ref = refs[v.type].current;
      if (ref) {
        ref.setMatrixAt(v.laneIndex, dummy.matrix);
      }
    });

    const store = useDigitalTwinStore.getState();
    if (store.followTarget === "emergency" && emergencyPos) {
      store.setFollowedPosition(emergencyPos);
    } else if (store.followTarget === "traffic" && trafficPos) {
      store.setFollowedPosition(trafficPos);
    }

    Object.values(refs).forEach(ref => {
      if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group>
      <instancedMesh ref={sedanRef} args={[undefined, undefined, Math.max(1, groupedVehicles.sedan?.length || 0)]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.3} metalness={0.7} />
      </instancedMesh>
      
      <instancedMesh ref={suvRef} args={[undefined, undefined, Math.max(1, groupedVehicles.suv?.length || 0)]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.4} metalness={0.6} />
      </instancedMesh>

      <instancedMesh ref={busRef} args={[undefined, undefined, Math.max(1, groupedVehicles.bus?.length || 0)]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.7} metalness={0.2} />
      </instancedMesh>

      <instancedMesh ref={truckRef} args={[undefined, undefined, Math.max(1, groupedVehicles.truck?.length || 0)]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.5} metalness={0.5} />
      </instancedMesh>

      <instancedMesh ref={emergencyRef} args={[undefined, undefined, Math.max(1, groupedVehicles.emergency?.length || 0)]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.2} metalness={0.8} />
      </instancedMesh>
    </group>
  );
}
