/* ============================================
   3D射击生存 - 第一人称FPS游戏 v3.0
   步枪 + 狙击(开镜) + 加特林 + 火箭筒 + 手雷
   火柴人敌人 + 走路动画 + 极致性能优化
   LRKK Family · Three.js
   ============================================ */

// ========== DOM ==========
const healthDisplay = document.getElementById('healthDisplay');
const weaponDisplay = document.getElementById('weaponDisplay');
const ammoDisplay = document.getElementById('ammoDisplay');
const killDisplay = document.getElementById('killDisplay');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySubtitle = document.getElementById('overlaySubtitle');
const overlayControls = document.getElementById('overlayControls');
const startBtn = document.getElementById('startBtn');
const scopeOverlay = document.getElementById('scopeOverlay');
const container = document.getElementById('gameContainer');

// ========== Three.js 场景 ==========
let scene, camera, renderer;
const playerHeight = 1.8;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let pitch = 0, yaw = 0;
let isLocked = false;
const clock = new THREE.Clock();

// ========== 武器手持模型 ==========
let weaponGroup = null;
let weaponMesh = null;
let muzzleFlashLight = null;
let muzzleFlashSprite = null;
let weaponBobTimer = 0;

// ========== 游戏状态 ==========
const game = {
    state: 'idle',
    kills: 0,
    health: 100,
    maxHealth: 100,
    weapon: 'rifle',
    ammo: 30,
    weapons: ['rifle', 'sniper', 'gatling', 'rocket'],
    weaponIndex: 0,
    spawnTimer: 0,
    spawnInterval: 2,
    maxEnemies: 12,
    gameTime: 0,
    animFrame: null,
    frameCount: 0,
};

// ========== 武器配置 ==========
const WEAPONS = {
    rifle: { name: '🔫 步枪', damage: 20, fireRate: 0.12, maxAmmo: 30, reloadTime: 1.5, bulletSpeed: 60, spread: 0.03, range: 80, auto: true, color: 0x00f0ff, bodyColor: 0x224466 },
    sniper: { name: '🎯 狙击枪', damage: 80, fireRate: 0.8, maxAmmo: 5, reloadTime: 2.5, bulletSpeed: 100, spread: 0.005, range: 150, auto: false, color: 0xffdd00, bodyColor: 0x444422 },
    gatling: { name: '🔥 加特林', damage: 12, fireRate: 0.05, maxAmmo: 100, reloadTime: 3.0, bulletSpeed: 55, spread: 0.08, range: 60, auto: true, color: 0xff6600, bodyColor: 0x553322 },
    rocket: { name: '🚀 火箭筒', damage: 60, fireRate: 1.2, maxAmmo: 3, reloadTime: 3.0, bulletSpeed: 25, spread: 0.02, range: 80, auto: false, color: 0xff0044, bodyColor: 0x442222, explosive: true, explosionRadius: 8 },
};

// ========== 游戏对象 ==========
let enemies = [];
let bullets = [];
let explosions = [];
let healthPacks = [];
let particles = [];
const MAX_PARTICLES = 60;

// ========== 输入 ==========
let mouseDown = false;
let lastFireTime = 0;
let isReloading = false;
let reloadTimer = 0;
let isScoped = false;

// ========== 预创建几何体和材质（性能优化：复用） ==========
const SHARED = {};

function initShared() {
    SHARED.boxGeo = new THREE.BoxGeometry(1, 1, 1);
    SHARED.sphereGeo = new THREE.SphereGeometry(1, 4, 4);
    SHARED.cylGeo = new THREE.CylinderGeometry(1, 1, 1, 4);
    SHARED.ringGeo = new THREE.RingGeometry(0.8, 1, 8);
    SHARED.planeGeo = new THREE.PlaneGeometry(1, 1);
    
    SHARED.whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.3 });
    SHARED.darkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
}

// ========== 初始化Three.js ==========
function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.Fog(0x0a0a1a, 60, 120);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, playerHeight, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x222244, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x00f0ff, 0.6);
    dirLight.position.set(20, 30, 20);
    scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(0xff00aa, 0.2);
    fillLight.position.set(-20, 10, -20);
    scene.add(fillLight);

    initShared();
    createScene();
    createCrosshair();
    createWeaponModels();
    createMuzzleFlashSprite();

    window.addEventListener('resize', onResize);
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ========== 创建场景 ==========
function createScene() {
    // 地面纹理
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d0d20';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 256; i += 32) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9, metalness: 0.1 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // 建筑（减少数量到8个）
    const buildingColors = [0x00f0ff, 0xff00aa, 0xaa00ff, 0xff6600, 0x00ff88];
    const positions = [
        [-25, 0, -25], [25, 0, -25], [-25, 0, 25], [25, 0, 25],
        [-15, 0, -15], [15, 0, -15], [-15, 0, 15], [15, 0, 15],
    ];
    positions.forEach((pos, i) => {
        const w = 3 + Math.random() * 4;
        const h = 2 + Math.random() * 5;
        const d = 3 + Math.random() * 4;
        const color = buildingColors[i % buildingColors.length];
        const building = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.08, roughness: 0.4, metalness: 0.6 })
        );
        building.position.set(pos[0], h / 2, pos[2]);
        scene.add(building);
    });

    // 天空盒
    const skyGeo = new THREE.SphereGeometry(90, 12, 12);
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 128;
    skyCanvas.height = 128;
    const sctx = skyCanvas.getContext('2d');
    const gradient = sctx.createLinearGradient(0, 0, 0, 128);
    gradient.addColorStop(0, '#0a0a2e');
    gradient.addColorStop(0.5, '#1a0a2e');
    gradient.addColorStop(1, '#0a0a1a');
    sctx.fillStyle = gradient;
    sctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 50; i++) {
        sctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
        sctx.beginPath();
        sctx.arc(Math.random() * 128, Math.random() * 128, Math.random() * 1.5, 0, Math.PI * 2);
        sctx.fill();
    }
    const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(skyCanvas), side: THREE.BackSide }));
    scene.add(sky);
}

// ========== 创建手持武器模型 ==========
function createWeaponModels() {
    weaponGroup = new THREE.Group();
    weaponGroup.position.set(0.4, -0.3, -0.6);
    camera.add(weaponGroup);
    scene.add(camera);
    createRifleModel();
}

function createRifleModel() {
    if (weaponMesh) weaponGroup.remove(weaponMesh);
    const group = new THREE.Group();
    const wp = WEAPONS[game.weapon];
    const bc = wp.bodyColor;
    const ac = wp.color;

    switch (game.weapon) {
        case 'rifle': {
            addBox(group, 0.06, 0.06, 0.5, bc, 0, 0, -0.25);
            addCyl(group, 0.025, 0.03, 0.3, 0x333333, 0, 0, -0.55, true);
            addBox(group, 0.04, 0.1, 0.06, 0x222222, 0, -0.08, -0.15);
            addBox(group, 0.04, 0.08, 0.04, 0x333333, 0, -0.07, -0.2);
            addBox(group, 0.02, 0.02, 0.02, ac, 0, 0.04, -0.5, true, ac, 0.3);
            break;
        }
        case 'sniper': {
            addCyl(group, 0.03, 0.04, 0.7, 0x333333, 0, 0, -0.6, true);
            addBox(group, 0.08, 0.08, 0.4, bc, 0, 0, -0.2);
            addCyl(group, 0.04, 0.05, 0.12, 0x222222, 0, 0.06, -0.35, true);
            addCircle(group, 0.03, ac, 0, 0.06, -0.41, true, ac, 0.5);
            addBox(group, 0.04, 0.12, 0.06, 0x222222, 0, -0.1, -0.1);
            break;
        }
        case 'gatling': {
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                addCyl(group, 0.02, 0.025, 0.4, 0x444444, Math.cos(a) * 0.05, Math.sin(a) * 0.05, -0.5, true);
            }
            addCyl(group, 0.08, 0.1, 0.2, bc, 0, 0, -0.25);
            addBox(group, 0.1, 0.08, 0.12, 0x553322, 0, -0.09, -0.2);
            addTorus(group, 0.06, 0.015, ac, 0, 0, -0.7, true, ac, 0.2);
            break;
        }
        case 'rocket': {
            addCyl(group, 0.06, 0.08, 0.5, 0x444444, 0, 0, -0.4, true);
            addBox(group, 0.03, 0.08, 0.04, 0x222222, 0, -0.07, -0.5);
            addBox(group, 0.04, 0.1, 0.06, 0x222222, 0, -0.09, -0.15);
            addBox(group, 0.02, 0.03, 0.02, ac, 0, 0.05, -0.6, true, ac, 0.3);
            addCyl(group, 0.04, 0.05, 0.15, 0xff0044, 0, 0, -0.4, true, 0xff0044, 0.2);
            break;
        }
    }
    weaponMesh = group;
    weaponGroup.add(group);
}

// 辅助函数：减少重复代码
function addBox(g, w, h, d, color, x, y, z, emissive, eColor, eInt) {
    const m = new THREE.Mesh(SHARED.boxGeo.clone(), new THREE.MeshStandardMaterial({
        color, roughness: 0.5, metalness: 0.5,
        ...(emissive ? { emissive: eColor || color, emissiveIntensity: eInt || 0.3 } : {})
    }));
    m.scale.set(w, h, d);
    m.position.set(x, y, z);
    g.add(m);
    return m;
}

function addCyl(g, rT, rB, h, color, x, y, z, isX, emissive, eColor, eInt) {
    const m = new THREE.Mesh(SHARED.cylGeo.clone(), new THREE.MeshStandardMaterial({
        color, roughness: 0.5, metalness: 0.5,
        ...(emissive ? { emissive: eColor || color, emissiveIntensity: eInt || 0.3 } : {})
    }));
    m.scale.set(rT * 2, h, rB * 2);
    if (isX) m.rotation.x = Math.PI / 2;
    m.position.set(x, y, z);
    g.add(m);
    return m;
}

function addCircle(g, r, color, x, y, z, emissive, eColor, eInt) {
    const m = new THREE.Mesh(
        new THREE.CircleGeometry(r, 6),
        new THREE.MeshStandardMaterial({
            color, side: THREE.DoubleSide,
            ...(emissive ? { emissive: eColor || color, emissiveIntensity: eInt || 0.5 } : {})
        })
    );
    m.position.set(x, y, z);
    g.add(m);
    return m;
}

function addTorus(g, r, t, color, x, y, z, emissive, eColor, eInt) {
    const m = new THREE.Mesh(
        new THREE.TorusGeometry(r, t, 4, 8),
        new THREE.MeshStandardMaterial({
            color, roughness: 0.5, metalness: 0.5,
            ...(emissive ? { emissive: eColor || color, emissiveIntensity: eInt || 0.2 } : {})
        })
    );
    m.position.set(x, y, z);
    m.rotation.x = Math.PI / 2;
    g.add(m);
    return m;
}

function switchWeaponModel() { createRifleModel(); }

// ========== 枪口火焰精灵 ==========
function createMuzzleFlashSprite() {
    muzzleFlashLight = new THREE.PointLight(0x00f0ff, 0, 3);
    muzzleFlashLight.position.set(0, -0.2, -0.8);
    camera.add(muzzleFlashLight);
    scene.add(camera);

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(255,200,100,0.6)');
    g.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    
    muzzleFlashSprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(canvas),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0,
    }));
    muzzleFlashSprite.scale.set(0.3, 0.3, 1);
    muzzleFlashSprite.position.set(0, -0.2, -0.85);
    camera.add(muzzleFlashSprite);
    scene.add(camera);
}

function showMuzzleFlash(color) {
    if (!muzzleFlashSprite) return;
    muzzleFlashSprite.material.opacity = 1;
    muzzleFlashSprite.scale.set(0.4 + Math.random() * 0.2, 0.4 + Math.random() * 0.2, 1);
    muzzleFlashLight.color.set(color);
    muzzleFlashLight.intensity = 3;
    setTimeout(() => {
        if (muzzleFlashSprite) { muzzleFlashSprite.material.opacity = 0; muzzleFlashLight.intensity = 0; }
    }, 50);
}

// ========== 准星 ==========
function createCrosshair() {
    const el = document.createElement('div');
    el.id = 'crosshair';
    el.innerHTML = `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:15;">
        <div style="position:absolute;width:20px;height:2px;background:rgba(0,240,255,0.6);top:-1px;left:-10px;"></div>
        <div style="position:absolute;width:20px;height:2px;background:rgba(0,240,255,0.6);top:-1px;left:-10px;transform:rotate(90deg);"></div>
        <div style="position:absolute;width:4px;height:4px;background:rgba(0,240,255,0.8);border-radius:50%;top:-2px;left:-2px;"></div>
    </div>`;
    document.body.appendChild(el);
}

// ========== 玩家 ==========
function resetGame() {
    game.health = 100; game.kills = 0; game.weaponIndex = 0;
    game.weapon = 'rifle'; game.ammo = WEAPONS.rifle.maxAmmo;
    game.spawnTimer = 0; game.spawnInterval = 2; game.gameTime = 0; game.frameCount = 0;
    isReloading = false; reloadTimer = 0; isScoped = false;
    scopeOverlay.classList.remove('active');
    enemies = []; bullets = []; explosions = []; healthPacks = []; particles = [];
    if (camera) { camera.position.set(0, playerHeight, 0); yaw = 0; pitch = 0; }
    createRifleModel();
    updateHUD();
}

function startGame() {
    resetGame();
    game.state = 'playing';
    overlay.classList.add('hidden');
    renderer.domElement.requestPointerLock();
    if (game.animFrame) cancelAnimationFrame(game.animFrame);
    gameLoop();
}

function gameOver() {
    game.state = 'gameover';
    if (game.animFrame) cancelAnimationFrame(game.animFrame);
    document.exitPointerLock();
    overlay.classList.remove('hidden');
    overlayTitle.textContent = '💀 你阵亡了';
    overlaySubtitle.textContent = `击杀: ${game.kills} | 存活: ${Math.floor(game.gameTime)}秒`;
    overlayControls.innerHTML = `<p style="font-size:1.2rem;color:var(--neon-yellow);">🔫 最终击杀: ${game.kills}</p>`;
    startBtn.textContent = '🔄 再来一局';
}

function switchWeapon(index) {
    if (isReloading) return;
    if (index < 0) index = game.weapons.length - 1;
    if (index >= game.weapons.length) index = 0;
    if (game.weaponIndex === index) return;
    game.weaponIndex = index;
    game.weapon = game.weapons[index];
    game.ammo = WEAPONS[game.weapon].maxAmmo;
    isScoped = false;
    scopeOverlay.classList.remove('active');
    switchWeaponModel();
    updateHUD();
}

function reload() {
    if (isReloading) return;
    const wp = WEAPONS[game.weapon];
    if (game.ammo >= wp.maxAmmo) return;
    isReloading = true;
    reloadTimer = wp.reloadTime;
}

// ========== 射击 ==========
function fire() {
    if (isReloading) return;
    const wp = WEAPONS[game.weapon];
    if (game.ammo <= 0) { reload(); return; }
    const now = performance.now() / 1000;
    if (now - lastFireTime < wp.fireRate) return;
    lastFireTime = now;
    game.ammo--;
    updateHUD();

    const dir = new THREE.Vector3(0, 0, -1);
    dir.applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch + (Math.random() - 0.5) * wp.spread);
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw + (Math.random() - 0.5) * wp.spread);
    dir.normalize();

    const finalDir = (isScoped && game.weapon === 'sniper')
        ? new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).normalize()
        : dir;

    const startPos = camera.position.clone();
    startPos.y -= 0.2;

    if (game.weapon === 'rocket') {
        bullets.push(createRocket(startPos, finalDir, wp));
    } else if (game.weapon === 'sniper') {
        sniperHit(finalDir, wp);
    } else {
        bullets.push({ pos: startPos.clone(), dir: finalDir.clone(), speed: wp.bulletSpeed, damage: wp.damage, range: wp.range, distTraveled: 0, color: wp.color, isRocket: false });
    }

    showMuzzleFlash(wp.color);
    if (weaponGroup) weaponGroup.position.y = -0.3 + 0.02;
    if (game.ammo <= 0) reload();
}

function sniperHit(dir, wp) {
    const start = camera.position.clone();
    start.y -= 0.2;
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const dist = start.distanceTo(e.mesh.position);
        if (dist > wp.range) continue;
        const toEnemy = e.mesh.position.clone().sub(start).normalize();
        if (dir.angleTo(toEnemy) < 0.15) {
            e.health -= wp.damage;
            e.hitFlash = 0.2;
            if (e.health <= 0) killEnemy(i);
            break;
        }
    }
}

function createRocket(pos, dir, wp) {
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 4, 4),
        new THREE.MeshStandardMaterial({ color: 0xff0044, emissive: 0xff0044, emissiveIntensity: 0.5 })
    );
    mesh.position.copy(pos);
    scene.add(mesh);
    return { pos: pos.clone(), dir: dir.clone(), speed: wp.bulletSpeed, damage: wp.damage, range: wp.range, distTraveled: 0, isRocket: true, explosive: true, explosionRadius: wp.explosionRadius || 8, mesh };
}

// ========== 创建爆炸 ==========
function createExplosion(pos, radius, color) {
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 6, 6),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2, transparent: true, opacity: 0.8 })
    );
    mesh.position.copy(pos);
    scene.add(mesh);
    explosions.push({ mesh, life: 0.4, maxLife: 0.4 });

    // 爆炸伤害
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const dist = pos.distanceTo(e.mesh.position);
        if (dist < radius * 1.5) {
            e.health -= 60 * (1 - dist / (radius * 1.5));
            e.hitFlash = 0.3;
            if (e.health <= 0) killEnemy(i);
        }
    }
}

// ========== 手雷 ==========
let grenade = null;
function throwGrenade() {
    if (grenade) return;
    const dir = new THREE.Vector3(0, 0, -1);
    dir.applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    dir.normalize();
    const startPos = camera.position.clone();
    startPos.y -= 0.2;
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 4, 4),
        new THREE.MeshStandardMaterial({ color: 0x333333, emissive: 0xff6600, emissiveIntensity: 0.2 })
    );
    mesh.position.copy(startPos);
    scene.add(mesh);
    grenade = { mesh, pos: startPos.clone(), vel: dir.clone().multiplyScalar(15), fuse: 2.5, gravity: -15 };
}

// ========== 生成火柴人敌人 ==========
function spawnEnemy() {
    if (enemies.length >= game.maxEnemies) return;
    const angle = Math.random() * Math.PI * 2;
    const dist = 25 + Math.random() * 15;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const type = Math.random() < 0.25 ? 'heavy' : 'normal';
    const hp = type === 'heavy' ? 80 : 35;
    const spd = type === 'heavy' ? 3 : 4 + Math.random() * 2;
    const color = type === 'heavy' ? 0xff6600 : 0xff00aa;

    const group = new THREE.Group();
    const s = type === 'heavy' ? 0.8 : 0.5;

    // 身体（躯干）
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(s * 0.6, s * 0.8, s * 1.4, 4),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.15 })
    );
    body.position.y = s * 1.1;
    group.add(body);

    // 头部
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(s * 0.45, 4, 4),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 })
    );
    head.position.y = s * 2.0;
    group.add(head);

    // 眼睛（发光红点）
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 });
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), eyeMat);
    eye1.position.set(-0.1, s * 2.1, -s * 0.35);
    group.add(eye1);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), eyeMat);
    eye2.position.set(0.1, s * 2.1, -s * 0.35);
    group.add(eye2);

    // 手臂（火柴人风格 - 细圆柱）
    const armMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.1 });
    const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, s * 1.0, 4), armMat);
    lArm.position.set(-s * 0.7, s * 1.4, 0);
    lArm.rotation.z = 0.4;
    group.add(lArm);
    const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, s * 1.0, 4), armMat);
    rArm.position.set(s * 0.7, s * 1.4, 0);
    rArm.rotation.z = -0.4;
    group.add(rArm);

    // 腿
    const legMat = new THREE.MeshStandardMaterial({ color: 0x222244 });
    const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, s * 0.9, 4), legMat);
    lLeg.position.set(-s * 0.25, s * 0.35, 0);
    group.add(lLeg);
    const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, s * 0.9, 4), legMat);
    rLeg.position.set(s * 0.25, s * 0.35, 0);
    group.add(rLeg);

    group.position.set(x, 0, z);
    scene.add(group);

    // 血条（Sprite）
    const hpCanvas = document.createElement('canvas');
    hpCanvas.width = 48;
    hpCanvas.height = 6;
    const hpCtx = hpCanvas.getContext('2d');
    hpCtx.fillStyle = '#00ff88';
    hpCtx.fillRect(0, 0, 48, 6);
    const hpTexture = new THREE.CanvasTexture(hpCanvas);
    const hpSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: hpTexture, transparent: true }));
    hpSprite.scale.set(0.5, 0.06, 1);
    hpSprite.position.y = s * 2.6;
    group.add(hpSprite);

    enemies.push({
        mesh: group, health: hp, maxHealth: hp, speed: spd, type, color, hitFlash: 0,
        attackCooldown: 0, attackRate: 1.0, damage: type === 'heavy' ? 15 : 8,
        hpSprite, hpCanvas, hpCtx, walkPhase: Math.random() * Math.PI * 2,
        lArm, rArm, lLeg, rLeg, s,
    });
}

// ========== 击杀敌人 ==========
function killEnemy(index) {
    const e = enemies[index];
    game.kills++;
    updateHUD();
    createExplosion(e.mesh.position.clone(), 1.5, e.color);
    scene.remove(e.mesh);
    enemies.splice(index, 1);
}

// ========== 更新逻辑 ==========
function update(dt) {
    if (game.state !== 'playing') return;
    game.gameTime += dt;
    game.frameCount++;

    // === 玩家移动 ===
    const speed = 8;
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    let mx = 0, mz = 0;
    if (moveForward) { mx += forward.x; mz += forward.z; }
    if (moveBackward) { mx -= forward.x; mz -= forward.z; }
    if (moveLeft) { mx -= right.x; mz -= right.z; }
    if (moveRight) { mx += right.x; mz += right.z; }
    const isMoving = mx !== 0 || mz !== 0;
    if (isMoving) { const l = Math.sqrt(mx * mx + mz * mz); mx /= l; mz /= l; }
    camera.position.x += mx * speed * dt;
    camera.position.z += mz * speed * dt;
    camera.position.x = Math.max(-45, Math.min(45, camera.position.x));
    camera.position.z = Math.max(-45, Math.min(45, camera.position.z));

    // === 武器摆动 ===
    if (weaponGroup) {
        weaponBobTimer += dt * (isMoving ? 8 : 0);
        const bob = Math.sin(weaponBobTimer) * 0.005;
        weaponGroup.position.y = -0.3 + bob;
    }

    // === 换弹 ===
    if (isReloading) {
        reloadTimer -= dt;
        if (reloadTimer <= 0) {
            game.ammo = WEAPONS[game.weapon].maxAmmo;
            isReloading = false;
            updateHUD();
        }
    }

    // === 自动射击 ===
    if (mouseDown && !isReloading && game.ammo > 0) {
        const wp = WEAPONS[game.weapon];
        if (wp.auto) fire();
    }

    // === 生成敌人 ===
    game.spawnTimer += dt;
    if (game.spawnTimer >= game.spawnInterval) {
        game.spawnTimer = 0;
        game.spawnInterval = Math.max(0.5, 2 - game.gameTime * 0.003);
        spawnEnemy();
    }

    // === 更新子弹 ===
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        const move = b.dir.clone().multiplyScalar(b.speed * dt);
        b.pos.add(move);
        b.distTraveled += move.length();

        if (b.isRocket && b.mesh) {
            b.mesh.position.copy(b.pos);
        }

        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            const dist = b.pos.distanceTo(e.mesh.position);
            const hitRadius = (e.s || 0.5) * 1.5 + (b.isRocket ? 0.5 : 0.2);

            if (dist < hitRadius) {
                if (b.isRocket && b.explosive) {
                    createExplosion(b.pos.clone(), b.explosionRadius, 0xff6600);
                    if (b.mesh) scene.remove(b.mesh);
                } else {
                    e.health -= b.damage;
                    e.hitFlash = 0.15;
                }
                if (e.health <= 0) killEnemy(j);
                hit = true;
                break;
            }
        }

        if (hit || b.distTraveled > b.range) {
            if (b.isRocket && !hit && b.explosive) {
                createExplosion(b.pos.clone(), 3, 0xff6600);
                if (b.mesh) scene.remove(b.mesh);
            }
            bullets.splice(i, 1);
        }
    }

    // === 更新敌人（火柴人走路动画） ===
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.hitFlash > 0) e.hitFlash -= dt;

        const playerPos = camera.position.clone();
        playerPos.y = 0;
        const ePos = e.mesh.position.clone();
        ePos.y = 0;
        const dist = playerPos.distanceTo(ePos);

        if (dist > 1.5) {
            const dir = new THREE.Vector3().subVectors(playerPos, ePos).normalize();
            e.mesh.position.x += dir.x * e.speed * dt;
            e.mesh.position.z += dir.z * e.speed * dt;
            e.mesh.lookAt(camera.position.x, e.mesh.position.y, camera.position.z);

            // 火柴人走路动画
            e.walkPhase += dt * 6;
            const swing = Math.sin(e.walkPhase) * 0.5;
            if (e.lArm) e.lArm.rotation.x = swing;
            if (e.rArm) e.rArm.rotation.x = -swing;
            if (e.lLeg) e.lLeg.rotation.x = -swing * 0.7;
            if (e.rLeg) e.rLeg.rotation.x = swing * 0.7;
        } else {
            // 静止时手臂自然下垂
            if (e.lArm) e.lArm.rotation.x = 0;
            if (e.rArm) e.rArm.rotation.x = 0;
            if (e.lLeg) e.lLeg.rotation.x = 0;
            if (e.rLeg) e.rLeg.rotation.x = 0;
        }

        // 更新血条（每5帧更新一次）
        if (e.hpSprite && game.frameCount % 5 === 0) {
            const hpPct = e.health / e.maxHealth;
            const hpCtx = e.hpCtx;
            hpCtx.fillStyle = '#333';
            hpCtx.fillRect(0, 0, 48, 6);
            hpCtx.fillStyle = hpPct > 0.5 ? '#0f8' : hpPct > 0.25 ? '#fd0' : '#f04';
            hpCtx.fillRect(0, 0, 48 * hpPct, 6);
            e.hpSprite.material.map.needsUpdate = true;
        }

        // 攻击玩家
        if (dist < 2.0) {
            e.attackCooldown -= dt;
            if (e.attackCooldown <= 0) {
                e.attackCooldown = e.attackRate;
                game.health -= e.damage;
                updateHUD();
                if (game.health <= 0) { gameOver(); return; }
            }
        }

        // 击中闪烁
        const intensity = e.hitFlash > 0 ? 1 : 0.15;
        e.mesh.children.forEach(child => {
            if (child.material && child.material.emissiveIntensity !== undefined) {
                child.material.emissiveIntensity = intensity;
            }
        });
    }

    // === 更新手雷 ===
    if (grenade) {
        grenade.vel.y += grenade.gravity * dt;
        grenade.pos.x += grenade.vel.x * dt;
        grenade.pos.y += grenade.vel.y * dt;
        grenade.pos.z += grenade.vel.z * dt;
        grenade.mesh.position.copy(grenade.pos);
        grenade.mesh.rotation.x += dt * 5;
        grenade.mesh.rotation.z += dt * 3;
        grenade.fuse -= dt;
        if (grenade.pos.y < 0.2) {
            grenade.pos.y = 0.2;
            grenade.vel.y *= -0.3;
            grenade.vel.x *= 0.8;
            grenade.vel.z *= 0.8;
        }
        if (grenade.fuse <= 0) {
            createExplosion(grenade.pos.clone(), 6, 0xff6600);
            scene.remove(grenade.mesh);
            grenade = null;
        }
    }

    // === 更新爆炸 ===
    for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        exp.life -= dt;
        const scale = 1 + (1 - exp.life / exp.maxLife) * 2;
        exp.mesh.scale.set(scale, scale, scale);
        exp.mesh.material.opacity = exp.life / exp.maxLife;
        if (exp.life <= 0) { scene.remove(exp.mesh); explosions.splice(i, 1); }
    }

    // === 更新粒子 ===
    if (particles.length > MAX_PARTICLES) {
        const excess = particles.splice(0, particles.length - MAX_PARTICLES);
        excess.forEach(p => scene.remove(p.mesh));
    }
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.mesh.position.x += p.dir.x * p.speed * dt;
        p.mesh.position.y += p.dir.y * p.speed * dt;
        p.mesh.position.z += p.dir.z * p.speed * dt;
        p.life -= dt;
        p.mesh.material.opacity = p.life / p.maxLife;
        const s = p.life / p.maxLife;
        p.mesh.scale.set(s, s, s);
        if (p.life <= 0) { scene.remove(p.mesh); particles.splice(i, 1); }
    }
}

// ========== 渲染 ==========
function render() {
    const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);
    renderer.render(scene, camera);
}

// ========== 游戏循环 ==========
function gameLoop() {
    if (game.state === 'gameover' || game.state === 'idle') return;
    const dt = Math.min(clock.getDelta(), 0.05);
    update(dt);
    render();
    game.animFrame = requestAnimationFrame(gameLoop);
}

// ========== HUD更新 ==========
function updateHUD() {
    const healthPct = game.health / game.maxHealth;
    const heartCount = Math.ceil(healthPct * 5);
    let hearts = '';
    for (let i = 0; i < 5; i++) hearts += i < heartCount ? '❤️' : '🖤';
    healthDisplay.textContent = hearts;
    const wp = WEAPONS[game.weapon];
    weaponDisplay.textContent = wp.name;
    ammoDisplay.textContent = `${game.ammo}/${wp.maxAmmo}${isReloading ? ' 🔄' : ''}`;
    killDisplay.textContent = game.kills;
}

// ========== 输入处理 ==========
function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    switch (key) {
        case 'w': moveForward = true; e.preventDefault(); break;
        case 's': moveBackward = true; e.preventDefault(); break;
        case 'a': moveLeft = true; e.preventDefault(); break;
        case 'd': moveRight = true; e.preventDefault(); break;
        case 'r': e.preventDefault(); if (game.state === 'playing') reload(); break;
        case 'g': e.preventDefault(); if (game.state === 'playing') throwGrenade(); break;
        case ' ': e.preventDefault(); if (game.state === 'playing') reload(); break;
    }
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    switch (key) {
        case 'w': moveForward = false; break;
        case 's': moveBackward = false; break;
        case 'a': moveLeft = false; break;
        case 'd': moveRight = false; break;
    }
}

function handleMouseMove(e) {
    if (!isLocked) return;
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch));
}

function handleMouseDown(e) {
    if (e.button === 0) {
        mouseDown = true;
        if (game.state === 'playing') {
            const wp = WEAPONS[game.weapon];
            if (!wp.auto) fire();
        }
    } else if (e.button === 2) {
        if (game.state === 'playing' && game.weapon === 'sniper') {
            isScoped = !isScoped;
            scopeOverlay.classList.toggle('active');
            camera.fov = isScoped ? 20 : 75;
            camera.updateProjectionMatrix();
        }
    }
}

function handleMouseUp(e) {
    if (e.button === 0) mouseDown = false;
}

function handleWheel(e) {
    e.preventDefault();
    if (game.state !== 'playing') return;
    switchWeapon(game.weaponIndex + (e.deltaY > 0 ? 1 : -1));
}

function handlePointerLockChange() {
    isLocked = document.pointerLockElement === renderer.domElement;
}

function handleContextMenu(e) { e.preventDefault(); }

// ========== 初始化 ==========
function init() {
    initThree();
    resetGame();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('contextmenu', handleContextMenu);
    startBtn.addEventListener('click', startGame);
}

init();
console.log('🔫 3D射击生存 v3.0 火柴人+走路动画+极致性能优化');
