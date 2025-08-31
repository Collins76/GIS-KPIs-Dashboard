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

function initializeUploadArea() {
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
};

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
    const userProfile = JSON.parse(localStorage.getItem('gis-user-profile') || '{}');
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
    
    uploadedFiles.push(fileObj);
    displayUploadedFiles();
    updateFileStatistics();
    
    simulateUpload(fileObj);
}

// Simulate upload (replace with actual upload logic)
async function simulateUpload(fileObj) {
    const progressInterval = setInterval(() => {
        fileObj.progress += Math.random() * 30;
        
        if (fileObj.progress >= 100) {
            fileObj.progress = 100;
            fileObj.status = 'completed';
            clearInterval(progressInterval);
            
            showUploadNotification(`${fileObj.name} uploaded successfully`, 'success');
        }
        
        updateFileProgress(fileObj);
        updateFileStatistics();
    }, 500);
}

// Display uploaded files
function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    const noFilesPlaceholder = document.getElementById('noFilesPlaceholder');
    if (!container || !noFilesPlaceholder) return;
    
    // Filter and sort
    let filesToDisplay = uploadedFiles
        .filter(file => {
            if (!currentFilter) return true;
            const fileTypeMap = {
                csv: ['csv'],
                xlsx: ['xlsx'],
                pdf: ['pdf'],
                image: ['jpg', 'jpeg', 'png'],
                doc: ['doc', 'docx'],
                gis: ['shp', 'gdb', 'kml', 'kmz'],
                presentation: ['ppt', 'pptx']
            };
            return fileTypeMap[currentFilter]?.includes(file.extension);
        })
        .sort((a, b) => {
            switch (currentSort) {
                case 'newest': return new Date(b.uploadDate) - new Date(a.uploadDate);
                case 'oldest': return new Date(a.uploadDate) - new Date(b.uploadDate);
                case 'largest': return b.size - a.size;
                case 'smallest': return a.size - b.size;
                case 'name': return a.name.localeCompare(b.name);
                default: return 0;
            }
        });

    if (filesToDisplay.length === 0) {
        container.innerHTML = '';
        noFilesPlaceholder.classList.remove('hidden');
    } else {
        noFilesPlaceholder.classList.add('hidden');
        container.className = currentFileView === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-3';
        
        container.innerHTML = filesToDisplay.map(file => {
             const iconClass = getFileIcon(file.extension);
             const statusColor = file.status === 'completed' ? 'green' : 
                                file.status === 'error' ? 'red' : 'yellow';

            if (currentFileView === 'grid') {
            return `
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
                            <span class="text-gray-500">${file.user}</span>
                        </div>
                    `}
                </div>
            `;
            } else { // List view
                 return `
                    <div class="kpi-card p-4" id="file-${file.id}">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4 flex-1">
                                <div class="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                                    <i class="${iconClass} text-xl text-gray-300"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="text-white font-semibold truncate font-orbitron">${file.name}</h4>
                                    <p class="text-gray-400 text-sm">
                                        ${formatFileSize(file.size)} • ${new Date(file.uploadDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                ${file.status === 'uploading' ? `
                                    <div class="w-32">
                                        <div class="bg-gray-600 rounded-full h-2"><div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style="width: ${file.progress}%"></div></div>
                                        <p class="text-xs text-gray-400 mt-1">${Math.round(file.progress)}%</p>
                                    </div>
                                ` : `
                                    <span class="px-3 py-1 rounded text-white text-sm ${statusColor}">${file.status}</span>
                                `}
                                <div class="flex space-x-2">
                                    <button onclick="removeFile('${file.id}')" class="text-red-400 hover:text-red-300" title="Delete"><i class="fas fa-trash text-lg"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

        }).join('');
    }
}


// Update file progress display
function updateFileProgress(fileObj) {
    const fileElement = document.getElementById(`file-${fileObj.id}`);
    if (!fileElement) return;

    const progressBar = fileElement.querySelector('.transition-all');
    const progressText = fileElement.querySelector('.text-xs.text-gray-400.text-center');
    
    if (progressBar) progressBar.style.width = `${fileObj.progress}%`;
    if (progressText) progressText.textContent = `${Math.round(fileObj.progress)}%`;

    if (fileObj.progress >= 100) {
        displayUploadedFiles();
    }
}


// Get file icon
function getFileIcon(extension) {
    const iconMap = {
        'csv': 'fas fa-file-csv', 'xlsx': 'fas fa-file-excel', 'pdf': 'fas fa-file-pdf',
        'jpg': 'fas fa-file-image', 'jpeg': 'fas fa-file-image', 'png': 'fas fa-file-image',
        'docx': 'fas fa-file-word', 'doc': 'fas fa-file-word', 'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint', 'shp': 'fas fa-map', 'gdb': 'fas fa-database',
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
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Generate file ID
function generateFileId() {
    return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Remove file
function removeFile(fileId) {
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
    displayUploadedFiles();
    updateFileStatistics();
    showUploadNotification('File removed', 'info');
}

// Show upload notification
function showUploadNotification(message, type = 'info') {
    const existing = document.querySelector('.upload-notification');
    if(existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `upload-notification fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-md ${
        type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.innerHTML = `<p>${message}</p>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Show All Files
function showAllFiles() {
    displayUploadedFiles();
}

// Clear All Files
function clearAllFiles() {
    if (confirm('Are you sure you want to clear all files?')) {
        uploadedFiles = [];
        displayUploadedFiles();
        updateFileStatistics();
    }
}

// Reset Upload Area
function resetUploadArea() {
    document.getElementById('fileInput').value = '';
    showUploadNotification('Upload area has been reset.', 'info');
}

// Toggle File View
function toggleFileView(view) {
    currentFileView = view;
    document.getElementById('gridViewBtn').classList.toggle('bg-yellow-500', view === 'grid');
    document.getElementById('listViewBtn').classList.toggle('bg-yellow-500', view === 'list');
    displayUploadedFiles();
}

// Filter and Sort
function filterFiles() {
    currentFilter = document.getElementById('fileTypeFilter').value;
    displayUploadedFiles();
}
function sortFiles() {
    currentSort = document.getElementById('fileSortOrder').value;
    displayUploadedFiles();
}
function resetFileFilters() {
    currentFilter = '';
    currentSort = 'newest';
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('fileSortOrder').value = 'newest';
    displayUploadedFiles();
}


// URL Upload Modal
function uploadFromUrl() {
    document.getElementById('urlUploadModal').classList.remove('hidden');
}

function closeUrlUploadModal() {
    document.getElementById('urlUploadModal').classList.add('hidden');
}
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('urlUploadForm');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const url = document.getElementById('fileUrl').value;
            const customName = document.getElementById('customFileName').value;
            if (!url) return;

            const fileName = customName || url.split('/').pop().split('?')[0];
            const fileExt = fileName.split('.').pop().toLowerCase();
            const fileSize = Math.floor(Math.random() * 50 * 1024 * 1024); // mock size up to 50MB

            const fileObj = {
                id: generateFileId(), name: fileName, size: fileSize, type: 'url/download',
                extension: fileExt, uploadDate: new Date().toISOString(), status: 'uploading', progress: 0,
                user: JSON.parse(localStorage.getItem('gis-user-profile') || '{}').name || 'Unknown',
                location: JSON.parse(localStorage.getItem('gis-user-profile') || '{}').location || 'Unknown',
                originalFile: null
            };
            
            uploadedFiles.push(fileObj);
            displayUploadedFiles();
            updateFileStatistics();
            simulateUpload(fileObj);
            closeUrlUploadModal();
        });
    }
});


// Update File Statistics
function updateFileStatistics() {
    const totalFiles = uploadedFiles.length;
    const totalSize = uploadedFiles.reduce((acc, file) => acc + file.size, 0);
    const uploadingCount = uploadedFiles.filter(f => f.status === 'uploading').length;
    const completedCount = uploadedFiles.filter(f => f.status === 'completed').length;

    document.getElementById('totalFilesCount').textContent = totalFiles;
    document.getElementById('totalSizeCount').textContent = formatFileSize(totalSize);
    document.getElementById('uploadingCount').textContent = uploadingCount;
    document.getElementById('completedCount').textContent = completedCount;
}

function downloadFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file || !file.originalFile) {
        showUploadNotification('Original file not available for download.', 'error');
        return;
    };
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file.originalFile);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


function previewFile(fileId) {
    showUploadNotification('Preview functionality is not implemented yet.', 'info');
}

// Export functions to window object
window.initializeUploadArea = initializeUploadArea;
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
window.downloadFile = downloadFile;
window.previewFile = previewFile;
