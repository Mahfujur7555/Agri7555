const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const form = $('#coverForm');
const teacherList = $('#teacherList');
let teacherCount = 0;
let logoDataUrl = '';

function teacherTemplate(id) {
  return `<div class="teacher-card" data-teacher-id="${id}">
    <button class="teacher-remove" type="button" aria-label="Remove teacher">×</button>
    <div class="field-row two-up">
      <div><label class="field-label" for="teacherName${id}">Name</label><input class="text-input" id="teacherName${id}" data-teacher-field="name" type="text" placeholder="Teacher's name" /></div>
      <div><label class="field-label" for="teacherDesignation${id}">Designation</label><input class="text-input" id="teacherDesignation${id}" data-teacher-field="designation" type="text" placeholder="e.g. Lecturer" /></div>
    </div>
    <div><label class="field-label" for="teacherDept${id}">Department</label><input class="text-input" id="teacherDept${id}" data-teacher-field="department" type="text" placeholder="e.g. Department of CSE" /></div>
  </div>`;
}

function addTeacher() {
  teacherCount += 1;
  teacherList.insertAdjacentHTML('beforeend', teacherTemplate(teacherCount));
  updatePreview();
}

function value(id) { return document.getElementById(id)?.value.trim() || ''; }
function displayOr(value, fallback) { return value || fallback; }
function joinNonEmpty(parts, separator = ' · ') { return parts.filter(Boolean).join(separator); }
function escapeHtml(input) { return input.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char])); }

function updatePreview() {
  const selectedType = $('input[name="documentType"]:checked')?.value || 'An Assignment on';
  $('#previewType').textContent = selectedType.toUpperCase();
  $('#previewTopic').textContent = displayOr(value('topic'), 'Your topic goes here');
  $('#previewInstitute').textContent = displayOr(value('instituteName'), 'Institute name');
  $('#previewLocation').textContent = displayOr(value('instituteLocation'), 'Institute location');

  const courseCode = value('courseCode') || 'Course code';
  const courseTitle = value('courseTitle') || 'Course title';
  $('#previewCourse').innerHTML = `<p><strong>Course code:</strong> ${escapeHtml(courseCode)}</p><p><strong>Course title:</strong> ${escapeHtml(courseTitle)}</p>`;

  const studentRows = [['Name', value('studentName') || 'Your name'], ['Registration no.', value('regNo') || 'Registration no.'], ['Group', value('group') || 'Group'], ['Section', value('section') || 'Section'], ['Term & year', value('termYear') || 'Term & year'], ['Faculty', value('faculty') || 'Faculty name']];
  $('#previewStudent').innerHTML = studentRows.map(([label, row]) => `<p><strong>${label}</strong><span class="label-colon">:</span><span>${escapeHtml(row)}</span></p>`).join('');

  const teachers = $$('.teacher-card', teacherList).map((card) => ({
    name: $('[data-teacher-field="name"]', card)?.value.trim(),
    designation: $('[data-teacher-field="designation"]', card)?.value.trim(),
    department: $('[data-teacher-field="department"]', card)?.value.trim()
  })).filter((teacher) => teacher.name || teacher.designation || teacher.department);
  const teacherMarkup = teachers.length ? teachers.map((teacher) => `<div class="teacher-preview"><p><strong>${escapeHtml(teacher.name || 'Teacher name')}</strong></p><p>${escapeHtml(teacher.designation || 'Designation')} <span class="detail-separator">|</span> ${escapeHtml(teacher.department || 'Department')}</p></div>`).join('') : '<div class="teacher-preview"><p><strong>Teacher name</strong></p><p>Designation <span class="detail-separator">|</span> Department</p></div>';
  $('#previewTeachers').innerHTML = teacherMarkup;

  const logoMarkup = logoDataUrl ? `<img src="${logoDataUrl}" alt="Institute logo" />` : '<span>LOGO</span>';
  $('#paperLogo').innerHTML = logoMarkup;
  $('#logoPreview').innerHTML = logoMarkup;
  if (typeof applyAppearance === 'function' && typeof appearance !== 'undefined') applyAppearance();
}

/* ---------- Appearance (background, font, size) ---------- */
const PAPER_W = 430;
const PAPER_H = 608.14;
const stage = $('#paperStage');
const paper = $('#coverPaper');
const SECTIONS = {
  title: ['.paper-kicker', '#previewTopic'],
  course: ['#previewCourse'],
  student: ['.block-by'],
  teacher: ['.block-to'],
  institute: ['.paper-institute-copy']
};
const makeDefaultAppearance = () => ({
  bgMode: 'default', bgColor: '#ffffff', bgImage: '', fade: 25, font: 'default', scale: 100,
  sections: Object.fromEntries(Object.keys(SECTIONS).map((key) => [key, { font: 'inherit', scale: 100 }]))
});
let appearance = makeDefaultAppearance();

function applyAppearance() {
  const a = appearance;
  if (a.bgMode === 'color') {
    paper.dataset.bg = 'color';
    paper.style.setProperty('--bg-color', a.bgColor);
  } else if (a.bgMode === 'image' && a.bgImage) {
    paper.dataset.bg = 'image';
    paper.style.setProperty('--bg-image', `url("${a.bgImage}")`);
    paper.style.setProperty('--bg-fade', String(a.fade / 100));
  } else {
    paper.removeAttribute('data-bg');
  }
  if (a.font === 'default') paper.removeAttribute('data-font'); else paper.dataset.font = a.font;
  paper.style.setProperty('--fs', String(a.scale / 100));
  Object.entries(SECTIONS).forEach(([key, selectors]) => {
    const s = a.sections[key];
    paper.style.setProperty(`--fs-${key}`, String((a.scale / 100) * (s.scale / 100)));
    selectors.forEach((selector) => {
      const el = $(selector, paper);
      if (!el) return;
      if (s.font === 'inherit') el.removeAttribute('data-sfont'); else el.dataset.sfont = s.font;
    });
    const row = $(`.sec-row[data-sec="${key}"]`);
    if (row) {
      $('.sec-font', row).value = s.font;
      $('.sec-scale', row).value = s.scale;
      $('.sec-value', row).textContent = `${s.scale}%`;
    }
  });

  $('#fadeRow').hidden = a.bgMode !== 'image';
  $('#removeBgImage').hidden = a.bgMode !== 'image';
  $('#bgFadeValue').textContent = `${a.fade}%`;
  $('#fontScaleValue').textContent = `${a.scale}%`;
  $$('.swatch[data-color]').forEach((swatch) => {
    const color = swatch.dataset.color;
    const active = (a.bgMode === 'default' && color === '') || (a.bgMode === 'color' && color.toLowerCase() === a.bgColor.toLowerCase());
    swatch.classList.toggle('active', active);
  });
  $('.swatch-custom').classList.toggle('active', a.bgMode === 'color' && !$$('.swatch[data-color]').some((s) => s.dataset.color && s.dataset.color.toLowerCase() === a.bgColor.toLowerCase()));
}

function fitPaper() {
  const scale = stage.clientWidth / PAPER_W;
  stage.style.setProperty('--s', String(scale));
}

function loadBackgroundImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 1800;
      const ratio = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      appearance.bgImage = canvas.toDataURL('image/jpeg', 0.88);
      appearance.bgMode = 'image';
      applyAppearance();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

$('#bgSwatches').addEventListener('click', (event) => {
  const swatch = event.target.closest('.swatch[data-color]');
  if (!swatch) return;
  const color = swatch.dataset.color;
  appearance.bgImage = '';
  $('#bgImageInput').value = '';
  if (color === '') appearance.bgMode = 'default';
  else { appearance.bgMode = 'color'; appearance.bgColor = color; }
  applyAppearance();
});
$('#bgColorInput').addEventListener('input', (event) => {
  appearance.bgImage = '';
  appearance.bgMode = 'color';
  appearance.bgColor = event.target.value;
  applyAppearance();
});
$('#bgImageInput').addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) loadBackgroundImage(file);
});
$('#removeBgImage').addEventListener('click', () => {
  appearance.bgImage = '';
  appearance.bgMode = 'default';
  $('#bgImageInput').value = '';
  applyAppearance();
});
$('#bgFade').addEventListener('input', (event) => { appearance.fade = Number(event.target.value); applyAppearance(); });
$('#fontFamily').addEventListener('change', (event) => { appearance.font = event.target.value; applyAppearance(); });
$('#sectionStyles').addEventListener('input', (event) => {
  const row = event.target.closest('.sec-row');
  if (!row) return;
  const s = appearance.sections[row.dataset.sec];
  if (event.target.classList.contains('sec-font')) s.font = event.target.value;
  if (event.target.classList.contains('sec-scale')) s.scale = Number(event.target.value);
  applyAppearance();
});
$('#fontScale').addEventListener('input', (event) => { appearance.scale = Number(event.target.value); applyAppearance(); });

if ('ResizeObserver' in window) new ResizeObserver(fitPaper).observe(stage);
window.addEventListener('resize', fitPaper);

/* ---------- Export: PDF download + print ---------- */
function makeCoverClone() {
  const clone = paper.cloneNode(true);
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  return clone;
}

function fileSlug() {
  const slug = value('topic').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return slug ? `cover-${slug}` : 'academic-cover';
}

async function downloadPdf() {
  const button = $('#downloadButton');
  const label = $('span', button);
  const original = label.textContent;
  button.disabled = true;
  label.textContent = 'Preparing…';
  const exportRoot = $('#exportRoot');
  try {
    if (!window.html2canvas || !window.jspdf) throw new Error('PDF engine not loaded');
    if (document.fonts?.ready) await document.fonts.ready;
    exportRoot.innerHTML = '';
    const holder = document.createElement('div');
    holder.className = 'export-stage';
    const clone = makeCoverClone();
    holder.appendChild(clone);
    exportRoot.appendChild(holder);
    const canvas = await window.html2canvas(clone, { scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false });
    const pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297);
    pdf.save(`${fileSlug()}.pdf`);
  } catch (error) {
    console.error(error);
    alert('Could not create the PDF (the PDF tool may not have loaded — check your internet connection). You can still click Print and choose "Save as PDF".');
  } finally {
    exportRoot.innerHTML = '';
    label.textContent = original;
    button.disabled = false;
  }
}

function preparePrint() {
  const root = $('#printRoot');
  root.innerHTML = '';
  const sheet = document.createElement('div');
  sheet.className = 'print-sheet';
  const holder = document.createElement('div');
  holder.className = 'export-stage';
  holder.appendChild(makeCoverClone());
  sheet.appendChild(holder);
  root.appendChild(sheet);
}

function printCover() {
  preparePrint();
  window.print();
}

window.addEventListener('beforeprint', preparePrint);
window.addEventListener('afterprint', () => { $('#printRoot').innerHTML = ''; });
form.addEventListener('submit', (event) => event.preventDefault());

$('#addTeacher').addEventListener('click', addTeacher);
form.addEventListener('input', updatePreview);
form.addEventListener('change', (event) => {
  if (event.target.name === 'documentType') $$('.segment').forEach((segment) => segment.classList.toggle('active', $('input', segment).checked));
  updatePreview();
});
teacherList.addEventListener('click', (event) => {
  const removeButton = event.target.closest('.teacher-remove');
  if (!removeButton) return;
  removeButton.closest('.teacher-card').remove();
  updatePreview();
});
$('#logoInput').addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { logoDataUrl = reader.result; updatePreview(); };
  reader.readAsDataURL(file);
});
$('#removeLogo').addEventListener('click', () => { logoDataUrl = ''; $('#logoInput').value = ''; updatePreview(); });
$('#printButton').addEventListener('click', printCover);
$('#downloadButton').addEventListener('click', downloadPdf);
$('#resetForm').addEventListener('click', () => {
  form.reset();
  teacherList.innerHTML = '';
  teacherCount = 0;
  logoDataUrl = '';
  appearance = makeDefaultAppearance();
  $('#bgColorInput').value = '#ffffff';
  $('.segment').classList.add('active');
  addTeacher();
  updatePreview();
  applyAppearance();
});

addTeacher();
updatePreview();
applyAppearance();
fitPaper();
