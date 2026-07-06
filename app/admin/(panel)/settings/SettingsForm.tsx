"use client";

import { useState, useTransition } from "react";
import { updateStoreSettings } from "./actions";

export type SettingsDefaults = {
  storeName: string;
  contactEmail: string;
  whatsApp: string;
  currency: string;
  isOpen: boolean;
};

export function SettingsForm({ defaults }: { defaults: SettingsDefaults }) {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="formcard">
      <form
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
          <button className="btn btn-ink" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
