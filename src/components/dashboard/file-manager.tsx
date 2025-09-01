
"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileUp, List, Trash2, RotateCcw, LayoutGrid, Undo, FolderOpen, Link, Pencil, Download, Eye, Search, File as FileIcon, Image as ImageIcon, FileText, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ManagedFile = {
  id: string;
  name: string;
  size: string;
  type: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
};

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-purple-400" />;
    if (fileType === 'application/pdf') return <FileText className="h-8 w-8 text-red-400" />;
    if (fileType.includes('spreadsheet') || fileType.includes('csv')) return <FileSpreadsheet className="h-8 w-8 text-green-400" />;
    return <FileIcon className="h-8 w-8 text-gray-400" />;
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FileManager() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);
  const [isUrlModalOpen, setUrlModalOpen] = useState(false);
  const [urlToUpload, setUrlToUpload] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<ManagedFile[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');


  const handleFiles = useCallback((files: FileList) => {
    const newFiles: ManagedFile[] = Array.from(files).map(file => ({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        file: file,
        progress: 0,
        status: 'pending',
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    toast({
      title: "Files added",
      description: `${files.length} file(s) are ready for upload.`,
    });
  }, [toast]);
  
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };


  useEffect(() => {
    const uploadArea = uploadAreaRef.current;
    if (!uploadArea) return;

    const dragOverHandler = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('dragging');
    };
    const dragLeaveHandler = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('dragging');
    };
    const dropHandler = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('dragging');
        if (e.dataTransfer?.files) {
            handleFiles(e.dataTransfer.files);
            if(fileInputRef.current) {
              fileInputRef.current.files = e.dataTransfer.files;
            }
        }
    };
    
    uploadArea.addEventListener('dragover', dragOverHandler);
    uploadArea.addEventListener('dragleave', dragLeaveHandler);
    uploadArea.addEventListener('drop', dropHandler);
    
    return () => {
        uploadArea.removeEventListener('dragover', dragOverHandler);
        uploadArea.removeEventListener('dragleave', dragLeaveHandler);
        uploadArea.removeEventListener('drop', dropHandler);
    };
  }, [handleFiles]);


  useEffect(() => {
    const fileInput = fileInputRef.current;
    if (!fileInput) return;

    const fileSelectHandler = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files) {
            handleFiles(target.files);
        }
    };
    
    fileInput.addEventListener('change', fileSelectHandler);
    
    return () => {
        if (fileInput) {
            fileInput.removeEventListener('change', fileSelectHandler);
        }
    };
  }, [handleFiles]);

  const handleBrowseClick = () => {
      fileInputRef.current?.click();
  }

  const FileItem = ({ file, onRemove }: { file: ManagedFile, onRemove: (id: string) => void }) => (
     <Card className={cn("glow-container p-3 flex items-center gap-4", { 'flex-col text-center': viewMode === 'grid' })}>
        {getFileIcon(file.type)}
        <div className="flex-grow overflow-hidden">
            <p className="font-semibold text-sm truncate text-white">{file.name}</p>
            <p className="text-xs text-gray-400">{file.size}</p>
        </div>
        <Button onClick={() => onRemove(file.id)} variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10">
            <Trash2 className="h-4 w-4"/>
        </Button>
    </Card>
  );

  return (
    <>
      <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white font-orbitron animate-neon-glow">
              📁 Advanced File Management 📁
          </h2>
      </div>

      <Card className="glow-container p-6 mb-8">
        <CardContent className="p-0">
          <div className="upload-area" ref={uploadAreaRef}>
              <div className="text-center">
                  <FileUp className="mx-auto h-20 w-20 text-yellow-400 mb-6 animate-float" />
                  <h3 className="text-2xl font-bold text-white mb-4 font-orbitron">Upload Your Files</h3>
                  <p className="text-white text-lg mb-2">Drag and drop files here or click the button below</p>
                  <p className="text-gray-400 text-sm mb-4">Maximum file size: 500MB per file</p>
                  
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-6 max-w-lg mx-auto">
                      <div className="bg-blue-500 bg-opacity-20 text-blue-400 px-2 py-1 rounded text-xs font-semibold">CSV</div>
                      <div className="bg-green-500 bg-opacity-20 text-green-400 px-2 py-1 rounded text-xs font-semibold">XLSX</div>
                      <div className="bg-red-500 bg-opacity-20 text-red-400 px-2 py-1 rounded text-xs font-semibold">PDF</div>
                      <div className="bg-purple-500 bg-opacity-20 text-purple-400 px-2 py-1 rounded text-xs font-semibold">JPG</div>
                      <div className="bg-indigo-500 bg-opacity-20 text-indigo-400 px-2 py-1 rounded text-xs font-semibold">PNG</div>
                      <div className="bg-yellow-500 bg-opacity-20 text-yellow-400 px-2 py-1 rounded text-xs font-semibold">DOCX</div>
                      <div className="bg-teal-500 bg-opacity-20 text-teal-400 px-2 py-1 rounded text-xs font-semibold">SHP</div>
                      <div className="bg-cyan-500 bg-opacity-20 text-cyan-400 px-2 py-1 rounded text-xs font-semibold">KML</div>
                  </div>
                  
                  <Input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept=".csv,.xlsx,.pdf,.jpg,.jpeg,.png,.docx,.doc,.shp,.gdb,.ppt,.pptx,.kmz,.kml" 
                  />

                  <div className="flex justify-center space-x-4">
                      <Button onClick={handleBrowseClick} className="glow-button text-lg px-8 py-3">
                          <FolderOpen className="mr-2 h-5 w-5" />Browse Files
                      </Button>
                  </div>
              </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white font-orbitron">Uploaded Files ({uploadedFiles.length})</h3>
          <div className="flex space-x-2">
              <Button onClick={() => setViewMode('grid')} id="gridViewBtn" className={cn(viewMode === 'grid' ? "bg-yellow-500 text-white" : "bg-gray-600 text-white")} variant="outline" size="icon">
                  <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button onClick={() => setViewMode('list')} id="listViewBtn" className={cn(viewMode === 'list' ? "bg-yellow-500 text-white" : "bg-gray-600 text-white")} variant="outline" size="icon">
                  <List className="h-5 w-5" />
              </Button>
          </div>
      </div>

       <div id="uploadedFiles">
         {uploadedFiles.length > 0 ? (
            <div className={cn("gap-4", viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3')}>
               {uploadedFiles.map(file => (
                  <FileItem key={file.id} file={file} onRemove={removeFile} />
                ))}
            </div>
         ) : (
            <div id="noFilesPlaceholder" className="text-center py-16 flex flex-col items-center">
                <FolderOpen className="mx-auto h-24 w-24 text-gray-600 mb-6" />
                <p className="text-gray-400 text-xl mb-4">No files uploaded yet</p>
                <Button onClick={handleBrowseClick} className="glow-button">
                    <FileUp className="mr-2 h-4 w-4" />Upload Your First File
                </Button>
            </div>
         )}
      </div>
    </>
  );
}
