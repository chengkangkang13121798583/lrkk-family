// ============================================
// 价值观库 - Three.js 3D 球状网络
// ============================================

// ========== 场景初始化 ==========
const container = document.getElementById('threeContainer');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// ========== 控制器 ==========
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;
controls.minDistance = 3;
controls.maxDistance = 20;
controls.target.set(0, 0, 0);

// ========== 灯光 ==========
const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

const dirLight2 = new THREE.DirectionalLight(0x8888ff, 0.3);
dirLight2.position.set(-5, -5, -5);
scene.add(dirLight2);

const pointLight = new THREE.PointLight(0x8b0000, 0.5, 20);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// ========== 背景粒子 ==========
const starGeometry = new THREE.BufferGeometry();
const starCount = 2000;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 200;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// ========== 节点数据 ==========
let valueNodes = []; // { mesh, label, data, connections }
let nodeMeshes = []; // 用于 Raycaster
let highlightedIds = [];

// 颜色映射
const valueColors = {
    fitness: 0xff6b6b,
    reading: 0x4ecdc4,
    invest: 0xffd93d,
    family: 0x6c5ce7,
    friend: 0xa8e6cf
};

// ========== 创建球状网络 ==========
function buildValueNetwork() {
    // 清除旧节点
    valueNodes.forEach(node => {
        scene.remove(node.mesh);
        if (node.connections) {
            node.connections.forEach(line => scene.remove(line));
        }
    });
    valueNodes = [];
    nodeMeshes = [];

    const values = getAllValues();
    const count = values.length;
    if (count === 0) return;

    // 球面坐标分布
    const radius = 2.8;
    const positions = [];

    // 使用 Fibonacci 球体算法均匀分布
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < count; i++) {
        const theta = 2 * Math.PI * i / goldenRatio;
        const phi = Math.acos(1 - 2 * (i + 0.5) / count);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        positions.push({ x, y, z });
    }

    // 创建节点
    values.forEach((value, i) => {
        const pos = positions[i];
        const color = value.color ? parseInt(value.color.replace('#', ''), 16) : 0xffffff;

        // 主球体
        const sphereGeo = new THREE.SphereGeometry(0.25, 32, 32);
        const sphereMat = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.15,
            metalness: 0.3,
            roughness: 0.4,
            clearcoat: 0.3,
            clearcoatRoughness: 0.4
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(pos.x, pos.y, pos.z);
        sphere.castShadow = true;
        sphere.userData = { valueId: value.id };
        scene.add(sphere);

        // 发光光晕
        const glowGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.set(pos.x, pos.y, pos.z);
        scene.add(glow);

        // 连接线
        const connections = [];
        // 每个节点连接到最近的 2-3 个节点
        const distances = positions.map((p, j) => ({
            index: j,
            dist: Math.sqrt(
                (pos.x - p.x) ** 2 +
                (pos.y - p.y) ** 2 +
                (pos.z - p.z) ** 2
            )
        })).filter(d => d.dist > 0.5).sort((a, b) => a.dist - b.dist);

        const connectCount = Math.min(3, distances.length);
        for (let c = 0; c < connectCount; c++) {
            const target = distances[c];
            if (target.index > i) { // 避免重复连线
                const targetPos = positions[target.index];
                const points = [
                    new THREE.Vector3(pos.x, pos.y, pos.z),
                    new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
                ];
                const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                const lineMat = new THREE.LineBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.15,
                    blending: THREE.AdditiveBlending
                });
                const line = new THREE.Line(lineGeo, lineMat);
                scene.add(line);
                connections.push(line);
            }
        }

        valueNodes.push({
            mesh: sphere,
            glow: glow,
            connections: connections,
            data: value,
            position: pos
        });
        nodeMeshes.push(sphere);
    });

    // 更新计数
    document.getElementById('valuesCount').textContent = `${count} 个价值观`;
}

// ========== 高亮节点 ==========
function highlightNodes(ids) {
    highlightedIds = ids || [];
    
    valueNodes.forEach(node => {
        const isHighlighted = highlightedIds.includes(node.data.id);
        const mat = node.mesh.material;
        
        if (isHighlighted) {
            mat.emissiveIntensity = 0.8;
            mat.opacity = 1;
            node.mesh.scale.set(1.5, 1.5, 1.5);
            if (node.glow) {
                node.glow.material.opacity = 0.4;
                node.glow.scale.set(2, 2, 2);
            }
            // 连接线高亮
            node.connections.forEach(line => {
                line.material.opacity = 0.4;
                line.material.color.set(0xffffff);
            });
        } else {
            mat.emissiveIntensity = 0.15;
            mat.opacity = 1;
            node.mesh.scale.set(1, 1, 1);
            if (node.glow) {
                node.glow.material.opacity = 0.12;
                node.glow.scale.set(1, 1, 1);
            }
            node.connections.forEach(line => {
                line.material.opacity = 0.15;
                line.material.color.set(parseInt(node.data.color.replace('#', ''), 16));
            });
        }
    });
}

// ========== 点击交互 ==========
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;

renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodeMeshes);

    if (intersects.length > 0) {
        const hit = intersects[0].object;
        const valueId = hit.userData.valueId;
        if (valueId) {
            openValueCard(valueId);
        }
    }
});

// ========== 卡片弹窗 ==========
function openValueCard(valueId) {
    const value = getValueById(valueId);
    if (!value) return;

    const body = document.getElementById('valueCardBody');
    body.innerHTML = `
        <div style="text-align:center;">
            <span class="value-card-emoji">${value.emoji || '💎'}</span>
            <h3 class="value-card-title">${value.label}</h3>
            <p class="value-card-desc">${value.description || '暂无描述'}</p>
            ${value.tags && value.tags.length > 0 ? `
                <div class="value-card-tags">
                    ${value.tags.map(tag => `<span class="value-card-tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            <div class="value-card-meta">创建于 ${value.createdAt}</div>
            <div class="value-card-actions">
                <button class="value-card-btn primary" onclick="editValueCard('${value.id}')">编辑</button>
                <button class="value-card-btn danger" onclick="deleteValueCard('${value.id}')">删除</button>
            </div>
        </div>
    `;
    document.getElementById('valueCardOverlay').classList.add('active');
}

function closeValueCard() {
    document.getElementById('valueCardOverlay').classList.remove('active');
}

// ========== 密码验证 ==========
let valuePendingAction = null;

function showValuePasswordModal(action) {
    valuePendingAction = action;
    const modal = document.getElementById('valuePasswordModal');
    if (modal) {
        document.getElementById('valuePasswordInput').value = '';
        document.getElementById('valuePasswordError').style.display = 'none';
        modal.classList.add('active');
    }
}

function closeValuePasswordModal() {
    const modal = document.getElementById('valuePasswordModal');
    if (modal) modal.classList.remove('active');
    valuePendingAction = null;
}

// 编辑价值观（需密码验证）
function editValueCard(valueId) {
    showValuePasswordModal({ type: 'edit', id: valueId });
}

function confirmEditValue(valueId) {
    const value = getValueById(valueId);
    if (!value) return;

    const body = document.getElementById('valueCardBody');
    body.innerHTML = `
        <div style="text-align:left;">
            <h3 class="value-card-title" style="margin-bottom:16px;">✏️ 编辑价值观</h3>
            <div class="value-form-group">
                <label class="value-form-label">名称</label>
                <input type="text" class="value-form-input" id="editLabel" value="${value.label}">
            </div>
            <div class="value-form-group">
                <label class="value-form-label">Emoji</label>
                <input type="text" class="value-form-input" id="editEmoji" value="${value.emoji || '💎'}">
            </div>
            <div class="value-form-group">
                <label class="value-form-label">颜色 (十六进制)</label>
                <input type="text" class="value-form-input" id="editColor" value="${value.color || '#ffffff'}">
            </div>
            <div class="value-form-group">
                <label class="value-form-label">描述</label>
                <textarea class="value-form-textarea" id="editDesc">${value.description || ''}</textarea>
            </div>
            <div class="value-form-group">
                <label class="value-form-label">标签 (逗号分隔)</label>
                <input type="text" class="value-form-input" id="editTags" value="${(value.tags || []).join(', ')}">
            </div>
            <div class="value-card-actions" style="margin-top:20px;">
                <button class="value-card-btn primary" onclick="saveEditValue('${value.id}')">💾 保存</button>
                <button class="value-card-btn" onclick="openValueCard('${value.id}')">取消</button>
            </div>
        </div>
    `;
}

function saveEditValue(valueId) {
    const label = document.getElementById('editLabel').value.trim();
    const emoji = document.getElementById('editEmoji').value.trim();
    const color = document.getElementById('editColor').value.trim();
    const description = document.getElementById('editDesc').value.trim();
    const tagsStr = document.getElementById('editTags').value.trim();

    if (!label) {
        alert('请输入价值观名称');
        return;
    }

    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];

    updateValue(valueId, { label, emoji, color, description, tags });
    
    // 重建 3D 网络
    buildValueNetwork();
    highlightNodes(highlightedIds);
    closeValueCard();
}

function deleteValueCard(valueId) {
    showValuePasswordModal({ type: 'delete', id: valueId });
}

function confirmDeleteValue(valueId) {
    if (!confirm('确定要删除这个价值观吗？')) return;
    deleteValue(valueId);
    buildValueNetwork();
    highlightNodes(highlightedIds);
    closeValueCard();
}

// ========== 新增价值观 ==========
function openAddValueCard() {
    const body = document.getElementById('valueCardBody');
    body.innerHTML = `
        <div style="text-align:left;">
            <h3 class="value-card-title" style="margin-bottom:16px;">✨ 新增价值观</h3>
            <div class="value-form-group">
                <label class="value-form-label">名称 *</label>
                <input type="text" class="value-form-input" id="newLabel" placeholder="例如：跑步">
            </div>
            <div class="value-form-group">
                <label class="value-form-label">Emoji</label>
                <input type="text" class="value-form-input" id="newEmoji" placeholder="例如：🏃" value="💎">
            </div>
            <div class="value-form-group">
                <label class="value-form-label">颜色 (十六进制)</label>
                <input type="text" class="value-form-input" id="newColor" placeholder="例如：#ff6b6b" value="#ffffff">
            </div>
            <div class="value-form-group">
                <label class="value-form-label">描述</label>
                <textarea class="value-form-textarea" id="newDesc" placeholder="描述这个价值观..."></textarea>
            </div>
            <div class="value-form-group">
                <label class="value-form-label">标签 (逗号分隔)</label>
                <input type="text" class="value-form-input" id="newTags" placeholder="例如：坚持, 习惯, 健康">
            </div>
            <div class="value-card-actions" style="margin-top:20px;">
                <button class="value-card-btn primary" onclick="saveNewValue()">💾 保存</button>
                <button class="value-card-btn" onclick="closeValueCard()">取消</button>
            </div>
        </div>
    `;
    document.getElementById('valueCardOverlay').classList.add('active');
}

function saveNewValue() {
    const label = document.getElementById('newLabel').value.trim();
    const emoji = document.getElementById('newEmoji').value.trim();
    const color = document.getElementById('newColor').value.trim();
    const description = document.getElementById('newDesc').value.trim();
    const tagsStr = document.getElementById('newTags').value.trim();

    if (!label) {
        alert('请输入价值观名称');
        return;
    }

    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];

    addValue({ label, emoji, color, description, tags });
    
    // 重建 3D 网络
    buildValueNetwork();
    highlightNodes(highlightedIds);
    closeValueCard();
}

// 关闭弹窗事件
document.getElementById('valueCardClose').addEventListener('click', closeValueCard);
document.getElementById('valueCardOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeValueCard();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeValueCard();
});

// ========== 搜索功能 ==========
const searchInput = document.getElementById('valueSearchInput');
let searchTimeout = null;

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const keyword = searchInput.value.trim();
        if (keyword) {
            const ids = searchValues(keyword);
            highlightNodes(ids);
            // 如果有匹配，自动旋转到匹配节点
            if (ids.length > 0) {
                controls.autoRotate = false;
                setTimeout(() => { controls.autoRotate = true; }, 3000);
            }
        } else {
            highlightNodes([]);
        }
    }, 200);
});

// ========== URL 参数处理（从主页跳转过来） ==========
function handleUrlParam() {
    const params = new URLSearchParams(window.location.search);
    const valueParam = params.get('value');
    if (valueParam) {
        // 延迟等场景构建完成
        setTimeout(() => {
            highlightNodes([valueParam]);
            // 找到对应节点位置，旋转相机
            const node = valueNodes.find(n => n.data.id === valueParam);
            if (node) {
                controls.target.set(0, 0, 0);
                // 平滑旋转到节点方向
                const pos = node.position;
                const direction = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
                const camPos = direction.multiplyScalar(5);
                camera.position.set(camPos.x, camPos.y + 1, camPos.z);
                controls.update();
            }
        }, 500);
    }
}

// ========== 窗口自适应 ==========
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ========== 动画循环 ==========
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // 星星缓慢旋转
    stars.rotation.y += 0.0001;
    stars.rotation.x += 0.00005;

    // 节点微弱的呼吸动画
    valueNodes.forEach((node, i) => {
        const breathe = Math.sin(Date.now() * 0.001 + i * 0.5) * 0.03 + 1;
        if (!highlightedIds.includes(node.data.id)) {
            node.mesh.scale.set(breathe, breathe, breathe);
        }
    });

    renderer.render(scene, camera);
}

// ========== 启动 ==========
buildValueNetwork();
handleUrlParam();
animate();
