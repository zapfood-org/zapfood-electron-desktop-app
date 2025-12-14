"use client";

import { Slider } from "@heroui/react";
import { useState } from "react";
import { Cropper, CropperCropArea, CropperDescription, CropperImage } from "../ui/cropper";

export default function Component() {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex w-full flex-col gap-4">
        <Cropper
          className="h-80"
          image="https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/cropper-07_scsejv.jpg"
          onZoomChange={setZoom}
          zoom={zoom}
        >
          <CropperDescription />
          <CropperImage />
          <CropperCropArea />
        </Cropper>
        <div className="mx-auto flex w-full max-w-80 items-center gap-1">
          <Slider
            value={zoom}
            onChange={(value) => setZoom(Array.isArray(value) ? value[0] : value)}
            maxValue={3}
            minValue={1}
            step={0.1}
          />
        </div>
      </div>

      <p
        aria-live="polite"
        className="mt-2 text-muted-foreground text-xs"
        role="region"
      >
        Cropper with zoom slider ∙{" "}
        <a
          className="underline hover:text-foreground"
          href="https://github.com/origin-space/image-cropper"
          rel="noreferrer"
          target="_blank"
        >
          API
        </a>
      </p>
    </div>
  );
}
