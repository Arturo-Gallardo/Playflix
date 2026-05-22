import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SpotifyDevHostRedirect } from "./components/auth/SpotifyDevHostRedirect";
import { michroma, nunito, saira } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Playlix",
  description: "Explore Spotify playlists on an infinite cover canvas.",
  icons: {
    apple: "/playlix-logo.png",
    icon: "/playlix-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${nunito.variable} ${saira.variable} ${michroma.variable}`}
      lang="en"
    >
      <body>
        <SpotifyDevHostRedirect />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
