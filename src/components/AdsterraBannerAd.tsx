"use client";

import { useEffect, useRef } from "react";

interface AdsterraBannerAdProps {
  adKey: string;
  width?: number;
  height?: number;
}

export default function AdsterraBannerAd({ adKey, width = 300, height = 250 }: AdsterraBannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // We use an iframe or inject the script dynamically because React doesn't execute inline scripts added via innerHTML.
    // However, Adsterra scripts often use document.write, which breaks async React rendering.
    // The safest way to render them in a React SPA is within an iframe.
    const iframe = document.createElement("iframe");
    iframe.width = width.toString();
    iframe.height = height.toString();
    iframe.frameBorder = "0";
    iframe.scrolling = "no";
    
    // Build the content of the iframe
    const html = `
      <html>
        <head>
          <style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }</style>
        </head>
        <body>
          <script type="text/javascript">
            atOptions = {
              'key' : '${adKey}',
              'format' : 'iframe',
              'height' : ${height},
              'width' : ${width},
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="//www.highperformanceformat.com/${adKey}/invoke.js"></script>
        </body>
      </html>
    `;

    containerRef.current.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }

    return () => {
      if (containerRef.current && iframe) {
        containerRef.current.removeChild(iframe);
      }
    };
  }, [adKey, width, height]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: width, 
        height: height, 
        margin: "0 auto", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        background: "rgba(255,255,255,0.02)",
        borderRadius: 8,
        overflow: "hidden"
      }} 
    />
  );
}
