/* ============================================
   射击生存 - 2D俯视角射击游戏 v2.0
   关卡系统 + Boss战 + 血包掉落
   步枪 + 狙击 + 加特林 + 火箭弹
   LRKK Family · 赛博霓虹风格
   ============================================ */

// ========== DOM ==========
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const healthDisplay = document.getElementById('healthDisplay');
const weaponDisplay = document.getElementById('weaponDisplay');
const ammoDisplay = document.getElementById('ammoDisplay');
const killDisplay = document.getElementById('killDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySubtitle = document.getElementById('overlaySubtitle');
const overlayControls = document.getElementById('overlayControls');
const startBtn = document.getElementById('startBtn');
const scopeOverlay = document.getElementById('scopeOverlay');

// ========== Canvas 尺寸 ==========
const CW = 800;
const CH = 600;
canvas.width = CW;
canvas.height = CH;

// ========== 游戏状态 ==========
let game = {
    state: 'idle',
    animFrame: null,
    lastTime: 0,
    kills: 0,
    spawnTimer: 0,
    spawnInterval: 2,
    maxEnemies: 15,
    gameTime: 0,
    level: 1,
    maxLevel: 5,
    levelKills: 0,
    killsForLevel: 10,
    bossActive: false,
    bossSpawned: false,
    levelTransition: false,
    levelTimer: 0,
};

// ========== 武器配置 ==========
const WEAPONS = {
    rifle: { name: '⚡ 步枪', damage: 20, fireRate: 0.1, maxAmmo: 999999, reloadTime: 1.5, bulletSpeed: 12, spread: 0.05, range: 500, auto: true, color: '#00f0ff' },
    sniper: { name: '🎯 狙击枪', damage: 80, fireRate: 0.8, maxAmmo: 999999, reloadTime: 2.5, bulletSpeed: 20, spread: 0.01, range: 800, auto: false, scopeZoom: 2.5, color: '#ffdd00' },
    gatling: { name: '🔥 加特林', damage: 10, fireRate: 0.03, maxAmmo: 999999, reloadTime: 3.0, bulletSpeed: 14, spread: 0.12, range: 400, auto: true, color: '#ff6600' },
    rocket: { name: '🚀 火箭弹', damage: 60, fireRate: 0.6, maxAmmo: 999999, reloadTime: 3.0, bulletSpeed: 6, spread: 0.03, range: 600, auto: false, color: '#ff0044', explosive: true, explosionRadius: 60 },
};

// ========== 玩家 ==========
let player = {};
let bullets = [];
let enemies = [];
let particles = [];
let floatingTexts = [];
let healthPacks = [];

// ========== 输入 ==========
let keys = {};
let mouse = { x: CW / 2, y: CH / 2, down: false, rightDown: false };
let lastFireTime = 0;
let isReloading = false;
let reloadTimer = 0;
let isScoped = false;

// ========== 初始化 ==========
function init() {
    resetGame();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('wheel', handleWheel);
    startBtn.addEventListener('click', startGame);
}

function resizeCanvas() {
    const wrapper = document.getElementById('gameWrapper');
    const maxW = window.innerWidth - 20;
    const maxH = window.innerHeight - 80;
    const scale = Math.min(maxW / CW, maxH / CH, 1);
    canvas.style.width = (CW * scale) + 'px';
    canvas.style.height = (CH * scale) + 'px';
}

// ========== 重置 ==========
function resetGame() {
    player = {
        x: CW / 2, y: CH / 2, radius: 14, speed: 3.5,
        health: 100, maxHealth: 100,
        weapon: 'rifle', ammo: WEAPONS.rifle.maxAmmo,
        angle: 0, invincible: 0,
    };
    bullets = [];
    enemies = [];
    particles = [];
    floatingTexts = [];
    healthPacks = [];
    game.kills = 0;
    game.spawnTimer = 0;
    game.gameTime = 0;
    game.level = 1;
    game.levelKills = 0;
    game.killsForLevel = 10;
    game.bossActive = false;
    game.bossSpawned = false;
    game.levelTransition = false;
    game.levelTimer = 0;
    isReloading = false;
    reloadTimer = 0;
    isScoped = false;
    scopeOverlay.classList.remove('active');
    updateHUD();
}

// ========== 开始游戏 ==========
function startGame() {
    resetGame();
    game.state = 'playing';
    overlay.classList.add('hidden');
    if (game.animFrame) cancelAnimationFrame(game.animFrame);
    game.lastTime = performance.now();
    createFloatingText(CW / 2, CH / 2, '⚔️ 第1关 开始!', '#00f0ff');
    gameLoop(game.lastTime);
}

// ========== 游戏结束 ==========
function gameOver() {
    game.state = 'gameover';
    if (game.animFrame) cancelAnimationFrame(game.animFrame);
    overlay.classList.remove('hidden');
    overlayTitle.textContent = '💀 你阵亡了';
    overlaySubtitle.textContent = `击杀: ${game.kills} | 到达第${game.level}关 | 存活: ${Math.floor(game.gameTime)}秒`;
    overlayControls.innerHTML = `<p style="font-size:1.2rem; color:var(--neon-yellow);">🔫 最终击杀: ${game.kills}</p>`;
    startBtn.textContent = '🔄 再来一局';
}

// ========== 通关 ==========
function levelComplete() {
    game.state = 'levelComplete';
    game.levelTransition = true;
    game.levelTimer = 3;
    createFloatingText(CW / 2, CH / 2, `🎉 第${game.level}关 通过!`, '#ffdd00');
    if (game.level >= game.maxLevel) {
        // 全部通关
        setTimeout(() => {
            game.state = 'gameover';
            overlay.classList.remove('hidden');
            overlayTitle.textContent = '🏆 恭喜通关!';
            overlaySubtitle.textContent = `击杀: ${game.kills} | 通关全部${game.maxLevel}关!`;
            overlayControls.innerHTML = `<p style="font-size:1.2rem; color:var(--neon-yellow);">🎊 你是最强射手!</p>`;
            startBtn.textContent = '🔄 再来一局';
        }, 3000);
        return;
    }
    setTimeout(() => {
        game.level++;
        game.levelKills = 0;
        game.killsForLevel = 8 + game.level * 2;
        game.bossActive = false;
        game.bossSpawned = false;
        game.levelTransition = false;
        game.state = 'playing';
        // 清空剩余敌人
        enemies = [];
        // 回血
        player.health = Math.min(player.maxHealth, player.health + 30);
        createFloatingText(CW / 2, CH / 2, `⚔️ 第${game.level}关 开始!`, '#00f0ff');
        updateHUD();
    }, 3000);
}

// ========== 武器切换 ==========
function switchWeapon(weapon) {
    if (isReloading) return;
    if (player.weapon === weapon) return;
    player.weapon = weapon;
    player.ammo = WEAPONS[weapon].maxAmmo;
    isScoped = false;
    scopeOverlay.classList.remove('active');
    updateHUD();
    createFloatingText(player.x, player.y - 30, WEAPONS[weapon].name, '#00f0ff');
}

// ========== 换弹 ==========
function reload() {
    if (isReloading) return;
    const wp = WEAPONS[player.weapon];
    if (player.ammo >= wp.maxAmmo) return;
    isReloading = true;
    reloadTimer = wp.reloadTime;
    createFloatingText(player.x, player.y - 30, '🔄 换弹中...', '#ffdd00');
}

// ========== 射击 ==========
function fire() {
    if (isReloading) return;
    const wp = WEAPONS[player.weapon];
    if (player.ammo <= 0) { reload(); return; }
    const now = performance.now() / 1000;
    if (now - lastFireTime < wp.fireRate) return;
    lastFireTime = now;
    player.ammo--;
    updateHUD();

    const spread = (Math.random() - 0.5) * wp.spread;
    const angle = player.angle + spread;
    const finalAngle = (isScoped && player.weapon === 'sniper') ? player.angle : angle;
    const bx = player.x + Math.cos(finalAngle) * (player.radius + 5);
    const by = player.y + Math.sin(finalAngle) * (player.radius + 5);

    let bSize = player.weapon === 'sniper' ? 4 : player.weapon === 'gatling' ? 2 : player.weapon === 'rocket' ? 6 : 3;
    let bColor = wp.color;

    bullets.push({
        x: bx, y: by,
        dx: Math.cos(finalAngle) * wp.bulletSpeed,
        dy: Math.sin(finalAngle) * wp.bulletSpeed,
        damage: wp.damage, life: 1, range: wp.range, distTraveled: 0,
        fromPlayer: true, size: bSize, color: bColor, trail: [],
        isRocket: player.weapon === 'rocket',
        explosive: player.weapon === 'rocket',
        explosionRadius: 60,
    });

    const pCount = player.weapon === 'gatling' ? 3 : player.weapon === 'rocket' ? 8 : 5;
    for (let i = 0; i < pCount; i++) {
        const a = finalAngle + (Math.random() - 0.5) * 0.5;
        const spd = 2 + Math.random() * 3;
        particles.push({ x: bx, y: by, dx: Math.cos(a) * spd, dy: Math.sin(a) * spd, size: 2 + Math.random() * 3, life: 1, decay: 0.08 + Math.random() * 0.05, color: bColor });
    }
    if (player.weapon === 'sniper') createFloatingText(bx, by, '💥', '#ffdd00');
    if (player.weapon === 'rocket') createFloatingText(bx, by, '🚀', '#ff0044');
}

// ========== 生成敌人 ==========
function spawnEnemy() {
    if (enemies.length >= game.maxEnemies) return;
    const side = Math.floor(Math.random() * 4);
    let x, y;
    const margin = 30;
    switch (side) {
        case 0: x = -margin; y = Math.random() * CH; break;
        case 1: x = CW + margin; y = Math.random() * CH; break;
        case 2: x = Math.random() * CW; y = -margin; break;
        case 3: x = Math.random() * CW; y = CH + margin; break;
    }

    // 随关卡提升敌人强度
    const levelScale = 1 + (game.level - 1) * 0.3;
    const type = Math.random() < 0.3 ? 'heavy' : 'normal';
    const hp = Math.floor((type === 'heavy' ? 60 : 30) * levelScale);
    const spd = (type === 'heavy' ? 1.2 : 1.8 + Math.random() * 0.5) + (game.level - 1) * 0.1;
    const size = type === 'heavy' ? 18 : 12;

    enemies.push({
        x, y, radius: size, speed: Math.min(spd, 4),
        health: hp, maxHealth: hp, type, angle: 0,
        attackCooldown: 0, attackRate: 1.0,
        damage: Math.floor((type === 'heavy' ? 15 : 8) * levelScale),
        hitFlash: 0,
    });
}

// ========== 生成Boss ==========
function spawnBoss() {
    if (game.bossSpawned) return;
    game.bossSpawned = true;
    game.bossActive = true;

    const levelScale = 1 + (game.level - 1) * 0.5;
    const hp = Math.floor(200 * levelScale);
    const size = 35;

    // Boss从上方出现
    const x = CW / 2;
    const y = -size;

    createFloatingText(CW / 2, 50, `👹 BOSS 出现! 血量: ${hp}`, '#ff0044');

    enemies.push({
        x, y, radius: size, speed: 1.5 + (game.level - 1) * 0.2,
        health: hp, maxHealth: hp, type: 'boss',
        angle: 0, attackCooldown: 0, attackRate: 0.8,
        damage: Math.floor(20 * levelScale),
        hitFlash: 0, bossPhase: 0, bossTimer: 0,
    });
}

// ========== 掉落血包 ==========
function dropHealthPack(x, y) {
    if (Math.random() < 0.3) { // 30%概率掉落
        healthPacks.push({
            x: x + (Math.random() - 0.5) * 30,
            y: y + (Math.random() - 0.5) * 30,
            radius: 10,
            life: 8, // 8秒后消失
            healAmount: 25,
            bobPhase: Math.random() * Math.PI * 2,
        });
    }
}

// ========== 更新 ==========
function update(dt) {
    if (game.state !== 'playing') return;
    game.gameTime += dt;

    // === 关卡过渡 ===
    if (game.levelTransition) {
        game.levelTimer -= dt;
        return;
    }

    // === 玩家移动 ===
    let dx = 0, dy = 0;
    if (keys['w'] || keys['arrowup']) dy = -1;
    if (keys['s'] || keys['arrowdown']) dy = 1;
    if (keys['a'] || keys['arrowleft']) dx = -1;
    if (keys['d'] || keys['arrowright']) dx = 1;
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
    player.x += dx * player.speed;
    player.y += dy * player.speed;
    player.x = Math.max(player.radius, Math.min(CW - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(CH - player.radius, player.y));
    player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    if (player.invincible > 0) player.invincible -= dt;

    // === 换弹 ===
    if (isReloading) {
        reloadTimer -= dt;
        if (reloadTimer <= 0) {
            player.ammo = WEAPONS[player.weapon].maxAmmo;
            isReloading = false;
            createFloatingText(player.x, player.y - 30, '✅ 换弹完成', '#00ff88');
            updateHUD();
        }
    }

    // === 自动射击 ===
    if (mouse.down && !isReloading && player.ammo > 0) {
        const wp = WEAPONS[player.weapon];
        if (wp.auto) fire();
    }

    // === Boss生成（每关击杀数达标后） ===
    if (!game.bossSpawned && game.levelKills >= game.killsForLevel) {
        spawnBoss();
    }

    // === 生成敌人（Boss未激活时） ===
    if (!game.bossActive) {
        game.spawnTimer += dt;
        if (game.spawnTimer >= game.spawnInterval) {
            game.spawnTimer = 0;
            const interval = Math.max(0.4, game.spawnInterval - game.gameTime * 0.002);
            game.spawnInterval = interval;
            spawnEnemy();
        }
    }

    // === 更新子弹 ===
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.dx; b.y += b.dy;
        b.distTraveled += Math.sqrt(b.dx * b.dx + b.dy * b.dy);
        b.trail.push({ x: b.x, y: b.y, life: 1 });
        if (b.trail.length > 8) b.trail.shift();
        for (let t of b.trail) t.life -= 0.12;

        if (b.distTraveled > b.range || b.x < -50 || b.x > CW + 50 || b.y < -50 || b.y > CH + 50) {
            bullets.splice(i, 1); continue;
        }

        if (b.fromPlayer) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                const dist = Math.sqrt((b.x - e.x) ** 2 + (b.y - e.y) ** 2);
                if (dist < e.radius + b.size) {
                    // 火箭弹爆炸
                    if (b.isRocket && b.explosive) {
                        for (let k = 0; k < 30; k++) {
                            const a = Math.random() * Math.PI * 2;
                            const spd = 2 + Math.random() * 6;
                            particles.push({ x: b.x, y: b.y, dx: Math.cos(a) * spd, dy: Math.sin(a) * spd, size: 3 + Math.random() * 6, life: 1, decay: 0.015 + Math.random() * 0.02, color: ['#ff0044', '#ff6600', '#ffdd00', '#ffffff'][Math.floor(Math.random() * 4)] });
                        }
                        createFloatingText(b.x, b.y - 20, '💥 爆炸!', '#ff6600');
                        for (let k = enemies.length - 1; k >= 0; k--) {
                            if (k === j) continue;
                            const e2 = enemies[k];
                            const d2 = Math.sqrt((b.x - e2.x) ** 2 + (b.y - e2.y) ** 2);
                            if (d2 < b.explosionRadius) {
                                e2.health -= b.damage * 0.5;
                                e2.hitFlash = 0.3;
                                if (e2.health <= 0) {
                                    game.kills++; game.levelKills++; updateHUD();
                                    dropHealthPack(e2.x, e2.y);
                                    for (let kk = 0; kk < 15; kk++) {
                                        const aa = Math.random() * Math.PI * 2;
                                        const spd2 = 1 + Math.random() * 4;
                                        particles.push({ x: e2.x, y: e2.y, dx: Math.cos(aa) * spd2, dy: Math.sin(aa) * spd2, size: 2 + Math.random() * 5, life: 1, decay: 0.02 + Math.random() * 0.02, color: e2.type === 'heavy' ? '#ff6600' : '#ff00aa' });
                                    }
                                    createFloatingText(e2.x, e2.y - 20, '💀', '#ff0044');
                                    enemies.splice(k, 1);
                                }
                            }
                        }
                    }

                    e.health -= b.damage;
                    e.hitFlash = 0.15;
                    const hitCount = b.isRocket ? 15 : 6;
                    for (let k = 0; k < hitCount; k++) {
                        const a = Math.random() * Math.PI * 2;
                        const spd = 1 + Math.random() * 3;
                        particles.push({ x: b.x, y: b.y, dx: Math.cos(a) * spd, dy: Math.sin(a) * spd, size: 2 + Math.random() * 3, life: 1, decay: 0.04 + Math.random() * 0.03, color: b.isRocket ? '#ff6600' : '#ff0044' });
                    }

                    if (e.health <= 0) {
                        game.kills++; game.levelKills++; updateHUD();
                        dropHealthPack(e.x, e.y);
                        // Boss死亡 = 通关
                        if (e.type === 'boss') {
                            game.bossActive = false;
                            game.bossSpawned = false;
                            for (let k = 0; k < 50; k++) {
                                const a = Math.random() * Math.PI * 2;
                                const spd = 2 + Math.random() * 8;
                                particles.push({ x: e.x, y: e.y, dx: Math.cos(a) * spd, dy: Math.sin(a) * spd, size: 3 + Math.random() * 8, life: 1, decay: 0.01 + Math.random() * 0.02, color: ['#ff0044', '#ffdd00', '#ff6600', '#ffffff', '#00f0ff'][Math.floor(Math.random() * 5)] });
                            }
                            createFloatingText(CW / 2, CH / 2, '👑 BOSS 击杀!', '#ffdd00');
                            levelComplete();
                        } else {
                            for (let k = 0; k < 20; k++) {
                                const a = Math.random() * Math.PI * 2;
                                const spd = 1 + Math.random() * 4;
                                particles.push({ x: e.x, y: e.y, dx: Math.cos(a) * spd, dy: Math.sin(a) * spd, size: 2 + Math.random() * 5, life: 1, decay: 0.02 + Math.random() * 0.02, color: e.type === 'heavy' ? '#ff6600' : '#ff00aa' });
                            }
                            createFloatingText(e.x, e.y - 20, '💀', '#ff0044');
                        }
                        enemies.splice(j, 1);
                    }
                    bullets.splice(i, 1);
                    break;
                }
            }
        }
    }

    // === 更新敌人 ===
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.hitFlash > 0) e.hitFlash -= dt;

        const dx2 = player.x - e.x;
        const dy2 = player.y - e.y;
        const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (e.type === 'boss') {
            // Boss特殊行为：缓慢移动 + 发射子弹
            e.bossTimer += dt;
            if (dist > 150) {
                if (dist > 0) { e.x += (dx2 / dist) * e.speed; e.y += (dy2 / dist) * e.speed; }
            } else {
                // Boss绕圈
                const orbitAngle = e.bossTimer * 0.5;
                const targetX = player.x + Math.cos(orbitAngle) * 180;
                const targetY = player.y + Math.sin(orbitAngle) * 180;
                const toX = targetX - e.x;
                const toY = targetY - e.y;
                const toDist = Math.sqrt(toX * toX + toY * toY);
                if (toDist > 0) { e.x += (toX / toDist) * e.speed * 1.5; e.y += (toY / toDist) * e.speed * 1.5; }
            }
            e.angle = Math.atan2(dy2, dx2);

            // Boss发射子弹
            if (e.bossTimer > e.attackRate) {
                e.bossTimer = 0;
                // 扇形弹幕
                for (let k = -2; k <= 2; k++) {
                    const a = e.angle + k * 0.3;
                    bullets.push({
                        x: e.x, y: e.y,
                        dx: Math.cos(a) * 4, dy: Math.sin(a) * 4,
                        damage: e.damage, life: 1, range: 300, distTraveled: 0,
                        fromPlayer: false, size: 5, color: '#ff0044', trail: [],
                        isRocket: false, explosive: false,
                    });
                }
            }
        } else {
            // 普通敌人
            if (dist > 0) { e.x += (dx2 / dist) * e.speed; e.y += (dy2 / dist) * e.speed; e.angle = Math.atan2(dy2, dx2); }
        }

        e.x = Math.max(-20, Math.min(CW + 20, e.x));
        e.y = Math.max(-20, Math.min(CH + 20, e.y));

        // 攻击玩家
        const distToPlayer = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2);
        if (distToPlayer < e.radius + player.radius) {
            e.attackCooldown -= dt;
            if (e.attackCooldown <= 0) {
                e.attackCooldown = e.attackRate;
                if (player.invincible <= 0) {
                    player.health -= e.damage;
                    player.invincible = 0.3;
                    for (let k = 0; k < 10; k++) {
                        const a = Math.random() * Math.PI * 2;
                        const spd = 1 + Math.random() * 3;
                        particles.push({ x: player.x, y: player.y, dx: Math.cos(a) * spd, dy: Math.sin(a) * spd, size: 2 + Math.random() * 4, life: 1, decay: 0.04 + Math.random() * 0.03, color: '#ff0044' });
                    }
                    createFloatingText(player.x, player.y - 30, `-${e.damage} ❤️`, '#ff0044');
                    updateHUD();
                    if (player.health <= 0) { gameOver(); return; }
                }
            }
        }
    }

    // === 更新血包 ===
    for (let i = healthPacks.length - 1; i >= 0; i--) {
        const hp = healthPacks[i];
        hp.life -= dt;
        hp.bobPhase += dt * 3;
        if (hp.life <= 0) { healthPacks.splice(i, 1); continue; }

        // 拾取检测
        const dist = Math.sqrt((hp.x - player.x) ** 2 + (hp.y - player.y) ** 2);
        if (dist < hp.radius + player.radius) {
            player.health = Math.min(player.maxHealth, player.health + hp.healAmount);
            createFloatingText(hp.x, hp.y - 15, `+${hp.healAmount} ❤️`, '#00ff88');
            for (let k = 0; k < 10; k++) {
                const a = Math.random() * Math.PI * 2;
                const spd = 1 + Math.random() * 3;
                particles.push({ x: hp.x, y: hp.y, dx: Math.cos(a) * spd, dy: Math.sin(a) * spd, size: 2 + Math.random() * 3, life: 1, decay: 0.04 + Math.random() * 0.03, color: '#00ff88' });
            }
            updateHUD();
            healthPacks.splice(i, 1);
        }
    }

    // === 更新粒子 ===
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx; p.y += p.dy; p.dy += 0.02;
        p.life -= p.decay;
        if (p.life <= 0) particles.splice(i, 1);
    }

    // === 更新浮动文字 ===
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.dy || -1.5;
        ft.life -= ft.decay || 0.025;
        if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
}

// ========== 渲染 ==========
function draw() {
    ctx.clearRect(0, 0, CW, CH);
    drawGrid();
    drawGround();

    // 子弹拖尾
    for (let b of bullets) {
        for (let t of b.trail) {
            if (t.life <= 0) continue;
            ctx.beginPath();
            ctx.arc(t.x, t.y, b.size * t.life * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 240, 255, ${t.life * 0.4})`;
            ctx.fill();
        }
    }

    // 子弹
    for (let b of bullets) {
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // 血包
    drawHealthPacks();

    // 敌人
    drawEnemies();

    // 玩家
    drawPlayer();

    // 粒子
    drawParticles();

    // 浮动文字
    drawFloatingTexts();

    // 准星
    drawCrosshair();

    // 开镜效果
    if (isScoped && player.weapon === 'sniper') drawScope();

    // 关卡信息
    drawLevelInfo();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CW; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke(); }
    for (let y = 0; y <= CH; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }
}

function drawGround() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 30; i++) {
        const x = (i * 137 + 50) % CW;
        const y = (i * 251 + 30) % CH;
        ctx.beginPath();
        ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawHealthPacks() {
    for (let hp of healthPacks) {
        const bobY = Math.sin(hp.bobPhase) * 3;
        const alpha = hp.life < 2 ? (hp.life % 0.5 > 0.25 ? 0.5 : 1) : 1;

        ctx.globalAlpha = alpha;
        // 发光
        const grad = ctx.createRadialGradient(hp.x, hp.y + bobY, 0, hp.x, hp.y + bobY, 20);
        grad.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(hp.x, hp.y + bobY, 20, 0, Math.PI * 2);
        ctx.fill();

        // 十字血包
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(hp.x - 3, hp.y + bobY - 7, 6, 14);
        ctx.fillRect(hp.x - 7, hp.y + bobY - 3, 14, 6);
        ctx.shadowBlur = 0;

        // 文字
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 10px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`+${hp.healAmount}`, hp.x, hp.y + bobY - 16);
        ctx.globalAlpha = 1;
    }
}

function drawPlayer() {
    const px = player.x, py = player.y, r = player.radius;
    if (player.invincible > 0 && Math.floor(player.invincible * 10) % 2 === 0) ctx.globalAlpha = 0.5;

    const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 3);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, r * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(px - 3, py - 3, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 武器指向线
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(player.angle) * 30, py + Math.sin(player.angle) * 30);
    ctx.stroke();

    // 血条
    const barW = 40;
    const barH = 4;
    const barX = px - barW / 2;
    const barY = py - r - 12;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = player.health > 50 ? '#00ff88' : player.health > 25 ? '#ffdd00' : '#ff0044';
    ctx.fillRect(barX, barY, barW * (player.health / player.maxHealth), barH);

    ctx.globalAlpha = 1;
}

function drawEnemies() {
    for (let e of enemies) {
        const ex = e.x, ey = e.y, er = e.radius;
        const color = e.type === 'boss' ? '#ff0044' : e.type === 'heavy' ? '#ff6600' : '#ff00aa';

        // Boss特殊渲染
        if (e.type === 'boss') {
            // Boss光环
            const grad = ctx.createRadialGradient(ex, ey, 0, ex, ey, er * 3);
            grad.addColorStop(0, e.hitFlash > 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,0,68,0.3)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(ex, ey, er * 3, 0, Math.PI * 2);
            ctx.fill();

            // Boss身体
            ctx.shadowColor = e.hitFlash > 0 ? '#ffffff' : '#ff0044';
            ctx.shadowBlur = e.hitFlash > 0 ? 35 : 25;
            ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : '#ff0044';
            ctx.beginPath();
            ctx.arc(ex, ey, er, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Boss皇冠
            ctx.fillStyle = '#ffdd00';
            ctx.shadowColor = '#ffdd00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(ex - 12, ey - er + 2);
            ctx.lineTo(ex - 8, ey - er - 12);
            ctx.lineTo(ex - 3, ey - er - 4);
            ctx.lineTo(ex, ey - er - 14);
            ctx.lineTo(ex + 3, ey - er - 4);
            ctx.lineTo(ex + 8, ey - er - 12);
            ctx.lineTo(ex + 12, ey - er + 2);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

            // Boss眼睛
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex - 8, ey - 5, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ex + 8, ey - 5, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(ex - 8 + Math.cos(e.angle) * 3, ey - 5 + Math.sin(e.angle) * 3, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ex + 8 + Math.cos(e.angle) * 3, ey - 5 + Math.sin(e.angle) * 3, 3, 0, Math.PI * 2);
            ctx.fill();

            // Boss血条（大）
            const barW = er * 3;
            const barH = 5;
            const barX = ex - barW / 2;
            const barY = ey - er - 22;
            ctx.fillStyle = 'rgba(255,0,0,0.3)';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = e.health > e.maxHealth * 0.5 ? '#ff0044' : '#ffdd00';
            ctx.fillRect(barX, barY, barW * (e.health / e.maxHealth), barH);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 8px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`BOSS ${Math.floor(e.health)}/${e.maxHealth}`, ex, barY - 3);
        } else {
            // 普通/重型敌人
            const grad = ctx.createRadialGradient(ex, ey, 0, ex, ey, er * 2.5);
            grad.addColorStop(0, e.hitFlash > 0 ? 'rgba(255,255,255,0.4)' : `${color}33`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(ex, ey, er * 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowColor = e.hitFlash > 0 ? '#ffffff' : color;
            ctx.shadowBlur = e.hitFlash > 0 ? 25 : 15;
            ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : color;
            ctx.beginPath();
            ctx.arc(ex, ey, er, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // 眼睛
            const eyeAngle = e.angle;
            const eyeDist = er * 0.4;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex + Math.cos(eyeAngle - 0.3) * eyeDist, ey + Math.sin(eyeAngle - 0.3) * eyeDist, er * 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ex + Math.cos(eyeAngle + 0.3) * eyeDist, ey + Math.sin(eyeAngle + 0.3) * eyeDist, er * 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(ex + Math.cos(eyeAngle - 0.3) * eyeDist + Math.cos(eyeAngle) * 2, ey + Math.sin(eyeAngle - 0.3) * eyeDist + Math.sin(eyeAngle) * 2, er * 0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ex + Math.cos(eyeAngle + 0.3) * eyeDist + Math.cos(eyeAngle) * 2, ey + Math.sin(eyeAngle + 0.3) * eyeDist + Math.sin(eyeAngle) * 2, er * 0.12, 0, Math.PI * 2);
            ctx.fill();

            if (e.type === 'heavy') {
                ctx.strokeStyle = '#ff6600';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(ex, ey, er + 3, 0, Math.PI * 2);
                ctx.stroke();
            }

            // 血条
            const barW = er * 2.5;
            const barH = 3;
            const barX = ex - barW / 2;
            const barY = ey - er - 8;
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = e.health > e.maxHealth * 0.5 ? '#00ff88' : '#ffdd00';
            ctx.fillRect(barX, barY, barW * (e.health / e.maxHealth), barH);
        }
    }
}

function drawParticles() {
    for (let p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
}

function drawFloatingTexts() {
    for (let ft of floatingTexts) {
        ctx.globalAlpha = ft.life;
        ctx.fillStyle = ft.color || '#fff';
        ctx.shadowColor = ft.color || '#fff';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 16px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
}

function drawCrosshair() {
    const cx = mouse.x, cy = mouse.y;
    const size = isScoped ? 6 : 12;
    const gap = isScoped ? 4 : 6;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - size - gap, cy);
    ctx.lineTo(cx - gap, cy);
    ctx.moveTo(cx + gap, cy);
    ctx.lineTo(cx + size + gap, cy);
    ctx.moveTo(cx, cy - size - gap);
    ctx.lineTo(cx, cy - gap);
    ctx.moveTo(cx, cy + gap);
    ctx.lineTo(cx, cy + size + gap);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawScope() {
    const cx = mouse.x, cy = mouse.y;
    const radius = 120;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CW, CH);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - radius - 20, cy);
    ctx.lineTo(cx + radius + 20, cy);
    ctx.moveTo(cx, cy - radius - 20);
    ctx.lineTo(cx, cy + radius + 20);
    ctx.stroke();
    ctx.restore();
}

function drawLevelInfo() {
    // 关卡进度条
    const barW = 200;
    const barH = 6;
    const barX = CW / 2 - barW / 2;
    const barY = 10;
    const progress = game.bossSpawned ? 1 : Math.min(1, game.levelKills / game.killsForLevel);

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = game.bossSpawned ? '#ff0044' : '#00f0ff';
    ctx.fillRect(barX, barY, barW * progress, barH);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    const bossText = game.bossSpawned ? ' 👹 BOSS战!' : '';
    ctx.fillText(`第${game.level}关 ${game.levelKills}/${game.killsForLevel}${bossText}`, CW / 2, barY + 20);
}

// ========== HUD更新 ==========
function updateHUD() {
    let hearts = '';
    const healthPct = player.health / player.maxHealth;
    const heartCount = Math.ceil(healthPct * 5);
    for (let i = 0; i < 5; i++) hearts += i < heartCount ? '❤️' : '🖤';
    healthDisplay.textContent = hearts;
    const wp = WEAPONS[player.weapon];
    weaponDisplay.textContent = wp.name;
    const reloadText = isReloading ? ' 🔄' : '';
    ammoDisplay.textContent = `${player.ammo}/${wp.maxAmmo}${reloadText}`;
    killDisplay.textContent = game.kills;
    if (levelDisplay) levelDisplay.textContent = `第${game.level}关`;
}

// ========== 游戏循环 ==========
function gameLoop(timestamp) {
    if (game.state === 'gameover' || game.state === 'idle') return;
    const dt = Math.min((timestamp - game.lastTime) / 1000, 0.05);
    game.lastTime = timestamp;
    update(dt);
    draw();
    game.animFrame = requestAnimationFrame(gameLoop);
}

// ========== 输入处理 ==========
function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    keys[key] = true;
    if (key === ' ' || key === 'space') { e.preventDefault(); if (game.state === 'playing') reload(); }
    if (game.state !== 'playing') return;
    if (key === '1') { e.preventDefault(); switchWeapon('rifle'); }
    else if (key === '2') { e.preventDefault(); switchWeapon('sniper'); }
    else if (key === '3') { e.preventDefault(); switchWeapon('gatling'); }
    else if (key === '4') { e.preventDefault(); switchWeapon('rocket'); }
    if (key === 'r') { e.preventDefault(); reload(); }
}

function handleKeyUp(e) { keys[e.key.toLowerCase()] = false; }

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CW / rect.width;
    const scaleY = CH / rect.height;
    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;
    mouse.x = Math.max(0, Math.min(CW, mouse.x));
    mouse.y = Math.max(0, Math.min(CH, mouse.y));
}

function handleMouseDown(e) {
    e.preventDefault();
    if (e.button === 0) {
        mouse.down = true;
        if (game.state === 'playing') {
            const wp = WEAPONS[player.weapon];
            if (!wp.auto) fire();
            else fire();
        }
    } else if (e.button === 2) {
        mouse.rightDown = true;
        if (game.state === 'playing' && player.weapon === 'sniper') {
            isScoped = !isScoped;
            scopeOverlay.classList.toggle('active');
            createFloatingText(player.x, player.y - 30, isScoped ? '🎯 开镜' : '🔭 关镜', '#00f0ff');
        }
    }
}

function handleMouseUp(e) {
    if (e.button === 0) mouse.down = false;
    if (e.button === 2) mouse.rightDown = false;
}

// ========== 滚轮切枪 ==========
const WEAPON_LIST = ['rifle', 'sniper', 'gatling', 'rocket'];
function handleWheel(e) {
    e.preventDefault();
    if (game.state !== 'playing') return;
    const idx = WEAPON_LIST.indexOf(player.weapon);
    const dir = e.deltaY > 0 ? 1 : -1;
    let newIdx = idx + dir;
    if (newIdx < 0) newIdx = WEAPON_LIST.length - 1;
    if (newIdx >= WEAPON_LIST.length) newIdx = 0;
    switchWeapon(WEAPON_LIST[newIdx]);
}

// ========== 工具函数 ==========
function createFloatingText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color: color || '#fff', life: 1, decay: 0.025, dy: -1.5 });
}

// ========== 启动 ==========
init();
