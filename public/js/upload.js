
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
let currentUser = JSON.parse(localStorage.getItem('gis-user-profile') || '{}');


// Initialize Upload Area
function initializeUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadArea || !fileInput) {
        console.error("Upload area or file input not found!");
        return;
    };
    
    // Drag and drop events
    uploadArea.addEventListener('dragenter', handleDragEnter, false);
    uploadArea.addEventListener('dragover', handleDragOver, false);
    uploadArea.addEventListener('dragleave', handleDragLeave, false);
    uploadArea.addEventListener('drop', handleDrop, false);
    
    // File input change event
    fileInput.addEventListener('change', handleFileSelect, false);
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
    
    if (errors.length > 0) {
        showUploadNotification(errors.join('\n'), 'error');
    }
    
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
        originalFile: file
    };
    
    uploadedFiles.push(fileObj);
    displayUploadedFiles();
    updateFileStatistics();
    simulateUpload(fileObj, file);
}

// Simulate upload
async function simulateUpload(fileObj, file) {
    const progressInterval = setInterval(() => {
        fileObj.progress += Math.random() * 30;
        
        if (fileObj.progress >= 100) {
            fileObj.progress = 100;
            fileObj.status = 'completed';
            clearInterval(progressInterval);
            
            showUploadNotification(`${fileObj.name} uploaded successfully`, 'success');
            saveFilesToStorage();
        }
        
        updateFileProgress(fileObj);
        updateFileStatistics();
    }, 500);
}

// Update file progress
function updateFileProgress(fileObj) {
    const fileElement = document.getElementById(`file-${fileObj.id}`);
    if (!fileElement) return;
    
    displayUploadedFiles();
}


// Get file icon
function getFileIcon(extension) {
    const iconMap = {
        'csv': 'fas fa-file-csv',
        'xlsx': 'fas fa-file-excel',
        'pdf': 'fas fa-file-pdf',
        'jpg': 'fas fa-file-image',
        'jpeg': 'fas fa-file-image',
        'png': 'fas fa-file-image',
        'docx': 'fas fa-file-word',
        'doc': 'fas fa-file-word',
        'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint',
        'shp': 'fas fa-map',
        'gdb': 'fas fa-database',
        'kmz': 'fas fa-globe',
        'kml': 'fas fa-globe'
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

// Remove file
function removeFile(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
        saveFilesToStorage();
        displayUploadedFiles();
        updateFileStatistics();
        showUploadNotification('File removed successfully', 'success');
    }
};

// Show upload notification
function showUploadNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.upload-notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `upload-notification fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all transform translate-x-0 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    } text-white max-w-md`;
    
    notification.innerHTML = `
        <div class="flex items-start">
            <div class="mr-3 mt-1 text-xl">
                 <i class="fas ${
                    type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle'
                }"></i>
            </div>
            <div>
                <p class="font-semibold">${type.charAt(0).toUpperCase() + type.slice(1)}</p>
                <p class="text-sm mt-1" style="white-space: pre-line;">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Show All Files
function showAllFiles() {
    const allFiles = JSON.parse(localStorage.getItem('gis_all_files') || '[]');
    uploadedFiles = allFiles;
    displayUploadedFiles();
    updateFileStatistics();
    showUploadNotification(`Showing ${allFiles.length} files`, 'info');
}

// Clear All Files
function clearAllFiles() {
    if (confirm('Are you sure you want to delete all uploaded files? This action cannot be undone.')) {
        uploadedFiles = [];
        localStorage.removeItem('gis_all_files');
        displayUploadedFiles();
        updateFileStatistics();
        showUploadNotification('All files cleared successfully', 'success');
    }
}

// Reset Upload Area
function resetUploadArea() {
    document.getElementById('fileInput').value = '';
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('fileSortOrder').value = 'newest';
    currentFilter = '';
    currentSort = 'newest';
    filterFiles();
    showUploadNotification('Upload area reset', 'info');
}

// Toggle File View (Grid/List)
function toggleFileView(view) {
    currentFileView = view;
    
    const gridBtn = document.getElementById('gridViewBtn');
    const listBtn = document.getElementById('listViewBtn');
    
    if (gridBtn && listBtn) {
        gridBtn.className = `p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-yellow-500 text-white' : 'bg-gray-600 text-white'}`;
        listBtn.className = `p-2 rounded-lg transition-all ${view === 'list' ? 'bg-yellow-500 text-white' : 'bg-gray-600 text-white'}`;
    }
    
    displayUploadedFiles();
}

// Filter Files
function filterFiles() {
    currentFilter = document.getElementById('fileTypeFilter').value;
    displayUploadedFiles();
}

// Sort Files
function sortFiles() {
    currentSort = document.getElementById('fileSortOrder').value;
    displayUploadedFiles();
}

// Reset File Filters
function resetFileFilters() {
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('fileSortOrder').value = 'newest';
    currentFilter = '';
    currentSort = 'newest';
    displayUploadedFiles();
}

// Trigger file browser
function triggerBrowseFiles() {
    document.getElementById('fileInput')?.click();
}

// Upload from URL
function uploadFromUrl() {
    document.getElementById('urlUploadModal').classList.remove('hidden');
}

// Close URL Upload Modal
function closeUrlUploadModal() {
    document.getElementById('urlUploadModal').classList.add('hidden');
    document.getElementById('urlUploadForm').reset();
}

// Handle URL Upload Form
document.addEventListener('DOMContentLoaded', function() {
    const urlUploadForm = document.getElementById('urlUploadForm');
    if (urlUploadForm) {
        urlUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const url = document.getElementById('fileUrl').value;
            const customName = document.getElementById('customFileName').value;
            
            const fileName = customName || url.split('/').pop().split('?')[0] || 'downloaded_file';
            const fileSize = Math.floor(Math.random() * 10000000) + 1000000;
            
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
            
            simulateUpload(fileObj);
        });
    }
});

// Update File Statistics
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
        placeholder.style.display = uploadedFiles.length === 0 ? 'block' : 'none';
    }
}

// Display Uploaded Files
function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;

    let filtered = [...uploadedFiles];
    if (currentFilter) {
        filtered = filtered.filter(file => {
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

    filtered.sort((a, b) => {
        switch (currentSort) {
            case 'newest': return new Date(b.uploadDate) - new Date(a.uploadDate);
            case 'oldest': return new Date(a.uploadDate) - new Date(b.uploadDate);
            case 'largest': return b.size - a.size;
            case 'smallest': return a.size - b.size;
            case 'name': return a.name.localeCompare(b.name);
            default: return 0;
        }
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12">
            <i class="fas fa-search text-6xl text-gray-600 mb-4"></i>
            <p class="text-gray-400 text-lg">No files found matching filters</p>
        </div>`;
        return;
    }

    container.className = currentFileView === 'grid' ? 
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 
        'space-y-4';
    
    container.innerHTML = filtered.map(file => {
        const iconClass = getFileIcon(file.extension);
        
        if (currentFileView === 'grid') {
            return `
            <div class="location-card p-4 flex flex-col justify-between" id="file-${file.id}">
                <div>
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                            <i class="${iconClass} text-2xl text-gray-300"></i>
                        </div>
                        <div class="flex space-x-2">
                           <button onclick="editFile('${file.id}')" class="text-blue-400 hover:text-blue-300" title="Edit"><i class="fas fa-edit"></i></button>
                           <button onclick="previewFile('${file.id}')" class="text-green-400 hover:text-green-300" title="Preview"><i class="fas fa-eye"></i></button>
                           <button onclick="downloadFile('${file.id}')" class="text-purple-400 hover:text-purple-300" title="Download"><i class="fas fa-download"></i></button>
                           <button onclick="removeFile('${file.id}')" class="text-red-400 hover:text-red-300" title="Delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <h4 class="text-white font-semibold text-sm truncate font-orbitron" title="${file.name}">${file.name}</h4>
                        <p class="text-gray-400 text-xs mt-1">${formatFileSize(file.size)} • ${file.extension.toUpperCase()}</p>
                        <p class="text-gray-500 text-xs">${new Date(file.uploadDate).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <div>
                ${file.status === 'uploading' ? `
                    <div class="mb-3">
                        <div class="bg-gray-600 rounded-full h-2 mb-1"><div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" style="width: ${file.progress}%"></div></div>
                        <p class="text-xs text-gray-400 text-center">${Math.round(file.progress)}%</p>
                    </div>
                ` : `
                    <div class="flex items-center justify-between text-xs">
                         <span class="px-2 py-1 rounded text-white ${file.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}">${file.status}</span>
                        <span class="text-gray-500">${file.user}</span>
                    </div>
                `}
                </div>
            </div>`;
        } else { // List view
            return `
            <div class="location-card p-3" id="file-${file.id}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3 flex-1 min-w-0">
                        <div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center"><i class="${iconClass} text-xl text-gray-300"></i></div>
                        <div class="flex-1 min-w-0">
                            <h4 class="text-white font-semibold truncate font-orbitron text-sm">${file.name}</h4>
                            <p class="text-gray-400 text-xs">${formatFileSize(file.size)} • ${new Date(file.uploadDate).toLocaleString()} • ${file.user}</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        ${file.status === 'uploading' ? `
                            <div class="w-32"><div class="bg-gray-600 rounded-full h-2"><div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style="width: ${file.progress}%"></div></div><p class="text-xs text-gray-400 mt-1">${Math.round(file.progress)}%</p></div>
                        ` : `
                            <span class="px-2 py-1 rounded text-white text-xs ${file.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}">${file.status}</span>
                        `}
                        <div class="flex space-x-3">
                           <button onclick="editFile('${file.id}')" class="text-blue-400 hover:text-blue-300" title="Edit"><i class="fas fa-edit"></i></button>
                           <button onclick="previewFile('${file.id}')" class="text-green-400 hover:text-green-300" title="Preview"><i class="fas fa-eye"></i></button>
                           <button onclick="downloadFile('${file.id}')" class="text-purple-400 hover:text-purple-300" title="Download"><i class="fas fa-download"></i></button>
                           <button onclick="removeFile('${file.id}')" class="text-red-400 hover:text-red-300" title="Delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            </div>`;
        }
    }).join('');
}


// Download File
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
        console.error('Download error:', error);
        return false;
    }
}

function createMockDownload(fileObj) {
    const content = `Mock file content for ${fileObj.name}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileObj.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Preview File
function previewFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    showFilePreviewModal(file);
}

// Edit file
function editFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    const newName = prompt("Enter new file name:", file.name);
    if (newName && newName.trim() !== "") {
        file.name = newName.trim();
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification("File renamed successfully", "success");
    }
}


function showFilePreviewModal(file) {
    const existingModal = document.getElementById('filePreviewModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'filePreviewModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    
    const previewContent = generatePreviewContent(file);
    
    modal.innerHTML = `
        <div class="glow-modal max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-gray-700">
                 <h3 class="text-white font-bold text-lg font-orbitron">${file.name}</h3>
                <button onclick="closeFilePreviewModal()" class="text-gray-400 hover:text-white text-2xl"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-6 overflow-y-auto flex-grow">${previewContent}</div>
            <div class="flex justify-end items-center p-4 border-t border-gray-700 gap-3">
                <button onclick="downloadFile('${file.id}')" class="glow-button"><i class="fas fa-download mr-2"></i>Download</button>
                <button onclick="closeFilePreviewModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeFilePreviewModal();
    });
}

function generatePreviewContent(file) {
    const ext = file.extension.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext) && file.originalFile) {
        const url = URL.createObjectURL(file.originalFile);
        return `<img src="${url}" alt="Preview of ${file.name}" class="max-w-full max-h-[60vh] mx-auto rounded-lg">`;
    }
    return `<div class="text-center p-8 bg-gray-800 rounded-lg">
        <i class="${getFileIcon(ext)} text-8xl text-gray-500 mb-4"></i>
        <h4 class="text-white font-semibold text-xl">No Preview Available</h4>
        <p class="text-gray-400">Preview for .${ext} files is not supported.</p>
    </div>`;
}

function closeFilePreviewModal() {
    const modal = document.getElementById('filePreviewModal');
    if (modal) modal.remove();
}

function saveFilesToStorage() {
    localStorage.setItem('gis_all_files', JSON.stringify(uploadedFiles));
}

// Load files from storage on init
document.addEventListener('DOMContentLoaded', () => {
    const savedFiles = localStorage.getItem('gis_all_files');
    if (savedFiles) {
        uploadedFiles = JSON.parse(savedFiles).map(file => ({...file, status: 'completed', progress: 100})); // Reset status on load
    }
    displayUploadedFiles();
    updateFileStatistics();
    initializeUploadArea();
});

window.showAllFiles = showAllFiles;
window.clearAllFiles = clearAllFiles;
window.resetUploadArea = resetUploadArea;
window.toggleFileView = toggleFileView;
window.filterFiles = filterFiles;
window.sortFiles = sortFiles;
window.resetFileFilters = resetFileFilters;
window.uploadFromUrl = uploadFromUrl;
window.closeUrlUploadModal = closeUrlUploadModal;
window.removeFile = removeFile;
window.editFile = editFile;
window.downloadFile = downloadFile;
window.previewFile = previewFile;
window.createFileDownload = createFileDownload;
window.showFilePreviewModal = showFilePreviewModal;
window.closeFilePreviewModal = closeFilePreviewModal;
window.initializeUploadArea = initializeUploadArea;
window.handleFileSelect = handleFileSelect;
window.triggerBrowseFiles = triggerBrowseFiles;
