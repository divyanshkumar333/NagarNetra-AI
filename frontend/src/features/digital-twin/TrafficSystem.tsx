import { useRef, useLayoutEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { cityData, ROAD_WIDTH } from "./useCityEngine";
import { useDigitalTwinStore } from "./useDigitalTwinStore";

const VEHICLE_COUNT = 600;

export type VehicleType = "sedan" | "suv" | "bus" | "truck" | "emergency";

export interface Vehicle {
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
  currentRotation: number;
  transverseOffset: number;
  stuckFrames: number;
}

const dummy = new THREE.Object3D();
const colorObj = new THREE.Color();

// Simple traffic light manager
export const lightTimers = new Map<string, { timer: number, activeAxis: 'h' | 'v' }>();
cityData.nodes.forEach(node => {
  lightTimers.set(node.id, { timer: Math.random() * 200, activeAxis: Math.random() > 0.5 ? 'h' : 'v' });
});

// Export active vehicles array so InspectorPanel can query live telemetry
export let activeVehicles: Vehicle[] = [];

export function TrafficSystem() {
  const edgesArr = Array.from(cityData.edges.values());
  
  // Extract all lanes from the city edges
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lanes = edgesArr.flatMap(e => e.lanes.map(l => ({ ...l, edgeId: e.id, isHorizontal: e.isHorizontal })));

  // 1. Vehicle Refs for low-poly assemblies
  const sedanBodyRef = useRef<THREE.InstancedMesh>(null);
  const sedanCabinRef = useRef<THREE.InstancedMesh>(null);
  const sedanWheelRef = useRef<THREE.InstancedMesh>(null);

  const suvBodyRef = useRef<THREE.InstancedMesh>(null);
  const suvCabinRef = useRef<THREE.InstancedMesh>(null);
  const suvWheelRef = useRef<THREE.InstancedMesh>(null);

  const busBodyRef = useRef<THREE.InstancedMesh>(null);
  const busCabinRef = useRef<THREE.InstancedMesh>(null);
  const busWheelRef = useRef<THREE.InstancedMesh>(null);

  const truckChassisRef = useRef<THREE.InstancedMesh>(null);
  const truckCabRef = useRef<THREE.InstancedMesh>(null);
  const truckCargoRef = useRef<THREE.InstancedMesh>(null);
  const truckWheelRef = useRef<THREE.InstancedMesh>(null);

  const emergencyBodyRef = useRef<THREE.InstancedMesh>(null);
  const emergencyCabinRef = useRef<THREE.InstancedMesh>(null);
  const emergencyWheelRef = useRef<THREE.InstancedMesh>(null);
  const emergencySirenRef = useRef<THREE.InstancedMesh>(null);

  const [vehicles] = useState<Vehicle[]>(() => {
    const arr: Vehicle[] = [];
    for (let i = 0; i < VEHICLE_COUNT; i++) {
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      
      const rand = Math.random();
      let type: VehicleType = "sedan";
      let vColor = "#cbd5e1"; // Clean slate white
      let scale: [number, number, number] = [1.8, 0.5, 4.0];
      let isEmergency = false;
      let baseSpeed = 0.003 + Math.random() * 0.001;

      if (rand > 0.95) {
        type = "emergency";
        vColor = "#ffffff"; // White with red details
        scale = [2.0, 0.8, 4.5];
        isEmergency = true;
        baseSpeed = 0.0055;
      } else if (rand > 0.85) {
        type = "bus";
        vColor = "#eab308"; // Transit yellow
        scale = [2.4, 1.8, 8.5];
        baseSpeed = 0.0018;
      } else if (rand > 0.72) {
        type = "truck";
        vColor = "#334155"; // Heavy industrial grey
        scale = [2.4, 1.6, 7.5];
        baseSpeed = 0.0018;
      } else if (rand > 0.45) {
        type = "suv";
        vColor = "#0f172a"; // Glossy midnight black
        scale = [2.0, 0.6, 4.2];
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
        scale,
        currentRotation: 0,
        transverseOffset: 0,
        stuckFrames: 0
      });
    }
    return arr;
  });

  // Group vehicles to match instanced counts
  const vehicleCounts = useMemo(() => {
    const counts = { sedan: 0, suv: 0, bus: 0, truck: 0, emergency: 0 };
    vehicles.forEach(v => counts[v.type]++);
    return counts;
  }, [vehicles]);

  const groupedVehicles = useMemo(() => {
    const grouped: Record<VehicleType, Vehicle[]> = { sedan: [], suv: [], bus: [], truck: [], emergency: [] };
    vehicles.forEach(v => {
      v.laneIndex = grouped[v.type].length;
      grouped[v.type].push(v);
    });
    return grouped;
  }, [vehicles]);

  useLayoutEffect(() => {
    activeVehicles = vehicles;
  }, [vehicles]);

  const setSelectedEntity = useDigitalTwinStore((state) => state.setSelectedEntity);

  // Set colors once on setup
  useLayoutEffect(() => {
    const refs = {
      sedan: sedanBodyRef,
      suv: suvBodyRef,
      bus: busBodyRef,
      truck: truckCargoRef,
      emergency: emergencyBodyRef
    };
    Object.entries(groupedVehicles).forEach(([type, list]) => {
      const ref = refs[type as VehicleType]?.current;
      if (ref) {
        list.forEach((v, i) => {
          ref.setColorAt(i, colorObj.set(v.color));
        });
        if (ref.instanceColor) ref.instanceColor.needsUpdate = true;
      }
    });
  }, [groupedVehicles]);

  // Handle pointer down on vehicles
  const handlePointerDown = (type: VehicleType) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) {
      const list = groupedVehicles[type];
      const vehicle = list[e.instanceId];
      if (vehicle) {
        setSelectedEntity({
          id: `vehicle_${vehicle.type}_${vehicle.id}`,
          type: "vehicle",
          vehicleType: vehicle.type,
          vehicleId: vehicle.id,
          speed: vehicle.currentSpeed,
          isEmergency: vehicle.isEmergency,
          laneId: vehicle.laneId,
          edgeId: vehicle.edgeId
        });
      }
    }
  };

  // Set colors once on setup
  useLayoutEffect(() => {
    const refs = {
      sedan: sedanBodyRef,
      suv: suvBodyRef,
      bus: busBodyRef,
      truck: truckCargoRef,
      emergency: emergencyBodyRef
    };
    Object.entries(groupedVehicles).forEach(([type, list]) => {
      const ref = refs[type as VehicleType]?.current;
      if (ref) {
        list.forEach((v, i) => {
          ref.setColorAt(i, colorObj.set(v.color));
        });
        if (ref.instanceColor) ref.instanceColor.needsUpdate = true;
      }
    });
  }, [vehicles]);

  useFrame((state) => {
    if (vehicles.length === 0) return;

    const simulationSpeed = useDigitalTwinStore.getState().simulationSpeed;

    // Tick intersection traffic timers
    cityData.nodes.forEach(node => {
      const lt = lightTimers.get(node.id)!;
      lt.timer -= 1 * simulationSpeed;
      if (lt.timer <= 0) {
        lt.activeAxis = lt.activeAxis === 'h' ? 'v' : 'h';
        lt.timer = 280 + Math.random() * 80;
      }
    });

    // Map vehicles to lanes
    const laneMap = new Map<string, Vehicle[]>();
    vehicles.forEach(v => {
      if (!laneMap.has(v.laneId)) laneMap.set(v.laneId, []);
      laneMap.get(v.laneId)!.push(v);
    });
    laneMap.forEach(list => list.sort((a, b) => b.progress - a.progress));

    const activeIncident = useDigitalTwinStore.getState().activeIncident;
    const incidentLoc = useDigitalTwinStore.getState().incidentLocation;

    const isNodeBlocked = (nodeId: string) => {
      if (!activeIncident || !incidentLoc) return false;
      if (activeIncident.toLowerCase() !== "accident") return false;
      const node = cityData.nodes.get(nodeId);
      if (!node) return false;
      const dx = node.pos.x - incidentLoc[0];
      const dz = node.pos.z - incidentLoc[2];
      return Math.sqrt(dx * dx + dz * dz) < 85;
    };

    let emergencyPos: [number, number, number] | null = null;
    let trafficPos: [number, number, number] | null = null;

    const elapsed = state.clock.getElapsedTime();
    const wheelSpin = elapsed * 15;

    vehicles.forEach(v => {
      const edge = cityData.edges.get(v.edgeId)!;
      const startNode = cityData.nodes.get(edge.startNode)!;
      const endNode = cityData.nodes.get(edge.endNode)!;
      const laneLength = startNode.pos.distanceTo(endNode.pos);

      let speedLimit = v.baseSpeed;

      const laneList = laneMap.get(v.laneId)!;
      const myIdx = laneList.indexOf(v);

      const hasEmergencyBehind = !v.isEmergency && laneList.slice(myIdx + 1).some(
        other => other.isEmergency && (v.progress - other.progress) * laneLength < 25.0
      );

      // Safe World Space Collision checks
      if (myIdx > 0) {
        const carAhead = laneList[myIdx - 1];
        const distMeters = (carAhead.progress - v.progress) * laneLength;
        const safeGapStop = v.scale[2] / 2 + carAhead.scale[2] / 2 + 1.8;
        const safeGapSlow = v.scale[2] / 2 + carAhead.scale[2] / 2 + 8.0;

        if (distMeters < safeGapStop) {
          // Check if emergency vehicle can weave past pull-over vehicle
          const isAheadYielding = !carAhead.isEmergency && laneList.slice(myIdx).some(
            other => other.isEmergency && (carAhead.progress - other.progress) * laneLength < 25.0
          );
          if (v.isEmergency && isAheadYielding) {
            speedLimit = v.baseSpeed * 0.7; // Squeeze past slowly
          } else {
            speedLimit = 0; // stop
          }
        } else if (distMeters < safeGapSlow) {
          speedLimit *= 0.45; // Smooth braking
        }
      }

      // Dynamic Lane Changing if stuck behind a slower vehicle
      if (myIdx > 0 && v.currentSpeed < 0.001 && !v.isEmergency) {
        const otherLanePrefix = v.laneId.includes('_f') ? '_f' : '_b';
        const otherLaneNum = v.laneId.endsWith('1') ? '2' : '1';
        const targetLaneId = `${v.edgeId}${otherLanePrefix}${otherLaneNum}`;
        const targetLaneList = laneMap.get(targetLaneId);

        if (targetLaneList) {
          const isTargetClear = !targetLaneList.some(
            other => Math.abs(other.progress - v.progress) * laneLength < 16.0
          );
          if (isTargetClear) {
            v.laneId = targetLaneId;
            v.transverseOffset = v.laneId.endsWith('1') ? -ROAD_WIDTH / 4 : ROAD_WIDTH / 4;
          }
        }
      }

      // Interpolate visual lane-change offset back to 0
      if (v.transverseOffset !== 0) {
        v.transverseOffset += (0 - v.transverseOffset) * 0.08;
      }

      // Stop emergency vehicles at incident scene
      if (v.isEmergency && activeIncident && incidentLoc) {
        const distToIncident = endNode.pos.distanceTo(new THREE.Vector3(incidentLoc[0], 0, incidentLoc[2]));
        if (distToIncident < 60 && v.progress > 0.75) {
          speedLimit = 0;
        }
      }

      // Traffic light check
      if (v.progress > 0.88 && v.progress < 0.98 && !v.isEmergency && !isNodeBlocked(endNode.id)) {
        const lt = lightTimers.get(endNode.id)!;
        const isGreen = lt.activeAxis === (edge.isHorizontal ? 'h' : 'v');
        if (!isGreen) {
          speedLimit = 0;
        }
      }

      // Accident node block
      if (isNodeBlocked(endNode.id) && v.progress > 0.82 && !v.isEmergency) {
        speedLimit = 0;
      }

      // Emergency siren pull-over
      if (hasEmergencyBehind) {
        speedLimit *= 0.35;
      }

      // Stuck recovery failsafe
      if (v.currentSpeed < 0.0001) {
        v.stuckFrames++;
        if (v.stuckFrames > 280) { // ~4.6 seconds
          // Teleport/bypass to keep city simulation moving
          const newLane = lanes[Math.floor(Math.random() * lanes.length)];
          v.edgeId = newLane.edgeId;
          v.laneId = newLane.id;
          v.progress = Math.random() * 0.4;
          v.currentSpeed = v.baseSpeed;
          v.stuckFrames = 0;
        }
      } else {
        v.stuckFrames = 0;
      }

      // Acceleration and Braking rates
      const rate = (speedLimit < v.currentSpeed) ? 0.22 : 0.04;
      v.currentSpeed += (speedLimit - v.currentSpeed) * rate;
      v.progress += v.currentSpeed * simulationSpeed;

      // Handle edge crossings
      if (v.progress >= 1.0) {
        const outEdges = endNode.edges.filter(eId => {
          if (eId === v.edgeId) return false;
          const nextEdge = cityData.edges.get(eId)!;
          const nextNodeId = nextEdge.startNode === endNode.id ? nextEdge.endNode : nextEdge.startNode;
          return !isNodeBlocked(nextNodeId);
        });

        let finalEdges = outEdges.length > 0 ? outEdges : endNode.edges.filter(eId => eId !== v.edgeId);

        // Emergency route optimization
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
            v.edgeId = nextEdgeId;
            v.laneId = possibleLanes[Math.floor(Math.random() * possibleLanes.length)].id;
            v.progress = 0;
          } else {
            v.progress = 0.99;
          }
        } else {
          v.progress = 0;
        }
      }

      // Calculate 3D coordinates
      const curLane = cityData.edges.get(v.edgeId)!.lanes.find(l => l.id === v.laneId)!;
      const px = THREE.MathUtils.lerp(curLane.startPos.x, curLane.endPos.x, v.progress);
      const pz = THREE.MathUtils.lerp(curLane.startPos.z, curLane.endPos.z, v.progress);

      if (v.type === "emergency" && !emergencyPos) {
        emergencyPos = [px, 0.6, pz];
      }
      if ((v.type === "sedan" || v.type === "suv") && !trafficPos) {
        trafficPos = [px, 0.6, pz];
      }

      // Direction vectors
      const dirX = curLane.endPos.x - curLane.startPos.x;
      const dirZ = curLane.endPos.z - curLane.startPos.z;
      const rotY = Math.atan2(dirX, dirZ);

      // Smooth Steering angle wrapping
      if (v.currentRotation === undefined || v.currentRotation === 0) {
        v.currentRotation = rotY;
      }
      let diff = rotY - v.currentRotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      v.currentRotation += diff * 0.12;

      // Yielding pull-over displacement offset
      let pullOverX = 0;
      let pullOverZ = 0;
      if (hasEmergencyBehind) {
        const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
        if (length > 0) {
          pullOverX = -(dirZ / length) * 2.8;
          pullOverZ = (dirX / length) * 2.8;
        }
      }

      // Dynamic transverseOffset slide
      let slideX = 0;
      let slideZ = 0;
      if (v.transverseOffset !== 0) {
        const len = Math.sqrt(dirX*dirX + dirZ*dirZ);
        if (len > 0) {
          slideX = -(dirZ / len) * v.transverseOffset;
          slideZ = (dirX / len) * v.transverseOffset;
        }
      }

      const finalX = px + pullOverX + slideX;
      const finalZ = pz + pullOverZ + slideZ;

      // Update Sub-mesh parts in sync
      if (v.type === "sedan" && sedanBodyRef.current && sedanCabinRef.current && sedanWheelRef.current) {
        const i = v.laneIndex;
        // 1. Body (sleeker)
        dummy.position.set(finalX, 0.25, finalZ);
        dummy.rotation.set(0, v.currentRotation, 0);
        dummy.scale.set(1.95, 0.35, 4.4);
        dummy.updateMatrix();
        sedanBodyRef.current.setMatrixAt(i, dummy.matrix);

        // 2. Cabin (shifted back for a longer hood)
        dummy.position.set(finalX, 0.55, finalZ).add(new THREE.Vector3(0, 0, -0.4).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.currentRotation));
        dummy.rotation.set(0, v.currentRotation, 0);
        dummy.scale.set(1.65, 0.35, 2.0);
        dummy.updateMatrix();
        sedanCabinRef.current.setMatrixAt(i, dummy.matrix);

        // 3. Wheels
        const wheelsOffset = [
          [-0.9, 0.15, 1.4],  [0.9, 0.15, 1.4],
          [-0.9, 0.15, -1.3], [0.9, 0.15, -1.3]
        ];
        wheelsOffset.forEach((wOffset, w) => {
          const wPos = new THREE.Vector3(wOffset[0], wOffset[1], wOffset[2]).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.currentRotation);
          dummy.position.set(finalX, 0.15, finalZ).add(wPos);
          dummy.rotation.set(0, v.currentRotation, wheelSpin);
          dummy.scale.set(0.3, 0.35, 0.3);
          dummy.updateMatrix();
          sedanWheelRef.current!.setMatrixAt(4 * i + w, dummy.matrix);
        });
      }

      else if (v.type === "suv" && suvBodyRef.current && suvCabinRef.current && suvWheelRef.current) {
        const i = v.laneIndex;
        // 1. Body
        dummy.position.set(finalX, 0.35, finalZ);
        dummy.rotation.set(0, v.currentRotation, 0);
        dummy.scale.set(2.1, 0.55, 4.5);
        dummy.updateMatrix();
        suvBodyRef.current.setMatrixAt(i, dummy.matrix);

        // 2. Cabin
        dummy.position.set(finalX, 0.90, finalZ).add(new THREE.Vector3(0, 0, -0.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.currentRotation));
        dummy.rotation.set(0, v.currentRotation, 0);
        dummy.scale.set(1.8, 0.5, 2.6);
        dummy.updateMatrix();
        suvCabinRef.current.setMatrixAt(i, dummy.matrix);

        // 3. Wheels
        const wheelsOffset = [
          [-1.0, 0.22, 1.4],  [1.0, 0.22, 1.4],
          [-1.0, 0.22, -1.4], [1.0, 0.22, -1.4]
        ];
        wheelsOffset.forEach((wOffset, w) => {
          const wPos = new THREE.Vector3(wOffset[0], wOffset[1], wOffset[2]).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.currentRotation);
          dummy.position.set(finalX, 0.22, finalZ).add(wPos);
          dummy.rotation.set(0, v.currentRotation, wheelSpin);
          dummy.scale.set(0.4, 0.44, 0.4);
          dummy.updateMatrix();
          suvWheelRef.current!.setMatrixAt(4 * i + w, dummy.matrix);
        });
      }

      else if (v.type === "bus" && busBodyRef.current && busCabinRef.current && busWheelRef.current) {
        const i = v.laneIndex;
        // 1. Body
        dummy.position.set(finalX, 0.8, finalZ);
        dummy.rotation.set(0, v.currentRotation, 0);
        dummy.scale.set(2.4, 1.6, 8.5);
        dummy.updateMatrix();
        busBodyRef.current.setMatrixAt(i, dummy.matrix);

        // 2. Cabin/Windows (upper band)
        dummy.position.set(finalX, 1.4, finalZ);
        dummy.rotation.set(0, v.currentRotation, 0);
        dummy.scale.set(2.35, 0.6, 8.3);
        dummy.updateMatrix();
        busCabinRef.current.setMatrixAt(i, dummy.matrix);

        // 3. Wheels (6 wheels)
        const wheelsOffset = [
          [-1.2, 0.25, 2.6],  [1.2, 0.25, 2.6],
          [-1.2, 0.25, 0.0],  [1.2, 0.25, 0.0],
          [-1.2, 0.25, -2.6], [1.2, 0.25, -2.6]
        ];
        wheelsOffset.forEach((wOffset, w) => {
          const wPos = new THREE.Vector3(wOffset[0], wOffset[1], wOffset[2]).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.currentRotation);
          dummy.position.set(finalX, 0.25, finalZ).add(wPos);
          dummy.rotation.set(0, v.currentRotation, wheelSpin);
          dummy.scale.set(0.5, 0.5, 0.5);
          dummy.updateMatrix();
          busWheelRef.current!.setMatrixAt(6 * i + w, dummy.matrix);
        });
      }

      else if (v.type === "truck" && truckChassisRef.current && truckCabRef.current && truckCargoRef.current && truckWheelRef.current) {
        const i = v.laneIndex;
        // 1. Flatbed Chassis
        dummy.position.set(finalX, 0.22, finalZ);
        dummy.rotation.set(0, v.currentRotation, 0);
        dummy.scale.set(2.3, 0.35, 7.5);
        dummy.updateMatrix();
        truckChassisRef.current.setMatrixAt(i, dummy.matrix);

        // 2. Cab Cabin (front)
        dummy.position.set(finalX, 0.8, finalZ).add(new THREE.Vector3(0, 0, 2.4).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.currentRotation));
        dummy.rotation.set(0, v.currentRotation, 0);
        dummy.scale.set(2.2, 1.3, 2.2);
        dummy.updateMatrix();
        truckCabRef.current.setMatrixAt(i, dummy.matrix);

        // 3. Cargo Container (back)
        dummy.position.set(finalX, 1.25, finalZ).add(new THREE.Vector3(0, 0, -1.1).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.currentRotation));
        dummy.rotation.set(0, v.currentRotation, 0);
        dummy.scale.set(2.4, 2.0, 4.6);
        dummy.updateMatrix();
        truckCargoRef.current.setMatrixAt(i, dummy.matrix);

        // 4. Wheels (6 wheels)
        const wheelsOffset = [
          [-1.15, 0.25, 2.3],  [1.15, 0.25, 2.3],
          [-1.15, 0.25, -1.0], [1.15, 0.25, -1.0],
          [-1.15, 0.25, -2.8], [1.15, 0.25, -2.8]
        ];
        wheelsOffset.forEach((wOffset, w) => {
          const wPos = new THREE.Vector3(wOffset[0], wOffset[1], wOffset[2]).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.currentRotation);
          dummy.position.set(finalX, 0.25, finalZ).add(wPos);
          dummy.rotation.set(0, v.currentRotation, wheelSpin);
          dummy.scale.set(0.5, 0.5, 0.5);
          dummy.updateMatrix();
          truckWheelRef.current!.setMatrixAt(6 * i + w, dummy.matrix);
        });
      }

      else if (v.type === "emergency" && emergencyBodyRef.current && emergencyCabinRef.current && emergencyWheelRef.current && emergencySirenRef.current) {
        const i = v.laneIndex;
        // 1. Ambulance Body (White base)
        dummy.position.set(finalX, 0.4, finalZ);
        dummy.rotation.set(0, v.currentRotation, 0);
        dummy.scale.set(2.0, 0.8, 4.5);
        dummy.updateMatrix();
        emergencyBodyRef.current.setMatrixAt(i, dummy.matrix);

        // 2. Cabin (Red details and glass)
        dummy.position.set(finalX, 1.0, finalZ).add(new THREE.Vector3(0, 0, -0.4).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.currentRotation));
        dummy.rotation.set(0, v.currentRotation, 0);
        dummy.scale.set(1.9, 0.6, 2.8);
        dummy.updateMatrix();
        emergencyCabinRef.current.setMatrixAt(i, dummy.matrix);

        // 3. Wheels
        const wheelsOffset = [
          [-1.0, 0.2, 1.4],  [1.0, 0.2, 1.4],
          [-1.0, 0.2, -1.4], [1.0, 0.2, -1.4]
        ];
        wheelsOffset.forEach((wOffset, w) => {
          const wPos = new THREE.Vector3(wOffset[0], wOffset[1], wOffset[2]).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.currentRotation);
          dummy.position.set(finalX, 0.20, finalZ).add(wPos);
          dummy.rotation.set(0, v.currentRotation, wheelSpin);
          dummy.scale.set(0.4, 0.4, 0.4);
          dummy.updateMatrix();
          emergencyWheelRef.current!.setMatrixAt(4 * i + w, dummy.matrix);
        });

        // 4. Siren flashing Red/Blue
        dummy.position.set(finalX, 1.35, finalZ).add(new THREE.Vector3(0, 0, -0.4).applyAxisAngle(new THREE.Vector3(0, 1, 0), v.currentRotation));
        dummy.scale.set(0.35, 0.2, 0.35);
        dummy.rotation.set(0, v.currentRotation, 0);
        dummy.updateMatrix();
        emergencySirenRef.current.setMatrixAt(i, dummy.matrix);
        
        // Alternating siren color in real-time
        const sirenToggle = Math.sin(state.clock.getElapsedTime() * 18.0) > 0;
        emergencySirenRef.current.setColorAt(i, colorObj.set(sirenToggle ? "#ef4444" : "#3b82f6"));
      }
    });

    const store = useDigitalTwinStore.getState();
    if (store.followTarget === "emergency" && emergencyPos) {
      store.setFollowedPosition(emergencyPos);
    } else if (store.followTarget === "traffic" && trafficPos) {
      store.setFollowedPosition(trafficPos);
    }

    // Flag matrix updates
    const instancedRefs = [
      sedanBodyRef, sedanCabinRef, sedanWheelRef,
      suvBodyRef, suvCabinRef, suvWheelRef,
      busBodyRef, busCabinRef, busWheelRef,
      truckChassisRef, truckCabRef, truckCargoRef, truckWheelRef,
      emergencyBodyRef, emergencyCabinRef, emergencyWheelRef, emergencySirenRef
    ];
    instancedRefs.forEach(ref => {
      if (ref.current) {
        ref.current.instanceMatrix.needsUpdate = true;
        if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
      }
    });
  });

  return (
    <group>
      {/* Sedan Parts */}
      <instancedMesh ref={sedanBodyRef} args={[undefined, undefined, Math.max(1, vehicleCounts.sedan)]} castShadow onPointerDown={handlePointerDown("sedan")}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.25} metalness={0.75} />
      </instancedMesh>
      <instancedMesh ref={sedanCabinRef} args={[undefined, undefined, Math.max(1, vehicleCounts.sedan)]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.1} metalness={0.9} color="#0f172a" />
      </instancedMesh>
      <instancedMesh ref={sedanWheelRef} args={[undefined, undefined, Math.max(4, vehicleCounts.sedan * 4)]} castShadow>
        <cylinderGeometry args={[1, 1, 0.4, 10]} />
        <meshStandardMaterial roughness={0.9} color="#111827" />
      </instancedMesh>

      {/* SUV Parts */}
      <instancedMesh ref={suvBodyRef} args={[undefined, undefined, Math.max(1, vehicleCounts.suv)]} castShadow onPointerDown={handlePointerDown("suv")}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.3} metalness={0.65} />
      </instancedMesh>
      <instancedMesh ref={suvCabinRef} args={[undefined, undefined, Math.max(1, vehicleCounts.suv)]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.1} metalness={0.9} color="#1e293b" />
      </instancedMesh>
      <instancedMesh ref={suvWheelRef} args={[undefined, undefined, Math.max(4, vehicleCounts.suv * 4)]} castShadow>
        <cylinderGeometry args={[1, 1, 0.4, 10]} />
        <meshStandardMaterial roughness={0.9} color="#111827" />
      </instancedMesh>

      {/* Bus Parts */}
      <instancedMesh ref={busBodyRef} args={[undefined, undefined, Math.max(1, vehicleCounts.bus)]} castShadow onPointerDown={handlePointerDown("bus")}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.5} metalness={0.2} />
      </instancedMesh>
      <instancedMesh ref={busCabinRef} args={[undefined, undefined, Math.max(1, vehicleCounts.bus)]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.2} metalness={0.8} color="#1e293b" />
      </instancedMesh>
      <instancedMesh ref={busWheelRef} args={[undefined, undefined, Math.max(6, vehicleCounts.bus * 6)]} castShadow>
        <cylinderGeometry args={[1, 1, 0.4, 10]} />
        <meshStandardMaterial roughness={0.9} color="#111827" />
      </instancedMesh>

      {/* Truck Parts */}
      <instancedMesh ref={truckChassisRef} args={[undefined, undefined, Math.max(1, vehicleCounts.truck)]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.7} metalness={0.6} color="#111827" />
      </instancedMesh>
      <instancedMesh ref={truckCabRef} args={[undefined, undefined, Math.max(1, vehicleCounts.truck)]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.4} metalness={0.5} color="#e2e8f0" />
      </instancedMesh>
      <instancedMesh ref={truckCargoRef} args={[undefined, undefined, Math.max(1, vehicleCounts.truck)]} castShadow onPointerDown={handlePointerDown("truck")}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.6} metalness={0.2} />
      </instancedMesh>
      <instancedMesh ref={truckWheelRef} args={[undefined, undefined, Math.max(6, vehicleCounts.truck * 6)]} castShadow>
        <cylinderGeometry args={[1, 1, 0.4, 10]} />
        <meshStandardMaterial roughness={0.9} color="#111827" />
      </instancedMesh>

      {/* Emergency Parts */}
      <instancedMesh ref={emergencyBodyRef} args={[undefined, undefined, Math.max(1, vehicleCounts.emergency)]} castShadow onPointerDown={handlePointerDown("emergency")}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.3} metalness={0.6} />
      </instancedMesh>
      <instancedMesh ref={emergencyCabinRef} args={[undefined, undefined, Math.max(1, vehicleCounts.emergency)]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.1} metalness={0.9} color="#0f172a" />
      </instancedMesh>
      <instancedMesh ref={emergencyWheelRef} args={[undefined, undefined, Math.max(4, vehicleCounts.emergency * 4)]} castShadow>
        <cylinderGeometry args={[1, 1, 0.4, 10]} />
        <meshStandardMaterial roughness={0.9} color="#111827" />
      </instancedMesh>
      <instancedMesh ref={emergencySirenRef} args={[undefined, undefined, Math.max(1, vehicleCounts.emergency)]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial roughness={0.1} metalness={0.9} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
