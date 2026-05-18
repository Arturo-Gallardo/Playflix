"use client";

import type { PointerEvent, WheelEvent } from "react";
import { useRef, useState } from "react";
import { useCanvasCamera } from "../hooks/useCanvasCamera";
import type { PlaylistCover } from "../data/sample-covers";
import { AppToolbar } from "./AppToolbar";
import { SongGrid } from "./SongGrid";

type AppCanvasProps = {
  covers: PlaylistCover[];
};

type DragState = {
  pointerId: number;
  lastX: number;
  lastY: number;
};

// toolbar controls and cover links should not start a pan.
function isInteractiveElement(target: EventTarget) {
  return (
    target instanceof Element && Boolean(target.closest("a, button, input"))
  );
}

export function AppCanvas({ covers }: AppCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const { camera, panBy, zoomAtPoint } = useCanvasCamera();

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (isInteractiveElement(event.target)) {
      return;
    }

    // keep receiving pointer moves even if the cursor moves fast.
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
    });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    // only the pointer that started the drag can move the camera.
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    panBy({
      x: event.clientX - dragState.lastX,
      y: event.clientY - dragState.lastY,
    });

    setDragState({
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
    });
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragState?.pointerId === event.pointerId) {
      setDragState(null);
    }
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();

    const rect = viewportRef.current?.getBoundingClientRect();
    const zoomDirection = event.deltaY > 0 ? -1 : 1;

    // wheel zooms toward the cursor, like a canvas.
    zoomAtPoint(
      {
        x: event.clientX - (rect?.left ?? 0),
        y: event.clientY - (rect?.top ?? 0),
      },
      camera.zoom + zoomDirection * 0.12,
    );
  }

  return (
    <main className="relative h-dvh overflow-hidden bg-[#111111] text-white">
      <AppToolbar />

      <div
        className={`absolute inset-0 touch-none select-none bg-[radial-gradient(circle,_rgba(255,255,255,0.16)_1px,_transparent_1px)] [background-size:20px_20px] ${
          dragState ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        ref={viewportRef}
      >
        <div
          className="origin-top-left will-change-transform"
          style={{
            // one transform is the camera: move first, then scale the world.
            transform: `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.zoom})`,
          }}
        >
          <SongGrid covers={covers} />
        </div>
      </div>
    </main>
  );
}
