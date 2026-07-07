"use client";

import { useState, useTransition } from "react";
import { updateStoreSettings } from "./actions";

export type SettingsDefaults = {
  storeName: string;
  contactEmail: string;
  whatsApp: string;
  currency: string;
  isOpen: boolean;
  logoUrl?: string | null;
};

export function SettingsForm({ defaults }: { defaults: SettingsDefaults }) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [logoError, setLogoError] = useState<string | null>(null);
  const [faviconError, setFaviconError] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoError(null);
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Logo size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 50 || img.height < 15) {
          setLogoError(`Logo is too small. Min size: 50x15. Got: ${img.width}x${img.height}.`);
        } else if (img.width > 1200 || img.height > 600) {
          setLogoError(`Logo is too large. Max size: 1200x600. Got: ${img.width}x${img.height}.`);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFaviconError(null);
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      setFaviconError("Favicon size must be less than 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== img.height) {
          setFaviconError(`Favicon must be square (width === height). Got: ${img.width}x${img.height}.`);
        } else if (img.width < 16 || img.width > 512) {
          setFaviconError(`Favicon size must be between 16x16 and 512x512 pixels. Got: ${img.width}x${img.height}.`);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const isInvalid = !!logoError || !!faviconError;

  return (
    <div className="formcard">
      <form
        encType="multipart/form-data"
        action={(formData) => {
          if (isInvalid) {
            setError("Please correct the file validation errors before saving.");
            return;
          }
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

        <div className="row2" style={{ borderTop: "1px solid var(--line)", paddingTop: "16px", marginTop: "8px" }}>
          <div className="field">
            <label htmlFor="logo">Upload Logo</label>
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              className="input"
              onChange={handleLogoChange}
              style={{ padding: "8px" }}
            />
            <span className="hint">
              Recommended: 120x30 to 400x100. Min: 50x15. Max: 1200x600.
            </span>
            {logoError && (
              <span style={{ color: "#fca5a5", fontSize: "12px", marginTop: "2px" }}>
                ⚠️ {logoError}
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="favicon">Upload Favicon</label>
            <input
              id="favicon"
              name="favicon"
              type="file"
              accept="image/*"
              className="input"
              onChange={handleFaviconChange}
              style={{ padding: "8px" }}
            />
            <span className="hint">
              Must be square. Supported sizes: 16x16 to 512x512.
            </span>
            {faviconError && (
              <span style={{ color: "#fca5a5", fontSize: "12px", marginTop: "2px" }}>
                ⚠️ {faviconError}
              </span>
            )}
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
          <button className="btn btn-ink" disabled={pending || isInvalid}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
