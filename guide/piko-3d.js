import * as THREE from './vendor/three.module.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function waitForCharacter() {
  const character = document.querySelector('.piko-character');
  if (character) initialisePiko3D(character);
  else requestAnimationFrame(waitForCharacter);
}

function initialisePiko3D(character) {
  if (!window.WebGLRenderingContext || character.querySelector('.piko-3d')) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'piko-3d';
  canvas.setAttribute('aria-hidden', 'true');
  character.append(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (_) {
    canvas.remove();
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.25 : 1.7));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  camera.position.set(0, .15, 10.5);

  scene.add(new THREE.AmbientLight(0xbfa9ff, 2.1));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a1c68, 4.2));
  const key = new THREE.DirectionalLight(0xffffff, 4.2);
  key.position.set(-3, 5, 7);
  scene.add(key);
  const rim = new THREE.PointLight(0xa46dff, 16, 16);
  rim.position.set(4, 2, 4);
  scene.add(rim);

  const purple = new THREE.MeshPhysicalMaterial({ color: 0x7d55ed, metalness: .14, roughness: .34, clearcoat: .8 });
  const purpleDark = new THREE.MeshPhysicalMaterial({ color: 0x362064, metalness: .22, roughness: .31, clearcoat: .75 });
  const lilac = new THREE.MeshPhysicalMaterial({ color: 0xb79aff, metalness: .12, roughness: .34, clearcoat: 1 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xffe5c7, roughness: .58 });
  const charcoal = new THREE.MeshStandardMaterial({ color: 0x120d1b, roughness: .35 });
  const amber = new THREE.MeshPhysicalMaterial({ color: 0xf4a928, emissive: 0xa14405, emissiveIntensity: .45, roughness: .25 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xd9caff, emissiveIntensity: .15, roughness: .35 });
  const glow = new THREE.MeshStandardMaterial({ color: 0xe8dfff, emissive: 0xa878ff, emissiveIntensity: 2 });
  const glassEdge = new THREE.MeshBasicMaterial({ color: 0xd9c8ff, transparent: true, opacity: .5, depthWrite: false });

  const root = new THREE.Group();
  root.rotation.x = -.06;
  scene.add(root);

  const model = new THREE.Group();
  model.position.y = -.2;
  root.add(model);

  function mesh(geometry, material, position, scale, parent = model) {
    const part = new THREE.Mesh(geometry, material);
    if (position) part.position.set(...position);
    if (scale) part.scale.set(...scale);
    parent.add(part);
    return part;
  }

  const body = mesh(new THREE.SphereGeometry(1, 32, 24), purple, [0, -.72, 0], [.82, .96, .68]);
  const belly = mesh(new THREE.SphereGeometry(1, 28, 20), lilac, [0, -.75, .59], [.48, .58, .1]);
  const collar = mesh(new THREE.TorusGeometry(.68, .12, 12, 40), glow, [0, -.04, .02], [1, .85, 1]);
  collar.rotation.x = Math.PI / 2;

  const head = new THREE.Group();
  head.position.set(0, .58, .04);
  model.add(head);
  mesh(new THREE.SphereGeometry(1, 36, 26), purple, [0, 0, 0], [1.02, .88, .84], head);

  function ear(side) {
    const group = new THREE.Group();
    group.position.set(side * .68, .67, -.02);
    group.rotation.z = side * -.2;
    head.add(group);
    const outer = mesh(new THREE.ConeGeometry(.43, .85, 4), purpleDark, [0, .2, 0], [1, 1, .7], group);
    outer.rotation.y = Math.PI / 4;
    const inner = mesh(new THREE.ConeGeometry(.24, .52, 4), lilac, [0, .2, .29], [1, 1, .42], group);
    inner.rotation.y = Math.PI / 4;
  }
  ear(-1); ear(1);

  const muzzle = mesh(new THREE.SphereGeometry(1, 24, 18), cream, [0, -.18, .73], [.55, .37, .19], head);
  const nose = mesh(new THREE.SphereGeometry(1, 20, 14), charcoal, [0, -.08, .94], [.12, .08, .07], head);
  const mouthLeft = mesh(new THREE.TorusGeometry(.13, .018, 6, 16, Math.PI), charcoal, [-.12, -.23, .91], [1, 1, .7], head);
  const mouthRight = mouthLeft.clone();
  mouthRight.position.x = .12;
  mouthRight.rotation.z = Math.PI;
  head.add(mouthRight);

  const eyes = [];
  [-1, 1].forEach(side => {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(side * .36, .14, .73);
    head.add(eyeGroup);
    mesh(new THREE.SphereGeometry(1, 24, 18), white, [0, 0, 0], [.27, .33, .12], eyeGroup);
    const pupil = mesh(new THREE.SphereGeometry(1, 20, 14), amber, [0, -.01, .115], [.13, .19, .07], eyeGroup);
    mesh(new THREE.SphereGeometry(1, 12, 8), white, [-.045, .07, .175], [.042, .052, .025], eyeGroup);
    eyes.push(pupil);
  });

  const helmetEdge = mesh(new THREE.TorusGeometry(1.18, .024, 8, 64), glassEdge, [0, .52, .08], [1, .9, 1]);
  helmetEdge.rotation.z = -.02;
  const helmetRing = mesh(new THREE.TorusGeometry(1.02, .055, 10, 48), glow, [0, -.07, .12], [1, .9, 1]);
  helmetRing.rotation.x = Math.PI / 2;

  const antenna = new THREE.Group();
  antenna.position.set(.58, 1.4, -.04);
  antenna.rotation.z = -.3;
  model.add(antenna);
  const antennaStem = mesh(new THREE.CylinderGeometry(.035, .045, .65, 10), lilac, [0, .28, 0], [1, 1, 1], antenna);
  antennaStem.rotation.z = -.08;
  const star = new THREE.Shape();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 ? .11 : .23;
    const angle = i * Math.PI / 5 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) star.moveTo(x, y); else star.lineTo(x, y);
  }
  star.closePath();
  const starMesh = mesh(new THREE.ExtrudeGeometry(star, { depth: .06, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 2 }), glow, [0, .66, 0], [.9, .9, .9], antenna);
  starMesh.position.z = -.03;

  const backpack = new THREE.Group();
  backpack.position.set(0, -.63, -.58);
  model.add(backpack);
  mesh(new THREE.BoxGeometry(1.05, 1.05, .45), purpleDark, [0, 0, 0], [1, 1, 1], backpack);
  [-1, 1].forEach(side => {
    mesh(new THREE.CylinderGeometry(.16, .2, .72, 14), lilac, [side * .48, -.05, -.08], [1, 1, 1], backpack);
  });
  const thrusters = [-1, 1].map(side => {
    const flame = mesh(new THREE.ConeGeometry(.14, .7, 12), glow, [side * .48, -.72, -.08], [1, 1, 1], backpack);
    flame.rotation.z = Math.PI;
    flame.visible = false;
    return flame;
  });

  function limb(side, y, isArm) {
    const group = new THREE.Group();
    group.position.set(side * (isArm ? .67 : .43), y, -.02);
    model.add(group);
    const length = isArm ? .72 : .62;
    const part = mesh(new THREE.CapsuleGeometry(.18, length, 6, 12), purple, [0, -length * .34, 0], [1, 1, 1], group);
    part.rotation.z = side * (isArm ? -.26 : -.1);
    const paw = mesh(new THREE.SphereGeometry(.27, 20, 14), cream, [side * .1, -length - .05, .04], [1, .82, .78], group);
    return { group, part, paw };
  }
  const leftArm = limb(-1, -.25, true);
  const rightArm = limb(1, -.25, true);
  const leftLeg = limb(-1, -1.32, false);
  const rightLeg = limb(1, -1.32, false);

  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(.58, -1.12, -.15), new THREE.Vector3(1.15, -1.12, -.12),
    new THREE.Vector3(1.38, -.72, .03), new THREE.Vector3(1.12, -.43, .11)
  ]);
  mesh(new THREE.TubeGeometry(tailCurve, 28, .105, 10, false), purple, null, null);

  const badge = new THREE.Group();
  badge.position.set(0, -.72, .72);
  badge.rotation.x = -.08;
  model.add(badge);
  mesh(new THREE.CylinderGeometry(.25, .25, .07, 32), glow, [0, 0, 0], [1, 1, 1], badge).rotation.x = Math.PI / 2;
  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = badgeCanvas.height = 128;
  const badgeContext = badgeCanvas.getContext('2d');
  badgeContext.fillStyle = '#f7f2ff';
  badgeContext.font = '700 48px system-ui';
  badgeContext.textAlign = 'center';
  badgeContext.textBaseline = 'middle';
  badgeContext.fillText('pk·', 64, 64);
  const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
  badgeTexture.colorSpace = THREE.SRGBColorSpace;
  const badgeFace = mesh(new THREE.CircleGeometry(.2, 32), new THREE.MeshBasicMaterial({ map: badgeTexture, transparent: true }), [0, 0, .045], [1, 1, 1], badge);
  badgeFace.rotation.x = 0;

  const thoughtOrbit = new THREE.Group();
  thoughtOrbit.position.set(.88, 1.05, .2);
  model.add(thoughtOrbit);
  [.08, .12, .17].forEach((radius, index) => {
    mesh(new THREE.SphereGeometry(radius, 12, 8), glow, [index * .2, index * .22, 0], [1, 1, 1], thoughtOrbit);
  });
  thoughtOrbit.visible = false;

  const original = {
    leftArm: leftArm.group.rotation.clone(), rightArm: rightArm.group.rotation.clone(),
    leftLeg: leftLeg.group.rotation.clone(), rightLeg: rightLeg.group.rotation.clone()
  };
  const pointer = new THREE.Vector2();
  let visible = true;
  let lastFrame = 0;
  let pose = character.dataset.pose || 'wave';

  function applyPose(time) {
    const t = time * .001;
    const breathe = reducedMotion.matches ? 0 : Math.sin(t * 2.15);
    root.position.y = breathe * .045;
    root.rotation.z = breathe * .012;
    head.rotation.set(pointer.y * .08, pointer.x * .12, 0);
    eyes.forEach(pupil => { pupil.position.x = pointer.x * .035; pupil.position.y = -.01 + pointer.y * .025; });
    leftArm.group.rotation.copy(original.leftArm);
    rightArm.group.rotation.copy(original.rightArm);
    leftLeg.group.rotation.copy(original.leftLeg);
    rightLeg.group.rotation.copy(original.rightLeg);
    model.rotation.set(0, 0, 0);
    model.position.set(0, -.2, 0);
    antenna.rotation.y = Math.sin(t * 3) * .08;

    thoughtOrbit.visible = pose === 'think';
    thrusters.forEach((flame, index) => {
      flame.visible = pose === 'travel';
      flame.scale.y = .78 + Math.sin(t * 11 + index) * .22;
    });

    if (pose === 'point') {
      leftArm.group.rotation.z = -1.52 + Math.sin(t * 4) * .06;
      leftArm.group.rotation.y = -.42;
      head.rotation.z = -.08;
    } else if (pose === 'think') {
      rightArm.group.rotation.z = -2.28;
      rightArm.group.rotation.y = .35;
      head.rotation.z = .11;
      head.rotation.y += Math.sin(t * 1.3) * .08;
      thoughtOrbit.rotation.z = t * .65;
    } else if (pose === 'happy') {
      leftArm.group.rotation.z = -2.35 + Math.sin(t * 6) * .12;
      rightArm.group.rotation.z = 2.35 - Math.sin(t * 6) * .12;
      model.position.y = -.12 + Math.abs(Math.sin(t * 4.5)) * .14;
    } else if (pose === 'travel') {
      model.rotation.z = -.34;
      model.rotation.y = -.2;
      leftArm.group.rotation.z = 1.15;
      rightArm.group.rotation.z = -.8;
      leftLeg.group.rotation.z = -.34;
      rightLeg.group.rotation.z = .28;
    } else if (pose === 'sleep') {
      model.rotation.z = -.18;
      head.rotation.z = -.2;
      head.rotation.x = .18;
      model.position.y = -.32;
    } else {
      rightArm.group.rotation.z = 2.05 + Math.sin(t * 5.2) * .28;
      rightArm.group.rotation.y = .18;
    }
  }

  function resize() {
    const width = Math.max(character.clientWidth, 1);
    const height = Math.max(character.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render(time) {
    requestAnimationFrame(render);
    if (!visible || document.hidden || time - lastFrame < 32) return;
    lastFrame = time;
    applyPose(time);
    renderer.render(scene, camera);
  }

  const poseObserver = new MutationObserver(() => {
    pose = character.classList.contains('is-asleep') ? 'sleep' : (character.dataset.pose || 'wave');
  });
  poseObserver.observe(character, { attributes: true, attributeFilter: ['data-pose', 'class'] });
  const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; });
  visibilityObserver.observe(character);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(character);
  document.addEventListener('pointermove', event => {
    pointer.x = THREE.MathUtils.clamp((event.clientX / window.innerWidth - .5) * 1.1, -.5, .5);
    pointer.y = THREE.MathUtils.clamp((.5 - event.clientY / window.innerHeight) * .8, -.38, .38);
  }, { passive: true });
  renderer.domElement.addEventListener('webglcontextlost', () => character.classList.remove('piko-3d-ready'));
  resize();
  renderer.render(scene, camera);
  character.classList.add('piko-3d-ready');
  requestAnimationFrame(render);
}

waitForCharacter();
