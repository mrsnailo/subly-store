"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const QA = [
  {
    q: "Are these genuine subscriptions?",
    a: "Yes. Every plan is a genuine subscription or upgrade. You get real access on your own account or a dedicated profile, depending on the service.",
  },
  {
    q: "How fast is delivery?",
    a: "Most orders are delivered automatically within 5 minutes to your WhatsApp and email. A few services that need manual activation can take up to a couple of hours.",
  },
  {
    q: "What payment methods do you accept?",
    a: "bKash, Nagad, Rocket, Upay, and bank transfer. We confirm the order on WhatsApp and share payment details there. Pay in BDT.",
  },
  {
    q: "What if my subscription stops working?",
    a: "Every plan includes a replacement warranty for its full duration. Message us on WhatsApp and we'll fix or replace it — usually same day.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="faq">
      {QA.map((item, i) => (
        <div key={i} className={`qa ${open === i ? "open" : ""}`}>
          <button onClick={() => setOpen(open === i ? null : i)}>
            {item.q}{" "}
            <span className="chev">
              {open === i ? <Minus size={16} /> : <Plus size={16} />}
            </span>
          </button>
          <div className="ans">
            <p>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

