
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

// Initialize Upload Area
function initializeUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadArea || !fileInput) {
        console.warn("Upload area or file input not found. Skipping initialization.");
        return;
    }
    
    // Clear previous listeners to avoid duplicates
    const newUploadArea = uploadArea.cloneNode(true);
    uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);

    const newFileInput = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(newFileInput, fileInput);

    // Drag and drop events
    newUploadArea.addEventListener('dragenter', handleDragEnter);
    newUploadArea.addEventListener('dragover', handleDragOver);
    newUploadArea.addEventListener('dragleave', handleDragLeave);
    newUploadArea.addEventListener('drop', handleDrop);
    
    // File input change event
    newFileInput.addEventListener('change', handleFileSelect);

    // Button click events
    document.querySelector('.glow-button[onclick*="browseFiles"]')?.addEventListener('click', () => newFileInput.click());
    document.querySelector('button[onclick*="uploadFromUrl"]')?.addEventListener('click', uploadFromUrl);
    document.getElementById('urlUploadForm')?.addEventListener('submit', handleUrlUploadSubmit);
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
function simulateUpload(fileObj, file) {
    const progressInterval = setInterval(() => {
        fileObj.progress += Math.random() * 20 + 5;
        
        if (fileObj.progress >= 100) {
            fileObj.progress = 100;
            fileObj.status = 'completed';
            clearInterval(progressInterval);
            
            saveFilesToStorage();
            
            if (file && (fileObj.extension === 'csv' || fileObj.extension === 'xlsx')) {
                processDataFile(file, fileObj);
            }
            
            showUploadNotification(`${fileObj.name} uploaded successfully`, 'success');
        }
        
        updateFileStatistics();
        displayUploadedFiles();
    }, 300);
};


// Process data file (CSV or Excel)
async function processDataFile(file, fileObj) {
    // This is a placeholder for actual data processing
    console.log(`Processing data file: ${fileObj.name}`);
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

// Show upload notification
function showUploadNotification(message, type = 'info') {
    const toastContainer = document.querySelector('[data-radix-toast-viewport-name="radix-toast-viewport-3"]');

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
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                'fa-info-circle'
            } mr-3 mt-1"></i>
            <div>
                <p class="font-semibold">${type.charAt(0).toUpperCase() + type.slice(1)}</p>
                <p class="text-sm mt-1" style="white-space: pre-line;">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// 🔥 ENHANCED FILE MANAGEMENT FUNCTIONS

window.showAllFiles = function() {
    const allFiles = JSON.parse(localStorage.getItem('gis_all_files') || '[]');
    uploadedFiles = allFiles;
    updateFileStatistics();
    displayUploadedFiles();
    showUploadNotification(`Showing ${allFiles.length} files`, 'info');
}

window.clearAllFiles = function() {
    if (confirm('Are you sure you want to delete all uploaded files? This action cannot be undone.')) {
        uploadedFiles = [];
        localStorage.removeItem('gis_all_files');
        updateFileStatistics();
        displayUploadedFiles();
        showUploadNotification('All files cleared successfully', 'success');
    }
}

window.resetUploadArea = function() {
    document.getElementById('fileInput').value = '';
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('fileSortOrder').value = 'newest';
    currentFilter = '';
    currentSort = 'newest';
    filterFiles();
    showUploadNotification('Upload area reset', 'info');
}

window.toggleFileView = function(view) {
    currentFileView = view;
    document.getElementById('gridViewBtn').classList.toggle('bg-yellow-500', view === 'grid');
    document.getElementById('gridViewBtn').classList.toggle('bg-gray-600', view !== 'grid');
    document.getElementById('listViewBtn').classList.toggle('bg-yellow-500', view === 'list');
    document.getElementById('listViewBtn').classList.toggle('bg-gray-600', view !== 'list');
    displayUploadedFiles();
}

window.filterFiles = function() {
    currentFilter = document.getElementById('fileTypeFilter').value;
    displayUploadedFiles();
}

window.sortFiles = function() {
    currentSort = document.getElementById('fileSortOrder').value;
    displayUploadedFiles();
}

window.resetFileFilters = function() {
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('fileSortOrder').value = 'newest';
    currentFilter = '';
    currentSort = 'newest';
    displayUploadedFiles();
}

window.uploadFromUrl = function() {
    document.getElementById('urlUploadModal').classList.remove('hidden');
}

window.closeUrlUploadModal = function() {
    document.getElementById('urlUploadModal').classList.add('hidden');
    document.getElementById('urlUploadForm').reset();
}

function handleUrlUploadSubmit(e) {
    e.preventDefault();
    const url = document.getElementById('fileUrl').value;
    const customName = document.getElementById('customFileName').value;
    
    const fileName = customName || url.split('/').pop().split('?')[0] || 'downloaded_file';
    const fileSize = Math.floor(Math.random() * 10000000) + 1000000;
    const currentUser = JSON.parse(localStorage.getItem('gis-user-profile') || '{}');
    
    const fileObj = {
        id: generateFileId(),
        name: fileName,
        size: fileSize,
        type: 'application/octet-stream',
        extension: fileName.split('.').pop().toLowerCase(),
        uploadDate: new Date().toISOString(),
        status: 'uploading',
        progress: 0,
        user: currentUser.name || 'Unknown',
        location: currentUser.location || 'Unknown',
        source: 'url',
        originalUrl: url
    };
    
    uploadedFiles.push(fileObj);
    updateFileStatistics();
    displayUploadedFiles();
    closeUrlUploadModal();
    
    simulateUpload(fileObj, null);
}

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
        placeholder.style.display = totalFiles > 0 ? 'none' : 'block';
    }
}

function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;

    let filteredFiles = uploadedFiles;
    if (currentFilter) {
         filteredFiles = uploadedFiles.filter(file => {
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
        container.innerHTML = `<div class="col-span-full text-center py-12">
            <i class="fas fa-search text-6xl text-gray-600 mb-4"></i>
            <p class="text-gray-400 text-lg">No files found for this filter.</p>
        </div>`;
        return;
    }

    container.className = currentFileView === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
        : 'space-y-3';

    container.innerHTML = filteredFiles.map(file => {
        const iconClass = getFileIcon(file.extension);
        const statusColor = file.status === 'completed' ? 'green' : file.status === 'error' ? 'red' : 'yellow';

        const actionButtons = `
             <div class="flex space-x-2">
                <button onclick="editFile('${file.id}')" class="text-blue-400 hover:text-blue-300" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="previewFile('${file.id}')" class="text-green-400 hover:text-green-300" title="Preview">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="downloadFile('${file.id}')" class="text-indigo-400 hover:text-indigo-300" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button onclick="removeFile('${file.id}')" class="text-red-400 hover:text-red-300" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        if (currentFileView === 'grid') {
            return `
                <div class="location-card p-4" id="file-${file.id}">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                            <i class="${iconClass} text-2xl text-gray-300"></i>
                        </div>
                        ${actionButtons}
                    </div>
                    <div class="mb-3">
                        <h4 class="text-white font-semibold text-sm truncate font-orbitron" title="${file.name}">${file.name}</h4>
                        <p class="text-gray-400 text-xs mt-1">${formatFileSize(file.size)} • ${file.extension.toUpperCase()}</p>
                        <p class="text-gray-500 text-xs">${new Date(file.uploadDate).toLocaleDateString()}</p>
                    </div>
                    ${file.status === 'uploading' ? `
                        <div class="mb-3">
                            <div class="bg-gray-600 rounded-full h-2 mb-1"><div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" style="width: ${file.progress}%"></div></div>
                            <p class="text-xs text-gray-400 text-center">${Math.round(file.progress)}%</p>
                        </div>
                    ` : `
                        <div class="flex items-center justify-between text-xs">
                            <span class="px-2 py-1 rounded text-white bg-${statusColor}-500">${file.status}</span>
                            <span class="text-gray-500">${file.user}</span>
                        </div>
                    `}
                </div>
            `;
        } else { // List view
            return `
                 <div class="location-card p-4" id="file-${file.id}">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4 flex-1 min-w-0">
                            <div class="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0"><i class="${iconClass} text-xl text-gray-300"></i></div>
                            <div class="flex-1 min-w-0">
                                <h4 class="text-white font-semibold truncate font-orbitron">${file.name}</h4>
                                <p class="text-gray-400 text-sm">${formatFileSize(file.size)} • ${new Date(file.uploadDate).toLocaleString()} • ${file.user}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
                            ${file.status === 'uploading' ? `
                                <div class="w-32">
                                    <div class="bg-gray-600 rounded-full h-2"><div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" style="width: ${file.progress}%"></div></div>
                                    <p class="text-xs text-gray-400 mt-1">${Math.round(file.progress)}%</p>
                                </div>
                            ` : `<span class="px-3 py-1 rounded text-white text-sm bg-${statusColor}-500">${file.status}</span>`}
                            ${actionButtons}
                        </div>
                    </div>
                </div>
            `;
        }
    }).join('');
}


// Download, Preview, Edit, Remove functions
window.downloadFile = function(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    showUploadNotification(`📥 Downloading ${file.name}...`, 'info');
    if (file.originalFile) {
        createFileDownload(file.originalFile, file.name);
    } else {
        createMockDownload(file);
    }
}

window.createFileDownload = function(originalFile, fileName) {
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
        console.error("Download failed", error);
        return false;
    }
}

function createMockDownload(fileObj) {
    const content = `Mock file: ${fileObj.name}\nSize: ${formatFileSize(fileObj.size)}`;
    const blob = new Blob([content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileObj.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

window.previewFile = function(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    showFilePreviewModal(file);
}

window.editFile = function(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    const newName = prompt("Enter new file name:", file.name);
    if (newName && newName.trim() !== "") {
        file.name = newName.trim();
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification("File renamed successfully!", "success");
    }
}

window.removeFile = function(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification('File removed', 'success');
    }
}


window.showFilePreviewModal = function(file) {
    closeFilePreviewModal();
    const modal = document.createElement('div');
    modal.id = 'filePreviewModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.onclick = (e) => { if (e.target === modal) closeFilePreviewModal(); };
    
    let previewContent;
    if (['jpg', 'jpeg', 'png'].includes(file.extension) && file.originalFile) {
        previewContent = `<img src="${URL.createObjectURL(file.originalFile)}" alt="Preview" class="max-w-full max-h-[60vh] mx-auto rounded-lg">`;
    } else {
        previewContent = `<div class="text-center bg-gray-800 p-8 rounded-lg">
            <i class="${getFileIcon(file.extension)} text-8xl text-gray-500 mb-4"></i>
            <p class="text-gray-400">No preview available for this file type.</p>
        </div>`;
    }
    
    modal.innerHTML = `
        <div class="glow-container max-w-4xl w-full max-h-full overflow-auto flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 class="text-white font-bold text-lg font-orbitron truncate pr-4">${file.name}</h3>
                <button onclick="closeFilePreviewModal()" class="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div class="p-6 flex-grow">${previewContent}</div>
            <div class="flex justify-end p-4 border-t border-gray-700">
                <button onclick="downloadFile('${file.id}')" class="glow-button">Download</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.closeFilePreviewModal = function() {
    const modal = document.getElementById('filePreviewModal');
    if (modal) modal.remove();
}

function saveFilesToStorage() {
    try {
        const storableFiles = uploadedFiles.map(({ originalFile, ...rest }) => rest);
        localStorage.setItem('gis_all_files', JSON.stringify(storableFiles));
    } catch (e) {
        console.error("Could not save files to storage:", e);
        // Fallback for files being too large for localStorage
        localStorage.setItem('gis_all_files', '[]');
    }
}

    