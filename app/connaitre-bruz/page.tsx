import type { Metadata } from "next";
import ConnaitreBruzClient from "./ConnaitreBruzClient";

export const metadata: Metadata = {
  title: "Connaître Bruz — la base de connaissance | Bruz en Action",
  description:
    "Identité, gouvernance, écoles, équipements, transports, sport, économie, environnement, culture : tout ce qu'on sait de Bruz, sourcé et navigable.",
  openGraph: {
    title: "Connaître Bruz — la base de connaissance | Bruz en Action",
    description:
      "Identité, gouvernance, écoles, équipements, transports, sport, économie, environnement, culture — la base de connaissance de Bruz en Action.",
    url: "https://sylvain35170.github.io/bruz-en-action/connaitre-bruz",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

export default function ConnaitreBruzPage() {
  return <ConnaitreBruzClient />;
}
