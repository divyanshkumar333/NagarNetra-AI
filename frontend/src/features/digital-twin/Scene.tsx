import { Environment, Sky, Stars, Clouds, Cloud } from "@react-three/drei";
import * as THREE from "three";
import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { ProceduralCity } from "./ProceduralCity";
import { TrafficSystem } from "./TrafficSystem";
import { TrafficLights } from "./TrafficLights";

export function Scene() {
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const weather = useDigitalTwinStore((state) => state.weather);

  const isNight = timeOfDay === "night";
  const isSunset = timeOfDay === "sunset";

  const ambientIntensity = isNight ? 0.2 : isSunset ? 0.6 : 1.0;
  const directionalIntensity = isNight ? 0.5 : isSunset ? 1.2 : 2.0;
  const sunPosition: [number, number, number] = isNight ? [0, -100, 0] : isSunset ? [100, 10, 100] : [50, 100, 50];

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={isSunset ? "#ffedd5" : "#ffffff"} />
      <directionalLight 
        position={sunPosition} 
        intensity={directionalIntensity} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        color={isSunset ? "#fdba74" : isNight ? "#38bdf8" : "#ffffff"}
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
        <TrafficLights />
      </group>
    </>
  );
}
