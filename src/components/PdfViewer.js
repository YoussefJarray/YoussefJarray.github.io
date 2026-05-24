"use client";

export default function PdfViewer() {
  return (
    <iframe
      src="/resume.pdf"
      className="w-full h-full border-none"
      title="Resume"
    />
  );
}
