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
function initializeUploadArea() {
    const loginProfile = localStorage.getItem('gis-user-profile');
    if (loginProfile) {
        currentUser = JSON.parse(loginProfile);
    }
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
                user: currentUser ? currentUser.fullname : 'Unknown',
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

    // Load any saved files
    const savedFiles = localStorage.getItem('gis_all_files');
    if (savedFiles) {
        uploadedFiles = JSON.parse(savedFiles);
    }
    displayUploadedFiles();

}

// Handle drag enter
function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragging');
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
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX >= rect.right || 
        e.clientY < rect.top || e.clientY >= rect.bottom) {
        e.currentTarget.classList.remove('dragging');
    }
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    e.currentTarget.classList.remove('dragging');
    
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
}


// Process data file (CSV or Excel)
async function processDataFile(file, fileObj) {
    // Read file content
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            let data;
            
            if (fileObj.extension === 'csv') {
                data = parseCSV(e.target.result);
            } else if (fileObj.extension === 'xlsx') {
                // For Excel files, we'd need a library like SheetJS
                // For now, we'll just store the file
                console.log('Excel file uploaded:', fileObj.name);
                return;
            }
            
            // Store data in tables
            if (data && data.length > 0) {
                await storeKPIData(data);
                showUploadNotification(`Data from ${fileObj.name} has been imported`, 'success');
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

// Store KPI Data
async function storeKPIData(data) {
    try {
        // Send data to API
        const response = await fetch('tables/kpi_uploads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: data,
                uploadedBy: currentUser ? currentUser.name : 'Unknown',
                uploadDate: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            console.log('Data stored successfully');
        }
    } catch (error) {
        console.error('Error storing data:', error);
    }
}

// Display uploaded files
function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;

    // Filter files
    let filteredFiles = uploadedFiles;
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

    updateFileStatistics(filteredFiles);

    const placeholder = document.getElementById('noFilesPlaceholder');

    if (filteredFiles.length === 0) {
        container.innerHTML = '';
        if(placeholder) placeholder.style.display = 'block';
    } else {
        if(placeholder) placeholder.style.display = 'none';
        container.className = currentFileView === 'grid' ? 
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 
            'space-y-3';
        
        container.innerHTML = filteredFiles.map(file => {
            const iconClass = getFileIcon(file.extension);
            if (currentFileView === 'grid') {
                return `
                    <div class="location-card p-4 flex flex-col justify-between" id="file-${file.id}">
                        <div>
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                                    <i class="${iconClass} text-2xl text-gray-300"></i>
                                </div>
                                <div class="flex items-center space-x-2">
                                     <button onclick="previewFile('${file.id}')" class="text-green-400 hover:text-green-300" title="Preview"><i class="fas fa-eye"></i></button>
                                     <button onclick="editFile('${file.id}')" class="text-yellow-400 hover:text-yellow-300" title="Edit"><i class="fas fa-pencil-alt"></i></button>
                                     <button onclick="downloadFile('${file.id}')" class="text-blue-400 hover:text-blue-300" title="Download"><i class="fas fa-download"></i></button>
                                     <button onclick="removeFile('${file.id}')" class="text-red-400 hover:text-red-300" title="Delete"><i class="fas fa-trash"></i></button>
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
                        </div>
                        
                        <div>
                            ${file.status === 'uploading' ? `
                                <div class="mb-3">
                                    <div class="bg-gray-600 rounded-full h-2 mb-1">
                                        <div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" style="width: ${file.progress}%"></div>
                                    </div>
                                    <p class="text-xs text-gray-400 text-center">${Math.round(file.progress)}%</p>
                                </div>
                            ` : `
                                <div class="flex items-center justify-between text-xs">
                                    <span class="px-2 py-1 rounded text-white ${file.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}">${file.status}</span>
                                    <span class="text-gray-500">${file.user}</span>
                                </div>
                            `}
                        </div>
                    </div>
                `;
            } else { // List View
                return `
                     <div class="location-card p-4" id="file-${file.id}">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4 flex-1 min-w-0">
                                <div class="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i class="${iconClass} text-xl text-gray-300"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="text-white font-semibold truncate font-orbitron">${file.name}</h4>
                                    <p class="text-gray-400 text-sm">
                                        ${formatFileSize(file.size)} • ${file.extension.toUpperCase()} • 
                                        ${new Date(file.uploadDate).toLocaleString()} • ${file.user}
                                    </p>
                                </div>
                            </div>
                            
                            <div class="flex items-center space-x-4 ml-4">
                                ${file.status === 'uploading' ? `
                                    <div class="w-32">
                                        <div class="bg-gray-600 rounded-full h-2">
                                            <div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" style="width: ${file.progress}%"></div>
                                        </div>
                                        <p class="text-xs text-gray-400 mt-1">${Math.round(file.progress)}%</p>
                                    </div>
                                ` : `
                                    <span class="px-3 py-1 rounded text-white text-sm ${
                                        file.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                                    }">${file.status}</span>
                                `}
                                
                               <div class="flex space-x-3">
                                    <button onclick="previewFile('${file.id}')" class="text-green-400 hover:text-green-300" title="Preview"><i class="fas fa-eye text-lg"></i></button>
                                     <button onclick="editFile('${file.id}')" class="text-yellow-400 hover:text-yellow-300" title="Edit"><i class="fas fa-pencil-alt text-lg"></i></button>
                                     <button onclick="downloadFile('${file.id}')" class="text-blue-400 hover:text-blue-300" title="Download"><i class="fas fa-download text-lg"></i></button>
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

// Update file progress
function updateFileProgress(file) {
    const fileElement = document.getElementById(`file-${file.id}`);
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
        showUploadNotification('File removed successfully', 'success');
    }
};

// Show upload notification
function showUploadNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.upload-notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `upload-notification fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all transform translate-x-full ${
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
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(calc(100% + 2rem))';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

function showAllFiles() {
    uploadedFiles = JSON.parse(localStorage.getItem('gis_all_files') || '[]');
    displayUploadedFiles();
    showUploadNotification(`Showing ${uploadedFiles.length} files`, 'info');
}

function clearAllFiles() {
    if (confirm('Are you sure you want to delete all uploaded files? This action cannot be undone.')) {
        uploadedFiles = [];
        localStorage.removeItem('gis_all_files');
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


function updateFileStatistics(files = uploadedFiles) {
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const uploading = files.filter(f => f.status === 'uploading').length;
    const completed = files.filter(f => f.status === 'completed').length;
    
    document.getElementById('totalFilesCount').textContent = totalFiles;
    document.getElementById('totalSizeCount').textContent = formatFileSize(totalSize);
    document.getElementById('uploadingCount').textContent = uploading;
    document.getElementById('completedCount').textContent = completed;
}


function createFileDownload(originalFile, fileName) {
    try {
        const url = URL.createObjectURL(originalFile);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
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
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    showUploadNotification(`File info for ${fileObj.name} downloaded`, 'success');
}

function downloadFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    showUploadNotification(`Downloading ${file.name}...`, 'info');
    
    if (file.originalFile) {
        const success = createFileDownload(file.originalFile, file.name);
        if (success) {
            showUploadNotification(`${file.name} downloaded successfully`, 'success');
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

function showFilePreviewModal(file) {
    const existingModal = document.getElementById('filePreviewModal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'filePreviewModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    
    const previewContent = generatePreviewContent(file);
    
    modal.innerHTML = `
        <div class="glow-container max-w-4xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col">
            <div class="flex justify-between items-center p-6 border-b border-gray-700 flex-shrink-0">
                <div class="flex items-center space-x-4 min-w-0">
                    <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="${getFileIcon(file.extension)} text-2xl text-gray-300"></i>
                    </div>
                    <div class="min-w-0">
                        <h3 class="text-white font-bold text-xl font-orbitron truncate">${file.name}</h3>
                        <p class="text-gray-400 text-sm">
                            ${formatFileSize(file.size)} • ${file.extension.toUpperCase()} • 
                            Uploaded ${new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <button onclick="closeFilePreviewModal()" class="text-gray-400 hover:text-white text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="p-6 overflow-y-auto flex-grow">
                ${previewContent}
            </div>
            
            <div class="flex justify-between items-center p-6 border-t border-gray-700 flex-shrink-0">
                <div class="text-sm text-gray-400">
                    <span class="px-3 py-1 rounded bg-green-500 text-white mr-3">${file.status}</span>
                    Uploaded by ${file.user}
                </div>
                <div class="flex space-x-3">
                    <button onclick="downloadFile('${file.id}')" class="glow-button">
                        <i class="fas fa-download mr-2"></i>Download
                    </button>
                    <button onclick="closeFilePreviewModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeFilePreviewModal();
        }
    });
    
    showUploadNotification(`Previewing ${file.name}`, 'info');
}

function generatePreviewContent(file) {
    const extension = file.extension.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension) && file.originalFile) {
        const url = URL.createObjectURL(file.originalFile);
        return `<img src="${url}" alt="File preview" class="max-w-full max-h-[60vh] mx-auto rounded-lg" onload="URL.revokeObjectURL(this.src)">`;
    }
    
    // PDF preview
    if (extension === 'pdf' && file.originalFile) {
         const url = URL.createObjectURL(file.originalFile);
         return `<iframe src="${url}" class="w-full h-[60vh]" title="PDF Preview"></iframe>`;
    }

    if (['csv'].includes(extension) && file.originalFile) {
        return `<div id="csv-preview" class="text-gray-300">Loading preview...</div>`;
    }

    // Default preview for other types
    return `
        <div class="text-center">
            <div class="bg-gray-800 rounded-lg p-8 mb-4">
                <i class="${getFileIcon(file.extension)} text-8xl text-gray-400 mb-4"></i>
                <h4 class="text-white font-semibold mb-2">${file.extension.toUpperCase()} File</h4>
                <p class="text-gray-400">Preview not available for this file type.</p>
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

function editFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    const newName = prompt("Enter new file name:", file.name);
    if (newName && newName.trim() !== "") {
        file.name = newName.trim();
        saveFilesToStorage();
        displayUploadedFiles();
        showUploadNotification("File renamed successfully.", "success");
    }
}


function closeFilePreviewModal() {
    const modal = document.getElementById('filePreviewModal');
    if (modal) {
        modal.remove();
    }
}

function saveFilesToStorage() {
    localStorage.setItem('gis_all_files', JSON.stringify(uploadedFiles));
}


// Export functions to window object
window.initializeUploadArea = initializeUploadArea;
window.removeFile = removeFile;
window.editFile = editFile;
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
window.handleFileSelect = handleFileSelect;

  