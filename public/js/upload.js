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
        urlUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const url = document.getElementById('fileUrl').value;
            const customName = document.getElementById('customFileName').value;
            
            if(!url) {
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
                user: localStorage.getItem('gis-user-profile') ? JSON.parse(localStorage.getItem('gis-user-profile')).name : 'Unknown',
                location: localStorage.getItem('gis-user-profile') ? JSON.parse(localStorage.getItem('gis-user-profile')).location : 'Unknown',
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
    const currentUser = JSON.parse(localStorage.getItem('gis-user-profile'));
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
    updateFileStatistics();
    
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
};

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
    const currentUser = JSON.parse(localStorage.getItem('gis-user-profile'));
    try {
        // In a real app, this would be a fetch call to a backend API
        console.log('Storing KPI data:', {
            data: data,
            uploadedBy: currentUser ? currentUser.name : 'Unknown',
            uploadDate: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error storing data:', error);
    }
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

function removeFile(fileId) {
    if (confirm('Are you sure you want to delete this file?')) {
        uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
        saveFilesToStorage();
        updateFileStatistics();
        displayUploadedFiles();
        showUploadNotification('File removed successfully', 'success');
    }
};


// Show upload notification
function showUploadNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.upload-notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create notification element
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
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(calc(100% + 2rem))';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// 🔥 ENHANCED FILE MANAGEMENT FUNCTIONS

// Show All Files
function showAllFiles() {
    const allFiles = JSON.parse(localStorage.getItem('gis_all_files') || '[]');
    uploadedFiles = allFiles;
    updateFileStatistics();
    displayUploadedFiles();
    showUploadNotification(`Showing ${allFiles.length} files`, 'info');
}

// Clear All Files
function clearAllFiles() {
    if (confirm('Are you sure you want to delete all uploaded files? This action cannot be undone.')) {
        uploadedFiles = [];
        localStorage.removeItem('gis_all_files');
        updateFileStatistics();
        displayUploadedFiles();
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
    
    // Update button states
    document.getElementById('gridViewBtn').classList.toggle('bg-yellow-500', view === 'grid');
    document.getElementById('gridViewBtn').classList.toggle('bg-gray-600', view !== 'grid');
    document.getElementById('listViewBtn').classList.toggle('bg-yellow-500', view === 'list');
    document.getElementById('listViewBtn').classList.toggle('bg-gray-600', view !== 'list');
    
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

// Upload from URL
function uploadFromUrl() {
    document.getElementById('urlUploadModal').classList.remove('hidden');
}

// Close URL Upload Modal
function closeUrlUploadModal() {
    document.getElementById('urlUploadModal').classList.add('hidden');
    document.getElementById('urlUploadForm').reset();
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
    
    // Show/hide no files placeholder
    const placeholder = document.getElementById('noFilesPlaceholder');
    if (placeholder) {
        placeholder.style.display = uploadedFiles.length > 0 ? 'none' : 'block';
    }
}

// Enhanced Display Uploaded Files
function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    if (!container) return;
    
    // Filter files
    let filesToDisplay = [...uploadedFiles];
    
    if (currentFilter) {
        filesToDisplay = filesToDisplay.filter(file => {
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
    
    // Sort files
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
    
    updateFileStatistics();
    
    if (filesToDisplay.length === 0) {
        const placeholderText = currentFilter ? `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-6xl text-gray-600 mb-4"></i>
                <p class="text-gray-400 text-lg">No files found matching the current filter</p>
                <button onclick="resetFileFilters()" class="mt-4 glow-button">
                    <i class="fas fa-undo mr-2"></i>Reset Filters
                </button>
            </div>
        ` : '';
        container.innerHTML = placeholderText;
        document.getElementById('noFilesPlaceholder').style.display = uploadedFiles.length === 0 ? 'block' : 'none';
        return;
    }
     document.getElementById('noFilesPlaceholder').style.display = 'none';
    
    // Set grid classes based on view
    container.className = currentFileView === 'grid' ? 
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 
        'space-y-4';
    
    let html = '';
    
    filesToDisplay.forEach(file => {
        const iconClass = getFileIcon(file.extension);
        
        if (currentFileView === 'grid') {
            html += `
                <div class="location-card p-4 flex flex-col justify-between" id="file-${file.id}">
                    <div>
                        <div class="flex justify-between items-start mb-4">
                            <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                                <i class="${iconClass} text-2xl text-gray-300"></i>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <h4 class="text-white font-semibold text-sm truncate font-orbitron" title="${file.name}">${file.name}</h4>
                            <p class="text-gray-400 text-xs mt-1">
                                ${formatFileSize(file.size)} • ${file.extension.toUpperCase()}
                            </p>
                            <p class="text-gray-500 text-xs">
                                ${new Date(file.uploadDate).toLocaleDateString()} by ${file.user}
                            </p>
                        </div>
                    </div>
                    
                    <div>
                         ${file.status === 'uploading' ? `
                            <div class="mb-3">
                                <div class="bg-gray-600 rounded-full h-2 mb-1">
                                    <div class="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all" 
                                         style="width: ${file.progress}%"></div>
                                </div>
                                <p class="text-xs text-center text-yellow-400">Uploading: ${Math.round(file.progress)}%</p>
                            </div>
                        ` : `
                            <div class="flex items-center justify-between text-xs mb-4">
                                <span class="px-2 py-1 rounded-full text-white font-bold ${
                                    file.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                                }">${file.status}</span>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="previewFile('${file.id}')" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg text-xs font-semibold transition-all"><i class="fas fa-eye mr-1"></i>View</button>
                                <button onclick="downloadFile('${file.id}')" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-xs font-semibold transition-all"><i class="fas fa-download mr-1"></i>Download</button>
                                <button onclick="removeFile('${file.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all" title="Delete"><i class="fas fa-trash"></i></button>
                            </div>
                        `}
                    </div>
                </div>
            `;
        } else {
            // List view
            html += `
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
                                    ${new Date(file.uploadDate).toLocaleDateString()} • ${file.user}
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
                                <span class="px-3 py-1 rounded-full text-white text-sm font-bold ${
                                    file.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                                }">${file.status}</span>
                            `}
                            
                             <div class="flex space-x-2">
                                <button onclick="previewFile('${file.id}')" class="text-blue-400 hover:text-blue-300" title="Preview"><i class="fas fa-eye text-lg"></i></button>
                                <button onclick="downloadFile('${file.id}')" class="text-green-400 hover:text-green-300" title="Download"><i class="fas fa-download text-lg"></i></button>
                                <button onclick="removeFile('${file.id}')" class="text-red-400 hover:text-red-300" title="Delete"><i class="fas fa-trash text-lg"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

// Manual Download Helper Function (for original file blob creation)
function createFileDownload(originalFile, fileName) {
    try {
        // Create download link for the uploaded file
        const url = URL.createObjectURL(originalFile);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;
        downloadLink.style.display = 'none';
        
        // Add to document, click, and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up the blob URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        return true;
        
    } catch (error) {
        console.error('File download failed:', error);
        return false;
    }
}

// Create Mock Download (for URL uploads or when original file is not available)
function createMockDownload(fileObj) {
    const mockContent = `File: ${fileObj.name}\nSize: ${formatFileSize(fileObj.size)}\nUploaded: ${new Date(fileObj.uploadDate).toLocaleString()}\nUser: ${fileObj.user}\nLocation: ${fileObj.location}`;
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
    
    showUploadNotification(`📥 File info for ${fileObj.name} downloaded`, 'success');
}

// Enhanced Download File (Manual)
function downloadFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    showUploadNotification(`📥 Downloading ${file.name}...`, 'info');
    
    // Use the stored original file if available
    if (file.originalFile) {
        const success = createFileDownload(file.originalFile, file.name);
        if (success) {
            showUploadNotification(`📥 ${file.name} downloaded successfully`, 'success');
        } else {
            showUploadNotification(`Download failed for ${file.name}`, 'error');
        }
    } else {
        // Fallback to mock download if original file not available
        createMockDownload(file);
    }
}

// Enhanced Preview File with Modal
function previewFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    // Show file preview modal
    showFilePreviewModal(file);
}

// Show File Preview Modal
function showFilePreviewModal(file) {
    // Remove existing modal if any
    const existingModal = document.getElementById('filePreviewModal');
    if (existingModal) existingModal.remove();
    
    // Create preview modal
    const modal = document.createElement('div');
    modal.id = 'filePreviewModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    
    const previewContent = generatePreviewContent(file);
    
    modal.innerHTML = `
        <div class="glow-modal max-w-4xl w-full max-h-full overflow-auto relative">
            <!-- Modal Header -->
            <div class="flex justify-between items-center p-6 border-b border-gray-700">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                        <i class="${getFileIcon(file.extension)} text-2xl text-gray-300"></i>
                    </div>
                    <div>
                        <h3 class="text-white font-bold text-xl font-orbitron">${file.name}</h3>
                        <p class="text-gray-400">
                            ${formatFileSize(file.size)} • ${file.extension.toUpperCase()} • 
                            Uploaded ${new Date(file.uploadDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <button onclick="closeFilePreviewModal()" class="text-gray-400 hover:text-white text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- Modal Content -->
            <div class="p-6">
                ${previewContent}
            </div>
            
            <!-- Modal Footer -->
            <div class="flex justify-between items-center p-6 border-t border-gray-700">
                <div class="text-sm text-gray-400">
                    <span class="px-3 py-1 rounded bg-green-500 text-white mr-3">${file.status}</span>
                    Uploaded by ${file.user} from ${file.location}
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
    
    // Add click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeFilePreviewModal();
        }
    });
    
    showUploadNotification(`👁️ Previewing ${file.name}`, 'info');
}

// Generate Preview Content
function generatePreviewContent(file) {
    const extension = file.extension.toLowerCase();
    
    // Image preview
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension) && file.originalFile) {
        const url = URL.createObjectURL(file.originalFile);
        return `
            <div class="text-center">
                 <img src="${url}" alt="Preview of ${file.name}" class="max-w-full max-h-[60vh] mx-auto rounded-lg" onload="URL.revokeObjectURL(this.src)">
            </div>
        `;
    }
    
    // PDF preview
    if (extension === 'pdf') {
         const url = file.originalFile ? URL.createObjectURL(file.originalFile) : '';
        return `
            <div class="text-center">
                 ${file.originalFile ? `
                    <iframe src="${url}" class="w-full h-[70vh] rounded-lg border border-gray-600" title="PDF Preview"></iframe>
                 ` : `
                    <div class="bg-gray-800 rounded-lg p-8 mb-4">
                        <i class="fas fa-file-pdf text-8xl text-red-400 mb-4"></i>
                        <h4 class="text-white font-semibold mb-2">PDF Document</h4>
                        <p class="text-gray-400">Live preview not available for URL uploads. Please download to view.</p>
                    </div>
                 `}
            </div>
        `;
    }
    
    // Excel/CSV preview
    if (['xlsx', 'csv'].includes(extension)) {
        return `
            <div class="text-center">
                <div class="bg-gray-800 rounded-lg p-8 mb-4">
                    <i class="fas fa-table text-8xl text-green-400 mb-4"></i>
                    <h4 class="text-white font-semibold mb-2">Data File</h4>
                    <p class="text-gray-400">Spreadsheet data that can be imported into the KPI system</p>
                    <div class="mt-6 grid grid-cols-3 gap-4 text-sm">
                        <div class="bg-gray-700 p-4 rounded">
                            <div class="text-gray-400">Format</div>
                            <div class="text-white font-semibold">${extension.toUpperCase()}</div>
                        </div>
                        <div class="bg-gray-700 p-4 rounded">
                            <div class="text-gray-400">Size</div>
                            <div class="text-white font-semibold">${formatFileSize(file.size)}</div>
                        </div>
                        <div class="bg-gray-700 p-4 rounded">
                            <div class="text-gray-400">Status</div>
                            <div class="text-green-400 font-semibold">Ready for Import</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // GIS files preview
    if (['shp', 'gdb', 'kml', 'kmz'].includes(extension)) {
        return `
            <div class="text-center">
                <div class="bg-gray-800 rounded-lg p-8 mb-4">
                    <i class="fas fa-globe text-8xl text-blue-400 mb-4"></i>
                    <h4 class="text-white font-semibold mb-2">GIS Data File</h4>
                    <p class="text-gray-400">Geographic data that can be used in GIS applications</p>
                    <div class="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <div class="bg-gray-700 p-4 rounded">
                            <div class="text-gray-400">GIS Format</div>
                            <div class="text-white font-semibold">${extension.toUpperCase()}</div>
                        </div>
                        <div class="bg-gray-700 p-4 rounded">
                            <div class="text-gray-400">File Size</div>
                            <div class="text-white font-semibold">${formatFileSize(file.size)}</div>
                        </div>
                    </div>
                    <div class="mt-4 p-4 bg-blue-500 bg-opacity-20 rounded">
                        <p class="text-blue-400 text-sm">
                            <i class="fas fa-info-circle mr-2"></i>
                            This file contains spatial data for GIS analysis
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Default preview
    return `
        <div class="text-center">
            <div class="bg-gray-800 rounded-lg p-8 mb-4">
                <i class="${getFileIcon(file.extension)} text-8xl text-gray-400 mb-4"></i>
                <h4 class="text-white font-semibold mb-2">${file.extension.toUpperCase()} File</h4>
                <p class="text-gray-400">File preview not available for this type</p>
                <div class="mt-6 grid grid-cols-3 gap-4 text-sm">
                    <div class="bg-gray-700 p-4 rounded">
                        <div class="text-gray-400">Name</div>
                        <div class="text-white font-semibold break-all">${file.name}</div>
                    </div>
                    <div class="bg-gray-700 p-4 rounded">
                        <div class="text-gray-400">Size</div>
                        <div class="text-white font-semibold">${formatFileSize(file.size)}</div>
                    </div>
                    <div class="bg-gray-700 p-4 rounded">
                        <div class="text-gray-400">Uploaded</div>
                        <div class="text-white font-semibold">${new Date(file.uploadDate).toLocaleDateString()}</div>
                    </div>
                </div>
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

// Close File Preview Modal
function closeFilePreviewModal() {
    const modal = document.getElementById('filePreviewModal');
    if (modal) {
        modal.remove();
    }
}

// Save files to localStorage
function saveFilesToStorage() {
    try {
      const filesToSave = uploadedFiles.map(({originalFile, ...rest}) => rest);
      localStorage.setItem('gis_all_files', JSON.stringify(filesToSave));
    } catch(e) {
      console.error("Could not save files to storage", e);
    }
}


// Export functions to global window object
window.initializeUploadArea = initializeUploadArea;
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
```