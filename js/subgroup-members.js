// js/subgroup-members.js
// 分社页面的社员列表渲染（供 subgroups/*/index.html 使用）
// 用法：页面 <body> 上声明 data-subgroup="<分社 id>"，并先加载 js/members-data.js
(function () {
    'use strict';

    const container = document.getElementById('memberList');
    const subgroupId = document.body.dataset.subgroup;
    if (!container || !subgroupId || typeof MEMBERS === 'undefined') return;

    const inSubgroup = (member) => (member.subgroups || []).some((sg) => sg.id === subgroupId);
    const roleOf = (member) => {
        const hit = (member.subgroups || []).find((sg) => sg.id === subgroupId);
        return hit ? (hit.role || '') : '';
    };

    const members = MEMBERS
        .filter(inSubgroup)
        .map((m) => ({ data: m, role: roleOf(m) }))
        .sort((a, b) => (b.role === '社长' ? 1 : 0) - (a.role === '社长' ? 1 : 0));   // 社长排最前

    container.textContent = '';

    members.forEach(({ data, role }) => {
        const card = document.createElement('div');
        card.className = 'member-card';

        const img = document.createElement('img');
        img.className = 'member-avatar';
        img.src = data.avatar;
        img.alt = data.name + '头像';
        img.width = 200;
        img.height = 200;
        img.loading = 'lazy';
        img.decoding = 'async';

        const info = document.createElement('div');
        info.className = 'member-info';

        const name = document.createElement('div');
        name.className = 'member-name';
        name.textContent = data.name;

        const bio = document.createElement('div');
        bio.className = 'member-bio';
        bio.textContent = data.bio || '暂无简介';

        info.append(name, bio);

        if (role) {
            const tag = document.createElement('span');
            tag.className = 'member-tag';
            tag.textContent = role;
            info.append(tag);
        }

        card.append(img, info);
        container.appendChild(card);
    });

    // 交错入场
    const cards = container.querySelectorAll('.member-card');
    cards.forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), i * 120);
    });
})();
