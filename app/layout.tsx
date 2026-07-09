import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { getStoreSettings } from "@/lib/queries";

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
      </body>
    </html>
  );
}


