"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Download,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { AssignmentAttachment } from "@/types/assignment";
import { getAttachmentBlob, triggerFileDownload } from "@/lib/attachmentStorage";

interface ImagePreviewModalProps {
  attachment: AssignmentAttachment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ImagePreviewModal({
  attachment,
  isOpen,
  onClose,
}: ImagePreviewModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (isOpen && attachment) {
      setIsLoading(true);
      setError(null);
      setZoomLevel(1);

      if (attachment.dataUrl) {
        setImageUrl(attachment.dataUrl);
        setIsLoading(false);
      } else {
        getAttachmentBlob(attachment.storageKey)
          .then((blob) => {
            if (!active) return;
            if (blob) {
              createdUrl = URL.createObjectURL(blob);
              setImageUrl(createdUrl);
            } else {
              setError("Image could not be retrieved from local storage.");
            }
          })
          .catch(() => {
            if (!active) return;
            setError("Error loading image preview.");
          })
          .finally(() => {
            if (active) setIsLoading(false);
          });
      }
    } else {
      setImageUrl(null);
      setError(null);
      setZoomLevel(1);
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, attachment]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !attachment) return null;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(3, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
  const handleResetZoom = () => setZoomLevel(1);

  const handleDownload = async () => {
    if (attachment.dataUrl) {
      triggerFileDownload(attachment.dataUrl, attachment.name);
      return;
    }
    const blob = await getAttachmentBlob(attachment.storageKey);
    if (blob) {
      triggerFileDownload(blob, attachment.name);
    } else if (imageUrl) {
      triggerFileDownload(imageUrl, attachment.name);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-navy/70 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-4xl h-[88vh] bg-surface rounded-card border border-neutral-border shadow-modal flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-border bg-neutral-light/50 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-input bg-indigo-subtle text-indigo flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 id="image-modal-title" className="text-sm font-bold text-navy truncate">
                {attachment.name}
              </h3>
              <p className="text-[11px] text-neutral-secondary">
                Technical Diagram / Image • {attachment.fileSizeFormatted}
              </p>
            </div>
          </div>

          {/* Controls: Zoom, Download, Close */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded-input border border-neutral-border bg-surface text-xs font-semibold text-neutral-secondary">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className="p-1 hover:text-navy disabled:opacity-30"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="w-12 text-center text-[11px] text-navy tabular-nums">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="p-1 hover:text-navy disabled:opacity-30"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 hover:text-indigo border-l border-neutral-border pl-1.5 ml-0.5"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-input bg-surface border border-neutral-border text-xs font-semibold text-navy hover:text-indigo hover:border-indigo/40 transition-colors shadow-xs"
              title="Download Image"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-input text-neutral-secondary hover:text-navy hover:bg-neutral-light transition-colors"
              aria-label="Close image preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Image Viewport */}
        <div className="flex-1 bg-navy/5 relative overflow-auto flex items-center justify-center p-4 select-none">
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-indigo border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-neutral-secondary">Loading image preview...</p>
            </div>
          )}

          {error && (
            <div className="p-6 text-center max-w-md bg-surface rounded-card border border-neutral-border shadow-card">
              <AlertCircle className="w-8 h-8 text-semantic-error mx-auto mb-2" />
              <h4 className="text-sm font-bold text-navy">Preview Unavailable</h4>
              <p className="text-xs text-neutral-secondary mt-1 mb-4">{error}</p>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-input bg-indigo text-white text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image File</span>
              </button>
            </div>
          )}

          {!isLoading && !error && imageUrl && (
            <div
              className="transition-transform duration-150 ease-out flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={attachment.name}
                className="max-h-[70vh] max-w-full rounded-md shadow-card object-contain border border-neutral-border/60 bg-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
