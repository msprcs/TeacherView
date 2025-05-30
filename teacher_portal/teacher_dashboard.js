document.addEventListener('DOMContentLoaded', function () {
    setUpSidebarNavigation();
    setUpSidebarToggle();
    setUpMediaPreview();
    setUpPostAnnouncement();

    // Section navigation based on hash
    showSectionByHash();
    window.addEventListener('hashchange', showSectionByHash);

    function showSectionByHash() {
        document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
        let hash = window.location.hash.replace('#', '');
        if (!hash || !document.getElementById(hash)) hash = 'home';
        document.getElementById(hash).style.display = '';
    }

    // Render announcements at the start
    renderAnnouncements(document.getElementById('announcement-list'), getAnnouncements());
});

function setUpSidebarNavigation() {
    // Navigation for dashboard pages
    const navLinks = [
        { id: 'home-tab', url: "teacher_home.html" },
        { id: 'class-tab', url: "teacher_class.html" },
        { id: 'class-record-tab', url: "teacher_classrecord.html" },
        { id: 'announcement-tab', url: "teacher_dashboard.html#announcement" },
        { id: 'account-tab', url: "teacher_dashboard.html#account" },
        { id: 'landing-tab', url: "landing.html" }
    ];
    navLinks.forEach(link => {
        const el = document.getElementById(link.id);
        if (el) {
            el.onclick = function() {
                window.location.href = link.url;
            };
            el.setAttribute('tabindex', '0');
            el.addEventListener('keydown', function(e) {
                if (e.key === "Enter" || e.key === " ") el.click();
            });
        }
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = function () {
            alert('You have been logged out.');
            window.location.reload();
        };
    }

    const accountTab = document.getElementById('account-tab');
    if (accountTab) {
        accountTab.onmouseenter = function () {
            document.getElementById('logout-container').style.display = '';
        };
        accountTab.onmouseleave = function () {
            document.getElementById('logout-container').style.display = 'none';
        };
    }
}

// Sidebar toggle logic (collapsed for brevity, you can expand as needed)
function setUpSidebarToggle() {
    // ... (you can use your original sidebar toggle code here)
}

// Announcement Storage
function getAnnouncements() {
    try {
        return JSON.parse(localStorage.getItem("announcements") || "[]");
    } catch (e) {
        return [];
    }
}
function saveAnnouncements(list) {
    localStorage.setItem("announcements", JSON.stringify(list));
}

// Media preview logic
function setUpMediaPreview() {
    const mediaUpload = document.getElementById('media-upload');
    const mediaPreview = document.getElementById('media-preview');
    if (!mediaUpload || !mediaPreview) return;
    mediaUpload.addEventListener('change', function () {
        mediaPreview.innerHTML = '';
        const files = Array.from(mediaUpload.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
                if (file.type.startsWith("image/")) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = "h-28 w-auto rounded border shadow-lg cursor-pointer";
                    img.onclick = function () { showMediaModal(img.src, file.type); };
                    mediaPreview.appendChild(img);
                } else if (file.type.startsWith("video/")) {
                    const video = document.createElement('video');
                    video.src = e.target.result;
                    video.className = "h-28 w-auto rounded border shadow-lg cursor-pointer";
                    video.controls = true;
                    video.onclick = function () { showMediaModal(video.src, file.type); };
                    mediaPreview.appendChild(video);
                }
            };
            reader.readAsDataURL(file);
        });
    });
}

// Post announcement logic
function setUpPostAnnouncement() {
    const btn = document.getElementById('post-announcement-btn');
    if (!btn) return;
    const mediaUpload = document.getElementById('media-upload');

    btn.onclick = async function () {
        const title = document.getElementById('announcement-title-input').value.trim();
        const grade = document.getElementById('announcement-class-input').value;
        const message = document.getElementById('announcement-message-input').value.trim();
        const files = Array.from(mediaUpload.files);

        if (!title) {
            alert("Please enter a title for the announcement.");
            return;
        }
        if (!grade) {
            alert("Please select a grade.");
            return;
        }
        if (!message && !files.length) {
            alert("Please enter a message or upload an image/video.");
            return;
        }
        let images = [];
        if (files.length) {
            images = await Promise.all(files.map(file => {
                return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        resolve({
                            name: file.name,
                            type: file.type,
                            dataUrl: e.target.result
                        });
                    };
                    reader.readAsDataURL(file);
                });
            }));
        }

        const announcements = getAnnouncements();
        announcements.unshift({
            title,
            grade,
            message,
            images,
            time: Date.now()
        });
        saveAnnouncements(announcements);

        // Clear fields
        document.getElementById('announcement-title-input').value = "";
        document.getElementById('announcement-class-input').value = "";
        document.getElementById('announcement-message-input').value = "";
        mediaUpload.value = "";
        document.getElementById('media-preview').innerHTML = "";

        renderAnnouncements(document.getElementById('announcement-list'), announcements);
    };
}

// Image/video modal
function showMediaModal(mediaUrl, type) {
    let modal = document.getElementById('media-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'media-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div id="media-modal-content" class="relative max-w-full max-h-full">
                <button id="media-modal-close" class="absolute top-2 right-2 bg-gray-900 bg-opacity-80 text-white rounded-full p-1 z-10">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
                <div id="media-modal-media"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    const mediaDiv = document.getElementById('media-modal-media');
    if (type.startsWith('image/')) {
        mediaDiv.innerHTML = `<img src="${mediaUrl}" class="rounded max-w-[90vw] max-h-[80vh] border-4 border-white shadow-xl" />`;
    } else if (type.startsWith('video/')) {
        mediaDiv.innerHTML = `<video src="${mediaUrl}" controls autoplay class="rounded max-w-[90vw] max-h-[80vh] border-4 border-white shadow-xl"></video>`;
    }
    modal.style.display = 'flex';
    document.getElementById('media-modal-close').onclick = function () {
        modal.style.display = 'none';
    };
    modal.onclick = function (e) {
        if (e.target === modal) modal.style.display = 'none';
    };
}

// Render Announcements
function renderAnnouncements(container, announcements) {
    container.innerHTML = '';
    if (!announcements.length) {
        container.innerHTML = '<div class="text-gray-400 italic">No announcements yet.</div>';
        return;
    }
    announcements.forEach((a, idx) => {
        const box = document.createElement('div');
        box.className = "bg-white shadow p-4 rounded mb-2 relative";
        box.dataset.announcementIndex = idx;

        if (a.title) {
            const t = document.createElement('div');
            t.className = "font-bold text-lg mb-1";
            t.textContent = a.title;
            box.appendChild(t);
        }
        if (a.grade) {
            const c = document.createElement('div');
            c.className = "italic text-blue-700 text-sm mb-2";
            c.textContent = `For: ${a.grade}`;
            box.appendChild(c);
        }
        if (a.message && a.message.trim()) {
            const p = document.createElement('p');
            p.className = "mb-2";
            p.innerHTML = a.message.replace(/\n/g, '<br>');
            box.appendChild(p);
        }
        if (a.images && a.images.length) {
            const mediaDiv = document.createElement('div');
            mediaDiv.className = "flex flex-wrap gap-3 mb-2";
            a.images.forEach((imgObj, i) => {
                if (imgObj.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = imgObj.dataUrl;
                    img.alt = "announcement image";
                    img.className = "cursor-pointer max-h-48 max-w-xs rounded border-2 border-blue-200 shadow-lg transition-transform hover:scale-105";
                    img.onclick = e => {
                        e.stopPropagation();
                        showMediaModal(img.src, imgObj.type);
                    };
                    mediaDiv.appendChild(img);
                } else if (imgObj.type.startsWith('video/')) {
                    const video = document.createElement('video');
                    video.src = imgObj.dataUrl;
                    video.className = "cursor-pointer max-h-48 max-w-xs rounded border-2 border-blue-200 shadow-lg transition-transform hover:scale-105";
                    video.controls = true;
                    video.onclick = e => {
                        e.stopPropagation();
                        showMediaModal(video.src, imgObj.type);
                    };
                    mediaDiv.appendChild(video);
                }
            });
            box.appendChild(mediaDiv);
        }
        const time = document.createElement('div');
        time.className = "text-xs text-gray-400 mt-2";
        time.textContent = a.time ? new Date(a.time).toLocaleString() : '';
        box.appendChild(time);

        container.appendChild(box);
    });
}