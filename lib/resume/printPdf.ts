// High-precision isolated Print-to-PDF engine for ATS Resumes

export function printResumeToPdf(elementId: string, fileName: string, pageSize: 'letter' | 'a4' = 'letter') {
  const sourceEl = document.getElementById(elementId);
  if (!sourceEl) {
    window.print();
    return;
  }

  // Clone the element to avoid modifying the active DOM
  const clone = sourceEl.cloneNode(true) as HTMLElement;

  // Remove non-print elements from the clone (e.g. page break guide)
  const noPrintEls = clone.querySelectorAll('.no-print, .page-break-guide');
  noPrintEls.forEach((el) => el.remove());

  // Page dimensions (96 DPI): Letter = 8.5in x 11in, A4 = 210mm x 297mm
  const isA4 = pageSize === 'a4';
  const pageCssSize = isA4 ? 'A4 portrait' : 'letter portrait';
  const pagePhysicalWidth = isA4 ? '210mm' : '8.5in';
  const pagePhysicalHeight = isA4 ? '297mm' : '11in';

  // Gather external stylesheets and fonts from <head>
  const styleNodes = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
  const headStylesHtml = styleNodes.map((n) => n.outerHTML).join('\n');

  // Create an invisible, isolated iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Resume Print Frame');
  iframe.style.position = 'fixed';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  iframe.style.width = pagePhysicalWidth;
  iframe.style.height = pagePhysicalHeight;
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${fileName}</title>
        ${headStylesHtml}
        <style>
          @page {
            size: ${pageCssSize};
            margin: 0 !important; /* CRITICAL: Suppresses browser headers (URL, date, time) and footers */
          }
          * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #FFFFFF !important;
            color: #000000 !important;
            width: ${pagePhysicalWidth} !important;
            min-height: ${pagePhysicalHeight} !important;
            font-size: inherit;
          }
          .ats-resume-sheet {
            width: ${pagePhysicalWidth} !important;
            min-height: ${pagePhysicalHeight} !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            box-sizing: border-box !important;
            transform: none !important;
            background: #FFFFFF !important;
            color: #000000 !important;
          }
          .no-print, .page-break-guide {
            display: none !important;
          }
          .ats-entry {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          a {
            color: inherit !important;
            text-decoration: none !important;
          }
          a.project-link-badge, .project-link-badge {
            color: #1d4ed8 !important;
            text-decoration: underline !important;
          }
        </style>
      </head>
      <body>
        ${clone.outerHTML}
      </body>
    </html>
  `);
  iframeDoc.close();

  // Trigger print after font rendering
  const triggerPrint = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print frame invocation error, fallback to window.print():', err);
        window.print();
      }

      // Clean up iframe after print dialog completes
      setTimeout(() => {
        try {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        } catch (e) {}
      }, 3000);
    }, 250);
  };

  // Ensure custom and system fonts are fully loaded before rendering print dialog
  if ((iframeDoc as any).fonts && (iframeDoc as any).fonts.ready) {
    (iframeDoc as any).fonts.ready.then(triggerPrint).catch(triggerPrint);
  } else {
    triggerPrint();
  }
}
