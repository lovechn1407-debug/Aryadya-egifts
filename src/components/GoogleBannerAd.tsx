"use client";

import { useEffect, useRef } from "react";

interface GoogleBannerAdProps {
  client: string;
  slot: string;
  style?: React.CSSProperties;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
}

export default function GoogleBannerAd({
  client,
  slot,
  style = { display: "block" },
  format = "auto",
  responsive = true,
}: GoogleBannerAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    // Only push if not already loaded and if adsbygoogle is available
    if (adRef.current && !isLoaded.current && typeof window !== "undefined") {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
        isLoaded.current = true;
      } catch (e) {
        console.error("AdSense error", e);
      }
    }
  }, []);

  return (
    <div className="google-ad-container" style={{ width: "100%", overflow: "hidden", textAlign: "center", ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
        ref={adRef}
      />
    </div>
  );
}
