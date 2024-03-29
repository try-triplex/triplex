/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useRef } from "react";
import { type Group, type Vector3Tuple } from "three";
import { Component, Entity, useCurrentEntity } from "../ecs/store";

interface PointerProps {
  onClick?: (cells: Vector3Tuple) => void;
}

export function PointerEntity({ onClick: _ }: PointerProps) {
  const group = useRef<Group>(null);
  const parent = useCurrentEntity();

  return (
    <Entity>
      <Component data={parent} name="parent" />
      <Component data={true} name="pointer" />
      <Component name="sceneObject">
        <group ref={group} />
      </Component>
    </Entity>
  );
}
