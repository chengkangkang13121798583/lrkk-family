// ============================================
// 价值观库 - 数据管理
// ============================================

const VALUES_STORAGE_KEY = 'lrkk-values';

// 密码配置
const VALUES_CONFIG = {
    password: '1949'
};

function verifyValuePassword(inputPassword) {
    return inputPassword === VALUES_CONFIG.password;
}

// 初始价值观数据
const DEFAULT_VALUES = [
    {
        id: 'fitness',
        label: '健身',
        emoji: '🏋️',
        color: '#ff6b6b',
        description: '身体是革命的本钱。每天坚持运动，保持健康的体魄和充沛的精力。',
        tags: ['跑步', '力量训练', '瑜伽', '游泳'],
        createdAt: '2026-01-01',
        updatedAt: '2026-06-16'
    },
    {
        id: 'reading',
        label: '读书',
        emoji: '📖',
        color: '#4ecdc4',
        description: '读书是性价比最高的自我投资。每天阅读，持续输入，让知识成为复利。',
        tags: ['定投改变命运', '把时间当作朋友', '自学是门手艺', 'Beyond Feelings'],
        createdAt: '2026-01-01',
        updatedAt: '2026-06-16'
    },
    {
        id: 'invest',
        label: '投资',
        emoji: '💰',
        color: '#ffd93d',
        description: '长期主义者的必修课。定投优质资产，让时间陪你慢慢变富。',
        tags: ['定投', '3056组合', '长期主义', '复利'],
        createdAt: '2026-01-01',
        updatedAt: '2026-06-16'
    },
    {
        id: 'family',
        label: '陪家人',
        emoji: '👨‍👩‍👧‍👦',
        color: '#6c5ce7',
        description: '家人是最重要的财富。花时间陪伴，用心经营家庭关系。',
        tags: ['陪伴', '沟通', '理解', '支持'],
        createdAt: '2026-01-01',
        updatedAt: '2026-06-16'
    },
    {
        id: 'friend',
        label: '帮朋友',
        emoji: '🤝',
        color: '#a8e6cf',
        description: '朋友是人生的同行者。真诚相待，互相帮助，共同成长。',
        tags: ['真诚', '互助', '分享', '成长'],
        createdAt: '2026-01-01',
        updatedAt: '2026-06-16'
    }
];

// ========== 数据读写 ==========

function loadValues() {
    try {
        const saved = localStorage.getItem(VALUES_STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch(e) {}
    // 首次使用，初始化默认数据
    saveValues(DEFAULT_VALUES);
    return DEFAULT_VALUES;
}

function saveValues(values) {
    try {
        localStorage.setItem(VALUES_STORAGE_KEY, JSON.stringify(values));
    } catch(e) {}
}

// ========== CRUD 操作 ==========

function getAllValues() {
    return loadValues();
}

function getValueById(id) {
    const values = loadValues();
    return values.find(v => v.id === id) || null;
}

function addValue(valueData) {
    const values = loadValues();
    const newValue = {
        id: 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        label: valueData.label || '未命名',
        emoji: valueData.emoji || '💎',
        color: valueData.color || '#ffffff',
        description: valueData.description || '',
        tags: valueData.tags || [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
    };
    values.push(newValue);
    saveValues(values);
    return newValue;
}

function updateValue(id, valueData) {
    const values = loadValues();
    const index = values.findIndex(v => v.id === id);
    if (index === -1) return null;
    
    values[index] = {
        ...values[index],
        ...valueData,
        id: values[index].id, // 防止 id 被覆盖
        createdAt: values[index].createdAt,
        updatedAt: new Date().toISOString().split('T')[0]
    };
    saveValues(values);
    return values[index];
}

function deleteValue(id) {
    let values = loadValues();
    values = values.filter(v => v.id !== id);
    saveValues(values);
}

// ========== 搜索 ==========

function searchValues(keyword) {
    if (!keyword || !keyword.trim()) return [];
    const kw = keyword.toLowerCase().trim();
    const values = loadValues();
    return values.filter(v =>
        v.label.toLowerCase().includes(kw) ||
        v.description.toLowerCase().includes(kw) ||
        (v.tags && v.tags.some(tag => tag.toLowerCase().includes(kw)))
    ).map(v => v.id);
}
