import { NextResponse } from "next/server";
import { isPlaylixDemoMode } from "../../../lib/spotify/demo-config";
import { clearSpotifySession } from "../../../lib/spotify/session";

export async function POST() {
  if (isPlaylixDemoMode()) {
    return NextResponse.json({ isDemoMode: true, ok: true });
  }

  await clearSpotifySession();

  return NextResponse.json({ ok: true });
}
