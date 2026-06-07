/* =========================================================
   QUEST CHRONICLES - SYSTEMS v0.1
   Core Gameplay Logic Layer
========================================================= */


/* =========================================================
   UTILITY HELPERS
========================================================= */

function findQuestById(id) {
    const all = [
        ...questDatabase.normal,
        ...questDatabase.daily,
        ...questDatabase.events,
        ...questDatabase.boss
    ];
    return all.find(q => q.id === id);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}


/* =========================================================
   QUEST SLOT SYSTEM (OPTION C)
   Auto-assign + future reordering support
========================================================= */

function getActiveSlots() {
    return playerData.activeQuests;
}

function addQuestToActive(quest) {

    const slots = playerData.activeQuestSlots;

    if (playerData.activeQuests.length >= slots) {
        console.log("No free quest slots.");
        return false;
    }

    playerData.activeQuests.push({
        ...quest,
        acceptedAt: Date.now()
    });

    return true;
}

function removeActiveQuest(id) {
    playerData.activeQuests =
        playerData.activeQuests.filter(q => q.id !== id);
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
   QUEST COMPLETE SYSTEM
========================================================= */

function completeQuest(questId) {

    const questIndex = playerData.activeQuests.findIndex(q => q.id === questId);
    if (questIndex === -1) return;

    const quest = playerData.activeQuests[questIndex];

    /* -------------------------
       APPLY REWARDS
    ------------------------- */

    applyQuestRewards(quest);

    /* -------------------------
       REMOVE QUEST
    ------------------------- */

    playerData.activeQuests.splice(questIndex, 1);

    playerData.lifetime.questsCompleted++;

    console.log("Quest completed:", quest.name);
}


/* =========================================================
   REWARD SYSTEM
========================================================= */

function applyQuestRewards(quest) {

    if (!quest.rewards) return;

    /* XP */
    if (quest.rewards.xp) {
        gainXP(quest.rewards.xp);
    }

    /* GOLD */
    if (quest.rewards.gold) {
        playerData.gold += quest.rewards.gold;
    }

    /* STATS */
    if (quest.rewards.stats) {
        for (const stat in quest.rewards.stats) {
            gainStatXP(stat, quest.rewards.stats[stat]);
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

    console.log("LEVEL UP! ->", playerData.level);
}


/* =========================================================
   STAT SYSTEM
========================================================= */

function gainStatXP(stat, amount) {

    if (!playerData.stats[stat]) return;

    const s = playerData.stats[stat];

    s.xp += amount;

    const threshold = 50 * s.level;

    if (s.xp >= threshold) {
        s.xp -= threshold;
        s.level++;
    }
}


/* =========================================================
   BOSS SYSTEM (BASIC)
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

    playerData.gold += boss.rewards.gold || 0;
    gainXP(boss.rewards.xp || 0);

    if (boss.rewards.title) {
        playerData.title = boss.rewards.title;
    }
}


/* =========================================================
   ITEM SYSTEM
========================================================= */

function useItem(itemId) {

    const item = itemDatabase.find(i => i.id === itemId);
    if (!item) return;

    switch (item.effect.type) {

        case "refresh_quest_slot":
            console.log("Quest slot refreshed (placeholder)");
            break;

        case "xp_multiplier":
            console.log("XP boost applied (placeholder)");
            break;

        default:
            console.log("Unknown item effect");
    }
}


/* =========================================================
   EVENT SYSTEM
========================================================= */

function isEventActive(event) {

    const now = new Date().toISOString().split("T")[0];

    return now >= event.startDate && now <= event.endDate;
}

function getActiveEvents() {
    return eventDatabase.filter(isEventActive);
}


/* =========================================================
   AUTO EVENT REFRESH (placeholder hook)
========================================================= */

function refreshEvents() {
    console.log("Events refreshed:", getActiveEvents());
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