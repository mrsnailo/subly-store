import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { getStoreSettings } from "@/lib/queries";
import fs from "fs";
import path from "path";

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

  // Find favicon in public dir dynamically
  let faviconUrl = "/favicon.ico";
  const publicPath = path.join(process.cwd(), "public");
  try {
    const files = fs.readdirSync(publicPath);
    const faviconFile = files.find(f => f.startsWith("favicon."));
    if (faviconFile) {
      faviconUrl = `/${faviconFile}?v=${settings.updatedAt.getTime()}`;
    }
  } catch (e) {
    // Ignore
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={faviconUrl} />
      </head>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}


