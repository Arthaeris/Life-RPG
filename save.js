/* =========================================================
   QUEST CHRONICLES - SAVE SYSTEM v4.0
   Compatible with:
   - database.js v3.2+
   - systems.js v4.x+
   - render.js v4.3+
   - editor.js v4.0+
========================================================= */


/* =========================================================
   SAVE CONFIG
========================================================= */

const SAVE_KEY = "quest_chronicles_save_v4";
const LEGACY_SAVE_KEYS = [
    "quest_chronicles_save_v3",
    "quest_chronicles_save_v2",
    "quest_chronicles_save_v1"
];

const SAVE_VERSION = 4;


/* =========================================================
   AUTO LOAD
========================================================= */

window.addEventListener("load", () => {

    loadGame();

    if (
        typeof ensureSaveShape === "function"
    ) {
        ensureSaveShape();
    }

    if (
        typeof updateBossUnlocks === "function"
    ) {
        updateBossUnlocks();
    }

    if (
        typeof generateQuestBoard === "function" &&
        (
            !questBoardState.normalSlots?.length ||
            !questBoardState.dailySlots?.length
        )
    ) {
        generateQuestBoard();
    }

    if (
        typeof renderAll === "function"
    ) {
        renderAll();
    }
});


/* =========================================================
   AUTO SAVE
========================================================= */

setInterval(() => {

    autoSave();

}, 10000);


/* =========================================================
   SAVE HELPERS
========================================================= */

function cloneData(data) {

    if (
        typeof structuredClone === "function"
    ) {
        return structuredClone(data);
    }

    return JSON.parse(
        JSON.stringify(data)
    );
}

function replaceArray(target, source) {

    if (
        !Array.isArray(target) ||
        !Array.isArray(source)
    ) {
        return;
    }

    target.length = 0;

    source.forEach(item => {
        target.push(item);
    });
}

function mergeObject(target, source) {

    if (
        !target ||
        !source ||
        typeof target !== "object" ||
        typeof source !== "object"
    ) {
        return;
    }

    Object.keys(source).forEach(key => {

        if (
            source[key] &&
            typeof source[key] === "object" &&
            !Array.isArray(source[key]) &&
            target[key] &&
            typeof target[key] === "object" &&
            !Array.isArray(target[key])
        ) {

            mergeObject(
                target[key],
                source[key]
            );

        } else {

            target[key] =
                source[key];
        }
    });
}

function findSaveRaw() {

    const current =
        localStorage.getItem(SAVE_KEY);

    if (current) {
        return {
            key: SAVE_KEY,
            raw: current
        };
    }

    for (
        let i = 0;
        i < LEGACY_SAVE_KEYS.length;
        i++
    ) {

        const key =
            LEGACY_SAVE_KEYS[i];

        const raw =
            localStorage.getItem(key);

        if (raw) {
            return {
                key,
                raw
            };
        }
    }

    return null;
}


/* =========================================================
   SAVE SHAPE SAFETY
========================================================= */

function ensureSaveShape() {

    if (
        typeof UI_CONFIG !== "undefined"
    ) {

        if (!UI_CONFIG.backgrounds) {
            UI_CONFIG.backgrounds = {};
        }

        if (!UI_CONFIG.placeholders) {
            UI_CONFIG.placeholders = {};
        }

        const backgroundDefaults = {
            dashboard: "",
            quests: "",
            profile: "",
            shop: "",
            inventory: "",
            settings: "",
            normalQuests: "",
            dailyQuests: "",
            eventQuests: "",
            bossCampaign: ""
        };

        const placeholderDefaults = {
            quest: "",
            event: "",
            boss: "",
            item: "",
            relic: ""
        };

        Object.keys(backgroundDefaults).forEach(key => {

            if (
                UI_CONFIG.backgrounds[key] === undefined
            ) {
                UI_CONFIG.backgrounds[key] =
                    backgroundDefaults[key];
            }
        });

        Object.keys(placeholderDefaults).forEach(key => {

            if (
                UI_CONFIG.placeholders[key] === undefined
            ) {
                UI_CONFIG.placeholders[key] =
                    placeholderDefaults[key];
            }
        });
    }

    if (
        typeof playerData !== "undefined"
    ) {

        if (!playerData.lifetime) {
            playerData.lifetime = {};
        }

        if (!playerData.lifetime.questsByType) {
            playerData.lifetime.questsByType = {
                normal: 0,
                daily: 0,
                event: 0,
                boss: 0
            };
        }

        if (
            playerData.lifetime.questsCompleted === undefined
        ) {
            playerData.lifetime.questsCompleted = 0;
        }

        if (
            playerData.lifetime.bossesDefeated === undefined
        ) {
            playerData.lifetime.bossesDefeated = 0;
        }

        if (
            playerData.lifetime.totalBossDamageDealt === undefined
        ) {
            playerData.lifetime.totalBossDamageDealt = 0;
        }

        if (!Array.isArray(playerData.inventory)) {
            playerData.inventory = [];
        }

        if (!Array.isArray(playerData.relicInventory)) {
            playerData.relicInventory = [];
        }

        if (!Array.isArray(playerData.buffs)) {
            playerData.buffs = [];
        }

        if (!Array.isArray(playerData.titleHistory)) {
            playerData.titleHistory = [];
        }

        if (
            playerData.activeQuest === undefined
        ) {
            playerData.activeQuest = null;
        }
    }

    if (
        typeof questBoardState !== "undefined"
    ) {

        if (!Array.isArray(questBoardState.normalSlots)) {
            questBoardState.normalSlots = [];
        }

        if (!Array.isArray(questBoardState.dailySlots)) {
            questBoardState.dailySlots = [];
        }

        if (!Array.isArray(questBoardState.eventSlots)) {
            questBoardState.eventSlots = [];
        }

        if (!questBoardState.slotCooldowns) {
            questBoardState.slotCooldowns = {};
        }

        if (!questBoardState.generatedAt) {
            questBoardState.generatedAt = Date.now();
        }
    }

    if (
        typeof bossProgression !== "undefined"
    ) {

        if (!Array.isArray(bossProgression.unlockedBosses)) {
            bossProgression.unlockedBosses = [];
        }

        if (!Array.isArray(bossProgression.completedBosses)) {
            bossProgression.completedBosses = [];
        }

        if (
            bossProgression.selectedBossId === undefined
        ) {
            bossProgression.selectedBossId = null;
        }
    }

    if (
        typeof bossChallengeState !== "undefined"
    ) {

        if (
            bossChallengeState.active === undefined
        ) {
            bossChallengeState.active = false;
        }

        if (
            bossChallengeState.currentBossId === undefined
        ) {
            bossChallengeState.currentBossId = null;
        }

        if (
            bossChallengeState.startedAt === undefined
        ) {
            bossChallengeState.startedAt = null;
        }

        if (
            bossChallengeState.damageDealt === undefined
        ) {
            bossChallengeState.damageDealt = 0;
        }

        if (
            bossChallengeState.xpLocked === undefined
        ) {
            bossChallengeState.xpLocked = false;
        }

        if (
            bossChallengeState.goldLocked === undefined
        ) {
            bossChallengeState.goldLocked = false;
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

        if (!Array.isArray(bossChallengeState.pendingRewards.items)) {
            bossChallengeState.pendingRewards.items = [];
        }

        if (!Array.isArray(bossChallengeState.pendingRewards.relics)) {
            bossChallengeState.pendingRewards.relics = [];
        }

        if (
            bossChallengeState.pendingRewards.xp === undefined
        ) {
            bossChallengeState.pendingRewards.xp = 0;
        }

        if (
            bossChallengeState.pendingRewards.gold === undefined
        ) {
            bossChallengeState.pendingRewards.gold = 0;
        }

        if (
            bossChallengeState.pendingRewards.gems === undefined
        ) {
            bossChallengeState.pendingRewards.gems = 0;
        }
    }

    if (
        typeof relicLoadout !== "undefined"
    ) {

        if (
            relicLoadout.slots === undefined
        ) {
            relicLoadout.slots =
                GAME_CONFIG?.relicSlots || 3;
        }

        if (!Array.isArray(relicLoadout.equipped)) {
            relicLoadout.equipped = [];
        }

        while (
            relicLoadout.equipped.length <
            relicLoadout.slots
        ) {
            relicLoadout.equipped.push(null);
        }
    }

    if (
        typeof activeEffects !== "undefined" &&
        !Array.isArray(activeEffects)
    ) {
        window.activeEffects = [];
    }
}


/* =========================================================
   COLLECT SAVE DATA
========================================================= */

function collectSaveData() {

    ensureSaveShape();

    return {

        version:
            SAVE_VERSION,

        timestamp:
            Date.now(),

        gameConfig:
            typeof GAME_CONFIG !== "undefined"
                ? cloneData(GAME_CONFIG)
                : null,

        uiConfig:
            typeof UI_CONFIG !== "undefined"
                ? cloneData(UI_CONFIG)
                : null,

        playerData:
            typeof playerData !== "undefined"
                ? cloneData(playerData)
                : null,

        questBoardState:
            typeof questBoardState !== "undefined"
                ? cloneData(questBoardState)
                : null,

        bossProgression:
            typeof bossProgression !== "undefined"
                ? cloneData(bossProgression)
                : null,

        bossChallengeState:
            typeof bossChallengeState !== "undefined"
                ? cloneData(bossChallengeState)
                : null,

        relicLoadout:
            typeof relicLoadout !== "undefined"
                ? cloneData(relicLoadout)
                : null,

        activeEffects:
            typeof activeEffects !== "undefined"
                ? cloneData(activeEffects)
                : [],

        questDatabase:
            typeof questDatabase !== "undefined"
                ? cloneData(questDatabase)
                : [],

        eventDatabase:
            typeof eventDatabase !== "undefined"
                ? cloneData(eventDatabase)
                : [],

        bossDatabase:
            typeof bossDatabase !== "undefined"
                ? cloneData(bossDatabase)
                : [],

        itemDatabase:
            typeof itemDatabase !== "undefined"
                ? cloneData(itemDatabase)
                : [],

        relicDatabase:
            typeof relicDatabase !== "undefined"
                ? cloneData(relicDatabase)
                : []
    };
}


/* =========================================================
   SAVE
========================================================= */

function autoSave() {

    try {

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(
                collectSaveData()
            )
        );

    } catch (error) {

        console.error(
            "Auto save failed:",
            error
        );
    }
}

function manualSave() {

    try {

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(
                collectSaveData()
            )
        );

        console.log(
            "Game saved."
        );

    } catch (error) {

        console.error(
            "Manual save failed:",
            error
        );
    }
}


/* =========================================================
   LOAD
========================================================= */

function loadGame() {

    const save =
        findSaveRaw();

    if (!save) {

        console.log(
            "No save found."
        );

        return false;
    }

    try {

        const data =
            JSON.parse(save.raw);

        applySaveData(data);

        if (
            save.key !== SAVE_KEY
        ) {

            console.log(
                "Legacy save migrated:",
                save.key
            );

            manualSave();
        }

        console.log(
            "Save loaded."
        );

        return true;

    } catch (error) {

        console.error(
            "Failed to load save:",
            error
        );

        return false;
    }
}


/* =========================================================
   APPLY SAVE
========================================================= */

function applySaveData(data) {

    if (!data) return;

    if (
        data.version !== SAVE_VERSION
    ) {

        console.warn(
            "Save version mismatch. Attempting migration."
        );
    }

    if (
        data.gameConfig &&
        typeof GAME_CONFIG !== "undefined"
    ) {

        mergeObject(
            GAME_CONFIG,
            data.gameConfig
        );
    }

    if (
        data.uiConfig &&
        typeof UI_CONFIG !== "undefined"
    ) {

        mergeObject(
            UI_CONFIG,
            data.uiConfig
        );
    }

    if (
        data.UI_CONFIG &&
        typeof UI_CONFIG !== "undefined"
    ) {

        mergeObject(
            UI_CONFIG,
            data.UI_CONFIG
        );
    }

    if (
        data.playerData &&
        typeof playerData !== "undefined"
    ) {

        mergeObject(
            playerData,
            data.playerData
        );
    }

    if (
        data.questBoardState &&
        typeof questBoardState !== "undefined"
    ) {

        mergeObject(
            questBoardState,
            data.questBoardState
        );
    }

    if (
        data.bossProgression &&
        typeof bossProgression !== "undefined"
    ) {

        mergeObject(
            bossProgression,
            data.bossProgression
        );
    }

    if (
        data.bossChallengeState &&
        typeof bossChallengeState !== "undefined"
    ) {

        mergeObject(
            bossChallengeState,
            data.bossChallengeState
        );
    }

    if (
        data.relicLoadout &&
        typeof relicLoadout !== "undefined"
    ) {

        mergeObject(
            relicLoadout,
            data.relicLoadout
        );
    }

    if (
        typeof activeEffects !== "undefined"
    ) {

        replaceArray(
            activeEffects,
            data.activeEffects
        );
    }

    replaceArray(
        questDatabase,
        data.questDatabase
    );

    replaceArray(
        eventDatabase,
        data.eventDatabase
    );

    replaceArray(
        bossDatabase,
        data.bossDatabase
    );

    replaceArray(
        itemDatabase,
        data.itemDatabase
    );

    replaceArray(
        relicDatabase,
        data.relicDatabase
    );

    ensureSaveShape();

    if (
        typeof updateBossUnlocks === "function"
    ) {
        updateBossUnlocks();
    }

    if (
        typeof renderAll === "function"
    ) {
        renderAll();
    }
}


/* =========================================================
   EXPORT SAVE
========================================================= */

function exportSave() {

    const data =
        collectSaveData();

    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "quest_chronicles_save.json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    console.log(
        "Save exported."
    );
}


/* =========================================================
   IMPORT SAVE
========================================================= */

function importSave(file) {

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload =
        function(event) {

            try {

                const data =
                    JSON.parse(
                        event.target.result
                    );

                applySaveData(data);

                manualSave();

                console.log(
                    "Save imported."
                );

            } catch (error) {

                console.error(
                    "Invalid save file:",
                    error
                );
            }
        };

    reader.readAsText(file);
}


/* =========================================================
   RESET GAME
========================================================= */

function resetGame() {

    const confirmed =
        confirm(
            "Delete all progress and custom editor data?"
        );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(SAVE_KEY);

    LEGACY_SAVE_KEYS.forEach(key => {
        localStorage.removeItem(key);
    });

    location.reload();
}


/* =========================================================
   DEBUG / UTILITIES
========================================================= */

function clearSaveData() {

    localStorage.removeItem(SAVE_KEY);

    LEGACY_SAVE_KEYS.forEach(key => {
        localStorage.removeItem(key);
    });

    console.log(
        "Save removed."
    );
}

function downloadSaveBackup() {

    exportSave();
}

function printSaveData() {

    console.log(
        collectSaveData()
    );
}