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
  const scrollRef = useRef<number>(0);

  // Keyboard, mouse look, and scroll event listeners for Free Camera
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (useDigitalTwinStore.getState().cameraMode === "free" && e.buttons === 1) {
        const sensitivity = 0.003;
        mouseRef.current.yaw -= e.movementX * sensitivity;
        mouseRef.current.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, mouseRef.current.pitch - e.movementY * sensitivity));
      }
    };
    const handleWheel = (e: WheelEvent) => {
      if (useDigitalTwinStore.getState().cameraMode === "free") {
        scrollRef.current += e.deltaY;
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

  // Skip intro on any user pointer or scroll input
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

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1); // Cap delta to prevent huge jumps on frame drops
    const lambda = 2.5; // Damping rate (higher is faster/tighter response)

    if (introActive) {
      const elapsed = state.clock.getElapsedTime();
      const introDuration = 7.0; // 7 seconds total duration

      if (elapsed >= introDuration) {
        setIntroActive(false);
        return;
      }

      const ratio = elapsed / introDuration;
      // Spiral orbit: start high and rotate around center while descending
      const startRadius = 550;
      const endRadius = 350;
      const currentRadius = startRadius - (startRadius - endRadius) * ratio;
      const angle = ratio * Math.PI * 1.5; // 1.5 full rotations

      const targetX = currentRadius * Math.sin(angle);
      const targetY = 400 - ratio * 180; // Descend from 400 to 220
      const targetZ = currentRadius * Math.cos(angle);

      // Interpolate camera to spiral coordinates
      state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, lambda, dt);
      state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, lambda, dt);
      state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, lambda, dt);

      if (controlsRef.current) {
        // Target slowly centers on downtown
        controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, 0, lambda, dt);
        controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, 40 - ratio * 40, lambda, dt);
        controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, 0, lambda, dt);
        controlsRef.current.update();
      }
      return;
    }

    // 1. WASD + Scroll Free Flight Camera Mode
    if (cameraMode === "free") {
      const keys = keysRef.current;
      const speed = keys["shift"] ? 240 : 80; // Speed boost with Shift key

      const moveDir = new THREE.Vector3();
      // W/S - Forward/Backward
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion);
      if (keys["w"]) moveDir.add(forward);
      if (keys["s"]) moveDir.sub(forward);

      // A/D - Strafe Left/Right
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(state.camera.quaternion);
      if (keys["a"]) moveDir.sub(right);
      if (keys["d"]) moveDir.add(right);

      // Q/E - Vertical elevation
      const up = new THREE.Vector3(0, 1, 0);
      if (keys["e"]) moveDir.add(up);
      if (keys["q"]) moveDir.sub(up);

      // Scroll wheel speed impulse
      let scrollMovement = 0;
      if (scrollRef.current !== 0) {
        scrollMovement = -scrollRef.current * 0.15; // sensitivity adjustment
        scrollRef.current = 0; // reset
      }

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        state.camera.position.addScaledVector(moveDir, speed * dt);
      }
      if (scrollMovement !== 0) {
        state.camera.position.addScaledVector(forward, scrollMovement);
      }

      // Rotate camera rotation Euler angles
      const targetRotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(mouseRef.current.pitch, mouseRef.current.yaw, 0, "YXZ")
      );
      state.camera.quaternion.slerp(targetRotation, 10 * dt);
    } else {
      // 2. Active Follow Target
      if (followTarget !== "none" && followedPosition && controlsRef.current) {
        const [fx, fy, fz] = followedPosition;
        
        let offsetX = -35;
        let offsetY = 50;
        let offsetZ = 60;
        
        if (followTarget === "drone") {
          offsetX = 0;
          offsetY = 35;
          offsetZ = 80;
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
      // 3. Smart Focus on Selected Entity
      else if (selectedEntity && Array.isArray((selectedEntity as any).position) && controlsRef.current) {
        const [ex, ey, ez] = (selectedEntity as any).position;
        
        const targetCamX = ex + 40;
        const targetCamY = ey + 50;
        const targetCamZ = ez + 65;

        state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetCamX, lambda, dt);
        state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetCamY, lambda, dt);
        state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetCamZ, lambda, dt);

        controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, ex, lambda, dt);
        controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, ey, lambda, dt);
        controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, ez, lambda, dt);

        controlsRef.current.update();
      }
      // 4. Default Preset Logic
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
    }

    // 5. Smooth Camera Collision Handling
    const camPos = state.camera.position;
    
    // Ground floor collision threshold (keep camera above road/terrain heights)
    const minHeight = 12.0;
    if (camPos.y < minHeight) {
      camPos.y = minHeight;
    }

    // Building collision checks (prevent clipping through skyscrapers)
    const buildings = cityData.buildings;
    const padding = 6.0; // Distance to push away from walls
    
    for (let i = 0; i < buildings.length; i++) {
      const bld = buildings[i];
      // Since buildings are elevated by 0.4, top height goes up to scale[1] + 0.4
      const bHeight = bld.scale[1] + 0.4;
      const halfW = bld.scale[0] / 2 + padding;
      const halfD = bld.scale[2] / 2 + padding;

      const dx = camPos.x - bld.position[0];
      const dz = camPos.z - bld.position[2];

      if (Math.abs(dx) < halfW && Math.abs(dz) < halfD && camPos.y < bHeight + padding) {
        // Colliding! Push camera out along the shallowest axis
        const overlapX = halfW - Math.abs(dx);
        const overlapZ = halfD - Math.abs(dz);
        const overlapY = (bHeight + padding) - camPos.y;

        if (overlapY < overlapX && overlapY < overlapZ) {
          camPos.y = bHeight + padding;
        } else if (overlapX < overlapZ) {
          camPos.x += Math.sign(dx) * overlapX;
        } else {
          camPos.z += Math.sign(dz) * overlapZ;
        }
      }
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      makeDefault 
      minDistance={15} 
      maxDistance={600} // Expanded max boundary for larger city
      maxPolarAngle={Math.PI / 2 - 0.08} // Restrict camera from going underground/below city plane
      enableDamping
      dampingFactor={0.05} // Smooth inertia
      enabled={cameraMode !== "free" && !introActive}
    />
  );
}
