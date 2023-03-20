import { TransformControls } from "@react-three/drei";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { listen, send } from "@triplex/bridge/client";
import { preloadSubscription, useSubscriptionEffect } from "@triplex/ws-client";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Box3, Object3D, Vector3, Vector3Tuple } from "three";
import { TransformControls as TransformControlsImpl } from "three-stdlib";

export interface EditorNodeData {
  name: string;
  line: number;
  column: number;
  props: Record<string, unknown>;
  sceneObject: Object3D;
  path: string;
  space: "local" | "world";
}

export interface SelectedNode {
  column: number;
  line: number;
  name: string;
  path: string;
  props: Record<string, unknown>;
}

interface Prop {
  column: number;
  line: number;
  name: string;
  value: unknown;
  type: "static" | "unhandled";
}

interface SceneObjectData {
  exportName: string;
  name: string;
  path: string;
  props: Prop[];
  propTypes: Record<
    string,
    {
      name: string;
      required: boolean;
      type: unknown;
    }
  >;
  rotate: boolean;
  scale: boolean;
  translate: boolean;
}

function encodeProps(selected: EditorNodeData): string {
  const props = { ...selected.props };

  for (const key in props) {
    const prop = props[key];
    if (prop && typeof prop === "object" && "$$typeof" in prop) {
      // We remove any jsx elements from props as they can't be serialized.
      delete props[key];
    }
  }

  if ("position" in props) {
    // If position exists we want to make sure we pass in the world position
    // So if any parent groups have their position set when we transition
    // It won't jump around unexpectedly.
    const worldPosition = selected.sceneObject.getWorldPosition(V1).toArray();

    return JSON.stringify({
      ...props,
      position: worldPosition,
    });
  }

  return JSON.stringify(props);
}

const findTransformedSceneObject = (
  sceneObject: Object3D,
  transform: "translate" | "scale" | "rotate"
): Object3D => {
  type ObjectR3F = {
    __r3f: {
      memoizedProps: Record<string, unknown>;
    };
  } & Object3D;

  const propertyName = {
    translate: "position",
    scale: "scale",
    rotate: "rotation",
  }[transform];
  let foundSceneObject: Object3D | undefined = undefined;

  sceneObject.traverse((c: unknown) => {
    const child = c as ObjectR3F;

    // The immediate child can also be a triplex boundary if it is a custom
    // component - if it is skip and continue traversing to find the scene
    // object that we're interested in.
    if (foundSceneObject || child === sceneObject) {
      return;
    }

    // We need to find out if one of the jsx elements between sceneObject
    // and the next triplex boundary has the transform prop applied - if it
    // does we've found the scene object we're interested in!
    // NOTE: This relies on r3f internals meaning this is a vector for breaks.
    if (child && child.__r3f && propertyName in child.__r3f.memoizedProps) {
      foundSceneObject = child;
    }
  });

  return foundSceneObject || sceneObject;
};

function flatten(
  positions: JsxElementPositions[]
): Exclude<JsxElementPositions, "children">[] {
  const result: Exclude<JsxElementPositions, "children">[] = [];

  for (let i = 0; i < positions.length; i++) {
    const item = positions[i];
    if (item.children) {
      result.push(...flatten(item.children));
    }

    result.push(item);
  }

  return result;
}

function isInScene(
  path: string,
  node: EditorNodeData,
  positions: JsxElementPositions[]
): boolean {
  if (path === node.path) {
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      if (
        node.line === position.line &&
        node.column === position.column &&
        node.name === position.name
      ) {
        return true;
      }
    }
  }

  return false;
}

const findEditorData = (
  path: string,
  object: Object3D,
  transform: "translate" | "scale" | "rotate",
  positions: JsxElementPositions[]
): EditorNodeData | null => {
  let parent: Object3D | null = object;
  let data: EditorNodeData | null = null;

  while (parent) {
    if (
      "triplexSceneMeta" in parent.userData &&
      !data &&
      isInScene(path, parent.userData.triplexSceneMeta, positions)
    ) {
      // Keep traversing up the tree to find the top most wrapped scene object.
      data = {
        ...parent.userData.triplexSceneMeta,
        sceneObject: findTransformedSceneObject(parent.children[0], transform),
        space: "world",
      } as EditorNodeData;
    }

    parent = parent.parent;

    if (
      data &&
      parent &&
      (parent.position.lengthSq() > 0 || parent.scale.lengthSq() > 0)
    ) {
      // There is a parent that has set position/scale so this must be local space.
      // This affects the resulting position calculated later on after a transform.
      data.space = "local";
    }
  }

  return data;
};

const findSceneObjectFromSource = (
  path: string,
  scene: Object3D,
  line: number,
  column: number,
  transform: "translate" | "scale" | "rotate",
  positions: JsxElementPositions[]
): EditorNodeData | null => {
  let nodeData: EditorNodeData | null = null;

  scene.traverse((obj) => {
    if ("triplexSceneMeta" in obj.userData) {
      const node: EditorNodeData = obj.userData.triplexSceneMeta;

      if (
        node.path === path &&
        node.column === column &&
        node.line === line &&
        obj.children[0]
      ) {
        // We've found our scene object that _also_ has a direct child in the
        // Three.js scene.
        nodeData = findEditorData(path, obj, transform, positions);
      }
    }
  });

  return nodeData;
};

interface JsxElementPositions {
  column: number;
  line: number;
  name: string;
  children: JsxElementPositions[];
  type: "host" | "custom";
}

const V1 = new Vector3();
const box = new Box3();

export function Selection({
  children,
  onBlur,
  onFocus,
  onJumpTo,
  onNavigate,
  path,
  exportName,
}: {
  children?: ReactNode;
  onBlur: () => void;
  onFocus: (node: { column: number; line: number }) => void;
  onJumpTo: (v: Vector3Tuple, bb: Box3, obj: Object3D) => void;
  onNavigate: (node: {
    path: string;
    exportName: string;
    encodedProps: string;
  }) => void;
  path: string;
  exportName: string;
}) {
  const [selected, setSelected] = useState<EditorNodeData>();
  const [transform, setTransform] = useState<"translate" | "rotate" | "scale">(
    "translate"
  );
  const transformControls = useRef<TransformControlsImpl>(null);
  const dragging = useRef(false);
  const scene = useThree((store) => store.scene);
  const sceneData = useSubscriptionEffect<{
    sceneObjects: JsxElementPositions[];
  }>(
    path && exportName ? `/scene/${encodeURIComponent(path)}/${exportName}` : ""
  );
  const sceneObjects = useMemo(
    () => flatten(sceneData?.sceneObjects || []),
    [sceneData]
  );
  const objectData = useSubscriptionEffect<SceneObjectData | null>(
    selected
      ? `/scene/${encodeURIComponent(path)}/object/${selected.line}/${
          selected.column
        }`
      : ""
  );

  useEffect(() => {
    return listen("trplx:requestNavigateToScene", (sceneObject) => {
      if (!sceneObject && (!selected || !objectData)) {
        return;
      }

      if (sceneObject && sceneObject.path) {
        onNavigate(sceneObject);
        setSelected(undefined);
        onBlur();
      } else if (selected && objectData && objectData.path) {
        onNavigate({
          path: objectData.path,
          exportName: objectData.exportName,
          encodedProps: encodeProps(selected),
        });
        setSelected(undefined);
        onBlur();
      }
    });
  }, [onBlur, onNavigate, selected, objectData]);

  useEffect(() => {
    return listen("trplx:requestBlurSceneObject", () => {
      setSelected(undefined);
      send("trplx:onSceneObjectBlur", undefined);
    });
  }, []);

  useEffect(() => {
    if (!selected) {
      return;
    }

    return listen("trplx:requestJumpToSceneObject", () => {
      box.setFromObject(selected.sceneObject);
      onJumpTo(
        selected.sceneObject.getWorldPosition(V1).toArray(),
        box,
        selected.sceneObject
      );
    });
  }, [onJumpTo, selected]);

  useEffect(() => {
    if (!objectData || !objectData.exportName || !objectData.path) {
      return;
    }

    preloadSubscription(
      `/scene/${encodeURIComponent(objectData.path)}/${objectData.exportName}`
    );
  }, [objectData]);

  useEffect(() => {
    return listen("trplx:requestFocusSceneObject", (data) => {
      const sceneObject = findSceneObjectFromSource(
        data.ownerPath,
        scene,
        data.line,
        data.column,
        transform,
        sceneObjects
      );

      if (sceneObject) {
        setSelected(sceneObject);
      } else {
        setSelected(undefined);
      }

      send("trplx:onSceneObjectFocus", {
        column: data.column,
        line: data.line,
      });
    });
  }, [scene, transform, sceneObjects]);

  const onClick = async (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 1) {
      return;
    }

    if (selected && e.object === selected?.sceneObject) {
      // Ignore this event we're already selected.
      return;
    }

    // TODO: If clicking on a scene object when a selection is already
    // made this will fire A LOT OF TIMES. Need to investigate why.
    const data = findEditorData(path, e.object, transform, sceneObjects);
    if (data) {
      e.stopPropagation();
      setSelected(data);
      onFocus(data);
    }
  };

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (dragging.current) {
          transformControls.current?.reset();
        } else if (selected) {
          setSelected(undefined);
        }

        onBlur();
      }

      if (!selected) {
        return;
      }

      if (e.key === "f") {
        onJumpTo(
          selected.sceneObject.getWorldPosition(V1).toArray(),
          box.setFromObject(selected.sceneObject),
          selected.sceneObject
        );
      }

      if (
        e.key === "F" &&
        e.shiftKey &&
        selected &&
        objectData &&
        objectData.path
      ) {
        // Only navigate if there is a path to navigate to.
        setSelected(undefined);
        onBlur();
        onNavigate({
          path: objectData.path,
          exportName: objectData.exportName,
          encodedProps: encodeProps(selected),
        });
      }

      if (e.key === "r") {
        setTransform("rotate");
        const data = findEditorData(
          path,
          selected.sceneObject,
          "rotate",
          sceneObjects
        );
        if (data) {
          setSelected(data);
        }
      }

      if (e.key === "t") {
        setTransform("translate");
        const data = findEditorData(
          path,
          selected.sceneObject,
          "translate",
          sceneObjects
        );
        if (data) {
          setSelected(data);
        }
      }

      if (e.key === "s" && !e.metaKey && !e.ctrlKey) {
        setTransform("scale");
        const data = findEditorData(
          path,
          selected.sceneObject,
          "scale",
          sceneObjects
        );
        if (data) {
          setSelected(data);
        }
      }
    };

    document.addEventListener("keyup", callback);

    return () => document.removeEventListener("keyup", callback);
  }, [onBlur, onJumpTo, onNavigate, selected, sceneObjects, path, objectData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMouseUp = (e: any) => {
    dragging.current = false;

    if (!e || !selected || !objectData) {
      return;
    }

    if (e.mode === "translate") {
      const position =
        selected.space === "world"
          ? selected.sceneObject.getWorldPosition(V1).toArray()
          : selected.sceneObject.position.toArray();

      send("trplx:onConfirmSceneObjectProp", {
        column: selected.column,
        line: selected.line,
        path,
        propName: "position",
        propValue: position,
      });
    }

    if (e.mode === "rotate") {
      const rotation = selected.sceneObject.rotation.toArray();
      rotation.pop();

      send("trplx:onConfirmSceneObjectProp", {
        column: selected.column,
        line: selected.line,
        path,
        propName: "rotation",
        propValue: rotation,
      });
    }

    if (e.mode === "scale") {
      const scale = selected.sceneObject.scale.toArray();

      send("trplx:onConfirmSceneObjectProp", {
        column: selected.column,
        line: selected.line,
        path,
        propName: "scale",
        propValue: scale,
      });
    }
  };

  useFrame(() => {
    if (selected && selected.sceneObject.parent === null) {
      // If the scene object gets removed from the scene unselect it.
      setSelected(undefined);
    }
  });

  return (
    <group onClick={onClick}>
      {children}
      {selected && (
        <TransformControls
          enabled={!!objectData && objectData[transform]}
          mode={transform}
          object={selected.sceneObject}
          onMouseDown={() => (dragging.current = true)}
          onMouseUp={onMouseUp}
          ref={transformControls}
        />
      )}
    </group>
  );
}
