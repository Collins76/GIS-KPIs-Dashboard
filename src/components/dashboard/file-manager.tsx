
"use client"

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp, List, Trash2, RotateCcw, LayoutGrid, Undo, FolderOpen, Link } from 'lucide-react';

export default function FileManager() {
  
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.initializeUploadArea === 'function') {
      window.initializeUploadArea();
    }
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white font-orbitron animate-neon-glow">
              📁 Advanced File Management 📁
          </h2>
          <div className="flex space-x-4">
              <Button onClick={() => window.showAllFiles?.()} className="glow-button">
                  <List className="mr-2 h-4 w-4" />View All Files
              </Button>
              <Button onClick={() => window.clearAllFiles?.()} variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />Clear All
              </Button>
              <Button onClick={() => window.resetUploadArea?.()} variant="secondary">
                  <RotateCcw className="mr-2 h-4 w-4" />Reset
              </Button>
          </div>
      </div>

      {/* Upload Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glow-container p-4 text-center">
              <CardHeader className="p-2">
                  <CardTitle className="text-sm text-gray-400">Total Files</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="text-3xl font-bold text-green-400 font-orbitron" id="totalFilesCount">0</div>
              </CardContent>
          </Card>
          <Card className="glow-container p-4 text-center">
              <CardHeader className="p-2">
                  <CardTitle className="text-sm text-gray-400">Total Size</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="text-3xl font-bold text-blue-400 font-orbitron" id="totalSizeCount">0 MB</div>
              </CardContent>
          </Card>
          <Card className="glow-container p-4 text-center">
              <CardHeader className="p-2">
                  <CardTitle className="text-sm text-gray-400">Uploading</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="text-3xl font-bold text-yellow-400 font-orbitron" id="uploadingCount">0</div>
              </CardContent>
          </Card>
          <Card className="glow-container p-4 text-center">
              <CardHeader className="p-2">
                  <CardTitle className="text-sm text-gray-400">Completed</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="text-3xl font-bold text-purple-400 font-orbitron" id="completedCount">0</div>
              </CardContent>
          </Card>
      </div>

      {/* File Type Filter */}
      <Card className="glow-container p-4 mb-6">
        <CardContent className="p-2">
          <div className="flex flex-wrap items-center gap-4">
              <label className="text-yellow-400 font-semibold font-rajdhani">Filter by Type:</label>
              <select id="fileTypeFilter" onChange={() => window.filterFiles?.()} className="glow-input" style={{ color: 'white', background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
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
              <select id="fileSortOrder" onChange={() => window.sortFiles?.()} className="glow-input" style={{ color: 'white', background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
                  <option value="newest" style={{ background: '#0a0a0a', color: 'white' }}>Newest First</option>
                  <option value="oldest" style={{ background: '#0a0a0a', color: 'white' }}>Oldest First</option>
                  <option value="largest" style={{ background: '#0a0a0a', color: 'white' }}>Largest First</option>
                  <option value="smallest" style={{ background: '#0a0a0a', color: 'white' }}>Smallest First</option>
                  <option value="name" style={{ background: '#0a0a0a', color: 'white' }}>Name (A-Z)</option>
              </select>
              <Button onClick={() => window.resetFileFilters?.()} variant="secondary">
                  <Undo className="mr-2 h-4 w-4"/>Reset Filters
              </Button>
          </div>
        </CardContent>
      </Card>
      

      {/* Enhanced Upload Area */}
      <Card className="glow-container p-6 mb-8">
        <CardContent className="p-0">
          <div className="upload-area" id="uploadArea">
              <div className="text-center">
                  <FileUp className="mx-auto h-20 w-20 text-yellow-400 mb-6 animate-float" />
                  <h3 className="text-2xl font-bold text-white mb-4 font-orbitron">Upload Your Files</h3>
                  <p className="text-white text-lg mb-2">Drag and drop files here or click to browse</p>
                  <p className="text-gray-400 text-sm mb-4">Maximum file size: 500MB per file</p>
                  
                  {/* Supported formats grid */}
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-6">
                      <div className="bg-blue-500 bg-opacity-20 text-blue-400 px-2 py-1 rounded text-xs font-semibold">CSV</div>
                      <div className="bg-green-500 bg-opacity-20 text-green-400 px-2 py-1 rounded text-xs font-semibold">XLSX</div>
                      <div className="bg-red-500 bg-opacity-20 text-red-400 px-2 py-1 rounded text-xs font-semibold">PDF</div>
                      <div className="bg-purple-500 bg-opacity-20 text-purple-400 px-2 py-1 rounded text-xs font-semibold">JPG</div>
                      <div className="bg-indigo-500 bg-opacity-20 text-indigo-400 px-2 py-1 rounded text-xs font-semibold">PNG</div>
                      <div className="bg-yellow-500 bg-opacity-20 text-yellow-400 px-2 py-1 rounded text-xs font-semibold">DOCX</div>
                      <div className="bg-teal-500 bg-opacity-20 text-teal-400 px-2 py-1 rounded text-xs font-semibold">SHP</div>
                      <div className="bg-cyan-500 bg-opacity-20 text-cyan-400 px-2 py-1 rounded text-xs font-semibold">KML</div>
                  </div>
                  
                  <input type="file" id="fileInput" className="hidden" multiple accept=".csv,.xlsx,.pdf,.jpg,.jpeg,.png,.docx,.doc,.shp,.gdb,.ppt,.pptx,.kmz,.kml" />
                  <div className="flex justify-center space-x-4">
                      <Button onClick={() => window.triggerBrowseFiles?.()} className="glow-button text-lg px-8 py-3">
                          <FolderOpen className="mr-2 h-5 w-5" />Browse Files
                      </Button>
                      <Button onClick={() => window.uploadFromUrl?.()} variant="secondary" className="px-8 py-3 text-lg">
                          <Link className="mr-2 h-5 w-5" />Upload from URL
                      </Button>
                  </div>
              </div>
          </div>
        </CardContent>
      </Card>
      

      {/* Files Grid View */}
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white font-orbitron">Uploaded Files</h3>
          <div className="flex space-x-2">
              <Button onClick={() => window.toggleFileView?.('grid')} id="gridViewBtn" className="bg-yellow-500 text-white" variant="outline" size="icon">
                  <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button onClick={() => window.toggleFileView?.('list')} id="listViewBtn" className="bg-gray-600 text-white" variant="outline" size="icon">
                  <List className="h-5 w-5" />
              </Button>
          </div>
      </div>

      <div id="uploadedFiles" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Uploaded files will appear here */}
      </div>

      {/* No files placeholder */}
      <div id="noFilesPlaceholder" className="text-center py-12 hidden">
          <FolderOpen className="mx-auto h-16 w-16 text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg mb-4">No files uploaded yet</p>
          <Button onClick={() => window.triggerBrowseFiles?.()} className="glow-button">
              <FileUp className="mr-2 h-4 w-4" />Upload Your First File
          </Button>
      </div>

      {/* URL Upload Modal */}
      <div id="urlUploadModal" className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 hidden">
          <div className="glow-modal w-full max-w-md p-6 m-4">
              <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white font-orbitron mb-2">Upload from URL</h3>
                  <p className="text-yellow-400 font-rajdhani">Enter the direct URL of the file</p>
              </div>
              
              <form id="urlUploadForm" className="space-y-4">
                  <div>
                      <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-300 mb-2 font-space">
                          <Link className="inline-block mr-2 text-blue-400 h-4 w-4" />File URL
                      </label>
                      <input 
                          type="url" 
                          id="fileUrl"
                          placeholder="https://example.com/file.pdf"
                          className="glow-input w-full"
                          required
                      />
                  </div>
                  <div>
                      <label htmlFor="customFileName" className="block text-sm font-medium text-gray-300 mb-2 font-space">
                         <FileUp className="inline-block mr-2 text-green-400 h-4 w-4" />File Name (Optional)
                      </label>
                      <input 
                          type="text" 
                          id="customFileName"
                          placeholder="Leave empty to use original name"
                          className="glow-input w-full"
                      />
                  </div>
                  <div className="flex space-x-4 pt-4">
                      <Button type="button" onClick={() => window.closeUrlUploadModal?.()} className="flex-1" variant="secondary">
                          Cancel
                      </Button>
                      <Button type="submit" className="glow-button flex-1">
                          Upload
                      </Button>
                  </div>
              </form>
          </div>
      </div>
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
        uploadFromUrl: () => void;
        closeUrlUploadModal: () => void;
        removeFile: (fileId: string) => void;
        editFile: (fileId: string) => void;
        downloadFile: (fileId: string) => void;
        previewFile: (fileId: string) => void;
        initializeUploadArea: () => void;
        handleFileSelect: (e: Event) => void;
        createFileDownload: (originalFile: File, fileName: string) => boolean;
        showFilePreviewModal: (file: any) => void;
        closeFilePreviewModal: () => void;
        triggerBrowseFiles: () => void;
    }
}
