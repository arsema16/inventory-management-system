import { useState, useRef, ChangeEvent } from 'react';
import Button from './Button';
import { formatFileSize } from '../utils/formatters';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  acceptedTypes?: string;
  maxSize?: number; // in bytes
  label?: string;
  helperText?: string;
}

export default function FileUpload({
  onUpload,
  acceptedTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif',
  maxSize = 10 * 1024 * 1024, // 10MB default
  label = 'Upload Document',
  helperText = 'Accepted: PDF, DOC, DOCX, Images (max 10MB)',
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size exceeds ${formatFileSize(maxSize)}`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError('');
      await onUpload(selectedFile);
      
      // Reset after successful upload
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        {selectedFile && (
          <>
            <Button onClick={handleUpload} loading={uploading} size="sm">
              Upload
            </Button>
            <Button onClick={handleClear} variant="secondary" size="sm" disabled={uploading}>
              Clear
            </Button>
          </>
        )}
      </div>

      {selectedFile && (
        <div className="mt-2 text-sm text-gray-600">
          Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {helperText && !error && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
