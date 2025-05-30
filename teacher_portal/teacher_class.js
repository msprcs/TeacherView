// ========== Demo Data ==========
const assignedClasses = [
  { class: "Grade 2", subject: "Science" },
  { class: "Grade 3", subject: "Math" }
];
const allStudents = [
  { name: "Alice Johnson", class: "Grade 2", subject: "Science" },
  { name: "Bob Smith", class: "Grade 2", subject: "Science" },
  { name: "Charlie Lee", class: "Grade 3", subject: "Math" },
  { name: "Diana Cruz", class: "Grade 3", subject: "Math" },
];

// ========== Data Storage ==========
let attendanceData = {}; // { "student|class|subject": { "YYYY-MM-DD": true/false } }
let meritDemeritData = {};

// ========== DOM Elements ==========
const assignedList = document.getElementById('assigned-list');
const studentsSection = document.getElementById('students-section');
const studentsBackBtn = document.getElementById('students-back-btn');
const mainTitle = document.querySelector('.main-head');
const studentList = document.getElementById('student-list');
const studentsTitle = document.getElementById('students-title');
const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');

const meritWallSection = document.getElementById('merit-wall-section');
const meritWallBackBtn = document.getElementById('merit-wall-back-btn');
const meritWallStudent = document.getElementById('merit-wall-student');

const calendarSection = document.getElementById('calendar-section');
const calendarBackBtn = document.getElementById('calendar-back-btn');
const calendarStudentName = document.getElementById('calendar-student-name');
const calendarDiv = document.getElementById('calendar');

// ========== State ==========
let currentClass = "";
let currentSubject = "";
let currentStudent = "";
let currentMeritKey = "";

// ========== Render Assigned Classes ==========
function renderAssigned() {
  assignedList.innerHTML = '';
  document.getElementById('user-classes-section').style.display = '';
  studentsSection.style.display = 'none';
  mainTitle.style.display = '';
  meritWallSection.style.display = 'none';
  calendarSection.style.display = 'none';
  assignedClasses.forEach(pair => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="class">${pair.class}</span><span class="subject">${pair.subject}</span>`;
    li.style.cursor = "pointer";
    li.onclick = function () {
      showStudents(pair.class, pair.subject);
    };
    assignedList.appendChild(li);
  });
}

// ========== Show Students for Selected Class/Subject ==========
function showStudents(className, subjectName) {
  document.getElementById('user-classes-section').style.display = 'none';
  studentsSection.style.display = '';
  mainTitle.style.display = 'none';
  meritWallSection.style.display = 'none';
  calendarSection.style.display = 'none';
  studentsTitle.textContent = `Students in ${className} - ${subjectName}`;
  const students = allStudents.filter(stu => stu.class === className && stu.subject === subjectName);
  studentList.innerHTML = '';
  if (students.length === 0) {
    studentList.innerHTML = '<li class="empty">No students enrolled.</li>';
  } else {
    students.forEach(stu => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="student-info">${stu.name}</span>
        <select class="action-dropdown">
          <option value="">Select Action</option>
          <option value="badge">Badge</option>
          <option value="calendar">Calendar</option>
        </select>
      `;
      li.querySelector('.action-dropdown').addEventListener('change', function() {
        currentClass = className;
        currentSubject = subjectName;
        currentStudent = stu.name;
        if (this.value === "badge") {
          showMeritWall(stu.name, className, subjectName);
        }
        if (this.value === "calendar") {
          showAttendanceCalendar(stu.name, className, subjectName);
        }
        this.value = "";
      });
      studentList.appendChild(li);
    });
  }
}

// ========== Back Buttons ==========
studentsBackBtn.addEventListener('click', function() {
  studentsSection.style.display = 'none';
  renderAssigned();
});
backToDashboardBtn.addEventListener('click', function() {
  window.location.href = 'teacher_dashboard.html';
});
meritWallBackBtn.addEventListener('click', function () {
  meritWallSection.style.display = 'none';
  showStudents(currentClass, currentSubject);
});
calendarBackBtn.addEventListener('click', function () {
  calendarSection.style.display = 'none';
  showStudents(currentClass, currentSubject);
});

// ========== Merit Wall Logic ==========
function getMeritDemeritObj(key) {
  if (!meritDemeritData[key]) {
    meritDemeritData[key] = { stars: 0, shards: 0, squares: 0, parts: 0 };
  }
  return meritDemeritData[key];
}
function showMeritWall(studentName, className, subjectName) {
  currentMeritKey = `${studentName}|${className}|${subjectName}`;
  studentsSection.style.display = 'none';
  meritWallSection.style.display = '';
  calendarSection.style.display = 'none';
  meritWallStudent.textContent = `Student: ${studentName} (${className} - ${subjectName})`;
  renderStars();
  renderSquares();
  updatePointsSummary();
}
function updatePointsSummary() {
  const data = getMeritDemeritObj(currentMeritKey);
  document.getElementById('points-value').textContent = data.stars;
  document.getElementById('demerits-value').textContent = data.squares;
  document.getElementById('total-points-global').textContent = data.stars - data.squares;
}
function renderStars() {
  const row = document.getElementById("star-row");
  row.innerHTML = "";
  const data = getMeritDemeritObj(currentMeritKey);
  let totalStars = data.stars;
  let partial = data.shards > 0 ? 1 : 0;
  let starsArray = Array(totalStars).fill(5);
  if (partial) starsArray.push(data.shards);
  for (let i = 0; i < starsArray.length; i++) {
    row.appendChild(createStar(starsArray[i]));
  }
}
function renderSquares() {
  const row = document.getElementById("square-row");
  row.innerHTML = "";
  const data = getMeritDemeritObj(currentMeritKey);
  let totalSquares = data.squares;
  let partial = data.parts > 0 ? 1 : 0;
  let squaresArray = Array(totalSquares).fill(4);
  if (partial) squaresArray.push(data.parts);
  for (let i = 0; i < squaresArray.length; i++) {
    row.appendChild(createSquare(squaresArray[i]));
  }
}
function createStar(filledShards) {
  const svgNS = "http://www.w3.org/2000/svg";
  let svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 50 50");
  svg.classList.add("star");
  for (let i = 0; i < 5; i++) {
    let color = i < filledShards ? "#FFD700" : "#fff8dc";
    let path = document.createElementNS(svgNS, "path");
    let angle = (i * 72 - 90) * Math.PI / 180;
    let angle2 = ((i+1) * 72 - 90) * Math.PI / 180;
    let x1 = 25 + 20 * Math.cos(angle);
    let y1 = 25 + 20 * Math.sin(angle);
    let x2 = 25 + 8 * Math.cos(angle + 36 * Math.PI / 180);
    let y2 = 25 + 8 * Math.sin(angle + 36 * Math.PI / 180);
    let x3 = 25 + 8 * Math.cos(angle2 - 36 * Math.PI / 180);
    let y3 = 25 + 8 * Math.sin(angle2 - 36 * Math.PI / 180);
    let x4 = 25 + 20 * Math.cos(angle2);
    let y4 = 25 + 20 * Math.sin(angle2);
    path.setAttribute("d",
      `M25,25 L${x1},${y1} L${x2},${y2} L${x3},${y3} L${x4},${y4} Z`
    );
    path.setAttribute("fill", color);
    svg.appendChild(path);
  }
  return svg;
}
function createSquare(filledParts) {
  const svgNS = "http://www.w3.org/2000/svg";
  let svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 40 40");
  svg.classList.add("square");
  for (let i = 0; i < 4; i++) {
    let color = i < filledParts ? "#e53e3e" : "#eee";
    let x = (i % 2) * 20;
    let y = Math.floor(i / 2) * 20;
    let rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", 20);
    rect.setAttribute("height", 20);
    rect.setAttribute("fill", color);
    svg.appendChild(rect);
  }
  let outline = document.createElementNS(svgNS, "rect");
  outline.setAttribute("x", 1);
  outline.setAttribute("y", 1);
  outline.setAttribute("width", 38);
  outline.setAttribute("height", 38);
  outline.setAttribute("fill", "none");
  outline.setAttribute("stroke", "#e53e3e");
  outline.setAttribute("stroke-width", "2");
  svg.appendChild(outline);
  return svg;
}
function addMeritShard() {
  const data = getMeritDemeritObj(currentMeritKey);
  if (data.stars >= 5) {
    data.shards = 0;
    renderStars();
    updatePointsSummary();
    return;
  }
  data.shards += 1;
  if (data.shards === 5) {
    data.shards = 0;
    data.stars += 1;
    if (data.stars > 5) data.stars = 5;
  }
  renderStars();
  updatePointsSummary();
}
function removeMeritShard() {
  const data = getMeritDemeritObj(currentMeritKey);
  if (data.shards > 0) {
    data.shards -= 1;
  } else if (data.stars > 0) {
    data.stars -= 1;
    data.shards = 4;
  }
  data.shards = Math.max(0, data.shards);
  data.stars = Math.max(0, data.stars);
  renderStars();
  updatePointsSummary();
}
function addDemeritPart() {
  const data = getMeritDemeritObj(currentMeritKey);
  if (data.squares >= 5) {
    data.parts = 0;
    renderSquares();
    updatePointsSummary();
    return;
  }
  data.parts += 1;
  if (data.parts === 4) {
    data.parts = 0;
    data.squares += 1;
    if (data.squares > 5) data.squares = 5;
  }
  renderSquares();
  updatePointsSummary();
}
function removeDemeritPart() {
  const data = getMeritDemeritObj(currentMeritKey);
  if (data.parts > 0) {
    data.parts -= 1;
  } else if (data.squares > 0) {
    data.squares -= 1;
    data.parts = 3;
  }
  data.parts = Math.max(0, data.parts);
  data.squares = Math.max(0, data.squares);
  renderSquares();
  updatePointsSummary();
}

// ========== Calendar Logic with Attendance ==========
function showAttendanceCalendar(studentName, className, subjectName) {
  studentsSection.style.display = 'none';
  meritWallSection.style.display = 'none';
  calendarSection.style.display = '';
  calendarStudentName.textContent = `Student: ${studentName} (${className} - ${subjectName})`;

  const attKey = `${studentName}|${className}|${subjectName}`;
  if (!attendanceData[attKey]) {
    attendanceData[attKey] = {};
  }
  calendarDiv.innerHTML = '';

  // Prepare events for this student (present/absent days)
  let events = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    let dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    let val = attendanceData[attKey][dateStr];
    if (val === true) {
      events.push({
        title: 'Present',
        start: dateStr,
        display: 'background',
        backgroundColor: '#b2f5b2',
        borderColor: '#19b219'
      });
    } else if (val === false) {
      events.push({
        title: 'Absent',
        start: dateStr,
        display: 'background',
        backgroundColor: '#f8bbbb',
        borderColor: '#e53e3e'
      });
    }
    // undefined: no event
  }

  let calendar = new window.FullCalendar.Calendar(calendarDiv, {
    initialView: 'dayGridMonth',
    height: 520,
    contentHeight: 480,
    aspectRatio: 1.2,
    events: events,
    selectable: true,
    dateClick: function(info) {
      showAttendancePopup(info.dateStr, attKey, studentName, className, subjectName);
    },
    eventDidMount: function(arg) {
      const dayCell = arg.el.closest('.fc-daygrid-day');
      if (dayCell && arg.event.display === 'background') {
        if (arg.event.title === "Present") {
          dayCell.classList.add('present');
          dayCell.classList.remove('absent');
        } else if (arg.event.title === "Absent") {
          dayCell.classList.add('absent');
          dayCell.classList.remove('present');
        }
      }
    }
  });
  calendar.render();
}

// Attendance Popup for marking present/absent
function showAttendancePopup(dateStr, attKey, studentName, className, subjectName) {
  // Remove any previous popup
  let prev = document.getElementById('attendance-popup');
  if (prev) prev.remove();

  // Create popup
  const popup = document.createElement('div');
  popup.id = 'attendance-popup';
  popup.style.position = 'fixed';
  popup.style.left = '50%';
  popup.style.top = '50%';
  popup.style.transform = 'translate(-50%,-50%)';
  popup.style.zIndex = '2000';
  popup.style.background = '#fff';
  popup.style.borderRadius = '10px';
  popup.style.boxShadow = '0 2px 18px #2563eb33';
  popup.style.padding = '2em 1.5em 1.2em 1.5em';
  popup.style.minWidth = '220px';
  popup.style.maxWidth = '90vw';
  popup.style.textAlign = 'center';

  popup.innerHTML = `
    <div style="font-weight:bold; margin-bottom:1em;">Attendance for ${dateStr}</div>
    <div style="display:flex; gap:1em; justify-content:center;">
      <button id="mark-present" style="padding:0.5em 1.5em; background:#19b219; color:#fff; border:none; border-radius:5px; font-size:1em; cursor:pointer;">Present</button>
      <button id="mark-absent" style="padding:0.5em 1.5em; background:#e53e3e; color:#fff; border:none; border-radius:5px; font-size:1em; cursor:pointer;">Absent</button>
    </div>
    <button id="attendance-cancel" style="margin-top:1.5em; background:#e2e8f0; color:#222; border:none; border-radius:5px; padding:0.3em 1em; cursor:pointer;">Cancel</button>
  `;
  document.body.appendChild(popup);

  document.getElementById('mark-present').onclick = function() {
    attendanceData[attKey][dateStr] = true;
    popup.remove();
    showAttendanceCalendar(studentName, className, subjectName);
  };
  document.getElementById('mark-absent').onclick = function() {
    attendanceData[attKey][dateStr] = false;
    popup.remove();
    showAttendanceCalendar(studentName, className, subjectName);
  };
  document.getElementById('attendance-cancel').onclick = function() {
    popup.remove();
  };
}

// ========== Initial Render ==========
renderAssigned();