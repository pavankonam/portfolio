'use strict';

(() => {
  const brain = window.PikoBrain;
  if (!brain) return;

  const poseSources = {
    wave: 'guide/piko-wave.png',
    point: 'guide/piko-point.png',
    think: 'guide/piko-think.png',
    happy: 'guide/piko-celebrate.png',
    travel: 'guide/piko-fly.png'
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const speechInput = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recordedVoice = 'guide/voice/hello.mp3';
  const marinVoices = {
    hello: recordedVoice,
    piko: recordedVoice,
    about: 'guide/voice/contexts/about.mp3',
    current: 'guide/voice/contexts/ruvaah.mp3',
    ruvaah: 'guide/voice/contexts/ruvaah.mp3',
    intellicore: 'guide/voice/contexts/intellicore.mp3',
    visionary: 'guide/voice/contexts/visionary.mp3',
    projects: 'guide/voice/intents/projects.mp3',
    healthcare: 'guide/voice/intents/healthcare.mp3',
    nlp: 'guide/voice/intents/nlp.mp3',
    hautecarat: 'guide/voice/contexts/hautecarat.mp3'
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
    <section class="piko-panel" role="dialog" aria-modal="false" aria-label="Ask Piko about Pavan">
      <div class="piko-panel-head">
        <div class="piko-title"><span class="piko-title-mark">pk·</span><span><strong>Piko</strong><small>Pavan's cosmic co-pilot</small></span></div>
        <div class="piko-tools">
          <button class="piko-icon piko-sound" type="button" aria-label="Replay Piko's introduction" title="Replay introduction">♬</button>
          <button class="piko-icon piko-close" type="button" aria-label="Close Piko">×</button>
        </div>
      </div>
      <div class="piko-answer" aria-live="polite"><p>Ask about Pavan.</p><div class="piko-actions"></div></div>
      <form class="piko-form">
        <input class="piko-input" type="text" autocomplete="off" maxlength="180" placeholder="Ask about Pavan…" aria-label="Question for Piko">
        <button class="piko-mic" type="button" aria-label="Ask with your voice">●</button>
        <button class="piko-send" type="submit" aria-label="Send question">↗</button>
      </form>
      <p class="piko-status" aria-live="polite">AI-generated voice · Marin</p>
    </section>
    <button class="piko-character" type="button" data-pose="wave" aria-label="Piko, Pavan's portfolio guide. Open assistant.">
      <img src="guide/piko-wave.png" alt="" width="601" height="640">
    </button>`;
  document.body.append(shell);

  const panel = shell.querySelector('.piko-panel');
  const character = shell.querySelector('.piko-character');
  const characterImage = character.querySelector('img');
  const answer = shell.querySelector('.piko-answer p');
  const actions = shell.querySelector('.piko-actions');
  const form = shell.querySelector('.piko-form');
  const input = shell.querySelector('.piko-input');
  const mic = shell.querySelector('.piko-mic');
  const sound = shell.querySelector('.piko-sound');
  const status = shell.querySelector('.piko-status');
  let open = false;
  let recognition = null;
  let sleepTimer = 0;
  let poseTimer = 0;
  let roamTimer = 0;
  let currentSection = 'top';
  let travelling = false;
  let voiceAudio = null;
  let speakingUtterance = null;
  let introductionPlayed = false;
  panel.hidden = true;

  Object.values(poseSources).forEach(source => { const image = new Image(); image.src = source; });

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function moveCharacter(left, top) {
    character.style.setProperty('--piko-left', `${Math.round(left)}px`);
    character.style.setProperty('--piko-top', `${Math.round(top)}px`);
  }

  function homeCharacter() {
    const width = window.innerWidth < 760 ? 104 : 172;
    const height = window.innerWidth < 760 ? 111 : 182;
    moveCharacter(window.innerWidth - width - (window.innerWidth < 760 ? 7 : 30), window.innerHeight - height - (window.innerWidth < 760 ? 6 : 16));
    character.classList.remove('is-docked');
  }

  function dockNear(target) {
    if (!target || window.innerWidth < 760) { homeCharacter(); return; }
    const rect = target.getBoundingClientRect();
    const width = 150;
    const height = 160;
    if (/^H[1-3]$/.test(target.tagName)) {
      moveCharacter(clamp(rect.right + 18, 18, window.innerWidth - width - 18), clamp(rect.top - 28, 88, window.innerHeight - height - 20));
      character.classList.add('is-docked');
      return;
    }
    if (rect.width > window.innerWidth * .65) {
      moveCharacter(clamp(rect.right - width - 8, 18, window.innerWidth - width - 18), clamp(rect.top + 24, 88, window.innerHeight - height - 20));
      character.classList.add('is-docked');
      return;
    }
    const targetCenter = rect.left + rect.width / 2;
    const left = targetCenter < window.innerWidth / 2
      ? clamp(rect.right - 42, 18, window.innerWidth - width - 18)
      : clamp(rect.left - width + 42, 18, window.innerWidth - width - 18);
    const top = clamp(rect.top + Math.min(46, rect.height * .2), 88, window.innerHeight - height - 20);
    moveCharacter(left, top);
    character.classList.add('is-docked');
  }

  function resetSleep() {
    clearTimeout(sleepTimer);
    character.classList.remove('is-asleep');
    sleepTimer = setTimeout(() => {
      if (!open) character.classList.add('is-asleep');
    }, 45000);
  }

  function setPose(pose = 'wave', resetAfter = 5200) {
    clearTimeout(poseTimer);
    character.dataset.pose = pose;
    const nextSource = poseSources[pose] || poseSources.wave;
    if (!characterImage.src.endsWith(nextSource)) {
      characterImage.classList.add('is-changing');
      setTimeout(() => {
        characterImage.src = nextSource;
        characterImage.classList.remove('is-changing');
      }, 90);
    }
    if (resetAfter) poseTimer = setTimeout(() => setPose('wave', 0), resetAfter);
  }

  function travelTo(target, finalPose = 'point') {
    if (!target) return;
    travelling = true;
    character.classList.add('is-travelling');
    setPose('travel', 0);
    const delay = reducedMotion.matches ? 0 : 780;
    setTimeout(() => {
      dockNear(target);
      setTimeout(() => {
        travelling = false;
        character.classList.remove('is-travelling');
        setPose(finalPose);
      }, reducedMotion.matches ? 0 : 820);
    }, delay);
  }

  function setOpen(next, focus = true) {
    open = next;
    launch.setAttribute('aria-expanded', String(open));
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(() => panel.classList.add('is-open'));
      character.classList.remove('is-asleep');
      homeCharacter();
      setPose('wave');
      if (focus) setTimeout(() => input.focus({ preventScroll: true }), 100);
    } else {
      panel.classList.remove('is-open');
      setTimeout(() => { if (!open) panel.hidden = true; }, reducedMotion.matches ? 100 : 240);
    }
    resetSleep();
  }

  function playIntroduction() {
    if (introductionPlayed && voiceAudio && !voiceAudio.paused) return;
    if (voiceAudio) { voiceAudio.pause(); voiceAudio.currentTime = 0; }
    voiceAudio = new Audio(recordedVoice);
    sound.textContent = '◖))';
    voiceAudio.addEventListener('ended', () => { sound.textContent = '♬'; }, { once: true });
    const playback = voiceAudio.play();
    playback.then(() => { introductionPlayed = true; }).catch(() => {
      sound.textContent = '♬';
      introductionPlayed = false;
    });
    return playback;
  }

  function stopSpeaking() {
    if (voiceAudio) {
      voiceAudio.pause();
      voiceAudio.currentTime = 0;
      voiceAudio = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    speakingUtterance = null;
    character.classList.remove('is-speaking');
    sound.textContent = '♬';
  }

  function preferredSystemVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices().filter(voice => /^en[-_]/i.test(voice.lang));
    const preferred = [
      /Microsoft Aria.*Online/i,
      /Google US English/i,
      /Samantha.*Premium/i,
      /Ava.*Premium/i,
      /Zoe.*Premium/i,
      /Samantha/i,
      /Ava/i,
      /Zoe/i,
      /Allison/i,
      /Alex/i
    ];
    for (const pattern of preferred) {
      const match = voices.find(voice => pattern.test(voice.name));
      if (match) return match;
    }
    return voices.find(voice => voice.localService) || voices[0] || null;
  }

  function speak(text, voiceId = '') {
    stopSpeaking();
    const source = marinVoices[voiceId];
    character.classList.add('is-speaking');
    sound.textContent = '◖))';
    if (source) {
      voiceAudio = new Audio(source);
      voiceAudio.addEventListener('ended', stopSpeaking, { once: true });
      voiceAudio.addEventListener('error', () => speak(text), { once: true });
      voiceAudio.play().catch(() => {
        character.classList.remove('is-speaking');
        sound.textContent = '♬';
      });
      return;
    }
    if (!('speechSynthesis' in window)) {
      stopSpeaking();
      return;
    }
    speakingUtterance = new SpeechSynthesisUtterance(text);
    speakingUtterance.voice = preferredSystemVoice();
    speakingUtterance.lang = 'en-US';
    speakingUtterance.rate = 1.04;
    speakingUtterance.pitch = 1.02;
    speakingUtterance.onend = stopSpeaking;
    speakingUtterance.onerror = stopSpeaking;
    window.speechSynthesis.speak(speakingUtterance);
  }

  function shorten(value, limit = 88) {
    const clean = String(value || '').replace(/\s+/g, ' ').trim().replace(/\.$/, '');
    if (clean.length <= limit) return clean;
    return `${clean.slice(0, limit).replace(/\s+\S*$/, '')}…`;
  }

  function contextFor(target) {
    if (target.matches('.case-study')) {
      const title = target.querySelector('h3')?.textContent.trim();
      if (title === 'Intellicore') return { text: 'Intellicore — an enterprise RAG and multi-agent platform Pavan built at HauteCarat in 2025.', voice: 'intellicore' };
      if (title === 'Visionary') return { text: 'Visionary — a generative vision pipeline Pavan built at HauteCarat in 2025 for on-model jewelry imagery.', voice: 'visionary' };
    }
    if (target.matches('.research-card')) {
      const title = target.querySelector('h3')?.textContent.split('—')[0].trim() || 'This project';
      const summary = target.querySelector(':scope > p:not(.meta)')?.textContent;
      const meta = target.querySelector(':scope > .meta')?.textContent || '';
      const date = meta.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}\s*[–-]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) )?\d{4}/)?.[0];
      return { text: `${shorten(title, 42)} — ${shorten(summary, 78)}${date ? ` · ${date}` : ''}.`, voice: '' };
    }
    if (target.matches('.experience-highlights article, .role')) {
      const title = target.querySelector('h3')?.textContent.trim() || 'Professional experience';
      const date = target.querySelector('.meta')?.textContent.split('·')[0].trim();
      const role = target.matches('.experience-highlights article') ? target.querySelector('h3 + p')?.textContent.trim() : '';
      const key = /ruvaah|founding engineer/i.test(title) ? 'ruvaah' : /hautecarat|ai software engineer/i.test(title) ? 'hautecarat' : '';
      return { text: `${shorten(title, 66)}${role ? ` — ${role}` : ''}${date ? ` · ${date}` : ''}.`, voice: key };
    }
    if (target.matches('.about-brief')) return { text: 'Pavan is an AI engineer and educator building production systems across RAG, vision and healthcare.', voice: 'about' };
    if (target.matches('a')) {
      if (target.matches('[download]')) return { text: 'Résumé — download Pavan’s current AI engineering experience and project background.', voice: '' };
      if (/linkedin/i.test(target.textContent)) return { text: 'LinkedIn — see Pavan’s professional experience, updates and network.', voice: '' };
      if (/github/i.test(target.textContent)) return { text: 'GitHub — explore Pavan’s public code and project repositories.', voice: '' };
      if (/mailto:/.test(target.href)) return { text: 'Email — the quickest way to start a professional conversation with Pavan.', voice: '' };
    }
    return null;
  }

  function introduceTarget(target) {
    if (open) return;
    const context = contextFor(target);
    if (!context) return;
    clearTimeout(roamTimer);
    travelling = false;
    character.classList.remove('is-travelling');
    dockNear(target);
    setPose(target.matches('.about-brief') ? 'happy' : 'point');
    // Hover guidance is spoken, not duplicated in a large transcript bubble.
    speak(context.text, context.voice);
    resetSleep();
  }

  const contextualTargets = document.querySelectorAll('.case-study, .research-card, .experience-highlights article, .role, #about .about-brief, #contact a');
  contextualTargets.forEach(target => {
    target.addEventListener('pointerenter', () => introduceTarget(target), { passive: true });
    target.addEventListener('focusin', () => introduceTarget(target));
  });

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

  function visit(targetOrSelector, pose = 'point') {
    const target = typeof targetOrSelector === 'string' ? document.querySelector(targetOrSelector) : targetOrSelector;
    if (!target) return;
    openAncestors(target);
    const destination = target.matches('section') ? target.querySelector('h2') || target : target;
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: target.matches('section') ? 'start' : 'center' });
    travelTo(destination, pose);
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
    const topicNames = {
      hello: 'Piko', piko: 'Piko', about: 'Pavan', current: 'Pavan’s current work',
      ruvaah: 'RUVAAH', intellicore: 'Intellicore', visionary: 'Visionary', projects: 'Pavan’s projects',
      healthcare: 'healthcare AI', nlp: 'language AI', vision: 'computer vision', experience: 'Pavan’s experience',
      hautecarat: 'HauteCarat', cognizant: 'Cognizant', teaching: 'teaching', skills: 'Pavan’s toolkit',
      education: 'education', leadership: 'leadership', location: 'location', contact: 'contact options',
      resume: 'the résumé', github: 'GitHub', linkedin: 'LinkedIn', tour: 'the portfolio tour'
    };
    answer.textContent = intent.id === 'fallback'
      ? 'Try asking about a project or role.'
      : `Speaking about ${topicNames[intent.id] || 'that'}…`;
    renderLinks(intent.links);
    addSpecialActions(intent);
    const target = intentTarget(intent);
    if (target) visit(target, intent.pose);
    else setPose(intent.pose);
    status.textContent = intent.id === 'fallback'
      ? 'Try a suggested topic · AI-generated voice'
      : `AI-generated voice · ${marinVoices[intent.id] ? 'Marin' : 'system fallback'}`;
    speak(intent.answer, intent.id);
    resetSleep();
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
  sound.addEventListener('click', () => speak(brain.intro, 'hello'));
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
  window.addEventListener('resize', homeCharacter, { passive: true });

  // Piko changes stations as the visitor moves through the portfolio instead
  // of living permanently in one corner.
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const roamObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const sectionKey = visible?.target.matches('.hero') ? 'top' : visible?.target.id;
      if (!visible || sectionKey === currentSection) return;
      currentSection = sectionKey;
      clearTimeout(roamTimer);
      roamTimer = setTimeout(() => {
        if (open || travelling) return;
        if (currentSection === 'top' || currentSection === 'contact') homeCharacter();
        else travelTo(visible.target.querySelector('h2') || visible.target, currentSection === 'about' ? 'happy' : 'wave');
      }, 520);
    }, { threshold: [.3, .55] });
    ['.hero', '#projects', '#experience', '#about', '#contact'].forEach(selector => {
      const section = document.querySelector(selector);
      if (section) roamObserver.observe(section);
    });
  }

  // Browsers block audible autoplay before a visitor interacts. Try on arrival,
  // then play immediately after the first click, tap or key press anywhere.
  playIntroduction();
  const unlockIntroduction = () => {
    if (!introductionPlayed) playIntroduction();
  };
  document.addEventListener('pointerdown', unlockIntroduction, { once: true, capture: true });
  document.addEventListener('keydown', unlockIntroduction, { once: true, capture: true });
  setTimeout(() => setPose('wave'), reducedMotion.matches ? 250 : 800);
  homeCharacter();
  resetSleep();
})();
