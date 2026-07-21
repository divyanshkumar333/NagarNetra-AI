"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Scene } from "./Scene";
import { CameraRig } from "./CameraRig";
import { AIOverlay } from "./AIOverlay";
import { ControlPanel } from "./ControlPanel";
import { InspectorPanel } from "./InspectorPanel";
import { LiveFeedOverlay } from "./LiveFeedOverlay";
import { useDigitalTwinStore } from "./useDigitalTwinStore";

import { MiniMap } from "./MiniMap";

import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { AILogTerminal } from "./AILogTerminal";

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 font-mono text-primary tracking-widest uppercase">Initializing Digital Twin...</p>
    </div>
  );
}

function IntroOverlay() {
  const introActive = useDigitalTwinStore((state) => state.introActive);
  if (!introActive) return null;

  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
      <div className="bg-background/80 backdrop-blur-md border border-primary/20 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-mono text-primary tracking-widest uppercase">Cinematic urban scan in progress...</span>
      </div>
      <span className="text-[10px] text-muted-foreground font-mono mt-2 uppercase tracking-wider">Click or drag anywhere to interact</span>
    </div>
  );
}

export function DigitalTwinContainer() {
  const theme = useDigitalTwinStore((state) => state.theme);

  return (
    <div className="relative w-full h-[calc(100vh-65px)] -mt-6 -mx-6 bg-background overflow-hidden">
      <ControlPanel />
      <InspectorPanel />
      <LiveFeedOverlay />
      <MiniMap />
      <AILogTerminal />
      <IntroOverlay />
      
      <Suspense fallback={<LoadingFallback />}>
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
          <color attach="background" args={['#020617']} />
          <CameraRig />
          <Scene />
          <AIOverlay />
          {theme === "cyberpunk" && (
            <EffectComposer>
              <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
            </EffectComposer>
          )}
        </Canvas>
      </Suspense>
    </div>
  );
}
