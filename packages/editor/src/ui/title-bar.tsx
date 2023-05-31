import { useLazySubscription } from "@triplex/ws-client";
import { useEffect } from "react";
import { useEditor } from "../stores/editor";
import { EditorMenu } from "./editor-menu";

export function TitleBar() {
  const { path } = useEditor();
  const { name } = useLazySubscription<{ name: string }>("/folder");
  const filename = path.replaceAll("\\", "/").split("/").at(-1);
  const windowTitle = filename ? filename + " — " + name : name;

  useEffect(() => {
    if (windowTitle) {
      window.document.title = windowTitle;
    }
  }, [windowTitle]);

  return (
    <div className="z-50 col-span-full row-start-1 grid h-[33px] select-none grid-cols-3 items-center border-b border-neutral-800 bg-neutral-900 [-webkit-app-region:drag]">
      <div>
        <EditorMenu />
      </div>
      <span className="place-self-center text-sm text-neutral-300">
        {windowTitle}
      </span>
      <div />
    </div>
  );
}
