/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { LandingCard } from "./landing-card";

export function LandingFeatures() {
  return (
    <div className="flex flex-col gap-14">
      <h2 className="font-brand text-brand max-w-4xl text-5xl font-medium md:text-6xl lg:text-7xl">
        Powerful features to build it how you see it
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:flex-row">
        <LandingCard />
        <LandingCard />
        <LandingCard />
        <LandingCard />
      </div>

      <div className="bg-surface border-neutral aspect-video border" />
    </div>
  );
}
