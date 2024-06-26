/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { PerspectiveCamera } from "@react-three/drei";
import Box from "./geometry/box";

/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

export function Camera() {
  return (
    <>
      <PerspectiveCamera position={[0, 0.72, 11.34]} />
      <Box position={[-0.08, 18.46, 64.84]} scale={0.1} />
    </>
  );
}
