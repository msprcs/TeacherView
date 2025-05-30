// teacher_home.js

// Sidebar toggle logic
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');
const showBtn = document.getElementById('show-sidebar-btn');

function hideSidebar() {
  sidebar.classList.add('hidden');
  showBtn.classList.remove('hidden');
}

function showSidebar() {
  sidebar.classList.remove('hidden');
  showBtn.classList.add('hidden');
}

toggleBtn.onclick = () => {
  hideSidebar();
};

showBtn.onclick = () => {
  showSidebar();
};

// Navigation links
document.getElementById('home-tab').onclick = function() {
  window.location.href = "teacher_home.html";
};
document.getElementById('class-tab').onclick = function() {
  window.location.href = "teacher_class.html";
};
document.getElementById('class-record-tab').onclick = function() {
  window.location.href = 'teacher_classrecord.html';
};
document.getElementById('announcement-tab').onclick = function() {
  window.location.href = "teacher_dashboard.html#announcement";
};

// Logout
document.getElementById('logout-btn').onclick = function () {
  alert('You have been logged out.');
  window.location.reload();
};

// Set teacher name
document.getElementById('teacher-name').textContent = 'Jed';

// Announcement logic
function getAnnouncements() {
  try {
    return JSON.parse(localStorage.getItem("announcements") || "[]");
  } catch (e) {
    return [];
  }
}

function renderLatestAnnouncement() {
  const container = document.getElementById('announcement-content');
  const announcements = getAnnouncements();
  container.innerHTML = '';
  if (!announcements.length) {
    container.innerHTML = '<div class="text-gray-400 italic">No announcement</div>';
    return;
  }
  const a = announcements[0];
  if (a.title) {
    const t = document.createElement('div');
    t.className = "font-bold text-lg mb-1";
    t.textContent = a.title;
    container.appendChild(t);
  }
  if (a.grade) {
    const c = document.createElement('div');
    c.className = "italic text-blue-700 text-sm mb-2";
    c.textContent = `For: ${a.grade}`;
    container.appendChild(c);
  }
  if (a.message && a.message.trim()) {
    const p = document.createElement('p');
    p.className = "mb-2";
    p.innerHTML = a.message.replace(/\n/g, '<br>');
    container.appendChild(p);
  }
  if (a.images && a.images.length) {
    const mediaDiv = document.createElement('div');
    mediaDiv.className = "flex flex-wrap gap-2 mb-2";
    a.images.forEach(m => {
      if (m.type.startsWith("image/")) {
        const img = document.createElement('img');
        img.src = m.dataUrl;
        img.alt = "announcement image";
        img.className = "max-h-32 max-w-xs rounded shadow";
        mediaDiv.appendChild(img);
      }
    });
    container.appendChild(mediaDiv);
  }
  const time = document.createElement('div');
  time.className = "text-xs text-gray-400 mt-2";
  time.textContent = a.time ? new Date(a.time).toLocaleString() : '';
  container.appendChild(time);
}

document.addEventListener('DOMContentLoaded', function() {
  renderLatestAnnouncement();

  // Initialize calendar
  if (document.getElementById('calendar')) {
    document.getElementById('calendar').innerHTML = '';
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 240,
    });
    calendar.render();
  }

  // Badge stars
  const badgeDiv = document.getElementById("badge-stars");
  if (badgeDiv) {
    badgeDiv.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      let star = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      star.setAttribute("viewBox", "0 0 50 50");
      star.innerHTML = `
        <polygon points="25,5 31,19 46,19 34,29 39,44 25,35 11,44 16,29 4,19 19,19"
          fill="#fff" stroke="#2563eb" stroke-width="4"/>
        <polygon points="25,10 30,20 41,20 33,27 36,38 25,32 14,38 17,27 9,20 20,20"
          fill="#60a5fa" stroke="#2563eb" stroke-width="2"/>
      `;
      badgeDiv.appendChild(star);
    }
  }
});

// Live storage update
window.addEventListener('storage', function(e) {
  if (e.key === "announcements") {
    renderLatestAnnouncement();
  }
});