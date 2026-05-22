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
    "How Playlix handles your data: browser storage, Spotify sign-in, and playlist loading.",
};

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      description="Plain summary of what Playlix stores and who it talks to. Last updated May 2026."
      title="Privacy"
    >
      <LegalSection title="The short version">
        <p>
          Playlix is a visual canvas for Spotify playlists. Your tile layouts
          and display preferences stay in{" "}
          <strong className="text-white/90">this browser</strong>. We do not
          run a Playlix user database, sell your data, or show ads.
        </p>
        <p>
          To load your playlists, the app uses Spotify sign-in with{" "}
          <strong className="text-white/90">read-only</strong> access. We never
          post, edit, or delete anything on your Spotify account.
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

      <LegalSection title="Spotify sign-in and session cookies">
        <p>
          When you sign in with Spotify, Playlix stores short-lived session
          cookies on our domain so the app can load your playlists. These are{" "}
          <strong className="text-white/90">httpOnly</strong> cookies (not
          readable by page scripts) and typically include:
        </p>
        <ul className="legal-page-list">
          <li>Spotify access and refresh tokens for your session</li>
          <li>Basic profile info shown in the app (display name, avatar)</li>
          <li>Temporary OAuth state used during sign-in</li>
        </ul>
        <p>
          We request read-only scopes: private and collaborative playlist
          access, plus basic profile info. Sign out clears Playlix session
          cookies. Switch account starts a new Spotify authorization flow.
        </p>
        <p>
          Some deployments may run in <strong className="text-white/90">demo
          mode</strong>, where everyone sees one pre-configured Spotify account
          and individual sign-in is disabled. In that case, no personal Spotify
          session is created for visitors.
        </p>
      </LegalSection>

      <LegalSection title="What hits our servers">
        <p>
          When you load playlists, Playlix API routes fetch playlist and track
          metadata from Spotify on your behalf, then return it to your browser.
          We do not store your playlists or layouts in a Playlix database.
          Requests are handled for that session and discarded afterward.
        </p>
        <p>
          Server logs from our host (e.g. Vercel) may include standard web
          data such as IP address, request timing, and errors while operating
          the service.
        </p>
      </LegalSection>

      <LegalSection title="Hosting, analytics, and performance">
        <p>
          Playlix is hosted on{" "}
          <a
            className="legal-page-link"
            href="https://vercel.com/legal/privacy-policy"
            rel="noopener noreferrer"
            target="_blank"
          >
            Vercel
          </a>
          . Vercel may process standard web logs (IP address, request timing,
          errors) while running the service.
        </p>
        <p>
          We use{" "}
          <strong className="text-white/90">Vercel Web Analytics</strong> to
          see aggregate traffic — for example page views and referrers. It does
          not use third-party ad cookies and does not track you across other
          websites.
        </p>
        <p>
          We use{" "}
          <strong className="text-white/90">Vercel Speed Insights</strong> to
          measure real-world performance (Core Web Vitals such as load time and
          layout stability). That helps us spot slow pages and fix them.
        </p>
        <p>
          Analytics and performance data are collected by Vercel on our behalf.
          We do not run ad trackers or sell visitor data.
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
