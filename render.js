/* =========================================================
   QUEST CHRONICLES - RENDER SYSTEM v0.1
   UI → Data Bridge Layer
========================================================= */


/* =========================================================
   INITIAL RENDER ENTRY
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
   DASHBOARD RENDER
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
                    ? `<div class="sub">${activeQuest.name}</div>
                       <div class="btn primary" onclick="completeQuest('${activeQuest.id}')">Complete</div>`
                    : `<div class="sub">No active quest</div>`
                }
            </div>
        </div>
    `;
}


/* =========================================================
   QUEST RENDER HELPERS
========================================================= */

function questCard(q) {
    return `
        <div class="quest-card">
            <div class="quest-title">${q.name}</div>
            <div class="quest-sub">${q.description}</div>
            <div class="quest-sub">Tags: ${q.tags.join(", ")}</div>

            <div class="quest-sub">
                XP: ${q.rewards.xp} | Gold: ${q.rewards.gold}
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

    container.innerHTML = questDatabase.normal
        .map(q => questCard(q))
        .join("");
}


/* =========================================================
   DAILY QUESTS
========================================================= */

function renderDailyQuests() {

    const container = document.getElementById("daily");
    if (!container) return;

    container.innerHTML = questDatabase.daily
        .map(q => questCard(q))
        .join("");
}


/* =========================================================
   EVENT QUESTS
========================================================= */

function renderEvents() {

    const container = document.getElementById("events");
    if (!container) return;

    const activeEvents = getActiveEvents();

    const eventQuests = questDatabase.events.filter(q =>
        q.eventTags.some(tag =>
            activeEvents.some(e => e.tag === tag)
        )
    );

    container.innerHTML = eventQuests
        .map(q => questCard(q))
        .join("");
}


/* =========================================================
   BOSS RENDER
========================================================= */

function renderBoss() {

    const container = document.getElementById("boss");
    if (!container) return;

    const boss = bossDatabase[0];

    container.innerHTML = `
        <div class="panel">
            <div class="panel-content">
                <div class="title">${boss.name}</div>
                <div class="sub">${boss.description}</div>

                <div class="sub">
                    HP: ${boss.hp} / ${boss.maxHp}
                </div>

                <div class="btn primary" onclick="damageBoss('${boss.id}', 10)">
                    Attack Boss (DEBUG)
                </div>
            </div>
        </div>
    `;
}


/* =========================================================
   SIMPLE LIVE SYNC LOOP (future-proofing)
========================================================= */

setInterval(() => {
    renderDashboard();
}, 1000);


/* =========================================================
   DEBUG HELPERS
========================================================= */

function forceRerender() {
    renderAll();
}