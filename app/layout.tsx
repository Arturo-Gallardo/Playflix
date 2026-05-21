import type { Metadata } from "next";
import { michroma, nunito, saira } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Playlix",
  description: "Explore Spotify playlists on an infinite cover canvas.",
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
      <body>{children}</body>
    </html>
  );
}
