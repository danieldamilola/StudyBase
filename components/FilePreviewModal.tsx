'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Download, X, AlertCircle } from 'lucide-react';
import { FileItem } from '@/utils/mockData';

interface FilePreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
}

export function FilePreviewModal({ file, isOpen, onClose, onDownload }: FilePreviewModalProps) {
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string>('');

  useEffect(() => {
    if (file && isOpen) {
      loadPreview(file);
    }
  }, [file, isOpen]);

  const loadPreview = async (fileItem: FileItem) => {
    setIsLoadingPreview(true);
    setPreviewError('');
    setFileContent('');

    if (!fileItem.file_url) {
      setPreviewError('File URL not available');
      setIsLoadingPreview(false);
      return;
    }

    try {
      // PDF preview using embed
      if (fileItem.fileType === 'PDF') {
        setFileContent('PDF_EMBED');
      }
      // DOCX and PPTX preview using Microsoft Office Online
      else if (['DOCX', 'DOC'].includes(fileItem.fileType)) {
        setFileContent('DOCX_EMBED');
      }
      else if (['PPTX', 'PPT'].includes(fileItem.fileType)) {
        setFileContent('PPTX_EMBED');
      }
      // Image preview
      else if (['JPG', 'JPEG', 'PNG', 'GIF'].includes(fileItem.fileType)) {
        setFileContent('IMAGE');
      }
      // Text file preview
      else if (['TXT', 'CSV'].includes(fileItem.fileType)) {
        const response = await fetch(fileItem.file_url);
        if (!response.ok) throw new Error('Failed to load file');
        const text = await response.text();
        // Limit text preview to first 5000 characters
        setFileContent(text.substring(0, 5000));
      }
      else {
        setPreviewError(`Preview not available for ${fileItem.fileType} files. Use download to view.`);
      }
    } catch (error) {
      setPreviewError('Could not load file preview. Try downloading instead.');
      console.error('Preview error:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  if (!file) return null;

  const handleDownload = () => {
    onDownload(file);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl text-foreground">{file.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{file.courseCode} • {file.fileType}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Area */}
          <div className="border border-border rounded-lg bg-muted/30 min-h-[400px] flex items-center justify-center overflow-auto relative">
            {isLoadingPreview ? (
              <div className="text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p>Loading preview...</p>
              </div>
            ) : previewError ? (
              <div className="text-center p-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">{previewError}</p>
              </div>
            ) : fileContent === 'IMAGE' ? (
              <img
                src={file.file_url}
                alt={file.title}
                className="max-w-full max-h-[500px] object-contain"
              />
            ) : fileContent === 'PDF_EMBED' ? (
              <embed
                src={file.file_url}
                type="application/pdf"
                className="w-full h-[500px]"
              />
            ) : fileContent === 'DOCX_EMBED' ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.file_url || '')}`}
                className="w-full h-[500px] border-0"
                title={file.title}
              />
            ) : fileContent === 'PPTX_EMBED' ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.file_url || '')}`}
                className="w-full h-[500px] border-0"
                title={file.title}
              />
            ) : fileContent ? (
              <pre className="p-6 text-sm text-foreground whitespace-pre-wrap break-words font-mono w-full overflow-auto max-h-[500px] bg-card">
                {fileContent}
              </pre>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>No preview available</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              onClick={handleDownload}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 border-border hover:bg-muted text-foreground"
            >
              <X className="w-4 h-4" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
