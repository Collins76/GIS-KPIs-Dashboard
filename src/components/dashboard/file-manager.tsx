
"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp, List, Trash2, RotateCcw, LayoutGrid, FolderOpen, Link, Eye, Share2, Download, Search, File as FileIcon, Image as ImageIcon, FileText, FileSpreadsheet, Folder, UploadCloud, Hourglass, CheckCircle, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';


type ManagedFile = {
  id: string;
  name: string;
  size: number; // Store size in bytes for accurate calculation
  type: string;
  file?: File;
  url?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  uploadedAt: Date;
};

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-10 w-10 text-purple-400" />;
    if (fileType === 'application/pdf') return <FileText className="h-10 w-10 text-red-400" />;
    if (fileType.includes('spreadsheet') || fileType.includes('csv')) return <FileSpreadsheet className="h-10 w-10 text-green-400" />;
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return <FileIcon className="h-10 w-10 text-orange-400" />;
    if (['application/octet-stream', 'application/x-zip-compressed', 'application/vnd.google-earth.kml+xml'].includes(fileType)) return <Folder className="h-10 w-10 text-yellow-400"/>
    return <FileIcon className="h-10 w-10 text-gray-400" />;
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
  const [isUrlModalOpen, setUrlModalOpen] = useState(false);
  const [urlToUpload, setUrlToUpload] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<ManagedFile[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');


  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles: ManagedFile[] = Array.from(files).map(file => ({
        id: `${file.name}-${file.lastModified}-${file.size}-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        progress: 0,
        status: 'pending',
        uploadedAt: new Date(),
    }));

    // Simulate upload and set status to completed
    const completedFiles = newFiles.map(f => ({...f, status: 'completed' as 'completed', progress: 100}));

    setUploadedFiles(prev => [...prev, ...completedFiles]);

    toast({
      title: "Files added",
      description: `${files.length} file(s) are ready.`,
    });
  }, [toast]);
  
  const handleUrlSubmit = () => {
    if (!urlToUpload) {
        toast({ title: "URL is empty", description: "Please paste a URL to upload.", variant: "destructive" });
        return;
    }
    
    try {
        const url = new URL(urlToUpload);
        const pathname = url.pathname;
        const fileName = pathname.split('/').pop() || 'file_from_url';

        const extension = fileName.split('.').pop()?.toLowerCase();
        let fileType = 'application/octet-stream'; // Default
        if (extension) {
            const types: { [key: string]: string } = {
                'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif',
                'pdf': 'application/pdf', 'csv': 'text/csv',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'ppt': 'application/vnd.ms-powerpoint',
                'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'shp': 'application/octet-stream', // SHP is complex, often a zip. octet-stream is safe.
                'kml': 'application/vnd.google-earth.kml+xml',
                'kmz': 'application/vnd.google-earth.kmz',
                'gdb': 'application/octet-stream', // GDB is a folder, often zipped.
            };
            fileType = types[extension] || 'application/octet-stream';
        }

        const newFile: ManagedFile = {
            id: `${fileName}-${Date.now()}-${Math.random()}`,
            name: fileName,
            size: Math.floor(Math.random() * 10000000) + 100000,
            type: fileType,
            url: urlToUpload,
            progress: 100,
            status: 'completed',
            uploadedAt: new Date(),
        };

        setUploadedFiles(prev => [...prev, newFile]);
        toast({
          title: "URL processed",
          description: `${fileName} has been added to the list.`,
        });

    } catch (error) {
        toast({ title: "Invalid URL", description: "Please enter a valid URL.", variant: "destructive" });
    }

    setUrlToUpload('');
    setUrlModalOpen(false);
  };
  
  const clearAllFiles = () => {
    setUploadedFiles([]);
     toast({
      title: "All files cleared",
      description: `The file list has been emptied.`,
    });
  }
  
  const handleReset = () => {
    clearAllFiles();
    toast({
      title: "File Manager Reset",
      description: "All files, filters, and sorting have been reset.",
    });
  };

  const showAllFiles = () => {
    toast({
      title: "Showing All Files",
      description: "Filters have been reset to show all uploaded files.",
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };
  
  const viewFile = (file: ManagedFile) => {
    if (file.url) {
        window.open(file.url, '_blank');
    } else if (file.file && file.file.size > 0) {
        const fileUrl = URL.createObjectURL(file.file);
        window.open(fileUrl, '_blank');
    } else {
        toast({
            title: "Preview not available",
            description: "This file does not have a valid source to preview.",
            variant: "destructive",
        });
    }
  };

  const downloadFile = (file: ManagedFile) => {
    const link = document.createElement('a');
    link.download = file.name;
    if (file.url) {
        link.href = file.url;
        link.target = '_blank';
    } else if (file.file) {
        link.href = URL.createObjectURL(file.file);
    } else {
        toast({
            title: "Download not available",
            description: "No file source to download.",
            variant: "destructive"
        });
        return;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBrowseClick = () => {
      fileInputRef.current?.click();
  }

  const handleUrlModalOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation(); 
      setUrlModalOpen(true);
  }

  const FileItem = ({ file }: { file: ManagedFile }) => (
     <Card className={cn("glow-container p-3 flex items-center gap-4", { 'flex-col text-center': viewMode === 'grid' })}>
        <div className={cn("flex-grow overflow-hidden w-full", {'flex flex-col items-center': viewMode === 'grid' })}>
            {getFileIcon(file.type)}
            <p className="font-semibold text-sm truncate text-white mt-2">{file.name}</p>
            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
        </div>
        <div className={cn("flex items-center gap-2", { 'mt-4': viewMode === 'grid' })}>
            <Button onClick={() => viewFile(file)} variant="ghost" size="icon" className="text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all transform hover:scale-110">
                <Eye className="h-5 w-5 glow-text-blue animate-pulse-glow"/>
            </Button>
            <Button onClick={() => downloadFile(file)} variant="ghost" size="icon" className="text-green-400 hover:bg-green-500/10 hover:text-green-300 transition-all transform hover:scale-110">
                <Download className="h-5 w-5 glow-text-green animate-pulse-glow"/>
            </Button>
            <Button onClick={() => removeFile(file.id)} variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 hover:text-red-300 transition-all transform hover:scale-110">
                <Trash2 className="h-5 w-5 glow-text-yellow animate-pulse-glow"/>
            </Button>
        </div>
    </Card>
  );

  const fileStats = useMemo(() => {
      const totalFiles = uploadedFiles.length;
      const totalSize = uploadedFiles.reduce((acc, file) => acc + file.size, 0);
      const uploading = uploadedFiles.filter(f => f.status === 'uploading').length;
      const completed = uploadedFiles.filter(f => f.status === 'completed').length;
      return { totalFiles, totalSize, uploading, completed };
  }, [uploadedFiles]);

  const StatCard = ({ icon: Icon, title, value, colorClass }: { icon: React.ElementType, title: string, value: string | number, colorClass: string }) => (
    <div className="kpi-card">
        <div className="flex justify-between items-start">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br ${colorClass} animate-pulse-glow`}>
                <Icon className="text-white text-2xl animate-float" />
            </div>
            <div className='text-right'>
                <p className="text-gray-400 text-sm font-rajdhani">{title}</p>
                <p className="text-2xl font-bold text-white mt-1 font-orbitron">{value}</p>
            </div>
        </div>
    </div>
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragging');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragging');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragging');
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };


  return (
    <>
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white font-orbitron animate-neon-glow flex items-center">
              <Folder className="mr-3 h-8 w-8 text-yellow-400" />
              Advanced File Management
          </h2>
          <div className="flex space-x-2">
            <Button onClick={showAllFiles} className="glow-button !bg-blue-500 hover:!bg-blue-600 animate-pulse-glow"><Eye className="mr-2 h-4 w-4"/>View All Files</Button>
            <Button onClick={clearAllFiles} className="glow-button !bg-red-500 hover:!bg-red-600 animate-pulse-glow"><Trash2 className="mr-2 h-4 w-4"/>Clear All</Button>
            <Button onClick={handleReset} className="glow-button !bg-gray-500 hover:!bg-gray-600 animate-pulse-glow"><RotateCcw className="mr-2 h-4 w-4"/>Reset</Button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard icon={FileIcon} title="Total Files" value={fileStats.totalFiles} colorClass="from-blue-400 to-blue-600" />
          <StatCard icon={Database} title="Total Size" value={formatFileSize(fileStats.totalSize)} colorClass="from-indigo-400 to-indigo-600" />
          <StatCard icon={Hourglass} title="Uploading" value={fileStats.uploading} colorClass="from-yellow-400 to-yellow-600" />
          <StatCard icon={CheckCircle} title="Completed" value={fileStats.completed} colorClass="from-green-400 to-green-600" />
      </div>

      <div className="filter-section mb-6 !p-4 !rounded-lg flex items-center gap-4">
        <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-semibold">Filter by Type:</label>
            <Select defaultValue="All Types">
                <SelectTrigger className="glow-input w-40 text-sm">
                    <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white border-yellow-400">
                    <SelectItem value="All Types">All Types</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="XLSX">XLSX</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Image">Image</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm font-semibold">Sort by:</label>
             <Select defaultValue="Newest First">
                <SelectTrigger className="glow-input w-40 text-sm">
                    <SelectValue placeholder="Newest First" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white border-yellow-400">
                    <SelectItem value="Newest First">Newest First</SelectItem>
                    <SelectItem value="Oldest First">Oldest First</SelectItem>
                    <SelectItem value="Size (Asc)">Size (Asc)</SelectItem>
                    <SelectItem value="Size (Desc)">Size (Desc)</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Button variant="outline" className="glow-input" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4"/>
            Reset Filters
        </Button>
      </div>

      <Card className="glow-container p-0">
        <CardContent className="p-6">
          <div
            className="upload-area"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
              <div className="text-center">
                  <UploadCloud className="mx-auto h-20 w-20 text-yellow-400 mb-6 animate-float" />
                  <h3 className="text-2xl font-bold text-white mb-4 font-orbitron">Upload Your Files</h3>
                  <p className="text-white text-lg mb-2">Drag and drop files here or click to browse</p>
                  <p className="text-gray-400 text-sm mb-4">Maximum file size: 500MB per file</p>
                  
                  <div className="flex justify-center flex-wrap gap-2 mb-6 max-w-lg mx-auto">
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
                    onChange={(e) => handleFiles(e.target.files)}
                  />

                  <div className="flex justify-center space-x-4">
                      <Button onClick={handleBrowseClick} className="glow-button text-lg px-8 py-3 !bg-yellow-500 hover:!bg-yellow-600">
                          <FolderOpen className="mr-2 h-5 w-5" />Browse Files
                      </Button>
                       <Button onClick={(e) => handleUrlModalOpen(e)} className="glow-button text-lg px-8 py-3 !bg-teal-500 hover:!bg-teal-600">
                          <Link className="mr-2 h-5 w-5" />Upload from URL
                      </Button>
                  </div>
              </div>
          </div>
        </CardContent>
      </Card>
      
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
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
                <div className={cn("gap-4", viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'space-y-3')}>
                    {uploadedFiles.map(file => (
                        <FileItem key={file.id} file={file} />
                    ))}
                </div>
            </div>
        </div>
      )}
      <Dialog open={isUrlModalOpen} onOpenChange={setUrlModalOpen}>
        <DialogContent className="glow-modal">
            <DialogHeader>
                <DialogTitle>Upload from URL</DialogTitle>
                <DialogDescription>
                    Enter a direct link to a file you want to upload.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="url" className="text-right">File URL</Label>
                <Input
                    id="url"
                    value={urlToUpload}
                    onChange={(e) => setUrlToUpload(e.target.value)}
                    className="glow-input mt-2"
                    placeholder="https://example.com/file.csv"
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setUrlModalOpen(false)}>Cancel</Button>
                <Button className="glow-button" onClick={handleUrlSubmit}>Upload</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    