// ============================================
// LRKK Family - woyaojinbu.xyz
// 交互脚本
// ============================================

// ========== 书架数据 ==========
const books = [
    {
        emoji: '📖',
        title: '定投改变命运',
        author: '李笑来',
        desc: '让时间陪你慢慢变富——普通人也能践行的长期投资策略。',
        tag: '开源书籍',
        link: 'https://github.com/xiaolai/regular-investing-in-box',
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
        link: '',
        detail: '桥水基金创始人 Ray Dalio 总结的生活和工作原则。' 
            + '他相信，通过建立一套系统化的原则，' 
            + '我们可以更有效地应对生活中的各种挑战。' 
            + '这本书分为"生活原则"和"工作原则"两部分，' 
            + '提供了极具实操性的决策框架。'
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

// ========== 渲染书架 ==========
function renderBookshelf() {
    const container = document.getElementById('bookshelfContainer');
    if (!container) return;

    container.innerHTML = books.map((book, index) => `
        <div class="book-card" data-index="${index}">
            <span class="book-emoji">${book.emoji}</span>
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">${book.author}</p>
            <p class="book-desc">${book.desc}</p>
            <span class="book-tag">${book.tag}</span>
        </div>
    `).join('');
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

    document.querySelectorAll('.value-card, .book-card, .about-content').forEach(el => {
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
    const readBtn = document.getElementById('modalReadBtn');

    emoji.textContent = book.emoji;
    title.textContent = book.title;
    author.textContent = book.author;
    detail.textContent = book.detail;

    if (book.link) {
        link.href = book.link;
        link.classList.remove('hidden');
    } else {
        link.classList.add('hidden');
    }

    // 如果有 chapters 配置，显示"在线阅读"按钮
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
        const card = e.target.closest('.book-card');
        if (card) {
            const index = parseInt(card.dataset.index);
            openBookModal(index);
        }
    });
}

function handleModalEvents() {
    const modal = document.getElementById('bookModal');
    const closeBtn = document.getElementById('modalClose');
    const readBtn = document.getElementById('modalReadBtn');

    closeBtn.addEventListener('click', closeBookModal);

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
    // bookContent 是 bookContent.js 中定义的全局变量
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
    currentChapterIndex = 0;

    const overlay = document.getElementById('readerOverlay');
    const title = document.getElementById('readerTitle');
    const tocList = document.getElementById('tocList');

    title.textContent = book.title;
    
    // 生成目录
    tocList.innerHTML = book.chapters.map((ch, i) => `
        <button class="toc-item ${i === 0 ? 'active' : ''}" data-chapter="${i}">${ch.title}</button>
    `).join('');

    // 绑定目录点击事件
    tocList.querySelectorAll('.toc-item').forEach(btn => {
        btn.addEventListener('click', () => {
            loadChapter(parseInt(btn.dataset.chapter));
        });
    });

    // 加载第一章
    loadChapter(0);

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

    // 使用同步方式加载本地 Markdown 文件
    setTimeout(() => {
        const markdown = loadLocalFile(chapter.file);
        if (markdown !== null) {
            const html = marked.parse(markdown);
            content.innerHTML = html;
            content.scrollTop = 0;
        } else {
            content.innerHTML = `
                <div class="reader-loading">
                    ⚠️ 文件加载失败<br>
                    <small>请确保文件存在: ${chapter.file}</small><br><br>
                    <small>提示：如果通过 file:// 协议打开，部分浏览器可能限制本地文件读取。<br>
                    建议使用 VS Code 的 Live Server 扩展，或部署到服务器上访问。</small>
                </div>
            `;
        }
        // 更新导航按钮状态
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

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    renderBookshelf();
    observeElements();
    handleNavbarScroll();
    handleSmoothScroll();
    handleBookClicks();
    handleModalEvents();
    handleReaderEvents();
});
