/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Gltf, PerspectiveCamera } from "@react-three/drei";
import { Container, Portal, Root, Text } from "@react-three/uikit";
import { MathUtils, MeshStandardMaterial, type Vector3Tuple } from "three";
import { Circle, Ring, SemiCircle } from "./shapes";

export function SplashScene() {
  return (
    <>
      <color args={["white"]} attach="background" />
      <PerspectiveCamera
        makeDefault
        manual
        position={[0, 0, 5]}
      />
      <Circle color="#d63f84" position={[1.4, 1.4, 0]} size={1.6} />
      <Circle color="#5e4a9b" position={[-1.3, 1.4, 0]} size={0.3} />
      <Ring />
      <SemiCircle
        color="#d63f84"
        position={[-0.8, -0.8, 0]}
        rotation={[-0.2, 0.1, 2.6]}
        size={0.7}
      />
      <SemiCircle
        color="#5e4a9b"
        position={[-0.3, -0.1, 0]}
        rotation={[MathUtils.degToRad(-2), 0, MathUtils.degToRad(180)]}
        size={0.5}
      />
      <pointLight intensity={50} position={[3.76, 2.92, 3.56]} />
      <pointLight intensity={50} position={[-3.88, -0.7, 3.24]} />
      <spotLight intensity={30} position={[-1, 1, 3]} />
      <ambientLight intensity={4} />
    </>
  );
}

export function LoginScreen({
  position,
  rotation,
}: {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
}) {
  return (
    <group position={position} rotation={rotation}>
      <Root flexDirection="column">
        <Container
          alignItems="flex-start"
          backgroundColor="white"
          borderRadius={20}
          castShadow
          flexDirection="column"
          height={210}
          paddingX={10}
          paddingY={20}
          receiveShadow
          width={100}
        >
          <Portal
            borderTopRadius={20}
            dpr={20}
            height={121}
            marginTop={-20}
            marginX={-10}
            transformTranslateZ={0.1}
            width={100}
          >
            <SplashScene />
          </Portal>

          <Container flexDirection="column" gap={8}>
            <Text
              color="#5e4a9b"
              fontSize={8}
              fontWeight="semi-bold"
              panelMaterialClass={MeshStandardMaterial}
              transformTranslateZ={3}
              width={60}
            >
              Welcome To Talsho
            </Text>
            <Text
              color="#5e4a9b"
              fontSize={4}
              fontWeight="medium"
              panelMaterialClass={MeshStandardMaterial}
              transformTranslateZ={3}
            >
              This is the place for you to showcase your talents & win exciting
              rewards
            </Text>
            <Container gap={1.5} transformTranslateZ={3}>
              <Container
                backgroundColor="#d63f84"
                borderRadius={9999}
                flexDirection="column"
                paddingX={3}
                paddingY={0.75}
              />
              <Container
                backgroundColor="#d63f84"
                borderRadius={9999}
                flexDirection="column"
                paddingX={0.75}
                paddingY={0.75}
              />
              <Container
                backgroundColor="#d63f84"
                borderRadius={9999}
                flexDirection="column"
                paddingX={0.75}
                paddingY={0.75}
              />
            </Container>
            <Container
              active={{ backgroundOpacity: 0.8 }}
              alignSelf="flex-start"
              backgroundColor="#d63f84"
              borderRadius={9999}
              castShadow
              flexDirection="column"
              gap={6}
              hover={{ backgroundOpacity: 0.9 }}
              paddingX={11}
              paddingY={5}
              panelMaterialClass={MeshStandardMaterial}
              transformTranslateZ={3}
            >
              <Text color="#fff" fontSize={4} fontWeight="bold">
                Get started
              </Text>
            </Container>
          </Container>
        </Container>
      </Root>
    </group>
  );
}

export function UIKitExample() {
  return (
    <>
      <Gltf
        position={[1.02, 1.54, -1.72]}
        receiveShadow
        rotation={[0, -0.296_705_972_839_036_05, 0]}
        scale={[0.48, 0.48, 0.48]}
        src="/assets/pmndrs.glb"
      />
      <LoginScreen />
      <PerspectiveCamera
        makeDefault
        position={[0, 0.48, 2.66]}
        rotation={[-0.001_067_835_399_251_84, 0, 0]}
      />
      <ambientLight intensity={3} />
      <pointLight castShadow intensity={30} position={[2.92, 0.82, -2.74]} />
      <pointLight castShadow intensity={30} position={[-1.96, 0.82, -2.26]} />
      <pointLight castShadow intensity={30} position={[-1.56, 0.62, 1.4]} />
      <Circle color="#d63f84" position={[0.84, 0, -0.14]} size={0.07} />
      <Circle color="#d63f84" position={[1.1, 0.22, -0.1]} size={0.05} />
      <Circle color="#d63f84" position={[-1, -0.22, -0.28]} size={0.08} />
      <Circle color="#d63f84" position={[-1.1, -0.08, -0.32]} size={0.05} />
      <Circle color="#d63f84" position={[0, -2.08, -2.2]} size={1.5} />
      <Circle color="#d63f84" position={[0, -2.08, -29.68]} size={25} />
    </>
  );
}