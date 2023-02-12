import { useLazySubscription } from "../stores/ws-client";
import { FocusedObject, useSceneStore } from "../stores/scene";
import { ErrorBoundary } from "react-error-boundary";
import { getEditorLink } from "../util/ide";
import { Suspense, useDeferredValue } from "react";
import { useEditorContext } from "../stores/editor-context";

interface Prop {
  column: number;
  line: number;
  name: string;
  value: unknown;
  type: "static" | "unhandled";
}

function Prop({ value, width = "100%" }: { value: unknown; width?: string }) {
  if (Array.isArray(value)) {
    return (
      <div className="flex gap-0.5">
        {value.map((val, index) => (
          <Prop
            key={val + index}
            width={`${100 / value.length}%`}
            value={val}
          />
        ))}
      </div>
    );
  }

  const isNumber = Number.isFinite(Number(value));

  let normalizedValue: string | number;

  if (isNumber) {
    const num = Number(value);
    const isDecimal = Math.abs(num) - Math.floor(Math.abs(num)) > 0;
    normalizedValue = isDecimal ? num.toFixed(2) : num;
  } else {
    normalizedValue = `{${value}}`;
  }

  return (
    <input
      style={{ width }}
      readOnly
      className="rounded border-2 border-neutral-700 bg-transparent py-0.5 px-1 text-neutral-400 outline-none"
      value={normalizedValue}
    />
  );
}

function SelectedSceneObject({ focused }: { focused: FocusedObject }) {
  const { path } = useEditorContext();
  const data = useLazySubscription<{
    name: string;
    props: Prop[];
    propTypes: Record<
      string,
      {
        name: string;
        required: boolean;
        type: unknown;
      }
    >;
  }>(
    `/scene/${encodeURIComponent(path)}/object/${focused.line}/${
      focused.column
    }`
  );

  return (
    <div>
      <h2 className="text-xl font-medium">
        <div className="overflow-hidden text-ellipsis">{focused.name}</div>
      </h2>

      <div className="mb-2.5 -mt-0.5">
        <a
          className="text-xs text-neutral-400"
          href={getEditorLink({
            path: path,
            column: focused.column + 1,
            line: focused.line + 1,
            editor: "vscode",
          })}
        >
          View usage
        </a>

        {focused.path && (
          <>
            <span className="mx-1.5 text-xs text-neutral-400">•</span>

            <a
              className="text-xs text-neutral-400"
              href={getEditorLink({
                path: focused.path,
                column: 1,
                line: 1,
                editor: "vscode",
              })}
            >
              View source
            </a>
          </>
        )}
      </div>

      <div className="-mx-4 mb-3 h-0.5 bg-neutral-700" />

      {data.props.map((prop) => (
        <div className="mb-2" key={`${prop.column}${prop.line}`}>
          <div>
            <a
              className="text-sm text-neutral-400"
              href={getEditorLink({
                path,
                // ts-morph/tsc lines start from zero - offset them.
                column: prop.column + 2,
                line: prop.line + 1,
                editor: "vscode",
              })}
            >
              {prop.name}
            </a>
          </div>

          <Prop value={prop.value} />
        </div>
      ))}
    </div>
  );
}

export function ContextPanel() {
  const focused = useSceneStore((store) => store.focused);
  const deferredFocused = useDeferredValue(focused);

  if (deferredFocused) {
    return (
      <div className="absolute top-4 right-4 bottom-4 flex w-60 flex-col rounded-lg bg-neutral-800/90 shadow-2xl shadow-black/50">
        <div className="p-4 text-neutral-300">
          <ErrorBoundary
            resetKeys={[deferredFocused]}
            fallbackRender={() => <div>Error!</div>}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <SelectedSceneObject focused={deferredFocused} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  return null;
}