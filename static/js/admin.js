/* Code by Vulpine (https://vulpine.pro) and licensed under the MIT license */

gsap.config({
    nullTargetWarn: false
});

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const mediaList = document.getElementById('media-list');
const deselectBtn = document.getElementById('deselect-btn');
const selectAllBtn = document.getElementById('select-all');
const deselectAllBtn = document.getElementById('deselect-all');
const deleteSelectedBtn = document.getElementById('delete-selected');
let selectedItems = new Set();
let isUpdatingSelection = false;
let currentlySelected = null;

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

const updateSelectionMode = debounce(() => {
    const normalActions = document.querySelector('.normal-actions');
    const selectionActions = document.querySelector('.selection-actions');
    
    if (selectedItems.size > 0) {
        normalActions.classList.add('hidden');
        setTimeout(() => {
            selectionActions.classList.add('active');
        }, 300);
        deleteSelectedBtn.textContent = `Delete Selected (${selectedItems.size})`;
    } else {
        selectionActions.classList.remove('active');
        setTimeout(() => {
            normalActions.classList.remove('hidden');
        }, 300);
    }
}, 100);

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

function animateDropZone(active) {
    const overlay = document.querySelector('.drop-zone-overlay');
    gsap.to(overlay, {
        opacity: active ? 0.3 : 0,
        duration: 0.3
    });
    gsap.to(dropZone, {
        scale: active ? 1.02 : 1,
        duration: 0.3
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

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    animateDropZone(true);
});

dropZone.addEventListener('dragleave', () => {
    animateDropZone(false);
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    animateDropZone(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
});

dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
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

function createMediaItem(filename) {
    const item = document.createElement('div');
    item.className = 'media-item';
    
    const checkbox = document.createElement('div');
    checkbox.className = 'checkbox-wrapper';
    checkbox.innerHTML = '<div class="custom-checkbox"></div>';
    
    const preview = document.createElement('img');
    preview.className = 'media-preview';
    preview.src = `/media/${filename}`;
    preview.alt = filename;
    
    const info = document.createElement('div');
    info.className = 'media-info';
    
    const name = document.createElement('div');
    name.className = 'media-name';
    name.textContent = filename;

    info.appendChild(name);
    item.appendChild(checkbox);
    item.appendChild(preview);
    item.appendChild(info);

    item.addEventListener('click', (e) => {
        if (!e.target.closest('.checkbox-wrapper')) {
            selectMedia(filename);
        }
    });

    checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSelection(item, filename);
    });

    return item;
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
    if (isUpdatingSelection) return;
    isUpdatingSelection = true;

    try {
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
    } finally {
        setTimeout(() => {
            isUpdatingSelection = false;
        }, 100);
    }
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

async function deleteSelectedItems() {
    const items = Array.from(document.querySelectorAll('.media-item'))
        .filter(item => selectedItems.has(item.querySelector('.media-name').textContent));
    
    const deleteAnimations = items.map(item => animateItemOut(item));
    await Promise.all(deleteAnimations);

    try {
        const response = await fetch('/delete_media', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filenames: Array.from(selectedItems)
            })
        });

        if (response.ok) {
            selectedItems.clear();
            loadMediaList();
            updateSelectionMode();
        }
    } catch (error) {
        console.error('Error deleting files:', error);
    }
}

deleteSelectedBtn.addEventListener('click', async () => {
    if (!confirm(`Delete ${selectedItems.size} selected items?`)) return;
    await deleteSelectedItems();
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

loadMediaList();