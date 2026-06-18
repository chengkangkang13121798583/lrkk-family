// ============================================
// 犯错记录 - 数据管理
// ============================================

const MISTAKES_STORAGE_KEY = 'lrkk-mistakes';

// 密码配置
const MISTAKES_CONFIG = {
    password: '1949'
};

function verifyMistakePassword(inputPassword) {
    return inputPassword === MISTAKES_CONFIG.password;
}

// 初始示例数据
const DEFAULT_MISTAKES = [
    {
        id: 'm1',
        mistake: '在项目截止日前一天才发现需求理解有偏差',
        consequence: '导致团队加班赶工，项目延期2天交付，影响了团队士气',
        responsibility: '主动在团队会议上承认错误，并承担了项目延期的责任',
        improvement: '建立需求确认清单，每次收到需求后24小时内书面确认理解无误',
        createdAt: '2026-06-01',
        updatedAt: '2026-06-01'
    },
    {
        id: 'm2',
        mistake: '投资时追涨杀跌，没有遵守定投纪律',
        consequence: '在高点买入，低点卖出，亏损了本金的15%',
        responsibility: '向家人坦诚了投资亏损，并承诺严格执行定投策略',
        improvement: '设置自动定投，减少手动操作；每周复盘一次投资纪律执行情况',
        createdAt: '2026-05-15',
        updatedAt: '2026-05-20'
    },
    {
        id: 'm3',
        mistake: '连续一周没有给家人打电话',
        consequence: '家人担心，关系变得有些疏远',
        responsibility: '立即打电话道歉，并制定了固定的联系计划',
        improvement: '设置每周日晚8点的闹钟提醒给家人打电话，雷打不动',
        createdAt: '2026-04-10',
        updatedAt: '2026-04-10'
    }
];

// ========== 数据读写 ==========

function loadMistakes() {
    try {
        const saved = localStorage.getItem(MISTAKES_STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch(e) {}
    // 首次使用，初始化默认数据
    saveMistakes(DEFAULT_MISTAKES);
    return DEFAULT_MISTAKES;
}

function saveMistakes(mistakes) {
    try {
        localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(mistakes));
    } catch(e) {}
}

// ========== CRUD 操作 ==========

function getAllMistakes() {
    return loadMistakes();
}

function getLatestMistakes(count) {
    const mistakes = loadMistakes();
    // 按创建时间倒序排列
    mistakes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return mistakes.slice(0, count || mistakes.length);
}

function getMistakeById(id) {
    const mistakes = loadMistakes();
    return mistakes.find(m => m.id === id) || null;
}

function addMistake(data) {
    const mistakes = loadMistakes();
    const newMistake = {
        id: 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        mistake: data.mistake || '',
        consequence: data.consequence || '',
        responsibility: data.responsibility || '',
        improvement: data.improvement || '',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
    };
    mistakes.push(newMistake);
    saveMistakes(mistakes);
    return newMistake;
}

function updateMistake(id, data) {
    const mistakes = loadMistakes();
    const index = mistakes.findIndex(m => m.id === id);
    if (index === -1) return null;
    
    mistakes[index] = {
        ...mistakes[index],
        ...data,
        id: mistakes[index].id,
        createdAt: mistakes[index].createdAt,
        updatedAt: new Date().toISOString().split('T')[0]
    };
    saveMistakes(mistakes);
    return mistakes[index];
}

function deleteMistake(id) {
    let mistakes = loadMistakes();
    mistakes = mistakes.filter(m => m.id !== id);
    saveMistakes(mistakes);
}

// ========== 搜索 ==========

function searchMistakes(keyword) {
    if (!keyword || !keyword.trim()) return getAllMistakes();
    const kw = keyword.toLowerCase().trim();
    const mistakes = loadMistakes();
    return mistakes.filter(m =>
        m.mistake.toLowerCase().includes(kw) ||
        m.consequence.toLowerCase().includes(kw) ||
        m.responsibility.toLowerCase().includes(kw) ||
        m.improvement.toLowerCase().includes(kw)
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
