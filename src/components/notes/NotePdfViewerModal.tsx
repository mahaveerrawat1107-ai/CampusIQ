"use client";

import React, { useEffect, useState } from "react";
import { X, Download, FileText, ExternalLink, AlertCircle } from "lucide-react";
import { AcademicNote } from "@/types/notes";
import { getNotePdfBlob, triggerNoteDownload } from "@/lib/notesStorage";

interface NotePdfViewerModalProps {
  note: AcademicNote | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NotePdfViewerModal({
  note,
  isOpen,
  onClose,
}: NotePdfViewerModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (isOpen && note) {
      setIsLoading(true);
      setError(null);

      // Check if dataUrl is available (pre-seeded notes)
      if (note.dataUrl) {
        setBlobUrl(note.dataUrl);
        setIsLoading(false);
      } else {
        // Fetch binary blob from IndexedDB
        getNotePdfBlob(note.storageKey)
          .then((blob) => {
            if (!active) return;
            if (blob) {
              createdUrl = URL.createObjectURL(blob);
              setBlobUrl(createdUrl);
            } else {
              setError("PDF document could not be retrieved from local storage.");
            }
          })
          .catch(() => {
            if (!active) return;
            setError("Error loading PDF document.");
          })
          .finally(() => {
            if (active) setIsLoading(false);
          });
      }
    } else {
      setBlobUrl(null);
      setError(null);
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, note]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !note) return null;

  const handleDownload = async () => {
    if (note.dataUrl) {
      triggerNoteDownload(note.dataUrl, note.fileName);
      return;
    }
    const blob = await getNotePdfBlob(note.storageKey);
    if (blob) {
      triggerNoteDownload(blob, note.fileName);
    } else if (blobUrl) {
      triggerNoteDownload(blobUrl, note.fileName);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-4xl h-[90vh] bg-surface rounded-card border border-neutral-border shadow-modal flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-border bg-neutral-light/50 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-input bg-semantic-error-subtle text-semantic-error flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-indigo-subtle text-indigo border border-indigo/20">
                  {note.subjectCode}
                </span>
                <span className="text-[11px] font-semibold text-neutral-secondary">
                  {note.unitTitle}
                </span>
              </div>
              <h3 id="note-modal-title" className="text-sm font-bold text-navy truncate mt-0.5">
                {note.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden md:inline text-xs text-neutral-secondary mr-1">
              {note.fileSizeFormatted}
            </span>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors shadow-xs"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-neutral-secondary hover:text-navy transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Pop-out</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-input text-neutral-secondary hover:text-navy hover:bg-neutral-light transition-colors"
              aria-label="Close PDF viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div className="flex-1 bg-neutral-light/30 relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4">
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-indigo border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-neutral-secondary">Loading PDF preview...</p>
            </div>
          )}

          {error && (
            <div className="p-6 text-center max-w-md bg-surface rounded-card border border-neutral-border shadow-card">
              <AlertCircle className="w-8 h-8 text-semantic-error mx-auto mb-2" />
              <h4 className="text-sm font-bold text-navy">Document Unavailable</h4>
              <p className="text-xs text-neutral-secondary mt-1 mb-4">{error}</p>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-input bg-indigo text-white text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Note</span>
              </button>
            </div>
          )}

          {!isLoading && !error && blobUrl && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <object
                data={blobUrl}
                type="application/pdf"
                className="w-full h-full rounded border border-neutral-border bg-white"
              >
                <iframe
                  src={blobUrl}
                  title={note.title}
                  className="w-full h-full rounded border border-neutral-border bg-white"
                />
              </object>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
