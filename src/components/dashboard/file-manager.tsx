
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
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  uploadedAt: Date;
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
    // In a real app, you would handle the URL upload logic here (e.g., fetch and process the file)
    toast({ title: "URL submitted", description: `Processing: ${urlToUpload}` });
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
    // Here you would also reset filters and sorting
    toast({
      title: "File Manager Reset",
      description: "All files, filters, and sorting have been reset.",
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };


 const handleBrowseClick = () => {
      fileInputRef.current?.click();
  }

  const handleUrlModalOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation(); 
      setUrlModalOpen(true);
  }

  const FileItem = ({ file, onRemove }: { file: ManagedFile, onRemove: (id: string) => void }) => (
     <Card className={cn("glow-container p-3 flex items-center gap-4", { 'flex-col text-center': viewMode === 'grid' })}>
        {getFileIcon(file.type)}
        <div className="flex-grow overflow-hidden">
            <p className="font-semibold text-sm truncate text-white">{file.name}</p>
            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
        </div>
        <Button onClick={() => onRemove(file.id)} variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10">
            <Trash2 className="h-4 w-4"/>
        </Button>
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
            <Button onClick={handleReset} className="glow-button !bg-blue-500 hover:!bg-blue-600 animate-pulse-glow"><Eye className="mr-2 h-4 w-4"/>View All Files</Button>
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
                        <FileItem key={file.id} file={file} onRemove={removeFile} />
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

    