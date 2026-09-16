// js/particles.js
// 联合公社 - 全站共用的粒子背景效果
// 使用前需在页面中放置：<canvas id="particles-canvas"></canvas>
// 未放置 canvas 的页面会自动跳过，不会报错。
(function () {
    'use strict';

    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    // 尊重「减少动态效果」偏好：不启动动画循环，直接不渲染
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.style.display = 'none';
        return;
    }

    const ctx = canvas.getContext('2d');
    const mouse = { x: -9999, y: -9999 };

    let vw = 0, vh = 0, pageHeight = 0, particles = [], animId = null;
    let lastScrollY = window.scrollY;
    let dpr = 1;

    const colors = [
        'rgba(29,85,120,',    // 靛
        'rgba(44,107,143,',   // 靛蓝亮
        'rgba(20,63,92,',     // 靛深
        'rgba(168,58,46,',    // 朱红
        'rgba(176,141,79,'    // 金
    ];

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    document.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    function resize() {
        // 高 DPI 屏按 2 倍渲染即可，再高只是白白增加填充率
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        vw = window.innerWidth;
        vh = window.innerHeight;
        canvas.width = Math.round(vw * dpr);
        canvas.height = Math.round(vh * dpr);
        canvas.style.width = vw + 'px';
        canvas.style.height = vh + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        pageHeight = document.documentElement.scrollHeight;
    }

    function createParticle(fadeIn) {
        const colorBase = colors[Math.random() < 0.75 ? Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 2)];
        const scrollY = window.scrollY;
        const yMin = fadeIn ? scrollY : 0;
        const yMax = fadeIn ? scrollY + vh : pageHeight;
        return {
            x: Math.random() * vw,
            y: yMin + Math.random() * (yMax - yMin),
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.18 - 0.08,
            radius: Math.random() * 2.5 + 1,
            color: colorBase,
            alpha: fadeIn ? 0 : (Math.random() * 0.4 + 0.15),
            targetAlpha: Math.random() * 0.4 + 0.15,
            alphaDir: (Math.random() - 0.5) * 0.005,
            fadingOut: false,
            fadingIn: !!fadeIn
        };
    }

    function createParticles() {
        const count = Math.min(Math.floor((vw * vh) / 18000), 80);
        particles = [];
        for (let i = 0; i < count; i++) particles.push(createParticle(false));
    }

    function update(scrollY) {
        const scrollDelta = scrollY - lastScrollY;
        lastScrollY = scrollY;

        // 快速滚动时让粒子跟随页面，避免视觉抖动
        if (Math.abs(scrollDelta) > 20) {
            const compensation = scrollDelta * 0.7;
            for (let k = 0; k < particles.length; k++) particles[k].y += compensation;
        }

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const screenY = p.y - scrollY;

            const dx = p.x - mouse.x;
            const dy = screenY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150 && dist > 0) {
                const force = (150 - dist) / 150 * 0.3;
                p.vx += (dx / dist) * force;
                p.vy += (dy / dist) * force;
            }

            p.vx *= 0.99;
            p.vy *= 0.99;
            p.x += p.vx;
            p.y += p.vy;

            if (p.fadingIn) {
                p.alpha += 0.012;
                if (p.alpha >= p.targetAlpha) {
                    p.alpha = p.targetAlpha;
                    p.fadingIn = false;
                }
            }

            if (!p.fadingIn && !p.fadingOut) {
                p.alpha += p.alphaDir;
                if (p.alpha > 0.55 || p.alpha < 0.1) p.alphaDir *= -1;
            }

            const margin = 250;
            const viewY = p.y - scrollY;
            const outOfView = p.x < -margin || p.x > vw + margin || viewY < -margin || viewY > vh + margin;
            if (outOfView) {
                p.fadingOut = true;
            } else if (p.fadingOut && !p.fadingIn) {
                p.fadingOut = false;
                if (p.alpha < 0.1) p.alpha = 0.1;
            }

            if (p.fadingOut) {
                p.alpha -= 0.008;
                if (p.alpha <= 0) particles[i] = createParticle(true);
            }
        }
    }

    function drawParticle(p, scrollY) {
        const screenY = p.y - scrollY;
        if (screenY < -20 || screenY > vh + 20) return;
        ctx.beginPath();
        ctx.arc(p.x, screenY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha.toFixed(3) + ')';
        ctx.fill();
    }

    function drawLines(scrollY) {
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
            const pi = particles[i];
            const si = pi.y - scrollY;
            if (si < -maxDist || si > vh + maxDist) continue;
            for (let j = i + 1; j < particles.length; j++) {
                const pj = particles[j];
                const sj = pj.y - scrollY;
                if (sj < -maxDist || sj > vh + maxDist) continue;
                const dx = pi.x - pj.x;
                const dy = si - sj;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(pi.x, si);
                    ctx.lineTo(pj.x, sj);
                    ctx.strokeStyle = 'rgba(29,85,120,' + alpha.toFixed(3) + ')';
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        const scrollY = window.scrollY;   // 每帧只读一次，避免重复触发布局查询
        ctx.clearRect(0, 0, vw, vh);
        update(scrollY);
        drawLines(scrollY);
        for (let i = 0; i < particles.length; i++) drawParticle(particles[i], scrollY);
        animId = requestAnimationFrame(animate);
    }

    function init() {
        resize();
        createParticles();
        if (animId) cancelAnimationFrame(animId);
        animId = requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(() => {
        pageHeight = document.documentElement.scrollHeight;
    });
    resizeObserver.observe(document.documentElement);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resize();
            createParticles();
        }, 150);
    });

    // 页面切到后台时停掉动画循环，省电
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (animId) {
                cancelAnimationFrame(animId);
                animId = null;
            }
        } else if (!animId) {
            lastScrollY = window.scrollY;
            animId = requestAnimationFrame(animate);
        }
    });

    init();
})();
