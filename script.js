// ==================== 主题切换 ====================
const themeToggle = document.getElementById('themeToggle');

// 从 localStorage 读取主题偏好，默认跟随系统
const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const savedTheme = getPreferredTheme();
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcons(savedTheme);

themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
});

function updateThemeIcons(theme) {
    const sunIcon = themeToggle?.querySelector('.sun-icon');
    const moonIcon = themeToggle?.querySelector('.moon-icon');
    if (theme === 'dark') {
        sunIcon?.style.setProperty('display', 'block');
        moonIcon?.style.setProperty('display', 'none');
    } else {
        sunIcon?.style.setProperty('display', 'none');
        moonIcon?.style.setProperty('display', 'block');
    }
}

// ==================== 搜索功能 ====================
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const allPoems = document.querySelectorAll('.poem');

searchInput?.addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();

    if (query.length < 2) {
        searchResults?.classList.remove('show');
        return;
    }

    const matches = [];
    allPoems.forEach(poem => {
        const title = poem.querySelector('.poem-title')?.textContent || '';
        const content = poem.querySelector('.poem-content')?.textContent || '';

        if (title.toLowerCase().includes(query) || content.toLowerCase().includes(query)) {
            matches.push({ poem, title, content });
        }
    });

    if (matches.length > 0) {
        searchResults.innerHTML = matches.map(m => `
            <div class="search-result-item" data-poem-id="${m.poem.id}">
                <strong>${highlightText(m.title, query)}</strong>
            </div>
        `).join('');
        searchResults?.classList.add('show');

        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const poemId = item.dataset.poemId;
                const targetPoem = document.getElementById(poemId);
                targetPoem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // 高亮效果
                targetPoem?.classList.add('search-highlight');
                setTimeout(() => targetPoem?.classList.remove('search-highlight'), 2000);
                searchResults?.classList.remove('show');
                searchInput.value = '';
            });
        });
    } else {
        searchResults.innerHTML = '<div class="no-results">未找到匹配的诗歌</div>';
        searchResults?.classList.add('show');
    }
});

function highlightText(text, query) {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-result-highlight">$1</span>');
}

// 点击外部关闭搜索结果
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        searchResults?.classList.remove('show');
    }
});

// ==================== 随机推荐 ====================
document.getElementById('randomPoem')?.addEventListener('click', () => {
    const allPoems = Array.from(document.querySelectorAll('.poem'));
    const visiblePoems = allPoems.filter(p => {
        const rect = p.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    });

    // 优先推荐当前视野外的诗
    const candidates = visiblePoems.length < allPoems.length
        ? allPoems.filter(p => !visiblePoems.includes(p))
        : allPoems;

    const randomIndex = Math.floor(Math.random() * candidates.length);
    candidates[randomIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ==================== 复制诗歌 ====================
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const poemId = btn.dataset.poemId;
        const poem = document.getElementById(poemId);
        const title = poem.querySelector('.poem-title')?.textContent || '';
        const author = poem.querySelector('.poem-author')?.textContent || '';
        const content = poem.querySelector('.poem-content')?.textContent.trim() || '';

        const text = `${title}\n${author}\n\n${content}`;

        try {
            await navigator.clipboard.writeText(text);
            showToast('诗歌已复制到剪贴板');
        } catch (err) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('诗歌已复制到剪贴板');
        }
    });
});

// ==================== 分享链接 ====================
document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const poemId = btn.dataset.poemId;
        const url = `${window.location.origin}${window.location.pathname}#${poemId}`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                showToast('链接已复制到剪贴板');
            });
        } else {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = url;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('链接已复制到剪贴板');
        }
    });
});

function showToast(message) {
    // 移除已存在的 toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ==================== 阅读进度条 ====================
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    }
});

// ==================== 滚动淡入动画 ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.poem').forEach(poem => {
    observer.observe(poem);
});

// ==================== 平滑滚动（保留原有功能） ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ==================== 返回顶部按钮 ====================
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTop?.classList.add('show');
    } else {
        backToTop?.classList.remove('show');
    }
});

backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
