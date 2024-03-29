import { Gltf } from "@react-three/drei";
import { type Vector3Tuple } from "three";

export function Pumpkin({
  position,
  rotation,
  scale,
  variant = "pumpkin_orange",
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  variant?:
    | "pumpkin_orange"
    | "pumpkin_orange_jackolantern"
    | "pumpkin_orange_small"
    | "pumpkin_yellow"
    | "pumpkin_yellow_jackolantern"
    | "pumpkin_yellow_small";
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Gltf castShadow receiveShadow src={`/assets/pumpkin/${variant}.glb`} />
    </group>
  );
}
