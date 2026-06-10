/* =========================================================
   QUEST CHRONICLES - RENDER SYSTEM v4.3
   Artwork-Aware UI Layer
   Compatible with:
   - database.js v3.x
   - systems.js v4.x
   - save.js v3.x+
   - editor.js v3.x+
========================================================= */

window.addEventListener("load", () => {
    renderAll();
});


/* =========================================================
   MASTER RENDER
========================================================= */

function renderAll() {

    applyScreenBackgrounds();

    renderDashboard();

    renderAvailableQuests();
    renderDailyQuests();
    renderEvents();

    renderBoss();

    renderProfile();
    renderShop();
    renderInventory();

    renderRelics();
    renderEffects();
}


/* =========================================================
   SAFE DISPLAY HELPERS
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
    return escapeHTML(value);
}

function cleanAssetPath(path) {

    return String(path || "")
        .trim()
        .replaceAll("\\", "/");
}

function getArtworkPath(entity, fallbackType = null) {

    if (entity?.artwork) {
        return cleanAssetPath(entity.artwork);
    }

    if (entity?.icon) {
        return cleanAssetPath(entity.icon);
    }

    if (
        fallbackType &&
        typeof UI_CONFIG !== "undefined" &&
        UI_CONFIG.placeholders?.[fallbackType]
    ) {
        return cleanAssetPath(UI_CONFIG.placeholders[fallbackType]);
    }

    return "";
}

function artworkStyle(path) {

    const cleanPath =
        cleanAssetPath(path);

    if (!cleanPath) return "";

    const safePath =
        cleanPath
            .replaceAll("'", "\\'")
            .replaceAll('"', '\\"');

    return `style="--artwork:url('${safePath}');"`;
}

function screenArtworkStyle(path) {

    const cleanPath =
        cleanAssetPath(path);

    if (!cleanPath) return "";

    const safePath =
        cleanPath
            .replaceAll("'", "\\'")
            .replaceAll('"', '\\"');

    return `--screen-artwork:url('${safePath}');`;
}

function iconImageHTML(path, label, type = "item") {

    const cleanPath =
        cleanAssetPath(path);

    if (!cleanPath) {

        return `
            <div class="icon-art icon-placeholder ${type}-icon-placeholder">
                ${getFallbackIcon(type)}
            </div>
        `;
    }

    return `
        <img
            class="icon-art ${type}-icon"
            src="${escapeAttr(cleanPath)}"
            alt="${escapeAttr(label)}"
            loading="lazy"
        >
    `;
}

function getFallbackIcon(type) {

    switch (type) {

        case "quest":
            return "★";

        case "boss":
            return "⚔";

        case "event":
            return "✦";

        case "relic":
            return "◆";

        case "item":
            return "◈";

        default:
            return "◆";
    }
}

function renderTime(ms) {

    if (typeof formatDuration === "function") {
        return formatDuration(ms);
    }

    ms = Math.max(0, ms || 0);

    const totalSeconds =
        Math.floor(ms / 1000);

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor((totalSeconds % 3600) / 60);

    const seconds =
        totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
}

function getPercent(value, max) {

    if (!max || max <= 0) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            100,
            (value / max) * 100
        )
    );
}

function getStatIcon(stat) {

    switch (stat) {

        case "Fitness":
            return "💪";

        case "Health":
            return "❤";

        case "Wisdom":
            return "🧠";

        case "Home":
            return "🏠";

        default:
            return "✦";
    }
}

function getArrayValue(value) {

    if (Array.isArray(value)) {
        return value;
    }

    return [];
}


/* =========================================================
   SCREEN BACKGROUNDS
========================================================= */

function applyScreenBackgrounds() {

    if (
        typeof UI_CONFIG === "undefined" ||
        !UI_CONFIG.backgrounds
    ) {
        return;
    }

    const mappings = {
        dashboard: UI_CONFIG.backgrounds.dashboard,
        quests: UI_CONFIG.backgrounds.quests,
        profile: UI_CONFIG.backgrounds.profile,
        shop: UI_CONFIG.backgrounds.shop,
        inventory: UI_CONFIG.backgrounds.inventory,
        settings: UI_CONFIG.backgrounds.settings
    };

    Object.entries(mappings).forEach(([id, path]) => {

        const el =
            document.getElementById(id);

        if (!el) return;

        if (path) {

            el.classList.add("screen-artwork");

            el.setAttribute(
                "style",
                screenArtworkStyle(path)
            );

        } else {

            el.classList.remove("screen-artwork");

            el.removeAttribute("style");
        }
    });
}


/* =========================================================
   QUEST SLOT HELPERS
========================================================= */

function getQuestSlotStatus(slot) {

    if (
        typeof getSlotStatus === "function"
    ) {
        return getSlotStatus(slot);
    }

    if (!slot) return "empty";

    const now =
        Date.now();

    if (
        slot.cooldownUntil &&
        now < slot.cooldownUntil
    ) {
        return "cooldown";
    }

    if (
        playerData.activeQuest &&
        playerData.activeQuest.sourceSlotId &&
        playerData.activeQuest.sourceSlotId === slot.slotId
    ) {
        return "accepted";
    }

    if (
        playerData.activeQuest &&
        !playerData.activeQuest.sourceSlotId &&
        playerData.activeQuest.id === slot.questId
    ) {
        return "accepted";
    }

    if (
        slot.expiresAt &&
        now >= slot.expiresAt
    ) {
        return "expired";
    }

    return "available";
}

function getQuestSlotTime(slot) {

    if (
        typeof getSlotTimeRemaining === "function"
    ) {
        return getSlotTimeRemaining(slot);
    }

    if (!slot) return 0;

    const status =
        getQuestSlotStatus(slot);

    const now =
        Date.now();

    if (status === "cooldown") {
        return Math.max(
            0,
            (slot.cooldownUntil || now) - now
        );
    }

    if (
        status === "available" ||
        status === "accepted"
    ) {
        return Math.max(
            0,
            (slot.expiresAt || now) - now
        );
    }

    return 0;
}

function findQuestForSlot(slot) {

    if (!slot || !slot.questId) {
        return null;
    }

    if (
        typeof getQuestFromSlot === "function"
    ) {
        return getQuestFromSlot(slot);
    }

    if (
        typeof findQuestById === "function"
    ) {
        return findQuestById(slot.questId);
    }

    return questDatabase.find(
        quest => quest.id === slot.questId
    );
}

function getQuestSlots(type) {

    if (
        typeof getBoardSlotsByType === "function"
    ) {
        return getBoardSlotsByType(type) || [];
    }

    if (type === QUEST_TYPES.NORMAL) {
        return questBoardState.normalSlots || [];
    }

    if (type === QUEST_TYPES.DAILY) {
        return questBoardState.dailySlots || [];
    }

    if (type === QUEST_TYPES.EVENT) {
        return questBoardState.eventSlots || [];
    }

    return [];
}

function getFallbackQuestSlots(type) {

    return questDatabase
        .filter(quest => quest.type === type)
        .map(quest => ({
            questId: quest.id,
            type: quest.type,
            slotId: `fallback_${quest.type}_${quest.id}`,
            spawnedAt: Date.now(),
            expiresAt: Date.now() + ((GAME_CONFIG.questLifetimeMinutes || 180) * 60000),
            cooldownUntil: null
        }));
}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const el =
        document.getElementById("dashboard");

    if (!el) return;

    const activeQuest =
        playerData.activeQuest;

    const activeBoss =
        bossChallengeState?.active && bossChallengeState?.currentBossId
            ? findBossById(bossChallengeState.currentBossId)
            : null;

    const xpPercent =
        getPercent(
            playerData.xp,
            playerData.xpToNext
        );

    const pendingRewards =
        bossChallengeState?.pendingRewards || {
            xp: 0,
            gold: 0,
            gems: 0,
            items: [],
            relics: []
        };

    const activeQuestArtwork =
        getArtworkPath(activeQuest, "quest");

    const activeBossArtwork =
        getArtworkPath(activeBoss, "boss");

    el.innerHTML = `

        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    ${escapeHTML(playerData.name)}
                </div>

                <div class="sub">
                    ${escapeHTML(playerData.title || "Adventurer")}
                </div>

                <div class="sub">
                    Level ${playerData.level}
                </div>

                <div class="xp-bar">
                    <div
                        class="xp-fill"
                        style="width:${xpPercent}%;">
                    </div>
                </div>

                <div class="sub">
                    XP:
                    ${playerData.xp}
                    /
                    ${playerData.xpToNext}
                </div>

                <div class="currency-row">
                    <div class="currency-chip gold">
                        Gold: ${playerData.gold}
                    </div>

                    <div class="currency-chip gem">
                        Gems: ${playerData.gems}
                    </div>
                </div>

            </div>
        </div>

        <div
            class="panel ${activeQuestArtwork ? "artwork-card quest-artwork-card" : ""}"
            ${artworkStyle(activeQuestArtwork)}>

            <div class="panel-content">

                <div class="title">
                    Active Quest
                </div>

                ${
                    activeQuest
                        ? `
                            <div class="sub">
                                ${escapeHTML(activeQuest.name)}
                            </div>

                            <div class="sub">
                                ${escapeHTML(activeQuest.description || "")}
                            </div>

                            <div
                                class="btn primary"
                                onclick="handleCompleteQuest('${escapeAttr(activeQuest.id)}')">
                                Complete Quest
                            </div>

                            <div
                                class="btn"
                                onclick="handleAbandonQuest()">
                                Abandon Quest
                            </div>
                        `
                        : `
                            <div class="sub">
                                No active quest.
                            </div>
                        `
                }

            </div>
        </div>

        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    Progress Status
                </div>

                <div class="sub">
                    XP Gain:
                    ${
                        bossChallengeState?.xpLocked
                            ? "Locked during Boss Challenge"
                            : "Active"
                    }
                </div>

                <div class="sub">
                    Gold Gain:
                    ${
                        bossChallengeState?.goldLocked
                            ? "Locked during Boss Challenge"
                            : "Active"
                    }
                </div>

                ${
                    bossChallengeState?.active
                        ? `
                            <div class="sub warning">
                                Boss Challenge active. Complete quests to damage the boss.
                            </div>

                            <div class="sub">
                                Stored Rewards:
                                XP ${pendingRewards.xp || 0}
                                |
                                Gold ${pendingRewards.gold || 0}
                                |
                                Gems ${pendingRewards.gems || 0}
                            </div>
                        `
                        : `
                            <div class="sub">
                                Quest slot timers are running normally.
                            </div>
                        `
                }

            </div>
        </div>

        ${
            activeBoss
                ? `
                    <div
                        class="panel ${activeBossArtwork ? "artwork-card boss-artwork-card" : ""}"
                        ${artworkStyle(activeBossArtwork)}>

                        <div class="panel-content">

                            <div class="title">
                                Active Boss
                            </div>

                            <div class="sub">
                                ${escapeHTML(activeBoss.name)}
                            </div>

                            <div class="boss-bar">
                                <div
                                    class="boss-fill"
                                    style="width:${getPercent(activeBoss.hp, activeBoss.maxHp)}%;">
                                </div>
                            </div>

                            <div class="sub">
                                HP:
                                ${Math.floor(activeBoss.hp)}
                                /
                                ${activeBoss.maxHp}
                            </div>

                            <div class="sub">
                                Damage Dealt:
                                ${bossChallengeState.damageDealt || 0}
                            </div>

                        </div>
                    </div>
                `
                : ""
        }

    `;
}


/* =========================================================
   QUEST SLOT CARD
========================================================= */

function questSlotCard(slot) {

    const quest =
        findQuestForSlot(slot);

    const status =
        getQuestSlotStatus(slot);

    const timeLeft =
        getQuestSlotTime(slot);

    const activeQuest =
        playerData.activeQuest;

    const accepted =
        activeQuest &&
        (
            activeQuest.sourceSlotId === slot?.slotId ||
            (
                !activeQuest.sourceSlotId &&
                activeQuest.id === quest?.id
            )
        );

    const busy =
        activeQuest &&
        !accepted;

    if (!slot || !quest) {

        return `
            <div class="quest-card cooldown">

                <div class="quest-title">
                    Empty Slot
                </div>

                <div class="quest-sub">
                    No quest is currently available here.
                </div>

            </div>
        `;
    }

    const artwork =
        getArtworkPath(quest, "quest");

    const rarity =
        String(quest.rarity || "Common")
            .toLowerCase()
            .replaceAll(" ", "-");

    if (status === "cooldown") {

        return `
            <div
                class="quest-card cooldown ${artwork ? "artwork-card quest-artwork-card" : ""} rarity-${rarity}"
                ${artworkStyle(artwork)}>

                <div class="quest-title">
                    Quest Slot Cooling Down
                </div>

                <div class="quest-sub">
                    Previous Quest:
                    ${escapeHTML(quest.name)}
                </div>

                <div class="quest-sub">
                    New quest appears in:
                    ${renderTime(timeLeft)}
                </div>

                <div class="btn">
                    Cooldown
                </div>

            </div>
        `;
    }

    const timerText =
        bossChallengeState?.active
            ? `
                <div class="quest-sub warning">
                    Boss Challenge: this slot will not refresh by timer.
                </div>
            `
            : `
                <div class="quest-sub">
                    Refreshes in:
                    ${renderTime(timeLeft)}
                </div>
            `;

    let button = "";

    if (accepted) {

        button = `
            <div class="btn primary">
                Accepted
            </div>
        `;

    } else if (busy) {

        button = `
            <div class="btn">
                Busy
            </div>
        `;

    } else if (status === "available") {

        button = `
            <div
                class="btn primary"
                onclick="handleAcceptQuest('${escapeAttr(quest.id)}')">
                Accept Quest
            </div>
        `;

    } else {

        button = `
            <div class="btn">
                Unavailable
            </div>
        `;
    }

    return `
        <div
            class="quest-card ${accepted ? "accepted" : ""} ${artwork ? "artwork-card quest-artwork-card" : ""} rarity-${rarity}"
            ${artworkStyle(artwork)}>

            <div class="quest-title">
                ${escapeHTML(quest.name)}
            </div>

            <div class="quest-sub">
                ${escapeHTML(quest.description || "")}
            </div>

            <div class="quest-sub">
                Type:
                ${escapeHTML(quest.type)}
                |
                Rarity:
                ${escapeHTML(quest.rarity || "Common")}
            </div>

            <div class="quest-sub">
                Tags:
                ${getArrayValue(quest.tags).map(escapeHTML).join(", ")}
            </div>

            <div class="reward-row">
                <span>⭐ ${quest.rewards?.xp || 0} XP</span>
                <span>🪙 ${quest.rewards?.gold || 0} Gold</span>
                <span>💎 ${quest.rewards?.gems || 0} Gems</span>
            </div>

            <div class="reward-row stat-reward-row">
                <span>${getStatIcon("Fitness")} ${quest.rewards?.stats?.Fitness || 0}</span>
                <span>${getStatIcon("Health")} ${quest.rewards?.stats?.Health || 0}</span>
                <span>${getStatIcon("Wisdom")} ${quest.rewards?.stats?.Wisdom || 0}</span>
                <span>${getStatIcon("Home")} ${quest.rewards?.stats?.Home || 0}</span>
            </div>

            ${timerText}

            ${button}

        </div>
    `;
}


/* =========================================================
   QUEST BOARD PANEL
========================================================= */

function questBoardPanel(title, description, slots, artworkPath = "") {

    const artwork =
        cleanAssetPath(artworkPath);

    if (!slots || !slots.length) {

        return `
            <div
                class="panel ${artwork ? "artwork-card panel-artwork-card" : ""}"
                ${artworkStyle(artwork)}>

                <div class="panel-content">

                    <div class="title">
                        ${escapeHTML(title)}
                    </div>

                    <div class="sub">
                        ${escapeHTML(description)}
                    </div>

                    <div class="sub">
                        No quest slots available.
                    </div>

                </div>
            </div>
        `;
    }

    return `
        <div
            class="panel ${artwork ? "artwork-card panel-artwork-card" : ""}"
            ${artworkStyle(artwork)}>

            <div class="panel-content">

                <div class="title">
                    ${escapeHTML(title)}
                </div>

                <div class="sub">
                    ${escapeHTML(description)}
                </div>

                ${
                    bossChallengeState?.active
                        ? `
                            <div class="sub warning">
                                Boss Challenge mode: no passive refresh.
                            </div>
                        `
                        : `
                            <div class="sub">
                                Slots refresh after their timers expire.
                            </div>
                        `
                }

            </div>
        </div>

        ${slots.map(questSlotCard).join("")}
    `;
}


/* =========================================================
   NORMAL QUESTS
========================================================= */

function renderAvailableQuests() {

    const el =
        document.getElementById("available");

    if (!el) return;

    let slots =
        getQuestSlots(QUEST_TYPES.NORMAL);

    if (!slots.length) {
        slots =
            getFallbackQuestSlots(QUEST_TYPES.NORMAL);
    }

    const artwork =
        typeof UI_CONFIG !== "undefined"
            ? UI_CONFIG.backgrounds?.normalQuests || ""
            : "";

    el.innerHTML =
        questBoardPanel(
            "Normal Quests",
            `${GAME_CONFIG.normalQuestSlots} rotating quest slots.`,
            slots,
            artwork
        );
}


/* =========================================================
   DAILY QUESTS
========================================================= */

function renderDailyQuests() {

    const el =
        document.getElementById("daily");

    if (!el) return;

    let slots =
        getQuestSlots(QUEST_TYPES.DAILY);

    if (!slots.length) {
        slots =
            getFallbackQuestSlots(QUEST_TYPES.DAILY);
    }

    const artwork =
        typeof UI_CONFIG !== "undefined"
            ? UI_CONFIG.backgrounds?.dailyQuests || ""
            : "";

    el.innerHTML =
        questBoardPanel(
            "Daily Quests",
            `${GAME_CONFIG.dailyQuestSlots} daily quest slots.`,
            slots,
            artwork
        );
}


/* =========================================================
   EVENT QUESTS
========================================================= */

function renderEvents() {

    const el =
        document.getElementById("events");

    if (!el) return;

    const activeEvents =
        typeof getActiveEvents === "function"
            ? getActiveEvents()
            : [];

    let slots =
        getQuestSlots(QUEST_TYPES.EVENT);

    if (!slots.length) {
        slots =
            getFallbackQuestSlots(QUEST_TYPES.EVENT)
                .filter(slot => {

                    const quest =
                        findQuestForSlot(slot);

                    return quest &&
                        getArrayValue(quest.eventTags).some(tag =>
                            activeEvents.some(event => event.tag === tag)
                        );
                });
    }

    const eventNames =
        activeEvents
            .map(event => event.name)
            .join(", ");

    const firstEventArtwork =
        activeEvents.find(event => event.artwork)?.artwork || "";

    const configuredArtwork =
        typeof UI_CONFIG !== "undefined"
            ? UI_CONFIG.backgrounds?.eventQuests || ""
            : "";

    el.innerHTML =
        questBoardPanel(
            "Event Quests",
            activeEvents.length
                ? `Active events: ${eventNames}`
                : "No active events right now.",
            slots,
            firstEventArtwork || configuredArtwork
        );
}


/* =========================================================
   BOSS PANEL
========================================================= */

function renderBoss() {

    const el =
        document.getElementById("boss");

    if (!el) return;

    const bosses =
        typeof getAvailableBosses === "function"
            ? getAvailableBosses()
            : bossDatabase.filter(
                boss =>
                    playerData.level >= boss.unlockLevel
            );

    if (!bosses.length) {

        const nextBoss =
            bossDatabase.find(
                boss =>
                    boss.unlockLevel >
                    playerData.level
            );

        const artwork =
            typeof UI_CONFIG !== "undefined"
                ? UI_CONFIG.backgrounds?.bossCampaign || ""
                : "";

        el.innerHTML = `
            <div
                class="panel ${artwork ? "artwork-card panel-artwork-card" : ""}"
                ${artworkStyle(artwork)}>

                <div class="panel-content">

                    <div class="title">
                        Boss Campaign
                    </div>

                    <div class="sub">
                        First boss unlocks at
                        Level ${nextBoss?.unlockLevel || 5}.
                    </div>

                    <div class="sub">
                        Boss Challenges lock XP and Gold until victory or surrender.
                    </div>

                </div>
            </div>
        `;

        return;
    }

    const selectedBoss =
        typeof getSelectedBoss === "function"
            ? getSelectedBoss()
            : bosses[0];

    let html = `
        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    Boss Campaign
                </div>

                <div class="sub">
                    New bosses unlock every
                    ${GAME_CONFIG.bossUnlockInterval}
                    levels.
                </div>

                ${
                    bossChallengeState?.active
                        ? `
                            <div class="sub warning">
                                Boss Challenge active. Complete quests to damage the boss.
                            </div>
                        `
                        : `
                            <div class="sub">
                                Start a challenge when you are ready.
                            </div>
                        `
                }

            </div>
        </div>

        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    Available Bosses
                </div>
    `;

    bosses.forEach(boss => {

        const selected =
            selectedBoss &&
            selectedBoss.id === boss.id;

        const completed =
            bossProgression?.completedBosses?.includes(boss.id);

        html += `
            <div
                class="btn ${selected ? "primary" : ""}"
                onclick="handleSelectBoss('${escapeAttr(boss.id)}')">

                ${escapeHTML(boss.name)}
                (Lv ${boss.unlockLevel})
                ${completed ? "✓" : ""}

            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

    if (!selectedBoss) {

        el.innerHTML = html;
        return;
    }

    const hpPercent =
        getPercent(
            selectedBoss.hp,
            selectedBoss.maxHp
        );

    const activeThisBoss =
        bossChallengeState?.active &&
        bossChallengeState.currentBossId === selectedBoss.id;

    const artwork =
        getArtworkPath(selectedBoss, "boss");

    html += `
        <div
            class="panel ${artwork ? "artwork-card boss-artwork-card" : ""}"
            ${artworkStyle(artwork)}>

            <div class="panel-content">

                <div class="title">
                    ${escapeHTML(selectedBoss.name)}
                </div>

                <div class="sub">
                    ${escapeHTML(selectedBoss.description)}
                </div>

                <div class="boss-bar">
                    <div
                        class="boss-fill"
                        style="width:${hpPercent}%;">
                    </div>
                </div>

                <div class="sub">
                    HP:
                    ${Math.floor(selectedBoss.hp)}
                    /
                    ${selectedBoss.maxHp}
                </div>

                <div class="sub">
                    Weak:
                    ${getArrayValue(selectedBoss.weaknesses).map(escapeHTML).join(", ") || "None"}
                </div>

                <div class="sub">
                    Resist:
                    ${getArrayValue(selectedBoss.resistances).map(escapeHTML).join(", ") || "None"}
                </div>

                <div class="sub">
                    Regen:
                    ${selectedBoss.regenRate || 0}
                    HP / tick outside active challenge
                </div>
    `;

    if (!bossChallengeState?.active) {

        html += `
            <div
                class="btn primary"
                onclick="handleStartBossChallenge('${escapeAttr(selectedBoss.id)}')">

                Start Challenge

            </div>
        `;

    } else if (activeThisBoss) {

        const pendingRewards =
            bossChallengeState.pendingRewards || {
                xp: 0,
                gold: 0,
                gems: 0
            };

        html += `
            <div class="sub warning">
                Complete quests to deal stat-based damage.
            </div>

            <div class="sub">
                Damage dealt this challenge:
                ${bossChallengeState.damageDealt || 0}
            </div>

            <div class="sub">
                Pending quest rewards:
                XP ${pendingRewards.xp || 0}
                |
                Gold ${pendingRewards.gold || 0}
                |
                Gems ${pendingRewards.gems || 0}
            </div>

            <div
                class="btn"
                onclick="handleGiveUpBossChallenge()">

                Give Up

            </div>
        `;

    } else {

        html += `
            <div class="sub warning">
                Another boss challenge is already active.
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    el.innerHTML = html;
}


/* =========================================================
   PROFILE
========================================================= */

function renderProfile() {

    const el =
        document.getElementById("profile");

    if (!el) return;

    el.innerHTML = `
        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    Character Stats
                </div>

                ${Object.entries(playerData.stats || {})
                    .map(([name, stat]) => `
                        <div class="stat-line">
                            <div class="sub">
                                ${getStatIcon(name)}
                                ${escapeHTML(name)}
                                Lv.${stat.level}
                                (${stat.xp} XP)
                            </div>
                        </div>
                    `).join("")}

            </div>
        </div>

        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    Lifetime
                </div>

                <div class="sub">
                    Quests Completed:
                    ${playerData.lifetime?.questsCompleted || 0}
                </div>

                <div class="sub">
                    Bosses Defeated:
                    ${playerData.lifetime?.bossesDefeated || 0}
                </div>

                <div class="sub">
                    Boss Damage Dealt:
                    ${playerData.lifetime?.totalBossDamageDealt || 0}
                </div>

            </div>
        </div>

        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    Relic Loadout
                </div>

                ${renderRelicLoadoutHTML()}

            </div>
        </div>
    `;
}


/* =========================================================
   SHOP
========================================================= */

function renderShop() {

    const el =
        document.getElementById("shop");

    if (!el) return;

    if (!itemDatabase.length) {

        el.innerHTML = `
            <div class="panel">
                <div class="panel-content">

                    <div class="title">
                        Shop
                    </div>

                    <div class="sub">
                        No items available.
                    </div>

                </div>
            </div>
        `;

        return;
    }

    el.innerHTML =
        itemDatabase.map(item => {

            const icon =
                getArtworkPath(item, "item");

            return `
                <div class="panel">
                    <div class="panel-content">

                        <div class="icon-row">

                            ${iconImageHTML(icon, item.name, "item")}

                            <div class="icon-row-content">

                                <div class="title">
                                    ${escapeHTML(item.name)}
                                </div>

                                <div class="sub">
                                    ${escapeHTML(item.description)}
                                </div>

                                <div class="sub">
                                    Category:
                                    ${escapeHTML(item.category || "item")}
                                </div>

                                <div class="sub">
                                    Cost:
                                    ${item.cost || 0}
                                </div>

                            </div>
                        </div>

                        ${
                            bossChallengeState?.active
                                ? `
                                    <div class="btn">
                                        Locked During Boss Challenge
                                    </div>
                                `
                                : `
                                    <div
                                        class="btn primary"
                                        onclick="handleUseItem('${escapeAttr(item.id)}')">
                                        Use / Test Item
                                    </div>
                                `
                        }

                    </div>
                </div>
            `;
        }).join("");
}


/* =========================================================
   INVENTORY
========================================================= */

function renderInventory() {

    const el =
        document.getElementById("inventory");

    if (!el) return;

    const items =
        playerData.inventory || [];

    const relics =
        playerData.relicInventory || [];

    el.innerHTML = `
        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    Inventory
                </div>

                <div class="sub">
                    Items:
                    ${items.length}
                </div>

                <div class="sub">
                    Relics:
                    ${relics.length}
                </div>

            </div>
        </div>

        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    Items
                </div>

                ${
                    items.length
                        ? items.map(itemId => {

                            const item =
                                itemDatabase.find(
                                    entry => entry.id === itemId
                                );

                            const icon =
                                getArtworkPath(item, "item");

                            return `
                                <div class="icon-row inventory-entry">

                                    ${iconImageHTML(icon, item?.name || itemId, "item")}

                                    <div class="icon-row-content">
                                        <div class="sub">
                                            ${escapeHTML(item?.name || itemId)}
                                        </div>

                                        ${
                                            item?.description
                                                ? `
                                                    <div class="sub">
                                                        ${escapeHTML(item.description)}
                                                    </div>
                                                `
                                                : ""
                                        }
                                    </div>

                                </div>
                            `;
                        }).join("")
                        : `
                            <div class="sub">
                                No items owned.
                            </div>
                        `
                }

            </div>
        </div>

        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    Relics
                </div>

                ${
                    relics.length
                        ? relics.map(relicId => {

                            const relic =
                                relicDatabase.find(
                                    entry => entry.id === relicId
                                );

                            const icon =
                                getArtworkPath(relic, "relic");

                            return `
                                <div class="icon-row inventory-entry">

                                    ${iconImageHTML(icon, relic?.name || relicId, "relic")}

                                    <div class="icon-row-content">
                                        <div class="sub">
                                            ${escapeHTML(relic?.name || relicId)}
                                        </div>

                                        ${
                                            relic?.description
                                                ? `
                                                    <div class="sub">
                                                        ${escapeHTML(relic.description)}
                                                    </div>
                                                `
                                                : ""
                                        }
                                    </div>

                                </div>
                            `;
                        }).join("")
                        : `
                            <div class="sub">
                                No relics owned.
                            </div>
                        `
                }

            </div>
        </div>
    `;
}


/* =========================================================
   RELICS
========================================================= */

function renderRelicLoadoutHTML() {

    const equipped =
        relicLoadout?.equipped || [];

    const slotCount =
        Number(relicLoadout?.slots || GAME_CONFIG?.relicSlots || 3);

    let html = `
        <div class="relic-loadout">
    `;

    for (
        let i = 0;
        i < slotCount;
        i++
    ) {

        const relicId =
            equipped[i];

        const relic =
            relicDatabase.find(
                entry => entry.id === relicId
            );

        const icon =
            getArtworkPath(relic, "relic");

        html += `
            <div class="icon-row relic-slot">

                ${iconImageHTML(icon, relic?.name || "Empty Relic Slot", "relic")}

                <div class="icon-row-content">
                    <div class="sub">
                        Slot ${i + 1}:
                        ${relic ? escapeHTML(relic.name) : "Empty"}
                    </div>

                    ${
                        relic?.description
                            ? `
                                <div class="sub">
                                    ${escapeHTML(relic.description)}
                                </div>
                            `
                            : ""
                    }
                </div>

            </div>
        `;
    }

    html += `
        </div>
    `;

    return html;
}

function renderRelics() {

    const el =
        document.getElementById("relics");

    if (!el) return;

    el.innerHTML = `
        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    Relic Loadout
                </div>

                ${renderRelicLoadoutHTML()}

            </div>
        </div>
    `;
}


/* =========================================================
   EFFECTS
========================================================= */

function renderEffects() {

    const el =
        document.getElementById("effects");

    if (!el) return;

    const effects =
        typeof getAllActiveEffects === "function"
            ? getAllActiveEffects()
            : activeEffects || playerData.buffs || [];

    el.innerHTML = `
        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    Active Effects
                </div>

                ${
                    effects.length
                        ? effects.map(effect => `
                            <div class="sub">
                                ${escapeHTML(effect.attribute || effect.name || effect.type)}
                                ${effect.amount ? `+${effect.amount}` : ""}
                                ${effect.duration ? `(${escapeHTML(effect.duration)})` : ""}
                            </div>
                        `).join("")
                        : `
                            <div class="sub">
                                No active effects.
                            </div>
                        `
                }

            </div>
        </div>
    `;
}


/* =========================================================
   UI ACTIONS
========================================================= */

function handleAcceptQuest(id) {

    if (typeof acceptQuest === "function") {
        acceptQuest(id);
    }

    renderAll();
}

function handleCompleteQuest(id) {

    if (typeof completeQuest === "function") {
        completeQuest(id);
    }

    renderAll();
}

function handleAbandonQuest() {

    if (typeof abandonQuest === "function") {
        abandonQuest();
    }

    renderAll();
}

function handleSelectBoss(id) {

    if (typeof selectBoss === "function") {
        selectBoss(id);
    }

    renderAll();
}

function handleStartBossChallenge(id) {

    if (typeof startBossChallenge === "function") {
        startBossChallenge(id);
    }

    renderAll();
}

function handleGiveUpBossChallenge() {

    if (typeof giveUpBossChallenge === "function") {
        giveUpBossChallenge();
    }

    renderAll();
}

function handleUseItem(id) {

    if (typeof useItem === "function") {
        useItem(id);
    }

    renderAll();
}

function handleDamageBoss(id, damage) {

    if (typeof damageBoss === "function") {
        damageBoss(id, damage);
    }

    renderAll();
}


/* =========================================================
   LIVE REFRESH
========================================================= */

setInterval(() => {

    renderDashboard();

    renderAvailableQuests();
    renderDailyQuests();
    renderEvents();

    renderBoss();

    renderEffects();

}, 1000);


/* =========================================================
   DEBUG
========================================================= */

function forceRerender() {
    renderAll();
}