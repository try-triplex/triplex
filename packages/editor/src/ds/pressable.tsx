/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  forwardRef,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
} from "react";
import { cn } from "./cn";

export const Pressable = forwardRef<
  HTMLDivElement,
  {
    onPress?: () => void;
    children?: React.ReactNode;
    className?: string;
    title?: string;
    style?: React.CSSProperties;
  }
>(({ onPress, children, className, title, style }, ref) => {
  const onKeyDownHandler: KeyboardEventHandler = useCallback(
    (e) => {
      if (e.key === "Enter") {
        onPress?.();
        e.stopPropagation();
      }
    },
    [onPress]
  );

  const onKeyUpHandler: KeyboardEventHandler = useCallback(
    (e) => {
      if (e.key === " ") {
        onPress?.();
        e.stopPropagation();
      }
    },
    [onPress]
  );

  const onClickHandler: MouseEventHandler = useCallback(
    (e) => {
      onPress?.();
      e.stopPropagation();
    },
    [onPress]
  );

  return (
    <div
      ref={ref}
      style={style}
      role="button"
      title={title}
      onClick={onClickHandler}
      onKeyUp={onKeyUpHandler}
      onKeyDown={onKeyDownHandler}
      className={cn([
        "cursor-default outline-1 -outline-offset-1 outline-blue-400 focus-visible:outline",
        className,
      ])}
      tabIndex={0}
    >
      {children}
    </div>
  );
});
