/* =========================================================
   QUEST CHRONICLES - SYSTEMS v1.1
   Core Gameplay Logic Layer (Editor + Save Safe + Scalable)
========================================================= */


/* =========================================================
   UTILITY HELPERS
========================================================= */

function findQuestById(id) {

    const all = [
        ...(questDatabase.normal || []),
        ...(questDatabase.daily || []),
        ...(questDatabase.events || []),
        ...(questDatabase.boss || [])
    ];

    return all.find(q => q.id === id);
}


function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}


/* =========================================================
   QUEST SLOT SYSTEM
========================================================= */

function addQuestToActive(quest) {

    if (playerData.activeQuests.length >= playerData.activeQuestSlots) {
        console.log("No free quest slots.");
        return false;
    }

    if (playerData.activeQuests.some(q => q.id === quest.id)) {
        console.log("Quest already active.");
        return false;
    }

    playerData.activeQuests.push({
        ...quest,
        acceptedAt: Date.now(),
        progress: 0
    });

    return true;
}


/* =========================================================
   QUEST ACCEPT SYSTEM
========================================================= */

function acceptQuest(questId) {

    const quest = findQuestById(questId);
    if (!quest) return;

    const success = addQuestToActive(quest);

    if (success) {
        console.log("Quest accepted:", quest.name);
    }
}


/* =========================================================
   QUEST REMOVE SYSTEM
========================================================= */

function removeActiveQuest(id) {
    playerData.activeQuests =
        playerData.activeQuests.filter(q => q.id !== id);
}


/* =========================================================
   QUEST COMPLETE SYSTEM
========================================================= */

function completeQuest(questId) {

    const index = playerData.activeQuests.findIndex(q => q.id === questId);
    if (index === -1) return;

    const quest = playerData.activeQuests[index];

    applyQuestRewards(quest);

    playerData.activeQuests.splice(index, 1);

    playerData.lifetime.questsCompleted++;

    const type = quest.type || "normal";
    if (playerData.lifetime.questsByType[type] !== undefined) {
        playerData.lifetime.questsByType[type]++;
    }

    console.log("Quest completed:", quest.name);
}


/* =========================================================
   REWARD SYSTEM
========================================================= */

function applyQuestRewards(quest) {

    const rewards = quest.rewards;
    if (!rewards) return;

    if (rewards.xp) gainXP(rewards.xp);

    if (rewards.gold) {
        playerData.gold += rewards.gold;
    }

    if (rewards.stats) {
        for (const stat in rewards.stats) {
            gainStatXP(stat, rewards.stats[stat]);
        }
    }
}


/* =========================================================
   XP + LEVEL SYSTEM
========================================================= */

function gainXP(amount) {

    playerData.xp += amount;

    while (playerData.xp >= playerData.xpToNext) {
        levelUp();
    }
}


function levelUp() {

    playerData.xp -= playerData.xpToNext;
    playerData.level++;

    playerData.xpToNext = Math.floor(playerData.xpToNext * 1.15);

    console.log("LEVEL UP ->", playerData.level);
}


/* =========================================================
   STAT SYSTEM (SCALABLE)
========================================================= */

function gainStatXP(stat, amount) {

    if (!playerData.stats[stat]) return;

    const s = playerData.stats[stat];

    s.xp += amount;

    const threshold = 50 * s.level;

    while (s.xp >= threshold) {
        s.xp -= threshold;
        s.level++;
    }
}


/* =========================================================
   BOSS SYSTEM
========================================================= */

function damageBoss(bossId, amount) {

    const boss = bossDatabase.find(b => b.id === bossId);
    if (!boss) return;

    boss.hp = clamp(boss.hp - amount, 0, boss.maxHp);

    if (boss.hp <= 0) {
        defeatBoss(boss);
    }
}


function defeatBoss(boss) {

    console.log("Boss defeated:", boss.name);

    const rewards = boss.rewards || {};

    if (rewards.gold) playerData.gold += rewards.gold;
    if (rewards.xp) gainXP(rewards.xp);
    if (rewards.title) playerData.title = rewards.title;
}


/* =========================================================
   ITEM SYSTEM (EXTENSION READY)
========================================================= */

function useItem(itemId) {

    const item = itemDatabase.find(i => i.id === itemId);
    if (!item) return;

    const effect = item.effect;
    if (!effect) return;

    switch (effect.type) {

        case "refresh_quest_slot":
            console.log("Quest slot refresh triggered");
            break;

        case "xp_multiplier":
            console.log("XP multiplier applied:", effect.value);
            break;

        default:
            console.log("Unknown item effect:", effect.type);
    }
}


/* =========================================================
   EVENT SYSTEM
========================================================= */

function isEventActive(event) {

    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    return now >= start && now <= end;
}


function getActiveEvents() {
    return eventDatabase.filter(isEventActive);
}


/* =========================================================
   EVENT REFRESH HOOK
========================================================= */

function refreshEvents() {
    console.log("Active events:", getActiveEvents());
}


/* =========================================================
   DEBUG HELPERS
========================================================= */

function debugGiveGold(amount) {
    playerData.gold += amount;
}

function debugGiveXP(amount) {
    gainXP(amount);
}