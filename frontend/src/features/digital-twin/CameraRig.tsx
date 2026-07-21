import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useDigitalTwinStore, CameraPreset } from "./useDigitalTwinStore";
import { useRef, useEffect } from "react";
import { cityData } from "./useCityEngine";

const PRESETS: Record<CameraPreset, { pos: [number, number, number], target: [number, number, number] }> = {
  "overview": { pos: [220, 180, 280], target: [0, 0, 0] },
  "intersection": { pos: [60, 45, 75], target: [30, 0, 30] },
  "incident": { pos: [-80, 40, -40], target: [-100, 0, -60] },
  "ai-focus": { pos: [100, 150, -100], target: [0, 0, 0] },
  "traffic": { pos: [0, 20, 150], target: [0, 0, 0] },
  "downtown": { pos: [150, 120, 180], target: [0, 20, 0] },
  "stadium": { pos: [-250, 80, -250], target: [-300, 15, -300] },
  "skyline": { pos: [0, 30, 450], target: [0, 100, 0] },
  "birds-eye": { pos: [0, 400, 0], target: [0, 0, 0] },
};

export function CameraRig() {
  const { 
    cameraPreset, 
    introActive, 
    setIntroActive, 
    followTarget, 
    followedPosition,
    selectedEntity,
    cameraMode 
  } = useDigitalTwinStore();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef({ yaw: 0, pitch: -0.5 });
  
  // Drone Physics States
  const dronePos = useRef(new THREE.Vector3(30, 40, 50));
  const droneVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const droneTilt = useRef({ pitch: 0, roll: 0 });
  const droneSpeedLimit = useRef(75.0);
  const propellerAngle = useRef(0);

  // Heli Physics States
  const heliPos = useRef(new THREE.Vector3(-45, 65, -45));
  const heliVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const heliTilt = useRef({ pitch: 0, roll: 0 });
  const mainRotorAngle = useRef(0);

  // Drone Groups
  const droneGroupRef = useRef<THREE.Group>(null);
  const prop1Ref = useRef<THREE.Group>(null);
  const prop2Ref = useRef<THREE.Group>(null);
  const prop3Ref = useRef<THREE.Group>(null);
  const prop4Ref = useRef<THREE.Group>(null);

  // Heli Groups
  const heliGroupRef = useRef<THREE.Group>(null);
  const heliMainRotorRef = useRef<THREE.Group>(null);
  const heliTailRotorRef = useRef<THREE.Group>(null);

  // Keyboard and Mouse listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      const mode = useDigitalTwinStore.getState().cameraMode;
      if ((mode === "free" || mode === "copter") && e.buttons === 1) {
        const sensitivity = 0.0025;
        mouseRef.current.yaw -= e.movementX * sensitivity;
        mouseRef.current.pitch = Math.max(-Math.PI / 2 + 0.15, Math.min(Math.PI / 2 - 0.15, mouseRef.current.pitch - e.movementY * sensitivity));
      }
    };
    const handleWheel = (e: WheelEvent) => {
      const mode = useDigitalTwinStore.getState().cameraMode;
      if (mode === "free") {
        droneSpeedLimit.current = Math.max(10, Math.min(220, droneSpeedLimit.current - e.deltaY * 0.1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Skip intro
  useEffect(() => {
    const handleSkip = () => {
      if (useDigitalTwinStore.getState().introActive) {
        useDigitalTwinStore.getState().setIntroActive(false);
      }
    };
    window.addEventListener("pointerdown", handleSkip);
    window.addEventListener("wheel", handleSkip);
    window.addEventListener("touchstart", handleSkip);
    return () => {
      window.removeEventListener("pointerdown", handleSkip);
      window.removeEventListener("wheel", handleSkip);
      window.removeEventListener("touchstart", handleSkip);
    };
  }, []);

  // Bounding Collision pushes away from building geometry
  const checkBuildingCollision = (pos: THREE.Vector3, padding: number) => {
    const buildings = cityData.buildings;
    for (let i = 0; i < buildings.length; i++) {
      const bld = buildings[i];
      const bHeight = bld.scale[1] + 0.4;
      const halfW = bld.scale[0] / 2 + padding;
      const halfD = bld.scale[2] / 2 + padding;

      const dx = pos.x - bld.position[0];
      const dz = pos.z - bld.position[2];

      if (Math.abs(dx) < halfW && Math.abs(dz) < halfD && pos.y < bHeight + padding) {
        const overlapX = halfW - Math.abs(dx);
        const overlapZ = halfD - Math.abs(dz);
        const overlapY = (bHeight + padding) - pos.y;

        if (overlapY < overlapX && overlapY < overlapZ) {
          pos.y = bHeight + padding;
        } else if (overlapX < overlapZ) {
          pos.x += Math.sign(dx) * overlapX;
        } else {
          pos.z += Math.sign(dz) * overlapZ;
        }
      }
    }
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const lambda = 2.8;

    // Intro Flight fly-by
    if (introActive) {
      const elapsed = state.clock.getElapsedTime();
      const introDuration = 7.0;

      if (elapsed >= introDuration) {
        setIntroActive(false);
        return;
      }

      const ratio = elapsed / introDuration;
      const startRadius = 550;
      const endRadius = 320;
      const currentRadius = startRadius - (startRadius - endRadius) * ratio;
      const angle = ratio * Math.PI * 1.5;

      const targetX = currentRadius * Math.sin(angle);
      const targetY = 380 - ratio * 200;
      const targetZ = currentRadius * Math.cos(angle);

      state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, lambda, dt);
      state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, lambda, dt);
      state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, lambda, dt);

      if (controlsRef.current) {
        controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, 0, lambda, dt);
        controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, 40 - ratio * 40, lambda, dt);
        controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, 0, lambda, dt);
        controlsRef.current.update();
      }
      return;
    }

    // 1. Piloted Drone Flight Simulation
    if (cameraMode === "free") {
      const keys = keysRef.current;
      const maxSpeed = keys["shift"] ? droneSpeedLimit.current * 1.8 : droneSpeedLimit.current;

      const accel = new THREE.Vector3();
      const forwardVec = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseRef.current.yaw);
      const rightVec = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseRef.current.yaw);
      const upVec = new THREE.Vector3(0, 1, 0);

      if (keys["w"]) accel.add(forwardVec);
      if (keys["s"]) accel.sub(forwardVec);
      if (keys["a"]) accel.sub(rightVec);
      if (keys["d"]) accel.add(rightVec);
      if (keys["e"]) accel.add(upVec);
      if (keys["q"]) accel.sub(upVec);

      if (accel.lengthSq() > 0) {
        accel.normalize().multiplyScalar(120.0 * dt);
        droneVelocity.current.add(accel);
      }

      droneVelocity.current.multiplyScalar(Math.exp(-2.2 * dt));

      const speedMagnitude = droneVelocity.current.length();
      if (speedMagnitude > maxSpeed * 0.016) {
        droneVelocity.current.setLength(maxSpeed * 0.016);
      }

      dronePos.current.add(droneVelocity.current);
      checkBuildingCollision(dronePos.current, 2.0);
      if (dronePos.current.y < 3.0) {
        dronePos.current.y = 3.0;
        droneVelocity.current.y = 0;
      }

      const relativeForward = droneVelocity.current.dot(forwardVec) / (maxSpeed * 0.016);
      const relativeStrafe = droneVelocity.current.dot(rightVec) / (maxSpeed * 0.016);
      const hoverBob = Math.sin(state.clock.getElapsedTime() * 4.0) * 0.08;

      droneTilt.current.pitch = THREE.MathUtils.damp(droneTilt.current.pitch, -relativeForward * 0.22, 6.0, dt);
      droneTilt.current.roll = THREE.MathUtils.damp(droneTilt.current.roll, -relativeStrafe * 0.28, 6.0, dt);

      if (droneGroupRef.current) {
        droneGroupRef.current.position.copy(dronePos.current);
        droneGroupRef.current.position.y += hoverBob;
        const euler = new THREE.Euler(droneTilt.current.pitch, mouseRef.current.yaw, droneTilt.current.roll, "YXZ");
        droneGroupRef.current.rotation.copy(euler);
      }

      const spinSpeed = 20.0 + speedMagnitude * 120.0;
      propellerAngle.current += spinSpeed * dt;
      if (prop1Ref.current) prop1Ref.current.rotation.y = propellerAngle.current;
      if (prop2Ref.current) prop2Ref.current.rotation.y = -propellerAngle.current;
      if (prop3Ref.current) prop3Ref.current.rotation.y = propellerAngle.current;
      if (prop4Ref.current) prop4Ref.current.rotation.y = -propellerAngle.current;

      const followX = dronePos.current.x - forwardVec.x * 16.5;
      const followY = dronePos.current.y + 6.2;
      const followZ = dronePos.current.z - forwardVec.z * 16.5;

      const shakeVal = speedMagnitude * 0.12;
      const shakeX = (Math.random() - 0.5) * shakeVal * 0.05;
      const shakeY = (Math.random() - 0.5) * shakeVal * 0.05;

      state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, followX + shakeX, 7.5, dt);
      state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, followY + shakeY, 7.5, dt);
      state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, followZ, 7.5, dt);

      checkBuildingCollision(state.camera.position, 1.8);

      const lookTarget = new THREE.Vector3(
        dronePos.current.x + forwardVec.x * 5.0,
        dronePos.current.y - 0.4,
        dronePos.current.z + forwardVec.z * 5.0
      );
      state.camera.lookAt(lookTarget);

      useDigitalTwinStore.getState().setFollowedPosition([dronePos.current.x, dronePos.current.y, dronePos.current.z]);
    } 

    // 2. Piloted Helicopter Flight Simulation (New requested feature)
    else if (cameraMode === "copter") {
      const keys = keysRef.current;
      const maxSpeed = keys["shift"] ? 140.0 : 85.0; // Helicopter has higher speed ceilings

      const accel = new THREE.Vector3();
      const forwardVec = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseRef.current.yaw);
      const rightVec = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseRef.current.yaw);
      const upVec = new THREE.Vector3(0, 1, 0);

      // WASD horizontal, QE vertical elevation
      if (keys["w"]) accel.add(forwardVec);
      if (keys["s"]) accel.sub(forwardVec);
      if (keys["a"]) accel.sub(rightVec);
      if (keys["d"]) accel.add(rightVec);
      if (keys["e"]) accel.add(upVec);
      if (keys["q"]) accel.sub(upVec);

      // Helicopter acceleration forces
      if (accel.lengthSq() > 0) {
        accel.normalize().multiplyScalar(90.0 * dt);
        heliVelocity.current.add(accel);
      }

      // Air resistance linear drag
      heliVelocity.current.multiplyScalar(Math.exp(-1.5 * dt));

      const speedMagnitude = heliVelocity.current.length();
      if (speedMagnitude > maxSpeed * 0.016) {
        heliVelocity.current.setLength(maxSpeed * 0.016);
      }

      // Update position and check collision
      heliPos.current.add(heliVelocity.current);
      checkBuildingCollision(heliPos.current, 3.5); // Larger padding for heli chassis
      if (heliPos.current.y < 4.0) {
        heliPos.current.y = 4.0;
        heliVelocity.current.y = 0;
      }

      const relativeForward = heliVelocity.current.dot(forwardVec) / (maxSpeed * 0.016);
      const relativeStrafe = heliVelocity.current.dot(rightVec) / (maxSpeed * 0.016);

      // Calculate tilt limits
      heliTilt.current.pitch = THREE.MathUtils.damp(heliTilt.current.pitch, -relativeForward * 0.28, 5.0, dt);
      heliTilt.current.roll = THREE.MathUtils.damp(heliTilt.current.roll, -relativeStrafe * 0.32, 5.0, dt);

      // Position helicopter group
      if (heliGroupRef.current) {
        heliGroupRef.current.position.copy(heliPos.current);
        const euler = new THREE.Euler(heliTilt.current.pitch, mouseRef.current.yaw, heliTilt.current.roll, "YXZ");
        heliGroupRef.current.rotation.copy(euler);
      }

      // Spin main and tail rotors
      const rSpeed = 30.0 + speedMagnitude * 90.0;
      mainRotorAngle.current += rSpeed * dt;
      if (heliMainRotorRef.current) {
        heliMainRotorRef.current.rotation.y = mainRotorAngle.current;
      }
      if (heliTailRotorRef.current) {
        heliTailRotorRef.current.rotation.z = mainRotorAngle.current * 1.35;
      }

      // Follow camera coordinates (helicopter has larger offset)
      const followX = heliPos.current.x - forwardVec.x * 25.0;
      const followY = heliPos.current.y + 9.5;
      const followZ = heliPos.current.z - forwardVec.z * 25.0;

      const shakeVal = speedMagnitude * 0.08;
      const shakeX = (Math.random() - 0.5) * shakeVal * 0.05;
      const shakeY = (Math.random() - 0.5) * shakeVal * 0.05;

      state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, followX + shakeX, 6.8, dt);
      state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, followY + shakeY, 6.8, dt);
      state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, followZ, 6.8, dt);

      checkBuildingCollision(state.camera.position, 2.5);

      const lookTarget = new THREE.Vector3(
        heliPos.current.x + forwardVec.x * 7.0,
        heliPos.current.y - 0.8,
        heliPos.current.z + forwardVec.z * 7.0
      );
      state.camera.lookAt(lookTarget);

      useDigitalTwinStore.getState().setFollowedPosition([heliPos.current.x, heliPos.current.y, heliPos.current.z]);
    }

    // 3. Cinematic auto-follow cameras
    else {
      if (followTarget !== "none" && followedPosition && controlsRef.current) {
        const [fx, fy, fz] = followedPosition;
        
        let offsetX = -35;
        let offsetY = 50;
        let offsetZ = 60;
        
        if (followTarget === "drone") {
          offsetX = 0;
          offsetY = 35;
          offsetZ = 80;
        } else if (followTarget === "helicopter") {
          offsetX = 0;
          offsetY = 60;
          offsetZ = 120;
        } else if (followTarget === "traffic") {
          offsetX = 0;
          offsetY = 15;
          offsetZ = 45;
        }

        const targetCamX = fx + offsetX;
        const targetCamY = fy + offsetY;
        const targetCamZ = fz + offsetZ;

        state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetCamX, lambda, dt);
        state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetCamY, lambda, dt);
        state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetCamZ, lambda, dt);

        controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, fx, lambda, dt);
        controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, fy, lambda, dt);
        controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, fz, lambda, dt);

        controlsRef.current.update();
      }
      else if (selectedEntity && Array.isArray((selectedEntity as unknown as { position?: number[] }).position) && controlsRef.current) {
        const [ex, ey, ez] = (selectedEntity as unknown as { position: number[] }).position;
        const eHeight = (selectedEntity as unknown as { scale?: number[] }).scale ? (selectedEntity as unknown as { scale: number[] }).scale[1] : 5.0;
        
        const targetCamX = ex + 40;
        const targetCamY = ey + eHeight / 2 + 35;
        const targetCamZ = ez + 55;

        state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetCamX, lambda, dt);
        state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetCamY, lambda, dt);
        state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetCamZ, lambda, dt);

        controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, ex, lambda, dt);
        controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, ey, lambda, dt);
        controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, ez, lambda, dt);

        controlsRef.current.update();
      }
      else if (controlsRef.current) {
        const targetConfig = PRESETS[cameraPreset];
        
        state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetConfig.pos[0], lambda, dt);
        state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetConfig.pos[1], lambda, dt);
        state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetConfig.pos[2], lambda, dt);
        
        controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, targetConfig.target[0], lambda, dt);
        controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, targetConfig.target[1], lambda, dt);
        controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, targetConfig.target[2], lambda, dt);
        
        controlsRef.current.update();
      }

      checkBuildingCollision(state.camera.position, 2.0);
      if (state.camera.position.y < 8.0) {
        state.camera.position.y = 8.0;
      }
    }
  });

  return (
    <>
      <OrbitControls 
        ref={controlsRef}
        makeDefault 
        minDistance={15} 
        maxDistance={600}
        maxPolarAngle={Math.PI / 2 - 0.08}
        enableDamping
        dampingFactor={0.06}
        enabled={cameraMode !== "free" && cameraMode !== "copter" && !introActive}
      />

      {/* Render 3D Quadcopter Drone in Speeder Drone Mode */}
      {cameraMode === "free" && (
        <group ref={droneGroupRef}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.4, 2.0]} />
            <meshStandardMaterial color="#0b0f19" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0, -1.05]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#0ea5e9" />
          </mesh>
          
          <mesh position={[0.9, 0.1, 0.9]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <boxGeometry args={[0.2, 0.15, 1.4]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[-0.9, 0.1, 0.9]} rotation={[0, -Math.PI / 4, 0]} castShadow>
            <boxGeometry args={[0.2, 0.15, 1.4]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[0.9, 0.1, -0.9]} rotation={[0, -Math.PI / 4, 0]} castShadow>
            <boxGeometry args={[0.2, 0.15, 1.4]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh position={[-0.9, 0.1, -0.9]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <boxGeometry args={[0.2, 0.15, 1.4]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>

          <group position={[1.4, 0.22, 1.4]} ref={prop1Ref}>
            <mesh castShadow><cylinderGeometry args={[0.1, 0.1, 0.18, 6]} /><meshStandardMaterial color="#000" /></mesh>
            <mesh position={[0, 0.08, 0]}><boxGeometry args={[1.8, 0.02, 0.12]} /><meshStandardMaterial color="#64748b" transparent opacity={0.7} /></mesh>
          </group>
          <group position={[-1.4, 0.22, 1.4]} ref={prop2Ref}>
            <mesh castShadow><cylinderGeometry args={[0.1, 0.1, 0.18, 6]} /><meshStandardMaterial color="#000" /></mesh>
            <mesh position={[0, 0.08, 0]}><boxGeometry args={[1.8, 0.02, 0.12]} /><meshStandardMaterial color="#64748b" transparent opacity={0.7} /></mesh>
          </group>
          <group position={[1.4, 0.22, -1.4]} ref={prop3Ref}>
            <mesh castShadow><cylinderGeometry args={[0.1, 0.1, 0.18, 6]} /><meshStandardMaterial color="#000" /></mesh>
            <mesh position={[0, 0.08, 0]}><boxGeometry args={[1.8, 0.02, 0.12]} /><meshStandardMaterial color="#64748b" transparent opacity={0.7} /></mesh>
          </group>
          <group position={[-1.4, 0.22, -1.4]} ref={prop4Ref}>
            <mesh castShadow><cylinderGeometry args={[0.1, 0.1, 0.18, 6]} /><meshStandardMaterial color="#000" /></mesh>
            <mesh position={[0, 0.08, 0]}><boxGeometry args={[1.8, 0.02, 0.12]} /><meshStandardMaterial color="#64748b" transparent opacity={0.7} /></mesh>
          </group>

        </group>      )}

      {/* Render Piloted 3D Helicopter in Heli Pilot Mode */}
      {cameraMode === "copter" && (
        <group ref={heliGroupRef}>
          <group rotation={[0, Math.PI, 0]}>
            {/* Main Fuselage Cockpit (Steel grey body) */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[3, 2.5, 6]} />
              <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.75} />
            </mesh>
            
            {/* Front Windshield Pane */}
            <mesh position={[0, 0.4, 3.01]}>
              <boxGeometry args={[2.5, 1.2, 0.1]} />
              <meshStandardMaterial color="#0ea5e9" opacity={0.65} transparent roughness={0.1} />
            </mesh>

            {/* Tail Boom Assembly */}
            <mesh position={[0, 0.6, -4.5]}>
              <boxGeometry args={[0.8, 0.8, 4.5]} />
              <meshStandardMaterial color="#334155" roughness={0.4} />
            </mesh>

            {/* Vertical Tail Stabilizer */}
            <mesh position={[0, 1.8, -6.5]}>
              <boxGeometry args={[0.3, 2, 1.2]} />
              <meshStandardMaterial color="#334155" />
            </mesh>

            {/* Skids Landing Gear Left */}
            <mesh position={[-1.2, -1.8, 0]} castShadow>
              <boxGeometry args={[0.2, 0.2, 5.5]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} />
            </mesh>
            <mesh position={[-1.2, -1.5, 1]} castShadow>
              <boxGeometry args={[0.2, 0.6, 0.2]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[-1.2, -1.5, -1]} castShadow>
              <boxGeometry args={[0.2, 0.6, 0.2]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>

            {/* Skids Landing Gear Right */}
            <mesh position={[1.2, -1.8, 0]} castShadow>
              <boxGeometry args={[0.2, 0.2, 5.5]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} />
            </mesh>
            <mesh position={[1.2, -1.5, 1]} castShadow>
              <boxGeometry args={[0.2, 0.6, 0.2]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[1.2, -1.5, -1]} castShadow>
              <boxGeometry args={[0.2, 0.6, 0.2]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>

            {/* Rotor Shaft */}
            <mesh position={[0, 1.6, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>

            {/* Main Rotors */}
            <group ref={heliMainRotorRef} position={[0, 2.0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[14, 0.05, 0.6]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
                <boxGeometry args={[14, 0.05, 0.6]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            </group>

            {/* Tail Rotor */}
            <group ref={heliTailRotorRef} position={[0.45, 2.2, -6.7]}>
              <mesh castShadow>
                <boxGeometry args={[0.1, 3.0, 0.25]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            </group>

            {/* Underbody searchlight beacon */}
            <spotLight 
              color="#ffffff"
              intensity={8}
              angle={Math.PI / 7}
              penumbra={0.3}
              distance={200}
              position={[0, -1.3, 1]}
              castShadow
            />
          </group>
        </group>
      )}
    </>
  );
}
