// Sidebar navigation
document.getElementById('home-tab').onclick = function() {
  window.location.href = "teacher_home.html";
};
document.getElementById('class-tab').onclick = function() {
  window.location.href = "teacher_class.html";
};
document.getElementById('class-record-tab').onclick = function() {
  window.location.href = "teacher_classrecord.html";
};
document.getElementById('announcement-tab').onclick = function() {
  window.location.href = "teacher_announcement.html";
};
document.getElementById('logout-btn').onclick = function () {
  alert('You have been logged out.');
  window.location.reload();
};

// --- Announcement Logic ---

// Helper: get all announcements from localStorage
function getAnnouncements() {
  try {
    return JSON.parse(localStorage.getItem("announcements") || "[]");
  } catch (e) {
    return [];
  }
}
// Helper: save announcements to localStorage
function saveAnnouncements(arr) {
  localStorage.setItem("announcements", JSON.stringify(arr));
}

// Render all announcements
function renderAnnouncements() {
  const container = document.getElementById('announcements-list');
  const announcements = getAnnouncements();
  container.innerHTML = '';
  if (!announcements.length) {
    container.innerHTML = '<div class="italic text-violet-400 text-center">No announcement</div>';
    return;
  }
  announcements.forEach((a, idx) => {
    // Card
    const card = document.createElement('div');
    card.className = "announcement-card";
    card.style.marginBottom = "0.5rem";
    card.dataset.idx = idx;
    // Actions
    const actions = document.createElement('div');
    actions.className = 'announcement-actions';
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = "Edit";
    editBtn.onclick = () => showEditForm(idx, a);
    actions.appendChild(editBtn);
    // Delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteAnnouncement(idx);
    actions.appendChild(delBtn);
    card.appendChild(actions);
    // Content
    if (a.title) {
      const t = document.createElement('div');
      t.className = "title";
      t.textContent = a.title;
      card.appendChild(t);
    }
    if (a.grade) {
      const c = document.createElement('div');
      c.className = "grade";
      c.textContent = `For: ${a.grade}`;
      card.appendChild(c);
    }
    if (a.message && a.message.trim()) {
      const p = document.createElement('div');
      p.className = "message";
      p.innerHTML = a.message.replace(/\n/g, '<br>');
      card.appendChild(p);
    }
    if (a.images && a.images.length) {
      const mediaDiv = document.createElement('div');
      mediaDiv.className = "images";
      a.images.forEach((m, imgIdx) => {
        if (m.type && m.type.startsWith("image/")) {
          const img = document.createElement('img');
          img.src = m.dataUrl;
          img.alt = "announcement image";
          img.tabIndex = 0;
          img.style.width = "100%";
          img.style.height = "200px";
          img.style.objectFit = "cover";
          img.onclick = () => showImageModal(m.dataUrl);
          img.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") showImageModal(m.dataUrl); };
          mediaDiv.appendChild(img);
        }
      });
      card.appendChild(mediaDiv);
    }
    const time = document.createElement('div');
    time.className = "time";
    time.textContent = a.time ? new Date(a.time).toLocaleString() : '';
    card.appendChild(time);

    container.appendChild(card);
  });
}

// Show edit form in-place
function showEditForm(idx, a) {
  const card = document.querySelector(`.announcement-card[data-idx="${idx}"]`);
  if (!card) return;
  // Remove old card content except .announcement-actions
  Array.from(card.children).forEach(child => {
    if (!child.classList.contains('announcement-actions')) card.removeChild(child);
  });

  // Form
  const form = document.createElement('form');
  form.className = "edit-form";
  form.onsubmit = e => {
    e.preventDefault();
    // Collect data
    const title = form.elements['title'].value;
    const grade = form.elements['grade'].value;
    const message = form.elements['message'].value;
    // Images: keep previous unless replaced
    let images = a.images || [];
    if (form.elements['images'].files.length > 0) {
      images = [];
      let loaded = 0;
      for (let file of form.elements['images'].files) {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = function(ev) {
            images.push({type: file.type, dataUrl: ev.target.result});
            loaded++;
            if (loaded === form.elements['images'].files.length) {
              updateAnnouncement(idx, title, grade, message, images);
            }
          };
          reader.readAsDataURL(file);
        }
      }
      return; // Wait for FileReader
    }
    updateAnnouncement(idx, title, grade, message, images);
  };

  // Title
  const titleLabel = document.createElement('label');
  titleLabel.textContent = "Title";
  form.appendChild(titleLabel);
  const titleInput = document.createElement('input');
  titleInput.type = "text";
  titleInput.name = "title";
  titleInput.value = a.title || "";
  titleInput.required = true;
  form.appendChild(titleInput);

  // Grade
  const gradeLabel = document.createElement('label');
  gradeLabel.textContent = "Grade";
  form.appendChild(gradeLabel);
  const gradeInput = document.createElement('input');
  gradeInput.type = "text";
  gradeInput.name = "grade";
  gradeInput.value = a.grade || "";
  form.appendChild(gradeInput);

  // Message
  const msgLabel = document.createElement('label');
  msgLabel.textContent = "Message";
  form.appendChild(msgLabel);
  const msgTextarea = document.createElement('textarea');
  msgTextarea.name = "message";
  msgTextarea.value = a.message || "";
  msgTextarea.required = true;
  form.appendChild(msgTextarea);

  // Images (show previews)
  if (a.images && a.images.length) {
    const imgPreview = document.createElement('div');
    imgPreview.className = "img-preview";
    a.images.forEach(m => {
      if (m.type && m.type.startsWith("image/")) {
        const img = document.createElement('img');
        img.src = m.dataUrl;
        img.alt = "preview";
        img.onclick = () => showImageModal(m.dataUrl);
        img.style.cursor = "pointer";
        imgPreview.appendChild(img);
      }
    });
    form.appendChild(imgPreview);
  }

  // Image upload
  const imgLabel = document.createElement('label');
  imgLabel.textContent = "Replace Images";
  form.appendChild(imgLabel);
  const imgInput = document.createElement('input');
  imgInput.type = "file";
  imgInput.name = "images";
  imgInput.accept = "image/*";
  imgInput.multiple = true;
  form.appendChild(imgInput);

  // Actions
  const actionsDiv = document.createElement('div');
  actionsDiv.className = "form-actions";
  const saveBtn = document.createElement('button');
  saveBtn.type = "submit";
  saveBtn.textContent = "Save";
  actionsDiv.appendChild(saveBtn);
  const cancelBtn = document.createElement('button');
  cancelBtn.type = "button";
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = e => renderAnnouncements();
  actionsDiv.appendChild(cancelBtn);
  form.appendChild(actionsDiv);

  card.appendChild(form);
}

// Update an announcement and re-render
function updateAnnouncement(idx, title, grade, message, images) {
  const announcements = getAnnouncements();
  announcements[idx] = {
    ...announcements[idx],
    title,
    grade,
    message,
    images,
    time: new Date().toISOString()
  };
  saveAnnouncements(announcements);
  renderAnnouncements();
}

// Delete an announcement
function deleteAnnouncement(idx) {
  if (!confirm('Are you sure you want to delete this announcement?')) return;
  const announcements = getAnnouncements();
  announcements.splice(idx, 1);
  saveAnnouncements(announcements);
  renderAnnouncements();
}

// --- New Announcement Creation ---
const newForm = document.getElementById('new-announcement-form');
const newImagesInput = document.getElementById('new-images');
const newImagesPreview = document.getElementById('new-images-preview');

if (newImagesInput) {
  newImagesInput.addEventListener('change', function() {
    newImagesPreview.innerHTML = '';
    for (let file of this.files) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          const img = document.createElement('img');
          img.src = ev.target.result;
          img.style.maxHeight = "3.5rem";
          img.style.borderRadius = "0.3rem";
          img.style.background = "#fff";
          img.style.boxShadow = "0 1px 4px 0 rgba(124,58,237,0.09)";
          img.style.cursor = "pointer";
          img.onclick = () => showImageModal(ev.target.result);
          newImagesPreview.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    }
  });
}

if (newForm) {
  newForm.onsubmit = function(e) {
    e.preventDefault();
    const title = newForm.elements['title'].value;
    const grade = newForm.elements['grade'].value;
    const message = newForm.elements['message'].value;
    let images = [];
    if (newForm.elements['images'].files.length > 0) {
      let files = Array.from(newForm.elements['images'].files);
      let loaded = 0;
      files.forEach(file => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = function(ev) {
            images.push({type: file.type, dataUrl: ev.target.result});
            loaded++;
            if (loaded === files.length) {
              doCreateAnnouncement(title, grade, message, images);
            }
          };
          reader.readAsDataURL(file);
        } else {
          loaded++;
        }
      });
      if (files.filter(f=>f.type.startsWith("image/")).length === 0) {
        doCreateAnnouncement(title, grade, message, []);
      }
    } else {
      doCreateAnnouncement(title, grade, message, []);
    }
  };
}
function doCreateAnnouncement(title, grade, message, images) {
  const announcements = getAnnouncements();
  announcements.unshift({
    title,
    grade,
    message,
    images,
    time: new Date().toISOString()
  });
  saveAnnouncements(announcements);
  // Reset new post form
  newForm.reset();
  newImagesPreview.innerHTML = '';
  renderAnnouncements();
}

// Image Modal
function showImageModal(imgUrl) {
  // Remove old modal if present
  let oldModal = document.getElementById('image-modal-overlay');
  if (oldModal) oldModal.remove();

  const overlay = document.createElement('div');
  overlay.className = "image-modal-overlay";
  overlay.id = "image-modal-overlay";
  overlay.tabIndex = 0;
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  const modal = document.createElement('div');
  modal.className = "image-modal";
  modal.onclick = (e) => e.stopPropagation();

  const img = document.createElement('img');
  img.src = imgUrl;
  modal.appendChild(img);

  const close = document.createElement('button');
  close.textContent = "Close";
  close.onclick = () => overlay.remove();
  modal.appendChild(close);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.focus();
  overlay.onkeydown = (e) => {
    if (e.key === "Escape") overlay.remove();
  };
}

// Live update on storage change
window.addEventListener('storage', function(e) {
  if (e.key === "announcements") {
    renderAnnouncements();
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', renderAnnouncements);