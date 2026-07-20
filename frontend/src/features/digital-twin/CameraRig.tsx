import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useDigitalTwinStore, CameraPreset } from "./useDigitalTwinStore";
import { useRef } from "react";

const PRESETS: Record<CameraPreset, { pos: [number, number, number], target: [number, number, number] }> = {
  "overview": { pos: [0, 250, 300], target: [0, 0, 0] },
  "intersection": { pos: [20, 60, 80], target: [50, 0, 50] },
  "incident": { pos: [-80, 40, -40], target: [-100, 0, -60] },
  "ai-focus": { pos: [100, 150, -100], target: [0, 0, 0] },
  "traffic": { pos: [0, 20, 150], target: [0, 0, 0] },
};

const vPos = new THREE.Vector3();
const vTarget = new THREE.Vector3();

export function CameraRig() {
  const preset = useDigitalTwinStore((state) => state.cameraPreset);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;
    
    const targetConfig = PRESETS[preset];
    
    // Smoothly interpolate camera position
    vPos.set(...targetConfig.pos);
    state.camera.position.lerp(vPos, 2 * delta);
    
    // Smoothly interpolate orbit controls target
    vTarget.set(...targetConfig.target);
    controlsRef.current.target.lerp(vTarget, 2 * delta);
    
    controlsRef.current.update();
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      makeDefault 
      minDistance={10} 
      maxDistance={600} 
      maxPolarAngle={Math.PI / 2 - 0.05} // Don't go below ground
      enableDamping
    />
  );
}
