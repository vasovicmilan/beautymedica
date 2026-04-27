// admin-service-form.js – handles dynamic addition/removal of sections in the admin service form

document.addEventListener('DOMContentLoaded', function() {
  // Helper: generate new indices for dynamic fields
  let featureIndex = document.querySelectorAll('#featuresContainer .feature-item').length;
  let packageIndex = document.querySelectorAll('#packagesContainer .package-item').length;
  let rowIndex = document.querySelectorAll('#comparisonRowsContainer .comparison-row').length;
  let faqIndex = document.querySelectorAll('#faqContainer .faq-item').length;

  // ---------- Features ----------
  function addFeature() {
    const container = document.getElementById('featuresContainer');
    const div = document.createElement('div');
    div.className = 'feature-item card mb-3 p-3';
    div.innerHTML = `
      <div class="row g-2">
        <div class="col-md-3"><input type="text" class="form-control" name="features[${featureIndex}][name]" placeholder="Naziv" required></div>
        <div class="col-md-2"><input type="text" class="form-control" name="features[${featureIndex}][slug]" placeholder="Slug" required></div>
        <div class="col-md-3"><input type="text" class="form-control" name="features[${featureIndex}][description]" placeholder="Opis" required></div>
        <div class="col-md-2"><input type="text" class="form-control" name="features[${featureIndex}][icon]" placeholder="Ikona (bi-xxx)"></div>
        <div class="col-md-1"><input type="number" class="form-control" name="features[${featureIndex}][order]" placeholder="Redosled" value="0"></div>
        <div class="col-md-1"><div class="form-check form-switch mt-2"><input class="form-check-input" type="checkbox" name="features[${featureIndex}][isActive]" checked></div></div>
      </div>
      <button type="button" class="btn btn-sm btn-outline-danger mt-2 remove-feature">Obriši karakteristiku</button>
    `;
    container.appendChild(div);
    attachRemoveFeature(div.querySelector('.remove-feature'));
    featureIndex++;
  }

  function attachRemoveFeature(btn) {
    btn.addEventListener('click', function() { this.closest('.feature-item').remove(); });
  }

  document.getElementById('addFeature').addEventListener('click', addFeature);
  document.querySelectorAll('.remove-feature').forEach(attachRemoveFeature);

  // ---------- Packages ----------
  function addPackage() {
    const container = document.getElementById('packagesContainer');
    const div = document.createElement('div');
    div.className = 'package-item card mb-3 p-3';
    div.innerHTML = `
      <div class="row g-2">
        <div class="col-md-2"><input type="text" class="form-control" name="packages[${packageIndex}][name]" placeholder="Naziv" required></div>
        <div class="col-md-2"><input type="text" class="form-control" name="packages[${packageIndex}][slug]" placeholder="Slug" required></div>
        <div class="col-md-1"><input type="number" class="form-control" name="packages[${packageIndex}][sessions]" placeholder="Tretmana" required></div>
        <div class="col-md-2"><input type="number" class="form-control" name="packages[${packageIndex}][totalPrice]" placeholder="Ukupna cena" required></div>
        <div class="col-md-2"><input type="number" class="form-control" name="packages[${packageIndex}][basePrice]" placeholder="Osnovna cena"></div>
        <div class="col-md-1"><input type="text" class="form-control" name="packages[${packageIndex}][badge]" placeholder="Značka"></div>
        <div class="col-md-1"><div class="form-check form-switch mt-2"><input class="form-check-input" type="checkbox" name="packages[${packageIndex}][isBest]"></div></div>
        <div class="col-md-1"><div class="form-check form-switch mt-2"><input class="form-check-input" type="checkbox" name="packages[${packageIndex}][isActive]" checked></div></div>
      </div>
      <button type="button" class="btn btn-sm btn-outline-danger mt-2 remove-package">Obriši paket</button>
    `;
    container.appendChild(div);
    attachRemovePackage(div.querySelector('.remove-package'));
    packageIndex++;
  }

  function attachRemovePackage(btn) {
    btn.addEventListener('click', function() { this.closest('.package-item').remove(); });
  }

  document.getElementById('addPackage').addEventListener('click', addPackage);
  document.querySelectorAll('.remove-package').forEach(attachRemovePackage);

  // ---------- Comparison Columns ----------
  function addColumn() {
    const container = document.getElementById('comparisonColumnsContainer');
    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    div.innerHTML = `<input type="text" class="form-control" name="comparisonColumns[]" placeholder="Naziv kolone">
                     <button type="button" class="btn btn-outline-danger remove-col">Obriši</button>`;
    container.appendChild(div);
    div.querySelector('.remove-col').addEventListener('click', function() { this.closest('.input-group').remove(); });
  }

  document.getElementById('addColumn').addEventListener('click', addColumn);
  document.querySelectorAll('.remove-col').forEach(btn => {
    btn.addEventListener('click', function() { this.closest('.input-group').remove(); });
  });

  // ---------- Comparison Rows ----------
  function addRow() {
    const container = document.getElementById('comparisonRowsContainer');
    const rowDiv = document.createElement('div');
    rowDiv.className = 'comparison-row card mb-3 p-3';
    const idx = rowIndex++;
    rowDiv.innerHTML = `
      <div class="row g-2 mb-2">
        <div class="col-md-3"><input type="text" class="form-control" name="comparisonRows[${idx}][label]" placeholder="Naziv reda" required></div>
        <div class="col-md-9 d-flex align-items-end justify-content-end"><button type="button" class="btn btn-sm btn-outline-danger remove-row">Obriši red</button></div>
      </div>
      <div class="values-container"></div>
      <button type="button" class="btn btn-sm btn-outline-secondary add-value">+ Dodaj vrednost</button>
    `;
    container.appendChild(rowDiv);
    const valuesContainer = rowDiv.querySelector('.values-container');
    const addValueBtn = rowDiv.querySelector('.add-value');
    let valueIdx = 0;
    addValue(valuesContainer, valueIdx++);
    addValueBtn.addEventListener('click', () => addValue(valuesContainer, valueIdx++));
    rowDiv.querySelector('.remove-row').addEventListener('click', () => rowDiv.remove());
  }

  function addValue(container, idx, val = '') {
    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    // get the name of the values array from the label input's name
    const rowDiv = container.closest('.comparison-row');
    const labelInput = rowDiv.querySelector('input[name$="[label]"]');
    const baseName = labelInput.name.replace('[label]', '[values][]');
    div.innerHTML = `<input type="text" class="form-control" name="${baseName}" placeholder="Vrednost" value="${escapeHtml(val)}">
                     <button type="button" class="btn btn-outline-danger remove-value">Obriši</button>`;
    container.appendChild(div);
    div.querySelector('.remove-value').addEventListener('click', () => div.remove());
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  document.getElementById('addRow').addEventListener('click', addRow);
  // initialize existing rows: attach add-value buttons
  document.querySelectorAll('.comparison-row').forEach(row => {
    const valuesContainer = row.querySelector('.values-container');
    const addValueBtn = row.querySelector('.add-value');
    let valueIdx = valuesContainer.children.length;
    addValueBtn.addEventListener('click', () => addValue(valuesContainer, valueIdx++));
  });

  // ---------- FAQ ----------
  function addFaq() {
    const container = document.getElementById('faqContainer');
    const idx = faqIndex++;
    const div = document.createElement('div');
    div.className = 'faq-item card mb-3 p-3';
    div.innerHTML = `
      <div class="row g-2 mb-2">
        <div class="col-md-11"><input type="text" class="form-control" name="faq[${idx}][question]" placeholder="Pitanje" required></div>
        <div class="col-md-1"><button type="button" class="btn btn-sm btn-outline-danger remove-faq">Obriši</button></div>
      </div>
      <textarea class="form-control" name="faq[${idx}][answer]" rows="2" placeholder="Odgovor" required></textarea>
    `;
    container.appendChild(div);
    div.querySelector('.remove-faq').addEventListener('click', () => div.remove());
  }

  document.getElementById('addFaq').addEventListener('click', addFaq);
  document.querySelectorAll('.remove-faq').forEach(btn => {
    btn.addEventListener('click', function() { this.closest('.faq-item').remove(); });
  });
});