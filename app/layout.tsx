import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { getStoreSettings } from "@/lib/queries";
import fs from "fs";
import path from "path";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return {
    title: `${settings.storeName} — Premium Digital Subscriptions`,
    description:
      "Bangladesh's trusted store for premium digital subscriptions. Genuine plans, instant delivery, local payment.",
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
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=general-sans@400,500,600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href={faviconUrl} />
      </head>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
