"use client";

import { useState, useTransition, useRef } from "react";
import { updateStoreSettings, uploadLogoAction, uploadFaviconAction } from "./actions";
import { Image as ImageIcon, Loader2 } from "lucide-react";

export type SettingsDefaults = {
  storeName: string;
  contactEmail: string;
  whatsApp: string;
  currency: string;
  isOpen: boolean;
  logoUrl?: string | null;
  faviconUrl?: string | null;
};

export function SettingsForm({ defaults }: { defaults: SettingsDefaults }) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [logoUrl, setLogoUrl] = useState<string | null>(defaults.logoUrl ?? null);
  const [logoStatus, setLogoStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [logoError, setLogoError] = useState<string | null>(null);

  const [faviconUrl, setFaviconUrl] = useState<string | null>(defaults.faviconUrl ?? null);
  const [faviconStatus, setFaviconStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [faviconError, setFaviconError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (file: File) => {
    setLogoStatus("uploading");
    setLogoError(null);

    const previewUrl = URL.createObjectURL(file);
    setLogoUrl(previewUrl);

    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await uploadLogoAction(formData);
      if (res.ok && res.url) {
        setLogoUrl(res.url);
        setLogoStatus("success");
      } else {
        throw new Error("Couldn't upload logo. Try again.");
      }
    } catch (err) {
      setLogoUrl(defaults.logoUrl ?? null);
      setLogoStatus("error");
      setLogoError(err instanceof Error ? err.message : "Couldn't upload logo. Try again.");
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setLogoStatus("error");
      setLogoError("Logo size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 50 || img.height < 15) {
          setLogoStatus("error");
          setLogoError(`Logo is too small. Min: 50x15. Got: ${img.width}x${img.height}.`);
        } else if (img.width > 1200 || img.height > 600) {
          setLogoStatus("error");
          setLogoError(`Logo is too large. Max: 1200x600. Got: ${img.width}x${img.height}.`);
        } else {
          handleLogoUpload(file);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconUpload = async (file: File) => {
    setFaviconStatus("uploading");
    setFaviconError(null);

    const previewUrl = URL.createObjectURL(file);
    setFaviconUrl(previewUrl);

    try {
      const formData = new FormData();
      formData.append("favicon", file);
      const res = await uploadFaviconAction(formData);
      if (res.ok && res.url) {
        setFaviconUrl(res.url);
        setFaviconStatus("success");
      } else {
        throw new Error("Couldn't upload favicon. Try again.");
      }
    } catch (err) {
      setFaviconUrl(defaults.faviconUrl ?? null);
      setFaviconStatus("error");
      setFaviconError(err instanceof Error ? err.message : "Couldn't upload favicon. Try again.");
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      setFaviconStatus("error");
      setFaviconError("Favicon size must be less than 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== img.height) {
          setFaviconStatus("error");
          setFaviconError(`Favicon must be square. Got: ${img.width}x${img.height}.`);
        } else if (img.width < 16 || img.width > 512) {
          setFaviconStatus("error");
          setFaviconError(`Favicon size must be between 16x16 and 512x512. Got: ${img.width}x${img.height}.`);
        } else {
          handleFaviconUpload(file);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const isUploading = logoStatus === "uploading" || faviconStatus === "uploading";

  return (
    <div className="formcard">
      <form
        encType="multipart/form-data"
        action={(formData) => {
          setSuccess(null);
          setError(null);
          startTransition(async () => {
            try {
              await updateStoreSettings(formData);
              setSuccess("Settings saved.");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not save settings");
            }
          });
        }}
      >
        <div className="row2">
          <div className="field">
            <label htmlFor="storeName">Store name</label>
            <input
              id="storeName"
              name="storeName"
              className="input"
              defaultValue={defaults.storeName}
              placeholder="e.g. Subly Store"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="currency">Currency</label>
            <input
              id="currency"
              name="currency"
              className="input"
              defaultValue={defaults.currency}
              placeholder="e.g. BDT"
              inputMode="text"
              autoCapitalize="characters"
              required
            />
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label htmlFor="contactEmail">Contact email</label>
            <input
              id="contactEmail"
              name="contactEmail"
              className="input"
              type="email"
              defaultValue={defaults.contactEmail}
              placeholder="owner@yourstore.com"
              autoComplete="email"
              spellCheck={false}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="whatsApp">WhatsApp</label>
            <input
              id="whatsApp"
              name="whatsApp"
              className="input"
              type="tel"
              defaultValue={defaults.whatsApp}
              placeholder="+880..."
              autoComplete="tel"
              required
            />
          </div>
        </div>

        <div style={{ borderTop: "1.5px solid var(--line)", paddingTop: "20px", marginBottom: "8px", marginTop: "24px" }}>
          <p style={{ fontSize: "14.5px", fontWeight: 600, margin: "0 0 12px" }}>Branding</p>
        </div>

        <div className="row2">
          {/* Logo Field */}
          <div className="field">
            <label style={{ fontSize: "13.5px", fontWeight: 600, marginBottom: "2px" }}>Logo</label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--cream)", borderRadius: "12px", border: "1.5px solid var(--line)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--card)", border: "1.5px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                {logoStatus === "uploading" ? (
                  <Loader2 className="animate-spin" style={{ color: "var(--muted)" }} size={18} />
                ) : logoUrl ? (
                  <img src={logoUrl} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                ) : (
                  <ImageIcon style={{ color: "var(--muted)" }} size={18} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {logoStatus === "error" ? (
                  <p style={{ fontSize: "13px", fontWeight: 500, margin: 0, color: "#dc2626" }}>
                    {logoError || "Couldn't upload logo. Try again."}
                  </p>
                ) : logoStatus === "uploading" ? (
                  <p style={{ fontSize: "13px", fontWeight: 500, margin: 0, color: "var(--muted)" }}>
                    Uploading...
                  </p>
                ) : logoUrl ? (
                  <p style={{ fontSize: "13px", fontWeight: 500, margin: 0, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    Logo uploaded
                  </p>
                ) : (
                  <p style={{ fontSize: "13px", fontWeight: 500, margin: 0, color: "var(--muted)" }}>
                    No logo uploaded
                  </p>
                )}
                <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                  120x30 to 400x100 px
                </p>
              </div>
              <input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                ref={logoInputRef}
                onChange={handleLogoChange}
                style={{ display: "none" }}
              />
              <button
                type="button"
                disabled={logoStatus === "uploading"}
                onClick={() => logoInputRef.current?.click()}
                className="btn btn-ghost btn-sm"
                style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "13px", flexShrink: 0 }}
              >
                Upload
              </button>
            </div>
          </div>

          {/* Favicon Field */}
          <div className="field">
            <label style={{ fontSize: "13.5px", fontWeight: 600, marginBottom: "2px" }}>Favicon</label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--cream)", borderRadius: "12px", border: "1.5px solid var(--line)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--card)", border: "1.5px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                {faviconStatus === "uploading" ? (
                  <Loader2 className="animate-spin" style={{ color: "var(--muted)" }} size={18} />
                ) : faviconUrl ? (
                  <img src={faviconUrl} alt="Favicon" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                ) : (
                  <ImageIcon style={{ color: "var(--muted)" }} size={18} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {faviconStatus === "error" ? (
                  <p style={{ fontSize: "13px", fontWeight: 500, margin: 0, color: "#dc2626" }}>
                    {faviconError || "Couldn't upload favicon. Try again."}
                  </p>
                ) : faviconStatus === "uploading" ? (
                  <p style={{ fontSize: "13px", fontWeight: 500, margin: 0, color: "var(--muted)" }}>
                    Uploading...
                  </p>
                ) : faviconUrl ? (
                  <p style={{ fontSize: "13px", fontWeight: 500, margin: 0, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    Favicon uploaded
                  </p>
                ) : (
                  <p style={{ fontSize: "13px", fontWeight: 500, margin: 0, color: "var(--muted)" }}>
                    No favicon uploaded
                  </p>
                )}
                <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                  Square, 16x16 to 512x512
                </p>
              </div>
              <input
                id="favicon"
                name="favicon"
                type="file"
                accept="image/*"
                ref={faviconInputRef}
                onChange={handleFaviconChange}
                style={{ display: "none" }}
              />
              <button
                type="button"
                disabled={faviconStatus === "uploading"}
                onClick={() => faviconInputRef.current?.click()}
                className="btn btn-ghost btn-sm"
                style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "13px", flexShrink: 0 }}
              >
                Upload
              </button>
            </div>
          </div>
        </div>

        <label className="checkrow">
          <input type="checkbox" name="isOpen" defaultChecked={defaults.isOpen} />
          Store is open
          <span className="hint" style={{ marginLeft: 8 }}>
            (turn this off to temporarily close)
          </span>
        </label>

        {(success || error) && (
          <p
            aria-live="polite"
            style={{
              marginTop: 12,
              color: error ? "#fca5a5" : "#a7f3d0",
              fontSize: 13,
            }}
          >
            {error ?? success}
          </p>
        )}

        <div className="actions">
          <button className="btn btn-ink" disabled={pending || isUploading}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
