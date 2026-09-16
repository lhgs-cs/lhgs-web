// js/site.js
// 联合公社 - 全站公共脚本
(function () {
    'use strict';

    // 页脚年份：避免每年手改多个页面
    const yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // 顶部导航栏滚动阴影
    const topBar = document.getElementById('topBar');
    if (topBar) {
        const onScroll = () => topBar.classList.toggle('scrolled', window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // 滚动到可视区时淡入
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        reveals.forEach((el) => revealObserver.observe(el));
    } else {
        // 不支持 IntersectionObserver 时直接显示，避免内容永久隐藏
        reveals.forEach((el) => el.classList.add('visible'));
    }
})();
