import { Document } from '../types';
import Badge from './Badge';
import Button from './Button';
import { formatDateTime, formatStatus } from '../utils/formatters';

interface DocumentListProps {
  documents: Document[];
  onDownload: (id: string) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export default function DocumentList({
  documents,
  onDownload,
  onDelete,
  loading = false,
}: DocumentListProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-shrink-0">
              <svg
                className="h-10 w-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="info" size="sm">
                  {formatStatus(doc.type)}
                </Badge>
                <span className="text-xs text-gray-500">{formatDateTime(doc.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Button size="sm" variant="primary" onClick={() => onDownload(doc.id)}>
              Download
            </Button>
            {onDelete && (
              <Button size="sm" variant="danger" onClick={() => onDelete(doc.id)}>
                Delete
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
