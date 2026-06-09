/* =========================================================
   QUEST CHRONICLES - SAVE SYSTEM v4.0
   Compatible with:
   - database.js v3.x
   - systems.js v4.1+
   - render.js v4.1+
   - editor.js v3.x
========================================================= */


/* =========================================================
   SAVE CONFIG
========================================================= */

const SAVE_KEY = "quest_chronicles_save_v4";
const SAVE_VERSION = 4;

const LEGACY_SAVE_KEYS = [
    "quest_chronicles_save_v3",
    "quest_chronicles_save_v2",
    "quest_chronicles_save_v1"
];


/* =========================================================
   AUTO LOAD
========================================================= */

window.addEventListener("load", () => {

    loadGame();

    repairLoadedRuntimeState();

    if (typeof renderAll === "function") {
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

    if (typeof structuredClone === "function") {
        return structuredClone(data);
    }

    return JSON.parse(
        JSON.stringify(data)
    );
}

function getStoredSaveRaw() {

    const current =
        localStorage.getItem(
            SAVE_KEY
        );

    if (current) {
        return current;
    }

    for (const key of LEGACY_SAVE_KEYS) {

        const legacy =
            localStorage.getItem(key);

        if (legacy) {
            return legacy;
        }
    }

    return null;
}


/* =========================================================
   COLLECT SAVE DATA
========================================================= */

function collectSaveData() {

    return {

        version: SAVE_VERSION,

        timestamp: Date.now(),

        playerData:
            cloneData(playerData),

        questBoardState:
            cloneData(questBoardState),

        bossChallengeState:
            cloneData(bossChallengeState),

        bossProgression:
            cloneData(bossProgression),

        relicLoadout:
            cloneData(relicLoadout),

        activeEffects:
            cloneData(activeEffects),

        questDatabase:
            cloneData(questDatabase),

        eventDatabase:
            cloneData(eventDatabase),

        bossDatabase:
            cloneData(bossDatabase),

        itemDatabase:
            cloneData(itemDatabase),

        relicDatabase:
            cloneData(relicDatabase)
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

    const raw =
        getStoredSaveRaw();

    if (!raw) {

        console.log(
            "No save found."
        );

        return false;
    }

    try {

        const saveData =
            JSON.parse(raw);

        applySaveData(
            saveData
        );

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
            "Save version mismatch. Attempting compatibility load."
        );
    }

    if (data.playerData) {

        Object.assign(
            playerData,
            data.playerData
        );
    }

    if (data.questBoardState) {

        Object.assign(
            questBoardState,
            data.questBoardState
        );
    }

    if (data.bossChallengeState) {

        Object.assign(
            bossChallengeState,
            data.bossChallengeState
        );
    }

    if (data.bossProgression) {

        Object.assign(
            bossProgression,
            data.bossProgression
        );
    }

    if (data.relicLoadout) {

        Object.assign(
            relicLoadout,
            data.relicLoadout
        );
    }

    replaceArray(
        activeEffects,
        data.activeEffects
    );

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

    repairLoadedRuntimeState();

    if (
        typeof renderAll ===
        "function"
    ) {

        renderAll();
    }
}


/* =========================================================
   RUNTIME REPAIR AFTER LOAD
========================================================= */

function repairLoadedRuntimeState() {

    if (
        typeof ensureRuntimeState ===
        "function"
    ) {
        ensureRuntimeState();
    }

    if (
        typeof updateBossUnlocks ===
        "function"
    ) {
        updateBossUnlocks();
    }

    if (
        typeof normalizeQuestBoards ===
        "function"
    ) {
        normalizeQuestBoards();
    }

    if (
        typeof processQuestBoard ===
        "function"
    ) {
        processQuestBoard();
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
}


/* =========================================================
   ARRAY REPLACEMENT
========================================================= */

function replaceArray(
    target,
    source
) {

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
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        "quest_chronicles_save.json";

    link.click();

    URL.revokeObjectURL(
        url
    );

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

                applySaveData(
                    data
                );

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
            "Delete all progress?"
        );

    if (!confirmed)
        return;

    localStorage.removeItem(
        SAVE_KEY
    );

    LEGACY_SAVE_KEYS.forEach(key => {
        localStorage.removeItem(key);
    });

    location.reload();
}


/* =========================================================
   DEBUG
========================================================= */

function clearSaveData() {

    localStorage.removeItem(
        SAVE_KEY
    );

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