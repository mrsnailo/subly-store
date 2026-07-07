"use client";

import { useState } from "react";

interface LogoProps {
  storeName: string;
  logoUrl?: string | null;
}

export function Logo({ storeName, logoUrl }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  if (logoUrl && !imgError) {
    return (
      <span className="logo-img-wrap" style={{ display: "inline-flex", alignItems: "center" }}>
        <img
          src={logoUrl}
          alt={storeName}
          onError={() => setImgError(true)}
          style={{
            maxHeight: "32px",
            width: "auto",
            objectFit: "contain",
            borderRadius: "4px",
          }}
        />
      </span>
    );
  }

  return (
    <>
      <span className="mark">
        <span />
      </span>
      {storeName}
    </>
  );
}
