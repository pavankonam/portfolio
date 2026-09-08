// Unit-level lifecycle tests; browser QA covers the actual appearance.
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(join(__dirname, '..', 'universe.js'), 'utf8');

function mount(reduce = false) {
  let draws = 0, nextId = 0;
  const queue = new Map();
  const events = {};
  const nodes = {};
  let intersection;
  const context = new Proxy({}, { get: (_, key) => {
    if (key === 'fillRect') return () => { draws++; };
    if (key === 'createRadialGradient') return () => ({ addColorStop() {} });
    return () => {};
  }, set: () => true });
  const preference = { matches: reduce, addEventListener: (_, callback) => { events.preference = callback; } };
  const toggle = {
    hidden: true, attributes: {},
    setAttribute(key, value) { this.attributes[key] = value; },
    querySelector(key) { return nodes[key] ||= {}; },
    addEventListener: (_, callback) => { events.toggle = callback; }
  };
  const hero = {
    getBoundingClientRect: () => ({ width: 1200, height: 820, left: 0, top: 0 }),
    addEventListener() {}
  };
  const document = {
    hidden: false,
    body: { classList: { toggle() {} } },
    querySelector: selector => ({ '#universe': { getContext: () => context }, '.hero': hero, '#motion-toggle': toggle })[selector],
    addEventListener: (_, callback) => { events.visibility = callback; }
  };
  runInNewContext(source, {
    document,
    window: { matchMedia: () => preference, devicePixelRatio: 2 },
    requestAnimationFrame: callback => { queue.set(++nextId, callback); return nextId; },
    cancelAnimationFrame: id => queue.delete(id),
    IntersectionObserver: class { constructor(callback) { intersection = callback; } observe() {} },
    ResizeObserver: class { observe() {} }
  });
  return {
    document, preference, toggle, events, queue,
    get draws() { return draws; },
    visible(value) { intersection([{ isIntersecting: value }]); },
    tick(timestamp) {
      const callbacks = [...queue.values()];
      queue.clear();
      callbacks.forEach(callback => callback(timestamp));
    }
  };
}

const normal = mount();
assert.equal(normal.toggle.hidden, false, 'Motion control is available');
assert.equal(normal.queue.size, 1, 'Starts one animation loop');
normal.tick(40);
const afterFrame = normal.draws;
normal.tick(45);
assert.equal(normal.draws, afterFrame, 'Does not render above the frame cap');
normal.events.toggle();
assert.equal(normal.queue.size, 0, 'Pause cancels rendering');
assert.equal(normal.toggle.attributes['aria-pressed'], 'true', 'Pause exposed accessibly');
normal.tick(200);
assert.equal(normal.draws, afterFrame, 'Paused artwork remains static');
normal.events.toggle();
assert.equal(normal.queue.size, 1, 'Resume restarts one loop');
normal.visible(false);
assert.equal(normal.queue.size, 0, 'Offscreen artwork stops');
normal.visible(true);
assert.equal(normal.queue.size, 1, 'Visible artwork resumes');
normal.document.hidden = true;
normal.events.visibility();
assert.equal(normal.queue.size, 0, 'Background tab stops');
normal.document.hidden = false;
normal.events.visibility();
assert.equal(normal.queue.size, 1, 'Foreground tab resumes');
normal.preference.matches = true;
normal.events.preference();
assert.equal(normal.queue.size, 0, 'Live reduced-motion preference stops animation');
const reduced = mount(true);
assert.ok(reduced.draws > 0, 'Reduced motion still renders the static artwork');
assert.equal(reduced.queue.size, 0, 'Reduced motion never starts a loop');
assert.equal(reduced.toggle.attributes['aria-pressed'], 'true');
console.log('PASS: pause/resume, frame cap, viewport visibility, background tabs and reduced motion');
