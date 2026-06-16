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

// ========== 暗黑模式 ==========
function initTheme() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    toggle.textContent = isDark ? '☀️' : '🌙';
    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '');
        toggle.textContent = next === 'dark' ? '☀️' : '🌙';
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
            // 初始化示例数据
            decisionsCache = [
                {
                    id: 1,
                    title: '开始长期定投计划',
                    reason: '认识到定投是普通人最可靠的财富积累方式，通过长期持有优质资产享受复利效应。',
                    effect: '每月固定投入，无论市场涨跌，坚持 10 年以上，实现财富的稳健增长。',
                    improvements: [
                        { text: '将定投频率从每月改为每周，降低择时风险', date: '2024-06-01' },
                        { text: '增加债券 ETF 配置，平衡投资组合风险', date: '2024-09-15' }
                    ],
                    createdAt: '2024-01-15T08:00:00.000Z',
                    updatedAt: '2024-09-15T10:30:00.000Z'
                },
                {
                    id: 2,
                    title: '建立每日阅读习惯',
                    reason: '阅读是提升认知最有效的方式，但之前总是断断续续，需要建立持续的习惯。',
                    effect: '每天至少阅读 30 分钟，一年读完 20 本好书，形成系统的知识体系。',
                    improvements: [
                        { text: '从纸质书切换到电子书+听书结合，利用碎片时间', date: '2024-03-10' },
                        { text: '建立读书笔记模板，每读完一本写一篇总结', date: '2024-05-20' },
                        { text: '加入读书社群，每周分享读书心得', date: '2024-08-01' }
                    ],
                    createdAt: '2024-01-10T08:00:00.000Z',
                    updatedAt: '2024-08-01T14:00:00.000Z'
                },
                {
                    id: 3,
                    title: '每周家庭日计划',
                    reason: '工作忙碌导致陪伴家人的时间越来越少，需要刻意安排家庭时间。',
                    effect: '每周至少有一天完全放下工作，全身心陪伴家人，增进家庭关系。',
                    improvements: [
                        { text: '固定周日为家庭日，提前规划活动内容', date: '2024-04-05' }
                    ],
                    createdAt: '2024-02-20T08:00:00.000Z',
                    updatedAt: '2024-04-05T09:00:00.000Z'
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

function renderDecisions() {
    const container = document.getElementById('decisionsContainer');
    const countEl = document.getElementById('decisionCount');
    if (!container) return;

    // 按创建时间倒序排列
    const sorted = [...decisionsCache].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    countEl.textContent = `共 ${sorted.length} 条决策`;

    if (sorted.length === 0) {
        container.innerHTML = `
            <div class="decision-empty">
                <span class="decision-empty-icon">📋</span>
                还没有决策记录<br>
                <small style="color:var(--text-muted);font-size:0.8rem;">点击上方「新增决策」开始记录</small>
            </div>
        `;
        return;
    }

    container.innerHTML = sorted.map(decision => `
        <div class="decision-card" data-id="${decision.id}">
            <div class="decision-card-header">
                <h3 class="decision-card-title">${escapeHtml(decision.title)}</h3>
                <span class="decision-card-date">${formatDate(decision.createdAt)}</span>
            </div>
            ${decision.reason ? `<div class="decision-card-reason">📝 ${escapeHtml(truncateText(decision.reason, 80))}</div>` : ''}
            ${decision.effect ? `<div class="decision-card-effect">🎯 ${escapeHtml(truncateText(decision.effect, 80))}</div>` : ''}
            ${decision.improvements && decision.improvements.length > 0 ? `
                <div class="decision-card-improvements">
                    ${decision.improvements.map(imp => `<span class="decision-improvement-tag">🔄 ${escapeHtml(imp.text)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="decision-card-actions">
                <button class="decision-card-btn" onclick="event.stopPropagation(); openDecisionDetail(${decision.id})">📋 查看</button>
                <button class="decision-card-btn" onclick="event.stopPropagation(); addImprovement(${decision.id})">🔄 改进</button>
                <button class="decision-card-btn" onclick="event.stopPropagation(); editDecision(${decision.id})">✏️ 编辑</button>
                <button class="decision-card-btn delete" onclick="event.stopPropagation(); deleteDecision(${decision.id})">🗑️ 删除</button>
            </div>
        </div>
    `).join('');

    // 点击卡片查看详情
    container.querySelectorAll('.decision-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            openDecisionDetail(id);
        });
    });
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
        <h3 class="decision-detail-title">${escapeHtml(decision.title)}</h3>
        <p class="decision-detail-date">创建于 ${formatDate(decision.createdAt)}${decision.updatedAt !== decision.createdAt ? ` · 更新于 ${formatDate(decision.updatedAt)}` : ''}</p>
        
        <div class="decision-detail-section">
            <div class="decision-detail-section-title">📝 决策产生原因</div>
            <div class="decision-detail-section-content">${escapeHtml(decision.reason) || '未填写'}</div>
        </div>
        
        <div class="decision-detail-section">
            <div class="decision-detail-section-title">🎯 期望的效果</div>
            <div class="decision-detail-section-content">${escapeHtml(decision.effect) || '未填写'}</div>
        </div>
        
        <div class="decision-detail-section">
            <div class="decision-detail-section-title">🔄 改进更新</div>
            ${decision.improvements && decision.improvements.length > 0 ? `
                <div class="decision-detail-improvements">
                    ${decision.improvements.map(imp => `
                        <div class="decision-detail-improvement">
                            ${escapeHtml(imp.text)}
                            <div class="decision-detail-improvement-date">${imp.date}</div>
                        </div>
                    `).join('')}
                </div>
            ` : '<div class="decision-detail-section-content" style="color:var(--text-muted);">暂无改进记录</div>'}
        </div>
        
        <div class="decision-detail-actions">
            <button class="decision-btn" onclick="closeDecisionDetail(); addImprovement(${decision.id})">🔄 添加改进</button>
            <button class="decision-btn" onclick="closeDecisionDetail(); editDecision(${decision.id})">✏️ 编辑</button>
            <button class="decision-btn decision-btn-secondary" onclick="closeDecisionDetail()">关闭</button>
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

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateDates();
    renderBookshelf();
    renderBlog();
    renderInvestment();

    renderFamily();
    renderMessages();
    observeElements();
    handleNavbarScroll();
    handleSmoothScroll();
    handleBookClicks();
    handleModalEvents();
    handleReaderEvents();
    handleBlogClicks();
    handleMessageSubmit();
    handleHamburgerMenu();
    // 决策记录库初始化
    handleDecisionEvents();
    loadDecisions();
});

