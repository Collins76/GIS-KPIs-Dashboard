// 📁 Enhanced File Upload Functionality
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB in bytes
const ALLOWED_EXTENSIONS = [
    'csv', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png', 
    'docx', 'doc', 'shp', 'gdb', 'ppt', 'pptx', 
    'kmz', 'kml'
];

let uploadedFiles = [];
let selectedFileId = null;
let currentFileView = 'grid';
let currentFilter = '';
let currentSort = 'newest';

// Initialize Upload Area
function initializeUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    if (uploadArea && fileInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        uploadArea.addEventListener('dragenter', () => uploadArea.classList.add('dragging'));
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragging'));
        uploadArea.addEventListener('drop', handleDrop);
        
        fileInput.addEventListener('change', handleFileSelect);
    }

    // Load files from storage
    const savedFiles = localStorage.getItem('gis_all_files');
    if (savedFiles) {
        uploadedFiles = JSON.parse(savedFiles);
    }
    displayUploadedFiles();
}

function handleDrop(e) {
    this.classList.remove('dragging');
    const files = e.dataTransfer.files;
    processFiles(files);
}

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
        return { valid: false, error: `File size exceeds 500MB limit (${formatFileSize(file.size)})` };
    }
    const extension = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return { valid: false, error: `File type .${extension} is not allowed` };
    }
    return { valid: true };
}

// Upload file
function uploadFile(file) {
    const fileId = generateFileId();
    const currentUser = JSON.parse(localStorage.getItem('gis-user-profile') || '{}');
    const fileObj = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        extension: file.name.split('.').pop().toLowerCase(),
        uploadDate: new Date().toISOString(),
        status: 'uploading',
        progress: 0,
        user: currentUser.name || 'Unknown',
        location: currentUser.location || 'Unknown',
        originalFile: file
    };
    
    uploadedFiles.unshift(fileObj);
    displayUploadedFiles();
    simulateUpload(fileObj);
}

function simulateUpload(fileObj) {
    const progressInterval = setInterval(() => {
        fileObj.progress += Math.random() * 20 + 5;
        if (fileObj.progress >= 100) {
            fileObj.progress = 100;
            fileObj.status = 'completed';
            clearInterval(progressInterval);
            saveFilesToStorage();
            showUploadNotification(`${fileObj.name} uploaded successfully`, 'success');
        }
        updateFileProgress(fileObj);
    }, 300);
}

function updateFileProgress(fileObj) {
    const progressBar = document.querySelector(`#file-${fileObj.id} .transition-all`);
    const progressText = document.querySelector(`#file-${fileObj.id} .text-center`);
    if (progressBar) progressBar.style.width = `${fileObj.progress}%`;
    if (progressText) progressText.textContent = `${Math.round(fileObj.progress)}%`;

    if (fileObj.status === 'completed') {
        displayUploadedFiles();
    }
}


// Enhanced Display Uploaded Files
function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;

    let filtered = [...uploadedFiles];
    if (currentFilter) {
        filtered = filtered.filter(file => {
             const extension = file.extension.toLowerCase();
            switch (currentFilter) {
                case 'csv': return extension === 'csv';
                case 'xlsx': return extension === 'xlsx';
                case 'pdf': return extension === 'pdf';
                case 'image': return ['jpg', 'jpeg', 'png'].includes(extension);
                case 'doc': return ['doc', 'docx'].includes(extension);
                case 'gis': return ['shp', 'gdb', 'kml', 'kmz'].includes(extension);
                case 'presentation': return ['ppt', 'pptx'].includes(extension);
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

    updateFileStatistics(filtered.length);
    
    container.className = currentFileView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3';
    
    if (filtered.length === 0) {
        document.getElementById('noFilesPlaceholder').style.display = 'block';
        container.innerHTML = '';
    } else {
        document.getElementById('noFilesPlaceholder').style.display = 'none';
        container.innerHTML = filtered.map(file => createFileCardHTML(file)).join('');
    }

    // Add selection listeners
    document.querySelectorAll('.location-card[data-file-id]').forEach(card => {
        card.addEventListener('click', function() {
            const fileId = this.dataset.fileId;
            if (selectedFileId === fileId) {
                selectedFileId = null;
                this.classList.remove('border-yellow-400');
            } else {
                document.querySelectorAll('.location-card[data-file-id]').forEach(c => c.classList.remove('border-yellow-400'));
                this.classList.add('border-yellow-400');
                selectedFileId = fileId;
            }
        });
    });
}

function createFileCardHTML(file) {
    const iconClass = getFileIcon(file.extension);
    
    const actions = `
        <button onclick="event.stopPropagation(); previewFile('${file.id}')" class="text-blue-400 hover:text-blue-300" title="Preview"><i class="fas fa-eye"></i></button>
        <button onclick="event.stopPropagation(); downloadFile('${file.id}')" class="text-green-400 hover:text-green-300" title="Download"><i class="fas fa-download"></i></button>
        <button onclick="event.stopPropagation(); editFile('${file.id}')" class="text-yellow-400 hover:text-yellow-300" title="Edit"><i class="fas fa-pencil-alt"></i></button>
        <button onclick="event.stopPropagation(); removeFile('${file.id}')" class="text-red-400 hover:text-red-300" title="Delete"><i class="fas fa-trash"></i></button>
    `;

    const cardClass = `location-card p-4 cursor-pointer transition-all border-2 border-transparent ${selectedFileId === file.id ? 'border-yellow-400' : ''}`;

    if (currentFileView === 'grid') {
        return `
            <div class="${cardClass}" id="file-${file.id}" data-file-id="${file.id}">
                <div class="flex justify-between items-start mb-4">
                    <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                        <i class="${iconClass} text-2xl text-gray-300"></i>
                    </div>
                    <div class="flex space-x-3 text-lg">${actions}</div>
                </div>
                <div class="mb-3">
                    <h4 class="text-white font-semibold text-sm truncate font-orbitron" title="${file.name}">${file.name}</h4>
                    <p class="text-gray-400 text-xs mt-1">${formatFileSize(file.size)} • ${file.extension.toUpperCase()}</p>
                    <p class="text-gray-500 text-xs">${new Date(file.uploadDate).toLocaleDateString()}</p>
                </div>
                ${file.status === 'uploading' ? `
                    <div>
                        <div class="bg-gray-600 rounded-full h-2 mb-1"><div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" style="width: ${file.progress}%"></div></div>
                        <p class="text-xs text-gray-400 text-center">${Math.round(file.progress)}%</p>
                    </div>
                ` : `
                    <div class="flex items-center justify-between text-xs">
                        <span class="px-2 py-1 rounded text-white ${file.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}">${file.status}</span>
                        <span class="text-gray-500 truncate">${file.user}</span>
                    </div>
                `}
            </div>
        `;
    } else { // List view
        return `
            <div class="${cardClass}" id="file-${file.id}" data-file-id="${file.id}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4 flex-1 min-w-0">
                        <div class="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0"><i class="${iconClass} text-xl text-gray-300"></i></div>
                        <div class="flex-1 min-w-0">
                            <h4 class="text-white font-semibold truncate font-orbitron">${file.name}</h4>
                            <p class="text-gray-400 text-sm truncate">${formatFileSize(file.size)} • ${new Date(file.uploadDate).toLocaleString()} • ${file.user}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        ${file.status === 'uploading' ? `
                            <div class="w-32">
                                <div class="bg-gray-600 rounded-full h-2"><div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" style="width: ${file.progress}%"></div></div>
                                <p class="text-xs text-gray-400 mt-1">${Math.round(file.progress)}%</p>
                            </div>
                        ` : `<span class="px-3 py-1 rounded text-white text-sm ${file.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}">${file.status}</span>`}
                        <div class="flex space-x-3 text-lg">${actions}</div>
                    </div>
                </div>
            </div>
        `;
    }
}


function getFileIcon(extension) {
    const iconMap = {
        'csv': 'fas fa-file-csv', 'xlsx': 'fas fa-file-excel', 'pdf': 'fas fa-file-pdf',
        'jpg': 'fas fa-file-image', 'jpeg': 'fas fa-file-image', 'png': 'fas fa-file-image',
        'docx': 'fas fa-file-word', 'doc': 'fas fa-file-word', 'ppt': 'fas fa-file-powerpoint',
        'pptx': 'fas fa-file-powerpoint', 'shp': 'fas fa-globe-americas', 'gdb': 'fas fa-database',
        'kmz': 'fas fa-map-marked-alt', 'kml': 'fas fa-map-marked-alt'
    };
    return iconMap[extension] || 'fas fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateFileId() {
    return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function saveFilesToStorage() {
    localStorage.setItem('gis_all_files', JSON.stringify(uploadedFiles));
}

function showUploadNotification(message, type = 'info') {
    const container = document.getElementById('toast-container') || document.body;
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-[100] p-4 rounded-lg shadow-lg text-white max-w-md transition-all ${
        type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.innerHTML = `<div class="flex items-start"><i class="fas ${
        type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'
    } mr-3 mt-1"></i><div>${message}</div></div>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transform = 'translateX(calc(100% + 1rem))';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// MANAGEMENT FUNCTIONS
function showAllFiles() {
    const allFiles = JSON.parse(localStorage.getItem('gis_all_files') || '[]');
    uploadedFiles = allFiles;
    currentFilter = '';
    currentSort = 'newest';
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('fileSortOrder').value = 'newest';
    displayUploadedFiles();
    showUploadNotification(`Showing all ${allFiles.length} files.`, 'info');
}

function clearAllFiles() {
    if (confirm('Are you sure you want to delete all uploaded files? This action cannot be undone.')) {
        uploadedFiles = [];
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification('All files cleared successfully.', 'success');
    }
}

function resetUploadArea() {
    document.getElementById('fileInput').value = '';
    resetFileFilters();
    showUploadNotification('Upload area reset.', 'info');
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
    currentFilter = '';
    currentSort = 'newest';
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('fileSortOrder').value = 'newest';
    displayUploadedFiles();
}

function uploadFromUrl() {
    document.getElementById('urlUploadModal').classList.remove('hidden');
}

function closeUrlUploadModal() {
    document.getElementById('urlUploadModal').classList.add('hidden');
    document.getElementById('urlUploadForm').reset();
}

function updateFileStatistics(filteredCount) {
    document.getElementById('totalFilesCount').textContent = uploadedFiles.length;
    document.getElementById('totalSizeCount').textContent = formatFileSize(uploadedFiles.reduce((s, f) => s + f.size, 0));
    document.getElementById('uploadingCount').textContent = uploadedFiles.filter(f => f.status === 'uploading').length;
    document.getElementById('completedCount').textContent = uploadedFiles.filter(f => f.status === 'completed').length;
    document.getElementById('noFilesPlaceholder').style.display = filteredCount === 0 ? 'block' : 'none';
}

function downloadFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    if (file.originalFile) {
        createFileDownload(file.originalFile, file.name);
    } else {
        showUploadNotification('Original file not available for download.', 'error');
    }
}

function removeFile(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification('File removed.', 'success');
    }
}

function editFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    const newName = prompt('Enter new file name:', file.name);
    if (newName && newName.trim() !== '') {
        file.name = newName.trim();
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification('File name updated.', 'success');
    }
}

function previewFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    showFilePreviewModal(file);
}

function showFilePreviewModal(file) {
    closeFilePreviewModal(); // Close any existing modal
    const modal = document.createElement('div');
    modal.id = 'filePreviewModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="glow-modal max-w-4xl w-full max-h-full overflow-auto relative">
            <div class="flex justify-between items-center p-6 border-b border-gray-700">
                <h3 class="text-white font-bold text-xl font-orbitron">${file.name}</h3>
                <button onclick="closeFilePreviewModal()" class="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div class="p-6">${generatePreviewContent(file)}</div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => e.target === modal && closeFilePreviewModal());
}

function closeFilePreviewModal() {
    const modal = document.getElementById('filePreviewModal');
    if (modal) modal.remove();
}

function generatePreviewContent(file) {
    const extension = file.extension.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension) && file.originalFile) {
        return `<img src="${URL.createObjectURL(file.originalFile)}" class="max-w-full max-h-[70vh] mx-auto" alt="Preview">`;
    }
    return `<div class="text-center p-8"><i class="${getFileIcon(extension)} text-8xl text-gray-500 mb-4"></i><p class="text-gray-400">No preview available for this file type.</p></div>`;
}


function triggerBrowseFiles() {
    document.getElementById('fileInput').click();
}

function createFileDownload(originalFile, fileName) {
    try {
        const url = URL.createObjectURL(originalFile);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('Download failed:', error);
        return false;
    }
}

// Functions for top-level buttons
function editSelectedFile() {
    if (!selectedFileId) {
        showUploadNotification('Please select a file to edit.', 'error');
        return;
    }
    editFile(selectedFileId);
}

function deleteSelectedFile() {
    if (!selectedFileId) {
        showUploadNotification('Please select a file to delete.', 'error');
        return;
    }
    removeFile(selectedFileId);
}


document.addEventListener('DOMContentLoaded', initializeUploadArea);

// Assign functions to window object
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
window.initializeUploadArea = initializeUploadArea;
window.handleFileSelect = handleFileSelect;
window.createFileDownload = createFileDownload;
window.showFilePreviewModal = showFilePreviewModal;
window.closeFilePreviewModal = closeFilePreviewModal;
window.triggerBrowseFiles = triggerBrowseFiles;
window.editSelectedFile = editSelectedFile;
window.deleteSelectedFile = deleteSelectedFile;

document.addEventListener('DOMContentLoaded', function() {
    const urlUploadForm = document.getElementById('urlUploadForm');
    if (urlUploadForm) {
        urlUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const url = document.getElementById('fileUrl').value;
            const customName = document.getElementById('customFileName').value;
            const fileName = customName || url.split('/').pop().split('?')[0] || 'downloaded_file';
            const fileExt = fileName.split('.').pop().toLowerCase();
            const fileObj = {
                id: generateFileId(),
                name: fileName,
                size: Math.floor(Math.random() * 50 * 1024 * 1024), // Random size up to 50MB
                type: 'url-download',
                extension: fileExt,
                uploadDate: new Date().toISOString(),
                status: 'uploading',
                progress: 0,
                user: (JSON.parse(localStorage.getItem('gis-user-profile') || '{}')).name || 'Unknown',
                location: (JSON.parse(localStorage.getItem('gis-user-profile') || '{}')).location || 'Unknown',
                source: 'url',
                originalUrl: url
            };
            uploadedFiles.unshift(fileObj);
            displayUploadedFiles();
            closeUrlUploadModal();
            simulateUpload(fileObj);
        });
    }
});
