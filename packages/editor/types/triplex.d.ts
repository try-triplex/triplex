/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
declare type WindowState = "active" | "inactive" | "disabled";

declare interface Window {
  triplex: {
    getEnv: () => Promise<{
      config: {
        provider: string;
        sceneUrl: string;
        serverUrl: string;
        wsUrl: string;
      };
    }>;
    handleMenuItemPress: (callback: (id: string) => void) => () => void;
    handleProgressBarChange: (
      callback: (progress: number) => void
    ) => () => void;
    handleWindowStateChange: (
      callback: (state: WindowState) => void
    ) => () => void;
    openLink: (url: string) => void;
    platform: typeof process.platform;
    sendCommand: (id: string) => void;
    setMenu: (menu: import("electron").MenuItemConstructorOptions[]) => void;
    showSaveDialog: (filename: string) => Promise<string | undefined>;
  };
}
