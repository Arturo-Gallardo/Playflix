import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmailLink } from "../components/shared/ContactEmailLink";
import {
  LegalDocumentPage,
  LegalSection,
} from "../components/shared/LegalDocumentPage";
import { legalContactEmail } from "../lib/legal/contact-email";

export const metadata: Metadata = {
  title: "Privacy — Playlix",
  description:
    "How Playlix handles your data: browser storage and Spotify playlist loading.",
};

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      description="Plain summary of what Playlix stores and who it talks to. Last updated May 2026."
      title="Privacy"
    >
      <LegalSection title="The short version">
        <p>
          Playlix is a visual canvas for Spotify playlists. Your layouts and
          preferences stay in{" "}
          <strong className="text-white/90">this browser</strong>. There is no
          Playlix account database and no paid tier tracking you across the
          web.
        </p>
        <p>
          We do not sell your data or run ads. Update this section when Spotify
          sign-in or server-side features are added.
        </p>
      </LegalSection>

      <LegalSection title="What stays on your device">
        <p>Playlix saves some things in your browser&apos;s local storage:</p>
        <ul className="legal-page-list">
          <li>
            Canvas layout — tile positions, camera, and which playlists you
            loaded
          </li>
          <li>
            Cached playlist cover metadata (titles, artists, etc.) to load
            faster
          </li>
          <li>Display settings — e.g. shortcut legend and hover details</li>
          <li>Whether you dismissed the welcome screen</li>
        </ul>
        <p>
          Clearing site data in your browser removes this. You can also clear
          playlist cache or saved layout from Settings in the app. Exporting a{" "}
          <code className="legal-page-code">.playlix.json</code> file is
          entirely under your control — we do not upload those files to our
          servers.
        </p>
      </LegalSection>

      <LegalSection title="What hits our servers">
        <p>
          When you load a playlist, our app may call Playlix API routes that
          fetch playlist contents from Spotify. Update this section when the
          Spotify integration is wired up.
        </p>
        <p>
          We do not store your playlists on a Playlix database. Requests are
          processed to return data to your browser for that session.
        </p>
      </LegalSection>

      <LegalSection title="Accounts and sign-in">
        <p>
          Optional sign-in is not live yet. When it is added, this section will
          describe what Spotify account data we request and how it is used.
        </p>
      </LegalSection>

      <LegalSection title="Hosting and analytics">
        <p>
          The site may be hosted on Vercel. Vercel may process standard web
          logs (IP address, request timing, errors) as part of running the
          service.
        </p>
        <p>
          We do not run ad trackers. Add analytics details here if you enable
          them later.
        </p>
      </LegalSection>

      <LegalSection title="Spotify">
        <p>
          Playlix is not made by Spotify. Album art and metadata come from
          Spotify. Use of Spotify content is subject to{" "}
          <a
            className="legal-page-link"
            href="https://www.spotify.com/legal/end-user-agreement/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Spotify&apos;s Terms of Use
          </a>{" "}
          and{" "}
          <a
            className="legal-page-link"
            href="https://www.spotify.com/legal/privacy-policy/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Privacy Policy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          Playlix is not directed at children under 13. If you believe a child
          has submitted data through the app, contact us and we will help remove
          local data they control via browser settings.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          This page may be updated as the app changes. The date at the top
          reflects the latest revision. Continued use after an update means you
          accept the revised summary.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about privacy? Reach us at{" "}
          <ContactEmailLink email={legalContactEmail} />. See also our{" "}
          <Link className="legal-page-link" href="/terms">
            Terms of Service
          </Link>
          . There is no separate data-export portal because we do not hold your
          layouts on our servers.
        </p>
      </LegalSection>
    </LegalDocumentPage>
  );
}
