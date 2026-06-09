/* =========================================================
   QUEST CHRONICLES - SYSTEMS v4.1
   Quest Cooldowns + Refresh Timers + Boss Challenge Rules
   Compatible with database.js v3.0
========================================================= */


/* =========================================================
   UTILITY HELPERS
========================================================= */

function findQuestById(id) {
    return questDatabase.find(q => q.id === id);
}

function findBossById(id) {
    return bossDatabase.find(b => b.id === id);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function nowMs() {
    return Date.now();
}

function safeClone(data) {

    if (typeof structuredClone === "function") {
        return structuredClone(data);
    }

    return JSON.parse(JSON.stringify(data));
}

function randomFromArray(array) {

    if (!array || !array.length) return null;

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];
}

function formatDuration(ms) {

    ms = Math.max(0, ms);

    const totalSeconds =
        Math.floor(ms / 1000);

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

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


/* =========================================================
   STATE NORMALIZATION
========================================================= */

function ensureRuntimeState() {

    if (!questBoardState.normalSlots) {
        questBoardState.normalSlots = [];
    }

    if (!questBoardState.dailySlots) {
        questBoardState.dailySlots = [];
    }

    if (!questBoardState.eventSlots) {
        questBoardState.eventSlots = [];
    }

    if (!questBoardState.slotCooldowns) {
        questBoardState.slotCooldowns = {};
    }

    if (!bossProgression.unlockedBosses) {
        bossProgression.unlockedBosses = [];
    }

    if (!bossProgression.completedBosses) {
        bossProgression.completedBosses = [];
    }

    if (!bossProgression.selectedBossId) {
        bossProgression.selectedBossId = null;
    }

    if (bossChallengeState.damageDealt === undefined) {
        bossChallengeState.damageDealt = 0;
    }

    if (!bossChallengeState.pendingRewards) {
        bossChallengeState.pendingRewards = {
            xp: 0,
            gold: 0,
            gems: 0,
            items: [],
            relics: []
        };
    }

    if (!relicLoadout.equipped) {
        relicLoadout.equipped = [];
    }

    while (
        relicLoadout.equipped.length <
        relicLoadout.slots
    ) {
        relicLoadout.equipped.push(null);
    }
}


/* =========================================================
   QUEST BOARD HELPERS
========================================================= */

function getBoardSlotsByType(type) {

    if (type === QUEST_TYPES.NORMAL) {
        return questBoardState.normalSlots;
    }

    if (type === QUEST_TYPES.DAILY) {
        return questBoardState.dailySlots;
    }

    if (type === QUEST_TYPES.EVENT) {
        return questBoardState.eventSlots;
    }

    return [];
}

function getQuestTypeFromBoardName(boardName) {

    if (boardName === "normalSlots") {
        return QUEST_TYPES.NORMAL;
    }

    if (boardName === "dailySlots") {
        return QUEST_TYPES.DAILY;
    }

    if (boardName === "eventSlots") {
        return QUEST_TYPES.EVENT;
    }

    return QUEST_TYPES.NORMAL;
}

function getBoardNameFromQuestType(type) {

    if (type === QUEST_TYPES.NORMAL) {
        return "normalSlots";
    }

    if (type === QUEST_TYPES.DAILY) {
        return "dailySlots";
    }

    if (type === QUEST_TYPES.EVENT) {
        return "eventSlots";
    }

    return "normalSlots";
}

function getQuestFromSlot(slot) {

    if (!slot) return null;

    return findQuestById(slot.questId);
}

function createQuestSlot(quest, type, index = 0) {

    const time = nowMs();

    return {
        slotId:
            `${type}_${index}_${time}_${Math.random().toString(36).slice(2, 7)}`,

        type:
            type,

        questId:
            quest.id,

        spawnedAt:
            time,

        expiresAt:
            time +
            (
                getQuestLifetimeMinutes(quest) *
                60000
            ),

        cooldownUntil:
            null,

        lastQuestIds:
            [quest.id]
    };
}

function getQuestLifetimeMinutes(quest) {

    return (
        quest?.boardConfig?.expiresAfterMinutes ||
        GAME_CONFIG.questLifetimeMinutes
    );
}

function getQuestCooldownMinutes(quest) {

    return (
        quest?.boardConfig?.cooldownMinutes ||
        GAME_CONFIG.questCooldownMinutes
    );
}

function normalizeSlot(slot, type, index) {

    const quest =
        findQuestById(slot.questId);

    if (!slot.slotId) {
        slot.slotId =
            `${type}_${index}_${slot.spawnedAt || nowMs()}`;
    }

    if (!slot.type) {
        slot.type = type;
    }

    if (!slot.spawnedAt) {
        slot.spawnedAt = nowMs();
    }

    if (!slot.expiresAt) {
        slot.expiresAt =
            nowMs() +
            (
                getQuestLifetimeMinutes(quest) *
                60000
            );
    }

    if (slot.cooldownUntil === undefined) {
        slot.cooldownUntil = null;
    }

    if (!slot.lastQuestIds) {
        slot.lastQuestIds =
            slot.questId
                ? [slot.questId]
                : [];
    }

    return slot;
}

function normalizeQuestBoards() {

    questBoardState.normalSlots =
        (questBoardState.normalSlots || [])
            .map((slot, index) =>
                normalizeSlot(
                    slot,
                    QUEST_TYPES.NORMAL,
                    index
                )
            );

    questBoardState.dailySlots =
        (questBoardState.dailySlots || [])
            .map((slot, index) =>
                normalizeSlot(
                    slot,
                    QUEST_TYPES.DAILY,
                    index
                )
            );

    questBoardState.eventSlots =
        (questBoardState.eventSlots || [])
            .map((slot, index) =>
                normalizeSlot(
                    slot,
                    QUEST_TYPES.EVENT,
                    index
                )
            );
}

function getSlotStatus(slot) {

    if (!slot) {
        return "empty";
    }

    if (
        slot.cooldownUntil &&
        nowMs() < slot.cooldownUntil
    ) {
        return "cooldown";
    }

    if (
        playerData.activeQuest &&
        playerData.activeQuest.sourceSlotId === slot.slotId
    ) {
        return "accepted";
    }

    if (
        slot.expiresAt &&
        nowMs() >= slot.expiresAt
    ) {
        return "expired";
    }

    return "available";
}

function getSlotTimeRemaining(slot) {

    const status =
        getSlotStatus(slot);

    if (status === "cooldown") {
        return Math.max(
            0,
            slot.cooldownUntil - nowMs()
        );
    }

    if (
        status === "available" ||
        status === "accepted"
    ) {
        return Math.max(
            0,
            slot.expiresAt - nowMs()
        );
    }

    return 0;
}

function isQuestSlotAcceptable(slot) {

    if (!slot) return false;

    return (
        getSlotStatus(slot) === "available"
    );
}

function findSlotByQuestId(questId) {

    const boards = [
        questBoardState.normalSlots,
        questBoardState.dailySlots,
        questBoardState.eventSlots
    ];

    for (const board of boards) {

        const index =
            board.findIndex(
                slot =>
                    slot.questId === questId
            );

        if (index !== -1) {

            return {
                slot: board[index],
                board,
                index
            };
        }
    }

    return null;
}

function findSlotBySlotId(slotId) {

    const boards = [
        questBoardState.normalSlots,
        questBoardState.dailySlots,
        questBoardState.eventSlots
    ];

    for (const board of boards) {

        const index =
            board.findIndex(
                slot =>
                    slot.slotId === slotId
            );

        if (index !== -1) {

            return {
                slot: board[index],
                board,
                index
            };
        }
    }

    return null;
}


/* =========================================================
   QUEST BOARD GENERATION
========================================================= */

function generateQuestBoard() {

    generateNormalQuestBoard();
    generateDailyQuestBoard();
    generateEventQuestBoard();

    questBoardState.generatedAt = nowMs();
}

function generateNormalQuestBoard() {

    const pool =
        getQuestsByType(
            QUEST_TYPES.NORMAL
        );

    questBoardState.normalSlots =
        generateSlotsFromPool(
            pool,
            QUEST_TYPES.NORMAL,
            GAME_CONFIG.normalQuestSlots
        );
}

function generateDailyQuestBoard() {

    const pool =
        getQuestsByType(
            QUEST_TYPES.DAILY
        );

    questBoardState.dailySlots =
        generateSlotsFromPool(
            pool,
            QUEST_TYPES.DAILY,
            GAME_CONFIG.dailyQuestSlots
        );
}

function generateEventQuestBoard() {

    const pool =
        getActiveEventQuests();

    questBoardState.eventSlots =
        generateSlotsFromPool(
            pool,
            QUEST_TYPES.EVENT,
            pool.length
        );
}

function generateSlotsFromPool(pool, type, count) {

    const slots = [];

    if (!pool.length) {
        return slots;
    }

    for (let i = 0; i < count; i++) {

        const quest =
            pool[i % pool.length];

        if (!quest) continue;

        slots.push(
            createQuestSlot(
                quest,
                type,
                i
            )
        );
    }

    return slots;
}

function getActiveEventQuests() {

    const activeEvents =
        getActiveEvents();

    const activeTags =
        activeEvents.map(
            event => event.tag
        );

    return questDatabase.filter(quest =>
        quest.type === QUEST_TYPES.EVENT &&
        quest.eventTags?.some(tag =>
            activeTags.includes(tag)
        )
    );
}


/* =========================================================
   QUEST SLOT REFRESH
========================================================= */

function refreshQuestSlot(slot, options = {}) {

    if (!slot) return false;

    const type =
        slot.type ||
        findQuestById(slot.questId)?.type ||
        QUEST_TYPES.NORMAL;

    const pool =
        type === QUEST_TYPES.EVENT
            ? getActiveEventQuests()
            : getQuestsByType(type);

    if (!pool.length) {
        clearQuestSlot(slot);
        return false;
    }

    const board =
        getBoardSlotsByType(type);

    const currentBoardQuestIds =
        board
            .filter(other => other !== slot)
            .map(other => other.questId);

    let candidates =
        pool.filter(quest =>
            quest.id !== slot.questId
        );

    if (
        candidates.length >
        currentBoardQuestIds.length
    ) {
        candidates =
            candidates.filter(quest =>
                !currentBoardQuestIds.includes(
                    quest.id
                )
            );
    }

    if (!candidates.length) {
        candidates = pool;
    }

    const nextQuest =
        randomFromArray(candidates);

    if (!nextQuest) {
        return false;
    }

    const time =
        nowMs();

    slot.questId =
        nextQuest.id;

    slot.spawnedAt =
        time;

    slot.expiresAt =
        time +
        (
            getQuestLifetimeMinutes(nextQuest) *
            60000
        );

    slot.cooldownUntil =
        null;

    slot.lastQuestIds =
        [
            ...(slot.lastQuestIds || []),
            nextQuest.id
        ].slice(-5);

    return true;
}

function clearQuestSlot(slot) {

    slot.questId = null;
    slot.spawnedAt = null;
    slot.expiresAt = null;
    slot.cooldownUntil = null;
}

function startQuestSlotCooldown(slot, quest) {

    if (!slot) return;

    const cooldownMinutes =
        getQuestCooldownMinutes(quest);

    slot.cooldownUntil =
        nowMs() +
        (
            cooldownMinutes *
            60000
        );

    slot.expiresAt =
        null;

    questBoardState.slotCooldowns[
        slot.slotId
    ] =
        slot.cooldownUntil;
}

function finishQuestSlotCooldown(slot) {

    if (!slot) return;

    delete questBoardState.slotCooldowns[
        slot.slotId
    ];

    refreshQuestSlot(slot);
}

function refreshQuestSlotAfterCompletion(slot) {

    if (!slot) return;

    if (bossChallengeState.active) {

        refreshQuestSlot(slot, {
            reason: "boss_challenge_completion"
        });

        return;
    }

    const quest =
        findQuestById(slot.questId);

    startQuestSlotCooldown(
        slot,
        quest
    );
}


/* =========================================================
   QUEST BOARD PROCESSING
========================================================= */

function processQuestBoard() {

    normalizeQuestBoards();

    syncEventQuestBoard();

    if (bossChallengeState.active) {
        return;
    }

    processQuestBoardSlots(
        questBoardState.normalSlots
    );

    processQuestBoardSlots(
        questBoardState.dailySlots
    );

    processQuestBoardSlots(
        questBoardState.eventSlots
    );
}

function processQuestBoardSlots(slots) {

    const time =
        nowMs();

    slots.forEach(slot => {

        const status =
            getSlotStatus(slot);

        if (
            status === "accepted"
        ) {
            return;
        }

        if (
            slot.cooldownUntil &&
            time >= slot.cooldownUntil
        ) {

            finishQuestSlotCooldown(slot);
            return;
        }

        if (
            slot.expiresAt &&
            time >= slot.expiresAt
        ) {

            refreshQuestSlot(slot, {
                reason: "expired"
            });
        }
    });
}

function syncEventQuestBoard() {

    const activeEventQuests =
        getActiveEventQuests();

    const activeQuestIds =
        activeEventQuests.map(
            quest => quest.id
        );

    questBoardState.eventSlots =
        questBoardState.eventSlots.filter(slot => {

            if (
                playerData.activeQuest &&
                playerData.activeQuest.sourceSlotId === slot.slotId
            ) {
                return true;
            }

            return activeQuestIds.includes(
                slot.questId
            );
        });

    activeEventQuests.forEach((quest, index) => {

        const alreadyExists =
            questBoardState.eventSlots.some(
                slot =>
                    slot.questId === quest.id
            );

        if (!alreadyExists) {

            questBoardState.eventSlots.push(
                createQuestSlot(
                    quest,
                    QUEST_TYPES.EVENT,
                    index
                )
            );
        }
    });
}


/* =========================================================
   QUEST ACCEPTANCE
========================================================= */

function canAcceptQuest() {
    return !playerData.activeQuest;
}

function acceptQuest(questId) {

    const quest =
        findQuestById(questId);

    if (!quest) return false;

    if (!canAcceptQuest()) {
        return false;
    }

    const slotInfo =
        findSlotByQuestId(questId);

    if (
        slotInfo &&
        !isQuestSlotAcceptable(
            slotInfo.slot
        )
    ) {
        return false;
    }

    playerData.activeQuest = {
        ...safeClone(quest),

        acceptedAt:
            nowMs(),

        progress: 0,

        sourceSlotId:
            slotInfo?.slot?.slotId || null,

        sourceQuestId:
            quest.id,

        sourceQuestType:
            quest.type
    };

    return true;
}

function abandonQuest() {

    playerData.activeQuest = null;
}


/* =========================================================
   QUEST COMPLETION
========================================================= */

function completeQuest(questId) {

    const quest =
        playerData.activeQuest;

    if (!quest) return false;

    if (quest.id !== questId) {
        return false;
    }

    const slotInfo =
        quest.sourceSlotId
            ? findSlotBySlotId(
                quest.sourceSlotId
            )
            : findSlotByQuestId(
                quest.id
            );

    applyQuestRewards(quest);

    playerData.lifetime
        .questsCompleted++;

    if (
        playerData.lifetime
            .questsByType?.[
                quest.type
            ] !== undefined
    ) {

        playerData.lifetime
            .questsByType[
                quest.type
            ]++;
    }

    if (slotInfo?.slot) {

        refreshQuestSlotAfterCompletion(
            slotInfo.slot
        );
    }

    playerData.activeQuest =
        null;

    return true;
}


/* =========================================================
   REWARD SYSTEM
========================================================= */

function applyQuestRewards(quest) {

    const rewards =
        quest.rewards;

    if (!rewards) return;

    if (
        bossChallengeState.active
    ) {

        addPendingChallengeRewards(
            rewards
        );

    } else {

        grantStandardQuestRewards(
            rewards
        );
    }

    let totalBossDamage = 0;

    if (rewards.stats) {

        for (const stat in rewards.stats) {

            const amount =
                rewards.stats[stat];

            gainStatXP(
                stat,
                amount
            );

            totalBossDamage +=
                calculateBossDamageFromStat(
                    stat,
                    amount
                );
        }
    }

    if (
        bossChallengeState.active &&
        bossChallengeState.currentBossId
    ) {

        damageBoss(
            bossChallengeState.currentBossId,
            totalBossDamage
        );
    }
}

function grantStandardQuestRewards(rewards) {

    if (rewards.xp) {
        gainXP(rewards.xp);
    }

    if (rewards.gold) {
        gainGold(rewards.gold);
    }

    if (rewards.gems) {
        playerData.gems += rewards.gems;
    }

    if (rewards.items?.length) {
        playerData.inventory.push(
            ...rewards.items
        );
    }

    if (rewards.relics?.length) {
        playerData.relicInventory.push(
            ...rewards.relics
        );
    }
}

function addPendingChallengeRewards(rewards) {

    ensureRuntimeState();

    bossChallengeState.pendingRewards.xp +=
        rewards.xp || 0;

    bossChallengeState.pendingRewards.gold +=
        rewards.gold || 0;

    bossChallengeState.pendingRewards.gems +=
        rewards.gems || 0;

    if (rewards.items?.length) {
        bossChallengeState.pendingRewards.items.push(
            ...rewards.items
        );
    }

    if (rewards.relics?.length) {
        bossChallengeState.pendingRewards.relics.push(
            ...rewards.relics
        );
    }
}

function grantPendingChallengeRewards() {

    ensureRuntimeState();

    const rewards =
        bossChallengeState.pendingRewards;

    if (!rewards) return;

    if (rewards.xp) {
        playerData.xp += rewards.xp;

        while (
            playerData.xp >=
            playerData.xpToNext
        ) {
            levelUp();
        }
    }

    if (rewards.gold) {
        playerData.gold += rewards.gold;
    }

    if (rewards.gems) {
        playerData.gems += rewards.gems;
    }

    if (rewards.items?.length) {
        playerData.inventory.push(
            ...rewards.items
        );
    }

    if (rewards.relics?.length) {
        playerData.relicInventory.push(
            ...rewards.relics
        );
    }

    resetPendingChallengeRewards();
}

function resetPendingChallengeRewards() {

    bossChallengeState.pendingRewards = {
        xp: 0,
        gold: 0,
        gems: 0,
        items: [],
        relics: []
    };
}


/* =========================================================
   GOLD SYSTEM
========================================================= */

function gainGold(amount) {

    if (
        bossChallengeState.goldLocked
    ) {
        return;
    }

    playerData.gold += amount;
}


/* =========================================================
   XP SYSTEM
========================================================= */

function gainXP(amount) {

    if (
        bossChallengeState.xpLocked
    ) {
        return;
    }

    playerData.xp += amount;

    while (
        playerData.xp >=
        playerData.xpToNext
    ) {
        levelUp();
    }
}

function levelUp() {

    playerData.xp -=
        playerData.xpToNext;

    playerData.level++;

    playerData.xpToNext =
        Math.floor(
            playerData.xpToNext *
            1.15
        );

    updateBossUnlocks();
}


/* =========================================================
   STAT SYSTEM
========================================================= */

function gainStatXP(stat, amount) {

    const s =
        playerData.stats?.[
            stat
        ];

    if (!s) return;

    s.xp += amount;

    while (
        s.xp >=
        50 * s.level
    ) {

        s.xp -=
            50 * s.level;

        s.level++;
    }
}


/* =========================================================
   BOSS PROGRESSION
========================================================= */

function updateBossUnlocks() {

    const unlocked =
        getBossesUnlockedAtLevel(
            playerData.level
        );

    bossProgression.unlockedBosses =
        unlocked.map(
            boss => boss.id
        );

    if (
        !bossProgression.selectedBossId &&
        unlocked.length
    ) {

        bossProgression.selectedBossId =
            unlocked[0].id;
    }

    if (
        bossProgression.selectedBossId
    ) {

        const selected =
            findBossById(
                bossProgression.selectedBossId
            );

        if (
            selected &&
            playerData.level <
            selected.unlockLevel
        ) {

            bossProgression.selectedBossId =
                unlocked[0]?.id || null;
        }
    }
}

function getAvailableBosses() {

    return bossDatabase.filter(
        boss =>
            playerData.level >=
            boss.unlockLevel
    );
}

function getSelectedBoss() {

    if (
        !bossProgression.selectedBossId
    ) {

        updateBossUnlocks();
    }

    return findBossById(
        bossProgression.selectedBossId
    );
}

function selectBoss(bossId) {

    if (
        bossChallengeState.active
    ) {
        return false;
    }

    const boss =
        findBossById(
            bossId
        );

    if (!boss) {
        return false;
    }

    if (
        playerData.level <
        boss.unlockLevel
    ) {
        return false;
    }

    bossProgression.selectedBossId =
        bossId;

    return true;
}


/* =========================================================
   BOSS CHALLENGE
========================================================= */

function startBossChallenge(bossId) {

    if (
        bossChallengeState.active
    ) {
        return false;
    }

    const boss =
        findBossById(
            bossId
        );

    if (!boss) {
        return false;
    }

    if (
        playerData.level <
        boss.unlockLevel
    ) {
        return false;
    }

    bossProgression.selectedBossId =
        boss.id;

    bossChallengeState.active =
        true;

    bossChallengeState.currentBossId =
        boss.id;

    bossChallengeState.startedAt =
        nowMs();

    bossChallengeState.damageDealt =
        0;

    bossChallengeState.xpLocked =
        true;

    bossChallengeState.goldLocked =
        true;

    resetPendingChallengeRewards();

    return true;
}

function giveUpBossChallenge() {

    bossChallengeState.active =
        false;

    bossChallengeState.currentBossId =
        null;

    bossChallengeState.startedAt =
        null;

    bossChallengeState.damageDealt =
        0;

    bossChallengeState.xpLocked =
        false;

    bossChallengeState.goldLocked =
        false;

    resetPendingChallengeRewards();
}

function completeBossChallenge() {

    bossChallengeState.active =
        false;

    bossChallengeState.currentBossId =
        null;

    bossChallengeState.startedAt =
        null;

    bossChallengeState.damageDealt =
        0;

    bossChallengeState.xpLocked =
        false;

    bossChallengeState.goldLocked =
        false;
}


/* =========================================================
   BOSS DAMAGE
========================================================= */

function calculateBossDamageFromStat(stat, amount) {

    if (
        !bossChallengeState.active ||
        !bossChallengeState.currentBossId
    ) {
        return 0;
    }

    const boss =
        findBossById(
            bossChallengeState.currentBossId
        );

    if (!boss) {
        return 0;
    }

    if (!amount || amount <= 0) {
        return 0;
    }

    let multiplier =
        GAME_CONFIG
            .bossDamageNeutralMultiplier;

    if (
        boss.weaknesses?.includes(stat)
    ) {

        multiplier =
            GAME_CONFIG
                .bossDamageWeaknessMultiplier;
    }

    if (
        boss.resistances?.includes(stat)
    ) {

        multiplier =
            GAME_CONFIG
                .bossDamageResistanceMultiplier;
    }

    multiplier +=
        getRelativeEffectBonus(
            "boss_damage"
        ) / 100;

    return Math.max(
        1,
        Math.floor(
            amount *
            multiplier
        )
    );
}

function damageBoss(bossId, amount) {

    if (
        !bossChallengeState.active
    ) {
        return;
    }

    if (!amount || amount <= 0) {
        return;
    }

    const boss =
        findBossById(
            bossId
        );

    if (!boss) {
        return;
    }

    boss.hp = clamp(
        boss.hp - amount,
        0,
        boss.maxHp
    );

    bossChallengeState.damageDealt +=
        amount;

    playerData.lifetime
        .totalBossDamageDealt +=
        amount;

    if (
        boss.hp <= 0
    ) {

        defeatBoss(
            boss
        );
    }
}

function defeatBoss(boss) {

    const rewards =
        boss.rewards || {};

    grantPendingChallengeRewards();

    grantBossRewards(
        rewards
    );

    playerData.lifetime
        .bossesDefeated++;

    if (
        !bossProgression.completedBosses
            .includes(
                boss.id
            )
    ) {

        bossProgression
            .completedBosses
            .push(
                boss.id
            );
    }

    boss.hp =
        boss.maxHp;

    completeBossChallenge();
}

function grantBossRewards(rewards) {

    if (rewards.gold) {
        playerData.gold += rewards.gold;
    }

    if (rewards.gems) {
        playerData.gems += rewards.gems;
    }

    if (rewards.xp) {
        playerData.xp += rewards.xp;

        while (
            playerData.xp >=
            playerData.xpToNext
        ) {
            levelUp();
        }
    }

    if (rewards.title) {

        playerData.title =
            rewards.title;

        if (
            !playerData.titleHistory.includes(
                rewards.title
            )
        ) {

            playerData.titleHistory.push(
                rewards.title
            );
        }
    }

    if (rewards.relics?.length) {

        playerData.relicInventory.push(
            ...rewards.relics
        );
    }

    if (rewards.items?.length) {

        playerData.inventory.push(
            ...rewards.items
        );
    }
}


/* =========================================================
   RELICS
========================================================= */

function equipRelic(relicId, slotIndex = 0) {

    if (
        bossChallengeState.active
    ) {
        return false;
    }

    if (
        slotIndex < 0 ||
        slotIndex >=
        relicLoadout.slots
    ) {
        return false;
    }

    if (
        !playerData.relicInventory.includes(
            relicId
        )
    ) {
        return false;
    }

    relicLoadout.equipped[
        slotIndex
    ] = relicId;

    return true;
}

function unequipRelic(slotIndex) {

    if (
        bossChallengeState.active
    ) {
        return false;
    }

    if (
        slotIndex < 0 ||
        slotIndex >=
        relicLoadout.slots
    ) {
        return false;
    }

    relicLoadout.equipped[
        slotIndex
    ] = null;

    return true;
}

function getEquippedRelics() {

    return relicLoadout.equipped
        .filter(Boolean)
        .map(relicId =>
            relicDatabase.find(
                relic =>
                    relic.id === relicId
            )
        )
        .filter(Boolean);
}


/* =========================================================
   ITEM SYSTEM
========================================================= */

function useItem(itemId) {

    if (
        bossChallengeState.active
    ) {
        return false;
    }

    const item =
        itemDatabase.find(
            i => i.id === itemId
        );

    if (!item) return false;

    item.effects?.forEach(
        effect => {

            activeEffects.push({

                ...effect,

                appliedAt:
                    nowMs()
            });

        }
    );

    return true;
}


/* =========================================================
   EFFECT PROCESSING
========================================================= */

function getAllActiveEffects() {

    const relicEffects =
        getEquippedRelics()
            .flatMap(
                relic =>
                    relic.effects || []
            );

    return [
        ...activeEffects,
        ...relicEffects
    ];
}

function getRelativeEffectBonus(attribute) {

    return getAllActiveEffects()
        .filter(effect =>
            effect.attribute === attribute &&
            effect.type === EFFECT_TYPES.RELATIVE_BUFF
        )
        .reduce(
            (total, effect) =>
                total + (effect.amount || 0),
            0
        );
}

function processEffects() {

    const time =
        nowMs();

    for (
        let i =
            activeEffects.length - 1;
        i >= 0;
        i--
    ) {

        const effect =
            activeEffects[i];

        if (
            !effect.durationValue ||
            effect.duration === "permanent"
        ) {
            continue;
        }

        let durationMs = 0;

        switch (
            effect.duration
        ) {

            case "seconds":
                durationMs =
                    effect.durationValue *
                    1000;
                break;

            case "minutes":
                durationMs =
                    effect.durationValue *
                    60000;
                break;

            case "hours":
                durationMs =
                    effect.durationValue *
                    3600000;
                break;

            case "days":
                durationMs =
                    effect.durationValue *
                    86400000;
                break;

            case "months":
                durationMs =
                    effect.durationValue *
                    2592000000;
                break;
        }

        if (
            durationMs > 0 &&
            time >
            effect.appliedAt +
            durationMs
        ) {

            activeEffects.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   EVENT SYSTEM
========================================================= */

function isEventActive(event) {

    if (
        event.isActiveOverride
    ) {
        return true;
    }

    const time =
        new Date();

    const start =
        new Date(
            event.startDate
        );

    const end =
        new Date(
            event.endDate
        );

    return (
        time >= start &&
        time <= end
    );
}

function getActiveEvents() {

    return eventDatabase.filter(
        isEventActive
    );
}


/* =========================================================
   GAME TICK
========================================================= */

function processBossRegeneration() {

    if (
        bossChallengeState.active
    ) {
        return;
    }

    bossDatabase.forEach(
        boss => {

            if (
                boss.hp <
                boss.maxHp
            ) {

                boss.hp =
                    Math.min(
                        boss.maxHp,
                        boss.hp +
                        (
                            boss.regenRate ||
                            0
                        )
                    );
            }
        }
    );
}

function gameTick() {

    ensureRuntimeState();

    processQuestBoard();

    processBossRegeneration();

    processEffects();
}


/* =========================================================
   INITIALIZATION
========================================================= */

ensureRuntimeState();

updateBossUnlocks();

if (
    !questBoardState.normalSlots.length ||
    !questBoardState.dailySlots.length
) {
    generateQuestBoard();
} else {
    normalizeQuestBoards();
}

setInterval(
    gameTick,
    1000
);


/* =========================================================
   DEBUG
========================================================= */

function debugGiveGold(amount) {
    playerData.gold += amount;
}

function debugGiveXP(amount) {
    gainXP(amount);
}

function debugRefreshBoard() {
    generateQuestBoard();
}

function debugClearCooldowns() {

    questBoardState.slotCooldowns = {};

    [
        ...questBoardState.normalSlots,
        ...questBoardState.dailySlots,
        ...questBoardState.eventSlots
    ].forEach(slot => {
        slot.cooldownUntil = null;
    });
}