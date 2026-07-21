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



      <CityRoads edges={edges} />
      <CityEnvironment trees={trees} parks={parks} />
      <CityBuildings buildings={buildings} />
      <HelicopterSystem />
    </group>
  );
}
