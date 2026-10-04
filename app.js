const lessonGroups = {
  present: ['Present Simple', 'Present Continuous', 'Present Perfect', 'Present Perfect Continuous'],
  past: ['Past Simple', 'Past Continuous', 'Past Perfect', 'Past Perfect Continuous'],
  future: ['Future Simple', 'Future Continuous', 'Future Perfect', 'Future Perfect Continuous'],
};
const welcomeView = document.querySelector('.welcome-view');
const lessonView = document.querySelector('.lesson-view');
const libraryView = document.querySelector('#library-view');
const article = document.querySelector('.lesson-article');
const originalArticle = article.innerHTML;
const modeSwitch = document.querySelector('.lesson-mode-switch');
let selectedLesson = 'Present Simple';
let selectedMode = 'study';
let observer;

const slug = (value) => value.toLowerCase().replaceAll(' ', '-');
const lessonHash = (title, mode) => `#lesson/${slug(title)}/${mode}`;
const titleFromSlug = (value) => Object.values(lessonGroups).flat().find((title) => slug(title) === value);
function groupFor(title) {
  return Object.entries(lessonGroups).find(([, titles]) => titles.includes(title))?.[0] ?? 'present';
}
function setActiveTab(id) {
  document.querySelectorAll('.lesson-tab').forEach((tab) => {
    const active = tab.dataset.tab === id;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
}
function observeCurrentSections() {
  observer?.disconnect();
  if (!('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveTab(visible.target.dataset.section);
  }, { rootMargin: '-13% 0px -68% 0px', threshold: [0, 0.12, 0.3] });
  document.querySelectorAll('.lesson-article [data-section]').forEach((section) => observer.observe(section));
}
function syncNav() {
  document.querySelectorAll('.nav-lesson-row').forEach((row) => {
    const title = row.dataset.lesson;
    const expanded = title === selectedLesson && selectedMode !== 'reference';
    const titleButton = row.querySelector('.nav-title');
    titleButton.classList.toggle('active', expanded);
    titleButton.setAttribute('aria-expanded', String(expanded));
    row.querySelector('.nav-subtabs').hidden = !expanded;
    row.querySelectorAll('.nav-subtab').forEach((link) => {
      const active = expanded && link.dataset.mode === selectedMode;
      link.classList.toggle('active', active);
      link.setAttribute('aria-current', active ? 'page' : 'false');
    });
  });
  document.querySelectorAll('[data-reference]').forEach((link) => link.classList.remove('active'));
}
function buildStudyMarkup(title, data) {
  if (!data) return originalArticle;
  return `
    <section class="lesson-section" id="explanation" data-section="explanation">
      <div class="section-heading"><div><h2>How the ${title} works</h2></div></div>
      <p class="section-lead">${data.definition}</p>
      <div class="subheading-row"><h3>Build the sentence</h3></div>
      <div class="formula-card lesson-formulas">
        <div class="lesson-formula-row"><span class="lesson-formula-label">FORM</span><span>${data.form[0]}</span></div>
        <div class="lesson-formula-row"><span class="lesson-formula-label">AFFIRMATIVE</span><span>${data.form[1]}</span></div>
        <div class="lesson-formula-row"><span class="lesson-formula-label">NEGATIVE</span><span>${data.form[2]}</span></div>
        <div class="lesson-formula-row"><span class="lesson-formula-label">QUESTION</span><span>${data.form[3]}</span></div>
      </div>
      <div class="grammar-note"><span class="note-icon">i</span><p><strong>Common time expressions:</strong> ${data.timeWords}.</p></div>
    </section>
    <section class="lesson-section academic-section" id="academic">
      <div class="section-heading"><div><h2>When to use it</h2></div></div>
      <div class="academic-grid">${data.uses.map(([heading, example, detail]) => `<article class="academic-card"><h3>${heading}</h3><p class="academic-example">“${example}”</p><p>${detail}</p></article>`).join('')}</div>
      <div class="academic-grid academic-notes"><article class="academic-card"><h3>Compare the meaning</h3><p>${data.contrast}</p></article><article class="academic-card"><h3>A common mistake</h3><p>${data.mistake}</p></article></div>
    </section>
    <section class="lesson-section examples-section" id="examples" data-section="examples">
      <div class="section-heading"><div><h2>Real-life examples</h2></div></div>
      <p class="section-lead">Notice how the tense fits the meaning in each everyday situation.</p>
      <div class="example-list">${data.examples.map(([sentence, context], index) => `<article class="example-card"><span class="example-icon">${['✎','◷','↗'][index]}</span><div><p>${sentence}</p><span class="example-context">${context}</span></div><span class="example-number">0${index + 1}</span></article>`).join('')}</div>
      <div class="say-it-card"><div class="say-it-icon">↗</div><div><span class="say-it-label">PRACTISE</span><p>Make one true sentence about your own life using the ${title}.</p><span class="say-it-help">Say it aloud, then write it down.</span></div></div>
    </section>
    <section class="lesson-section tips-section" id="tips" data-section="tips">
      <div class="section-heading"><div><h2>Tips for using it well</h2></div></div>
      <div class="tip-list">${data.tips.map((tip, index) => `<div class="tip-row"><span class="tip-bullet">0${index + 1}</span><div><p>${tip}</p></div></div>`).join('')}</div>
      <div class="confidence-card"><span class="confidence-sparkle">✳</span><p>Grammar becomes easier with practice.<br><strong>Try making your own examples next.</strong></p></div>
    </section>
    <section class="lesson-section videos-section" id="videos" data-section="videos">
      <div class="section-heading"><div><h2>Watch and learn</h2></div></div>
      <p class="section-lead">Continue with a video explanation and listen for the sentence patterns from this lesson.</p>
      <a class="video-card" href="https://www.youtube.com/results?search_query=${encodeURIComponent(data.videoQuery)}" target="_blank" rel="noreferrer"><span class="video-play">▶</span><span class="video-copy"><span class="video-source">BRITISH COUNCIL · LEARNENGLISH</span><strong>${title}: grammar and examples</strong><span>Search for a focused explanation and examples.</span></span><span class="video-arrow">↗</span></a>
      <a class="video-card" href="https://www.youtube.com/results?search_query=${encodeURIComponent(`BBC Learning English ${title} tense`)}" target="_blank" rel="noreferrer"><span class="video-play">▶</span><span class="video-copy"><span class="video-source">BBC LEARNING ENGLISH</span><strong>More ${title} practice</strong><span>Find another short lesson from a trusted learning channel.</span></span><span class="video-arrow">↗</span></a>
      <p class="video-footnote">Video searches open YouTube in a new tab.</p>
    </section>
    <div class="lesson-footer"><span>One lesson at a time. Keep going.</span><button type="button" class="back-to-top" data-back-top>Back to top ↑</button></div>`;
}

function showStudy() {
  const data = window.tenseLessons[selectedLesson];
  article.innerHTML = buildStudyMarkup(selectedLesson, data);
  document.querySelector('.lesson-tabs').hidden = false;
  document.querySelectorAll('.lesson-tab').forEach((tab) => {
    tab.onclick = () => {
      document.getElementById(tab.dataset.tab)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveTab(tab.dataset.tab);
    };
  });
  document.querySelector('[data-back-top]')?.addEventListener('click', () => document.querySelector('.lesson-heading').scrollIntoView({ behavior: 'smooth', block: 'start' }));
  setActiveTab('explanation');
  modeSwitch.querySelectorAll('.mode-button').forEach((button) => button.classList.toggle('active', button.dataset.mode === 'study'));
  observeCurrentSections();
}

function showPractice() {
  document.querySelector('.lesson-tabs').hidden = true;
  modeSwitch.querySelectorAll('.mode-button').forEach((button) => button.classList.toggle('active', button.dataset.mode === 'practice'));
  const questions = [...window.practiceQuestions[selectedLesson], ...(window.extraPracticeQuestions[selectedLesson] ?? [])];
  let index = 0;
  let score = 0;
  let placed = '';
  let checked = false;
  let earned = false;
  const draw = () => {
    if (index >= questions.length) {
      article.innerHTML = `<section class="practice-complete"><div class="complete-icon">✓</div><p class="practice-kicker">PRACTICE COMPLETE</p><h2>Nice work!</h2><p>You got <strong>${score} of ${questions.length}</strong> questions correct.</p><button class="primary-button" data-play-again>Try again</button></section>`;
      article.querySelector('[data-play-again]').addEventListener('click', () => { index = 0; score = 0; placed = ''; checked = false; earned = false; draw(); });
      return;
    }
    const question = questions[index];
    const [before, after = ''] = question.sentence.split('___');
    article.innerHTML = `<section class="practice-panel"><div class="practice-panel-top"><div><p class="practice-kicker">DRAG AND DROP</p><h2>Choose the correct form</h2></div><div class="practice-count">${index + 1}<span> / ${questions.length}</span></div></div><p class="practice-instruction">Drag a word into the sentence, or tap a word and then tap the blank.</p><div class="practice-question"><p class="practice-sentence">${before}<button class="drop-slot${placed ? ' has-word' : ''}" type="button" aria-label="Answer blank">${placed || 'Drop a word'}</button>${after}</p></div><div class="choice-bank" aria-label="Word choices">${question.choices.filter((choice) => choice !== placed).map((choice) => `<button class="choice-chip" type="button" draggable="true" data-choice="${choice}">${choice}</button>`).join('')}</div><div class="practice-actions"><button class="check-answer" type="button" ${!placed || (checked && placed === question.answer) ? 'disabled' : ''}>${checked && placed !== question.answer ? 'Try again' : 'Check answer'}</button><button class="hint-button" type="button">Hint</button>${checked && placed === question.answer ? '<button class="next-question" type="button">Next question →</button>' : ''}</div><p class="practice-feedback" aria-live="polite">${checked ? (placed === question.answer ? 'Correct! Well done.' : 'Not quite. Choose another word and try again.') : ''}</p><div class="practice-progress"><span style="width:${(index / questions.length) * 100}%"></span></div></section>`;
    const slot = article.querySelector('.drop-slot');
    const choose = (word) => { if (checked && placed === question.answer) return; placed = word; draw(); };
    slot.addEventListener('click', () => { if (!(checked && placed === question.answer)) { placed = ''; checked = false; draw(); } });
    article.querySelectorAll('.choice-chip').forEach((chip) => {
      chip.addEventListener('click', () => choose(chip.dataset.choice));
      chip.addEventListener('dragstart', (event) => { event.dataTransfer.setData('text/plain', chip.dataset.choice); event.dataTransfer.effectAllowed = 'move'; chip.classList.add('dragging'); });
      chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
    });
    slot.addEventListener('dragover', (event) => { event.preventDefault(); slot.classList.add('drag-over'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', (event) => { event.preventDefault(); slot.classList.remove('drag-over'); choose(event.dataTransfer.getData('text/plain')); });
    article.querySelector('.check-answer').addEventListener('click', () => {
      if (placed === question.answer) { checked = true; if (!earned) score += 1; earned = true; }
      else checked = true;
      draw();
    });
    article.querySelector('.hint-button').addEventListener('click', () => { article.querySelector('.practice-feedback').textContent = 'Hint: Check which time clue you can see, then match the verb form to the subject.'; });
    article.querySelector('.next-question')?.addEventListener('click', () => { index += 1; placed = ''; checked = false; earned = false; draw(); });
  };
  draw();
  observer?.disconnect();
}

function openLesson(title, mode = 'study', push = true) {
  selectedLesson = title;
  selectedMode = mode;
  document.body.classList.add('lesson-active');
  welcomeView.hidden = true;
  lessonView.hidden = false;
  libraryView.hidden = true;
  document.querySelector('.lesson-heading h1').innerHTML = `${title}<span class="title-period">.</span>`;
  document.querySelector('.lesson-heading-copy > p').textContent = window.tenseLessons[title]?.subtitle ?? 'For routines, facts, and things that are generally true.';
  const crumbs = document.querySelectorAll('.breadcrumbs > span');
  if (crumbs[1]) crumbs[1].textContent = `${groupFor(title)[0].toUpperCase()}${groupFor(title).slice(1)} tenses`;
  document.querySelector('.breadcrumbs > strong').textContent = title;
  if (mode === 'practice') showPractice(); else showStudy();
  syncNav();
  if (push && location.hash !== lessonHash(title, mode)) history.pushState({ title, mode }, '', lessonHash(title, mode));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderLibrary(type, push = true) {
  document.body.classList.add('lesson-active');
  welcomeView.hidden = true;
  lessonView.hidden = true;
  libraryView.hidden = false;
  const isVerbs = type === 'verbs';
  const title = isVerbs ? '100 Common Verbs' : '100 Useful English Sentences';
  libraryView.innerHTML = `<div class="library-page"><a class="library-back" href="#lesson/present-simple/study">← Back to lessons</a><div class="library-heading"><p class="library-kicker">ENGLISH REFERENCE</p><h1>${title}</h1><p>${isVerbs ? 'Study the base form, Past Simple, and past participle of useful everyday verbs.' : 'Keep these practical phrases close for everyday conversations.'}</p></div><label class="library-search-label" for="library-search">Search this list</label><input class="library-search" id="library-search" type="search" placeholder="Type a word or phrase…" autocomplete="off"><div class="library-results"></div><p class="library-empty" hidden>No matches. Try another search.</p></div>`;
  const results = libraryView.querySelector('.library-results');
  if (isVerbs) {
    results.innerHTML = `<div class="verb-table-wrap"><table class="verb-table"><thead><tr><th>#</th><th>Base form</th><th>Past Simple</th><th>Past participle</th></tr></thead><tbody>${window.referenceData.verbs.map(([base, past, participle], index) => `<tr data-search="${base} ${past} ${participle}"><td>${String(index + 1).padStart(2, '0')}</td><td>${base}</td><td>${past}</td><td>${participle}</td></tr>`).join('')}</tbody></table></div>`;
  } else {
    results.innerHTML = `<ol class="sentence-list">${window.referenceData.sentences.map((sentence, index) => `<li data-search="${sentence.toLowerCase()}"><span class="sentence-index">${String(index + 1).padStart(2, '0')}</span><span>${sentence}</span></li>`).join('')}</ol>`;
  }
  libraryView.querySelector('.library-search').addEventListener('input', (event) => {
    const term = event.target.value.trim().toLowerCase();
    const rows = [...results.querySelectorAll('[data-search]')];
    let visible = 0;
    rows.forEach((row) => { const match = row.dataset.search.toLowerCase().includes(term); row.hidden = !match; if (match) visible += 1; });
    libraryView.querySelector('.library-empty').hidden = visible !== 0;
  });
  libraryView.querySelector('.library-back').addEventListener('click', (event) => { event.preventDefault(); openLesson(selectedLesson, 'study'); });
  document.querySelectorAll('[data-reference]').forEach((link) => link.classList.toggle('active', link.dataset.reference === type));
  if (push && location.hash !== `#${type}`) history.pushState({ page: type }, '', `#${type}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function activateWelcome(push = true) {
  document.body.classList.remove('lesson-active');
  lessonView.hidden = true;
  libraryView.hidden = true;
  welcomeView.hidden = false;
  document.querySelectorAll('.nav-lesson-row').forEach((row) => {
    row.querySelector('.nav-title').classList.remove('active');
    row.querySelector('.nav-title').setAttribute('aria-expanded', 'false');
    row.querySelector('.nav-subtabs').hidden = true;
    row.querySelectorAll('.nav-subtab').forEach((link) => link.classList.remove('active'));
  });
  if (push && location.hash !== '#home') history.pushState(null, '', '#home');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

Object.entries(lessonGroups).forEach(([group, titles]) => {
  const container = document.querySelector(`[data-items="${group}"]`);
  titles.forEach((title, index) => {
    const row = document.createElement('div');
    row.className = 'nav-lesson-row';
    row.dataset.lesson = title;
    const panelId = `lesson-modes-${group}-${index}`;
    row.innerHTML = `<button class="nav-title" type="button" aria-expanded="false" aria-controls="${panelId}"><span>${title}</span><span class="lesson-chevron" aria-hidden="true">⌄</span></button><div class="nav-subtabs" id="${panelId}" hidden><a class="nav-subtab" href="${lessonHash(title, 'study')}" data-mode="study" data-lesson="${title}">Study</a><a class="nav-subtab" href="${lessonHash(title, 'practice')}" data-mode="practice" data-lesson="${title}">Practice</a></div>`;
    row.querySelector('.nav-title').addEventListener('click', () => {
      const expanded = row.querySelector('.nav-title').getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.nav-lesson-row').forEach((other) => {
        other.querySelector('.nav-title').setAttribute('aria-expanded', 'false');
        other.querySelector('.nav-title').classList.remove('active');
        other.querySelector('.nav-subtabs').hidden = true;
      });
      if (!expanded) {
        row.querySelector('.nav-title').setAttribute('aria-expanded', 'true');
        row.querySelector('.nav-title').classList.add('active');
        row.querySelector('.nav-subtabs').hidden = false;
      }
    });
    row.querySelectorAll('.nav-subtab').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      openLesson(title, link.dataset.mode);
    }));
    container.append(row);
  });
});
document.querySelectorAll('.group-heading').forEach((button) => button.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  document.querySelector(`[data-items="${button.dataset.group}"]`).classList.toggle('collapsed', expanded);
}));
document.querySelectorAll('[data-reference]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); renderLibrary(link.dataset.reference); }));
document.querySelectorAll('.mode-button').forEach((button) => button.addEventListener('click', () => openLesson(selectedLesson, button.dataset.mode)));
document.querySelector('[data-open-lesson]').addEventListener('click', (event) => { event.preventDefault(); openLesson(selectedLesson, 'study'); });
document.querySelector('[data-open-home]').addEventListener('click', (event) => { event.preventDefault(); activateWelcome(); });
document.querySelectorAll('.breadcrumbs a').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); activateWelcome(); }));
document.querySelectorAll('.lesson-tab').forEach((tab) => tab.addEventListener('click', () => {
  document.getElementById(tab.dataset.tab)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setActiveTab(tab.dataset.tab);
}));

function syncFromUrl() {
  const hash = location.hash.slice(1);
  if (hash.startsWith('lesson/')) {
    const [, name, mode = 'study'] = hash.split('/');
    openLesson(titleFromSlug(name) ?? 'Present Simple', mode === 'practice' ? 'practice' : 'study', false);
  } else if (hash === 'verbs' || hash === 'sentences') renderLibrary(hash, false);
  else activateWelcome(false);
}
window.addEventListener('popstate', syncFromUrl);
window.addEventListener('hashchange', syncFromUrl);
syncFromUrl();
