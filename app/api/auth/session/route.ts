import { NextResponse } from "next/server";
import { getSpotifySession } from "../../../lib/spotify/session";

export async function GET() {
  const session = await getSpotifySession();

  return NextResponse.json(session);
}
