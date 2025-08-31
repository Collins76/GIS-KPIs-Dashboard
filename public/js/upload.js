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
    
    if (!uploadArea || !fileInput) {
        console.log("Upload area or file input not found, skipping initialization.");
        return;
    };
    
    // Drag and drop events
    uploadArea.addEventListener('dragenter', handleDragEnter, false);
    uploadArea.addEventListener('dragover', handleDragOver, false);
    uploadArea.addEventListener('dragleave', handleDragLeave, false);
    uploadArea.addEventListener('drop', handleDrop, false);
    
    // File input change event
    fileInput.addEventListener('change', handleFileSelect, false);
    
    // URL Upload Form
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
                user: 'URL Upload',
                location: 'N/A',
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

    loadFilesFromStorage();
    console.log("Upload area initialized");
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
    
    uploadedFiles.push(fileObj);
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

function updateFileProgress(file) {
    const fileElement = document.getElementById(`file-${file.id}`);
    if (fileElement) {
        const progressBar = fileElement.querySelector('.transition-all');
        const progressText = fileElement.querySelector('.text-xs.text-gray-400.text-center, .text-xs.text-gray-400.mt-1');
        if (progressBar) progressBar.style.width = `${file.progress}%`;
        if (progressText) progressText.textContent = `${Math.round(file.progress)}%`;

        if (file.progress === 100) {
           setTimeout(() => displayUploadedFiles(), 500);
        }
    }
}

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

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function generateFileId() {
    return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function showUploadNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-md bg-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-500`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showAllFiles() {
    loadFilesFromStorage();
    showUploadNotification(`Showing ${uploadedFiles.length} files from storage.`, 'info');
}

function clearAllFiles() {
    if (confirm('Are you sure you want to delete all uploaded files? This action cannot be undone.')) {
        uploadedFiles = [];
        localStorage.removeItem('gis_all_files');
        displayUploadedFiles();
        showUploadNotification('All files cleared.', 'success');
    }
}

function resetUploadArea() {
    document.getElementById('fileInput').value = '';
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
        placeholder.style.display = totalFiles === 0 ? 'block' : 'none';
    }
}

function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;

    let filteredFiles = [...uploadedFiles];

    if (currentFilter) {
        const imageTypes = ['jpg', 'jpeg', 'png'];
        const docTypes = ['doc', 'docx'];
        const gisTypes = ['shp', 'gdb', 'kml', 'kmz'];
        const presTypes = ['ppt', 'pptx'];

        filteredFiles = filteredFiles.filter(file => {
            const ext = file.extension;
            if (currentFilter === 'image') return imageTypes.includes(ext);
            if (currentFilter === 'doc') return docTypes.includes(ext);
            if (currentFilter === 'gis') return gisTypes.includes(ext);
            if (currentFilter === 'presentation') return presTypes.includes(ext);
            return ext === currentFilter;
        });
    }

    filteredFiles.sort((a, b) => {
        switch (currentSort) {
            case 'oldest': return new Date(a.uploadDate) - new Date(b.uploadDate);
            case 'largest': return b.size - a.size;
            case 'smallest': return a.size - b.size;
            case 'name': return a.name.localeCompare(b.name);
            default: return new Date(b.uploadDate) - new Date(a.uploadDate);
        }
    });

    updateFileStatistics();

    if (filteredFiles.length === 0) {
        container.innerHTML = currentFilter ? `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-6xl text-gray-600 mb-4"></i>
                <p class="text-gray-400 text-lg">No files found for this filter.</p>
            </div>
        ` : '';
        if(!currentFilter) document.getElementById('noFilesPlaceholder').style.display = 'block';
        return;
    }
     if(!currentFilter) document.getElementById('noFilesPlaceholder').style.display = 'none';

    container.className = currentFileView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3';
    container.innerHTML = filteredFiles.map(file => {
        const iconClass = getFileIcon(file.extension);
        const statusClass = file.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500';
        
        const actionButtons = `
            <button onclick="previewFile('${file.id}')" class="text-green-400 hover:text-green-300" title="Preview"><i class="fas fa-eye"></i></button>
            <button onclick="downloadFile('${file.id}')" class="text-blue-400 hover:text-blue-300" title="Download"><i class="fas fa-download"></i></button>
            <button onclick="editFile('${file.id}')" class="text-yellow-400 hover:text-yellow-300" title="Edit"><i class="fas fa-edit"></i></button>
            <button onclick="removeFile('${file.id}')" class="text-red-400 hover:text-red-300" title="Delete"><i class="fas fa-trash"></i></button>
        `;

        if (currentFileView === 'grid') {
            return `
                <div class="location-card p-4" id="file-${file.id}">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                            <i class="${iconClass} text-2xl text-gray-300"></i>
                        </div>
                        <div class="flex space-x-3 text-lg">${actionButtons}</div>
                    </div>
                    <div class="mb-3">
                        <h4 class="text-white font-semibold text-sm truncate font-orbitron" title="${file.name}">${file.name}</h4>
                        <p class="text-gray-400 text-xs mt-1">${formatFileSize(file.size)} • ${file.extension.toUpperCase()}</p>
                        <p class="text-gray-500 text-xs">${new Date(file.uploadDate).toLocaleDateString()}</p>
                    </div>
                    ${file.status === 'uploading' ? `
                        <div class="mb-3"><div class="bg-gray-600 rounded-full h-2 mb-1"><div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" style="width: ${file.progress}%"></div></div><p class="text-xs text-gray-400 text-center">${Math.round(file.progress)}%</p></div>
                    ` : `
                        <div class="flex items-center justify-between text-xs"><span class="px-2 py-1 rounded text-white ${statusClass}">${file.status}</span><span class="text-gray-500">${file.user}</span></div>
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
                                <p class="text-gray-400 text-sm truncate">${formatFileSize(file.size)} • ${file.extension.toUpperCase()} • ${new Date(file.uploadDate).toLocaleString()} • by ${file.user}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4 ml-4">
                            ${file.status === 'uploading' ? `<div class="w-32"><div class="bg-gray-600 rounded-full h-2"><div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" style="width: ${file.progress}%"></div></div><p class="text-xs text-gray-400 mt-1">${Math.round(file.progress)}%</p></div>` : `<span class="px-3 py-1 rounded text-white text-sm ${statusClass}">${file.status}</span>`}
                            <div class="flex space-x-3 text-lg">${actionButtons}</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }).join('');
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
        console.error('File download failed:', error);
        return false;
    }
}

function createMockDownload(fileObj) {
    const content = `File: ${fileObj.name}\nSize: ${formatFileSize(fileObj.size)}\nUploaded: ${new Date(fileObj.uploadDate).toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileObj.name}_info.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    showUploadNotification(`Downloading ${file.name}...`, 'info');
    if (file.originalFile) {
        createFileDownload(file.originalFile, file.name) ? showUploadNotification(`${file.name} downloaded successfully`, 'success') : showUploadNotification(`Download failed for ${file.name}`, 'error');
    } else {
        createMockDownload(file);
    }
}

function previewFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    showFilePreviewModal(file);
}

function editFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    const newName = prompt("Enter new file name:", file.name);
    if (newName && newName.trim() !== "") {
        file.name = newName.trim();
        file.extension = newName.split('.').pop().toLowerCase();
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification('File renamed successfully.', 'success');
    }
}

function removeFile(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification('File removed successfully', 'success');
    }
}


function showFilePreviewModal(file) {
    closeFilePreviewModal(); 
    const modal = document.createElement('div');
    modal.id = 'filePreviewModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    
    let previewHTML = '';
    const ext = file.extension.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext) && file.originalFile) {
        previewHTML = `<img src="${URL.createObjectURL(file.originalFile)}" alt="Preview" class="max-w-full max-h-[60vh] mx-auto rounded-lg">`;
    } else {
         previewHTML = `
            <div class="text-center bg-gray-800 p-8 rounded-lg">
                <i class="${getFileIcon(ext)} text-8xl text-gray-400 mb-4"></i>
                <h4 class="text-white font-semibold mb-2">${ext.toUpperCase()} File</h4>
                <p class="text-gray-400">No direct preview available for this file type.</p>
            </div>
        `;
    }

    modal.innerHTML = `
        <div class="glow-modal max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 class="text-white font-bold text-lg font-orbitron truncate pr-4">${file.name}</h3>
                <button onclick="closeFilePreviewModal()" class="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div class="p-6 flex-grow flex items-center justify-center">${previewHTML}</div>
            <div class="flex justify-between items-center p-4 border-t border-gray-700">
                <div class="text-sm text-gray-400">Uploaded by ${file.user}</div>
                <div>
                    <button onclick="downloadFile('${file.id}')" class="glow-button"><i class="fas fa-download mr-2"></i>Download</button>
                    <button onclick="closeFilePreviewModal()" class="ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', e => e.target === modal && closeFilePreviewModal());
}

function closeFilePreviewModal() {
    const modal = document.getElementById('filePreviewModal');
    if (modal) modal.remove();
}

function saveFilesToStorage() {
    localStorage.setItem('gis_all_files', JSON.stringify(uploadedFiles.map(f => ({...f, originalFile: null}))));
}

function loadFilesFromStorage() {
    const storedFiles = localStorage.getItem('gis_all_files');
    if (storedFiles) {
        uploadedFiles = JSON.parse(storedFiles);
    }
    displayUploadedFiles();
}

// Attach event listeners and initialize
window.addEventListener('DOMContentLoaded', initializeUploadArea);

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
window.closeFilePreviewModal = closeFilePreviewModal;
window.createFileDownload = createFileDownload;
window.showFilePreviewModal = showFilePreviewModal;
window.initializeUploadArea = initializeUploadArea;
window.handleFileSelect = handleFileSelect;