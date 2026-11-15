"use client";

import React, { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Download,
  Eye,
  Trash2,
  Paperclip,
} from "lucide-react";
import { AssignmentAttachment } from "@/types/assignment";
import { triggerFileDownload, getAttachmentBlob } from "@/lib/attachmentStorage";
import { PdfPreviewModal } from "./PdfPreviewModal";
import { ImagePreviewModal } from "./ImagePreviewModal";

interface AttachmentListProps {
  attachments: AssignmentAttachment[];
  onRemoveAttachment?: (attachmentId: string) => void;
  showEmptyState?: boolean;
}

export function AttachmentList({
  attachments,
  onRemoveAttachment,
  showEmptyState = true,
}: AttachmentListProps) {
  const [activePdf, setActivePdf] = useState<AssignmentAttachment | null>(null);
  const [activeImage, setActiveImage] = useState<AssignmentAttachment | null>(null);

  const handlePreview = (att: AssignmentAttachment) => {
    if (att.fileType === "pdf") {
      setActivePdf(att);
    } else {
      setActiveImage(att);
    }
  };

  const handleDownload = async (att: AssignmentAttachment) => {
    if (att.dataUrl) {
      triggerFileDownload(att.dataUrl, att.name);
      return;
    }
    const blob = await getAttachmentBlob(att.storageKey);
    if (blob) {
      triggerFileDownload(blob, att.name);
    }
  };

  if (!attachments || attachments.length === 0) {
    if (!showEmptyState) return null;
    return (
      <div className="py-2 px-3 rounded-input bg-neutral-light/60 border border-neutral-border/60 text-[11px] text-neutral-secondary flex items-center gap-2">
        <Paperclip className="w-3 h-3 text-neutral-secondary/60 flex-shrink-0" />
        <span>No reference attachments provided for this assignment.</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-neutral-secondary uppercase tracking-wider flex items-center gap-1.5 mb-1">
          <Paperclip className="w-3 h-3 text-indigo" />
          <span>Attached Resources ({attachments.length})</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {attachments.map((att) => {
            const isPdf = att.fileType === "pdf";

            return (
              <div
                key={att.id}
                className="flex items-center justify-between p-2 rounded-input bg-neutral-light/70 hover:bg-neutral-light border border-neutral-border/80 text-xs transition-colors group"
              >
                {/* File Icon & Info */}
                <div
                  onClick={() => handlePreview(att)}
                  className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                  title={`Preview ${att.name}`}
                >
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${
                      isPdf
                        ? "bg-semantic-error-subtle text-semantic-error"
                        : "bg-indigo-subtle text-indigo"
                    }`}
                  >
                    {isPdf ? (
                      <FileText className="w-3.5 h-3.5" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy truncate group-hover:text-indigo transition-colors leading-tight">
                      {att.name}
                    </p>
                    <p className="text-[10px] text-neutral-secondary font-medium">
                      {att.fileSizeFormatted} • {isPdf ? "PDF Document" : "Image Diagram"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pl-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePreview(att)}
                    className="p-1 rounded text-neutral-secondary hover:text-indigo hover:bg-surface transition-colors"
                    title={`Preview ${att.name}`}
                    aria-label={`Preview ${att.name}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(att)}
                    className="p-1 rounded text-neutral-secondary hover:text-navy hover:bg-surface transition-colors"
                    title={`Download ${att.name}`}
                    aria-label={`Download ${att.name}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {onRemoveAttachment && (
                    <button
                      type="button"
                      onClick={() => onRemoveAttachment(att.id)}
                      className="p-1 rounded text-neutral-secondary hover:text-semantic-error hover:bg-surface transition-colors"
                      title="Remove attachment"
                      aria-label={`Remove ${att.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Modals */}
      <PdfPreviewModal
        attachment={activePdf}
        isOpen={Boolean(activePdf)}
        onClose={() => setActivePdf(null)}
      />

      <ImagePreviewModal
        attachment={activeImage}
        isOpen={Boolean(activeImage)}
        onClose={() => setActiveImage(null)}
      />
    </>
  );
}
