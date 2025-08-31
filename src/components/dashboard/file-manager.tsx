"use client"

import { useState } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { files as initialFiles } from '@/lib/data';
import type { ManagedFile } from '@/lib/types';
import { Upload, Download, Eye, X, File as FileIcon, FileText, Image as ImageIcon, Sheet, Database, Presentation, FileUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function FileManager() {
  const [files, setFiles] = useState<ManagedFile[]>(initialFiles);
  const [selectedFile, setSelectedFile] = useState<ManagedFile | null>(null);
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handlePreview = (file: ManagedFile) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };
  
  const handleUpload = () => {
    // Mock upload
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setUploadProgress(null);
           // Add a new mock file
          const newFile: ManagedFile = {
            id: `file${files.length + 1}`,
            name: 'newly_uploaded.csv',
            type: 'CSV',
            size: `${(Math.random() * 5).toFixed(1)} MB`,
            uploadedAt: new Date().toISOString().split('T')[0],
            url: '#',
          };
          setFiles(prevFiles => [newFile, ...prevFiles]);
          return null;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getFileIcon = (type: ManagedFile['type']) => {
    switch (type) {
      case 'CSV': return <FileText className="h-5 w-5 text-green-500" />;
      case 'Excel': return <Sheet className="h-5 w-5 text-green-500" />;
      case 'PDF': return <FileText className="h-5 w-5 text-red-500" />;
      case 'Image': return <ImageIcon className="h-5 w-5 text-blue-500" />;
      case 'GIS': return <Database className="h-5 w-5 text-purple-500" />;
      case 'Word': return <FileText className="h-5 w-5 text-blue-700" />;
      case 'PowerPoint': return <Presentation className="h-5 w-5 text-orange-500" />;
      default: return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };


  return (
    <Card className="card-glow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-glow">File Management</CardTitle>
        <Button onClick={handleUpload} disabled={uploadProgress !== null}>
           <FileUp className="h-4 w-4 mr-2" /> Upload File
        </Button>
      </CardHeader>
      <CardContent>
         {uploadProgress !== null && (
          <div className="mb-4">
            <p className="text-sm mb-2">Uploading...</p>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map(file => (
              <TableRow key={file.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  {getFileIcon(file.type)}
                  {file.name}
                </TableCell>
                <TableCell>{file.type}</TableCell>
                <TableCell>{file.size}</TableCell>
                <TableCell>{file.uploadedAt}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handlePreview(file)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={file.url} download={file.name}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isPreviewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{selectedFile?.name}</DialogTitle>
              <DialogDescription>
                File Type: {selectedFile?.type} | Size: {selectedFile?.size}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedFile?.type === 'Image' ? (
                <div className="relative aspect-video w-full">
                  <Image
                    src={selectedFile.url}
                    alt={selectedFile.name}
                    fill
                    className="rounded-md object-cover"
                    data-ai-hint="substation"
                  />
                </div>
              ) : (
                 <div className="flex flex-col items-center justify-center h-48 bg-muted rounded-md p-4">
                    {selectedFile && getFileIcon(selectedFile.type)}
                    <p className="mt-4 text-center text-muted-foreground">Preview not available for this file type.</p>
                    <p className="text-center text-xs text-muted-foreground">You can download the file to view it.</p>
                 </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
}
