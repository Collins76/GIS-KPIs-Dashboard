
"use strict";

let files = [];
let currentView = 'grid';
let selectedFileId = null;

const getFileIcon = (fileType) => {
    switch (fileType) {
        case 'pdf': return '<i class="fas fa-file-pdf text-red-500"></i>';
        case 'csv': return '<i class="fas fa-file-csv text-green-500"></i>';
        case 'xlsx': return '<i class="fas fa-file-excel text-green-500"></i>';
        case 'doc':
        case 'docx': return '<i class="fas fa-file-word text-blue-500"></i>';
        case 'ppt':
        case 'pptx': return '<i class="fas fa-file-powerpoint text-orange-500"></i>';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif': return '<i class="fas fa-file-image text-purple-500"></i>';
        case 'shp':
        case 'gdb':
        case 'kml':
        case 'kmz': return '<i class="fas fa-map-marked-alt text-teal-500"></i>';
        default: return '<i class="fas fa-file text-gray-500"></i>';
    }
};

const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf': return 'pdf';
        case 'csv': return 'csv';
        case 'xlsx': return 'xlsx';
        case 'doc': case 'docx': return 'doc';
        case 'ppt': case 'pptx': return 'presentation';
        case 'jpg': case 'jpeg': case 'png': case 'gif': return 'image';
        case 'shp': case 'gdb': case 'kml': case 'kmz': return 'gis';
        default: return 'other';
    }
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const updateFileDisplay = () => {
    const uploadedFilesContainer = document.getElementById('uploadedFiles');
    const noFilesPlaceholder = document.getElementById('noFilesPlaceholder');
    if (!uploadedFilesContainer || !noFilesPlaceholder) return;
    
    uploadedFilesContainer.innerHTML = '';
    
    if (files.length === 0) {
        noFilesPlaceholder.classList.remove('hidden');
        noFilesPlaceholder.classList.add('flex');
        uploadedFilesContainer.style.display = 'none';
        updateStats();
        return;
    }

    noFilesPlaceholder.classList.add('hidden');
    noFilesPlaceholder.classList.remove('flex');
    uploadedFilesContainer.style.display = currentView === 'grid' ? 'grid' : 'block';
    uploadedFilesContainer.className = `w-full ${currentView === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-2'}`;
    
    let filteredFiles = [...files];

    // Filtering
    const filterValue = document.getElementById('fileTypeFilter')?.value;
    if (filterValue) {
        filteredFiles = filteredFiles.filter(file => getFileType(file.name) === filterValue);
    }
    
    // Sorting
    const sortValue = document.getElementById('fileSortOrder')?.value;
    filteredFiles.sort((a, b) => {
        switch (sortValue) {
            case 'oldest': return a.lastModified - b.lastModified;
            case 'largest': return b.size - a.size;
            case 'smallest': return a.size - b.size;
            case 'name': return a.name.localeCompare(b.name);
            case 'newest':
            default: return b.lastModified - a.lastModified;
        }
    });

    filteredFiles.forEach(file => {
        const fileElement = document.createElement(currentView === 'grid' ? 'div' : 'li');
        fileElement.className = `file-item ${file.id === selectedFileId ? 'selected' : ''} ${currentView === 'grid' ? 'location-card p-4 relative' : 'flex items-center p-3 bg-gray-800 rounded-lg'}`;
        fileElement.dataset.fileId = file.id;

        const icon = getFileIcon(getFileType(file.name));
        const formattedSize = formatFileSize(file.size);
        const uploadDate = new Date(file.lastModified).toLocaleDateString();

        if(currentView === 'grid') {
            fileElement.innerHTML = `
                <div class="file-icon text-4xl mb-3">${icon}</div>
                <div class="file-name font-bold text-sm truncate">${file.name}</div>
                <div class="file-size text-xs text-gray-400">${formattedSize}</div>
                <div class="file-date text-xs text-gray-500">${uploadDate}</div>
                <div class="absolute top-2 right-2 flex space-x-1 file-actions opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="p-1 hover:bg-gray-700 rounded" onclick="window.previewFile('${file.id}', event)"><i class="fas fa-eye"></i></button>
                    <button class="p-1 hover:bg-gray-700 rounded" onclick="window.downloadFile('${file.id}', event)"><i class="fas fa-download"></i></button>
                    <button class="p-1 hover:bg-gray-700 rounded" onclick="window.removeFile('${file.id}', event)"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        } else {
             fileElement.innerHTML = `
                <div class="file-icon text-2xl w-12 text-center">${icon}</div>
                <div class="flex-grow mx-4">
                    <div class="file-name font-bold truncate">${file.name}</div>
                    <div class="text-xs text-gray-400">${formattedSize} - ${uploadDate}</div>
                </div>
                <div class="file-actions flex items-center space-x-2">
                     <button class="p-2 hover:bg-gray-700 rounded" onclick="window.previewFile('${file.id}', event)"><i class="fas fa-eye"></i></button>
                    <button class="p-2 hover:bg-gray-700 rounded" onclick="window.downloadFile('${file.id}', event)"><i class="fas fa-download"></i></button>
                    <button class="p-2 hover:bg-gray-700 rounded" onclick="window.removeFile('${file.id}', event)"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        }

        fileElement.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            selectedFileId = file.id;
            document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected', 'border-yellow-400'));
            fileElement.classList.add('selected', 'border-yellow-400');
        });

        uploadedFilesContainer.appendChild(fileElement);
    });

    updateStats();
};


const updateStats = () => {
    const totalFiles = files.length;
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    // These are placeholders for now
    const uploadingCount = 0; 
    const completedCount = totalFiles;
    
    document.getElementById('totalFilesCount').textContent = totalFiles;
    document.getElementById('totalSizeCount').textContent = formatFileSize(totalSize);
    document.getElementById('uploadingCount').textContent = uploadingCount;
    document.getElementById('completedCount').textContent = completedCount;
};


const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => {
        file.id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return file;
    });
    files = [...files, ...newFiles];
    updateFileDisplay();
};

window.removeFile = (fileId, event) => {
    event.stopPropagation();
    files = files.filter(f => f.id !== fileId);
    if (selectedFileId === fileId) {
        selectedFileId = null;
    }
    updateFileDisplay();
};

window.downloadFile = (fileId, event) => {
    event.stopPropagation();
    const file = files.find(f => f.id === fileId);
    if(file) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

window.previewFile = (fileId, event) => {
    event.stopPropagation();
    const file = files.find(f => f.id === fileId);
    if(file) {
       alert(`Previewing: ${file.name}`);
       // In a real app, you would implement a proper file previewer modal here.
    }
}


window.toggleFileView = (view) => {
    currentView = view;
    document.getElementById('gridViewBtn').classList.toggle('bg-yellow-500', view === 'grid');
    document.getElementById('gridViewBtn').classList.toggle('bg-gray-600', view !== 'grid');
    document.getElementById('listViewBtn').classList.toggle('bg-yellow-500', view === 'list');
    document.getElementById('listViewBtn').classList.toggle('bg-gray-600', view !== 'list');
    updateFileDisplay();
};

window.filterFiles = () => updateFileDisplay();
window.sortFiles = () => updateFileDisplay();

window.resetFileFilters = () => {
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('fileSortOrder').value = 'newest';
    updateFileDisplay();
}

window.clearAllFiles = () => {
    if(confirm('Are you sure you want to delete all files? This cannot be undone.')) {
        files = [];
        selectedFileId = null;
        updateFileDisplay();
    }
};

window.resetUploadArea = () => {
    // This is more for a 'clear selection' than a full reset in this implementation
    const fileInput = document.getElementById('fileInput');
    if(fileInput) fileInput.value = '';
}

window.editSelectedFile = (event) => {
    event.stopPropagation();
    if (!selectedFileId) {
        alert("Please select a file to edit.");
        return;
    }
    const file = files.find(f => f.id === selectedFileId);
    if (file) {
        const newName = prompt("Enter new file name:", file.name);
        if (newName && newName.trim() !== "") {
            const oldExtension = file.name.split('.').pop();
            let newNameWithExt = newName.trim();
            if (!newNameWithExt.endsWith(`.${oldExtension}`)) {
                newNameWithExt += `.${oldExtension}`;
            }
            const oldFile = files.find(f => f.id === selectedFileId);
            const newFile = new File([oldFile], newNameWithExt, { type: oldFile.type, lastModified: oldFile.lastModified });
            newFile.id = oldFile.id;
            files = files.map(f => f.id === selectedFileId ? newFile : f);
            updateFileDisplay();
        }
    }
};

window.deleteSelectedFile = (event) => {
    event.stopPropagation();
    if (!selectedFileId) {
        alert("Please select a file to delete.");
        return;
    }
     if (confirm("Are you sure you want to delete the selected file?")) {
        window.removeFile(selectedFileId, new MouseEvent('click'));
    }
}

window.showAllFiles = () => {
    document.getElementById('fileTypeFilter').value = '';
    updateFileDisplay();
}

// --- URL Upload Modal ---
window.uploadFromUrl = () => {
    const modal = document.getElementById('urlUploadModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
};

window.closeUrlUploadModal = () => {
    const modal = document.getElementById('urlUploadModal');
    if (modal) {
        modal.classList.add('hidden');
    }
};


window.handleUrlUpload = async (event) => {
    event.preventDefault();
    const urlInput = document.getElementById('fileUrl');
    const fileNameInput = document.getElementById('fileName');
    const url = urlInput.value;
    const customName = fileNameInput.value;

    if (!url) {
        alert('Please enter a URL.');
        return;
    }

    // Basic URL validation
    try {
        new URL(url);
    } catch (_) {
        alert('Please enter a valid URL.');
        return;
    }

    const toast = (message, type = 'success') => {
        // You'd have a proper toast notification system here
        alert(message);
    }
    
    toast('Starting download... please wait.', 'info');
    
    try {
        // We use a CORS proxy to bypass browser restrictions for fetching from other origins.
        // This is a public proxy, for production use a self-hosted or paid service.
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const response = await fetch(proxyUrl + url);

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        
        let fileName = customName.trim();
        if (!fileName) {
            // Try to get filename from content-disposition header
            const disposition = response.headers.get('content-disposition');
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    fileName = matches[1].replace(/['"]/g, '');
                }
            }
        }
        
        // If still no filename, get it from URL path
        if(!fileName) {
             const urlPath = new URL(url).pathname;
             fileName = urlPath.substring(urlPath.lastIndexOf('/') + 1);
        }

        // If still no filename, generate a default one
        if (!fileName) {
            const extension = blob.type.split('/')[1] || 'dat';
            fileName = `downloaded_file_${Date.now()}.${extension}`;
        }
        

        const file = new File([blob], fileName, { type: blob.type });
        handleFiles([file]);

        toast(`File "${fileName}" downloaded successfully!`);
        window.closeUrlUploadModal();
        urlInput.value = '';
        fileNameInput.value = '';

    } catch (error) {
        console.error('URL Download Error:', error);
        toast(`Error downloading file: ${error.message}`, 'error');
    }
};

window.initializeUploadArea = () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const urlUploadForm = document.getElementById('urlUploadForm');

    if (!uploadArea || !fileInput) {
        console.error("Upload area or file input not found!");
        return;
    }
    
    uploadArea.addEventListener('click', (e) => {
        // prevent clicks on buttons from triggering file input
        if(e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragging');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragging');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragging');
        handleFiles(e.dataTransfer.files);
    });
    
    if (urlUploadForm) {
        urlUploadForm.addEventListener('submit', window.handleUrlUpload);
    }
    
    // Initial setup
    updateFileDisplay();
    window.toggleFileView('grid'); // Default to grid view
};

window.triggerBrowseFiles = () => {
    document.getElementById('fileInput').click();
}

document.addEventListener('DOMContentLoaded', window.initializeUploadArea);

    