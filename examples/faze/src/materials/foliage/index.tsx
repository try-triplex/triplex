/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, FrontSide, MeshStandardMaterial } from "three";
import CustomShaderMaterial from "three-custom-shader-material";
import vert from "./vertex.glsl";

export function FoliageMaterial() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null!);
  const alphaMap = useTexture("/textures/shaders/foliage_alpha3.png");

  useFrame((_, delta) => {
    ref.current.uniforms.u_windTime.value +=
      ref.current.uniforms.u_windSpeed.value * delta;
  });

  const uniforms = useMemo(
    () => ({
      u_effectBlend: { value: 1.0 },
      u_inflate: { value: 0.0 },
      u_scale: { value: 1.0 },
      u_windSpeed: { value: 2.0 },
      u_windTime: { value: 0.0 },
    }),
    [],
  );

  return (
    <CustomShaderMaterial
      alphaMap={alphaMap}
      alphaTest={0.5}
      baseMaterial={MeshStandardMaterial}
      color={new Color("#3f6d21").convertLinearToSRGB()}
      ref={ref}
      shadowSide={FrontSide}
      uniforms={uniforms}
      vertexShader={vert}
    />
  );
}
