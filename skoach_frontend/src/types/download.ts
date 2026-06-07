// types/download.ts
export type DownloadModalType = 'GENERAL_SCRIPT' | 'PRONUNCIATION_COACH';

export interface DownloadModalProps {
  isOpen: boolean;
  type: DownloadModalType;
  onClose: () => void;
  onDownload: (format: 'DOCX' | 'PDF') => void; 
}