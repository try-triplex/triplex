/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useThree } from "@react-three/fiber";
import { send } from "@triplex/bridge/client";
import { Spherical, Vector3, type Object3D } from "three";
import { GizmoHelper, type CameraControls } from "triplex-drei";
import { editorLayer } from "../../util/layers";
import { buildSceneSphere } from "../../util/three";
import { AxisHelper } from "./axis-helper";
import { useCamera } from "./context";

const tweenCamera = (
  controls: CameraControls,
  scene: Object3D,
  position: Vector3,
) => {
  const sphere = buildSceneSphere(scene);
  if (sphere.isEmpty()) {
    return;
  }

  const point = new Spherical().setFromVector3(
    new Vector3(position.x, position.y, position.z),
  );
  controls.rotateTo(point.theta, point.phi, true);
  controls.fitToSphere(sphere, true);
};

export function CameraAxisHelper() {
  const { controls, isTriplexCamera } = useCamera();
  const scene = useThree((store) => store.scene);

  if (!isTriplexCamera) {
    return null;
  }

  return (
    <GizmoHelper
      alignment="bottom-center"
      layers={editorLayer}
      margin={[60, 60]}
      renderPriority={2}
    >
      <AxisHelper
        onClick={(e) => {
          if (!controls) {
            return;
          }

          if (
            e.eventObject.position.x === 0 &&
            e.eventObject.position.y === 0 &&
            e.eventObject.position.z === 0
          ) {
            tweenCamera(controls, scene, e.face!.normal);
          } else {
            tweenCamera(controls, scene, e.eventObject.position);
          }

          send("track", { actionId: "controls_axishelper" });
        }}
        scale={33}
      />
    </GizmoHelper>
  );
}
