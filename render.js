/* =========================================================
   QUEST CHRONICLES - RENDER SYSTEM v1
   UI ↔ Data ↔ Editor Bridge Layer
========================================================= */


/* =========================================================
   INITIAL LOAD
========================================================= */

window.addEventListener("load", () => {
    renderAll();
});


function renderAll() {
    renderAvailableQuests();
    renderDailyQuests();
    renderEvents();
    renderBoss();
    renderDashboard();
}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const dashboard = document.getElementById("dashboard");
    if (!dashboard) return;

    const activeQuest = playerData.activeQuests[0];

    dashboard.innerHTML = `
        <div class="panel">
            <div class="panel-content">
                <div class="title">${playerData.name}</div>
                <div class="sub">Level: ${playerData.level}</div>
                <div class="sub">XP: ${playerData.xp} / ${playerData.xpToNext}</div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-content">
                <div class="title">Gold</div>
                <div class="sub">${playerData.gold}</div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-content">
                <div class="title">Active Quest</div>

                ${
                    activeQuest
                    ? `
                        <div class="sub">${activeQuest.name}</div>
                        <div class="btn primary" onclick="completeQuest('${activeQuest.id}')">
                            Complete
                        </div>
                    `
                    : `<div class="sub">No active quest</div>`
                }

            </div>
        </div>
    `;
}


/* =========================================================
   QUEST CARD (EDITOR-COMPATIBLE)
========================================================= */

function questCard(q) {

    return `
        <div class="quest-card">

            <div class="quest-title">${q.name}</div>

            <div class="quest-sub">${q.description}</div>

            <div class="quest-sub">
                Tags: ${(q.tags || []).join(", ")}
            </div>

            <div class="quest-sub">
                XP: ${q.rewards?.xp || 0} | Gold: ${q.rewards?.gold || 0}
            </div>

            <div class="btn primary" onclick="acceptQuest('${q.id}')">
                Accept Quest
            </div>

        </div>
    `;
}


/* =========================================================
   AVAILABLE QUESTS
========================================================= */

function renderAvailableQuests() {

    const container = document.getElementById("available");
    if (!container) return;

    container.innerHTML = (questDatabase.normal || [])
        .map(questCard)
        .join("");
}


/* =========================================================
   DAILY QUESTS
========================================================= */

function renderDailyQuests() {

    const container = document.getElementById("daily");
    if (!container) return;

    container.innerHTML = (questDatabase.daily || [])
        .map(questCard)
        .join("");
}


/* =========================================================
   EVENT QUESTS (LIVE FILTERING)
========================================================= */

function renderEvents() {

    const container = document.getElementById("events");
    if (!container) return;

    const activeEvents = getActiveEvents();

    const eventQuests = (questDatabase.events || []).filter(q =>
        (q.eventTags || []).some(tag =>
            activeEvents.some(e => e.tag === tag)
        )
    );

    container.innerHTML = eventQuests
        .map(questCard)
        .join("");
}


/* =========================================================
   BOSS RENDER (REGEN READY)
========================================================= */

function renderBoss() {

    const container = document.getElementById("boss");
    if (!container) return;

    const boss = bossDatabase[0];

    if (!boss) {
        container.innerHTML = `<div class="sub">No boss available</div>`;
        return;
    }

    const hpPercent = Math.max(0, (boss.hp / boss.maxHp) * 100);

    container.innerHTML = `
        <div class="panel">
            <div class="panel-content">

                <div class="title">${boss.name}</div>
                <div class="sub">${boss.description}</div>

                <div class="sub">
                    HP: ${boss.hp} / ${boss.maxHp}
                </div>

                <div style="background:#2e3245; height:8px; border-radius:4px; overflow:hidden; margin:8px 0;">
                    <div style="width:${hpPercent}%; background:var(--accent); height:100%;"></div>
                </div>

                <div class="btn primary" onclick="damageBoss('${boss.id}', 10)">
                    Attack Boss (DEBUG)
                </div>

            </div>
        </div>
    `;
}


/* =========================================================
   EVENTS HELPER (SAFE)
========================================================= */

function getActiveEvents() {

    const now = new Date();

    return (eventDatabase || []).filter(e => {
        const start = new Date(e.startDate);
        const end = new Date(e.endDate);
        return now >= start && now <= end;
    });
}


/* =========================================================
   QUEST ACTIONS (EDITOR COMPATIBLE SAFE LAYER)
========================================================= */

function acceptQuest(id) {

    const all = [
        ...(questDatabase.normal || []),
        ...(questDatabase.daily || []),
        ...(questDatabase.events || [])
    ];

    const quest = all.find(q => q.id === id);
    if (!quest) return;

    if (playerData.activeQuests.length >= playerData.activeQuestSlots) {
        alert("No free quest slots!");
        return;
    }

    playerData.activeQuests.push(quest);
    renderAll();
}


function completeQuest(id) {

    const index = playerData.activeQuests.findIndex(q => q.id === id);
    if (index === -1) return;

    const quest = playerData.activeQuests[index];

    playerData.xp += quest.rewards?.xp || 0;
    playerData.gold += quest.rewards?.gold || 0;

    playerData.lifetime.questsCompleted++;

    playerData.activeQuests.splice(index, 1);

    renderAll();
}


/* =========================================================
   BOSS SYSTEM
========================================================= */

function damageBoss(id, dmg) {

    const boss = bossDatabase.find(b => b.id === id);
    if (!boss) return;

    boss.hp -= dmg;

    if (boss.hp < 0) boss.hp = 0;

    renderAll();
}


/* =========================================================
   LIVE UPDATE LOOP (boss regen + UI sync)
========================================================= */

setInterval(() => {

    // Boss regeneration system
    const boss = bossDatabase[0];
    if (boss && boss.hp < boss.maxHp) {
        boss.hp += (boss.regenRate || 0);
        if (boss.hp > boss.maxHp) boss.hp = boss.maxHp;
    }

    renderDashboard();
    renderBoss();

}, 1000);


/* =========================================================
   DEBUG
========================================================= */

function forceRerender() {
    renderAll();
}