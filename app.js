const lessons = {
  present: ['Present Simple', 'Present Continuous', 'Present Perfect', 'Present Perfect Continuous'],
  past: ['Past Simple', 'Past Continuous', 'Past Perfect', 'Past Perfect Continuous'],
  future: ['Future Simple', 'Future Continuous', 'Future Perfect', 'Future Perfect Continuous'],
};

const navTargets = document.querySelectorAll('[data-items]');

navTargets.forEach((container) => {
  lessons[container.dataset.items].forEach((title, index) => {
    const ready = container.dataset.items === 'present' && index === 0;
    const link = document.createElement('a');
    link.className = `nav-item${ready ? ' active' : ''}`;
    link.href = ready ? '#lesson' : '#lesson';
    link.setAttribute('aria-current', ready ? 'page' : 'false');
    link.innerHTML = `${title}${ready ? '<span class="nav-status">START HERE</span>' : '<span class="nav-status">SOON</span>'}`;
    if (ready) {
      link.dataset.openLesson = '';
    } else {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const message = document.getElementById('lesson-notice');
        message.textContent = `${title} is on its way. Start with the Present Simple lesson while we prepare it.`;
        message.hidden = false;
        window.setTimeout(() => { message.hidden = true; }, 3200);
      });
      link.title = `${title} — coming soon`;
      link.setAttribute('aria-label', `${title}, coming soon`);
    }
    container.append(link);
  });
});

const notice = document.createElement('div');
notice.id = 'lesson-notice';
notice.className = 'lesson-notice';
notice.setAttribute('role', 'status');
notice.hidden = true;
document.body.append(notice);

const welcomeView = document.querySelector('.welcome-view');
const lessonView = document.querySelector('.lesson-view');
const activateLesson = () => {
  document.body.classList.add('lesson-active');
  welcomeView.hidden = true;
  lessonView.hidden = false;
  if (location.hash !== '#lesson') history.pushState(null, '', '#lesson');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
const activateWelcome = () => {
  document.body.classList.remove('lesson-active');
  lessonView.hidden = true;
  welcomeView.hidden = false;
  if (location.hash !== '#home') history.pushState(null, '', '#home');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

document.querySelectorAll('[data-open-lesson]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    activateLesson();
  });
});

document.querySelector('[data-open-home]').addEventListener('click', (event) => {
  event.preventDefault();
  activateWelcome();
});

document.querySelectorAll('.breadcrumbs a, .welcome-return').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    activateWelcome();
  });
});

document.querySelectorAll('.group-heading').forEach((button) => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    document.querySelector(`[data-items="${button.dataset.group}"]`).classList.toggle('collapsed', expanded);
  });
});

const tabs = [...document.querySelectorAll('.lesson-tab')];
const sections = [...document.querySelectorAll('[data-section]')];
function setActiveTab(id) {
  tabs.forEach((tab) => {
    const active = tab.dataset.tab === id;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('.aside-link').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
  });
}
tabs.forEach((tab) => tab.addEventListener('click', () => {
  document.getElementById(tab.dataset.tab).scrollIntoView({ behavior: 'smooth', block: 'start' });
  setActiveTab(tab.dataset.tab);
}));
document.querySelectorAll('.aside-link').forEach((link) => link.addEventListener('click', () => setActiveTab(link.hash.slice(1))));
document.querySelector('[data-back-top]').addEventListener('click', () => {
  document.querySelector('.lesson-heading').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveTab(visible.target.dataset.section);
  }, { rootMargin: '-13% 0px -68% 0px', threshold: [0, 0.12, 0.3] });
  sections.forEach((section) => observer.observe(section));
}

function syncPageToHash() {
  const showLesson = location.hash === '#lesson';
  document.body.classList.toggle('lesson-active', showLesson);
  lessonView.hidden = !showLesson;
  welcomeView.hidden = showLesson;
}
window.addEventListener('popstate', syncPageToHash);
window.addEventListener('hashchange', syncPageToHash);
syncPageToHash();
