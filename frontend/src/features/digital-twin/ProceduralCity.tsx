import { useDigitalTwinStore } from "./useDigitalTwinStore";
import { useCityEngine } from "./useCityEngine";
import { CityBuildings } from "./CityBuildings";
import { CityRoads } from "./CityRoads";
import { CityEnvironment } from "./CityEnvironment";
import { HelicopterSystem } from "./HelicopterSystem";

export function ProceduralCity() {
  const { buildings, edges, trees, parks } = useCityEngine();
  const timeOfDay = useDigitalTwinStore((state) => state.timeOfDay);
  const isNight = timeOfDay === "night";

  return (
    <group>
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color={isNight ? "#020617" : "#cbd5e1"} roughness={1} />
      </mesh>

      {/* Glowing Diagonal City River Canal */}
      <group rotation={[-Math.PI / 2, 0, -Math.PI / 4]} position={[0, -0.07, 0]}>
        {/* River water body - Premium Dark Obsidian Water */}
        <mesh receiveShadow>
          <planeGeometry args={[160, 3000]} />
          <meshStandardMaterial 
            color={isNight ? "#010e1b" : "#0f2d3a"} 
            roughness={0.08} 
            metalness={0.95}
            emissive={isNight ? "#000810" : "#011624"}
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Concrete retaining wall Left (rises 3 units above river surface) */}
        <mesh position={[-80, 0, 2.5]} castShadow receiveShadow>
          <boxGeometry args={[4, 3000, 3]} />
          <meshStandardMaterial color={isNight ? "#111827" : "#475569"} roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Concrete retaining wall Right (rises 3 units above river surface) */}
        <mesh position={[80, 0, 2.5]} castShadow receiveShadow>
          <boxGeometry args={[4, 3000, 3]} />
          <meshStandardMaterial color={isNight ? "#111827" : "#475569"} roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Neon warning strip lights along the channel edges */}
        <mesh position={[-77.8, 0, 0.05]}>
          <planeGeometry args={[0.6, 3000]} />
          <meshBasicMaterial color="#0ea5e9" toneMapped={false} transparent opacity={0.6} />
        </mesh>
        <mesh position={[77.8, 0, 0.05]}>
          <planeGeometry args={[0.6, 3000]} />
          <meshBasicMaterial color="#0ea5e9" toneMapped={false} transparent opacity={0.6} />
        </mesh>
      </group>

      <CityRoads edges={edges} />
      <CityEnvironment trees={trees} parks={parks} />
      <CityBuildings buildings={buildings} />
      <HelicopterSystem />
    </group>
  );
}
