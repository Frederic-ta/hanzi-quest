// HanziQuest — Skill Tree System

const SKILL_BRANCHES = [
  {
    id: 'parleur',
    name: 'Voie du Parleur',
    icon: '🗣️',
    color: '#60b0f0',
    description: 'Maîtrise de la prononciation',
    nodes: [
      { id: 'p1', name: 'Tons de base', desc: 'Reconnaître les 4 tons', cost: 1, requires: [], stat: 'attack', bonus: 5 },
      { id: 'p2', name: 'Pinyin fluide', desc: 'Lecture rapide du pinyin', cost: 2, requires: ['p1'], stat: 'attack', bonus: 8 },
      { id: 'p3', name: 'Mots liés', desc: 'Prononcer des phrases courtes', cost: 3, requires: ['p2'], stat: 'attack', bonus: 12 },
      { id: 'p4', name: 'Orateur', desc: 'Conversation naturelle', cost: 5, requires: ['p3'], stat: 'attack', bonus: 20 },
    ]
  },
  {
    id: 'calligraphe',
    name: 'Voie du Calligraphe',
    icon: '✍️',
    color: '#a070d0',
    description: 'Maîtrise de l\'écriture',
    nodes: [
      { id: 'c1', name: 'Traits de base', desc: 'Les 8 traits fondamentaux', cost: 1, requires: [], stat: 'dexterity', bonus: 5 },
      { id: 'c2', name: 'Caractères simples', desc: 'Écrire les caractères courants', cost: 2, requires: ['c1'], stat: 'dexterity', bonus: 8 },
      { id: 'c3', name: 'Caractères composés', desc: 'Assembler les radicaux', cost: 3, requires: ['c2'], stat: 'dexterity', bonus: 12 },
      { id: 'c4', name: 'Maître calligraphe', desc: 'Écriture rapide et précise', cost: 5, requires: ['c3'], stat: 'dexterity', bonus: 20 },
    ]
  },
  {
    id: 'ecoute',
    name: 'Voie de l\'Écoute',
    icon: '👂',
    color: '#50c878',
    description: 'Compréhension orale',
    nodes: [
      { id: 'e1', name: 'Mots isolés', desc: 'Comprendre des mots seuls', cost: 1, requires: [], stat: 'perception', bonus: 5 },
      { id: 'e2', name: 'Phrases courtes', desc: 'Comprendre des phrases simples', cost: 2, requires: ['e1'], stat: 'perception', bonus: 8 },
      { id: 'e3', name: 'Phrases complètes', desc: 'Suivre une conversation', cost: 3, requires: ['e2'], stat: 'perception', bonus: 12 },
      { id: 'e4', name: 'Oreille absolue', desc: 'Compréhension naturelle', cost: 5, requires: ['e3'], stat: 'perception', bonus: 20 },
    ]
  },
  {
    id: 'lettre',
    name: 'Voie du Lettré',
    icon: '📚',
    color: '#f0c040',
    description: 'Vocabulaire & grammaire',
    nodes: [
      { id: 'l1', name: 'Mots courants', desc: 'Vocabulaire de survie', cost: 1, requires: [], stat: 'defense', bonus: 5 },
      { id: 'l2', name: 'Expressions', desc: 'Phrases idiomatiques', cost: 2, requires: ['l1'], stat: 'defense', bonus: 8 },
      { id: 'l3', name: 'Grammaire', desc: 'Structures de phrases', cost: 3, requires: ['l2'], stat: 'defense', bonus: 12 },
      { id: 'l4', name: 'Érudit suprême', desc: 'Maîtrise des 成语', cost: 5, requires: ['l3'], stat: 'defense', bonus: 20 },
    ]
  }
];

const SkillTree = {
  getUnlockedSkills() {
    const data = Storage.getSkillTreeData();
    return data.unlockedSkills || [];
  },

  getSkillPoints() {
    const data = Storage.getSkillTreeData();
    return data.skillPoints || 0;
  },

  addSkillPoints(amount) {
    const data = Storage.getSkillTreeData();
    data.skillPoints = (data.skillPoints || 0) + amount;
    Storage.saveSkillTreeData(data);
  },

  canUnlock(nodeId) {
    const unlocked = this.getUnlockedSkills();
    if (unlocked.includes(nodeId)) return false;

    // Find the node
    for (const branch of SKILL_BRANCHES) {
      const node = branch.nodes.find(n => n.id === nodeId);
      if (node) {
        // Check requirements
        const reqsMet = node.requires.every(r => unlocked.includes(r));
        // Check cost
        const points = this.getSkillPoints();
        return reqsMet && points >= node.cost;
      }
    }
    return false;
  },

  unlockSkill(nodeId) {
    if (!this.canUnlock(nodeId)) return false;

    // Find the node
    let targetNode = null;
    for (const branch of SKILL_BRANCHES) {
      const node = branch.nodes.find(n => n.id === nodeId);
      if (node) { targetNode = node; break; }
    }
    if (!targetNode) return false;

    const data = Storage.getSkillTreeData();
    data.skillPoints -= targetNode.cost;
    if (!data.unlockedSkills) data.unlockedSkills = [];
    data.unlockedSkills.push(nodeId);
    Storage.saveSkillTreeData(data);

    // Apply stat bonus
    const player = Storage.getPlayer();
    if (targetNode.stat && player.stats[targetNode.stat] !== undefined) {
      player.stats[targetNode.stat] += targetNode.bonus;
      Storage.savePlayer(player);
    }

    return true;
  },

  isUnlocked(nodeId) {
    return this.getUnlockedSkills().includes(nodeId);
  },

  // Render the skill tree
  render(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const points = this.getSkillPoints();
    const unlocked = this.getUnlockedSkills();

    el.innerHTML = `
      <div class="skill-tree-header">
        <h2>Arbre de compétences</h2>
        <div class="skill-points-display">
          <span class="sp-icon">💎</span>
          <span class="sp-count">${points}</span>
          <span class="sp-label">points</span>
        </div>
      </div>

      <div class="skill-tree-branches">
        ${SKILL_BRANCHES.map(branch => `
          <div class="skill-branch" style="--branch-color: ${branch.color}">
            <div class="branch-header">
              <span class="branch-icon">${branch.icon}</span>
              <span class="branch-name">${branch.name}</span>
            </div>
            <div class="branch-desc">${branch.description}</div>
            <div class="branch-nodes">
              ${branch.nodes.map((node, i) => {
                const isUnlocked = unlocked.includes(node.id);
                const canUnlockNow = this.canUnlock(node.id);
                const reqsMet = node.requires.every(r => unlocked.includes(r));
                const statusClass = isUnlocked ? 'node-unlocked' :
                                   canUnlockNow ? 'node-available' :
                                   reqsMet ? 'node-locked-cost' : 'node-locked';

                return `
                  ${i > 0 ? `<div class="node-connector ${isUnlocked || unlocked.includes(branch.nodes[i-1].id) ? 'connector-active' : ''}"></div>` : ''}
                  <button class="skill-node ${statusClass}"
                    onclick="SkillTree.onNodeClick('${node.id}')"
                    ${isUnlocked || !canUnlockNow ? '' : ''}>
                    <div class="node-icon">${isUnlocked ? '✅' : canUnlockNow ? '🔓' : '🔒'}</div>
                    <div class="node-info">
                      <div class="node-name">${node.name}</div>
                      <div class="node-desc">${node.desc}</div>
                      ${!isUnlocked ? `<div class="node-cost">${node.cost} 💎</div>` : '<div class="node-unlocked-text">Débloqué !</div>'}
                    </div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  onNodeClick(nodeId) {
    if (this.isUnlocked(nodeId)) {
      UI.showToast('Déjà débloqué !', 'info');
      return;
    }

    if (this.canUnlock(nodeId)) {
      this.unlockSkill(nodeId);
      Audio.playQuestComplete();
      UI.showToast('Compétence débloquée !', 'success');
      // Re-render
      this.render('skill-tree-content');
    } else {
      // Find node for info
      for (const branch of SKILL_BRANCHES) {
        const node = branch.nodes.find(n => n.id === nodeId);
        if (node) {
          const unlocked = this.getUnlockedSkills();
          const reqsMet = node.requires.every(r => unlocked.includes(r));
          if (!reqsMet) {
            UI.showToast('Débloque d\'abord les compétences précédentes !', 'error');
          } else {
            UI.showToast(`Il te faut ${node.cost} points de compétence !`, 'error');
          }
          break;
        }
      }
    }
  },
};
