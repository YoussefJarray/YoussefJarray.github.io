"use client";
import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs";

export default function PdfViewer() {
  const [numPages, setNumPages] = useState(null);

  const onLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-auto items-center">
      <Document file="/resume.pdf" onLoadSuccess={onLoadSuccess}>
        {Array.from(new Array(numPages), (_, i) => (
          <Page key={i} pageNumber={i + 1} renderTextLayer={false} renderAnnotationLayer={false} className="my-2" />
        ))}
      </Document>
    </div>
  );
}
