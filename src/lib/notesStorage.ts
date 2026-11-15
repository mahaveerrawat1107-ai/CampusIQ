const DB_NAME = "campusiq_notes_db";
const DB_VERSION = 1;
const STORE_NAME = "notes_blobs";

// 15 MB maximum upload limit for course notes
export const MAX_NOTES_FILE_SIZE_BYTES = 15 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validates an uploaded course note file.
 * Constraint: PDF files only!
 */
export function validateNotePdfFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  const isPdf = mime === "application/pdf" || name.endsWith(".pdf");

  if (!isPdf) {
    return {
      valid: false,
      error: `Invalid file format (${file.name}). The Notes Library strictly accepts PDF documents only.`,
    };
  }

  if (file.size > MAX_NOTES_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds limit (${formatFileSize(file.size)}). Maximum allowed note size is 15 MB.`,
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: `File is empty (${file.name}). Please select a valid PDF document.`,
    };
  }

  return { valid: true };
}

/**
 * Opens or initializes the IndexedDB for notes blobs.
 */
function openNotesDB(): Promise<IDBDatabase | null> {
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
        console.warn("Could not open IndexedDB for notes:", request.error);
        resolve(null);
      };
    } catch (e) {
      console.warn("IndexedDB notes initialization error:", e);
      resolve(null);
    }
  });
}

/**
 * Stores a PDF Blob in IndexedDB.
 */
export async function saveNotePdfBlob(
  key: string,
  blob: Blob,
  fileName: string
): Promise<boolean> {
  const db = await openNotesDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const record = {
        key,
        blob,
        fileName,
        savedAt: new Date().toISOString(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.error("IndexedDB note put failed:", req.error);
        resolve(false);
      };
    } catch (e) {
      console.error("Error saving PDF to IndexedDB:", e);
      resolve(false);
    }
  });
}

/**
 * Retrieves a PDF Blob from IndexedDB by storage key.
 */
export async function getNotePdfBlob(key: string): Promise<Blob | null> {
  const db = await openNotesDB();
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
      console.warn("Error getting note PDF from IndexedDB:", e);
      resolve(null);
    }
  });
}

/**
 * Deletes a PDF Blob from IndexedDB.
 */
export async function deleteNotePdfBlob(key: string): Promise<boolean> {
  const db = await openNotesDB();
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
 * Triggers a real browser file download for a Blob or DataURL.
 */
export function triggerNoteDownload(blobOrUrl: Blob | string, filename: string) {
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
 * Creates high-fidelity sample SVG-PDF document data URL for pre-seeded notes.
 */
export function createSampleNotePdfDataUrl(
  subjectCode: string,
  subjectName: string,
  unitTitle: string,
  docTitle: string,
  instructor: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="650" height="900" viewBox="0 0 650 900">
    <rect width="650" height="900" fill="#ffffff" />
    <rect width="650" height="90" fill="#292D45" />
    <text x="35" y="40" fill="#ffffff" font-family="Arial, sans-serif" font-size="19" font-weight="bold">UIT RGPV SHIVPURI • ACADEMIC NOTES</text>
    <text x="35" y="65" fill="#E9EAF1" font-family="Arial, sans-serif" font-size="12">Department of Computer Science &amp; Engineering • Semester 1</text>
    
    <rect x="35" y="115" width="85" height="26" rx="4" fill="#635BFF" fill-opacity="0.12" />
    <text x="45" y="133" fill="#635BFF" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${subjectCode}</text>
    <text x="135" y="133" fill="#687086" font-family="Arial, sans-serif" font-size="12" font-weight="600">${subjectName}</text>
    
    <text x="35" y="180" fill="#292D45" font-family="Arial, sans-serif" font-size="20" font-weight="bold">${docTitle}</text>
    <text x="35" y="210" fill="#0D9488" font-family="Arial, sans-serif" font-size="13" font-weight="bold">${unitTitle}</text>
    <line x1="35" y1="230" x2="615" y2="230" stroke="#E9EAF1" stroke-width="2" />
    
    <text x="35" y="260" fill="#687086" font-family="Arial, sans-serif" font-size="12" font-weight="bold">LECTURE REFERENCE &amp; REVISION NOTES</text>
    <text x="35" y="285" fill="#292D45" font-family="Arial, sans-serif" font-size="13">Prepared by: ${instructor}</text>
    
    <rect x="35" y="320" width="580" height="480" rx="8" fill="#F7F8FC" stroke="#E9EAF1" />
    <text x="55" y="360" fill="#292D45" font-family="Arial, sans-serif" font-size="14" font-weight="bold">1. Learning Objectives</text>
    <text x="55" y="390" fill="#687086" font-family="Arial, sans-serif" font-size="12">• Thorough understanding of fundamental definitions, theorems, and derivations.</text>
    <text x="55" y="415" fill="#687086" font-family="Arial, sans-serif" font-size="12">• Key technical derivations with step-by-step mathematical proofs.</text>
    <text x="55" y="440" fill="#687086" font-family="Arial, sans-serif" font-size="12">• Practice numerical problems according to RGPV examination pattern.</text>
    
    <text x="55" y="490" fill="#292D45" font-family="Arial, sans-serif" font-size="14" font-weight="bold">2. Syllabus Topic Breakdown</text>
    <text x="55" y="520" fill="#687086" font-family="Arial, sans-serif" font-size="12">This document covers all essential sub-topics under ${unitTitle}.</text>
    <text x="55" y="545" fill="#687086" font-family="Arial, sans-serif" font-size="12">Students are advised to review the highlighted formulae and case examples.</text>
    
    <rect x="55" y="580" width="540" height="180" rx="6" fill="#ffffff" stroke="#635BFF" stroke-width="1.2" stroke-dasharray="3" />
    <text x="180" y="675" fill="#635BFF" font-family="Arial, sans-serif" font-size="13" font-weight="bold">[ Full Course Text, Schematics &amp; Numerical Solutions ]</text>
    
    <text x="35" y="850" fill="#687086" font-family="Arial, sans-serif" font-size="11">CampusIQ Academic Workspace • UIT RGPV Shivpuri • Published Official Notes</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
