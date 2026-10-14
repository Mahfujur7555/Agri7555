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
}

async function downloadCover() {
  const button = document.querySelector('#downloadButton');
  const originalText = button.querySelector('span').textContent;

  button.disabled = true;
  button.querySelector('span').textContent = 'Creating PDF…';

  try {
    if (!window.html2canvas || !window.jspdf) {
      throw new Error('PDF libraries are unavailable.');
    }

    const cover = document.querySelector('#coverPaper');

    const canvas = await window.html2canvas(cover, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fbfaf5',
      logging: false
    });

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const imageRatio = canvas.width / canvas.height;

    const imageWidth = pageWidth;
    const imageHeight = pageWidth / imageRatio;
    const topOffset = Math.max(
      0,
      (pageHeight - imageHeight) / 2
    );

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      topOffset,
      imageWidth,
      imageHeight,
      undefined,
      'FAST'
    );

    const topic =
      document.querySelector('#topic')?.value.trim() ||
      'academic-cover';

    const fileName = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    pdf.save(`${fileName || 'academic-cover'}.pdf`);

  } catch (error) {
    console.error(error);

    alert(
      'PDF generation failed. Please use Print cover and select Save as PDF.'
    );

  } finally {
    button.disabled = false;
    button.querySelector('span').textContent = originalText;
  }
}


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
$('#printButton').addEventListener('click', () => window.print());
$('#downloadButton').addEventListener('click', downloadCover);
$('#resetForm').addEventListener('click', () => {
  form.reset();
  teacherList.innerHTML = '';
  teacherCount = 0;
  logoDataUrl = '';
  $('.segment').classList.add('active');
  addTeacher();
  updatePreview();
});

addTeacher();
updatePreview();
