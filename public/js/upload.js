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
    uploadArea.addEventListener('dragenter', handleDragEnter);
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // File input change event
    fileInput.addEventListener('change', handleFileSelect);

    if (urlUploadForm) {
        urlUploadForm.addEventListener('submit', handleUrlUpload);
    }

    // Load files from storage
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
        user: 'Admin',
        location: 'CHQ',
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
    e.target.value = ''; // Reset file input
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
        user: 'Admin',
        location: 'CHQ',
        originalFile: file 
    };
    
    uploadedFiles.unshift(fileObj);
    displayUploadedFiles();
    
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
            
            if (file && (fileObj.extension === 'csv' || fileObj.extension === 'xlsx')) {
                processDataFile(file, fileObj);
            }
            
            saveFilesToStorage();
            showUploadNotification(`${fileObj.name} uploaded successfully`, 'success');
        }
        
        updateFileProgress(fileObj);
    }, 500);
}


// Process data file (CSV or Excel)
async function processDataFile(file, fileObj) {
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            if (fileObj.extension === 'csv') {
                const data = parseCSV(e.target.result);
                if (data && data.length > 0) {
                     showUploadNotification(`Data from ${fileObj.name} is ready for processing.`, 'success');
                }
            }
        } catch (error) {
            console.error('Error processing file:', error);
            showUploadNotification(`Error processing ${fileObj.name}`, 'error');
        }
    };
    
    if (fileObj.extension === 'csv') {
        reader.readAsText(file);
    }
}

// Parse CSV
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            data.push(row);
        }
    }
    return data;
}

// Display uploaded files
function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;

    let filteredFiles = [...uploadedFiles];
    
    if (currentFilter) {
        filteredFiles = uploadedFiles.filter(file => {
            const ext = file.extension.toLowerCase();
            switch (currentFilter) {
                case 'csv': return ext === 'csv';
                case 'xlsx': return ext === 'xlsx';
                case 'pdf': return ext === 'pdf';
                case 'image': return ['jpg', 'jpeg', 'png'].includes(ext);
                case 'doc': return ['doc', 'docx'].includes(ext);
                case 'gis': return ['shp', 'gdb', 'kml', 'kmz'].includes(ext);
                case 'presentation': return ['ppt', 'pptx'].includes(ext);
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
        container.className = '';
        container.innerHTML = currentFilter ? `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-6xl text-gray-600 mb-4"></i>
                <p class="text-gray-400 text-lg">No files found matching the current filter</p>
                <button onclick="resetFileFilters()" class="mt-4 glow-button">
                    <i class="fas fa-undo mr-2"></i>Reset Filters
                </button>
            </div>
        ` : '';
        document.getElementById('noFilesPlaceholder').style.display = uploadedFiles.length === 0 ? 'flex' : 'none';
        return;
    }

    document.getElementById('noFilesPlaceholder').style.display = 'none';
    container.className = currentFileView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3';
    container.innerHTML = filteredFiles.map(file => currentFileView === 'grid' ? createFileCard(file) : createListItem(file)).join('');
}

// Update file progress
function updateFileProgress(file) {
    const fileElement = document.getElementById(`file-${file.id}`);
    if (!fileElement) return;
    
    const progressBar = fileElement.querySelector('.progress-bar-inner');
    const progressText = fileElement.querySelector('.progress-text');
    if(progressBar) progressBar.style.width = `${file.progress}%`;
    if(progressText) progressText.textContent = `${Math.round(file.progress)}%`;

    if (file.progress >= 100) {
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
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Generate file ID
function generateFileId() {
    return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Remove file
function removeFile(fileId, event) {
    if(event) event.stopPropagation();
    if (confirm('Are you sure you want to delete this file?')) {
        uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification('File removed successfully', 'success');
    }
}

// Show upload notification
function showUploadNotification(message, type = 'info') {
    const container = document.getElementById('notification-container') || createNotificationContainer();
    const notification = document.createElement('div');
    notification.className = `upload-notification fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all transform translate-x-0 ${
        type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white max-w-md`;
    notification.innerHTML = `...`; // Content set below
    
    notification.innerHTML = `
        <div class="flex items-start">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-3 mt-1"></i>
            <div>
                <p class="font-semibold">${type.charAt(0).toUpperCase() + type.slice(1)}</p>
                <p class="text-sm mt-1" style="white-space: pre-line;">${message}</p>
            </div>
        </div>
    `;
    container.appendChild(notification);
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed bottom-4 right-4 z-50 space-y-2';
    document.body.appendChild(container);
    return container;
}


// Show All Files
function showAllFiles() {
    loadFilesFromStorage();
    currentFilter = '';
    currentSort = 'newest';
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('fileSortOrder').value = 'newest';
    displayUploadedFiles();
    showUploadNotification(`Showing all ${uploadedFiles.length} files`, 'info');
}

// Clear All Files
function clearAllFiles() {
    if (confirm('Are you sure you want to delete all uploaded files? This action cannot be undone.')) {
        uploadedFiles = [];
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification('All files cleared successfully', 'success');
    }
}

// Reset Upload Area
function resetUploadArea() {
    document.getElementById('fileInput').value = '';
    resetFileFilters();
    showUploadNotification('Upload area reset', 'info');
}

// Toggle File View (Grid/List)
function toggleFileView(view) {
    currentFileView = view;
    document.getElementById('gridViewBtn').classList.toggle('bg-yellow-500', view === 'grid');
    document.getElementById('gridViewBtn').classList.toggle('bg-gray-600', view !== 'grid');
    document.getElementById('listViewBtn').classList.toggle('bg-yellow-500', view === 'list');
    document.getElementById('listViewBtn').classList.toggle('bg-gray-600', view !== 'list');
    displayUploadedFiles();
}

function filterFiles() { currentFilter = document.getElementById('fileTypeFilter').value; displayUploadedFiles(); }
function sortFiles() { currentSort = document.getElementById('fileSortOrder').value; displayUploadedFiles(); }

function resetFileFilters() {
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('fileSortOrder').value = 'newest';
    currentFilter = '';
    currentSort = 'newest';
    displayUploadedFiles();
}

function uploadFromUrl() { document.getElementById('urlUploadModal').classList.remove('hidden'); }
function closeUrlUploadModal() { document.getElementById('urlUploadModal').classList.add('hidden'); document.getElementById('urlUploadForm').reset(); }


function updateFileStatistics() {
    const totalFiles = uploadedFiles.length;
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    const uploading = uploadedFiles.filter(f => f.status === 'uploading').length;
    const completed = uploadedFiles.filter(f => f.status === 'completed').length;
    
    document.getElementById('totalFilesCount').textContent = totalFiles;
    document.getElementById('totalSizeCount').textContent = formatFileSize(totalSize);
    document.getElementById('uploadingCount').textContent = uploading;
    document.getElementById('completedCount').textContent = completed;
    
    document.getElementById('noFilesPlaceholder').style.display = totalFiles === 0 ? 'flex' : 'none';
}

function createFileCard(file) {
    return `
    <div class="location-card p-4 flex flex-col" id="file-${file.id}" onclick="selectFile('${file.id}')">
        <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <i class="${getFileIcon(file.extension)} text-2xl text-yellow-400"></i>
            </div>
            <div class="status-indicator-container">
                 <span class="px-2 py-1 text-xs rounded-full ${file.status === 'completed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'}">${file.status}</span>
            </div>
        </div>
        
        <div class="flex-grow mb-3">
            <h4 class="text-white font-semibold text-sm truncate font-orbitron" title="${file.name}">${file.name}</h4>
            <p class="text-gray-400 text-xs mt-1">${formatFileSize(file.size)} • ${file.extension.toUpperCase()}</p>
        </div>
        
        ${file.status === 'uploading' ? `
            <div class="mb-3">
                <div class="bg-gray-600 rounded-full h-2 mb-1">
                    <div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all progress-bar-inner" style="width: ${file.progress}%"></div>
                </div>
                <p class="text-xs text-gray-400 text-center progress-text">${Math.round(file.progress)}%</p>
            </div>
        ` : `
            <div class="flex justify-center items-center space-x-3 pt-3 border-t border-gray-700">
                <button onclick="downloadFile('${file.id}', event)" class="text-blue-400 hover:text-blue-300 transform transition-transform hover:scale-110" title="Download"><i class="fas fa-download"></i></button>
                <button onclick="previewFile('${file.id}', event)" class="text-green-400 hover:text-green-300 transform transition-transform hover:scale-110" title="Preview"><i class="fas fa-eye"></i></button>
                <button onclick="editFile('${file.id}', event)" class="text-purple-400 hover:text-purple-300 transform transition-transform hover:scale-110" title="Edit"><i class="fas fa-pencil-alt"></i></button>
                <button onclick="removeFile('${file.id}', event)" class="text-red-400 hover:text-red-300 transform transition-transform hover:scale-110" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `}
    </div>`;
}

function createListItem(file) {
    return `
    <div class="location-card p-4 flex items-center" id="file-${file.id}" onclick="selectFile('${file.id}')">
        <div class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center mr-4">
            <i class="${getFileIcon(file.extension)} text-xl text-yellow-400"></i>
        </div>
        <div class="flex-1 min-w-0">
            <h4 class="text-white font-semibold truncate font-orbitron">${file.name}</h4>
            <p class="text-gray-400 text-sm">${formatFileSize(file.size)} • ${file.extension.toUpperCase()} • ${new Date(file.uploadDate).toLocaleDateString()} • ${file.user}</p>
        </div>
        <div class="flex items-center space-x-4 w-64">
            ${file.status === 'uploading' ? `
                <div class="w-full">
                    <div class="bg-gray-600 rounded-full h-2"><div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all progress-bar-inner" style="width: ${file.progress}%"></div></div>
                    <p class="text-xs text-gray-400 mt-1 progress-text">${Math.round(file.progress)}%</p>
                </div>
            ` : `
                <span class="px-3 py-1 rounded-full text-white text-sm ${file.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}">${file.status}</span>
            `}
        </div>
        <div class="flex items-center space-x-4 pl-4">
            <button onclick="downloadFile('${file.id}', event)" class="text-blue-400 hover:text-blue-300 transform transition-transform hover:scale-110" title="Download"><i class="fas fa-download text-lg"></i></button>
            <button onclick="previewFile('${file.id}', event)" class="text-green-400 hover:text-green-300 transform transition-transform hover:scale-110" title="Preview"><i class="fas fa-eye text-lg"></i></button>
            <button onclick="editFile('${file.id}', event)" class="text-purple-400 hover:text-purple-300 transform transition-transform hover:scale-110" title="Edit"><i class="fas fa-pencil-alt text-lg"></i></button>
            <button onclick="removeFile('${file.id}', event)" class="text-red-400 hover:text-red-300 transform transition-transform hover:scale-110" title="Delete"><i class="fas fa-trash text-lg"></i></button>
        </div>
    </div>`;
}

function selectFile(fileId) {
    if (selectedFileId) {
        document.getElementById(`file-${selectedFileId}`)?.classList.remove('ring-2', 'ring-yellow-400');
    }
    selectedFileId = fileId;
    document.getElementById(`file-${fileId}`)?.classList.add('ring-2', 'ring-yellow-400');
}


function editSelectedFile(event) {
    if(event) event.stopPropagation();
    if (selectedFileId) {
        editFile(selectedFileId);
    } else {
        showUploadNotification('Please select a file to edit.', 'error');
    }
}

function deleteSelectedFile(event) {
    if(event) event.stopPropagation();
    if (selectedFileId) {
        removeFile(selectedFileId);
        selectedFileId = null;
    } else {
        showUploadNotification('Please select a file to delete.', 'error');
    }
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
}

function downloadFile(fileId, event) {
    if(event) event.stopPropagation();
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    showUploadNotification(`Downloading ${file.name}...`, 'info');
    if (file.originalFile) {
        createFileDownload(file.originalFile, file.name) ? showUploadNotification(`${file.name} downloaded successfully`, 'success') : showUploadNotification(`Download failed for ${file.name}`, 'error');
    } else {
        createMockDownload(file);
    }
}

function previewFile(fileId, event) {
    if(event) event.stopPropagation();
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) showFilePreviewModal(file);
}


function showFilePreviewModal(file) {
    closeFilePreviewModal(); // Close any existing modal
    const modal = document.createElement('div');
    modal.id = 'filePreviewModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4';
    modal.innerHTML = `...`; // Content set below
    
    modal.innerHTML = `
        <div class="glow-modal max-w-4xl w-full max-h-full overflow-auto relative">
            <div class="flex justify-between items-center p-6 border-b border-gray-700">
                <div class="flex items-center space-x-4"><div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center"><i class="${getFileIcon(file.extension)} text-2xl text-gray-300"></i></div>
                <div><h3 class="text-white font-bold text-xl font-orbitron">${file.name}</h3><p class="text-gray-400">${formatFileSize(file.size)} • ${file.extension.toUpperCase()} • Uploaded ${new Date(file.uploadDate).toLocaleDateString()}</p></div></div>
                <button onclick="closeFilePreviewModal()" class="text-gray-400 hover:text-white text-2xl"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-6">${generatePreviewContent(file)}</div>
            <div class="flex justify-between items-center p-6 border-t border-gray-700">
                <div class="text-sm text-gray-400"><span class="px-3 py-1 rounded bg-green-500 text-white mr-3">${file.status}</span>Uploaded by ${file.user}</div>
                <div class="flex space-x-3"><button onclick="downloadFile('${file.id}', event)" class="glow-button"><i class="fas fa-download mr-2"></i>Download</button><button onclick="closeFilePreviewModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">Close</button></div>
            </div>
        </div>`;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeFilePreviewModal(); });
    showUploadNotification(`Previewing ${file.name}`, 'info');
}

function generatePreviewContent(file) {
    const ext = file.extension.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        if(file.originalFile) {
            return `<div class="text-center"><img src="${URL.createObjectURL(file.originalFile)}" class="max-w-full max-h-[60vh] mx-auto rounded-lg" alt="Image preview"></div>`;
        }
        return `<div class="text-center p-8"><i class="fas fa-image text-8xl text-gray-500"></i><p class="text-gray-400 mt-4">Image preview available after download.</p></div>`;
    }
    // Other file types...
    return `<div class="text-center p-8"><i class="${getFileIcon(ext)} text-8xl text-gray-500"></i><h4 class="text-white font-semibold my-4">${ext.toUpperCase()} File</h4><p class="text-gray-400">No direct preview available for this file type.</p></div>`;
}

function closeFilePreviewModal() {
    const modal = document.getElementById('filePreviewModal');
    if (modal) modal.remove();
}

function saveFilesToStorage() {
    localStorage.setItem('gis_all_files', JSON.stringify(uploadedFiles));
}

function loadFilesFromStorage() {
    uploadedFiles = JSON.parse(localStorage.getItem('gis_all_files') || '[]');
}

function triggerBrowseFiles() {
    document.getElementById('fileInput')?.click();
}

function editFile(fileId, event) {
    if(event) event.stopPropagation();
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    const newName = prompt("Enter new file name:", file.name);
    if (newName && newName.trim() !== "") {
        file.name = newName.trim();
        file.extension = newName.split('.').pop().toLowerCase();
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification(`File renamed to ${newName}`, 'success');
    }
}


// Export functions to window object
if (typeof window !== 'undefined') {
    Object.assign(window, {
        initializeUploadArea, removeFile, showAllFiles, clearAllFiles,
        resetUploadArea, toggleFileView, filterFiles, sortFiles, resetFileFilters,
        uploadFromUrl, closeUrlUploadModal, downloadFile, previewFile,
        createFileDownload, showFilePreviewModal, closeFilePreviewModal, triggerBrowseFiles,
        editFile, editSelectedFile, deleteSelectedFile, handleFileSelect
    });
}
