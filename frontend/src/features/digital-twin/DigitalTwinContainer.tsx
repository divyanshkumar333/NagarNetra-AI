"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Scene } from "./Scene";
import { CameraRig } from "./CameraRig";
import { AIOverlay } from "./AIOverlay";
import { ControlPanel } from "./ControlPanel";
import { InspectorPanel } from "./InspectorPanel";

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 font-mono text-primary tracking-widest uppercase">Initializing Digital Twin...</p>
    </div>
  );
}

export function DigitalTwinContainer() {
  return (
    <div className="relative w-full h-[calc(100vh-65px)] -mt-6 -mx-6 bg-background overflow-hidden">
      <ControlPanel />
      <InspectorPanel />
      
      <Suspense fallback={<LoadingFallback />}>
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
          <color attach="background" args={['#020617']} />
          <CameraRig />
          <Scene />
          <AIOverlay />
        </Canvas>
      </Suspense>
    </div>
  );
}
