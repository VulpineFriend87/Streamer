/* Code by Vulpine (https://vulpine.pro) and licensed under the MIT license */

gsap.config({
    nullTargetWarn: false
});

const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const mediaList = document.getElementById('media-list');
const deselectBtn = document.getElementById('deselect-btn');
const selectAllBtn = document.getElementById('select-all');
const deselectAllBtn = document.getElementById('deselect-all');
const deleteSelectedBtn = document.getElementById('delete-selected');
let selectedItems = new Set();
let currentlySelected = null;
let currentFile = null;

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const updateSelectionMode = () => {
    const normalActions = document.querySelector('.normal-actions');
    const selectionActions = document.querySelector('.selection-actions');
    const menuButtons = document.querySelectorAll('.menu-button');
    
    if (selectedItems.size > 0 && mediaList.childElementCount > 0) {
        normalActions.classList.add('hidden');
        selectionActions.classList.add('active');
        deleteSelectedBtn.textContent = `Delete Selected (${selectedItems.size})`;
        menuButtons.forEach(btn => btn.style.display = 'none');
    } else {
        selectionActions.classList.remove('active');
        normalActions.classList.remove('hidden');
        menuButtons.forEach(btn => btn.style.display = '');
    }
};

function animateItemsIn() {
    const items = document.querySelectorAll('.media-item');
    gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "back.out(1.2)"
    });
}

function animateItemOut(item) {
    return gsap.to(item, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in"
    });
}

function animateCheckbox(checkbox, checked) {
    gsap.to(checkbox, {
        scale: checked ? 1 : 0,
        duration: 0.3,
        ease: "back.out(1.7)"
    });
}

function animateSelectionMode(active) {
    const normalActions = document.querySelector('.normal-actions');
    const selectionActions = document.querySelector('.selection-actions');
    
    if (active) {
        gsap.to(normalActions, {
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            onComplete: () => normalActions.classList.add('hidden')
        });
        selectionActions.classList.add('active');
        gsap.from(selectionActions, {
            opacity: 0,
            scale: 0.9,
            duration: 0.3
        });
    } else {
        gsap.to(selectionActions, {
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            onComplete: () => selectionActions.classList.remove('active')
        });
        normalActions.classList.remove('hidden');
        gsap.from(normalActions, {
            opacity: 0,
            scale: 0.9,
            duration: 0.3
        });
    }
}

uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFiles(e.target.files);
    }
});

function handleFiles(files) {
    const formData = new FormData();
    Array.from(files).forEach(file => {
        formData.append('files[]', file);
    });

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Upload error:', data.error);
        } else {
            loadMediaList();
        }
    })
    .catch(error => console.error('Error:', error));
}

function loadMediaList() {
    fetch('/media_list')
        .then(response => response.json())
        .then(files => {
            mediaList.innerHTML = '';
            files.forEach(filename => {
                const item = createMediaItem(filename);
                mediaList.appendChild(item);
            });
            animateItemsIn();
            updateSelectionMode();
            
            fetch('/current_media')
                .then(response => response.json())
                .then(data => {
                    currentlySelected = data.filename;
                    if (currentlySelected) {
                        document.querySelectorAll('.media-item').forEach(item => {
                            if (item.querySelector('.media-name').textContent === currentlySelected) {
                                item.classList.add('selected');
                            }
                        });
                    }
                });
        });
}

function showFileInfoModal(filename) {
    console.log('Debug - Opening modal for file:', filename);
    const modal = document.getElementById('file-info-modal');
    
    // Fetch fresh file info from server
    fetch(`/file_info/${encodeURIComponent(filename)}`)
        .then(response => response.json())
        .then(fileInfo => {
            currentFile = fileInfo;
            
            // Reset modal state
            modal.style.display = 'flex';
            modal.offsetHeight; // Force reflow
            
            // Update content
            document.getElementById('file-preview').src = fileInfo.path;
            document.getElementById('file-title').textContent = fileInfo.name;
            document.getElementById('file-title-input').value = fileInfo.name;
            document.getElementById('file-type').textContent = getFileExtension(fileInfo.name);
            document.getElementById('file-modified').textContent = new Date(fileInfo.lastModified).toLocaleString();
            document.getElementById('file-location').textContent = fileInfo.path;
            
            // Show modal with animation
            requestAnimationFrame(() => {
                modal.classList.add('active');
            });

            // Removed event listener attachments from here
        })
        .catch(error => {
            console.error('Error fetching file info:', error);
            alert('Failed to load file information');
        });
}

// Attach event listeners once during initial load
document.getElementById('close-info-modal-btn').addEventListener('click', () => {
    closeModal();
});

document.getElementById('show-delete-confirmation-modal-btn').addEventListener('click', () => {
    if (currentFile && currentFile.name) {
        showDeleteConfirmationModal(currentFile.name);
    }
});

document.getElementById('edit-title-btn').addEventListener('click', () => {
    startEditingTitle();
});

document.getElementById('save-title-btn').addEventListener('click', () => {
    saveTitle();
});

const inputElement = document.getElementById('file-title-input');

inputElement.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        saveTitle();
    }
});

inputElement.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cancelEditing();
    }
});

function showDeleteConfirmationModal(filename) {
    /* const modal = document.getElementById('delete-confirmation-modal');

    modal.setAttribute('data-filename', filename);
    
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });

    const closeButton = document.getElementById('close-delete-modal-btn');
    const confirmButton = document.getElementById('confirm-delete-btn');
    
    closeButton.addEventListener('click', () => {
        closeModal();
        showFileInfoModal(modal.getAttribute('data-filename'));
    });

    confirmButton.addEventListener('click', () => {
        closeModal();
        deleteFiles([modal.getAttribute('data-filename')]);
    }); */

    if (confirm(`Are you sure you want to delete ${filename}?`)) {
        closeModal();
        deleteFiles([filename]);
    } else {
        showFileInfoModal(filename);
    }
}

function showSelectedDeleteConfirmationModal(filenames) {
    /* const modal = document.getElementById('selected-delete-confirmation-modal');
    
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });

    const closeButton = document.getElementById('close-delete-modal-btn');
    const confirmButton = document.getElementById('confirm-delete-btn');
    
    closeButton.addEventListener('click', () => {
        closeModal();
    });

    confirmButton.addEventListener('click', () => {
        closeModal();
        deleteFiles(filenames);
    }); */

    if (confirm(`Are you sure you want to delete the selected files?`)) {
        deleteFiles(filenames);
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        requestAnimationFrame(() => {
            modal.classList.remove('active');
        });
    });
    
    // Reset title editing state
    cancelEditing();
}

function startEditingTitle() {
    const titleElement = document.getElementById('file-title');
    const inputElement = document.getElementById('file-title-input');
    const editButton = document.querySelector('.edit-button');
    const saveButton = document.querySelector('.save-button');
    const closeButton = document.querySelector('.modal-actions .button:not(.danger)');
    const deleteButton = document.querySelector('.modal-actions .button.danger');
    
    // Disable close and delete buttons
    closeButton.disabled = true;
    deleteButton.disabled = true;
    closeButton.classList.add('disabled');
    deleteButton.classList.add('disabled');
    
    titleElement.style.display = 'none';
    editButton.style.display = 'none';
    inputElement.style.display = 'block';
    saveButton.style.display = 'flex';

    const filename = titleElement.textContent;
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.slice(0, -(extension.length + 1));
    
    inputElement.value = nameWithoutExt;
    inputElement.focus();
    inputElement.setSelectionRange(0, nameWithoutExt.length);
}

function cancelEditing() {
    const titleElement = document.getElementById('file-title');
    const inputElement = document.getElementById('file-title-input');
    const editButton = document.querySelector('.edit-button');
    const saveButton = document.querySelector('.save-button');
    const closeButton = document.querySelector('.modal-actions .button:not(.danger)');
    const deleteButton = document.querySelector('.modal-actions .button.danger');
    
    // Re-enable close and delete buttons
    closeButton.disabled = false;
    deleteButton.disabled = false;
    closeButton.classList.remove('disabled');
    deleteButton.classList.remove('disabled');
    
    titleElement.style.display = 'block';
    editButton.style.display = 'flex';
    inputElement.style.display = 'none';
    saveButton.style.display = 'none';
}

async function saveTitle() {
    // Disable the save button and textbox
    document.getElementById('save-title-btn').disabled = true;
    document.getElementById('file-title-input').disabled = true;

    // Change the save button icon to a spinner
    document.getElementById('save-title-btn').innerHTML = '<span class="material-icons spin">sync</span>';

    const titleElement = document.getElementById('file-title');
    const inputElement = document.getElementById('file-title-input');
    const editButton = document.querySelector('.edit-button');
    const saveButton = document.querySelector('.save-button');
    const closeButton = document.querySelector('.modal-actions .button:not(.danger)');
    const deleteButton = document.querySelector('.modal-actions .button.danger');
    
    const newNameWithoutExt = inputElement.value.trim();
    const extension = currentFile.name.split('.').pop();
    const newName = newNameWithoutExt + '.' + extension;
    const oldName = titleElement.textContent;
    
    if (newNameWithoutExt) {
        if (newName !== currentFile.name) {
            const success = await renameFile(oldName, newName);
            if (!success) {
                // Revert the icon back to 'check' on failure
                document.getElementById('save-title-btn').innerHTML = '<span class="material-icons">check</span>';
                // Re-enable the save button and textbox
                document.getElementById('save-title-btn').disabled = false;
                document.getElementById('file-title-input').disabled = false;
                return;
            }
        }
    } else {
        // If empty name, revert to original name
        titleElement.textContent = currentFile.name;
        document.getElementById('save-title-btn').innerHTML = '<span class="material-icons">check</span>';
        // Re-enable the save button and textbox
        document.getElementById('save-title-btn').disabled = false;
        document.getElementById('file-title-input').disabled = false;
    }
    
    // Re-enable close and delete buttons
    closeButton.disabled = false;
    deleteButton.disabled = false;
    closeButton.classList.remove('disabled');
    deleteButton.classList.remove('disabled');
    
    titleElement.textContent = currentFile.name;
    titleElement.style.display = 'block';
    editButton.style.display = 'flex';
    inputElement.style.display = 'none';
    saveButton.style.display = 'none';

    // Revert the save button icon back to 'check' after successful response
    document.getElementById('save-title-btn').innerHTML = '<span class="material-icons">check</span>';
    // Re-enable the save button and textbox
    document.getElementById('save-title-btn').disabled = false;
    document.getElementById('file-title-input').disabled = false;
}

function getFileExtension(filename) {
    const ext = filename.split('.').pop().toUpperCase();
    return ext === filename.toUpperCase() ? 'FILE' : ext;
}

function deleteFiles(filenames) {
    console.log(JSON.stringify({ filenames }));
    fetch('/delete_media', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filenames })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success === true) {
            if (currentFile !== null && filenames.includes(currentFile.name)) {
                selectMedia(null);
            }
            selectedItems.clear();
            updateSelectionMode();
            loadMediaList();
        } else {
            console.error('Error deleting file:', data.error);
            alert(data.error);
        }
    })
    .catch(error => {
        console.error('Error deleting file:', error);
        alert(error.message);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function createFileElement(file) {
    const div = document.createElement('div');
    div.className = 'file-item';
    div.setAttribute('data-path', file.path);
    div.setAttribute('data-type', file.type);
    
    div.innerHTML = `
        <div class="file-preview">
            <img src="${file.path}" alt="${file.name}">
        </div>
        <div class="file-info">
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
        </div>
        <div class="file-actions">
            <button class="action-button" onclick="showFileInfoModal(${JSON.stringify(file)})">
                <span class="material-icons">info</span>
            </button>
        </div>
    `;
    
    return div;
}

function attachFileListeners(fileElement) {
    fileElement.addEventListener('click', function(e) {
        if (!e.target.closest('.action-button')) {
            toggleFileSelection(this);
        }
    });
}

async function selectMedia(filename) {
    
    if (filename === currentlySelected) {
        return;
    }

    try {
        const response = await fetch('/select_media', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename })
        });
        
        if (response.ok) {
            document.querySelectorAll('.media-item').forEach(item => {
                item.classList.remove('selected');
                if (item.querySelector('.media-name').textContent === filename) {
                    item.classList.add('selected');
                }
            });
            currentlySelected = filename;
        }
    } catch (error) {
        console.error('Failed to select media:', error);
    }
}

async function toggleSelection(item, filename) {
    const checkbox = item.querySelector('.custom-checkbox');
    const isSelected = selectedItems.has(filename);
    
    if (isSelected) {
        selectedItems.delete(filename);
        checkbox.classList.remove('checked');
    } else {
        selectedItems.add(filename);
        checkbox.classList.add('checked');
    }
    
    updateSelectionMode();
}

selectAllBtn.addEventListener('click', () => {
    const items = document.querySelectorAll('.media-item');
    items.forEach(item => {
        const filename = item.querySelector('.media-name').textContent;
        selectedItems.add(filename);
        item.querySelector('.custom-checkbox').classList.add('checked');
    });
    updateSelectionMode();
});

deselectAllBtn.addEventListener('click', () => {
    selectedItems.clear();
    document.querySelectorAll('.custom-checkbox').forEach(checkbox => {
        checkbox.classList.remove('checked');
    });
    updateSelectionMode();
});

deleteSelectedBtn.addEventListener('click', async () => {
    showSelectedDeleteConfirmationModal(Array.from(selectedItems));
});

deselectBtn.addEventListener('click', async () => {
    
    try {
        const response = await fetch('/current_media');
        const data = await response.json();
        
        if (!data.filename) {
            return;
        }

        const deselectResponse = await fetch('/select_media', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename: null })
        });
        
        if (deselectResponse.ok) {
            document.querySelectorAll('.media-item').forEach(item => {
                item.classList.remove('selected');
            });
            currentlySelected = null;
        }
    } catch (error) {
        console.error('Failed to deselect media:', error);
    }
});

async function renameFile(oldName, newName) {
    try {
        const response = await fetch('/rename', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldName, newName })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to rename file');
        }

        const result = await response.json();
        
        // Update selected items if the old name was selected
        if (selectedItems.has(oldName)) {
            selectedItems.delete(oldName);
            selectedItems.add(newName);
        }
        
        // Update current file data with new info
        Object.assign(currentFile, result.file);
        
        // Update the file card in the grid
        const mediaItem = document.querySelector(`.media-item[data-filename="${oldName}"]`);
        if (mediaItem) {
            mediaItem.setAttribute('data-filename', currentFile.name);
            const nameElement = mediaItem.querySelector('.media-name');
            if (nameElement) {
                nameElement.textContent = currentFile.name;
            }
            const previewImg = mediaItem.querySelector('.media-preview');
            if (previewImg) {
                previewImg.src = `/media/${currentFile.name}`;
                previewImg.alt = currentFile.name;
            }
        }
        
        // Update modal title and input
        const modalTitle = document.getElementById('file-title');
        const titleInput = document.getElementById('file-title-input');
        if (modalTitle) modalTitle.textContent = currentFile.name;
        if (titleInput) titleInput.value = currentFile.name;
        
        // If the file was selected before renaming, select the new name
        if (result.wasSelected) {
            selectMedia(currentFile.name);
        }
        
        return true;
    } catch (error) {
        console.error('Error renaming file:', error);
        alert(error.message);
        return false;
    }
}

function createMediaItem(filename) {
    const item = document.createElement('div');
    item.className = 'media-item';
    item.setAttribute('data-filename', filename);
    
    const checkbox = document.createElement('div');
    checkbox.className = 'checkbox-wrapper';
    checkbox.innerHTML = '<div class="custom-checkbox"></div>';
    
    const preview = document.createElement('img');
    preview.className = 'media-preview';
    preview.src = `/media/${filename}`;
    preview.alt = filename;
    
    const info = document.createElement('div');
    info.className = 'media-info';
    
    const nameWrapper = document.createElement('div');
    nameWrapper.className = 'media-name-wrapper';
    
    const name = document.createElement('div');
    name.className = 'media-name';
    name.textContent = filename;

    const menuButton = document.createElement('button');
    menuButton.className = 'menu-button';
    menuButton.innerHTML = '<span class="material-icons">more_vert</span>';
    menuButton.onclick = (e) => {
        e.stopPropagation();
        showFileInfoModal(item.getAttribute('data-filename'));
    };

    nameWrapper.appendChild(name);
    nameWrapper.appendChild(menuButton);
    info.appendChild(nameWrapper);
    item.appendChild(checkbox);
    item.appendChild(preview);
    item.appendChild(info);

    item.addEventListener('click', (e) => {
        if (!e.target.closest('.checkbox-wrapper') && 
            !e.target.closest('.menu-button')) {
            selectMedia(item.getAttribute('data-filename'));
        }
    });

    checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSelection(item, item.getAttribute('data-filename'));
    });

    return item;
}

loadMediaList();