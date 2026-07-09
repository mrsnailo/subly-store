import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { getStoreSettings } from "@/lib/queries";
import { SpeedInsights } from "@vercel/speed-insights/next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();

  const base = new URL(SITE_URL);
  const title = `${settings.storeName} — Premium Digital Subscriptions`;
  const description =
    "Bangladesh's trusted store for premium digital subscriptions. Genuine plans, instant delivery, local payment.";

  return {
    metadataBase: base,
    title,
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: "/",
      title,
      description,
      siteName: settings.storeName,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();

  const faviconUrl = settings.faviconUrl
    ? `${settings.faviconUrl}?v=${settings.updatedAt.getTime()}`
    : "/favicon.ico";

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={faviconUrl} />
      </head>
      <body>
        <CartProvider>{children}</CartProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}


