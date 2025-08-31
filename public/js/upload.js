
let allFiles = [];
let uploadedFileObjects = {};
let selectedFileId = null;

function getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const fileTypes = {
        'csv': 'csv',
        'xlsx': 'xlsx',
        'xls': 'xlsx',
        'pdf': 'pdf',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'gif': 'image',
        'doc': 'doc',
        'docx': 'doc',
        'shp': 'gis',
        'gdb': 'gis',
        'kml': 'gis',
        'kmz': 'gis',
        'ppt': 'presentation',
        'pptx': 'presentation',
    };
    return fileTypes[extension] || 'other';
}

function getFileIcon(fileType) {
    const icons = {
        'csv': '<i class="fas fa-file-csv text-green-400"></i>',
        'xlsx': '<i class="fas fa-file-excel text-green-500"></i>',
        'pdf': '<i class="fas fa-file-pdf text-red-500"></i>',
        'image': '<i class="fas fa-file-image text-purple-400"></i>',
        'doc': '<i class="fas fa-file-word text-blue-500"></i>',
        'gis': '<i class="fas fa-globe-americas text-teal-400"></i>',
        'presentation': '<i class="fas fa-file-powerpoint text-orange-400"></i>',
        'other': '<i class="fas fa-file text-gray-400"></i>'
    };
    return icons[fileType] || icons['other'];
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateFileStats() {
    document.getElementById('totalFilesCount').textContent = allFiles.length;
    
    const totalSize = allFiles.reduce((acc, file) => acc + (file.size || 0), 0);
    document.getElementById('totalSizeCount').textContent = formatFileSize(totalSize);

    const uploadingCount = allFiles.filter(f => f.status === 'uploading').length;
    document.getElementById('uploadingCount').textContent = uploadingCount;

    const completedCount = allFiles.filter(f => f.status === 'completed').length;
    document.getElementById('completedCount').textContent = completedCount;
}

function renderFiles() {
    const uploadedFilesContainer = document.getElementById('uploadedFiles');
    const noFilesPlaceholder = document.getElementById('noFilesPlaceholder');
    const fileTypeFilter = document.getElementById('fileTypeFilter').value;
    const fileSortOrder = document.getElementById('fileSortOrder').value;

    let filesToRender = [...allFiles];

    if (fileTypeFilter) {
        filesToRender = filesToRender.filter(file => getFileType(file.name) === fileTypeFilter);
    }
    
    filesToRender.sort((a, b) => {
        switch (fileSortOrder) {
            case 'newest': return new Date(b.lastModified) - new Date(a.lastModified);
            case 'oldest': return new Date(a.lastModified) - new Date(b.lastModified);
            case 'largest': return b.size - a.size;
            case 'smallest': return a.size - a.size;
            case 'name': return a.name.localeCompare(b.name);
            default: return 0;
        }
    });

    if (filesToRender.length === 0) {
        uploadedFilesContainer.innerHTML = '';
        noFilesPlaceholder.classList.remove('hidden');
        noFilesPlaceholder.classList.add('flex');
    } else {
        noFilesPlaceholder.classList.add('hidden');
        noFilesPlaceholder.classList.remove('flex');
        
        const viewMode = document.getElementById('gridViewBtn').classList.contains('bg-yellow-500') ? 'grid' : 'list';
        uploadedFilesContainer.className = viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' 
            : 'space-y-2';

        uploadedFilesContainer.innerHTML = filesToRender.map(file => createFileElement(file, viewMode)).join('');

        document.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.file-actions')) {
                     document.querySelectorAll('.file-item').forEach(el => el.classList.remove('ring-2', 'ring-yellow-400'));
                     item.classList.add('ring-2', 'ring-yellow-400');
                     selectedFileId = item.dataset.id;
                }
            });
        });
    }
    updateFileStats();
}

function createFileElement(file, viewMode) {
    const fileType = getFileType(file.name);
    const icon = getFileIcon(fileType);
    const fileId = file.id || `file-${Date.now()}-${Math.random()}`;
    file.id = fileId;

    if (viewMode === 'grid') {
        return `
            <div class="file-item bg-gray-800 rounded-lg p-4 flex flex-col justify-between transition-all duration-300 hover:bg-gray-700 hover:shadow-lg hover:-translate-y-1 relative" data-id="${fileId}" data-name="${file.name}">
                 <div class="absolute top-2 right-2 flex space-x-1 file-actions-hover opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="previewFile('${fileId}', event)" class="bg-gray-700 p-1.5 rounded-full text-white hover:bg-blue-500 transition-colors"><i class="fas fa-eye"></i></button>
                    <button onclick="downloadFile('${fileId}', event)" class="bg-gray-700 p-1.5 rounded-full text-white hover:bg-green-500 transition-colors"><i class="fas fa-download"></i></button>
                    <button onclick="removeFile('${fileId}', event)" class="bg-gray-700 p-1.5 rounded-full text-white hover:bg-red-500 transition-colors"><i class="fas fa-trash"></i></button>
                </div>
                <div class="text-center">
                    <div class="text-4xl mb-2">${icon}</div>
                    <p class="text-sm font-semibold text-white truncate" title="${file.name}">${file.name}</p>
                    <p class="text-xs text-gray-400">${formatFileSize(file.size)}</p>
                </div>
                <div class="mt-4">
                    ${file.status === 'uploading' ? 
                        `<div class="w-full bg-gray-600 rounded-full h-1.5"><div class="bg-yellow-400 h-1.5 rounded-full" style="width: ${file.progress || 0}%"></div></div>` :
                        `<div class="text-xs text-green-400 text-center"><i class="fas fa-check-circle mr-1"></i>Completed</div>`
                    }
                </div>
            </div>
        `;
    } else { // List view
        return `
            <div class="file-item bg-gray-800 rounded-lg p-3 flex items-center justify-between transition-all duration-300 hover:bg-gray-700" data-id="${fileId}" data-name="${file.name}">
                <div class="flex items-center gap-4 flex-grow truncate">
                    <span class="text-xl">${icon}</span>
                    <div class="truncate">
                        <p class="text-sm font-semibold text-white truncate" title="${file.name}">${file.name}</p>
                        <p class="text-xs text-gray-400">${formatFileSize(file.size)}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4 flex-shrink-0">
                     <p class="text-xs text-gray-400 hidden md:block">${new Date(file.lastModified).toLocaleDateString()}</p>
                     ${file.status === 'uploading' ?
                        `<div class="w-24 bg-gray-600 rounded-full h-1.5"><div class="bg-yellow-400 h-1.5 rounded-full" style="width: ${file.progress || 0}%"></div></div>` :
                        `<span class="text-xs text-green-400"><i class="fas fa-check-circle mr-1"></i>Completed</span>`
                     }
                    <div class="file-actions flex space-x-2">
                         <button onclick="previewFile('${fileId}', event)" class="text-gray-400 hover:text-blue-400"><i class="fas fa-eye"></i></button>
                         <button onclick="downloadFile('${fileId}', event)" class="text-gray-400 hover:text-green-400"><i class="fas fa-download"></i></button>
                         <button onclick="removeFile('${fileId}', event)" class="text-gray-400 hover:text-red-400"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    }
}

function handleFiles(files) {
    [...files].forEach(file => {
        if (file.size > 500 * 1024 * 1024) {
             alert(`File ${file.name} is too large. Maximum size is 500MB.`);
             return;
        }
        const fileWithStatus = Object.assign(file, { status: 'uploading', progress: 0, id: `file-${Date.now()}-${Math.random()}` });
        allFiles.push(fileWithStatus);
        uploadedFileObjects[fileWithStatus.id] = file;

        // Simulate upload
        const interval = setInterval(() => {
            fileWithStatus.progress += 10;
            if (fileWithStatus.progress >= 100) {
                fileWithStatus.progress = 100;
                fileWithStatus.status = 'completed';
                clearInterval(interval);
            }
            renderFiles();
        }, 200);
    });
    renderFiles();
}

function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    if(!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', (e) => {
        if(e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
           fileInput.click()
        }
    });
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragging'));
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragging'));
    });

    uploadArea.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
}

// Global functions
window.initializeUploadArea = function() {
    setupDragAndDrop();
    renderFiles(); // Initial render
};

window.triggerBrowseFiles = function() {
    document.getElementById('fileInput')?.click();
}

window.showAllFiles = function() {
    document.getElementById('fileTypeFilter').value = '';
    renderFiles();
};

window.editSelectedFile = function(event) {
    event.stopPropagation();
    if (!selectedFileId) {
        alert("Please select a file to edit.");
        return;
    }
    const file = allFiles.find(f => f.id === selectedFileId);
    if (file) {
        const newName = prompt("Enter new file name:", file.name);
        if (newName && newName.trim() !== "") {
            file.name = newName.trim();
            renderFiles();
        }
    }
};

window.deleteSelectedFile = function(event) {
    event.stopPropagation();
    if (!selectedFileId) {
        alert("Please select a file to delete.");
        return;
    }
    if (confirm("Are you sure you want to delete the selected file?")) {
        allFiles = allFiles.filter(f => f.id !== selectedFileId);
        delete uploadedFileObjects[selectedFileId];
        selectedFileId = null;
        renderFiles();
    }
};

window.clearAllFiles = function() {
    if (confirm("Are you sure you want to clear all uploaded files?")) {
        allFiles = [];
        uploadedFileObjects = {};
        selectedFileId = null;
        renderFiles();
    }
};

window.resetUploadArea = function() {
    document.getElementById('fileInput').value = '';
    window.clearAllFiles();
};

window.toggleFileView = function(view) {
    const gridBtn = document.getElementById('gridViewBtn');
    const listBtn = document.getElementById('listViewBtn');
    if (view === 'grid') {
        gridBtn.classList.add('bg-yellow-500', 'text-white');
        gridBtn.classList.remove('bg-gray-600');
        listBtn.classList.add('bg-gray-600');
        listBtn.classList.remove('bg-yellow-500', 'text-white');
    } else {
        listBtn.classList.add('bg-yellow-500', 'text-white');
        listBtn.classList.remove('bg-gray-600');
        gridBtn.classList.add('bg-gray-600');
        gridBtn.classList.remove('bg-yellow-500', 'text-white');
    }
    renderFiles();
};

window.filterFiles = function() {
    renderFiles();
};

window.sortFiles = function() {
    renderFiles();
};

window.resetFileFilters = function() {
    document.getElementById('fileTypeFilter').value = '';
    document.getElementById('fileSortOrder').value = 'newest';
    renderFiles();
};

window.uploadFromUrl = function() {
    document.getElementById('urlUploadModal').classList.remove('hidden');
};

window.closeUrlUploadModal = function() {
    document.getElementById('urlUploadModal').classList.add('hidden');
};

document.getElementById('urlUploadForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const url = document.getElementById('fileUrl').value;
    const customName = document.getElementById('customFileName').value;
    if (url) {
        // This is a simplified version. A real implementation would fetch the file.
        const fileName = customName || url.split('/').pop().split('?')[0];
        const dummyFile = new File(["dummy content"], fileName, { type: "text/plain", lastModified: new Date() });
        const fileWithStatus = Object.assign(dummyFile, {
            status: 'completed',
            progress: 100,
            id: `file-${Date.now()}-${Math.random()}`,
            size: Math.random() * 5 * 1024 * 1024 // random size up to 5MB
        });
        allFiles.push(fileWithStatus);
        uploadedFileObjects[fileWithStatus.id] = dummyFile;
        renderFiles();
        window.closeUrlUploadModal();
        e.target.reset();
    }
});


// Functions for file item actions
window.removeFile = function(fileId, event) {
    event.stopPropagation();
    if (confirm("Are you sure you want to delete this file?")) {
        allFiles = allFiles.filter(f => f.id !== fileId);
        delete uploadedFileObjects[fileId];
        if (selectedFileId === fileId) {
            selectedFileId = null;
        }
        renderFiles();
    }
};

window.downloadFile = function(fileId, event) {
    event.stopPropagation();
    const file = uploadedFileObjects[fileId];
    if (file) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } else {
        alert('File not found for download.');
    }
};

window.previewFile = function(fileId, event) {
    event.stopPropagation();
    const file = uploadedFileObjects[fileId];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewModal = document.createElement('div');
            previewModal.id = 'filePreviewModal';
            previewModal.className = 'fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50';
            
            let content;
            if (file.type.startsWith('image/')) {
                content = `<img src="${e.target.result}" class="max-w-full max-h-[80vh] rounded-lg shadow-2xl">`;
            } else if (file.type === 'application/pdf') {
                 content = `<iframe src="${e.target.result}" class="w-[80vw] h-[80vh] rounded-lg shadow-2xl" frameborder="0"></iframe>`;
            } else {
                 content = `<pre class="bg-gray-900 text-white p-6 rounded-lg shadow-2xl w-[80vw] h-[80vh] overflow-auto text-sm">${e.target.result}</pre>`;
            }

            previewModal.innerHTML = `
                <div class="glow-modal p-4 relative">
                    <button onclick="document.getElementById('filePreviewModal').remove()" class="absolute -top-3 -right-3 bg-red-500 text-white rounded-full h-8 w-8 flex items-center justify-center z-10">&times;</button>
                    ${content}
                </div>
            `;
            document.body.appendChild(previewModal);
        };

        if (file.type.startsWith('image/') || file.type === 'application/pdf' || file.type.startsWith('text/')) {
            reader.readAsDataURL(file);
        } else {
           reader.readAsText(file, 'UTF-8');
        }
    } else {
        alert('File not found for preview.');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Make sure this runs after the DOM is ready
    if(document.getElementById('uploadArea')) {
         window.initializeUploadArea();
    }
});
