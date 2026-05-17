/* ============================================================
   Mini-MBA Notes — interactive features
   1. Auto-build TOC from h2/h3
   2. Position margin comments next to their anchored superscripts
   3. Reference tooltips on hover
   4. Scroll-spy TOC highlight
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  buildTOC();
  positionComments();
  wireReferences();
  wireTooltips();
  setupScrollSpy();
  setupCommentAnchorClicks();

  // reposition on resize / image load
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(positionComments, 100);
  });
  window.addEventListener('load', positionComments);
});

/* ---------- TOC ---------- */
function buildTOC() {
  const tocList = document.getElementById('toc-list');
  if (!tocList) return;
  const article = document.querySelector('.topic-content');
  if (!article) return;
  const headings = article.querySelectorAll('h2, h3');
  headings.forEach((h, i) => {
    if (!h.id) h.id = slugify(h.textContent) || `sec-${i}`;
    const li = document.createElement('li');
    li.className = `level-${h.tagName === 'H2' ? 2 : 3}`;
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    a.dataset.target = h.id;
    li.appendChild(a);
    tocList.appendChild(li);
  });
}

function slugify(s) {
  return s.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/* ---------- Comments alignment ---------- */
function positionComments() {
  const commentsCol = document.querySelector('.comments-col');
  if (!commentsCol) return;
  if (window.innerWidth <= 1100) return; // mobile: static stacking

  const comments = commentsCol.querySelectorAll('.comment');
  const colRect = commentsCol.getBoundingClientRect();
  const scrollY = window.scrollY;
  const colTopAbs = colRect.top + scrollY;

  const placements = [];
  const minGap = 8;

  comments.forEach(c => {
    const id = c.dataset.for;
    const anchor = document.querySelector(`sup.comment-anchor[data-comment="${id}"]`);
    if (!anchor) { c.style.display = 'none'; return; }
    c.style.display = '';
    const anchorTop = anchor.getBoundingClientRect().top + scrollY;
    let desired = anchorTop - colTopAbs;
    placements.push({ el: c, desired });
  });

  // Sort by desired top, then stack without overlap
  placements.sort((a, b) => a.desired - b.desired);
  let lastBottom = 0;
  placements.forEach(p => {
    const top = Math.max(p.desired, lastBottom + minGap);
    p.el.style.top = `${top}px`;
    lastBottom = top + p.el.offsetHeight;
  });
}

/* ---------- Comment ↔ anchor click linking ---------- */
function setupCommentAnchorClicks() {
  document.querySelectorAll('sup.comment-anchor').forEach(sup => {
    sup.addEventListener('click', e => {
      const id = sup.dataset.comment;
      const c = document.querySelector(`.comment[data-for="${id}"]`);
      if (!c) return;
      document.querySelectorAll('.comment.highlight').forEach(x => x.classList.remove('highlight'));
      c.classList.add('highlight');
      c.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => c.classList.remove('highlight'), 1800);
    });
  });
  document.querySelectorAll('.comment').forEach(c => {
    c.addEventListener('click', () => {
      const id = c.dataset.for;
      const sup = document.querySelector(`sup.comment-anchor[data-comment="${id}"]`);
      if (!sup) return;
      sup.scrollIntoView({ behavior: 'smooth', block: 'center' });
      sup.classList.add('active');
      setTimeout(() => sup.classList.remove('active'), 1800);
    });
  });
}

/* ---------- Reference tooltips ---------- */
function wireReferences() {
  let tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);

  document.querySelectorAll('.ref').forEach(el => {
    const refId = el.dataset.ref;
    const refSource = document.getElementById(refId);
    const text = refSource ? refSource.textContent.trim() : el.dataset.refText || '';

    // Append superscript number based on order in references list
    if (refSource) {
      const allRefs = Array.from(document.querySelectorAll('.references li'));
      const idx = allRefs.indexOf(refSource) + 1;
      if (idx > 0 && !el.querySelector('sup')) {
        const s = document.createElement('sup');
        s.textContent = `[${idx}]`;
        el.appendChild(s);
      }
    }

    el.addEventListener('mouseenter', e => {
      tooltip.textContent = text;
      tooltip.classList.add('visible');
      positionTooltip(tooltip, el);
    });
    el.addEventListener('mousemove', e => positionTooltip(tooltip, el));
    el.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
    el.addEventListener('click', e => {
      e.preventDefault();
      if (!refSource) return;
      refSource.scrollIntoView({ behavior: 'smooth', block: 'center' });
      refSource.classList.remove('flash');
      void refSource.offsetWidth; // restart animation
      refSource.classList.add('flash');
    });
  });
}

/* ---------- Generic [data-tooltip] hover tooltips ---------- */
function wireTooltips() {
  let tooltip = document.querySelector('.tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);
  }
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      tooltip.textContent = el.dataset.tooltip;
      tooltip.classList.add('visible');
      positionTooltip(tooltip, el);
    });
    el.addEventListener('mousemove', () => positionTooltip(tooltip, el));
    el.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
  });
}

function positionTooltip(tooltip, anchor) {
  const r = anchor.getBoundingClientRect();
  const tw = tooltip.offsetWidth;
  const th = tooltip.offsetHeight;
  let left = r.left + window.scrollX;
  let top = r.top + window.scrollY - th - 10;
  // keep within viewport horizontally
  const maxLeft = window.scrollX + window.innerWidth - tw - 12;
  if (left > maxLeft) left = maxLeft;
  if (left < window.scrollX + 8) left = window.scrollX + 8;
  // if it'd go above viewport, place below
  if (top < window.scrollY + 8) top = r.bottom + window.scrollY + 10;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

/* ---------- Scroll-spy ---------- */
function setupScrollSpy() {
  const tocLinks = document.querySelectorAll('.toc a[data-target]');
  if (!tocLinks.length) return;
  const targets = Array.from(tocLinks).map(a => document.getElementById(a.dataset.target)).filter(Boolean);

  function update() {
    const y = window.scrollY + 80;
    let activeId = null;
    for (const t of targets) {
      if (t.offsetTop <= y) activeId = t.id;
      else break;
    }
    tocLinks.forEach(a => {
      a.classList.toggle('active', a.dataset.target === activeId);
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}
