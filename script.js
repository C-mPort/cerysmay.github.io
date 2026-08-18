(function () {
  document.querySelectorAll('.question-block').forEach(block => {
    const grid = block.querySelector('.dot-grid');
    const readout = block.querySelector('[data-readout]');
    const confirmBtn = block.querySelector('[data-action="confirm"]');
    const clearBtn = block.querySelector('[data-action="clear"]');
    const trueAnswer = parseInt(block.dataset.answer, 10);
    const nextBlock = block.nextElementSibling && block.nextElementSibling.classList.contains('question-block')
      ? block.nextElementSibling
      : document.querySelector('.section-break');

    let selectedCount = 0; // committed guess, 0–100
    let confirmed = false;
    const dots = [];

    // build 100 dots
    for (let i = 0; i < 100; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.setAttribute('aria-pressed', 'false');
      dot.setAttribute('aria-label', `Select ${i + 1}%`);
      dot.dataset.index = i;
      grid.appendChild(dot);
      dots.push(dot);
    }

    function updateReadout() {
      if (!confirmed) {
        readout.innerHTML = selectedCount > 0
          ? `Your guess: <strong>${selectedCount}</strong>%`
          : `Each circle is 1% - take your guess!`;
      }
    }

    // paints the committed fill (1..selectedCount) — the "selected" state
    function renderSelected() {
      dots.forEach((dot, i) => {
        const isFilled = i < selectedCount;
        dot.classList.toggle('selected', isFilled);
        dot.setAttribute('aria-pressed', isFilled ? 'true' : 'false');
      });
      confirmBtn.disabled = selectedCount === 0;
      updateReadout();
    }

    // paints the live hover preview (1..n), shown on top of / instead of committed fill
    function renderPreview(n) {
      dots.forEach((dot, i) => {
        dot.classList.toggle('preview', i < n);
      });
      if (n > 0) {
        readout.innerHTML = `Previewing: <strong>${n}</strong>%`;
      } else {
        updateReadout();
      }
    }

    function clearPreview() {
      dots.forEach(d => d.classList.remove('preview'));
      updateReadout();
    }

    grid.addEventListener('mouseover', e => {
      if (confirmed) return;
      const dot = e.target.closest('.dot');
      if (!dot) return;
      renderPreview(parseInt(dot.dataset.index, 10) + 1);
    });

    grid.addEventListener('mouseleave', () => {
      if (confirmed) return;
      clearPreview();
    });

    grid.addEventListener('focusout', () => {
      if (confirmed) return;
      // only clear if focus is leaving the grid entirely
      requestAnimationFrame(() => {
        if (!grid.contains(document.activeElement)) clearPreview();
      });
    });

    grid.addEventListener('click', e => {
      const dot = e.target.closest('.dot');
      if (!dot || confirmed) return;
      selectedCount = parseInt(dot.dataset.index, 10) + 1;
      renderSelected();
    });

    clearBtn.addEventListener('click', () => {
      if (confirmed) return;
      selectedCount = 0;
      renderSelected();
    });

    confirmBtn.addEventListener('click', () => {
      if (confirmed) return;
      confirmed = true;
      confirmBtn.disabled = true;
      clearBtn.disabled = true;
      dots.forEach(d => d.classList.remove('preview'));

      const guess = selectedCount;

      // disable all dots, reveal true answer with staggered animation
      dots.forEach((dot, i) => {
        const wasSelected = dot.classList.contains('selected');
        dot.disabled = true;
        dot.classList.remove('selected');

        if (i < trueAnswer) {
          dot.classList.add('reveal-true');
          if (wasSelected) dot.classList.add('was-selected');
          dot.style.setProperty('--reveal-delay', `${i * 9}ms`);
        } else {
          dot.classList.add('reveal-false');
          if (wasSelected) {
            // guessed but wasn't actually in the true group
            dot.style.boxShadow = '0 0 0 2px var(--forest) inset';
          }
        }
      });

      const diff = guess - trueAnswer;
      const diffText = diff === 0
        ? `spot on.`
        : diff > 0
          ? `You were ${diff}% over.`
          : `You were ${Math.abs(diff)}% under.`;

      const revealText = block.dataset.reveal || `The actual figure is ${trueAnswer}%`

      readout.innerHTML = `${diffText} <span class="answer-reveal">${revealText}</span>`

      // scroll to next section after the reveal animation has played, then a pause to let the reader take in the answer
      const revealDuration = trueAnswer * 9 + 400;
      const readPause = 2000; // time to read the result before auto-scrolling, in ms
      setTimeout(() => {
        if (nextBlock) {
          nextBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, Math.min(revealDuration, 1400) + readPause);
    });
  });
})();

// ============================================
// ANIMAL PHOTO MODAL
// ============================================
(function () {
  const overlay  = document.getElementById('animalModal');
  const closeBtn = document.getElementById('modalClose');
  const elName    = document.getElementById('modalAnimalName');
  const elStatus  = document.getElementById('modalStatus');
  const elZoo     = document.getElementById('modalZoo');
  const elCaption = document.getElementById('modalCaption');
  const elPhoto   = document.getElementById('modalPhoto');
 
  let lastOpener = null;
 
  function openModal(btn) {
    lastOpener = btn;
    elName.textContent    = btn.dataset.animal  || 'Animal';
    elStatus.textContent  = btn.dataset.status  || '';
    elZoo.textContent     = btn.dataset.zoo     || '';
    elCaption.textContent = btn.dataset.caption || '';
 
    // show image in popup
    const img = btn.querySelector('img');
    elPhoto.innerHTML = img
      ? `<img src="${img.src}" alt="${img.alt}">`
      : 'loading';
 
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
 
  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastOpener) lastOpener.focus();
  }
 
  document.querySelectorAll('.gallery__item').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn));
  });
 
  closeBtn.addEventListener('click', closeModal);
 
  // click the dark backdrop to close
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });
 
  // Escape key to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hidden) closeModal();
  });
})();

// ============================================
// IUCN system
// ============================================
(function () {
  const overlay  = document.getElementById('animalModal');
  const closeBtn = document.getElementById('modalClose');
  const elName    = document.getElementById('modalAnimalName');
  const elStatus  = document.getElementById('modalStatus');
  const elZoo     = document.getElementById('modalZoo');
  const elCaption = document.getElementById('modalCaption');
  const elPhoto   = document.getElementById('modalPhoto');
 
  let lastOpener = null;
 
  function openModal(btn) {
    lastOpener = btn;
    elName.textContent    = btn.dataset.animal  || 'Animal';
    elStatus.textContent  = btn.dataset.status  || '';
    elZoo.textContent     = btn.dataset.zoo     || '';
    elCaption.textContent = btn.dataset.caption || '';
 
    // show image in popup
    const img = btn.querySelector('img');
    elPhoto.innerHTML = img
      ? `<img src="${img.src}" alt="${img.alt}">`
      : 'loading';
 
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
 
  function closeModal() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastOpener) lastOpener.focus();
  }
 
  document.querySelectorAll('.gallery__item').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn));
  });
 
  closeBtn.addEventListener('click', closeModal);
 
  // click the dark backdrop to close
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });
 
  // Escape key to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !overlay.hidden) closeModal();
  });
})();