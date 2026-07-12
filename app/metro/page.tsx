import type { Metadata } from "next";

// Ancienne page dupliquée de /metropole — conservée uniquement comme
// redirection pour ne pas casser les liens externes existants.
export const metadata: Metadata = {
  title: "Rennes Métropole & Bruz — Bruz en Action",
  robots: { index: false },
};

export default function MetroRedirect() {
  const target = "/bruz-en-action/metropole";
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace("${target}");` }} />
      <p style={{ fontSize: 15, color: "#475569" }}>
        Cette page a déménagé — <a href={target} style={{ color: "#2563eb", fontWeight: 600 }}>voir Rennes Métropole &amp; Bruz</a>.
      </p>
    </div>
  );
}
