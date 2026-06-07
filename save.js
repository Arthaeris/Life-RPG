/* =========================================================
   QUEST CHRONICLES - SAVE SYSTEM v1.3
   Fits database.js v1.2 + systems.js v2.2 + render.js v1.2 + editor.js v0.4
========================================================= */


/* =========================================================
   SAVE CONFIG
========================================================= */

const SAVE_KEY = "quest_chronicles_save_v1";
const SAVE_VERSION = 1;


/* =========================================================
   INITIAL LOAD
========================================================= */

window.addEventListener("load", () => {
    loadGame();
});


/* =========================================================
   AUTO SAVE LOOP
========================================================= */

setInterval(() => {
    autoSave();
}, 5000);


/* =========================================================
   SAVE FUNCTIONS
========================================================= */

function autoSave() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(collectSaveData()));
}

function manualSave() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(collectSaveData()));
    console.log("Game saved.");
}


/* =========================================================
   COLLECT SAVE DATA
========================================================= */

function collectSaveData() {

    return {
        version: SAVE_VERSION,
        timestamp: Date.now(),

        playerData: cloneData(playerData),

        questDatabase: cloneData(questDatabase),
        eventDatabase: cloneData(eventDatabase),
        bossDatabase: cloneData(bossDatabase),
        itemDatabase: cloneData(itemDatabase)
    };
}


/* =========================================================
   LOAD GAME
========================================================= */

function loadGame() {

    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
        console.log("No save found.");
        return;
    }

    try {
        const data = JSON.parse(raw);
        applySaveData(data);
        console.log("Save loaded.");
    } catch (err) {
        console.error("Save load failed:", err);
    }
}


/* =========================================================
   APPLY SAVE DATA
========================================================= */

function applySaveData(data) {

    if (!data || !data.playerData) return;

    if (data.version !== SAVE_VERSION) {
        console.warn("Save version mismatch. Attempting load anyway.");
    }

    Object.assign(playerData, data.playerData);

    rebuildArray(questDatabase, data.questDatabase);
    rebuildArray(eventDatabase, data.eventDatabase);
    rebuildArray(bossDatabase, data.bossDatabase);
    rebuildArray(itemDatabase, data.itemDatabase);

    if (typeof renderAll === "function") {
        renderAll();
    }
}


/* =========================================================
   ARRAY REBUILD HELPER
========================================================= */

function rebuildArray(target, source) {

    if (!Array.isArray(target) || !Array.isArray(source)) return;

    target.length = 0;
    target.push(...source);
}


/* =========================================================
   EXPORT SAVE
========================================================= */

function exportSave() {

    const data = collectSaveData();

    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quest_chronicles_save.json";
    a.click();

    URL.revokeObjectURL(url);

    console.log("Save exported.");
}


/* =========================================================
   IMPORT SAVE
========================================================= */

function importSave(file) {

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            applySaveData(data);
            manualSave();
            console.log("Save imported.");
        } catch (err) {
            console.error("Invalid save file:", err);
        }
    };

    reader.readAsText(file);
}


/* =========================================================
   RESET SAVE
========================================================= */

function resetGame() {

    const confirmed = confirm("Reset all progress? This cannot be undone.");
    if (!confirmed) return;

    localStorage.removeItem(SAVE_KEY);

    console.log("Save reset. Reloading...");
    location.reload();
}


/* =========================================================
   CLONE HELPER
========================================================= */

function cloneData(data) {

    if (typeof structuredClone === "function") {
        return structuredClone(data);
    }

    return JSON.parse(JSON.stringify(data));
}