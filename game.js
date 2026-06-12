/* ============================================
   弹球游戏 - 核心逻辑 (方案三：风险奖励流)
   LRKK Family · 赛博霓虹风格
   ============================================ */

// ========== DOM 引用 ==========
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const comboDisplay = document.getElementById('comboDisplay');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlaySubtitle = document.getElementById('overlaySubtitle');
const overlayControls = document.getElementById('overlayControls');
const startBtn = document.getElementById('startBtn');

// ========== Canvas 尺寸 ==========
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 800;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// ========== 游戏常量 ==========
const PADDLE_WIDTH = 80;        // 初始更窄，给增长留空间
const PADDLE_HEIGHT = 14;
const PADDLE_RADIUS = 7;
const PADDLE_MAX_WIDTH = 220;   // 挡板最大宽度
const BALL_RADIUS = 8;
const BALL_SPEED_INITIAL = 4;   // 初始更慢，给增长留空间
const BALL_SPEED_MAX = 18;      // 最高速大幅提升
const BRICK_ROWS = 7;
const BRICK_COLS = 8;
const BRICK_WIDTH = 62;
const BRICK_HEIGHT = 22;
const BRICK_PADDING = 6;
const BRICK_TOP_OFFSET = 60;
const BRICK_LEFT_OFFSET = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING)) / 2;

// ========== 游戏状态 ==========
let game = {
    score: 0,
    highScore: parseInt(localStorage.getItem('brickBreakerHighScore')) || 0,
    lives: 5,           // 初始5条命
    combo: 0,
    maxCombo: 0,
    level: 1,
    state: 'idle',      // idle | playing | paused | gameover
    animFrame: null,
    deltaTime: 0,
    lastTime: 0,
    ballSpeedLevel: 1,  // 球速等级显示
    paddleWidthLevel: 1,// 挡板宽度等级显示
};

// ========== 游戏对象 ==========
let paddle = {};
let ball = {};
let bricks = [];
let particles = [];
let floatingTexts = [];
let trail = [];
let powerups = [];
let healDrops = [];     // 回血掉落物（方案三新增）

// ========== 砖块颜色方案 ==========
const BRICK_COLORS = [
    { fill: '#ff00aa', glow: 'rgba(255, 0, 170, 0.6)' },
    { fill: '#ff0066', glow: 'rgba(255, 0, 102, 0.6)' },
    { fill: '#ff6600', glow: 'rgba(255, 102, 0, 0.6)' },
    { fill: '#ffdd00', glow: 'rgba(255, 221, 0, 0.6)' },
    { fill: '#00ff88', glow: 'rgba(0, 255, 136, 0.6)' },
    { fill: '#00f0ff', glow: 'rgba(0, 240, 255, 0.6)' },
    { fill: '#aa00ff', glow: 'rgba(170, 0, 255, 0.6)' },
];

// ========== 初始化 ==========
function init() {
    highScoreDisplay.textContent = game.highScore;
    resetGame();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('click', handleCanvasClick);
    startBtn.addEventListener('click', startGame);
}

function resizeCanvas() {
    const wrapper = document.getElementById('gameWrapper');
    const maxW = window.innerWidth - 20;
    const maxH = window.innerHeight - 80;
    const scale = Math.min(maxW / CANVAS_WIDTH, maxH / CANVAS_HEIGHT, 1);
    canvas.style.width = (CANVAS_WIDTH * scale) + 'px';
    canvas.style.height = (CANVAS_HEIGHT * scale) + 'px';
}

// ========== 重置游戏 ==========
function resetGame() {
    game.score = 0;
    game.lives = 5;
    game.combo = 0;
    game.maxCombo = 0;
    game.level = 1;
    game.ballSpeedLevel = 1;
    game.paddleWidthLevel = 1;
    particles = [];
    floatingTexts = [];
    trail = [];
    powerups = [];
    healDrops = [];

    paddle = {
        x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
        y: CANVAS_HEIGHT - 40,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        targetX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    };

    ball = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 40 - PADDLE_HEIGHT / 2 - BALL_RADIUS,
        radius: BALL_RADIUS,
        dx: 0,
        dy: 0,
        speed: BALL_SPEED_INITIAL,
        attached: true,
        angle: -Math.PI / 2 + (Math.random() - 0.5) * 0.5,
    };

    createBricks();
    updateHUD();
}

function createBricks() {
    bricks = [];
    const colors = BRICK_COLORS;
    for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
            const colorIndex = (row + col) % colors.length;
            const hp = Math.min(row + 1, 3);
            bricks.push({
                x: BRICK_LEFT_OFFSET + col * (BRICK_WIDTH + BRICK_PADDING),
                y: BRICK_TOP_OFFSET + row * (BRICK_HEIGHT + BRICK_PADDING),
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                hp: hp,
                maxHp: hp,
                color: colors[colorIndex],
                alive: true,
                row: row,
                col: col,
                isHealBrick: false,  // 标记是否为回血砖
            });
        }
    }
}

// ========== 生成回血砖（方案三） ==========
function spawnHealBricks(count = 2) {
    // 找到所有已死亡的砖块位置
    const deadBricks = bricks.filter(b => !b.alive);
    if (deadBricks.length === 0) return;

    // 随机选 count 个位置生成回血砖
    const shuffled = [...deadBricks].sort(() => Math.random() - 0.5);
    const toSpawn = Math.min(count, shuffled.length);

    for (let i = 0; i < toSpawn; i++) {
        const db = shuffled[i];
        // 在原位置生成一个回血砖
        bricks.push({
            x: db.x,
            y: db.y,
            width: BRICK_WIDTH,
            height: BRICK_HEIGHT,
            hp: 1,
            maxHp: 1,
            color: { fill: '#ffd700', glow: 'rgba(255, 215, 0, 0.8)' },
            alive: true,
            row: db.row,
            col: db.col,
            isHealBrick: true,
        });
    }

    // 显示提示
    createFloatingText(CANVAS_WIDTH / 2, BRICK_TOP_OFFSET - 10, `✨ 生成了 ${toSpawn} 个回血砖！`, '#ffd700');
}

// ========== 生成回血掉落物（方案三） ==========
function spawnHealDrop(x, y) {
    healDrops.push({
        x: x,
        y: y,
        dy: 1.5,       // 缓慢下落
        size: 10,
        alive: true,
        glow: 0,       // 脉冲动画用
    });
}

function updateHealDrops() {
    for (let i = healDrops.length - 1; i >= 0; i--) {
        const hd = healDrops[i];
        hd.y += hd.dy;
        hd.glow = (hd.glow + 0.05) % (Math.PI * 2);

        // 检查是否被挡板接住
        if (hd.y + hd.size > paddle.y && hd.y - hd.size < paddle.y + paddle.height &&
            hd.x > paddle.x && hd.x < paddle.x + paddle.width) {
            // 回血成功！
            game.lives = Math.min(game.lives + 1, 9);
            createFloatingText(hd.x, hd.y, '❤️ 回血+1!', '#ffd700');
            createExplosion(hd.x, hd.y, '#ffd700', 15);
            updateHUD();
            healDrops.splice(i, 1);
            continue;
        }

        // 超出屏幕消失
        if (hd.y > CANVAS_HEIGHT + 20) {
            healDrops.splice(i, 1);
        }
    }
}

// ========== 开始游戏 ==========
function startGame() {
    resetGame();
    game.state = 'playing';
    overlay.classList.add('hidden');
    launchBall();
    if (game.animFrame) cancelAnimationFrame(game.animFrame);
    game.lastTime = performance.now();
    gameLoop(game.lastTime);
}

function launchBall() {
    if (ball.attached) {
        ball.attached = false;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        ball.dx = Math.cos(angle) * ball.speed;
        ball.dy = Math.sin(angle) * ball.speed;
    }
}

// ========== 游戏结束 ==========
function gameOver() {
    game.state = 'gameover';
    if (game.animFrame) cancelAnimationFrame(game.animFrame);

    if (game.score > game.highScore) {
        game.highScore = game.score;
        localStorage.setItem('brickBreakerHighScore', game.highScore);
        highScoreDisplay.textContent = game.highScore;
    }

    overlay.classList.remove('hidden');
    overlayTitle.textContent = '💥 游戏结束';
    overlaySubtitle.textContent = `最终得分: ${game.score} 分  |  最高连击: ${game.maxCombo}x`;
    overlayControls.innerHTML = `
        <p style="font-size:1.2rem; color:var(--neon-yellow); margin-bottom:8px;">
            🏆 最高分: ${game.highScore}
        </p>
        <p style="font-size:0.8rem; color:var(--text-secondary);">
            球速 Lv.${game.ballSpeedLevel} · 挡板 Lv.${game.paddleWidthLevel}
        </p>
    `;
    startBtn.textContent = '🔄 再来一局';
}

// ========== 胜利 ==========
function victory() {
    game.state = 'idle';
    if (game.animFrame) cancelAnimationFrame(game.animFrame);

    if (game.score > game.highScore) {
        game.highScore = game.score;
        localStorage.setItem('brickBreakerHighScore', game.highScore);
        highScoreDisplay.textContent = game.highScore;
    }

    overlay.classList.remove('hidden');
    overlayTitle.textContent = '🎉 恭喜通关！';
    overlaySubtitle.textContent = `第 ${game.level} 关完成！得分: ${game.score}`;
    overlayControls.innerHTML = `
        <p style="font-size:1.2rem; color:var(--neon-yellow); margin-bottom:8px;">
            🏆 最高分: ${game.highScore}
        </p>
        <p style="font-size:0.8rem; color:var(--text-secondary);">
            球速 Lv.${game.ballSpeedLevel} · 挡板 Lv.${game.paddleWidthLevel}
        </p>
    `;
    startBtn.textContent = '➡️ 下一关';
    game.level++;
}

// ========== 暂停切换 ==========
function togglePause() {
    if (game.state === 'playing') {
        game.state = 'paused';
        overlay.classList.remove('hidden');
        overlayTitle.textContent = '⏸️ 暂停';
        overlaySubtitle.textContent = '按空格键继续';
        overlayControls.innerHTML = '';
        startBtn.textContent = '▶️ 继续';
    } else if (game.state === 'paused') {
        game.state = 'playing';
        overlay.classList.add('hidden');
        game.lastTime = performance.now();
        gameLoop(game.lastTime);
    }
}

// ========== 更新 HUD ==========
function updateHUD() {
    scoreDisplay.textContent = game.score;
    comboDisplay.textContent = game.combo > 0 ? `${game.combo}x` : '0';
    let hearts = '';
    const displayLives = Math.min(game.lives, 9);
    for (let i = 0; i < displayLives; i++) hearts += '❤️';
    livesDisplay.textContent = hearts || '💀';
}

// ========== 粒子系统 ==========
function createExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        const size = 2 + Math.random() * 4;
        particles.push({
            x: x,
            y: y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            size: size,
            life: 1,
            decay: 0.015 + Math.random() * 0.02,
            color: color,
            type: Math.random() > 0.5 ? 'circle' : 'star',
        });
    }
}

function createFloatingText(x, y, text, color) {
    floatingTexts.push({
        x: x,
        y: y,
        text: text,
        color: color,
        life: 1,
        decay: 0.02,
        dy: -2,
    });
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.05;
        p.life -= p.decay;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.dy;
        ft.life -= ft.decay;
        if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

// ========== 碰撞检测 ==========
function ballPaddleCollision() {
    const bx = ball.x, by = ball.y, r = ball.radius;
    const px = paddle.x, py = paddle.y, pw = paddle.width, ph = paddle.height;

    const closestX = Math.max(px, Math.min(bx, px + pw));
    const closestY = Math.max(py, Math.min(by, py + ph));
    const distX = bx - closestX;
    const distY = by - closestY;
    const dist = Math.sqrt(distX * distX + distY * distY);

    if (dist < r) {
        const hitPos = (bx - px) / pw;
        const angle = (hitPos - 0.5) * Math.PI * 0.7;
        const speed = Math.min(Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy) + 0.1, BALL_SPEED_MAX);
        ball.dx = Math.sin(angle) * speed;
        ball.dy = -Math.cos(angle) * speed;
        ball.y = py - r;
        createExplosion(bx, py, '#00f0ff', 8);
        return true;
    }
    return false;
}

function ballBrickCollision() {
    for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        if (!brick.alive) continue;

        const bx = ball.x, by = ball.y, r = ball.radius;
        const rx = brick.x, ry = brick.y, rw = brick.width, rh = brick.height;

        const closestX = Math.max(rx, Math.min(bx, rx + rw));
        const closestY = Math.max(ry, Math.min(by, ry + rh));
        const distX = bx - closestX;
        const distY = by - closestY;
        const dist = Math.sqrt(distX * distX + distY * distY);

        if (dist < r) {
            const overlapX = r - Math.abs(distX);
            const overlapY = r - Math.abs(distY);

            if (overlapX < overlapY) {
                ball.dx = -ball.dx;
            } else {
                ball.dy = -ball.dy;
            }

            brick.hp--;
            if (brick.hp <= 0) {
                brick.alive = false;

                if (brick.isHealBrick) {
                    // === 回血砖被击碎 → 生成金色掉落物 ===
                    createExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, '#ffd700', 30);
                    createFloatingText(brick.x + brick.width / 2, brick.y, '💛 接住它回血!', '#ffd700');
                    spawnHealDrop(brick.x + brick.width / 2, brick.y + brick.height / 2);
                } else {
                    // === 普通砖被击碎 → 三连奖励 + 生成回血砖 ===
                    const points = 10 + (game.combo * 2);
                    game.score += points;
                    game.combo++;
                    if (game.combo > game.maxCombo) game.maxCombo = game.combo;

                    // 奖励1: 球速 +0.5
                    const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                    if (currentSpeed < BALL_SPEED_MAX) {
                        const newSpeed = Math.min(currentSpeed + 0.5, BALL_SPEED_MAX);
                        const ratio = newSpeed / currentSpeed;
                        ball.dx *= ratio;
                        ball.dy *= ratio;
                        game.ballSpeedLevel = Math.floor((newSpeed - BALL_SPEED_INITIAL) / 0.5) + 1;
                    }

                    // 奖励2: 生命 +1
                    game.lives = Math.min(game.lives + 1, 9);

                    // 奖励3: 挡板 +5px
                    paddle.width = Math.min(paddle.width + 5, PADDLE_MAX_WIDTH);
                    game.paddleWidthLevel = Math.floor((paddle.width - PADDLE_WIDTH) / 5) + 1;

                    // 特效
                    createExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color.fill, 25);
                    createFloatingText(brick.x + brick.width / 2, brick.y, `+${points}`, brick.color.fill);

                    // 生成回血砖 × 2
                    spawnHealBricks(2);
                }
            } else {
                createExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color.fill, 8);
            }

            updateHUD();
            return true;
        }
    }
    return false;
}

// ========== 道具系统 ==========
function spawnPowerup(x, y) {
    const types = ['wide', 'life', 'slow', 'score'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerups.push({
        x: x,
        y: y,
        type: type,
        dy: 2,
        size: 12,
        alive: true,
    });
}

function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        p.y += p.dy;

        if (p.y + p.size > paddle.y && p.y - p.size < paddle.y + paddle.height &&
            p.x > paddle.x && p.x < paddle.x + paddle.width) {
            applyPowerup(p);
            powerups.splice(i, 1);
            continue;
        }

        if (p.y > CANVAS_HEIGHT + 20) {
            powerups.splice(i, 1);
        }
    }
}

function applyPowerup(p) {
    switch (p.type) {
        case 'wide':
            paddle.width = Math.min(paddle.width + 20, PADDLE_MAX_WIDTH);
            createFloatingText(p.x, p.y, '📏 加宽!', '#00f0ff');
            break;
        case 'life':
            game.lives = Math.min(game.lives + 1, 9);
            createFloatingText(p.x, p.y, '❤️ +1 生命!', '#ff00aa');
            updateHUD();
            break;
        case 'slow':
            const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            const factor = 0.7;
            ball.dx *= factor;
            ball.dy *= factor;
            createFloatingText(p.x, p.y, '🐢 减速!', '#00ff88');
            break;
        case 'score':
            game.score += 50;
            createFloatingText(p.x, p.y, '💰 +50 分!', '#ffdd00');
            updateHUD();
            break;
    }
}

// ========== 更新逻辑 ==========
function update() {
    // 更新挡板位置（平滑跟随）
    paddle.x += (paddle.targetX - paddle.x) * 0.3;
    paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, paddle.x));

    if (ball.attached) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - BALL_RADIUS;
        return;
    }

    // 更新球位置
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 拖尾轨迹
    trail.push({ x: ball.x, y: ball.y, life: 1 });
    if (trail.length > 15) trail.shift();
    for (let t of trail) t.life -= 0.06;

    // 墙壁碰撞
    if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.dx = -ball.dx; }
    if (ball.x + ball.radius > CANVAS_WIDTH) { ball.x = CANVAS_WIDTH - ball.radius; ball.dx = -ball.dx; }
    if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.dy = -ball.dy; }

    // 球掉落
    if (ball.y + ball.radius > CANVAS_HEIGHT) {
        game.lives--;
        game.combo = 0;
        updateHUD();
        if (game.lives <= 0) {
            gameOver();
            return;
        }
        ball.attached = true;
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - BALL_RADIUS;
        ball.dx = 0;
        ball.dy = 0;
        paddle.width = PADDLE_WIDTH;
        game.ballSpeedLevel = 1;
        game.paddleWidthLevel = 1;
        return;
    }

    // 挡板碰撞
    ballPaddleCollision();

    // 砖块碰撞
    ballBrickCollision();

    // 道具更新
    updatePowerups();

    // 回血掉落物更新（方案三）
    updateHealDrops();

    // 粒子更新
    updateParticles();

    // 检查是否所有砖块都被击碎
    const remaining = bricks.filter(b => b.alive).length;
    if (remaining === 0) {
        victory();
    }
}

// ========== 渲染 ==========
function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawGrid();
    drawTrail();
    drawBricks();
    drawPowerups();
    drawHealDrops();
    drawPaddle();
    drawBall();
    drawParticles();
    drawFloatingTexts();

    // 绘制状态信息
    drawStatusInfo();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
}

function drawTrail() {
    for (let t of trail) {
        if (t.life <= 0) continue;
        ctx.beginPath();
        ctx.arc(t.x, t.y, ball.radius * t.life * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${t.life * 0.3})`;
        ctx.fill();
    }
}

function drawBricks() {
    for (let brick of bricks) {
        if (!brick.alive) continue;

        const x = brick.x, y = brick.y, w = brick.width, h = brick.height;
        const color = brick.color;

        // 发光效果
        const glowSize = brick.isHealBrick ? 15 : 8;
        const gradient = ctx.createRadialGradient(
            x + w / 2, y + h / 2, 0,
            x + w / 2, y + h / 2, w / 2 + glowSize
        );
        gradient.addColorStop(0, color.glow);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - glowSize, y - glowSize, w + glowSize * 2, h + glowSize * 2);

        // 砖块主体
        ctx.fillStyle = color.fill;
        ctx.shadowColor = color.fill;
        ctx.shadowBlur = brick.isHealBrick ? 20 : 10;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 3);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, w - 4, h / 2 - 2, 2);
        ctx.fill();

        // 回血砖特殊标记
        if (brick.isHealBrick) {
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('❤️', x + w / 2, y + h / 2 + 1);
        } else if (brick.maxHp > 1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '10px Orbitron';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(brick.hp, x + w / 2, y + h / 2);
        }
    }
}

function drawPaddle() {
    const x = paddle.x, y = paddle.y, w = paddle.width, h = paddle.height;

    // 发光
    const gradient = ctx.createRadialGradient(
        x + w / 2, y + h / 2, 0,
        x + w / 2, y + h / 2, w / 2 + 20
    );
    gradient.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 20, y - 20, w + 40, h + 40);

    // 挡板主体
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, PADDLE_RADIUS);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 2, w - 8, h / 2 - 2, 4);
    ctx.fill();

    // 边缘光
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, PADDLE_RADIUS);
    ctx.stroke();
}

function drawBall() {
    // 外发光
    const gradient = ctx.createRadialGradient(
        ball.x, ball.y, 0,
        ball.x, ball.y, ball.radius * 3
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.3, 'rgba(0, 240, 255, 0.2)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // 球体
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 球体高光
    ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(ball.x - 2, ball.y - 2, ball.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(ball.x - 3, ball.y - 3, ball.radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
}

function drawPowerups() {
    for (let p of powerups) {
        if (!p.alive) continue;

        const colors = {
            wide: '#00f0ff',
            life: '#ff00aa',
            slow: '#00ff88',
            score: '#ffdd00',
        };
        const symbols = {
            wide: '⬛',
            life: '❤️',
            slow: '🐢',
            score: '💰',
        };

        const color = colors[p.type] || '#fff';

        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbols[p.type], p.x, p.y + 1);
    }
}

function drawHealDrops() {
    for (let hd of healDrops) {
        if (!hd.alive) continue;

        const pulse = Math.sin(hd.glow) * 0.3 + 0.7;

        // 发光
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 25 * pulse;
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(hd.x, hd.y, hd.size * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 心形符号
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❤️', hd.x, hd.y + 1);
    }
}

function drawParticles() {
    for (let p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 5;

        if (p.type === 'star') {
            const size = p.size * p.life;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
                const sx = p.x + Math.cos(angle) * size;
                const sy = p.y + Math.sin(angle) * size;
                if (i === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}

function drawFloatingTexts() {
    for (let ft of floatingTexts) {
        ctx.globalAlpha = ft.life;
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 10;
        ctx.font = 'bold 18px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}

// ========== 绘制状态信息（球速/挡板等级） ==========
function drawStatusInfo() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '11px Orbitron, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`⚡球速 Lv.${game.ballSpeedLevel}`, 10, 10);
    ctx.textAlign = 'right';
    ctx.fillText(`📏挡板 Lv.${game.paddleWidthLevel}`, CANVAS_WIDTH - 10, 10);
}

// ========== 游戏循环 ==========
function gameLoop(timestamp) {
    if (game.state === 'gameover' || game.state === 'idle') return;

    if (game.state === 'paused') {
        draw();
        return;
    }

    const dt = timestamp - game.lastTime;
    game.lastTime = timestamp;

    update();
    draw();

    game.animFrame = requestAnimationFrame(gameLoop);
}

// ========== 输入处理 ==========
function handleKeyDown(e) {
    const key = e.key;

    if (key === ' ' || key === 'Space') {
        e.preventDefault();
        if (game.state === 'playing' && ball.attached) {
            launchBall();
        } else if (game.state === 'playing') {
            togglePause();
        } else if (game.state === 'paused') {
            togglePause();
        }
        return;
    }

    if (game.state !== 'playing') return;

    const step = 20;
    if (key === 'ArrowLeft') {
        e.preventDefault();
        paddle.targetX = Math.max(0, paddle.targetX - step);
    } else if (key === 'ArrowRight') {
        e.preventDefault();
        paddle.targetX = Math.min(CANVAS_WIDTH - paddle.width, paddle.targetX + step);
    }
}

function handleMouseMove(e) {
    if (game.state !== 'playing' && game.state !== 'paused') return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    paddle.targetX = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, mouseX - paddle.width / 2));
}

function handleTouchMove(e) {
    if (game.state !== 'playing' && game.state !== 'paused') return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const touchX = (e.touches[0].clientX - rect.left) * scaleX;
    paddle.targetX = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, touchX - paddle.width / 2));
}

function handleCanvasClick(e) {
    if (game.state === 'playing' && ball.attached) {
        launchBall();
    }
}

// ========== roundRect polyfill for Canvas ==========
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (r > w / 2) r = w / 2;
        if (r > h / 2) r = h / 2;
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        return this;
    };
}

// ========== 启动 ==========
init();
