"use client";

import { useEffect, useRef } from "react";

interface AdsterraNativeAdProps {
  adKey: string;
}

export default function AdsterraNativeAd({ adKey }: AdsterraNativeAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // We use an iframe to safely load the ad without breaking React's DOM (due to document.write)
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    // Initial height, native ads usually resize themselves or have a set height, we'll give it enough room
    iframe.style.minHeight = "250px"; 
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.scrolling = "no";
    
    // Build the content of the iframe
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; background: transparent; display: flex; justify-content: center; }
          </style>
        </head>
        <body>
          <script async="async" data-cfasync="false" src="https://pl29712037.effectivecpmnetwork.com/${adKey}/invoke.js"></script>
          <div id="container-${adKey}"></div>
          
          <script>
            // Attempt to resize iframe based on content if possible
            window.onload = function() {
              setTimeout(() => {
                const height = document.body.scrollHeight;
                if (height > 0) {
                  window.parent.postMessage({ type: 'resizeAd', height: height, id: '${adKey}' }, '*');
                }
              }, 1000);
            }
          </script>
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

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'resizeAd' && event.data?.id === adKey && iframe) {
        iframe.style.height = Math.max(250, event.data.height) + 'px';
      }
    };
    
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      if (containerRef.current && iframe) {
        containerRef.current.removeChild(iframe);
      }
    };
  }, [adKey]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: "100%", 
        minHeight: 250,
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
