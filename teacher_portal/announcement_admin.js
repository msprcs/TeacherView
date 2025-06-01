// Helper to get the latest 3 announcements from localStorage
function getLatestAnnouncements() {
  let arr = [];
  try {
    arr = JSON.parse(localStorage.getItem("announcements") || "[]");
  } catch (e) { arr = []; }
  return arr.slice(0, 3); // latest first
}

let announcements = getLatestAnnouncements();
let index = 0;

const mainBox = document.getElementById("mainBox");
const dots = document.querySelectorAll(".page-dot");
const boxes = [
  document.getElementById('box1'),
  document.getElementById('box2'),
  document.getElementById('box3')
];

// Render announcement boxes with latest data
function renderBoxes() {
  announcements = getLatestAnnouncements();
  boxes.forEach((box, i) => {
    if (announcements[i]) {
      box.innerText = announcements[i].title || "No Title";
      box.setAttribute("data-detail", announcements[i].message ? announcements[i].title + "\n" + announcements[i].message : announcements[i].title);
      box.style.opacity = "1";
      box.style.pointerEvents = "auto";
    } else {
      box.innerText = "No Announcement";
      box.setAttribute("data-detail", "");
      box.style.opacity = "0.5";
      box.style.pointerEvents = "none";
    }
  });
  // Main announcement area
  setAnnouncement(index);
}

// Change main announcement and highlight the active dot
function setAnnouncement(i) {
  index = i;
  if (announcements[i]) {
    mainBox.innerText = announcements[i].title;
  } else {
    mainBox.innerText = "No Announcement";
  }
  dots.forEach((dot, j) => {
    dot.classList.toggle("active", j === i);
  });
}

// Automatic slide every 3 seconds
setInterval(() => {
  announcements = getLatestAnnouncements();
  index = (index + 1) % 3;
  setAnnouncement(index);
}, 3000);

// Show details on right side
function showDetails(i) {
  if (announcements[i]) {
    let html = `<strong>${announcements[i].title || ""}</strong><br>`;
    if (announcements[i].grade) html += `<em>For: ${announcements[i].grade}</em><br>`;
    html += `<div style="margin-top:8px;white-space:pre-line">${announcements[i].message || ""}</div>`;
    if (announcements[i].images && announcements[i].images.length) {
      html += `<div style="margin-top:8px;display:flex;gap:8px;">`;
      announcements[i].images.forEach(m => {
        if (m.type && m.type.startsWith("image/")) {
          html += `<img src="${m.dataUrl}" style="max-height:60px;border-radius:5px;border:1px solid #2563eb30;" alt="image" />`;
        }
      });
      html += `</div>`;
    }
    html += `<div style="margin-top:8px;font-size:0.95em;color:#2563eb99">${announcements[i].time ? new Date(announcements[i].time).toLocaleString() : ""}</div>`;
    document.getElementById("detailsBox").innerHTML = html;
  }
}

// Popup above hovered announcement box
function showPopup(event, i) {
  const popup = document.getElementById('popup');
  const box = event.currentTarget;
  const detail = box.getAttribute('data-detail');
  popup.innerText = detail;
  const rect = box.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  popup.style.left = (rect.left + rect.width/2 - 110 + scrollLeft) + "px";
  popup.style.top = (rect.top - 44 + scrollTop) + "px";
  if (announcements[i]) popup.classList.add('active');
}
function hidePopup() {
  document.getElementById('popup').classList.remove('active');
}

// Listen for storage (live update if teacher posts while admin page is open)
window.addEventListener('storage', function(e) {
  if (e.key === "announcements") {
    renderBoxes();
    // If details box is open, update its content
    if (typeof index === 'number') showDetails(index);
  }
});

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  renderBoxes();
  setAnnouncement(0);
});