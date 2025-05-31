// Sidebar navigation redirects and active tab logic
const sidebarLinks = document.querySelectorAll('.sidebar-link');
sidebarLinks.forEach(link => link.classList.remove('active'));
document.getElementById('class-record-tab').classList.add('active');

document.getElementById('home-tab').onclick = function() {
  window.location.href = "teacher_home.html";
};
document.getElementById('class-tab').onclick = function() {
  window.location.href = "teacher_class.html";
};
document.getElementById('class-record-tab').onclick = function() {
  sidebarLinks.forEach(link => link.classList.remove('active'));
  this.classList.add('active');
};
document.getElementById('announcement-tab').onclick = function() {
  window.location.href = "teacher_dashboard.html#announcement";
};

document.getElementById('logout-btn').onclick = function () {
  alert('You have been logged out.');
  window.location.reload();
};

// Excel upload logic
const classSelect = document.getElementById('class-select');
const excelInput = document.getElementById('excel-file');
const uploadBtn = document.getElementById('upload-btn');
const fileSummaryDiv = document.getElementById('file-summary');
const quarterSummariesDiv = document.getElementById('quarter-summaries');
const subjectSummaryDiv = document.getElementById('subject-summary');

let excelFile = null;

classSelect.addEventListener('change', function() {
  checkUploadEnabled();
  fileSummaryDiv.style.display = 'none';
  quarterSummariesDiv.innerHTML = '';
  subjectSummaryDiv.innerHTML = '';
  excelInput.value = '';
  excelFile = null;
  uploadBtn.disabled = true;
});

excelInput.addEventListener('change', function() {
  excelFile = this.files[0] || null;
  checkUploadEnabled();
  fileSummaryDiv.style.display = 'none';
  quarterSummariesDiv.innerHTML = '';
  subjectSummaryDiv.innerHTML = '';
});

function checkUploadEnabled() {
  uploadBtn.disabled = !(classSelect.value && excelInput.files.length);
}

uploadBtn.addEventListener('click', function() {
  if (!classSelect.value || !excelFile) {
    alert('Please select a class and upload an Excel file.');
    return;
  }
  fileSummaryDiv.style.display = 'none';
  quarterSummariesDiv.innerHTML = '';
  subjectSummaryDiv.innerHTML = '';
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      let data = new Uint8Array(ev.target.result);
      let workbook = XLSX.read(data, {type: 'array'});
      let sheetNames = workbook.SheetNames;

      // Expected: Quarter 1, Quarter 2, Quarter 3, Quarter 4
      const quarters = ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'];
      quarterSummariesDiv.innerHTML = '';

      quarters.forEach(qtr => {
        if (sheetNames.includes(qtr)) {
          const worksheet = workbook.Sheets[qtr];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          const relCols = [
            'Student Name','Written Works','Performance Task','Quarterly Assessment',
            'Initial Grade','Quarterly Grade','Subject'
          ];
          let filtered = jsonData.map(row => {
            let filteredRow = {};
            for (let col in row) {
              const colMatch = relCols.find(c => c.toLowerCase() === col.toLowerCase());
              if (colMatch)
                filteredRow[colMatch] = row[col];
            }
            return filteredRow;
          });
          let quarterDiv = document.createElement('div');
          quarterDiv.innerHTML = `<div class="quarter-title">${qtr}</div>${renderSummaryTable(filtered.length ? filtered : jsonData)}`;
          quarterSummariesDiv.appendChild(quarterDiv);
        }
      });

      // Summary of Quarterly Grades (sheet: "Summary" or similar)
      let summarySheetName = sheetNames.find(name =>
        name.trim().toLowerCase() === "summary" ||
        name.trim().toLowerCase() === "summary of quarterly grades" ||
        name.trim().toLowerCase() === "quarterly grades summary"
      );
      if (summarySheetName) {
        const worksheet = workbook.Sheets[summarySheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        subjectSummaryDiv.innerHTML = renderSummaryTable(jsonData);
      } else {
        // Fallback: Compute from all quarters' "Quarterly Grade" grouped by subject
        let allData = [];
        quarters.forEach(qtr => {
          if (sheetNames.includes(qtr)) {
            const worksheet = workbook.Sheets[qtr];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            allData = allData.concat(jsonData);
          }
        });
        subjectSummaryDiv.innerHTML = renderSummaryTable(getQuarterlySummary(allData));
      }

      fileSummaryDiv.style.display = 'block';
    } catch (e) {
      quarterSummariesDiv.innerHTML = `<span style="color:red">Error reading Excel file: ${e.message}</span>`;
      fileSummaryDiv.style.display = 'block';
      subjectSummaryDiv.innerHTML = '';
    }
  };
  reader.onerror = function() {
    quarterSummariesDiv.innerHTML = `<span style="color:red">Could not read file.</span>`;
    fileSummaryDiv.style.display = 'block';
    subjectSummaryDiv.innerHTML = '';
  };
  reader.readAsArrayBuffer(excelFile);
});

function renderSummaryTable(data) {
  if (!data.length) return '<span style="color:#aaa">No records found.</span>';
  let headers = Object.keys(data[0]);
  let html = '<table><thead><tr>';
  headers.forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';
  data.forEach(row => {
    html += '<tr>';
    headers.forEach(h => html += `<td>${row[h] !== undefined ? row[h] : ''}</td>`);
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function getQuarterlySummary(data) {
  // Group by subject if present, else show summary for all
  let subjects = {};
  data.forEach(row => {
    let subject = row['Subject'] || row['subject'] || 'N/A';
    let qgrade = row['Quarterly Grade'] || row['Quarterly grade'] || row['quarterly grade'] || row['quarterly_grade'] || row['Quarterly_Grade'] || null;
    if (!subjects[subject]) subjects[subject] = [];
    if (qgrade != null && qgrade !== "" && !isNaN(qgrade)) subjects[subject].push(Number(qgrade));
  });
  let summary = [];
  for (let subject in subjects) {
    if (subjects[subject].length) {
      let avg = subjects[subject].reduce((a, b) => a + b, 0) / subjects[subject].length;
      summary.push({ 'Subject': subject, 'Average Quarterly Grade': avg.toFixed(2) });
    }
  }
  return summary;
}