import type { Rect } from "../../lib/canvas/canvas-layout";

type SelectionBoxProps = {
  rect: Rect;
};

export function SelectionBox({ rect }: SelectionBoxProps) {
  return (
    <div
      className="pointer-events-none absolute rounded-md border border-[#1DB954] bg-[#1DB954]/15 shadow-[0_0_24px_rgb(202_62_71_/_20%)]"
      style={{
        height: rect.height,
        left: rect.x,
        top: rect.y,
        width: rect.width,
      }}
    />
  );
}
