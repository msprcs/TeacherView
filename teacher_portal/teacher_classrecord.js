// Sidebar navigation (with highlighting)
function setActiveSidebar(tabId) {
  document.querySelectorAll('.sidebar-menu').forEach(el => el.classList.remove('sidebar-active'));
  document.getElementById(tabId).classList.add('sidebar-active');
}
document.getElementById('home-tab').onclick = function() {
  setActiveSidebar('home-tab');
  window.location.href = "teacher_home.html";
};
document.getElementById('class-tab').onclick = function() {
  setActiveSidebar('class-tab');
  window.location.href = "teacher_class.html";
};
document.getElementById('class-record-tab').onclick = function() {
  setActiveSidebar('class-record-tab');
  window.location.href = "teacher_classrecord.html";
};
document.getElementById('announcement-tab').onclick = function() {
  setActiveSidebar('announcement-tab');
  window.location.href = "teacher_dashboard.html#announcement";
};

document.getElementById('logout-btn').onclick = function () {
  alert('You have been logged out.');
  window.location.reload();
};

function getHPS(type) {
  let selector = type === "ww" ? ".ww-hps" : (type === "pt" ? ".pt-hps" : ".qa-hps");
  return Array.from(document.querySelectorAll(selector)).map(x => Number(x.value) || 0);
}

function addStudentRow() {
  const tbody = document.getElementById('sheetBody');
  const rowCount = tbody.rows.length + 1;
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${rowCount}</td>
    <td><input type="text" class="student-name"></td>
    ${Array(10).fill().map(() => `<td><input type="number" min="0" class="ww-score"></td>`).join("")}
    <td class="computed ww-total"></td>
    <td class="computed ww-ps"></td>
    <td class="computed ww-ws"></td>
    ${Array(10).fill().map(() => `<td><input type="number" min="0" class="pt-score"></td>`).join("")}
    <td class="computed pt-total"></td>
    <td class="computed pt-ps"></td>
    <td class="computed pt-ws"></td>
    <td><input type="number" min="0" class="qa-score"></td>
    <td class="computed qa-ps"></td>
    <td class="computed qa-ws"></td>
    <td class="computed initial-grade"></td>
    <td class="computed quarterly-grade"></td>
  `;
  tbody.appendChild(tr);
  attachListeners(tr);
}

function attachListeners(tr) {
  tr.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      computeRow(tr);
    });
  });
  document.querySelectorAll('.ww-hps, .pt-hps, .qa-hps').forEach(input => {
    input.addEventListener('input', () => {
      computeRow(tr);
    });
  });
}

const transmuteTable = [
  [100, 100, 100],[98.40, 99.99, 99],[96.80, 98.39, 98],[95.21, 96.79, 97],[93.60, 95.19, 96],
  [92.00, 93.59, 95],[90.40, 91.99, 94],[88.80, 90.39, 93],[87.20, 88.79, 92],[85.60, 87.19, 91],
  [84.00, 85.59, 90],[82.40, 83.99, 89],[80.80, 82.39, 88],[78.20, 80.79, 87],[77.60, 79.19, 86],
  [76.00, 77.59, 85],[74.40, 75.99, 84],[72.80, 74.39, 83],[71.20, 72.79, 82],[69.61, 71.19, 81],
  [68.00, 69.59, 80],[66.40, 67.99, 79],[64.81, 66.39, 78],[63.21, 64.79, 77],[61.60, 63.19, 76],
  [60.00, 61.59, 75],[56.00, 59.99, 74],[52.01, 55.99, 73],[48.00, 51.99, 72],[44.00, 47.99, 71],
  [40.01, 43.99, 70],[36.00, 39.99, 69],[32.00, 35.99, 68],[28.00, 31.99, 67],[24.00, 27.99, 66],
  [20.00, 23.99, 65],[16.00, 19.99, 64],[12.00, 15.99, 63],[8.00, 11.99, 62],[4.00, 7.99, 61],
  [0.00, 3.99, 60]
];

function transmuteGrade(initial) {
  for (const [min, max, grade] of transmuteTable) {
    if (initial >= min && initial <= max) return grade;
  }
  return 60;
}

function computeRow(tr) {
  // Written Works
  const wwHPS = getHPS("ww");
  const wwScores = Array.from(tr.querySelectorAll('.ww-score')).map((x,i)=>Math.min(Number(x.value) || 0, wwHPS[i]));
  const wwTotal = wwScores.reduce((a,b)=>a+b,0);
  const wwTotalHPS = wwHPS.reduce((a,b)=>a+b,0);
  const wwPS = wwTotalHPS > 0 ? (wwTotal/wwTotalHPS)*100 : 0;
  const wwWS = wwPS * 0.4;
  tr.querySelector('.ww-total').textContent = wwTotal ? wwTotal.toFixed(0) : '';
  tr.querySelector('.ww-ps').textContent = wwPS ? wwPS.toFixed(1) : '';
  tr.querySelector('.ww-ws').textContent = wwWS ? wwWS.toFixed(1) : '';
  // Performance Task
  const ptHPS = getHPS("pt");
  const ptScores = Array.from(tr.querySelectorAll('.pt-score')).map((x,i)=>Math.min(Number(x.value) || 0, ptHPS[i]));
  const ptTotal = ptScores.reduce((a,b)=>a+b,0);
  const ptTotalHPS = ptHPS.reduce((a,b)=>a+b,0);
  const ptPS = ptTotalHPS > 0 ? (ptTotal/ptTotalHPS)*100 : 0;
  const ptWS = ptPS * 0.4;
  tr.querySelector('.pt-total').textContent = ptTotal ? ptTotal.toFixed(0) : '';
  tr.querySelector('.pt-ps').textContent = ptPS ? ptPS.toFixed(1) : '';
  tr.querySelector('.pt-ws').textContent = ptWS ? ptWS.toFixed(1) : '';
  // Quarterly Assessment
  const qaHPS = getHPS("qa")[0] || 0;
  const qaScore = Number(tr.querySelector('.qa-score').value) || 0;
  const qaPS = qaHPS > 0 ? (qaScore/qaHPS)*100 : 0;
  const qaWS = qaPS * 0.2;
  tr.querySelector('.qa-ps').textContent = qaPS ? qaPS.toFixed(1) : '';
  tr.querySelector('.qa-ws').textContent = qaWS ? qaWS.toFixed(1) : '';
  // Initial & Quarterly Grade
  const initial = wwWS + ptWS + qaWS;
  tr.querySelector('.initial-grade').textContent = initial.toFixed(1);
  tr.querySelector('.quarterly-grade').textContent = transmuteGrade(initial);
}

function computeHPSRow() {
  const wwHPS = getHPS("ww");
  const wwTotal = wwHPS.reduce((a, b) => a + b, 0);
  document.getElementById('ww-total-hps').textContent = wwTotal ? wwTotal : '';
  const ptHPS = getHPS("pt");
  const ptTotal = ptHPS.reduce((a, b) => a + b, 0);
  document.getElementById('pt-total-hps').textContent = ptTotal ? ptTotal : '';
}

function attachHPSListeners() {
  document.querySelectorAll('.ww-hps, .pt-hps, .qa-hps').forEach(input => {
    input.addEventListener('input', () => {
      document.querySelectorAll('#sheetBody tr').forEach(tr => computeRow(tr));
      computeHPSRow();
    });
  });
}

const classData = {
  "grade-1": {
    math: ["Alice A.", "Bob B.", "Cara C."],
    english: ["Alice A.", "Bob B.", "Cara C."]
  },
  "grade-2": {
    math: ["Dan D.", "Eve E.", "Finn F."],
    english: ["Dan D.", "Eve E.", "Finn F."]
  }
};

const classSelectionDiv = document.getElementById('class-selection');
const gradeSheetSection = document.getElementById('grade-sheet-section');
const classSelect = document.getElementById('class-select');
const subjectSelect = document.getElementById('subject-select');
const startBtn = document.getElementById('start-record-btn');
const sheetBody = document.getElementById('sheetBody');
const sheetClassInfo = document.getElementById('sheet-classinfo');
const changeClassBtn = document.getElementById('change-class-btn');

let selectedClass = "";
let selectedSubject = "";

gradeSheetSection.style.display = "none";
classSelectionDiv.style.display = "";

startBtn.onclick = function() {
  selectedClass = classSelect.value;
  selectedSubject = subjectSelect.value;
  if (!selectedClass || !selectedSubject) {
    alert("Please select both class and subject.");
    return;
  }
  const students = (classData[selectedClass] && classData[selectedClass][selectedSubject]) || [];
  if (students.length === 0) {
    alert("No students found for this class/subject.");
    return;
  }
  sheetBody.innerHTML = "";
  students.forEach((name, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx+1}</td>
      <td class="student-name"><span>${name}</span></td>
      ${Array(10).fill().map(() => `<td><input type="number" min="0" class="ww-score"></td>`).join("")}
      <td class="computed ww-total"></td>
      <td class="computed ww-ps"></td>
      <td class="computed ww-ws"></td>
      ${Array(10).fill().map(() => `<td><input type="number" min="0" class="pt-score"></td>`).join("")}
      <td class="computed pt-total"></td>
      <td class="computed pt-ps"></td>
      <td class="computed pt-ws"></td>
      <td><input type="number" min="0" class="qa-score"></td>
      <td class="computed qa-ps"></td>
      <td class="computed qa-ws"></td>
      <td class="computed initial-grade"></td>
      <td class="computed quarterly-grade"></td>
    `;
    sheetBody.appendChild(tr);
    attachListeners(tr);
  });
  sheetClassInfo.textContent = `Class: ${classSelect.options[classSelect.selectedIndex].text} | Subject: ${subjectSelect.options[subjectSelect.selectedIndex].text}`;
  classSelectionDiv.style.display = "none";
  gradeSheetSection.style.display = "";
  computeHPSRow();
};

changeClassBtn.onclick = function() {
  gradeSheetSection.style.display = "none";
  classSelectionDiv.style.display = "";
  sheetBody.innerHTML = "";
  classSelect.selectedIndex = 0;
  subjectSelect.selectedIndex = 0;
};

window.onload = function() {
  attachHPSListeners();
  computeHPSRow();
};