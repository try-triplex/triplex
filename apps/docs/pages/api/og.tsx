/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

async function fetchAssets() {
  const imageSrc = fetch(
    new URL("../../public/ui/vsce-og.png", import.meta.url),
  ).then((res) => res.arrayBuffer());
  const logoSvg = fetch(
    new URL("../../public/logos/logo-icon.svg", import.meta.url),
  )
    .then((res) => res.text())
    .then((svg) => svg.replace("#fff", "#000"))
    .then((img) => `data:image/svg+xml;charset=utf-8,${encodeURI(img)}`);
  const workmark = fetch(
    new URL("../../public/logos/logo-horizontal.svg", import.meta.url),
  )
    .then((res) => res.text())
    .then((img) => `data:image/svg+xml;charset=utf-8,${encodeURI(img)}`);
  const font = fetch(
    new URL("../../public/font/suse-medium.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return Promise.all([imageSrc, logoSvg, workmark, font]);
}

function parseTitle(paramTitle: string | null) {
  const title = paramTitle || "Triplex IDE";
  const slicedTitle = title.slice(0, 30);

  if (title !== slicedTitle) {
    return slicedTitle + "...";
  }

  return slicedTitle;
}

export default async function (request: Request) {
  const [imageSrc, logoSvg, workmark, font] = await fetchAssets();
  const { searchParams } = new URL(request.url);
  const title = parseTitle(searchParams.get("title"));
  const borderColor = "#a3a3a3";
  const textColor = "#000";
  const surfaceColor = "#fff";

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          backgroundColor: surfaceColor,
          backgroundImage: `linear-gradient(to right, ${borderColor} 2px, transparent 1px), linear-gradient(to bottom, ${borderColor} 2px, transparent 1px)`,
          backgroundSize: "233px 233px",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: "black",
            borderRadius: "3333px",
            display: "flex",
            height: "4.5rem",
            left: "2rem",
            padding: "0.85rem 2rem 0.75rem",
            position: "absolute",
            top: "2rem",
          }}
        >
          <img src={workmark} style={{ height: "100%" }} />
        </div>
        <img src={logoSvg} style={{ height: "11rem", marginTop: "4rem" }} />
        <span
          style={{
            alignSelf: "center",
            color: textColor,
            fontFamily: "Suse",
            fontSize: "6.5rem",
            lineHeight: 1,
            marginBottom: "auto",
            marginTop: "auto",
            paddingLeft: "12rem",
            paddingRight: "12rem",
            textAlign: "center",
          }}
        >
          {title}
        </span>
        <div
          style={{
            display: "flex",
            height: "28%",
            marginTop: "2rem",
            paddingLeft: "4rem",
            paddingRight: "4rem",
          }}
        >
          <img
            src={imageSrc as unknown as string}
            style={{ objectFit: "cover" }}
          />
        </div>

        <div
          style={{
            border: `2px solid ${borderColor}`,
            bottom: 0,
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
          }}
        />
      </div>
    ),
    {
      fonts: [
        {
          data: font,
          name: "Suse",
          style: "normal",
        },
      ],
      height: 720,
      width: 1280,
    },
  );
}
