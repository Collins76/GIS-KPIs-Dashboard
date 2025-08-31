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
    const urlUploadForm = document.getElementById('urlUploadForm');
    
    if (!uploadArea || !fileInput) return;
    
    // Drag and drop events
    uploadArea.addEventListener('dragenter', handleDragEnter, false);
    uploadArea.addEventListener('dragover', handleDragOver, false);
    uploadArea.addEventListener('dragleave', handleDragLeave, false);
    uploadArea.addEventListener('drop', handleDrop, false);
    
    // File input change event
    fileInput.addEventListener('change', handleFileSelect, false);

    if (urlUploadForm) {
        urlUploadForm.addEventListener('submit', handleUrlUpload);
    }

    // Load files from localStorage
    loadFilesFromStorage();
    displayUploadedFiles();
}


function handleUrlUpload(e) {
    e.preventDefault();
    
    const url = document.getElementById('fileUrl').value;
    const customName = document.getElementById('customFileName').value;
    
    if (!url) {
        showUploadNotification('Please enter a valid URL.', 'error');
        return;
    }

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
        user: 'URL Upload',
        location: 'Web',
        source: 'url',
        originalUrl: url
    };
    
    uploadedFiles.push(fileObj);
    updateFileStatistics();
    displayUploadedFiles();
    closeUrlUploadModal();
    
    // Simulate upload
    simulateUpload(fileObj);
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
    this.classList.add('dragging');
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
function uploadFile(file) {
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
        originalFile: file // Store reference to original file for manual download
    };
    
    uploadedFiles.unshift(fileObj);
    displayUploadedFiles();
    
    // Simulate upload progress
    simulateUpload(fileObj, file);
}

// Simulate upload (replace with actual upload logic)
function simulateUpload(fileObj, file) {
    fileObj.status = 'uploading';
    fileObj.progress = 0;
    
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
    // This is a placeholder for actual data processing logic
    console.log(`Processing data for: ${fileObj.name}`);
}

// Display uploaded files
function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;
    
    // Filter and Sort
    let filesToDisplay = [...uploadedFiles];
    
    if (currentFilter) {
        filesToDisplay = filesToDisplay.filter(file => {
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
    
    filesToDisplay.sort((a, b) => {
        switch (currentSort) {
            case 'newest': return new Date(b.uploadDate) - new Date(a.uploadDate);
            case 'oldest': return new Date(a.uploadDate) - new Date(b.uploadDate);
            case 'largest': return b.size - a.size;
            case 'smallest': return a.size - b.size;
            case 'name': return a.name.localeCompare(b.name);
            default: return 0;
        }
    });
    
    updateFileStatistics(filesToDisplay.length, uploadedFiles.length > 0 ? filesToDisplay.reduce((acc, f) => acc + f.size, 0) : 0);

    const placeholder = document.getElementById('noFilesPlaceholder');
    if(filesToDisplay.length === 0) {
      container.innerHTML = '';
      if(placeholder) placeholder.classList.remove('hidden');
    } else {
      if(placeholder) placeholder.classList.add('hidden');
    }
    
    container.className = currentFileView === 'grid' ? 
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 
        'space-y-4';
    
    container.innerHTML = filesToDisplay.map(file => {
        return currentFileView === 'grid' ? createFileCardGrid(file) : createFileCardList(file);
    }).join('');
}


function createFileCardGrid(file) {
    const iconClass = getFileIcon(file.extension);
    const statusColor = file.status === 'completed' ? 'green' : file.status === 'error' ? 'red' : 'yellow';

    return `
        <div class="kpi-card p-4 flex flex-col justify-between" id="file-${file.id}" onclick="selectFile('${file.id}')" style="border-color: ${selectedFileId === file.id ? 'hsl(var(--primary))' : 'rgba(245, 158, 11, 0.2)'};">
            <div>
                <div class="flex justify-between items-start mb-4">
                    <div class="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                        <i class="${iconClass} text-2xl text-gray-300"></i>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="event.stopPropagation(); downloadFile('${file.id}')" class="text-blue-400 hover:text-blue-300 transition-colors" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="event.stopPropagation(); previewFile('${file.id}')" class="text-green-400 hover:text-green-300 transition-colors" title="Preview">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="event.stopPropagation(); removeFile('${file.id}')" class="text-red-400 hover:text-red-300 transition-colors" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="mb-3">
                    <h4 class="text-white font-semibold text-sm truncate font-orbitron" title="${file.name}">${file.name}</h4>
                    <p class="text-gray-400 text-xs mt-1">
                        ${formatFileSize(file.size)} • ${file.extension.toUpperCase()}
                    </p>
                    <p class="text-gray-500 text-xs mt-1">
                        ${new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                </div>
            </div>
            
            <div>
                ${file.status === 'uploading' ? `
                    <div class="mb-1">
                        <div class="bg-gray-700 rounded-full h-2 mb-1">
                            <div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" 
                                 style="width: ${file.progress}%"></div>
                        </div>
                        <p class="text-xs text-gray-400 text-center">${Math.round(file.progress)}%</p>
                    </div>
                ` : `
                    <div class="flex items-center justify-between text-xs">
                        <span class="px-2 py-1 rounded-full text-white font-semibold ${
                            file.status === 'completed' ? 'bg-green-500/80' : 
                            file.status === 'error' ? 'bg-red-500/80' : 'bg-yellow-500/80'
                        }">${file.status}</span>
                        <span class="text-gray-500 truncate">${file.user}</span>
                    </div>
                `}
            </div>
        </div>
    `;
}

function createFileCardList(file) {
    const iconClass = getFileIcon(file.extension);
    return `
        <div class="kpi-card p-4 flex items-center justify-between" id="file-${file.id}" onclick="selectFile('${file.id}')" style="border-color: ${selectedFileId === file.id ? 'hsl(var(--primary))' : 'rgba(245, 158, 11, 0.2)'};">
            <div class="flex items-center space-x-4 flex-1 min-w-0">
                <div class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                    <i class="${iconClass} text-xl text-gray-300"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-white font-semibold truncate font-orbitron">${file.name}</h4>
                    <p class="text-gray-400 text-sm truncate">
                        ${formatFileSize(file.size)} • ${file.extension.toUpperCase()} • ${new Date(file.uploadDate).toLocaleString()} • ${file.user}
                    </p>
                </div>
            </div>
            
            <div class="flex items-center space-x-6">
                ${file.status === 'uploading' ? `
                    <div class="w-32">
                        <div class="bg-gray-700 rounded-full h-2">
                            <div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" 
                                 style="width: ${file.progress}%"></div>
                        </div>
                        <p class="text-xs text-gray-400 mt-1">${Math.round(file.progress)}%</p>
                    </div>
                ` : `
                    <span class="px-3 py-1 rounded-full text-white text-sm font-semibold ${
                        file.status === 'completed' ? 'bg-green-500/80' : 
                        file.status === 'error' ? 'bg-red-500/80' : 'bg-yellow-500/80'
                    }">${file.status}</span>
                `}
                
                <div class="flex space-x-2">
                     <button onclick="event.stopPropagation(); downloadFile('${file.id}')" class="text-blue-400 hover:text-blue-300 transition-colors" title="Download">
                        <i class="fas fa-download text-lg"></i>
                    </button>
                    <button onclick="event.stopPropagation(); previewFile('${file.id}')" class="text-green-400 hover:text-green-300 transition-colors" title="Preview">
                        <i class="fas fa-eye text-lg"></i>
                    </button>
                    <button onclick="event.stopPropagation(); removeFile('${file.id}')" class="text-red-400 hover:text-red-300 transition-colors" title="Delete">
                        <i class="fas fa-trash text-lg"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function selectFile(fileId) {
    selectedFileId = selectedFileId === fileId ? null : fileId;
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
        'shp': 'fas fa-globe-americas',
        'gdb': 'fas fa-database',
        'kmz': 'fas fa-map-marked-alt',
        'kml': 'fas fa-map-marked-alt'
    };
    
    return iconMap[extension] || 'fas fa-file';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
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
        showUploadNotification('File removed successfully', 'success');
    }
};

// Show upload notification
function showUploadNotification(message, type = 'info') {
    const existing = document.querySelector('.upload-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `upload-notification fixed bottom-4 right-4 z-[100] p-4 rounded-lg shadow-lg transition-all transform-gpu translate-x-full ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white max-w-md`;
    
    notification.innerHTML = `
        <div class="flex items-start">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'
            } mr-3 mt-1 fa-lg"></i>
            <div>
                <p class="font-semibold">${type.charAt(0).toUpperCase() + type.slice(1)}</p>
                <p class="text-sm mt-1" style="white-space: pre-line;">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
        notification.style.transform = 'translateX(calc(100% + 1rem))';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// 🔥 ENHANCED FILE MANAGEMENT FUNCTIONS
function showAllFiles() {
    loadFilesFromStorage(); // This will show all files
    showUploadNotification(`Showing ${uploadedFiles.length} files`, 'info');
}

function clearAllFiles() {
    if (confirm('Are you sure you want to delete all uploaded files? This action cannot be undone.')) {
        uploadedFiles = [];
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification('All files cleared successfully', 'success');
    }
}

function resetUploadArea() {
    document.getElementById('fileInput').value = '';
    showUploadNotification('Upload area reset', 'info');
}

function toggleFileView(view) {
    if (view !== 'grid' && view !== 'list') return;
    currentFileView = view;
    
    const gridBtn = document.getElementById('gridViewBtn');
    const listBtn = document.getElementById('listViewBtn');

    if (gridBtn && listBtn) {
       gridBtn.classList.toggle('bg-yellow-500', view === 'grid');
       gridBtn.classList.toggle('text-white', view === 'grid');
       gridBtn.classList.toggle('bg-gray-600', view !== 'grid');
       listBtn.classList.toggle('bg-yellow-500', view === 'list');
       listBtn.classList.toggle('text-white', view === 'list');
       listBtn.classList.toggle('bg-gray-600', view !== 'list');
    }
    
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
    const form = document.getElementById('urlUploadForm');
    if (form) form.reset();
}

function updateFileStatistics(filteredCount, totalSize) {
    const totalFiles = uploadedFiles.length;
    const uploading = uploadedFiles.filter(f => f.status === 'uploading').length;
    const completed = uploadedFiles.filter(f => f.status === 'completed').length;
    
    document.getElementById('totalFilesCount').textContent = totalFiles;
    document.getElementById('totalSizeCount').textContent = formatFileSize(totalSize);
    document.getElementById('uploadingCount').textContent = uploading;
    document.getElementById('completedCount').textContent = completed;
}

// Manual Download Helper Function
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
}

function downloadFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    showUploadNotification(`📥 Downloading ${file.name}...`, 'info');
    
    if (file.originalFile) {
        if (!createFileDownload(file.originalFile, file.name)) {
            showUploadNotification(`Download failed for ${file.name}`, 'error');
        }
    } else {
        createMockDownload(file);
    }
}


function editSelectedFile() {
    if (!selectedFileId) {
        showUploadNotification('No file selected to edit.', 'error');
        return;
    }
    previewFile(selectedFileId, true); // Open in edit mode
}

function deleteSelectedFile() {
     if (!selectedFileId) {
        showUploadNotification('No file selected to delete.', 'error');
        return;
    }
    removeFile(selectedFileId);
}


function previewFile(fileId, isEditing = false) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    showFilePreviewModal(file, isEditing);
}

function showFilePreviewModal(file, isEditing) {
    const existingModal = document.getElementById('filePreviewModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'filePreviewModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    
    const previewContent = isEditing ? generateEditContent(file) : generatePreviewContent(file);
    
    modal.innerHTML = `
        <div class="glow-modal max-w-4xl w-full max-h-full overflow-auto relative">
            <div class="flex justify-between items-center p-6 border-b border-gray-700">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                        <i class="${getFileIcon(file.extension)} text-2xl text-gray-300"></i>
                    </div>
                    <div>
                        <h3 class="text-white font-bold text-xl font-orbitron">${isEditing ? "Editing" : "Viewing"}: ${file.name}</h3>
                        <p class="text-gray-400">
                            ${formatFileSize(file.size)} • ${file.extension.toUpperCase()}
                        </p>
                    </div>
                </div>
                <button onclick="closeFilePreviewModal()" class="text-gray-400 hover:text-white text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="p-6">${previewContent}</div>
            
            <div class="flex justify-between items-center p-6 border-t border-gray-700">
                <div class="text-sm text-gray-400">Uploaded by ${file.user}</div>
                <div class="flex space-x-3">
                    ${isEditing ? `
                        <button onclick="saveFileChanges('${file.id}')" class="glow-button">
                            <i class="fas fa-save mr-2"></i>Save Changes
                        </button>
                    ` : `
                        <button onclick="downloadFile('${file.id}')" class="glow-button">
                            <i class="fas fa-download mr-2"></i>Download
                        </button>
                    `}
                    <button onclick="closeFilePreviewModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', e => e.target === modal && closeFilePreviewModal());
    
    showUploadNotification(`👁️ ${isEditing ? 'Editing' : 'Previewing'} ${file.name}`, 'info');
}

function generateEditContent(file) {
    return `
        <div class="space-y-4">
            <div>
                <label class="text-yellow-400 font-semibold block mb-2">File Name</label>
                <input id="editFileName" type="text" class="glow-input w-full" value="${file.name}">
            </div>
            <div>
                 <label class="text-yellow-400 font-semibold block mb-2">Uploader Name</label>
                 <input id="editFileUser" type="text" class="glow-input w-full" value="${file.user}">
            </div>
        </div>
    `;
}

function saveFileChanges(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if(!file) return;

    const newName = document.getElementById('editFileName').value;
    const newUser = document.getElementById('editFileUser').value;

    if(newName.trim()) file.name = newName;
    if(newUser.trim()) file.user = newUser;

    saveFilesToStorage();
    displayUploadedFiles();
    closeFilePreviewModal();
    showUploadNotification('File details updated!', 'success');
}


function generatePreviewContent(file) {
    const extension = file.extension.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension) && file.originalFile) {
        return `<img src="${URL.createObjectURL(file.originalFile)}" class="max-w-full max-h-[60vh] mx-auto rounded-lg" alt="File Preview">`;
    }
    
    const content = {
        'pdf': { icon: 'fa-file-pdf', color: 'red-400', title: 'PDF Document', desc: 'PDF files can be downloaded and viewed with a PDF reader.'},
        'xlsx': { icon: 'fa-file-excel', color: 'green-400', title: 'Data File', desc: 'Spreadsheet data that can be imported.'},
        'csv': { icon: 'fa-file-csv', color: 'green-400', title: 'Data File', desc: 'Spreadsheet data that can be imported.'},
        'shp': { icon: 'fa-globe-americas', color: 'blue-400', title: 'GIS Data File', desc: 'Geographic data for GIS applications.'},
    }[extension] || { icon: getFileIcon(extension), color: 'gray-400', title: `${extension.toUpperCase()} File`, desc: 'File preview not available for this type.' };

    return `
        <div class="text-center">
            <div class="bg-gray-800 rounded-lg p-8 mb-4">
                <i class="fas ${content.icon} text-8xl text-${content.color} mb-4"></i>
                <h4 class="text-white font-semibold mb-2">${content.title}</h4>
                <p class="text-gray-400">${content.desc}</p>
                 <div class="mt-4 p-4 bg-yellow-500 bg-opacity-20 rounded">
                    <p class="text-yellow-400 text-sm">
                        <i class="fas fa-download mr-2"></i>
                        Click download to save this file to your device
                    </p>
                </div>
            </div>
        </div>
    `;
}

function closeFilePreviewModal() {
    const modal = document.getElementById('filePreviewModal');
    if (modal) modal.remove();
}

function saveFilesToStorage() {
    try {
        localStorage.setItem('gis_all_files', JSON.stringify(uploadedFiles.map(f => {
            const { originalFile, ...rest } = f; // Don't store the file blob in localStorage
            return rest;
        })));
    } catch(e) {
        console.error("Could not save files to local storage", e);
    }
}

function loadFilesFromStorage() {
    const storedFiles = localStorage.getItem('gis_all_files');
    if (storedFiles) {
        uploadedFiles = JSON.parse(storedFiles);
    } else {
        uploadedFiles = [];
    }
    displayUploadedFiles();
}

// Initial load
document.addEventListener('DOMContentLoaded', initializeUploadArea);

// Attach functions to window object
window.initializeUploadArea = initializeUploadArea;
window.triggerBrowseFiles = () => document.getElementById('fileInput')?.click();
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
window.editSelectedFile = editSelectedFile;
window.deleteSelectedFile = deleteSelectedFile;
window.closeFilePreviewModal = closeFilePreviewModal;
window.saveFileChanges = saveFileChanges;
window.selectFile = selectFile;
