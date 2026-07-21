import { Environment, Sky, Stars, Clouds, Cloud } from "@react-three/drei";
import * as THREE from "three";
import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { ProceduralCity } from "./ProceduralCity";
import { TrafficSystem } from "./TrafficSystem";
import { TrafficLights } from "./TrafficLights";
import { PedestrianSystem } from "./PedestrianSystem";
import { AIDrone } from "./AIDrone";

export function Scene() {
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const weather = useDigitalTwinStore((state) => state.weather);

  const isNight = timeOfDay === "night";
  const isSunset = timeOfDay === "sunset";

  const ambientIntensity = isNight ? 0.35 : isSunset ? 0.75 : 1.1;
  const directionalIntensity = isNight ? 0.45 : isSunset ? 1.4 : 2.2;
  const sunPosition: [number, number, number] = isNight ? [-80, 100, -80] : isSunset ? [120, 12, 120] : [70, 140, 70];

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={isNight ? "#0b1120" : isSunset ? "#ffbe98" : "#f1f5f9"} />
      <directionalLight 
        position={sunPosition} 
        intensity={directionalIntensity} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        color={isSunset ? "#ff7b00" : isNight ? "#0284c7" : "#ffffff"}
      />

      {isNight && (
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      )}
      
      {!isNight && (
        <Sky 
          distance={450000} 
          sunPosition={sunPosition} 
          inclination={isSunset ? 0.49 : 0.6} 
          azimuth={0.25} 
        />
      )}

      {weather === "rain" && (
        <fog attach="fog" args={[isNight ? "#0f172a" : "#cbd5e1", 50, 400]} />
      )}
      {weather === "fog" && (
        <fog attach="fog" args={[isNight ? "#0f172a" : "#94a3b8", 10, 200]} />
      )}
      {weather === "clear" && (
        <fog attach="fog" args={[isNight ? "#020617" : "#e0f2fe", 100, 600]} />
      )}

      {(weather === "rain" || weather === "fog") && (
        <Clouds material={THREE.MeshBasicMaterial}>
          <Cloud segments={20} bounds={[100, 10, 100]} volume={50} color={isNight ? "#1e293b" : "#94a3b8"} opacity={0.5} position={[0, 80, 0]} />
        </Clouds>
      )}

      <Environment preset={isNight ? "night" : isSunset ? "sunset" : "city"} />
      
      <group position={[0, -0.5, 0]}>
        <ProceduralCity />
        <TrafficSystem />
        <PedestrianSystem />
        <AIDrone />
        <TrafficLights />
      </group>
    </>
  );
}
