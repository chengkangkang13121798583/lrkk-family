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
        tag: '开源书籍'
    },
    {
        emoji: '📖',
        title: '把时间当作朋友',
        author: '李笑来',
        desc: '运用心智获得解放，开启自我成长之路。',
        tag: '开源书籍'
    },
    {
        emoji: '📖',
        title: '自学是门手艺',
        author: '李笑来',
        desc: '没有自学能力的人没有未来——掌握自学的艺术。',
        tag: '开源书籍'
    },
    {
        emoji: '🧠',
        title: 'Beyond Feelings',
        author: 'Vincent Ruggiero',
        desc: '批判性思维经典教材，学会独立思考。',
        tag: '经典必读'
    },
    {
        emoji: '📚',
        title: 'How to Read a Book',
        author: 'Mortimer Adler',
        desc: '阅读的经典指南，教你如何真正读懂一本书。',
        tag: '经典必读'
    },
    {
        emoji: '💎',
        title: '穷查理宝典',
        author: 'Charlie Munger',
        desc: '芒格的智慧箴言：多元思维模型与投资哲学。',
        tag: '投资经典'
    },
    {
        emoji: '⚖️',
        title: '原则',
        author: 'Ray Dalio',
        desc: '桥水基金创始人的生活与工作原则，用系统化思维做决策。',
        tag: '思维方法'
    },
    {
        emoji: '🎯',
        title: '刻意练习',
        author: 'Anders Ericsson',
        desc: '如何从新手到大师？刻意练习是通往卓越的唯一路径。',
        tag: '学习方法'
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

    // 观察所有需要动画的元素
    document.querySelectorAll('.value-card, .book-card, .about-content').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ========== 导航栏滚动效果 ==========
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.06)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// ========== 平滑滚动（兼容不支持 scroll-behavior 的浏览器） ==========
function handleSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    renderBookshelf();
    observeElements();
    handleNavbarScroll();
    handleSmoothScroll();
});
