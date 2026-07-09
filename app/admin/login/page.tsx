import { LoginForm } from "./LoginForm";
import { getStoreSettings } from "@/lib/queries";
import { Logo } from "@/components/Logo";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: `Admin · ${settings.storeName}`,
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage() {
  const settings = await getStoreSettings();

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <a className="logo" href="/">
          <Logo storeName={settings.storeName} logoUrl={settings.logoUrl} />
        </a>
        <h1>Owner sign in</h1>
        <p className="sub">Manage your {settings.storeName}.</p>
        <LoginForm />
        <p style={{ marginTop: 18 }}>
          <a className="muted-link" href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={14} /> Back to store
          </a>
        </p>
      </div>
    </div>
  );
}
