import { AssignmentAttachment, AttachmentFileType } from "@/types/assignment";

const DB_NAME = "campusiq_attachments_db";
const DB_VERSION = 1;
const STORE_NAME = "attachment_blobs";

// 10 MB maximum upload limit
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_MIME_TYPES: Record<string, AttachmentFileType> = {
  "application/pdf": "pdf",
  "image/jpeg": "image",
  "image/jpg": "image",
  "image/png": "image",
  "image/webp": "image",
};

export const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

/**
 * Format bytes into human-readable string (e.g. 1.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validates an uploaded File for allowed type and size.
 */
export function validateAttachmentFile(file: File): {
  valid: boolean;
  error?: string;
  fileType?: AttachmentFileType;
} {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  let fileType: AttachmentFileType | undefined = ALLOWED_MIME_TYPES[mime];

  // Extension fallback if mime is generic
  if (!fileType) {
    if (name.endsWith(".pdf")) fileType = "pdf";
    else if (
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".png") ||
      name.endsWith(".webp")
    ) {
      fileType = "image";
    }
  }

  if (!fileType) {
    return {
      valid: false,
      error: `File type not supported (${file.name}). Allowed formats: PDF, JPG, PNG, WEBP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large (${formatFileSize(file.size)}). Maximum allowed file size is 10 MB.`,
    };
  }

  return { valid: true, fileType };
}

/**
 * Initializes or opens the IndexedDB database.
 */
function openAttachmentDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn("Could not open IndexedDB for attachments:", request.error);
        resolve(null);
      };
    } catch (e) {
      console.warn("IndexedDB initialization error:", e);
      resolve(null);
    }
  });
}

/**
 * Stores a file Blob in IndexedDB.
 */
export async function saveAttachmentBlob(
  key: string,
  blob: Blob,
  metadata: { name: string; mimeType: string }
): Promise<boolean> {
  const db = await openAttachmentDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const record = {
        key,
        blob,
        name: metadata.name,
        mimeType: metadata.mimeType,
        savedAt: new Date().toISOString(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.error("IndexedDB put failed:", req.error);
        resolve(false);
      };
    } catch (e) {
      console.error("Error saving blob to IndexedDB:", e);
      resolve(false);
    }
  });
}

/**
 * Retrieves a file Blob from IndexedDB by its key.
 */
export async function getAttachmentBlob(
  key: string
): Promise<Blob | null> {
  const db = await openAttachmentDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob as Blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch (e) {
      console.warn("Error getting blob from IndexedDB:", e);
      resolve(null);
    }
  });
}

/**
 * Deletes a file Blob from IndexedDB.
 */
export async function deleteAttachmentBlob(key: string): Promise<boolean> {
  const db = await openAttachmentDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Triggers a real browser download for a Blob or DataURL.
 */
export function triggerFileDownload(blobOrUrl: Blob | string, filename: string) {
  if (typeof window === "undefined") return;

  let url: string;
  let isCreatedUrl = false;

  if (typeof blobOrUrl === "string") {
    url = blobOrUrl;
  } else {
    url = URL.createObjectURL(blobOrUrl);
    isCreatedUrl = true;
  }

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  if (isCreatedUrl) {
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
}

/**
 * Creates a valid, realistic sample PDF DataURL for pre-seeded assignments.
 */
export function createSamplePdfDataUrl(subjectCode: string, title: string): string {
  // SVG-based representation wrapped or minimal data URL for preview
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <rect width="600" height="800" fill="#ffffff" />
    <rect width="600" height="70" fill="#292D45" />
    <text x="30" y="45" fill="#ffffff" font-family="Arial, sans-serif" font-size="20" font-weight="bold">UIT RGPV Shivpuri • Academic Document</text>
    <rect x="30" y="100" width="100" height="26" rx="4" fill="#635BFF" fill-opacity="0.15" />
    <text x="40" y="118" fill="#635BFF" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${subjectCode}</text>
    <text x="30" y="160" fill="#292D45" font-family="Arial, sans-serif" font-size="18" font-weight="bold">${title}</text>
    <line x1="30" y1="180" x2="570" y2="180" stroke="#E9EAF1" stroke-width="2" />
    <text x="30" y="220" fill="#687086" font-family="Arial, sans-serif" font-size="14">Official Course Reference &amp; Assignment Sheet</text>
    <text x="30" y="250" fill="#292D45" font-family="Arial, sans-serif" font-size="13">1. Please review all experiment instructions and guidelines carefully.</text>
    <text x="30" y="280" fill="#292D45" font-family="Arial, sans-serif" font-size="13">2. Submit your completed calculations and report prior to the due date.</text>
    <text x="30" y="310" fill="#292D45" font-family="Arial, sans-serif" font-size="13">3. Maintain clean step-by-step mathematical proofs and diagrams.</text>
    <rect x="30" y="350" width="540" height="300" rx="8" fill="#F7F8FC" stroke="#E9EAF1" stroke-dasharray="4" />
    <text x="200" y="500" fill="#687086" font-family="Arial, sans-serif" font-size="14">[ Document Content / Problem Set Diagrams ]</text>
    <text x="30" y="750" fill="#687086" font-family="Arial, sans-serif" font-size="11">CampusIQ Academic Workspace • Department of Computer Science &amp; Engineering</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Creates a sample technical diagram image DataURL for pre-seeded assignments.
 */
export function createSampleImageDataUrl(subjectCode: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="500" viewBox="0 0 700 500">
    <rect width="700" height="500" fill="#F7F8FC" stroke="#E9EAF1" stroke-width="2" rx="12" />
    <rect x="20" y="20" width="660" height="60" fill="#ffffff" rx="8" stroke="#E9EAF1" />
    <text x="40" y="55" fill="#292D45" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${subjectCode}: ${label}</text>
    <rect x="50" y="110" width="600" height="320" fill="#ffffff" rx="8" stroke="#635BFF" stroke-width="1.5" stroke-dasharray="3" />
    <circle cx="200" cy="270" r="45" fill="#635BFF" fill-opacity="0.1" stroke="#635BFF" stroke-width="2" />
    <text x="180" y="275" fill="#635BFF" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Source</text>
    <line x1="245" y1="270" x2="350" y2="270" stroke="#292D45" stroke-width="2" />
    <rect x="350" y="240" width="90" height="60" fill="#F59E0B" fill-opacity="0.1" stroke="#F59E0B" stroke-width="2" rx="4" />
    <text x="375" y="275" fill="#F59E0B" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Load Z</text>
    <line x1="440" y1="270" x2="520" y2="270" stroke="#292D45" stroke-width="2" />
    <circle cx="545" cy="270" r="25" fill="#0D9488" fill-opacity="0.1" stroke="#0D9488" stroke-width="2" />
    <text x="532" y="274" fill="#0D9488" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Output</text>
    <text x="210" y="400" fill="#687086" font-family="Arial, sans-serif" font-size="12">Circuit Schematic &amp; Component Verification Diagram</text>
    <text x="30" y="475" fill="#687086" font-family="Arial, sans-serif" font-size="11">UIT RGPV Shivpuri • Technical Reference Diagram</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
