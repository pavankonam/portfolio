const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const assert = require('node:assert/strict');

const source = readFileSync(join(__dirname, '..', 'guide', 'brain.js'), 'utf8');
const context = { window: {} };
runInNewContext(source, context);

const brain = context.window.PikoBrain;
assert.ok(brain, 'Piko knowledge base is exposed');

const examples = [
  ['Who is Pavan?', 'about'],
  ["What's RUVAAH?", 'ruvaah'],
  ['Show me the Intellicore project', 'intellicore'],
  ['Tell me about his teaching', 'teaching'],
  ['Does he have healthcare AI experience?', 'healthcare'],
  ['Can I download his resume?', 'resume'],
  ['How do I contact Pavan?', 'contact'],
  ['What is the weather?', 'unrelated'],
  ['quantum banana telescope', 'fallback']
];

examples.forEach(([question, expected]) => {
  assert.equal(brain.match(question).id, expected, `Expected "${question}" to match ${expected}`);
});

assert.ok(brain.intents.length >= 20, 'Piko covers the major portfolio topics');
assert.ok(brain.chips.length >= 4, 'Piko provides starter questions');
['wave', 'point', 'think', 'fly', 'celebrate'].forEach(pose => {
  assert.ok(existsSync(join(__dirname, '..', 'guide', `piko-${pose}.png`)), `Piko ${pose} pose exists`);
});
assert.ok(existsSync(join(__dirname, '..', 'guide', 'voice', 'hello.mp3')), 'Selected Marin voice introduction exists');
assert.ok(existsSync(join(__dirname, '..', 'guide', 'piko-3d.js')), 'Piko 3D renderer exists');
assert.ok(existsSync(join(__dirname, '..', 'guide', 'vendor', 'three.module.js')), 'Local Three.js runtime exists');
assert.ok(existsSync(join(__dirname, '..', 'guide', 'vendor', 'three.core.js')), 'Local Three.js core exists');
console.log(`PASS: ${examples.length} Piko intents, fallback behavior and starter questions`);
