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

/* Shown when the institute name and logo are both left empty.
   To add the real logo, paste its image as a data URL (or a file path like 'gau-logo.png') into `logo`. */
const DEFAULT_INSTITUTE = {
  name: 'Gazipur Agricultural University',
  location: 'Salna, Gazipur-1706',
  logo: 'data:image/jpeg;base64,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'
};

function setHidden(el, hidden) {
  if (el) el.hidden = !!hidden;
}

function updatePreview() {
  const selectedType = $('input[name="documentType"]:checked')?.value || 'An Assignment on';
  $('#previewType').textContent = selectedType.toUpperCase();

  // Title & topic
  const topic = value('topic');
  $('#previewTopic').textContent = topic;
  setHidden($('#previewTopic'), !topic);
  setHidden($('.paper-divider'), !topic);

  // Course details: only filled rows are shown
  const courseRows = [['Course code', value('courseCode')], ['Course title', value('courseTitle')]].filter(([, text]) => text);
  $('#previewCourse').innerHTML = courseRows.map(([label, text]) => `<p><strong>${label}:</strong> ${escapeHtml(text)}</p>`).join('');
  setHidden($('#previewCourse'), !courseRows.length);

  // Submitted by: only filled rows are shown
  const studentRows = [
    ['Name', value('studentName'), 'row-name'], ['Registration no.', value('regNo'), ''], ['Group', value('group'), ''],
    ['Section', value('section'), ''], ['Term & year', value('termYear'), ''], ['Faculty', value('faculty'), '']
  ].filter(([, text]) => text);
  $('#previewStudent').innerHTML = studentRows.map(([label, text, cls]) => `<p class="${cls}"><strong>${label}</strong><span class="label-colon">:</span><span>${escapeHtml(text)}</span></p>`).join('');
  setHidden($('.block-by'), !studentRows.length);

  // Submitted to: only filled teachers / details are shown
  const teachers = $$('.teacher-card', teacherList).map((card) => ({
    name: $('[data-teacher-field="name"]', card)?.value.trim(),
    designation: $('[data-teacher-field="designation"]', card)?.value.trim(),
    department: $('[data-teacher-field="department"]', card)?.value.trim()
  })).filter((teacher) => teacher.name || teacher.designation || teacher.department);
  $('#previewTeachers').innerHTML = teachers.map((teacher) => {
    const detail = [teacher.designation, teacher.department].filter(Boolean).map(escapeHtml).join(' <span class="detail-separator">|</span> ');
    return `<div class="teacher-preview">${teacher.name ? `<p><strong>${escapeHtml(teacher.name)}</strong></p>` : ''}${detail ? `<p class="teacher-line">${detail}</p>` : ''}</div>`;
  }).join('');
  setHidden($('.block-to'), !teachers.length);

  // Two blocks side by side, one block full width, none = hidden
  const blocks = (studentRows.length ? 1 : 0) + (teachers.length ? 1 : 0);
  $('.paper-submission').classList.toggle('single', blocks === 1);
  setHidden($('.paper-submission'), blocks === 0);

  // Institute (falls back to the default university when name and logo are both left empty)
  const typedName = value('instituteName');
  const typedLocation = value('instituteLocation');
  const useDefault = !typedName && !logoDataUrl;
  const instituteName = typedName || (useDefault ? DEFAULT_INSTITUTE.name : '');
  const instituteLocation = typedLocation || (useDefault ? DEFAULT_INSTITUTE.location : '');
  const logoSrc = logoDataUrl || (useDefault ? DEFAULT_INSTITUTE.logo : '');
  $('#previewInstitute').textContent = instituteName;
  $('#previewLocation').textContent = instituteLocation;
  setHidden($('#previewInstitute'), !instituteName);
  setHidden($('#previewLocation'), !instituteLocation);
  setHidden($('.paper-institute-copy'), !instituteName && !instituteLocation);
  $('#paperLogo').innerHTML = logoSrc ? `<img src="${logoSrc}" alt="Institute logo" />` : '';
  setHidden($('#paperLogo'), !logoSrc);
  setHidden($('.paper-institute'), !logoSrc && !instituteName && !instituteLocation);
  $('#logoPreview').innerHTML = logoDataUrl ? `<img src="${logoDataUrl}" alt="Institute logo" />` : '<span>LOGO</span>';

  // Hint shown only while the whole cover is still empty (never exported)
  const anyContent = topic || courseRows.length || studentRows.length || teachers.length || typedName || typedLocation || logoDataUrl;
  setHidden($('#paperHint'), !!anyContent);

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
  sections: Object.fromEntries(Object.keys(SECTIONS).map((key) => [key, { font: 'inherit', scale: 100, color: '' }]))
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
      if (s.color) { el.dataset.scolor = '1'; el.style.setProperty('--sc', s.color); }
      else { el.removeAttribute('data-scolor'); el.style.removeProperty('--sc'); }
    });
    const row = $(`.sec-row[data-sec="${key}"]`);
    if (row) {
      $('.sec-font', row).value = s.font;
      $('.sec-scale', row).value = s.scale;
      $('.sec-value', row).textContent = `${s.scale}%`;
      const colorInput = $('.sec-color-input', row);
      if (colorInput) {
        colorInput.value = s.color || '#17211f';
        $('.sec-color-reset', row).hidden = !s.color;
      }
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
  if (event.target.classList.contains('sec-color-input')) s.color = event.target.value;
  applyAppearance();
});
$('#sectionStyles').addEventListener('click', (event) => {
  if (!event.target.classList.contains('sec-color-reset')) return;
  const row = event.target.closest('.sec-row');
  appearance.sections[row.dataset.sec].color = '';
  applyAppearance();
});
$('#fontScale').addEventListener('input', (event) => { appearance.scale = Number(event.target.value); applyAppearance(); });

if ('ResizeObserver' in window) new ResizeObserver(fitPaper).observe(stage);
window.addEventListener('resize', fitPaper);

/* ---------- Export: PDF download + print ---------- */
function makeCoverClone() {
  const clone = paper.cloneNode(true);
  clone.removeAttribute('id');
  clone.querySelector('.paper-empty-hint')?.remove();
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
