// ============================================
// LRKK Family - lrkk.love
// 交互脚本
// ============================================

// ========== 工具函数 ==========
function safeGet(key, defaultValue) {
    try { return JSON.parse(localStorage.getItem(key)) ?? defaultValue; }
    catch(e) { return defaultValue; }
}
function safeSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch(e) { /* localStorage 不可用 */ }
}

// ========== 主题切换（白天/暗黑/护眼） ==========
function initTheme() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // 主题图标映射
    const themeIcons = { light: '🌙', dark: '☀️', eye: '👁️' };
    const themeLabels = { light: '白天', dark: '暗黑', eye: '护眼' };
    const themeOrder = ['light', 'dark', 'eye'];

    // 设置初始图标
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    toggle.textContent = themeIcons[currentTheme] || '🌙';
    toggle.title = themeLabels[currentTheme] || '白天';

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const idx = themeOrder.indexOf(current);
        const next = themeOrder[(idx + 1) % themeOrder.length];

        if (next === 'light') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', next);
        }
        toggle.textContent = themeIcons[next];
        toggle.title = themeLabels[next];
        safeSet('lrkk-theme', next);
    });
}

// ========== 阅读进度管理 ==========
function saveReadingProgress(bookIndex, chapterIndex) {
    const book = books[bookIndex];
    if (!book || !book.chapters) return;
    const progress = safeGet('lrkk-reading-progress', {});
    progress[bookIndex] = {
        chapter: chapterIndex,
        total: book.chapters.length,
        lastRead: new Date().toISOString().split('T')[0]
    };
    safeSet('lrkk-reading-progress', progress);
    // 更新阅读统计
    updateReadingStats();
}

function loadReadingProgress(bookIndex) {
    const progress = safeGet('lrkk-reading-progress', {});
    return progress[bookIndex] || null;
}

function getBookProgressText(bookIndex) {
    const p = loadReadingProgress(bookIndex);
    if (!p) return '';
    return `📖 ${p.chapter + 1}/${p.total}章`;
}

// ========== 阅读统计 ==========
function updateReadingStats() {
    const progress = safeGet('lrkk-reading-progress', {});
    let totalChapters = 0;
    let totalBooks = 0;
    const dates = new Set();
    Object.values(progress).forEach(p => {
        totalChapters += p.chapter + 1;
        totalBooks++;
        if (p.lastRead) dates.add(p.lastRead);
    });
    // 计算连续阅读天数
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        if (dates.has(key)) streak++;
        else if (i > 0) break;
    }
    return { totalBooks, totalChapters, days: dates.size, streak };
}

// ========== 书架数据 ==========
const books = [
    {
        emoji: '📖',
        title: '定投改变命运',
        author: '李笑来',
        desc: '让时间陪你慢慢变富——普通人也能践行的长期投资策略。',
        tag: '开源书籍',
        link: 'https://ri.firesbox.com/#/cn/',
        linkText: '📖 在线阅读',
        repoLink: 'https://github.com/xiaolai/regular-investing-in-box',
        detail: '李笑来的开源书籍，用通俗易懂的语言讲解定投策略。' 
            + '这不仅是一本关于投资的书，更是一本关于如何通过长期主义思维' 
            + '改变命运的人生指南。书中提出了"定投改变命运"的核心观点，' 
            + '强调通过持续、长期的投入，在时间的作用下实现财富和人生的复利增长。',
        // 本地阅读配置
        chapters: [
            { title: '前言', file: 'books/dingtou.md' },
            { title: '第一章', file: 'books/CH1.md' },
            { title: '第二章', file: 'books/CH2.md' },
            { title: '第三章', file: 'books/CH3.md' },
            { title: '第四章', file: 'books/CH4.md' },
            { title: '第五章', file: 'books/CH5.md' },
            { title: '第六章', file: 'books/CH6.md' },
            { title: '第七章', file: 'books/CH7.md' },
            { title: '第八章', file: 'books/CH8.md' },
            { title: '第九章', file: 'books/CH9.md' },
            { title: '第十章', file: 'books/CH10.md' },
            { title: '第十一章', file: 'books/CH11.md' },
            { title: '第十二章', file: 'books/CH12.md' },
            { title: '第十三章', file: 'books/CH13.md' },
            { title: '结语', file: 'books/Finale.md' }
        ]
    },
    {
        emoji: '📖',
        title: '把时间当作朋友',
        author: '李笑来',
        desc: '运用心智获得解放，开启自我成长之路。',
        tag: '开源书籍',
        link: 'https://github.com/xiaolai/time-as-a-friend',
        detail: '李笑来的经典之作。这本书的核心思想是：' 
            + '我们无法管理时间，我们只能管理自己。' 
            + '通过开启心智、提高思考能力，' 
            + '我们可以用正确的方法做正确的事情，' 
            + '让时间成为我们的朋友而非敌人。'
    },
    {
        emoji: '📖',
        title: '自学是门手艺',
        author: '李笑来',
        desc: '没有自学能力的人没有未来——掌握自学的艺术。',
        tag: '开源书籍',
        link: 'https://github.com/xiaolai/self-teaching',
        detail: '在快速变化的时代，自学能力是最重要的生存技能。' 
            + '这本书系统讲解了如何培养自学能力，' 
            + '从如何阅读、如何思考到如何实践，' 
            + '帮助读者掌握自学的艺术，' 
            + '成为终身学习者。'
    },
    {
        emoji: '🧠',
        title: 'Beyond Feelings',
        author: 'Vincent Ruggiero',
        desc: '批判性思维经典教材，学会独立思考。',
        tag: '经典必读',
        link: '',
        detail: '批判性思维领域的经典教材。' 
            + '这本书教你如何超越感觉和情绪，' 
            + '用理性和逻辑进行独立思考。' 
            + '在这个信息爆炸的时代，' 
            + '批判性思维是每个人都应该掌握的核心能力。'
    },
    {
        emoji: '📚',
        title: 'How to Read a Book',
        author: 'Mortimer Adler',
        desc: '阅读的经典指南，教你如何真正读懂一本书。',
        tag: '经典必读',
        link: '',
        detail: '1940年首次出版，至今仍是关于阅读方法最经典的著作。' 
            + 'Adler 将阅读分为四个层次：基础阅读、检视阅读、分析阅读和主题阅读。' 
            + '这本书教你如何更高效、更深入地阅读，' 
            + '从一本书中获得最大的价值。'
    },
    {
        emoji: '💎',
        title: '穷查理宝典',
        author: 'Charlie Munger',
        desc: '芒格的智慧箴言：多元思维模型与投资哲学。',
        tag: '投资经典',
        link: '',
        detail: '收录了查理·芒格过去20年的公开演讲和思想精华。' 
            + '芒格提倡"多元思维模型"，' 
            + '认为投资者应该从多个学科中汲取智慧，' 
            + '而不是局限于金融领域。' 
            + '这本书是价值投资者的必读经典。'
    },
    {
        emoji: '⚖️',
        title: '原则',
        author: 'Ray Dalio',
        desc: '桥水基金创始人的生活与工作原则，用系统化思维做决策。',
        tag: '思维方法',
        link: 'https://www.principles.com/',
        linkText: '🌐 官方在线阅读',
        detail: '桥水基金创始人 Ray Dalio 总结的生活和工作原则。' 
            + '他相信，通过建立一套系统化的原则，' 
            + '我们可以更有效地应对生活中的各种挑战。' 
            + '这本书分为"生活原则"和"工作原则"两部分，' 
            + '提供了极具实操性的决策框架。'
            + '\n\n📖 官方中文版在线阅读：https://www.principles.com/'
            + '\n支持中文、英文等多语言切换。'
    },
    {
        emoji: '🎯',
        title: '刻意练习',
        author: 'Anders Ericsson',
        desc: '如何从新手到大师？刻意练习是通往卓越的唯一路径。',
        tag: '学习方法',
        link: '',
        detail: '佛罗里达州立大学心理学家 Anders Ericsson 的研究成果。' 
            + '他提出"刻意练习"是成为顶尖专家的关键，' 
            + '而非天赋。这本书颠覆了"天才天生"的传统观念，' 
            + '揭示了任何领域的卓越表现都可以通过正确的练习方法获得。'
    }
];

// ========== 渲染书架（书脊形式） ==========
function renderBookshelf() {
    const container = document.getElementById('bookshelfContainer');
    if (!container) return;

    container.innerHTML = books.map((book, index) => {
        const progress = loadReadingProgress(index);
        const progressPercent = progress ? Math.round(((progress.chapter + 1) / progress.total) * 100) : 0;

        return `
            <div class="book-spine" data-index="${index}" data-color="${index % 14}" title="${book.title} — ${book.author}">
                <span class="book-spine-title">${book.title}</span>
                <span class="book-spine-number">#${String(index + 1).padStart(2, '0')}</span>
                <div class="book-progress-bar">
                    <div class="book-progress-fill" style="width:${progressPercent}%"></div>
                </div>
            </div>
        `;
    }).join('');
}


// ========== 汉堡菜单 ==========
function handleHamburgerMenu() {
    const hamburger = document.getElementById('navHamburger');
    const navLinks = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // 点击导航链接后关闭菜单
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // 点击页面其他区域关闭菜单
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

// ========== 日期显示 ==========
function updateDates() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const navDate = document.getElementById('navDate');
    const heroDate = document.getElementById('heroDate');
    if (navDate) navDate.textContent = dateStr;
    if (heroDate) heroDate.textContent = dateStr;
}

// ========== 滚动渐入效果 ==========
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.blog-card, .book-spine, .decision-card').forEach(el => {

        el.classList.add('fade-in');
        observer.observe(el);
    });
}


// ========== 导航栏滚动效果 ==========
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        navbar.style.boxShadow = currentScroll > 100 ? '0 2px 20px rgba(0, 0, 0, 0.06)' : 'none';
    });
}

// ========== 平滑滚动 ==========
function handleSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ========== 书籍弹窗 ==========
function openBookModal(index) {
    const book = books[index];
    const modal = document.getElementById('bookModal');
    const emoji = document.getElementById('modalEmoji');
    const title = document.getElementById('modalTitle');
    const author = document.getElementById('modalAuthor');
    const detail = document.getElementById('modalDetail');
    const link = document.getElementById('modalLink');
    const repoLink = document.getElementById('modalRepoLink');
    const readBtn = document.getElementById('modalReadBtn');

    emoji.textContent = book.emoji;
    title.textContent = book.title;
    author.textContent = book.author;
    detail.textContent = book.detail;

    // 处理"在线阅读"链接（如果有 linkText 则使用自定义文字）
    if (book.link) {
        link.style.display = 'inline-block';
        link.href = book.link;
        link.textContent = book.linkText || '📖 在线阅读';
    } else {
        link.style.display = 'none';
    }

    // 处理"查看开源仓库"链接
    if (book.repoLink) {
        repoLink.style.display = 'inline-block';
        repoLink.href = book.repoLink;
    } else {
        repoLink.style.display = 'none';
    }

    // 如果有 chapters 配置，显示"本地阅读"按钮
    if (book.chapters && book.chapters.length > 0) {
        readBtn.style.display = 'inline-block';
        readBtn.dataset.index = index;
    } else {
        readBtn.style.display = 'none';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBookModal() {
    const modal = document.getElementById('bookModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleBookClicks() {
    document.getElementById('bookshelfContainer').addEventListener('click', (e) => {
        const spine = e.target.closest('.book-spine');
        if (spine) {
            const index = parseInt(spine.dataset.index);
            openBookModal(index);
        }
    });
}


function handleModalEvents() {
    const modal = document.getElementById('bookModal');
    const closeBtn = document.getElementById('modalClose');
    const readBtn = document.getElementById('modalReadBtn');
    const link = document.getElementById('modalLink');
    const repoLink = document.getElementById('modalRepoLink');

    closeBtn.addEventListener('click', closeBookModal);

    // 点击"在线阅读"链接 - 使用 window.open 确保在 file:// 协议下也能打开
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href !== '#') {
            e.preventDefault();
            e.stopPropagation();
            window.open(href, '_blank');
        }
    });

    // 点击"查看开源仓库"链接
    repoLink.addEventListener('click', (e) => {
        const href = repoLink.getAttribute('href');
        if (href && href !== '#') {
            e.preventDefault();
            e.stopPropagation();
            window.open(href, '_blank');
        }
    });

    readBtn.addEventListener('click', () => {
        const index = parseInt(readBtn.dataset.index);
        closeBookModal();
        setTimeout(() => openReader(index), 300);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeBookModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeBookModal();
        }
    });
}

// ============================================
// 本地 Markdown 阅读器
// ============================================

let currentReaderIndex = -1;
let currentChapterIndex = 0;

// 从内嵌的 bookContent 中获取书籍内容（兼容 file:// 协议，无需网络请求）
function loadLocalFile(filePath) {
    if (typeof bookContent !== 'undefined' && bookContent[filePath]) {
        return bookContent[filePath];
    }
    console.error('书籍内容未找到:', filePath);
    return null;
}

function openReader(bookIndex) {
    const book = books[bookIndex];
    if (!book.chapters || book.chapters.length === 0) return;

    currentReaderIndex = bookIndex;

    const overlay = document.getElementById('readerOverlay');
    const title = document.getElementById('readerTitle');
    const tocList = document.getElementById('tocList');

    title.textContent = book.title;
    
    // 生成目录
    tocList.innerHTML = book.chapters.map((ch, i) => `
        <button class="toc-item" data-chapter="${i}">${ch.title}</button>
    `).join('');

    // 绑定目录点击事件
    tocList.querySelectorAll('.toc-item').forEach(btn => {
        btn.addEventListener('click', () => {
            loadChapter(parseInt(btn.dataset.chapter));
        });
    });

    // 恢复阅读进度
    const saved = loadReadingProgress(bookIndex);
    const startChapter = saved ? saved.chapter : 0;
    currentChapterIndex = startChapter;

    // 加载上次阅读的章节
    loadChapter(startChapter);

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeReader() {
    const overlay = document.getElementById('readerOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    currentReaderIndex = -1;
}

function loadChapter(chapterIndex) {
    const book = books[currentReaderIndex];
    if (!book || !book.chapters || !book.chapters[chapterIndex]) return;

    currentChapterIndex = chapterIndex;
    const chapter = book.chapters[chapterIndex];
    const content = document.getElementById('readerContent');
    const tocItems = document.querySelectorAll('.toc-item');

    // 更新目录高亮
    tocItems.forEach((item, i) => {
        item.classList.toggle('active', i === chapterIndex);
    });

    // 显示加载状态
    content.innerHTML = '<div class="reader-loading">📖 加载中...</div>';

    // 从内嵌数据加载 Markdown 内容
    setTimeout(() => {
        const markdown = loadLocalFile(chapter.file);
        if (markdown !== null) {
            const html = marked.parse(markdown);
            content.innerHTML = html;
            // 添加 heti 中文排版增强
            content.classList.add('heti');
            content.scrollTop = 0;
            // 保存阅读进度
            saveReadingProgress(currentReaderIndex, chapterIndex);
        } else {
            content.innerHTML = `
                <div class="reader-loading">
                    ⚠️ 内容加载失败<br>
                    <small>请确保 bookContent.js 已正确加载</small>
                </div>
            `;
        }
        if (window.updateReaderNav) {
            window.updateReaderNav();
        }
    }, 100);
}

function handleReaderEvents() {
    const overlay = document.getElementById('readerOverlay');
    const backBtn = document.getElementById('readerBack');
    const fontBtn = document.getElementById('readerFontBtn');
    const content = document.getElementById('readerContent');
    const prevBtn = document.getElementById('readerPrevBtn');
    const nextBtn = document.getElementById('readerNextBtn');
    const progress = document.getElementById('readerProgress');

    backBtn.addEventListener('click', closeReader);

    prevBtn.addEventListener('click', () => {
        if (currentChapterIndex > 0) loadChapter(currentChapterIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        const book = books[currentReaderIndex];
        if (book && book.chapters && currentChapterIndex < book.chapters.length - 1) {
            loadChapter(currentChapterIndex + 1);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeReader();
        }
        if (overlay.classList.contains('active')) {
            const book = books[currentReaderIndex];
            if (!book || !book.chapters) return;
            if (e.key === 'ArrowRight' && currentChapterIndex < book.chapters.length - 1) {
                loadChapter(currentChapterIndex + 1);
            } else if (e.key === 'ArrowLeft' && currentChapterIndex > 0) {
                loadChapter(currentChapterIndex - 1);
            }
        }
    });

    // 字体大小切换
    let fontSizeIndex = 0;
    const fontSizes = ['sm', 'md', 'lg'];
    fontBtn.addEventListener('click', () => {
        fontSizeIndex = (fontSizeIndex + 1) % fontSizes.length;
        const size = fontSizes[fontSizeIndex];
        content.className = 'reader-content';
        if (size !== 'md') content.classList.add('font-' + size);
        const labels = { sm: 'A', md: 'Aa', lg: 'A+' };
        fontBtn.textContent = labels[size];
    });

    window.updateReaderNav = function() {
        const book = books[currentReaderIndex];
        if (!book || !book.chapters) return;
        const total = book.chapters.length;
        const current = currentChapterIndex + 1;
        progress.textContent = `${current} / ${total}`;
        prevBtn.disabled = currentChapterIndex === 0;
        nextBtn.disabled = currentChapterIndex >= total - 1;
    };
}

// ============================================
// 博客/读书笔记
// ============================================

function renderBlog() {
    const container = document.getElementById('blogContainer');
    if (!container) return;

    const coverEmojis = ['📝', '✍️', '📖', '💡', '🔍', '🎯', '🧠', '🌟', '📚', '💭'];

    container.innerHTML = blogPosts.map((post, i) => {
        // 从 tags 中识别语言
        const langTag = post.tags.find(t => ['中文', 'English', 'Bilingual'].includes(t));
        const langLabel = langTag || '';

        return `
            <div class="blog-card" data-id="${post.id}">
                <div class="blog-card-cover">${coverEmojis[i % coverEmojis.length]}</div>
                <div class="blog-card-date">${post.date}</div>
                ${langLabel ? `<span class="blog-card-lang">${langLabel}</span>` : ''}
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-summary">${post.summary}</p>
            </div>
        `;
    }).join('');
}


function openBlogModal(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;

    // 创建弹窗
    const overlay = document.createElement('div');
    overlay.className = 'blog-modal-overlay active';
    overlay.innerHTML = `
        <div class="blog-modal-content">
            <button class="blog-modal-close">&times;</button>
            <div class="blog-modal-meta">
                <span class="blog-modal-date">${post.date}</span>
                ${post.tags.map(tag => `<span class="blog-card-tag">${tag}</span>`).join('')}
            </div>
            <div class="blog-modal-body">
                ${marked.parse(post.content)}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // 关闭事件
    overlay.querySelector('.blog-modal-close').addEventListener('click', () => {
        overlay.remove();
        document.body.style.overflow = '';
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
            document.body.style.overflow = '';
        }
    });

    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape' && document.body.contains(overlay)) {
            overlay.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

function handleBlogClicks() {
    const container = document.getElementById('blogContainer');
    if (!container) return;

    container.addEventListener('click', (e) => {
        const card = e.target.closest('.blog-card');
        if (card) {
            const id = parseInt(card.dataset.id);
            openBlogModal(id);
        }
    });
}

// ============================================
// 投资记录/定投日历
// ============================================

function renderInvestment() {
    const statsContainer = document.getElementById('investmentStats');
    const calendarContainer = document.getElementById('investmentCalendar');
    if (!statsContainer || !calendarContainer) return;

    const data = investmentData;
    const stats = data.stats;
    const profit = stats.currentValue - stats.totalInvested;
    const profitPercent = ((profit / stats.totalInvested) * 100).toFixed(1);

    // 渲染统计卡片
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">¥${stats.totalInvested.toLocaleString()}</div>
            <div class="stat-label">累计投入</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">¥${stats.currentValue.toLocaleString()}</div>
            <div class="stat-label">当前市值</div>
        </div>
        <div class="stat-card">
            <div class="stat-value ${profit >= 0 ? '' : ''}" style="color: ${profit >= 0 ? 'var(--accent)' : '#e74c3c'}">${profit >= 0 ? '+' : ''}${profitPercent}%</div>
            <div class="stat-label">收益率</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.totalMonths}个月</div>
            <div class="stat-label">定投时长</div>
        </div>
    `;

    // 渲染日历
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const typeIcons = { invest: '💰', read: '📖', check: '📊' };

    calendarContainer.innerHTML = `
        <div class="calendar-title">📅 ${data.calendar.year}年 定投日历</div>
        ${data.calendar.months.map(m => `
            <div class="calendar-month">
                <div class="calendar-month-title">${monthNames[m.month - 1]}</div>
                ${m.days.map(d => `
                    <div class="calendar-day">
                        <span class="calendar-day-icon">${typeIcons[d.type] || '📌'}</span>
                        <span class="calendar-day-date">${d.date}</span>
                        <span class="calendar-day-note">${d.note}</span>
                        ${d.amount ? `<span class="calendar-day-amount">¥${d.amount}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        `).join('')}
    `;
}

// ============================================
// 家人照片墙
// ============================================

const familyPhotos = [
    { emoji: '👨‍👩‍👧‍👦', label: '全家福', date: '2024-03' },
    { emoji: '🎂', label: '生日派对', date: '2024-02' },
    { emoji: '🏔️', label: '登山旅行', date: '2024-01' },
    { emoji: '🎄', label: '圣诞节', date: '2023-12' },
    { emoji: '🏖️', label: '海边度假', date: '2023-10' },
    { emoji: '🌸', label: '春日野餐', date: '2024-03' },
    { emoji: '🎉', label: '新年聚会', date: '2024-01' },
    { emoji: '🍳', label: '家庭早餐', date: '2024-02' },
];

function renderFamily() {
    const container = document.getElementById('familyContainer');
    if (!container) return;

    container.innerHTML = familyPhotos.map(photo => `
        <div class="family-card">
            <span class="family-card-emoji">${photo.emoji}</span>
            <span class="family-card-date">${photo.date}</span>
            <span class="family-card-label">${photo.label}</span>
        </div>
    `).join('');
}

// ============================================
// 朋友留言板
// ============================================

function loadMessages() {
    try {
        const saved = localStorage.getItem('lrkk-messages');
        return saved ? JSON.parse(saved) : [
            { name: 'LRKK', text: '欢迎来到我们的家族网站！留下你的足迹吧 😊', date: '2024-03-15' },
            { name: '朋友A', text: '祝LRKK家族越来越好！持续建设，慢慢变好 💪', date: '2024-03-14' },
            { name: '朋友B', text: '读书架上的书都很棒，推荐给大家！', date: '2024-03-10' }
        ];
    } catch(e) {
        return [];
    }
}

function saveMessages(messages) {
    try {
        localStorage.setItem('lrkk-messages', JSON.stringify(messages));
    } catch(e) {}
}

function renderMessages() {
    const container = document.getElementById('messagesList');
    if (!container) return;

    const messages = loadMessages();
    container.innerHTML = messages.map(msg => `
        <div class="message-card">
            <div class="message-card-name">${escapeHtml(msg.name)}</div>
            <div class="message-card-date">${msg.date}</div>
            <div class="message-card-text">${escapeHtml(msg.text)}</div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleMessageSubmit() {
    const nameInput = document.getElementById('messageName');
    const textInput = document.getElementById('messageText');
    const submitBtn = document.getElementById('messageSubmit');
    if (!nameInput || !textInput || !submitBtn) return;

    submitBtn.addEventListener('click', () => {
        const name = nameInput.value.trim() || '匿名';
        const text = textInput.value.trim();
        if (!text) {
            alert('请写下你想说的话~');
            return;
        }

        const messages = loadMessages();
        messages.unshift({
            name: name,
            text: text,
            date: new Date().toISOString().split('T')[0]
        });
        saveMessages(messages);
        renderMessages();

        nameInput.value = '';
        textInput.value = '';
    });
}

// ============================================
// 决策记录库 - 本地存储
// ============================================

// 配置
const DECISION_CONFIG = {
    password: '1949',
    storageKey: 'lrkk-decisions'
};

// 决策数据缓存
let decisionsCache = [];
let pendingAction = null; // { type: 'add' | 'edit' | 'delete', id?: string }

// ========== 本地存储操作 ==========

function loadDecisions() {
    try {
        const saved = localStorage.getItem(DECISION_CONFIG.storageKey);
        if (saved) {
            decisionsCache = JSON.parse(saved);
        } else {
            // 初始化决策记录数据（来自 决策记录.docx）
            decisionsCache = [
                {
                    id: 1,
                    title: '购买意外险和急病险',
                    reason: '骑车摔倒事件和不给理赔，意识到需要意外保障。',
                    effect: '后期发生小意外了正常理赔医药费。2026.5.25选择中国人保意外险，对比了人保和支付宝意外险，选择的依据是：人保是国企，医保内90%医保外60%，还有人保有个人客服解答支付宝没有。',
                    improvements: [],
                    createdAt: '2026-05-22T08:00:00.000Z',
                    updatedAt: '2026-05-25T08:00:00.000Z'
                },
                {
                    id: 2,
                    title: '两个30计划：30 box / 30 3056 / 3112',
                    reason: '读定投改变命运产生的想法。数据在未来会越来越重要，要持有一些可增资资产。区块链技术产生了大概率不会消失，金融市场在未来大概率不会消失。',
                    effect: '10年10倍 20年100倍，年化复合回报率20%。',
                    improvements: [],
                    createdAt: '2026-05-22T08:00:00.000Z',
                    updatedAt: '2026-05-22T08:00:00.000Z'
                },
                {
                    id: 3,
                    title: '养兵用兵打仗计划',
                    reason: '看了用兵打仗文章。养兵10-8睡10小时，25分钟一个兵，用这些兵去打仗——阅读、AI、写东西、外语都是仗可打。',
                    effect: '有小额稳定收入。',
                    improvements: [],
                    createdAt: '2026-05-22T08:00:00.000Z',
                    updatedAt: '2026-05-22T08:00:00.000Z'
                },
                {
                    id: 4,
                    title: '改变说话方式：讲因果关系',
                    reason: '听了讲道理信道理的音频。不在情绪高峰讲道理。',
                    effect: '自己是一个经常说因果关系的人，自己的家人也是经常说因果关系的人。',
                    improvements: [],
                    createdAt: '2026-05-23T08:00:00.000Z',
                    updatedAt: '2026-05-23T08:00:00.000Z'
                },
                {
                    id: 5,
                    title: '直播用兵打仗 监督自己',
                    reason: '既能直播也能自己用兵，起到一个陪伴监督的作用。用兵阅读、直播解题、用兵写故事、用兵用AI、用兵学英语韩语、用兵吹笛子、用兵走步健身。',
                    effect: '让自己的用兵打仗的用兵达到6个。',
                    improvements: [],
                    createdAt: '2026-05-24T08:00:00.000Z',
                    updatedAt: '2026-05-24T08:00:00.000Z'
                },
                {
                    id: 6,
                    title: '跨界学习：体验不同角色',
                    reason: '听了第0阶级的语音分享。不断学习其他领域的知识，跨界学习用起来。教培-写东西-用AI，其实也是在过不同的角色，体验不同的角色。',
                    effect: '体验作家的认识，程序员的人生体验。',
                    improvements: [],
                    createdAt: '2026-05-30T08:00:00.000Z',
                    updatedAt: '2026-05-30T08:00:00.000Z'
                },
                {
                    id: 7,
                    title: '健康预防计划（清调补）',
                    reason: '身体健康是根本，预防＞治疗。清调补理念：清除体内毒素，调节自身免疫力，补充优质营养。每人：6瓶活力多+两盒高纤乐(清肠)，5瓶沙棘茶(清泌尿)，两瓶沙蒜软胶囊(清血管)，两瓶矿物粉(调节免疫力)，五桶营养餐(补)。总计4648元。',
                    effect: '40岁50岁时没有基础疾病，体态更健康。',
                    improvements: [],
                    createdAt: '2026-06-04T08:00:00.000Z',
                    updatedAt: '2026-06-04T08:00:00.000Z'
                },
                {
                    id: 8,
                    title: '软件AI要自己去研究探索',
                    reason: '自己花钱了软件没装好，自己整了个寂寞。',
                    effect: '自己先探索，了解机制，不会白花冤枉钱。',
                    improvements: [],
                    createdAt: '2026-06-06T08:00:00.000Z',
                    updatedAt: '2026-06-06T08:00:00.000Z'
                },
                {
                    id: 9,
                    title: '选择组合3056而非SPCX',
                    reason: '有购买SPCX的冲动，最后还是选择组合3056因为组合风险最低。如果买SPCX就是冲情怀，买3056是策略。一个情怀冲动，一个定投改变命运里组合的作用。',
                    effect: '某一个标的后期可能是会涨很多，但还是组合最有保障，组合更稳定。',
                    improvements: [],
                    createdAt: '2026-06-13T08:00:00.000Z',
                    updatedAt: '2026-06-13T08:00:00.000Z'
                },
                {
                    id: 10,
                    title: '早上喝500ml温水',
                    reason: '听医院说药的原理是吸水让便软化好外派，所以早上可以一杯温水。',
                    effect: '自己肠道每天排一次，通畅。',
                    improvements: [],
                    createdAt: '2026-06-15T08:00:00.000Z',
                    updatedAt: '2026-06-15T08:00:00.000Z'
                },
                {
                    id: 11,
                    title: '选商品或服务用最好的',
                    reason: '打出租车、洗洁精要好的，长期来看是省钱。生活中选择商品或服务时，现在前三名的商品或服务，经济允许的情况下用最好的那一个。',
                    effect: '使用中体验感好，长期来看越来越划算。',
                    improvements: [],
                    createdAt: '2026-06-15T08:00:00.000Z',
                    updatedAt: '2026-06-15T08:00:00.000Z'
                },
                {
                    id: 12,
                    title: '每个月读一遍《定投改变命运》',
                    reason: '消化知识或者经验需要很长时间，2个周期8年3000天。',
                    effect: '朗读陪着走完2周期，去实践感知周期。',
                    improvements: [],
                    createdAt: '2026-06-16T08:00:00.000Z',
                    updatedAt: '2026-06-16T08:00:00.000Z'
                }
            ];
            saveDecisions();
        }
        renderDecisions();
    } catch(e) {
        decisionsCache = [];
        renderDecisions();
    }
}

function saveDecisions() {
    try {
        localStorage.setItem(DECISION_CONFIG.storageKey, JSON.stringify(decisionsCache));
    } catch(e) {}
}

// ========== 密码验证 ==========

function verifyPassword(inputPassword) {
    return inputPassword === DECISION_CONFIG.password;
}

function showPasswordModal(action) {
    pendingAction = action;
    document.getElementById('decisionPasswordInput').value = '';
    document.getElementById('decisionPasswordError').style.display = 'none';
    document.getElementById('decisionPasswordModal').classList.add('active');
}

function closePasswordModal() {
    document.getElementById('decisionPasswordModal').classList.remove('active');
    pendingAction = null;
}

// ========== 渲染决策列表 ==========

// 搜索关键词（仅 decisions.html 使用）
let decisionSearchKeyword = '';

function highlightText(text, keyword) {
    if (!keyword) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<span class="decision-highlight">$1</span>');
}

function renderDecisions() {
    const container = document.getElementById('decisionsContainer');
    const countEl = document.getElementById('decisionCount');
    if (!container) return;

    // 按创建时间倒序排列
    const sorted = [...decisionsCache].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (countEl) countEl.textContent = `共 ${sorted.length} 条决策`;

    // 判断当前页面：如果是 decisions.html（独立决策库），显示全部；否则只显示最近3条
    const isDecisionsPage = window.location.pathname.includes('decisions.html');
    const displayList = isDecisionsPage ? sorted : sorted.slice(0, 3);

    // 搜索过滤（仅 decisions.html）
    let filteredList = displayList;
    const searchCountEl = document.getElementById('decisionSearchCount');
    if (isDecisionsPage && decisionSearchKeyword) {
        const kw = decisionSearchKeyword.toLowerCase();
        filteredList = displayList.filter(d =>
            (d.title && d.title.toLowerCase().includes(kw)) ||
            (d.reason && d.reason.toLowerCase().includes(kw)) ||
            (d.effect && d.effect.toLowerCase().includes(kw)) ||
            (d.improvements && d.improvements.some(imp => imp.text.toLowerCase().includes(kw)))
        );
        if (searchCountEl) {
            searchCountEl.textContent = `找到 ${filteredList.length} 条匹配结果`;
        }
    } else {
        if (searchCountEl) searchCountEl.textContent = '';
    }

    if (filteredList.length === 0) {
        container.innerHTML = `
            <div class="decision-empty">
                <span class="decision-empty-icon">🔍</span>
                ${decisionSearchKeyword ? '没有找到匹配的决策记录' : '还没有决策记录'}<br>
                <small style="color:var(--text-muted);font-size:0.8rem;">${decisionSearchKeyword ? '试试其他关键词' : '点击上方「新增决策」开始记录'}</small>
            </div>
        `;
    } else {
        container.innerHTML = filteredList.map(decision => {
            const title = highlightText(decision.title, decisionSearchKeyword);
            const reason = decision.reason ? highlightText(truncateText(decision.reason, 80), decisionSearchKeyword) : '';
            const effect = decision.effect ? highlightText(truncateText(decision.effect, 80), decisionSearchKeyword) : '';
            const improvements = decision.improvements && decision.improvements.length > 0
                ? decision.improvements.map(imp => `<span class="decision-improvement-tag">🔄 ${highlightText(imp.text, decisionSearchKeyword)}</span>`).join('')
                : '';

            return `
            <div class="decision-card" data-id="${decision.id}">
                <div class="decision-card-header">
                    <h3 class="decision-card-title">${title}</h3>
                    <span class="decision-card-date">${formatDate(decision.createdAt)}</span>
                </div>
                ${reason ? `<div class="decision-card-reason">📝 ${reason}</div>` : ''}
                ${effect ? `<div class="decision-card-effect">🎯 ${effect}</div>` : ''}
                ${improvements ? `<div class="decision-card-improvements">${improvements}</div>` : ''}
                <div class="decision-card-actions">
                    <button class="decision-card-btn" onclick="event.stopPropagation(); openDecisionDetail(${decision.id})">📋 查看</button>
                    <button class="decision-card-btn" onclick="event.stopPropagation(); addImprovement(${decision.id})">🔄 改进</button>
                    <button class="decision-card-btn" onclick="event.stopPropagation(); editDecision(${decision.id})">✏️ 编辑</button>
                    <button class="decision-card-btn delete" onclick="event.stopPropagation(); deleteDecision(${decision.id})">🗑️ 删除</button>
                </div>
            </div>
        `}).join('');

        // 点击卡片查看详情
        container.querySelectorAll('.decision-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                openDecisionDetail(id);
            });
        });
    }

    // 渲染 About 区域的最近3条决策
    renderDecisionsMini();
}

function renderDecisionsMini() {
    const miniContainer = document.getElementById('decisionsMiniList');
    if (!miniContainer) return;

    const sorted = [...decisionsCache].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const latest = sorted.slice(0, 3);

    if (latest.length === 0) {
        miniContainer.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:8px 0;">暂无决策记录</div>';
        return;
    }

    miniContainer.innerHTML = latest.map(decision => `
        <div class="decision-mini-card" onclick="openDecisionDetail(${decision.id})">
            <div class="decision-mini-title">${escapeHtml(decision.title)}</div>
            <div class="decision-mini-date">${formatDate(decision.createdAt)}</div>
        </div>
    `).join('');
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function truncateText(text, maxLen) {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== 决策详情弹窗 ==========

function openDecisionDetail(id) {
    const decision = decisionsCache.find(d => d.id === id);
    if (!decision) return;

    const body = document.getElementById('decisionModalBody');
    body.innerHTML = `
        <div style="text-align:left;">
            <div style="font-size:0.7rem;color:var(--text-muted);font-family:var(--font-sans);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">决策记录</div>
            <h3 style="font-family:var(--font-serif);font-size:1.25rem;font-weight:600;color:var(--text);margin:0 0 4px 0;line-height:1.3;">${escapeHtml(decision.title)}</h3>
            <div style="font-size:0.75rem;color:var(--text-muted);font-family:var(--font-sans);margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border);">
                ${formatDate(decision.createdAt)}
                ${decision.updatedAt !== decision.createdAt ? ` · 更新于 ${formatDate(decision.updatedAt)}` : ''}
            </div>

            <div style="margin-bottom:20px;">
                <div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);font-family:var(--font-sans);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">📝 原因</div>
                <div style="font-size:0.9rem;color:var(--text-secondary);line-height:1.7;">${escapeHtml(decision.reason) || '未填写'}</div>
            </div>

            <div style="margin-bottom:20px;">
                <div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);font-family:var(--font-sans);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">🎯 效果</div>
                <div style="font-size:0.9rem;color:var(--accent);line-height:1.7;">${escapeHtml(decision.effect) || '未填写'}</div>
            </div>

            ${decision.improvements && decision.improvements.length > 0 ? `
            <div style="margin-bottom:20px;">
                <div style="font-size:0.7rem;font-weight:600;color:var(--text-muted);font-family:var(--font-sans);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px;">🔄 改进</div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    ${decision.improvements.map(imp => `
                        <div style="background:var(--accent-light);border-radius:6px;padding:10px 14px;">
                            <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">${escapeHtml(imp.text)}</div>
                            <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">${imp.date}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <div style="display:flex;gap:8px;margin-top:24px;padding-top:16px;border-top:1px solid var(--border);">
                <button class="decision-btn" style="flex:1;padding:8px 0;font-size:0.8rem;" onclick="closeDecisionDetail(); addImprovement(${decision.id})">🔄 改进</button>
                <button class="decision-btn" style="flex:1;padding:8px 0;font-size:0.8rem;" onclick="closeDecisionDetail(); editDecision(${decision.id})">✏️ 编辑</button>
                <button class="decision-btn decision-btn-secondary" style="flex:1;padding:8px 0;font-size:0.8rem;" onclick="closeDecisionDetail()">关闭</button>
            </div>
        </div>
    `;

    document.getElementById('decisionModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDecisionDetail() {
    document.getElementById('decisionModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ========== 新增决策 ==========

function openAddDecisionForm() {
    document.getElementById('decisionFormEditId').value = '';
    document.getElementById('decisionFormTitle').textContent = '新增决策';
    document.getElementById('decisionFormTitleInput').value = '';
    document.getElementById('decisionFormReason').value = '';
    document.getElementById('decisionFormEffect').value = '';
    document.getElementById('decisionFormPassword').value = '';
    document.getElementById('decisionFormModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDecisionForm() {
    document.getElementById('decisionFormModal').classList.remove('active');
    document.body.style.overflow = '';
}

function saveDecisionForm() {
    const password = document.getElementById('decisionFormPassword').value;
    if (!verifyPassword(password)) {
        alert('❌ 密码错误，请重试');
        return;
    }

    const editId = document.getElementById('decisionFormEditId').value;
    const title = document.getElementById('decisionFormTitleInput').value.trim();
    const reason = document.getElementById('decisionFormReason').value.trim();
    const effect = document.getElementById('decisionFormEffect').value.trim();

    if (!title) {
        alert('请填写决策标题');
        return;
    }

    if (editId) {
        // 编辑已有决策
        const decision = decisionsCache.find(d => d.id === parseInt(editId));
        if (decision) {
            decision.title = title;
            decision.reason = reason;
            decision.effect = effect;
            decision.updatedAt = new Date().toISOString();
            saveDecisions();
            renderDecisions();
            closeDecisionForm();
            alert('✅ 决策已更新');
        }
    } else {
        // 新增决策
        const newDecision = {
            id: Date.now(),
            title: title,
            reason: reason,
            effect: effect,
            improvements: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        decisionsCache.unshift(newDecision);
        saveDecisions();
        renderDecisions();
        closeDecisionForm();
        alert('✅ 决策已创建');
    }
}

// ========== 编辑决策 ==========

function editDecision(id) {
    const decision = decisionsCache.find(d => d.id === id);
    if (!decision) return;

    showPasswordModal({ type: 'edit', id: id });
}

function openEditForm(id) {
    const decision = decisionsCache.find(d => d.id === id);
    if (!decision) return;

    document.getElementById('decisionFormEditId').value = id;
    document.getElementById('decisionFormTitle').textContent = '编辑决策';
    document.getElementById('decisionFormTitleInput').value = decision.title;
    document.getElementById('decisionFormReason').value = decision.reason;
    document.getElementById('decisionFormEffect').value = decision.effect;
    document.getElementById('decisionFormPassword').value = '';
    document.getElementById('decisionFormModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ========== 添加改进 ==========

function addImprovement(id) {
    showPasswordModal({ type: 'improvement', id: id });
}

function openImprovementForm(id) {
    const improvement = prompt('📝 描述这次改进的内容：');
    if (!improvement || !improvement.trim()) return;

    const decision = decisionsCache.find(d => d.id === id);
    if (!decision) return;

    const today = new Date().toISOString().split('T')[0];
    if (!decision.improvements) decision.improvements = [];
    decision.improvements.push({ text: improvement.trim(), date: today });
    decision.updatedAt = new Date().toISOString();

    saveDecisions();
    renderDecisions();
    alert('✅ 改进已记录');
}

// ========== 删除决策 ==========

function deleteDecision(id) {
    showPasswordModal({ type: 'delete', id: id });
}

function confirmDelete(id) {
    if (!confirm('确定要删除这条决策吗？')) return;

    decisionsCache = decisionsCache.filter(d => d.id !== id);
    saveDecisions();
    renderDecisions();
    alert('✅ 决策已删除');
}

// ========== 决策事件绑定 ==========

function handleDecisionEvents() {
    // 搜索功能（仅 decisions.html）
    const searchInput = document.getElementById('decisionSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            decisionSearchKeyword = e.target.value.trim();
            renderDecisions();
        });
    }

    // 新增决策按钮
    document.getElementById('decisionAddBtn').addEventListener('click', openAddDecisionForm);

    // 表单保存
    document.getElementById('decisionFormSave').addEventListener('click', saveDecisionForm);
    document.getElementById('decisionFormCancel').addEventListener('click', closeDecisionForm);
    document.getElementById('decisionFormClose').addEventListener('click', closeDecisionForm);

    // 详情弹窗关闭
    document.getElementById('decisionModalClose').addEventListener('click', closeDecisionDetail);
    document.getElementById('decisionModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeDecisionDetail();
    });

    // 密码弹窗
    document.getElementById('decisionPasswordConfirm').addEventListener('click', () => {
        const input = document.getElementById('decisionPasswordInput').value;
        if (verifyPassword(input)) {
            const action = pendingAction;
            closePasswordModal();
            if (action) {
                if (action.type === 'edit') {
                    openEditForm(action.id);
                } else if (action.type === 'improvement') {
                    openImprovementForm(action.id);
                } else if (action.type === 'delete') {
                    confirmDelete(action.id);
                }
            }
        } else {
            document.getElementById('decisionPasswordError').style.display = 'block';
        }
    });
    document.getElementById('decisionPasswordCancel').addEventListener('click', closePasswordModal);
    document.getElementById('decisionPasswordClose').addEventListener('click', closePasswordModal);

    // 密码弹窗回车确认
    document.getElementById('decisionPasswordInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('decisionPasswordConfirm').click();
        }
    });

    // 表单弹窗回车保存
    document.getElementById('decisionFormPassword').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('decisionFormSave').click();
        }
    });
}

// ========== 书籍封面 SVG 生成 ==========
const bookCoverColors = [
    { bg: '#2d5a3d', text: '#ffffff', accent: '#4a9e6b' },
    { bg: '#1a3a5c', text: '#ffffff', accent: '#3a7abd' },
    { bg: '#4a2d5a', text: '#ffffff', accent: '#7a4a9e' },
    { bg: '#5a3d2d', text: '#ffffff', accent: '#9e7a4a' },
    { bg: '#3d2d5a', text: '#ffffff', accent: '#6a4a9e' },
    { bg: '#2d5a5a', text: '#ffffff', accent: '#4a9e9e' },
    { bg: '#5a2d3d', text: '#ffffff', accent: '#9e4a6a' },
    { bg: '#3d5a2d', text: '#ffffff', accent: '#6a9e4a' },
];

function generateBookCoverSVG(book, index) {
    const colors = bookCoverColors[index % bookCoverColors.length];
    const title = book.title;
    const author = book.author;
    const emoji = book.emoji;
    
    // 根据标题长度调整字体大小
    const titleFontSize = title.length > 6 ? '18' : '22';
    
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
        <defs>
            <linearGradient id="bg${index}" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="${colors.bg}"/>
                <stop offset="100%" stop-color="${colors.accent}"/>
            </linearGradient>
            <linearGradient id="shine${index}" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="rgba(255,255,255,0.15)"/>
                <stop offset="50%" stop-color="rgba(255,255,255,0)"/>
                <stop offset="100%" stop-color="rgba(255,255,255,0.05)"/>
            </linearGradient>
        </defs>
        <!-- 背景 -->
        <rect width="300" height="400" rx="8" fill="url(#bg${index})"/>
        <!-- 光泽 -->
        <rect width="300" height="400" rx="8" fill="url(#shine${index})"/>
        <!-- 装饰线条 -->
        <line x1="30" y1="60" x2="270" y2="60" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <line x1="30" y1="340" x2="270" y2="340" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
        <!-- Emoji -->
        <text x="150" y="140" text-anchor="middle" font-size="48">${emoji}</text>
        <!-- 书名 -->
        <text x="150" y="210" text-anchor="middle" fill="${colors.text}" font-family="Georgia, 'Noto Serif SC', serif" font-size="${titleFontSize}" font-weight="500">
            ${escapeXml(title)}
        </text>
        <!-- 作者 -->
        <text x="150" y="250" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Inter, sans-serif" font-size="13" font-weight="300">
            ${escapeXml(author)}
        </text>
        <!-- 底部装饰 -->
        <rect x="120" y="290" width="60" height="2" rx="1" fill="rgba(255,255,255,0.3)"/>
        <!-- 页码装饰 -->
        <text x="150" y="320" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-family="Inter, sans-serif" font-size="11">
            LRKK · #${String(index + 1).padStart(2, '0')}
        </text>
    </svg>`;
}

function escapeXml(str) {
    return String(str).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
}

// ========== 书架库搜索 ==========
let bookshelfSearchKeyword = '';

function renderBookshelfGrid() {
    const grid = document.getElementById('bookshelfGrid');
    const countEl = document.getElementById('bookshelfCount');
    if (!grid) return;

    if (countEl) countEl.textContent = books.length;

    // 搜索过滤
    let filtered = books;
    const searchCountEl = document.getElementById('bookshelfSearchCount');
    if (bookshelfSearchKeyword) {
        const kw = bookshelfSearchKeyword.toLowerCase();
        filtered = books.filter(b =>
            (b.title && b.title.toLowerCase().includes(kw)) ||
            (b.author && b.author.toLowerCase().includes(kw)) ||
            (b.tag && b.tag.toLowerCase().includes(kw)) ||
            (b.desc && b.desc.toLowerCase().includes(kw))
        );
        if (searchCountEl) {
            searchCountEl.textContent = `找到 ${filtered.length} 本匹配书籍`;
        }
    } else {
        if (searchCountEl) searchCountEl.textContent = '';
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="bookshelf-empty">
                <span class="bookshelf-empty-icon">🔍</span>
                ${bookshelfSearchKeyword ? '没有找到匹配的书籍' : '书架还是空的'}<br>
                <small style="color:var(--text-muted);font-size:0.8rem;">${bookshelfSearchKeyword ? '试试其他关键词' : ''}</small>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map((book, i) => {
        const originalIndex = books.indexOf(book);
        const progress = loadReadingProgress(originalIndex);
        const progressPercent = progress ? Math.round(((progress.chapter + 1) / progress.total) * 100) : 0;
        const progressText = progress ? `📖 ${progress.chapter + 1}/${progress.total}章` : '未开始阅读';

        const title = highlightBookshelfText(book.title, bookshelfSearchKeyword);
        const author = highlightBookshelfText(book.author, bookshelfSearchKeyword);
        const tag = highlightBookshelfText(book.tag, bookshelfSearchKeyword);
        const desc = highlightBookshelfText(book.desc, bookshelfSearchKeyword);
        const coverSVG = generateBookCoverSVG(book, originalIndex);

        return `
            <div class="book-card" data-index="${originalIndex}">
                <div class="book-card-cover">${coverSVG}</div>
                <div class="book-card-body">
                    <div class="book-card-title">${title}</div>
                    <div class="book-card-author">${author}</div>
                    <span class="book-card-tag">${tag}</span>
                    <div class="book-card-desc">${desc}</div>
                    <div class="book-card-progress">
                        ${progressText}
                        <div class="book-card-progress-bar">
                            <div class="book-card-progress-fill" style="width:${progressPercent}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // 点击卡片打开详情
    grid.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.dataset.index);
            openBookModal(index);
        });
    });
}

function highlightBookshelfText(text, keyword) {
    if (!keyword) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<span class="bookshelf-highlight">$1</span>');
}

// ========== 开源书籍搜索 ==========
let openSearchSource = 'all';
let openSearchResults = [];
let openSearchKeyword = '';

// 数据源配置
const OPEN_SOURCES = {
    weread: { name: '微信读书', icon: '📱', color: '#07c160' },
    github: { name: 'GitHub', icon: '💻', color: '#24292e' },
    gutenberg: { name: '古登堡', icon: '📜', color: '#8b4513' },
    douban: { name: '豆瓣', icon: '📖', color: '#00b51d' },
    openlibrary: { name: 'Open Library', icon: '🌍', color: '#1a5276' }
};

async function searchOpenBooks() {
    const input = document.getElementById('openSearchInput');
    const resultsEl = document.getElementById('openSearchResults');
    const btn = document.getElementById('openSearchBtn');
    const keyword = input.value.trim();
    
    if (!keyword) {
        resultsEl.innerHTML = `<div class="open-search-status"><span class="status-icon">✏️</span>请输入书名或作者</div>`;
        return;
    }

    openSearchKeyword = keyword;
    btn.disabled = true;
    btn.textContent = '搜索中...';
    resultsEl.innerHTML = `<div class="open-search-status"><span class="status-icon">⏳</span>正在搜索 "${keyword}" ...</div>`;

    try {
        const results = [];
        const promises = [];

        // 根据选中的数据源发起搜索
        if (openSearchSource === 'all' || openSearchSource === 'weread') {
            promises.push(searchWeread(keyword).then(r => results.push(...r)));
        }
        if (openSearchSource === 'all' || openSearchSource === 'github') {
            promises.push(searchGitHub(keyword).then(r => results.push(...r)));
        }
        if (openSearchSource === 'all' || openSearchSource === 'gutenberg') {
            promises.push(searchGutenberg(keyword).then(r => results.push(...r)));
        }
        if (openSearchSource === 'all' || openSearchSource === 'douban') {
            promises.push(searchDouban(keyword).then(r => results.push(...r)));
        }
        if (openSearchSource === 'all' || openSearchSource === 'openlibrary') {
            promises.push(searchOpenLibrary(keyword).then(r => results.push(...r)));
        }

        await Promise.allSettled(promises);
        openSearchResults = results;

        if (results.length === 0) {
            resultsEl.innerHTML = `
                <div class="open-search-status">
                    <span class="status-icon">😕</span>
                    没有找到 "${keyword}" 的相关结果<br>
                    <small style="color:var(--text-muted);font-size:0.8rem;">试试其他关键词或数据源</small>
                </div>
            `;
        } else {
            renderOpenResults(results);
        }
    } catch (err) {
        resultsEl.innerHTML = `<div class="open-search-error">❌ 搜索出错：${err.message}</div>`;
    } finally {
        btn.disabled = false;
        btn.textContent = '搜索';
    }
}

function renderOpenResults(results) {
    const resultsEl = document.getElementById('openSearchResults');
    
    resultsEl.innerHTML = results.map((item, i) => {
        const source = OPEN_SOURCES[item.source] || { name: item.source, icon: '📚' };
        const coverHtml = item.cover 
            ? `<img src="${item.cover}" alt="${item.title}" onerror="this.parentElement.innerHTML='📖'">`
            : '📖';

        let linksHtml = '';
        if (item.links && item.links.length > 0) {
            linksHtml = item.links.map(link => 
                `<a href="${link.url}" class="open-result-link ${link.primary ? 'primary' : ''}" target="_blank" rel="noopener">${link.icon || ''} ${link.text}</a>`
            ).join('');
        }

        const metaHtml = [];
        if (item.stars !== undefined) metaHtml.push(`<span class="open-result-stars">⭐ ${item.stars}</span>`);
        if (item.rating !== undefined) metaHtml.push(`<span class="open-result-rating">★ ${item.rating}</span>`);
        if (item.language) metaHtml.push(`<span class="open-result-stars">🔤 ${item.language}</span>`);

        return `
            <div class="open-result-card">
                <div class="open-result-cover">${coverHtml}</div>
                <div class="open-result-info">
                    <div class="open-result-title">${item.title}</div>
                    <div class="open-result-author">${item.author || '未知作者'}</div>
                    <div class="open-result-desc">${item.description || ''}</div>
                    <div class="open-result-meta">
                        <span class="open-result-source">${source.icon} ${source.name}</span>
                        ${metaHtml.join('')}
                    </div>
                    ${linksHtml ? `<div class="open-result-links">${linksHtml}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ----- 微信读书搜索（跳转链接） -----
async function searchWeread(keyword) {
    const encoded = encodeURIComponent(keyword);
    return [{
        source: 'weread',
        title: `在微信读书中搜索 "${keyword}"`,
        author: '',
        description: '点击下方链接，在微信读书中搜索相关书籍。微信读书拥有海量正版电子书资源。',
        cover: '',
        links: [
            { url: `https://weread.qq.com/web/search?q=${encoded}`, text: '📱 在微信读书中搜索', primary: true }
        ]
    }];
}

// ----- GitHub 开源书籍搜索 -----
async function searchGitHub(keyword) {
    try {
        const resp = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(keyword)}+topic:book&sort=stars&per_page=10`);
        if (!resp.ok) throw new Error('GitHub API 请求失败');
        const data = await resp.json();
        
        return data.items.map(item => ({
            source: 'github',
            title: item.name,
            author: item.owner.login,
            description: item.description || '暂无描述',
            cover: item.owner.avatar_url,
            stars: item.stargazers_count,
            language: item.language,
            links: [
                { url: item.html_url, text: '💻 查看仓库', primary: true },
                ...(item.homepage ? [{ url: item.homepage, text: '🌐 在线阅读' }] : [])
            ]
        }));
    } catch (e) {
        console.warn('GitHub 搜索失败:', e);
        return [];
    }
}

// ----- 古登堡计划搜索 -----
async function searchGutenberg(keyword) {
    try {
        const resp = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(keyword)}`);
        if (!resp.ok) throw new Error('Gutendex API 请求失败');
        const data = await resp.json();
        
        return data.results.slice(0, 10).map(item => ({
            source: 'gutenberg',
            title: item.title,
            author: item.authors.map(a => a.name).join(', '),
            description: `古登堡计划免费电子书 · ID: ${item.id}`,
            cover: item.formats['image/jpeg'] || '',
            links: [
                { url: `https://www.gutenberg.org/ebooks/${item.id}`, text: '📜 在线阅读', primary: true },
                ...(item.formats['text/html'] ? [{ url: item.formats['text/html'], text: '📖 HTML版' }] : [])
            ]
        }));
    } catch (e) {
        console.warn('古登堡搜索失败:', e);
        return [];
    }
}

// ----- 豆瓣搜索（使用 JSONP 方式） -----
async function searchDouban(keyword) {
    try {
        // 使用 corsproxy.io 代理豆瓣 API
        const proxyUrl = 'https://corsproxy.io/?';
        const targetUrl = 'https://api.douban.com/v2/book/search?q=' + encodeURIComponent(keyword) + '&count=10';
        const resp = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        if (!resp.ok) throw new Error('豆瓣 API 请求失败');
        const data = await resp.json();
        
        return (data.books || []).map(item => ({
            source: 'douban',
            title: item.title,
            author: item.author ? item.author.join(', ') : '未知',
            description: item.summary || item.subtitle || '',
            cover: item.images && item.images.large ? item.images.large : '',
            rating: item.rating && item.rating.average ? item.rating.average : undefined,
            links: [
                { url: item.alt, text: '📖 查看详情', primary: true }
            ]
        }));
    } catch (e) {
        console.warn('豆瓣搜索失败:', e);
        // 豆瓣搜索失败时不阻塞其他数据源
        return [];
    }
}

// ----- Open Library 搜索 -----
async function searchOpenLibrary(keyword) {
    try {
        const resp = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(keyword)}&limit=10`);
        if (!resp.ok) throw new Error('Open Library API 请求失败');
        const data = await resp.json();
        
        return data.docs.slice(0, 10).map(item => ({
            source: 'openlibrary',
            title: item.title,
            author: item.author_name ? item.author_name.join(', ') : '未知',
            description: `首次出版: ${item.first_publish_year || '未知'} · ${item.subject ? item.subject.slice(0, 3).join(' · ') : ''}`,
            cover: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : '',
            links: [
                { url: `https://openlibrary.org${item.key}`, text: '🌍 在线阅读', primary: true }
            ]
        }));
    } catch (e) {
        console.warn('Open Library 搜索失败:', e);
        return [];
    }
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateDates();
    handleHamburgerMenu();
    handleNavbarScroll();
    handleSmoothScroll();
    observeElements();

    // 判断当前页面
    const isDecisionsPage = window.location.pathname.includes('decisions.html');
    const isBookshelfPage = window.location.pathname.includes('bookshelf.html');

    if (isBookshelfPage) {
        // 书架库页面
        renderBookshelfGrid();
        handleBookClicks();
        handleModalEvents();
        handleReaderEvents();

        // 我的书架搜索事件
        const searchInput = document.getElementById('bookshelfSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                bookshelfSearchKeyword = e.target.value.trim();
                renderBookshelfGrid();
            });
        }

        // 开源书籍搜索事件
        const openSearchBtn = document.getElementById('openSearchBtn');
        const openSearchInput = document.getElementById('openSearchInput');
        if (openSearchBtn && openSearchInput) {
            openSearchBtn.addEventListener('click', searchOpenBooks);
            openSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') searchOpenBooks();
            });
        }

        // 数据源标签切换
        const sourceTags = document.getElementById('openSourceTags');
        if (sourceTags) {
            sourceTags.addEventListener('click', (e) => {
                const btn = e.target.closest('.tag-btn');
                if (!btn) return;
                sourceTags.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                openSearchSource = btn.dataset.source;
                // 如果有搜索结果，重新渲染
                if (openSearchResults.length > 0) {
                    renderOpenResults(openSearchResults);
                }
            });
        }
    } else if (!isDecisionsPage) {
        // 主页特有的模块
        renderBookshelf();
        renderBlog();
        renderInvestment();
        renderFamily();
        renderMessages();
        handleBookClicks();
        handleModalEvents();
        handleReaderEvents();
        handleBlogClicks();
        handleMessageSubmit();
    }

    // 决策记录库初始化（主页和决策库页面都需要）
    if (!isBookshelfPage) {
        handleDecisionEvents();
        loadDecisions();
    }
});

