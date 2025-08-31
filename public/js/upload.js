
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
let currentUser = null;


// Initialize Upload Area
document.addEventListener('DOMContentLoaded', function() {
    currentUser = JSON.parse(localStorage.getItem('gis-user-profile'));

    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadArea || !fileInput) return;
    
    // Drag and drop events
    uploadArea.addEventListener('dragenter', handleDragEnter);
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // File input change event
    fileInput.addEventListener('change', handleFileSelect);

    const urlUploadForm = document.getElementById('urlUploadForm');
    if (urlUploadForm) {
        urlUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const url = document.getElementById('fileUrl').value;
            const customName = document.getElementById('customFileName').value;
            
            // Simulate URL download and upload
            const fileName = customName || url.split('/').pop().split('?')[0] || 'downloaded_file';
            const fileSize = Math.floor(Math.random() * 10000000) + 1000000; // Random size
            
            const fileObj = {
                id: generateFileId(),
                name: fileName,
                size: fileSize,
                type: 'application/octet-stream',
                extension: fileName.split('.').pop().toLowerCase(),
                uploadDate: new Date().toISOString(),
                status: 'uploading',
                progress: 0,
                user: currentUser ? currentUser.name : 'Unknown',
                location: currentUser ? currentUser.location : 'Unknown',
                source: 'url',
                originalUrl: url
            };
            
            uploadedFiles.push(fileObj);
            updateFileStatistics();
            displayUploadedFiles();
            closeUrlUploadModal();
            
            // Simulate upload
            simulateUpload(fileObj);
        });
    }

    // Initial load
    showAllFiles();
});

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
    
    // Check if we're leaving the upload area
    const rect = this.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX >= rect.right || 
        e.clientY < rect.top || e.clientY >= rect.bottom) {
        this.classList.remove('dragging');
    }
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
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File size exceeds 500MB limit (${formatFileSize(file.size)})`
        };
    }
    
    // Check file extension
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
        user: currentUser ? currentUser.name : 'Unknown',
        location: currentUser ? currentUser.location : 'Unknown',
        originalFile: file // Store reference to original file for manual download
    };
    
    uploadedFiles.push(fileObj);
    displayUploadedFiles();
    
    // Simulate upload progress
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
            
            // Save to storage
            saveFilesToStorage();
            
            // Process file based on type
            if (file && (fileObj.extension === 'csv' || fileObj.extension === 'xlsx')) {
                processDataFile(file, fileObj);
            }
            
            showUploadNotification(`${fileObj.name} uploaded successfully`, 'success');
        }
        
        updateFileStatistics();
        displayUploadedFiles();
    }, 300);
}

// Process data file (CSV or Excel)
async function processDataFile(file, fileObj) {
    // For demo purposes, we'll just log this.
    console.log(`Processing data file: ${file.name}`);
}

// Display uploaded files
function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    const placeholder = document.getElementById('noFilesPlaceholder');

    if (!container || !placeholder) return;
    
    // Filter files
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
    
    // Sort files
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
        placeholder.style.display = 'block';
        if(currentFilter) {
            placeholder.innerHTML = `
                <i class="fas fa-search text-6xl text-gray-600 mb-4"></i>
                <p class="text-gray-400 text-lg">No files found matching the current filter</p>
                <button onclick="resetFileFilters()" class="mt-4 glow-button">
                    <i class="fas fa-undo mr-2"></i>Reset Filters
                </button>
            `;
        } else {
            placeholder.innerHTML = `
                <i class="fas fa-folder-open text-6xl text-gray-600 mb-4"></i>
                <p class="text-gray-400 text-lg mb-4">No files uploaded yet</p>
                <button onclick="document.getElementById('fileInput').click()" class="glow-button">
                    <i class="fas fa-upload mr-2"></i>Upload Your First File
                </button>
            `;
        }
        return;
    }

    placeholder.style.display = 'none';
    
    // Set grid classes based on view
    container.className = currentFileView === 'grid' ? 
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 
        'space-y-3';
    
    let html = '';
    
    filteredFiles.forEach(file => {
        const iconClass = getFileIcon(file.extension);
        const statusClass = `status-${file.status}`;
        
        if (currentFileView === 'grid') {
            html += `
                <div class="kpi-card p-4" id="file-${file.id}">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                            <i class="${iconClass} text-2xl text-gray-300"></i>
                        </div>
                        <div class="flex space-x-2">
                            ${file.status === 'completed' ? `
                                <button onclick="downloadFile('${file.id}')" class="text-blue-400 hover:text-blue-300" title="Download">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button onclick="previewFile('${file.id}')" class="text-green-400 hover:text-green-300" title="Preview">
                                    <i class="fas fa-eye"></i>
                                </button>
                            ` : ''}
                            <button onclick="removeFile('${file.id}')" class="text-red-400 hover:text-red-300" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <h4 class="text-white font-semibold text-sm truncate font-orbitron" title="${file.name}">${file.name}</h4>
                        <p class="text-gray-400 text-xs mt-1">
                            ${formatFileSize(file.size)} • ${file.extension.toUpperCase()}
                        </p>
                        <p class="text-gray-500 text-xs">
                            ${new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                    </div>
                    
                    ${file.status === 'uploading' ? `
                        <div class="mb-3">
                            <div class="bg-gray-600 rounded-full h-2 mb-1">
                                <div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" 
                                     style="width: ${file.progress}%"></div>
                            </div>
                            <p class="text-xs text-gray-400 text-center">${Math.round(file.progress)}%</p>
                        </div>
                    ` : `
                        <div class="flex items-center justify-between text-xs">
                            <span class="px-2 py-1 rounded text-white ${
                                file.status === 'completed' ? 'bg-green-500' : 
                                file.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                            }">${file.status}</span>
                            <span class="text-gray-500 truncate">${file.user}</span>
                        </div>
                    `}
                </div>
            `;
        } else {
            // List view
            html += `
                <div class="kpi-card p-4" id="file-${file.id}">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4 flex-1 min-w-0">
                            <div class="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i class="${iconClass} text-xl text-gray-300"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="text-white font-semibold truncate font-orbitron" title="${file.name}">${file.name}</h4>
                                <p class="text-gray-400 text-sm truncate">
                                    ${formatFileSize(file.size)} • ${file.extension.toUpperCase()} • 
                                    ${new Date(file.uploadDate).toLocaleString()} • ${file.user}
                                </p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            ${file.status === 'uploading' ? `
                                <div class="w-32">
                                    <div class="bg-gray-600 rounded-full h-2">
                                        <div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" 
                                             style="width: ${file.progress}%"></div>
                                    </div>
                                    <p class="text-xs text-gray-400 mt-1">${Math.round(file.progress)}%</p>
                                </div>
                            ` : `
                                <span class="px-3 py-1 rounded text-white text-sm whitespace-nowrap ${
                                    file.status === 'completed' ? 'bg-green-500' : 
                                    file.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                                }">${file.status}</span>
                            `}
                            
                            <div class="flex space-x-2">
                                ${file.status === 'completed' ? `
                                    <button onclick="downloadFile('${file.id}')" class="text-blue-400 hover:text-blue-300" title="Download">
                                        <i class="fas fa-download text-lg"></i>
                                    </button>
                                    <button onclick="previewFile('${file.id}')" class="text-green-400 hover:text-green-300" title="Preview">
                                        <i class="fas fa-eye text-lg"></i>
                                    </button>
                                ` : ''}
                                <button onclick="removeFile('${file.id}')" class="text-red-400 hover:text-red-300" title="Delete">
                                    <i class="fas fa-trash text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

// Get file icon
function getFileIcon(extension) {
    const iconMap = {
        'csv': 'fas fa-file-csv', 'xlsx': 'fas fa-file-excel',
        'pdf': 'fas fa-file-pdf', 'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image', 'png': 'fas fa-file-image',
        'docx': 'fas fa-file-word', 'doc': 'fas fa-file-word',
        'ppt': 'fas fa-file-powerpoint', 'pptx': 'fas fa-file-powerpoint',
        'shp': 'fas fa-map', 'gdb': 'fas fa-database',
        'kmz': 'fas fa-globe-americas', 'kml': 'fas fa-globe-americas'
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

function showUploadNotification(message, type = 'info') {
    const existing = document.querySelector('.toast-notification');
    if(existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white transition-all transform-gpu`;

    const colors = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        error: 'bg-red-500'
    };
    toast.classList.add(colors[type] || 'bg-gray-700');

    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-3"></i>
            <span style="white-space: pre-line;">${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}


function showAllFiles() {
    uploadedFiles = JSON.parse(localStorage.getItem('gis_all_files') || '[]');
    updateFileStatistics();
    displayUploadedFiles();
    showUploadNotification(`Showing ${uploadedFiles.length} files`, 'info');
}

function clearAllFiles() {
    if (confirm('Are you sure you want to delete all uploaded files? This action cannot be undone.')) {
        uploadedFiles = [];
        localStorage.removeItem('gis_all_files');
        updateFileStatistics();
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
    filterFiles();
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


function removeFile(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
        saveFilesToStorage();
        updateFileStatistics();
        displayUploadedFiles();
        showUploadNotification('File removed successfully', 'success');
    }
};

function downloadFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    showUploadNotification(`📥 Downloading ${file.name}...`, 'info');
    if (file.originalFile) {
        if (createFileDownload(file.originalFile, file.name)) {
            showUploadNotification(`📥 ${file.name} downloaded successfully`, 'success');
        } else {
            showUploadNotification(`Download failed for ${file.name}`, 'error');
        }
    } else {
        createMockDownload(file);
    }
}

function previewFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    showFilePreviewModal(file);
}

function createFileDownload(originalFile, fileName) {
    try {
        const url = URL.createObjectURL(originalFile);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('File download failed:', error);
        return false;
    }
}

function createMockDownload(fileObj) {
    const mockContent = `File: ${fileObj.name}\nSize: ${formatFileSize(fileObj.size)}\nUploaded: ${new Date(fileObj.uploadDate).toLocaleString()}\nUser: ${fileObj.user}`;
    const blob = new Blob([mockContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${fileObj.name}_info.txt`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    showUploadNotification(`File info for ${fileObj.name} downloaded`, 'success');
}


function showFilePreviewModal(file) {
    const existingModal = document.getElementById('filePreviewModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'filePreviewModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    
    modal.innerHTML = `
        <div class="glow-modal max-w-4xl w-full max-h-full overflow-auto relative">
            <div class="flex justify-between items-center p-6 border-b border-gray-700">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                        <i class="${getFileIcon(file.extension)} text-2xl text-gray-300"></i>
                    </div>
                    <div>
                        <h3 class="text-white font-bold text-xl font-orbitron">${file.name}</h3>
                        <p class="text-gray-400">${formatFileSize(file.size)} • ${file.extension.toUpperCase()}</p>
                    </div>
                </div>
                <button onclick="closeFilePreviewModal()" class="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div class="p-6">${generatePreviewContent(file)}</div>
            <div class="flex justify-between items-center p-6 border-t border-gray-700">
                 <div class="text-sm text-gray-400">Uploaded by ${file.user}</div>
                 <div>
                    <button onclick="downloadFile('${file.id}')" class="glow-button"><i class="fas fa-download mr-2"></i>Download</button>
                    <button onclick="closeFilePreviewModal()" class="ml-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">Close</button>
                 </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => e.target === modal && closeFilePreviewModal());
}

function generatePreviewContent(file) {
    const ext = file.extension.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext) && file.originalFile) {
        const url = URL.createObjectURL(file.originalFile);
        return `<img src="${url}" class="max-w-full max-h-[60vh] mx-auto" onload="URL.revokeObjectURL(this.src)">`;
    }
    // Simple text-based previews for other types
    return `
        <div class="text-center bg-gray-800 p-8 rounded-lg">
            <i class="${getFileIcon(ext)} text-8xl text-gray-500 mb-4"></i>
            <p class="text-lg text-white">Preview not available for .${ext} files.</p>
            <p class="text-gray-400">Download the file to view its contents.</p>
        </div>
    `;
}

function closeFilePreviewModal() {
    const modal = document.getElementById('filePreviewModal');
    if (modal) modal.remove();
}

function saveFilesToStorage() {
    localStorage.setItem('gis_all_files', JSON.stringify(uploadedFiles.map(f => {
        const { originalFile, ...rest } = f; // Don't store the file object itself
        return rest;
    })));
}

// Global functions
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
window.createFileDownload = createFileDownload;
window.showFilePreviewModal = showFilePreviewModal;
window.closeFilePreviewModal = closeFilePreviewModal;

