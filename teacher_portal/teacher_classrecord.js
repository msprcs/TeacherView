// Sidebar navigation logic
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
const worksheetListDiv = document.getElementById('worksheet-list');

let excelFile = null;

classSelect.addEventListener('change', function() {
  checkUploadEnabled();
  fileSummaryDiv.style.display = 'none';
  worksheetListDiv.innerHTML = '';
  excelInput.value = '';
  excelFile = null;
  uploadBtn.disabled = true;
});

excelInput.addEventListener('change', function() {
  excelFile = this.files[0] || null;
  checkUploadEnabled();
  fileSummaryDiv.style.display = 'none';
  worksheetListDiv.innerHTML = '';
});

function checkUploadEnabled() {
  uploadBtn.disabled = !(classSelect.value && excelInput.files.length);
}

// Always render all columns/rows, and ensure all content is shown with horizontal scroll if needed
function worksheetToHTMLTable(worksheet) {
  if (!worksheet['!ref']) return '<div class="worksheet-table-wrap"><em>Empty sheet</em></div>';
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  let merges = worksheet["!merges"] || [];
  // Build a grid to store merged info
  let grid = [];
  for (let r = range.s.r; r <= range.e.r; r++) {
    grid[r] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      grid[r][c] = {skip: false, colspan: 1, rowspan: 1};
    }
  }
  // Mark merged cells
  merges.forEach(function(m) {
    grid[m.s.r][m.s.c].colspan = (m.e.c - m.s.c + 1);
    grid[m.s.r][m.s.c].rowspan = (m.e.r - m.s.r + 1);
    for (let r = m.s.r; r <= m.e.r; r++) {
      for (let c = m.s.c; c <= m.e.c; c++) {
        if (r !== m.s.r || c !== m.s.c) {
          grid[r][c].skip = true;
        }
      }
    }
  });

  // Find 'Quarterly Grade' column index (case-insensitive) and header row
  let qgColIdx = -1;
  let headerRowIdx = range.s.r;
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({r: headerRowIdx, c: C});
    const cell = worksheet[cellAddress];
    if (cell && typeof cell.v === "string" && cell.v.trim().toLowerCase().includes("quarterly grade")) {
      qgColIdx = C;
    }
  }

  let html = '<div class="worksheet-table-wrap"><table>';
  for (let R = range.s.r; R <= range.e.r; ++R) {
    html += '<tr>';
    for (let C = range.s.c; C <= range.e.c; ++C) {
      if (grid[R][C].skip) continue;
      const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
      const cell = worksheet[cellAddress];
      let val = (cell && typeof cell.v !== "undefined" && cell.v !== null) ? cell.v : "";

      // Try to preserve Excel formatting (bold, color, align) if present in cell.s (cell style)
      let style = "";
      if (cell && cell.s) {
        if (cell.s.bold) style += "font-weight:bold;";
        if (cell.s.italic) style += "font-style:italic;";
        if (cell.s.color && cell.s.color.rgb) style += `color:#${cell.s.color.rgb};`;
        if (cell.s.fill && cell.s.fill.fgColor && cell.s.fill.fgColor.rgb) style += `background:#${cell.s.fill.fgColor.rgb};`;
        if (cell.s.alignment && cell.s.alignment.horizontal) style += `text-align:${cell.s.alignment.horizontal};`;
      }

      let cellTag = (R === headerRowIdx ? 'th' : 'td');
      let colspan = grid[R][C].colspan > 1 ? ` colspan="${grid[R][C].colspan}"` : '';
      let rowspan = grid[R][C].rowspan > 1 ? ` rowspan="${grid[R][C].rowspan}"` : '';

      // Quarterly Grade color logic
      let extraClass = "";
      if (cellTag === "td" && qgColIdx !== -1 && C === qgColIdx) {
        let v = String(val).trim().toLowerCase();
        if (v === "passed" || v === "pass") extraClass = "qg-pass";
        else if (v === "failed" || v === "fail") extraClass = "qg-fail";
      }

      html += `<${cellTag}${colspan}${rowspan}${extraClass ? ` class="${extraClass}"` : ""}${style ? ` style="${style}"` : ""}>${val === undefined ? "" : val}</${cellTag}>`;
    }
    html += '</tr>';
  }
  html += '</table></div>';
  return html;
}

uploadBtn.addEventListener('click', function() {
  if (!classSelect.value || !excelFile) {
    alert('Please select a class and upload an Excel file.');
    return;
  }
  fileSummaryDiv.style.display = 'none';
  worksheetListDiv.innerHTML = '';
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      let data = new Uint8Array(ev.target.result);
      let workbook = XLSX.read(data, {type: 'array', cellStyles: true});
      let sheetNames = workbook.SheetNames;

      worksheetListDiv.innerHTML = '';
      sheetNames.forEach((sheetName, idx) => {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet['!ref']) return;
        let sheetDiv = document.createElement('div');
        sheetDiv.innerHTML =
          `<div class="worksheet-title">${sheetName}</div>` +
          worksheetToHTMLTable(worksheet);
        worksheetListDiv.appendChild(sheetDiv);
      });

      fileSummaryDiv.style.display = 'block';
    } catch (e) {
      worksheetListDiv.innerHTML = `<span style="color:red">Error reading Excel file: ${e.message}</span>`;
      fileSummaryDiv.style.display = 'block';
    }
  };
  reader.onerror = function() {
    worksheetListDiv.innerHTML = `<span style="color:red">Could not read file.</span>`;
    fileSummaryDiv.style.display = 'block';
  };
  reader.readAsArrayBuffer(excelFile);
});