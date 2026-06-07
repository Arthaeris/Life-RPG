/* =========================================================
   QUEST CHRONICLES - RENDER SYSTEM v1.2
   UI ONLY - STRICT MODE SAFE
========================================================= */

window.addEventListener("load", () => {
    renderAll();
});

function renderAll() {
    renderDashboard();
    renderAvailableQuests();
    renderDailyQuests();
    renderEvents();
    renderBoss();
}

/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const el = document.getElementById("dashboard");
    if (!el) return;

    const activeQuest = playerData.activeQuests[0];

    el.innerHTML = `
        <div class="panel">
            <div class="panel-content">
                <div class="title">${playerData.name}</div>
                <div class="sub">Level: ${playerData.level}</div>
                <div class="sub">XP: ${playerData.xp} / ${playerData.xpToNext}</div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-content">
                <div class="title">Currencies</div>
                <div class="sub">Gold: ${playerData.gold}</div>
                <div class="sub">Gems: ${playerData.gems}</div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-content">
                <div class="title">Active Quest Slot</div>
                ${
                    activeQuest
                        ? `
                            <div class="sub">${activeQuest.name}</div>
                            <div class="btn primary" onclick="handleCompleteQuest('${activeQuest.id}')">
                                Complete
                            </div>
                        `
                        : `<div class="sub">No active quest</div>`
                }
            </div>
        </div>

        <div class="panel">
            <div class="panel-content">
                <div class="title">Title</div>
                <div class="sub">${playerData.title}</div>
            </div>
        </div>
    `;
}

/* =========================================================
   QUEST CARD
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

            <div class="btn primary" onclick="handleAcceptQuest('${q.id}')">
                Accept Quest
            </div>
        </div>
    `;
}

/* =========================================================
   QUEST LISTS
========================================================= */

function renderAvailableQuests() {
    const el = document.getElementById("available");
    if (!el) return;

    el.innerHTML = questDatabase
        .filter(q => q.type === "normal")
        .map(questCard)
        .join("");
}

function renderDailyQuests() {
    const el = document.getElementById("daily");
    if (!el) return;

    el.innerHTML = questDatabase
        .filter(q => q.type === "daily")
        .map(questCard)
        .join("");
}

function renderEvents() {

    const el = document.getElementById("events");
    if (!el) return;

    const activeEvents = getActiveEvents();

    el.innerHTML = questDatabase
        .filter(q =>
            q.type === "event" &&
            (q.eventTags || []).some(tag =>
                activeEvents.some(e => e.tag === tag)
            )
        )
        .map(questCard)
        .join("");
}

/* =========================================================
   BOSS
========================================================= */

function renderBoss() {

    const el = document.getElementById("boss");
    if (!el) return;

    const boss = bossDatabase[0];

    if (!boss) {
        el.innerHTML = `<div class="sub">No boss available</div>`;
        return;
    }

    const hp = Math.max(0, boss.hp);
    const percent = (hp / boss.maxHp) * 100;

    el.innerHTML = `
        <div class="panel">
            <div class="panel-content">
                <div class="title">${boss.name}</div>
                <div class="sub">${boss.description}</div>

                <div class="sub">
                    HP: ${hp} / ${boss.maxHp}
                </div>

                <div style="height:8px;background:#2e3245;border-radius:4px;overflow:hidden;margin:8px 0;">
                    <div style="width:${percent}%;height:100%;background:var(--accent);"></div>
                </div>

                <div class="btn primary" onclick="handleDamageBoss('${boss.id}', 10)">
                    Attack Boss
                </div>
            </div>
        </div>
    `;
}

/* =========================================================
   UI ACTION HANDLERS
========================================================= */

function handleAcceptQuest(id) {
    acceptQuest(id);
    renderAll();
}

function handleCompleteQuest(id) {
    completeQuest(id);
    renderAll();
}

function handleDamageBoss(id, dmg) {
    damageBoss(id, dmg);
    renderAll();
}

/* =========================================================
   LIVE LOOP
========================================================= */

setInterval(() => {

    if (typeof processBossRegeneration === "function") {
        processBossRegeneration();
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