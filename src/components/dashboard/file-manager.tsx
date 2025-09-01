
"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileUp, List, Trash2, RotateCcw, LayoutGrid, Undo, FolderOpen, Link, Pencil, Download, Eye, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Helper to safely call window functions
const callWindowFunc = (funcName: keyof Window, ...args: any[]) => {
  if (typeof window !== 'undefined' && typeof window[funcName] === 'function') {
    (window[funcName] as Function)(...args);
  } else {
    // console.warn(`${funcName} function not available on window object.`);
  }
};


export default function FileManager() {
  const [isUrlModalOpen, setUrlModalOpen] = useState(false);
  const { toast } = useToast();

  const handleUrlUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const urlInput = form.elements.namedItem('fileUrl') as HTMLInputElement;
    const url = urlInput.value;
    if (url) {
        console.log("Uploading from URL:", url);
        toast({
            title: "Upload Started",
            description: `File from ${url} is being uploaded.`,
        });
        setUrlModalOpen(false);
    }
  };

  useEffect(() => {
    // This logic is moved from the old upload.js to ensure it runs after the component mounts.
    const initializeUploadArea = () => {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;

        if (!uploadArea || !fileInput) {
            console.error("Upload area or file input not found!");
            return;
        }

        const handleFiles = (files: FileList) => {
            // Placeholder for file handling logic that was in upload.js
            console.log(`${files.length} files selected.`);
            toast({
              title: "Files selected",
              description: `${files.length} files are ready for upload.`,
            });
            // You can add file processing, state updates, and UI rendering here.
        };

        const clickHandler = () => fileInput.click();
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
            }
        };
        const fileSelectHandler = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.files) {
                handleFiles(target.files);
            }
        };
        
        // We use a direct click handler on the upload area instead of a global one.
        uploadArea.addEventListener('click', clickHandler);
        uploadArea.addEventListener('dragover', dragOverHandler);
        uploadArea.addEventListener('dragleave', dragLeaveHandler);
        uploadArea.addEventListener('drop', dropHandler);
        fileInput.addEventListener('change', fileSelectHandler);

        window.triggerBrowseFiles = () => fileInput.click();
        
        // Cleanup function to remove event listeners
        return () => {
            uploadArea.removeEventListener('click', clickHandler);
            uploadArea.removeEventListener('dragover', dragOverHandler);
            uploadArea.removeEventListener('dragleave', dragLeaveHandler);
            uploadArea.removeEventListener('drop', dropHandler);
            fileInput.removeEventListener('change', fileSelectHandler);
        };
    };

    const cleanup = initializeUploadArea();

    return cleanup;
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white font-orbitron animate-neon-glow">
              📁 Advanced File Management 📁
          </h2>
          <div className="flex items-center space-x-2">
              <Button onClick={() => callWindowFunc('showAllFiles')} className="glow-button">
                  <List className="mr-2 h-4 w-4" />View All Files
              </Button>
              <Button onClick={(e) => callWindowFunc('editSelectedFile', e)} variant="outline" className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black">
                  <Pencil className="mr-2 h-4 w-4" />Edit
              </Button>
               <Button onClick={(e) => callWindowFunc('deleteSelectedFile', e)} variant="outline" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                  <Trash2 className="mr-2 h-4 w-4" />Delete
              </Button>
              <div className="border-l h-8 border-gray-600 mx-2"></div>
              <Button onClick={() => callWindowFunc('clearAllFiles')} variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />Clear All
              </Button>
              <Button onClick={() => callWindowFunc('resetUploadArea')} variant="secondary">
                  <RotateCcw className="mr-2 h-4 w-4" />Reset
              </Button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glow-container p-4 text-center">
              <CardContent className="p-2">
                <div className="text-sm text-gray-400 mb-2">Total Files</div>
                <div className="text-3xl font-bold text-green-400 font-orbitron" id="totalFilesCount">0</div>
              </CardContent>
          </Card>
          <Card className="glow-container p-4 text-center">
               <CardContent className="p-2">
                 <div className="text-sm text-gray-400 mb-2">Total Size</div>
                <div className="text-3xl font-bold text-blue-400 font-orbitron" id="totalSizeCount">0 MB</div>
              </CardContent>
          </Card>
          <Card className="glow-container p-4 text-center">
               <CardContent className="p-2">
                <div className="text-sm text-gray-400 mb-2">Uploading</div>
                <div className="text-3xl font-bold text-yellow-400 font-orbitron" id="uploadingCount">0</div>
              </CardContent>
          </Card>
          <Card className="glow-container p-4 text-center">
               <CardContent className="p-2">
                <div className="text-sm text-gray-400 mb-2">Completed</div>
                <div className="text-3xl font-bold text-purple-400 font-orbitron" id="completedCount">0</div>
              </CardContent>
          </Card>
      </div>

      <Card className="glow-container p-4 mb-6">
        <CardContent className="p-2">
          <div className="flex flex-wrap items-center gap-4">
              <label className="text-yellow-400 font-semibold font-rajdhani">Filter by Type:</label>
              <select id="fileTypeFilter" onChange={() => callWindowFunc('filterFiles')} className="glow-input" style={{ color: 'white', background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
                  <option value="" style={{ background: '#0a0a0a', color: 'white' }}>All Types</option>
                  <option value="csv" style={{ background: '#0a0a0a', color: 'white' }}>CSV Files</option>
                  <option value="xlsx" style={{ background: '#0a0a0a', color: 'white' }}>Excel Files</option>
                  <option value="pdf" style={{ background: '#0a0a0a', color: 'white' }}>PDF Documents</option>
                  <option value="image" style={{ background: '#0a0a0a', color: 'white' }}>Images (JPG, PNG)</option>
                  <option value="doc" style={{ background: '#0a0a0a', color: 'white' }}>Word Documents</option>
                  <option value="gis" style={{ background: '#0a0a0a', color: 'white' }}>GIS Files (SHP, GDB, KML)</option>
                  <option value="presentation" style={{ background: '#0a0a0a', color: 'white' }}>Presentations (PPT, PPTX)</option>
              </select>
              <label className="text-yellow-400 font-semibold font-rajdhani">Sort by:</label>
              <select id="fileSortOrder" onChange={() => callWindowFunc('sortFiles')} className="glow-input" style={{ color: 'white', background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
                  <option value="newest" style={{ background: '#0a0a0a', color: 'white' }}>Newest First</option>
                  <option value="oldest" style={{ background: '#0a0a0a', color: 'white' }}>Oldest First</option>
                  <option value="largest" style={{ background: '#0a0a0a', color: 'white' }}>Largest First</option>
                  <option value="smallest" style={{ background: '#0a0a0a', color: 'white' }}>Smallest First</option>
                  <option value="name" style={{ background: '#0a0a0a', color: 'white' }}>Name (A-Z)</option>
              </select>
              <Button onClick={() => callWindowFunc('resetFileFilters')} variant="secondary">
                  <Undo className="mr-2 h-4 w-4"/>Reset Filters
              </Button>
          </div>
        </CardContent>
      </Card>
      

      <Card className="glow-container p-6 mb-8">
        <CardContent className="p-0">
          <div className="upload-area cursor-pointer" id="uploadArea">
              <div className="text-center">
                  <FileUp className="mx-auto h-20 w-20 text-yellow-400 mb-6 animate-float" />
                  <h3 className="text-2xl font-bold text-white mb-4 font-orbitron">Upload Your Files</h3>
                  <p className="text-white text-lg mb-2">Drag and drop files here or click to browse</p>
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
                  
                  <Input type="file" id="fileInput" className="hidden" multiple accept=".csv,.xlsx,.pdf,.jpg,.jpeg,.png,.docx,.doc,.shp,.gdb,.ppt,.pptx,.kmz,.kml" />
                  <div className="flex justify-center space-x-4">
                      <Button onClick={() => window.triggerBrowseFiles && window.triggerBrowseFiles()} className="glow-button text-lg px-8 py-3">
                          <FolderOpen className="mr-2 h-5 w-5" />Browse Files
                      </Button>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation(); // prevent triggering the upload area's click event
                          setUrlModalOpen(true);
                        }}
                        variant="secondary" 
                        className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white border-blue-700">
                          <Link className="mr-2 h-5 w-5" />Upload from URL
                      </Button>
                  </div>
              </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white font-orbitron">Uploaded Files</h3>
          <div className="flex space-x-2">
              <Button onClick={() => callWindowFunc('toggleFileView','grid')} id="gridViewBtn" className="bg-yellow-500 text-white" variant="outline" size="icon">
                  <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button onClick={() => callWindowFunc('toggleFileView','list')} id="listViewBtn" className="bg-gray-600 text-white" variant="outline" size="icon">
                  <List className="h-5 w-5" />
              </Button>
          </div>
      </div>

      <div id="uploadedFiles">
          {/* Uploaded files will appear here */}
      </div>

      <div id="noFilesPlaceholder" className="text-center py-16 hidden flex-col items-center">
          <FolderOpen className="mx-auto h-24 w-24 text-gray-600 mb-6" />
          <p className="text-gray-400 text-xl mb-4">No files uploaded yet</p>
          <Button onClick={() => window.triggerBrowseFiles && window.triggerBrowseFiles()} className="glow-button">
              <FileUp className="mr-2 h-4 w-4" />Upload Your First File
          </Button>
      </div>

      {isUrlModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glow-modal w-full max-w-md p-6 m-4">
              <h3 className="text-2xl font-bold text-white font-orbitron mb-6 text-center animate-neon-glow">Upload from URL</h3>
              <form onSubmit={handleUrlUpload} className="space-y-4">
                  <div>
                      <Input 
                          type="url" 
                          name="fileUrl"
                          id="fileUrl"
                          placeholder="https://example.com/file.pdf"
                          className="glow-input w-full text-lg h-12"
                          required
                      />
                  </div>
                  <div className="flex space-x-4 pt-2">
                      <Button type="button" onClick={() => setUrlModalOpen(false)} className="flex-1 py-3 text-lg" variant="outline">
                          Cancel
                      </Button>
                      <Button type="submit" className="glow-button flex-1 py-3 text-lg bg-blue-600 hover:bg-blue-700">
                          Upload
                      </Button>
                  </div>
              </form>
          </div>
        </div>
      )}
    </>
  );
}

declare global {
    interface Window {
        showAllFiles: () => void;
        clearAllFiles: () => void;
        resetUploadArea: () => void;
        toggleFileView: (view: 'grid' | 'list') => void;
        filterFiles: () => void;
        sortFiles: () => void;
        resetFileFilters: () => void;
        removeFile: (fileId: string, event?: MouseEvent) => void;
        editFile: (fileId: string, event?: MouseEvent) => void;
        downloadFile: (fileId: string, event?: MouseEvent) => void;
        previewFile: (fileId: string, event?: MouseEvent) => void;
        handleFileSelect: (e: Event) => void;
        createFileDownload: (originalFile: File, fileName: string) => boolean;
        showFilePreviewModal: (file: any) => void;
        closeFilePreviewModal: () => void;
        triggerBrowseFiles: () => void;
        editSelectedFile: (event?: MouseEvent) => void;
        deleteSelectedFile: (event?: MouseEvent) => void;
    }
}
