"use client";

import { useState } from "react";

type DurationDefault = { label: string; price: number; wasPrice: number | null };
type ProductDefault = {
  name: string;
  tagline: string;
  categoryId: string;
  wordmark: string;
  brandColor: string;
  brandBg: string;
  rating: number;
  badgeText: string | null;
  badgeKind: string | null;
  isFeatured: boolean;
  isActive: boolean;
  durations: DurationDefault[];
};

const BLANK: ProductDefault = {
  name: "",
  tagline: "",
  categoryId: "",
  wordmark: "",
  brandColor: "#14151A",
  brandBg: "#EDEAE1",
  rating: 4.8,
  badgeText: "",
  badgeKind: "",
  isFeatured: false,
  isActive: true,
  durations: [{ label: "1 mo", price: 0, wasPrice: null }],
};

type Row = { id: number; label: string; price: string; was: string };

export function ProductForm({
  action,
  categories,
  product,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  categories: { id: string; name: string }[];
  product?: ProductDefault;
  submitLabel: string;
}) {
  const p = product ?? BLANK;
  const [color, setColor] = useState(p.brandColor);
  const [bg, setBg] = useState(p.brandBg);
  const [wordmark, setWordmark] = useState(p.wordmark);
  const [rows, setRows] = useState<Row[]>(
    p.durations.map((d, i) => ({
      id: i,
      label: d.label,
      price: String(d.price),
      was: d.wasPrice != null ? String(d.wasPrice) : "",
    })),
  );

  const addRow = () =>
    setRows((r) => [
      ...r,
      { id: (r.at(-1)?.id ?? 0) + 1, label: "", price: "", was: "" },
    ]);
  const removeRow = (id: number) =>
    setRows((r) => (r.length > 1 ? r.filter((x) => x.id !== id) : r));
  const patch = (id: number, key: keyof Row, val: string) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [key]: val } : x)));

  return (
    <form action={action} className="formcard">
      <div className="row2">
        <div className="field">
          <label htmlFor="name">Product name</label>
          <input
            id="name"
            name="name"
            className="input"
            defaultValue={p.name}
            placeholder="e.g. Netflix Premium"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="categoryId">Category</label>
          <select
            id="categoryId"
            name="categoryId"
            className="select"
            defaultValue={p.categoryId}
            required
          >
            <option value="" disabled>
              Pick a category…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="tagline">Tagline</label>
        <input
          id="tagline"
          name="tagline"
          className="input"
          defaultValue={p.tagline}
          placeholder="e.g. 4K UHD · 4 screens"
          required
        />
      </div>

      <div className="row3">
        <div className="field">
          <label htmlFor="wordmark">Brand wordmark</label>
          <input
            id="wordmark"
            name="wordmark"
            className="input"
            value={wordmark}
            onChange={(e) => setWordmark(e.target.value)}
            placeholder="NETFLIX"
            required
          />
        </div>
        <div className="field">
          <label>Wordmark colour</label>
          <div className="actions">
            <input
              type="color"
              className="swatch"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="Wordmark colour"
            />
            <input
              name="brandColor"
              className="input"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label>Card background</label>
          <div className="actions">
            <input
              type="color"
              className="swatch"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              aria-label="Card background"
            />
            <input
              name="brandBg"
              className="input"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Live preview of the card header */}
      <div className="field">
        <label>Preview</label>
        <div
          className="brandhead"
          style={{ background: bg, maxWidth: 260, marginBottom: 0 }}
        >
          <span className="wm" style={{ color }}>
            {wordmark || "Wordmark"}
          </span>
        </div>
      </div>

      <div className="row3">
        <div className="field">
          <label htmlFor="rating">Rating (0–5)</label>
          <input
            id="rating"
            name="rating"
            className="input"
            type="number"
            step="0.1"
            min="0"
            max="5"
            defaultValue={p.rating}
          />
        </div>
        <div className="field">
          <label htmlFor="badgeText">
            Badge text <span className="hint">(optional)</span>
          </label>
          <input
            id="badgeText"
            name="badgeText"
            className="input"
            defaultValue={p.badgeText ?? ""}
            placeholder="Hot / -50%"
          />
        </div>
        <div className="field">
          <label htmlFor="badgeKind">Badge style</label>
          <select
            id="badgeKind"
            name="badgeKind"
            className="select"
            defaultValue={p.badgeKind ?? ""}
          >
            <option value="">None</option>
            <option value="hot">Hot (red)</option>
            <option value="save">Save (lime)</option>
          </select>
        </div>
      </div>

      {/* Durations */}
      <div className="field">
        <label>Duration &amp; price tiers</label>
        <span className="hint" style={{ marginBottom: 4 }}>
          Prices use your store currency. &quot;Was&quot; is the optional strike-through price.
        </span>
        <div className="dur-row" style={{ marginBottom: 4 }}>
          <span className="hint">Label</span>
          <span className="hint">Price ৳</span>
          <span className="hint">Was ৳</span>
          <span />
        </div>
        {rows.map((row) => (
          <div className="dur-row" key={row.id}>
            <input
              name="dur_label"
              className="input"
              placeholder="1 mo"
              value={row.label}
              onChange={(e) => patch(row.id, "label", e.target.value)}
            />
            <input
              name="dur_price"
              className="input"
              type="number"
              min="0"
              placeholder="380"
              value={row.price}
              onChange={(e) => patch(row.id, "price", e.target.value)}
            />
            <input
              name="dur_was"
              className="input"
              type="number"
              min="0"
              placeholder="550"
              value={row.was}
              onChange={(e) => patch(row.id, "was", e.target.value)}
            />
            <button
              type="button"
              className="iconlink btn-danger"
              onClick={() => removeRow(row.id)}
              disabled={rows.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="iconlink" onClick={addRow}>
          ＋ Add tier
        </button>
      </div>

      <label className="checkrow">
        <input type="checkbox" name="isActive" defaultChecked={p.isActive} />
        Show on store (active)
      </label>
      <label className="checkrow">
        <input type="checkbox" name="isFeatured" defaultChecked={p.isFeatured} />
        Mark as featured
      </label>

      <div className="actions">
        <button className="btn btn-ink">{submitLabel}</button>
        <a className="iconlink" href="/admin/products">
          Cancel
        </a>
      </div>
    </form>
  );
}
