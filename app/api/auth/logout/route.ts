import { NextResponse } from "next/server";
import { clearSpotifySession } from "../../../lib/spotify/session";

export async function POST() {
  await clearSpotifySession();

  return NextResponse.json({ ok: true });
}
