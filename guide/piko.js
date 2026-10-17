'use strict';

(() => {
  const brain = window.PikoBrain;
  if (!brain) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const speechInput = window.SpeechRecognition || window.webkitSpeechRecognition;
  const store = {
    get(key) { try { return localStorage.getItem(`piko.${key}`); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(`piko.${key}`, value); } catch (_) {} }
  };

  const launch = document.createElement('button');
  launch.type = 'button';
  launch.className = 'piko-launch';
  launch.innerHTML = '<span class="piko-launch-star" aria-hidden="true">✦</span><span>Ask Piko</span>';
  launch.setAttribute('aria-haspopup', 'dialog');
  launch.setAttribute('aria-expanded', 'false');
  const navContact = document.querySelector('.nav-contact');
  if (navContact) navContact.before(launch);

  const shell = document.createElement('div');
  shell.className = 'piko-shell';
  shell.innerHTML = `
    <div class="piko-bubble" role="status" aria-live="polite"></div>
    <section class="piko-panel" role="dialog" aria-modal="false" aria-label="Ask Piko about Pavan">
      <div class="piko-panel-head">
        <div class="piko-title"><span class="piko-title-mark">pk·</span><span><strong>Piko</strong><small>Pavan's cosmic co-pilot</small></span></div>
        <div class="piko-tools">
          <button class="piko-icon piko-sound" type="button" aria-label="Turn Piko's voice on">♬</button>
          <button class="piko-icon piko-close" type="button" aria-label="Close Piko">×</button>
        </div>
      </div>
      <div class="piko-answer" aria-live="polite"><p>${brain.intro}</p><div class="piko-actions"></div></div>
      <div class="piko-chips" aria-label="Suggested questions"></div>
      <form class="piko-form">
        <input class="piko-input" type="text" autocomplete="off" maxlength="180" placeholder="Ask about Pavan…" aria-label="Question for Piko">
        <button class="piko-mic" type="button" aria-label="Ask with your voice">●</button>
        <button class="piko-send" type="submit" aria-label="Send question">↗</button>
      </form>
      <p class="piko-status" aria-live="polite"></p>
    </section>
    <button class="piko-character" type="button" data-pose="wave" aria-label="Piko, Pavan's portfolio guide. Open assistant.">
      <img src="guide/piko-wave.png" alt="" width="601" height="640">
    </button>`;
  document.body.append(shell);

  const panel = shell.querySelector('.piko-panel');
  const character = shell.querySelector('.piko-character');
  const bubble = shell.querySelector('.piko-bubble');
  const answer = shell.querySelector('.piko-answer p');
  const actions = shell.querySelector('.piko-actions');
  const chips = shell.querySelector('.piko-chips');
  const form = shell.querySelector('.piko-form');
  const input = shell.querySelector('.piko-input');
  const mic = shell.querySelector('.piko-mic');
  const sound = shell.querySelector('.piko-sound');
  const status = shell.querySelector('.piko-status');
  let open = false;
  let muted = store.get('muted') !== '0';
  let recognition = null;
  let sleepTimer = 0;
  let bubbleTimer = 0;
  let poseTimer = 0;
  panel.hidden = true;

  function resetSleep() {
    clearTimeout(sleepTimer);
    character.classList.remove('is-asleep');
    sleepTimer = setTimeout(() => {
      if (!open) character.classList.add('is-asleep');
    }, 45000);
  }

  function setPose(pose = 'wave') {
    clearTimeout(poseTimer);
    character.dataset.pose = pose;
    poseTimer = setTimeout(() => { character.dataset.pose = 'wave'; }, 2600);
  }

  function showBubble(text, duration = 6500) {
    clearTimeout(bubbleTimer);
    bubble.textContent = text;
    bubble.classList.add('is-visible');
    bubbleTimer = setTimeout(() => bubble.classList.remove('is-visible'), duration);
  }

  function setOpen(next, focus = true) {
    open = next;
    launch.setAttribute('aria-expanded', String(open));
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('is-open'));
      character.classList.remove('is-asleep');
      bubble.classList.remove('is-visible');
      if (focus) setTimeout(() => input.focus({ preventScroll: true }), 100);
    } else {
      panel.classList.remove('is-open');
      setTimeout(() => { if (!open) panel.hidden = true; }, reducedMotion.matches ? 100 : 240);
    }
    resetSleep();
  }

  function speak(text) {
    if (muted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.03;
    utterance.pitch = 1.12;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(voice => /Samantha|Ava|Google US English/i.test(voice.name)) || voices.find(voice => voice.lang === 'en-US') || null;
    window.speechSynthesis.speak(utterance);
  }

  function renderLinks(keys = []) {
    actions.innerHTML = '';
    keys.forEach(key => {
      const item = brain.links[key];
      if (!item) return;
      const link = document.createElement('a');
      link.href = item.href;
      link.innerHTML = `<span aria-hidden="true">${item.icon}</span> ${item.label}`;
      if (item.download) link.download = '';
      else if (/^https?:/.test(item.href)) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      actions.append(link);
    });
  }

  function openAncestors(target) {
    let node = target;
    while (node && node !== document.body) {
      if (node.tagName === 'DETAILS') node.open = true;
      node = node.parentElement;
    }
    if (target.tagName === 'DETAILS') target.open = true;
    target.querySelectorAll(':scope > details').forEach(detail => { detail.open = true; });
  }

  function visit(targetOrSelector) {
    const target = typeof targetOrSelector === 'string' ? document.querySelector(targetOrSelector) : targetOrSelector;
    if (!target) return;
    openAncestors(target);
    character.classList.remove('is-travelling');
    void character.offsetWidth;
    character.classList.add('is-travelling');
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
    document.querySelectorAll('.piko-highlight').forEach(node => node.classList.remove('piko-highlight'));
    setTimeout(() => {
      target.classList.add('piko-highlight');
      setTimeout(() => target.classList.remove('piko-highlight'), 4800);
    }, reducedMotion.matches ? 0 : 650);
  }

  function findCard(sectionSelector, headingText) {
    const section = document.querySelector(sectionSelector);
    if (!section) return null;
    const heading = Array.from(section.querySelectorAll('h3')).find(node => node.textContent.toLowerCase().includes(headingText));
    return heading ? heading.closest('article') || heading : section;
  }

  function intentTarget(intent) {
    const preciseTargets = {
      ruvaah: () => findCard('#experience', 'founding engineer'),
      current: () => findCard('#experience', 'founding engineer'),
      intellicore: () => findCard('#projects', 'intellicore'),
      visionary: () => findCard('#projects', 'visionary'),
      hautecarat: () => findCard('#experience', 'ai software engineer'),
      cognizant: () => findCard('#experience', 'programming analyst'),
      teaching: () => findCard('#experience', 'professor'),
      healthcare: () => document.querySelector('#projects .project-library'),
      nlp: () => document.querySelector('#projects .project-library'),
      vision: () => document.querySelector('#projects .project-library')
    };
    return preciseTargets[intent.id]?.() || (intent.target ? document.querySelector(intent.target) : null);
  }

  function addSpecialActions(intent) {
    if (!intent.actions) return;
    intent.actions.forEach(kind => {
      if (kind === 'research') {
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = 'Open all projects';
        button.addEventListener('click', () => visit('#projects .project-library'));
        actions.append(button);
      }
      if (kind === 'tour') {
        ['projects', 'experience', 'about', 'contact'].forEach(id => {
          const button = document.createElement('button');
          button.type = 'button'; button.textContent = id[0].toUpperCase() + id.slice(1);
          button.addEventListener('click', () => visit(`#${id}`));
          actions.append(button);
        });
      }
    });
  }

  function respond(question) {
    const intent = brain.match(question);
    answer.textContent = intent.answer;
    renderLinks(intent.links);
    addSpecialActions(intent);
    setPose(intent.pose);
    const target = intentTarget(intent);
    if (target) visit(target);
    speak(intent.answer);
    status.textContent = intent.id === 'fallback' ? 'Try one of the suggested topics below.' : '';
    resetSleep();
  }

  brain.chips.forEach(question => {
    const chip = document.createElement('button');
    chip.type = 'button'; chip.className = 'piko-chip'; chip.textContent = question;
    chip.addEventListener('click', () => respond(question));
    chips.append(chip);
  });

  function toggleSound() {
    muted = !muted;
    store.set('muted', muted ? '1' : '0');
    sound.textContent = muted ? '♬' : '◖))';
    sound.setAttribute('aria-label', muted ? "Turn Piko's voice on" : "Turn Piko's voice off");
    if (muted && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    else if (!muted) speak("Voice on. I'm ready!");
  }

  function toggleMic() {
    if (!speechInput) return;
    if (recognition) { recognition.stop(); return; }
    recognition = new speechInput();
    recognition.lang = 'en-US'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    status.textContent = 'Listening…'; mic.classList.add('is-listening');
    recognition.onresult = event => {
      const question = event.results[0][0].transcript;
      input.value = question;
      respond(question);
    };
    recognition.onerror = event => {
      status.textContent = event.error === 'not-allowed' ? 'Microphone blocked — you can type instead.' : "I couldn't hear that. Please try again.";
    };
    recognition.onend = () => { recognition = null; mic.classList.remove('is-listening'); if (status.textContent === 'Listening…') status.textContent = ''; };
    try { recognition.start(); } catch (_) { recognition = null; mic.classList.remove('is-listening'); }
  }

  launch.addEventListener('click', () => setOpen(!open));
  character.addEventListener('click', () => setOpen(!open));
  shell.querySelector('.piko-close').addEventListener('click', () => setOpen(false, false));
  sound.addEventListener('click', toggleSound);
  mic.addEventListener('click', toggleMic);
  if (!speechInput) mic.hidden = true;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    input.value = '';
    respond(question);
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && open) setOpen(false, false); });
  document.addEventListener('pointerdown', resetSleep, { passive: true });
  document.addEventListener('scroll', resetSleep, { passive: true });

  // First visit gets a quiet visual introduction. Returning visitors are not interrupted.
  if (store.get('met') !== '1') {
    setTimeout(() => {
      showBubble(brain.intro, 8500);
      setPose('wave');
      store.set('met', '1');
    }, reducedMotion.matches ? 250 : 1200);
  }
  resetSleep();
})();
