function setActiveSidebar(tabId) {
  document.querySelectorAll('.sidebar-menu').forEach(el => el.classList.remove('sidebar-active'));
  document.getElementById(tabId).classList.add('sidebar-active');
}
document.getElementById('home-tab').onclick = function() { setActiveSidebar('home-tab'); window.location.href = "teacher_home.html"; };
document.getElementById('class-tab').onclick = function() { setActiveSidebar('class-tab'); window.location.href = "teacher_class.html"; };
document.getElementById('class-record-tab').onclick = function() { setActiveSidebar('class-record-tab'); window.location.href = "teacher_classrecord.html"; };
document.getElementById('announcement-tab').onclick = function() { setActiveSidebar('announcement-tab'); window.location.href = "teacher_announcement.html"; };
document.getElementById('logout-btn').onclick = function () { alert('You have been logged out.'); window.location.reload(); };

function getAnnouncements() {
  try { return JSON.parse(localStorage.getItem("announcements") || "[]"); } catch (e) { return []; }
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
    t.className = "oval-box text-xl font-semibold mb-1";
    t.textContent = a.title;
    container.appendChild(t);
  }
  if (a.grade) {
    const c = document.createElement('div');
    c.className = "oval-box italic text-blue-100 bg-blue-700 text-sm mb-2";
    c.textContent = `For: ${a.grade}`;
    container.appendChild(c);
  }
  if (a.message && a.message.trim()) {
    const p = document.createElement('div');
    p.className = "oval-box mb-3";
    p.innerHTML = a.message.replace(/\n/g, '<br>');
    container.appendChild(p);
  }
  if (a.images && a.images.length) {
    const mediaDiv = document.createElement('div');
    mediaDiv.className = "announcement-media-row";
    a.images.forEach((m, idx) => {
      if (m.type && m.type.startsWith("image/")) {
        const img = document.createElement('img');
        img.src = m.dataUrl;
        img.alt = "announcement image";
        img.className = "announcement-media-img";
        img.setAttribute('data-idx', idx);
        img.onclick = function() {
          document.getElementById('img-lightbox-img').src = this.src;
          document.getElementById('img-lightbox-modal').classList.remove('hidden');
        };
        mediaDiv.appendChild(img);
      }
    });
    container.appendChild(mediaDiv);
  }
  const time = document.createElement('div');
  time.className = "text-xs text-gray-500 mt-2";
  time.textContent = a.time ? new Date(a.time).toLocaleString() : '';
  container.appendChild(time);
}

document.addEventListener('DOMContentLoaded', function() {
  renderLatestAnnouncement();

  if (document.getElementById('calendar')) {
    document.getElementById('calendar').innerHTML = '';
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 200,
    });
    calendar.render();
  }

  const badgeDiv = document.getElementById("badge-stars");
  if (badgeDiv) {
    badgeDiv.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      let star = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      star.setAttribute("viewBox", "0 0 50 50");
      star.setAttribute("width", "34");
      star.setAttribute("height", "34");
      star.innerHTML = `
        <polygon points="25,5 31,19 46,19 34,29 39,44 25,35 11,44 16,29 4,19 19,19"
          fill="#fff" stroke="#2563eb" stroke-width="4"/>
        <polygon points="25,10 30,20 41,20 33,27 36,38 25,32 14,38 17,27 9,20 20,20"
          fill="#38bdf8" stroke="#2563eb" stroke-width="2"/>
      `;
      badgeDiv.appendChild(star);
    }
  }

  let html5QrCode = null;
  let scanning = false;
  const qrReader = document.getElementById('qr-reader');
  const qrResult = document.getElementById('qr-result');
  const startQrBtn = document.getElementById('start-qr-btn');

  startQrBtn.addEventListener('click', function() {
    if (scanning) return;
    qrReader.classList.remove('hidden');
    qrResult.textContent = '';
    startQrBtn.disabled = true;
    startQrBtn.textContent = 'Scanning...';
    scanning = true;

    html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 200 },
      qrCodeMessage => {
        const studentId = qrCodeMessage.trim();
        const todayStr = new Date().toISOString().slice(0,10);
        let att = JSON.parse(localStorage.getItem('attendance') || '{}');
        if (!att[studentId]) att[studentId] = [];
        if (!att[studentId].includes(todayStr)) att[studentId].push(todayStr);
        localStorage.setItem('attendance', JSON.stringify(att));
        qrResult.textContent = `Attendance marked for: ${studentId}`;
        qrResult.className = "mt-4 text-green-700 font-bold";
        setTimeout(() => { qrResult.textContent = ""; }, 4000);
        html5QrCode.stop().then(() => {
          qrReader.classList.add('hidden');
          startQrBtn.disabled = false;
          startQrBtn.textContent = 'Start QR Scan';
          scanning = false;
        });
      },
      errorMessage => {}
    ).catch(err => {
      qrResult.textContent = "Camera error: " + err;
      qrResult.className = "mt-4 text-red-700 font-bold";
      qrReader.classList.add('hidden');
      startQrBtn.disabled = false;
      startQrBtn.textContent = 'Start QR Scan';
      scanning = false;
    });
  });

  document.getElementById('img-lightbox-close').onclick = function() {
    document.getElementById('img-lightbox-modal').classList.add('hidden');
    document.getElementById('img-lightbox-img').src = '';
  };
  document.getElementById('img-lightbox-modal').onclick = function(e) {
    if (e.target === this) {
      this.classList.add('hidden');
      document.getElementById('img-lightbox-img').src = '';
    }
  };
});