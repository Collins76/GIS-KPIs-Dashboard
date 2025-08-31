// 📁 Enhanced File Upload Functionality
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB in bytes
const ALLOWED_EXTENSIONS = [
    'csv', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png', 
    'docx', 'doc', 'shp', 'gdb', 'ppt', 'pptx', 
    'kmz', 'kml'
];

let uploadedFiles = [];
let currentFileView = 'grid';
let currentFilter = '';
let currentSort = 'newest';
let selectedFileId = null;

// Initialize Upload Area
function initializeUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadArea || !fileInput) return;

    // Add event listeners only once
    if (uploadArea.dataset.initialized) return;
    uploadArea.dataset.initialized = 'true';
    
    // Drag and drop events
    uploadArea.addEventListener('dragenter', handleDragEnter, false);
    uploadArea.addEventListener('dragover', handleDragOver, false);
    uploadArea.addEventListener('dragleave', handleDragLeave, false);
    uploadArea.addEventListener('drop', handleDrop, false);
    
    // Click to browse
    uploadArea.addEventListener('click', triggerBrowseFiles);
    
    // File input change event
    fileInput.addEventListener('change', handleFileSelect, false);

    // Load from storage
    loadFilesFromStorage();
    displayUploadedFiles();
}


// Handle drag enter
function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add('dragging');
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('dragging');
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    this.classList.remove('dragging');
    
    const files = e.dataTransfer.files;
    processFiles(files);
}

// Handle file select
function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
}

// Trigger file input
function triggerBrowseFiles() {
    document.getElementById('fileInput')?.click();
}

// Process files
function processFiles(files) {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];
    
    fileArray.forEach(file => {
        const validation = validateFile(file);
        if (validation.valid) {
            validFiles.push(file);
        } else {
            errors.push(`${file.name}: ${validation.error}`);
        }
    });
    
    // Show errors if any
    if (errors.length > 0) {
        showUploadNotification(errors.join('\n'), 'error');
    }
    
    // Upload valid files
    if (validFiles.length > 0) {
        validFiles.forEach(file => uploadFile(file));
    }
}

// Validate file
function validateFile(file) {
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File size exceeds 500MB limit (${formatFileSize(file.size)})`
        };
    }
    
    const extension = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return {
            valid: false,
            error: `File type .${extension} is not allowed`
        };
    }
    
    return { valid: true };
}

// Upload file
async function uploadFile(file) {
    const userProfile = JSON.parse(localStorage.getItem('gis-user-profile') || '{}');
    const fileId = generateFileId();
    const fileObj = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        extension: file.name.split('.').pop().toLowerCase(),
        uploadDate: new Date().toISOString(),
        status: 'uploading',
        progress: 0,
        user: userProfile.name || 'Unknown',
        location: userProfile.location || 'Unknown',
        originalFile: file 
    };
    
    uploadedFiles.unshift(fileObj);
    displayUploadedFiles();
    
    simulateUpload(fileObj, file);
}

// Simulate upload (replace with actual upload logic)
async function simulateUpload(fileObj, file) {
    const progressInterval = setInterval(() => {
        fileObj.progress += Math.random() * 20 + 5;
        
        if (fileObj.progress >= 100) {
            fileObj.progress = 100;
            fileObj.status = 'completed';
            clearInterval(progressInterval);
            
            saveFilesToStorage();
            
            if ((fileObj.extension === 'csv' || fileObj.extension === 'xlsx') && file) {
                processDataFile(file, fileObj);
            }
            
            showUploadNotification(`${fileObj.name} uploaded successfully`, 'success');
        }
        
        updateFileProgress(fileObj);
        updateFileStatistics();
    }, 300);
}


// Process data file (CSV or Excel)
async function processDataFile(file, fileObj) {
    // This is a placeholder for actual data processing logic
    console.log(`Processing data file: ${fileObj.name}`);
}


// Enhanced Display Uploaded Files
function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;
    
    let filteredFiles = uploadedFiles;
    
    if (currentFilter) {
        filteredFiles = uploadedFiles.filter(file => {
            switch (currentFilter) {
                case 'csv': return file.extension === 'csv';
                case 'xlsx': return file.extension === 'xlsx';
                case 'pdf': return file.extension === 'pdf';
                case 'image': return ['jpg', 'jpeg', 'png'].includes(file.extension);
                case 'doc': return ['doc', 'docx'].includes(file.extension);
                case 'gis': return ['shp', 'gdb', 'kml', 'kmz'].includes(file.extension);
                case 'presentation': return ['ppt', 'pptx'].includes(file.extension);
                default: return true;
            }
        });
    }
    
    filteredFiles.sort((a, b) => {
        switch (currentSort) {
            case 'newest': return new Date(b.uploadDate) - new Date(a.uploadDate);
            case 'oldest': return new Date(a.uploadDate) - new Date(b.uploadDate);
            case 'largest': return b.size - a.size;
            case 'smallest': return a.size - b.size;
            case 'name': return a.name.localeCompare(b.name);
            default: return 0;
        }
    });
    
    updateFileStatistics();
    
    if (filteredFiles.length === 0) {
        container.innerHTML = '';
        document.getElementById('noFilesPlaceholder').style.display = 'block';
        return;
    }
    
    document.getElementById('noFilesPlaceholder').style.display = 'none';
    
    container.className = currentFileView === 'grid' ? 
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 
        'space-y-4';
    
    let html = '';
    
    filteredFiles.forEach(file => {
        const iconClass = getFileIcon(file.extension);
        
        const cardHtml = `
            <div class="flex-grow flex flex-col">
                <div class="flex justify-between items-start mb-4">
                    <div class="w-12 h-12 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
                        <i class="${iconClass} text-2xl text-gray-400"></i>
                    </div>
                    <div class="flex space-x-3 items-center">
                        ${file.status === 'completed' ? `
                            <button onclick="downloadFile('${file.id}', event)" class="text-blue-400 hover:text-blue-300 transition-colors" title="Download">
                                <i class="fas fa-download"></i>
                            </button>
                            <button onclick="previewFile('${file.id}', event)" class="text-green-400 hover:text-green-300 transition-colors" title="Preview">
                                <i class="fas fa-eye"></i>
                            </button>
                        ` : ''}
                        <button onclick="removeFile('${file.id}', event)" class="text-red-500 hover:text-red-400 transition-colors" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="flex-grow mb-4">
                    <h4 class="text-white font-semibold text-base truncate font-orbitron" title="${file.name}">${file.name}</h4>
                    <p class="text-gray-400 text-xs mt-1">
                        ${formatFileSize(file.size)} • ${file.extension.toUpperCase()}
                    </p>
                    <p class="text-gray-500 text-xs mt-1">
                        ${new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                </div>
                
                <div class="flex justify-between items-center text-xs">
                    ${file.status === 'uploading' ? `
                        <div class="w-full bg-gray-700 rounded-full h-1.5">
                            <div class="bg-gradient-to-r from-yellow-400 to-orange-400 h-1.5 rounded-full transition-all" 
                                 style="width: ${file.progress}%"></div>
                        </div>
                        <span class="text-gray-400 ml-2">${Math.round(file.progress)}%</span>
                    ` : `
                        <span class="px-2 py-1 rounded-full text-white font-semibold ${
                            file.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                            file.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }">${file.status}</span>
                        <span class="text-gray-500 truncate">${file.user}</span>
                    `}
                </div>
            </div>
        `;

        if (currentFileView === 'grid') {
            html += `<div class="kpi-card p-4 flex flex-col h-full" id="file-${file.id}" onclick="selectFile('${file.id}')" data-selected="${selectedFileId === file.id}">${cardHtml}</div>`;
        } else {
             html += `
                <div class="kpi-card p-4 flex items-center" id="file-${file.id}" onclick="selectFile('${file.id}')" data-selected="${selectedFileId === file.id}">
                    <div class="w-12 h-12 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center mr-4">
                        <i class="${iconClass} text-2xl text-gray-400"></i>
                    </div>
                    <div class="flex-grow">
                        <h4 class="text-white font-semibold truncate font-orbitron" title="${file.name}">${file.name}</h4>
                        <p class="text-gray-400 text-xs mt-1">
                            ${formatFileSize(file.size)} • ${file.extension.toUpperCase()} • Uploaded by ${file.user} on ${new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div class="flex items-center space-x-4 mx-8">
                        ${file.status === 'uploading' ? `
                            <div class="w-32">
                                <div class="bg-gray-700 rounded-full h-1.5">
                                    <div class="bg-gradient-to-r from-yellow-400 to-orange-400 h-1.5 rounded-full transition-all" 
                                         style="width: ${file.progress}%"></div>
                                </div>
                                <p class="text-xs text-right text-gray-400 mt-1">${Math.round(file.progress)}%</p>
                            </div>
                        ` : `
                           <span class="px-3 py-1 rounded-full text-white font-semibold text-xs ${
                                file.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                                file.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                            }">${file.status}</span>
                        `}
                    </div>
                    <div class="flex space-x-3 items-center">
                        <button onclick="editFile('${file.id}', event)" class="text-yellow-400 hover:text-yellow-300 transition-colors" title="Edit">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button onclick="downloadFile('${file.id}', event)" class="text-blue-400 hover:text-blue-300 transition-colors" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="previewFile('${file.id}', event)" class="text-green-400 hover:text-green-300 transition-colors" title="Preview">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="removeFile('${file.id}', event)" class="text-red-500 hover:text-red-400 transition-colors" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
    updateSelectedFileUI();
}

function selectFile(fileId) {
    if (selectedFileId === fileId) {
        selectedFileId = null;
    } else {
        selectedFileId = fileId;
    }
    updateSelectedFileUI();
}

function updateSelectedFileUI() {
    document.querySelectorAll('[data-selected]').forEach(el => {
        el.setAttribute('data-selected', 'false');
    });
    if (selectedFileId) {
        const selectedEl = document.getElementById(`file-${selectedFileId}`);
        if (selectedEl) {
            selectedEl.setAttribute('data-selected', 'true');
        }
    }
}


// Update file progress display
function updateFileProgress(file) {
    const fileElement = document.getElementById(`file-${file.id}`);
    if (!fileElement) return;

    if (file.status === 'uploading') {
         const progressBar = fileElement.querySelector('.transition-all');
         const progressText = fileElement.querySelector('.text-gray-400.ml-2, .text-xs.text-right.text-gray-400');
         if(progressBar) progressBar.style.width = `${file.progress}%`;
         if(progressText) progressText.textContent = `${Math.round(file.progress)}%`;
    } else {
        // Rerender the whole list to update status
        displayUploadedFiles();
    }
}

// Get file icon
function getFileIcon(extension) {
    const iconMap = {
        'csv': 'fas fa-file-csv', 'xlsx': 'fas fa-file-excel', 'pdf': 'fas fa-file-pdf',
        'jpg': 'fas fa-file-image', 'jpeg': 'fas fa-file-image', 'png': 'fas fa-file-image',
        'docx': 'fas fa-file-word', 'doc': 'fas fa-file-word', 'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint', 'shp': 'fas fa-globe-americas', 'gdb': 'fas fa-database',
        'kmz': 'fas fa-globe', 'kml': 'fas fa-globe'
    };
    return iconMap[extension] || 'fas fa-file';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate file ID
function generateFileId() {
    return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function removeFile(fileId, event) {
    event?.stopPropagation();
    if (confirm('Are you sure you want to delete this file?')) {
        uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
        if (selectedFileId === fileId) selectedFileId = null;
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification('File removed successfully', 'success');
    }
}

// Show upload notification
function showUploadNotification(message, type = 'info') {
    const existing = document.querySelector('.upload-notification');
    if(existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `upload-notification fixed bottom-4 right-4 z-[100] p-4 rounded-lg shadow-2xl transition-all transform glow-container ${
        type === 'success' ? 'border-green-500' : 
        type === 'error' ? 'border-red-500' : 
        'border-blue-500'
    } text-white max-w-md`;
    
    notification.innerHTML = `
        <div class="flex items-start">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle text-green-400' : 
                type === 'error' ? 'fa-exclamation-circle text-red-400' : 
                'fa-info-circle text-blue-400'
            } mr-3 mt-1 fa-lg"></i>
            <div>
                <p class="font-semibold text-white font-orbitron">${type.charAt(0).toUpperCase() + type.slice(1)}</p>
                <p class="text-sm mt-1 text-gray-300" style="white-space: pre-line;">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(calc(100% + 2rem))';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}


function showAllFiles() {
    loadFilesFromStorage();
    showUploadNotification(`Showing ${uploadedFiles.length} files`, 'info');
}

function clearAllFiles() {
    if (confirm('Are you sure you want to delete all uploaded files? This action cannot be undone.')) {
        uploadedFiles = [];
        selectedFileId = null;
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification('All files cleared successfully', 'success');
    }
}

function resetUploadArea() {
    document.getElementById('fileInput').value = '';
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('fileSortOrder').value = 'newest';
    currentFilter = '';
    currentSort = 'newest';
    selectedFileId = null;
    displayUploadedFiles();
    showUploadNotification('Upload area reset', 'info');
}

function toggleFileView(view) {
    currentFileView = view;
    document.getElementById('gridViewBtn').classList.toggle('bg-yellow-500', view === 'grid');
    document.getElementById('gridViewBtn').classList.toggle('bg-gray-600', view !== 'grid');
    document.getElementById('listViewBtn').classList.toggle('bg-yellow-500', view === 'list');
    document.getElementById('listViewBtn').classList.toggle('bg-gray-600', view !== 'list');
    displayUploadedFiles();
}

function filterFiles() {
    currentFilter = document.getElementById('fileTypeFilter').value;
    displayUploadedFiles();
}

function sortFiles() {
    currentSort = document.getElementById('fileSortOrder').value;
    displayUploadedFiles();
}

function resetFileFilters() {
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('fileSortOrder').value = 'newest';
    currentFilter = '';
    currentSort = 'newest';
    displayUploadedFiles();
}

function uploadFromUrl() {
    document.getElementById('urlUploadModal').classList.remove('hidden');
}

function closeUrlUploadModal() {
    document.getElementById('urlUploadModal').classList.add('hidden');
    document.getElementById('urlUploadForm').reset();
}

document.addEventListener('DOMContentLoaded', function() {
    const urlUploadForm = document.getElementById('urlUploadForm');
    if (urlUploadForm) {
        urlUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const url = document.getElementById('fileUrl').value;
            if(!url) return;
            const customName = document.getElementById('customFileName').value;
            
            const fileName = customName || url.split('/').pop().split('?')[0] || 'downloaded_file';
            const fileSize = Math.floor(Math.random() * 10000000) + 1000000;
            
            const fileObj = {
                id: generateFileId(), name: fileName, size: fileSize,
                type: 'application/octet-stream', extension: fileName.split('.').pop().toLowerCase(),
                uploadDate: new Date().toISOString(), status: 'uploading', progress: 0,
                user: JSON.parse(localStorage.getItem('gis-user-profile') || '{}').name || 'Unknown',
                location: JSON.parse(localStorage.getItem('gis-user-profile') || '{}').location || 'Unknown',
                source: 'url', originalUrl: url
            };
            
            uploadedFiles.unshift(fileObj);
            displayUploadedFiles();
            closeUrlUploadModal();
            
            simulateUpload(fileObj);
        });
    }
});

function updateFileStatistics() {
    const totalFiles = uploadedFiles.length;
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    const uploading = uploadedFiles.filter(f => f.status === 'uploading').length;
    const completed = uploadedFiles.filter(f => f.status === 'completed').length;
    
    document.getElementById('totalFilesCount').textContent = totalFiles;
    document.getElementById('totalSizeCount').textContent = formatFileSize(totalSize);
    document.getElementById('uploadingCount').textContent = uploading;
    document.getElementById('completedCount').textContent = completed;
    
    const placeholder = document.getElementById('noFilesPlaceholder');
    if (placeholder) {
        placeholder.style.display = totalFiles === 0 ? 'flex' : 'none';
    }
}


function createFileDownload(originalFile, fileName) {
    try {
        const url = URL.createObjectURL(originalFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('File download failed:', error);
        return false;
    }
}


function createMockDownload(fileObj) {
    const content = `File: ${fileObj.name}\nSize: ${formatFileSize(fileObj.size)}\nUploaded: ${new Date(fileObj.uploadDate).toLocaleString()}\nUser: ${fileObj.user}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileObj.name}_info.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showUploadNotification(`File info for ${fileObj.name} downloaded`, 'success');
}

function downloadFile(fileId, event) {
    event?.stopPropagation();
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    showUploadNotification(`Downloading ${file.name}...`, 'info');
    
    if (file.originalFile) {
        if (createFileDownload(file.originalFile, file.name)) {
            showUploadNotification(`${file.name} downloaded successfully`, 'success');
        } else {
            showUploadNotification(`Download failed for ${file.name}`, 'error');
        }
    } else {
        createMockDownload(file);
    }
}

function editSelectedFile(event) {
    event?.stopPropagation();
    if(selectedFileId) {
        editFile(selectedFileId);
    } else {
        showUploadNotification('No file selected to edit.', 'error');
    }
}

function deleteSelectedFile(event) {
    event?.stopPropagation();
    if(selectedFileId) {
        removeFile(selectedFileId);
    } else {
        showUploadNotification('No file selected to delete.', 'error');
    }
}


function editFile(fileId, event) {
    event?.stopPropagation();
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    const newName = prompt(`Enter new name for ${file.name}:`, file.name);
    if (newName && newName.trim() !== '') {
        file.name = newName.trim();
        file.extension = newName.split('.').pop().toLowerCase();
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification('File renamed successfully', 'success');
    }
}

function previewFile(fileId, event) {
    event?.stopPropagation();
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    showFilePreviewModal(file);
}

function showFilePreviewModal(file) {
    const existingModal = document.getElementById('filePreviewModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'filePreviewModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    
    modal.innerHTML = `
        <div class="glow-modal max-w-4xl w-full max-h-full overflow-auto relative rounded-2xl">
            <div class="flex justify-between items-center p-6 border-b border-gray-700/50">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
                        <i class="${getFileIcon(file.extension)} text-2xl text-gray-400"></i>
                    </div>
                    <div>
                        <h3 class="text-white font-bold text-xl font-orbitron">${file.name}</h3>
                        <p class="text-gray-400 text-sm">
                            ${formatFileSize(file.size)} • ${file.extension.toUpperCase()} • 
                            Uploaded ${new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <button onclick="closeFilePreviewModal()" class="text-gray-400 hover:text-white text-2xl transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-8">${generatePreviewContent(file)}</div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeFilePreviewModal();
    });
}

function generatePreviewContent(file) {
    const extension = file.extension.toLowerCase();
    
    let previewHTML = (icon, title, desc) => `
        <div class="text-center">
            <div class="bg-gray-800/50 rounded-lg p-8 mb-4">
                <i class="fas ${icon} text-8xl mb-6"></i>
                <h4 class="text-white font-semibold text-2xl font-orbitron mb-2">${title}</h4>
                <p class="text-gray-400 max-w-md mx-auto">${desc}</p>
            </div>
        </div>`;

    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
         return previewHTML('fa-file-image text-purple-400', 'Image Preview', 'Image previews are not generated for this demo. Download the file to view it.');
    }
    if (extension === 'pdf') {
         return previewHTML('fa-file-pdf text-red-400', 'PDF Document', 'Download the file to view it in a PDF reader.');
    }
    if (['xlsx', 'csv'].includes(extension)) {
        return previewHTML('fa-file-excel text-green-400', 'Data File', 'Spreadsheet data can be downloaded and opened in Excel, or imported into the system.');
    }
     if (['shp', 'gdb', 'kml', 'kmz'].includes(extension)) {
        return previewHTML('fa-globe-americas text-blue-400', 'GIS Data File', 'This file contains spatial data for use in GIS applications.');
    }
    
    return previewHTML('fa-file text-gray-500', 'File Preview', `Preview is not available for .${extension} files. Please download it to view.`);
}

function closeFilePreviewModal() {
    const modal = document.getElementById('filePreviewModal');
    if (modal) {
        modal.classList.add('animate-out');
        setTimeout(() => modal.remove(), 300);
    }
}

function saveFilesToStorage() {
    try {
        localStorage.setItem('gis_all_files', JSON.stringify(uploadedFiles));
    } catch (e) {
        console.error("Failed to save files to storage:", e);
        showUploadNotification("Could not save file list. Storage may be full.", "error");
    }
}

function loadFilesFromStorage() {
    const storedFiles = localStorage.getItem('gis_all_files');
    if (storedFiles) {
        try {
            // Revive originalFile for downloads
            const parsedFiles = JSON.parse(storedFiles);
            uploadedFiles = parsedFiles.map(file => {
                 // The 'originalFile' cannot be properly serialized to JSON. 
                 // So we don't try to revive it. Downloads will use mock content if the file isn't re-uploaded.
                file.originalFile = null; 
                return file;
            });
        } catch(e) {
            console.error("Failed to parse files from storage", e);
            uploadedFiles = [];
        }
    } else {
        uploadedFiles = [];
    }
    displayUploadedFiles();
}

// Assign to window object
window.initializeUploadArea = initializeUploadArea;
window.handleFileSelect = handleFileSelect;
window.triggerBrowseFiles = triggerBrowseFiles;
window.removeFile = removeFile;
window.showAllFiles = showAllFiles;
window.clearAllFiles = clearAllFiles;
window.resetUploadArea = resetUploadArea;
window.toggleFileView = toggleFileView;
window.filterFiles = filterFiles;
window.sortFiles = sortFiles;
window.resetFileFilters = resetFileFilters;
window.uploadFromUrl = uploadFromUrl;
window.closeUrlUploadModal = closeUrlUploadModal;
window.downloadFile = downloadFile;
window.previewFile = previewFile;
window.editFile = editFile;
window.createFileDownload = createFileDownload;
window.showFilePreviewModal = showFilePreviewModal;
window.closeFilePreviewModal = closeFilePreviewModal;
window.editSelectedFile = editSelectedFile;
window.deleteSelectedFile = deleteSelectedFile;

// Initial Load
document.addEventListener('DOMContentLoaded', initializeUploadArea);
