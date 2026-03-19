// HanziQuest — UI Components and Animations

const UI = {
  // Show a toast notification
  showToast(message, type = 'info', duration = 2500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.getElementById('toast-container').appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Show XP gain animation
  showXPGain(amount, x, y) {
    const el = document.createElement('div');
    el.className = 'xp-float';
    el.textContent = `+${amount} XP`;
    el.style.left = (x || window.innerWidth / 2) + 'px';
    el.style.top = (y || window.innerHeight / 2) + 'px';
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('animate'));
    setTimeout(() => el.remove(), 1200);
  },

  // Level up overlay
  showLevelUp(level) {
    const overlay = document.getElementById('level-up-overlay');
    const levelNum = overlay.querySelector('.level-number');
    const titleEl = overlay.querySelector('.level-title');
    levelNum.textContent = level;
    titleEl.textContent = RPG.getTitle(level);
    overlay.classList.add('show');
    Audio.playLevelUp();

    // Particles
    this.spawnParticles(overlay.querySelector('.particles-container'), 30);

    setTimeout(() => overlay.classList.remove('show'), 3500);
  },

  // Spawn celebration particles
  spawnParticles(container, count) {
    container.innerHTML = '';
    const colors = ['#f0c040', '#f06060', '#60d080', '#60b0f0', '#e060e0', '#f0a040'];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.setProperty('--x', (Math.random() * 200 - 100) + 'px');
      p.style.setProperty('--y', (Math.random() * -300 - 50) + 'px');
      p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      p.style.setProperty('--delay', (Math.random() * 0.3) + 's');
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      container.appendChild(p);
    }
  },

  // Correct answer flash
  flashCorrect(element) {
    element.classList.add('flash-correct');
    setTimeout(() => element.classList.remove('flash-correct'), 600);
  },

  // Wrong answer flash
  flashWrong(element) {
    element.classList.add('flash-wrong');
    setTimeout(() => element.classList.remove('flash-wrong'), 600);
  },

  // Render stats radar chart (canvas)
  drawRadarChart(canvasId, stats) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 30;

    ctx.clearRect(0, 0, w, h);

    const labels = [
      { key: 'attack', label: 'ATQ', icon: '🗡️' },
      { key: 'defense', label: 'DEF', icon: '🛡️' },
      { key: 'perception', label: 'PER', icon: '👂' },
      { key: 'dexterity', label: 'DEX', icon: '✍️' },
    ];

    const n = labels.length;
    const maxVal = Math.max(50, ...Object.values(stats));

    // Draw grid
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= n; i++) {
        const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
        const rr = r * (ring / 4);
        const x = cx + Math.cos(angle) * rr;
        const y = cy + Math.sin(angle) * rr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw axes
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx.stroke();
    }

    // Draw data
    ctx.beginPath();
    ctx.fillStyle = 'rgba(240, 192, 64, 0.2)';
    ctx.strokeStyle = '#f0c040';
    ctx.lineWidth = 2;
    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const val = stats[labels[idx].key] || 0;
      const angle = (Math.PI * 2 / n) * idx - Math.PI / 2;
      const rr = r * Math.min(val / maxVal, 1);
      const x = cx + Math.cos(angle) * rr;
      const y = cy + Math.sin(angle) * rr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.fill();
    ctx.stroke();

    // Draw data points
    for (let i = 0; i < n; i++) {
      const val = stats[labels[i].key] || 0;
      const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
      const rr = r * Math.min(val / maxVal, 1);
      const x = cx + Math.cos(angle) * rr;
      const y = cy + Math.sin(angle) * rr;
      ctx.beginPath();
      ctx.fillStyle = '#f0c040';
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels
    ctx.fillStyle = '#c0b090';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * (r + 22);
      const y = cy + Math.sin(angle) * (r + 22);
      ctx.fillText(`${labels[i].label} ${stats[labels[i].key] || 0}`, x, y + 4);
    }
  },

  // Render XP bar
  renderXPBar(container, player) {
    const progress = RPG.getLevelProgress(player);
    const currentXP = player.totalXp - RPG.xpForLevel(player.level - 1);
    const neededXP = RPG.xpForLevel(player.level) - RPG.xpForLevel(player.level - 1);

    container.innerHTML = `
      <div class="xp-bar-wrapper">
        <div class="xp-bar-label">Niv. ${player.level} — ${RPG.getTitle(player.level)}</div>
        <div class="xp-bar-track">
          <div class="xp-bar-fill" style="width: ${Math.min(progress * 100, 100)}%"></div>
        </div>
        <div class="xp-bar-text">${currentXP} / ${neededXP} XP</div>
      </div>
    `;
  },

  // Render avatar
  renderAvatar(container, level) {
    const stage = RPG.getAvatarStage(level);
    const avatars = ['🧒', '🧑', '🥷', '🧙', '🐉'];
    const glows = ['none', '#60b0f0', '#a070e0', '#f0c040', '#f06060'];
    container.innerHTML = `
      <div class="avatar-display" style="--glow-color: ${glows[stage]}">
        <span class="avatar-icon">${avatars[stage]}</span>
      </div>
    `;
  },

  // Render streak display
  renderStreak(container, streak) {
    const flames = Math.min(streak.current, 7);
    const flameStr = '🔥'.repeat(Math.max(flames, 0)) || '💤';
    container.innerHTML = `
      <div class="streak-display">
        <div class="streak-flames">${flameStr}</div>
        <div class="streak-count">${streak.current} jour${streak.current !== 1 ? 's' : ''}</div>
        <div class="streak-best">Record : ${streak.best}</div>
      </div>
    `;
  },

  // Animate number counting up
  animateNumber(element, from, to, duration = 800) {
    const start = performance.now();
    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      element.textContent = Math.round(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  // Render 4 mastery axis icons for a word
  renderMasteryIcons(mastery) {
    if (!mastery) mastery = { recognize: false, recall: false, write: false, listen: false };
    const axes = [
      { key: 'recognize', icon: '👁️', label: 'Reconnaître' },
      { key: 'recall', icon: '🧠', label: 'Rappel' },
      { key: 'write', icon: '✍️', label: 'Écriture' },
      { key: 'listen', icon: '👂', label: 'Écoute' },
    ];
    return axes.map(a =>
      `<span class="mastery-icon ${mastery[a.key] ? 'mastery-done' : 'mastery-todo'}" title="${a.label}">${a.icon}</span>`
    ).join('');
  },

  // Screen shake effect
  shake(element, intensity = 5) {
    element.style.animation = 'none';
    element.offsetHeight; // reflow
    element.style.animation = `shake ${intensity > 3 ? '0.4s' : '0.2s'} ease-out`;
  },
};
