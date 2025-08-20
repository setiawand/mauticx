"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, AlertCircle, CheckCircle, X, Download } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadResult {
  message: string;
  created_count: number;
  error_count: number;
  errors: string[];
}

interface PreviewData {
  headers: string[];
  rows: any[][];
  totalRows: number;
}

export function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      setError('Please select a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploadResult(null);
    
    // Preview file content
    previewFile(selectedFile);
  };

  const previewFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.toLowerCase().endsWith('.csv')) {
          // Parse CSV
          const lines = content.split('\n').filter(line => line.trim());
          if (lines.length === 0) {
            setError('File is empty');
            return;
          }
          
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const rows = lines.slice(1, 6).map(line => 
            line.split(',').map(cell => cell.trim().replace(/"/g, ''))
          );
          
          setPreviewData({
            headers,
            rows,
            totalRows: lines.length - 1
          });
        } else {
          // For Excel files, we'll show a generic preview
          setPreviewData({
            headers: ['Preview not available for Excel files'],
            rows: [['Upload to see content']],
            totalRows: 0
          });
        }
      } catch (err) {
        setError('Error reading file. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/contacts/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
      
      const result = await response.json() as UploadResult;
      setUploadResult(result);
      
      // Call onSuccess after a short delay to show the result
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData(null);
    setUploadResult(null);
    setError(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent = "email,first_name,last_name,phone,company,tags\njohn@example.com,John,Doe,+1234567890,Acme Corp,customer\njane@example.com,Jane,Smith,,Tech Inc,lead";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to add multiple contacts at once.
          </DialogDescription>
        </DialogHeader>

        {/* Template Download Section */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Download Template</h3>
          <p className="text-sm text-blue-700 mb-3">
            Download a template file to see the required format for bulk upload.
          </p>
          <div className="flex gap-2">
            <a
              href="/contacts_template.csv"
              download="contacts_template.csv"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV Template
            </a>
            <a
              href="/contacts_template.xlsx"
              download="contacts_template.xlsx"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-white border border-green-300 rounded-md hover:bg-green-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel Template
            </a>
          </div>
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="hidden"
              />
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    Choose File
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </p>
              </div>
            </div>
          </div>

          {/* Selected File Info */}
          {file && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-sm text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setPreviewData(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* File Preview */}
          {previewData && (
            <div className="space-y-2">
              <Label>Preview ({previewData.totalRows} rows)</Label>
              <div className="border rounded-lg overflow-hidden max-h-80">
                <div className="overflow-auto">
                  <table className="w-full text-sm table-fixed">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {previewData.headers.map((header, index) => (
                          <th key={index} className="px-3 py-2 text-left font-medium text-gray-700 truncate" style={{width: `${100/previewData.headers.length}%`}}>
                            <div className="truncate" title={header}>
                              {header}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t hover:bg-gray-50">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-3 py-2 text-gray-600 truncate" style={{width: `${100/previewData.headers.length}%`}}>
                              <div className="truncate" title={cell || '-'}>
                                {cell || '-'}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.totalRows > 5 && (
                  <div className="px-3 py-2 bg-gray-50 text-sm text-gray-500 text-center border-t">
                    ... and {previewData.totalRows - 5} more rows
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <Label>Uploading...</Label>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-500 text-center">{uploadProgress}%</p>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-1">
                  <p className="font-medium">{uploadResult.message}</p>
                  <p className="text-sm">
                    Created: {uploadResult.created_count} contacts
                    {uploadResult.error_count > 0 && (
                      <span className="text-orange-600">
                        {' '}• Errors: {uploadResult.error_count}
                      </span>
                    )}
                  </p>
                  {uploadResult.errors.length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-orange-600 hover:text-orange-800">
                        View errors ({uploadResult.errors.length})
                      </summary>
                      <ul className="mt-1 space-y-1 text-orange-700">
                        {uploadResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {uploadResult ? 'Close' : 'Cancel'}
          </Button>
          {!uploadResult && (
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="min-w-[100px]"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}