/* =========================================================
   QUEST CHRONICLES - SAVE SYSTEM v0.1
   Persistence Layer (localStorage + JSON import/export)
========================================================= */


/* =========================================================
   SAVE CONFIG
========================================================= */

const SAVE_KEY = "quest_chronicles_save_v1";
const SAVE_VERSION = 1;


/* =========================================================
   AUTO SAVE LOOP
========================================================= */

setInterval(() => {
    autoSave();
}, 5000);


/* =========================================================
   AUTO SAVE
========================================================= */

function autoSave() {

    const data = collectSaveData();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));

    // silent save (no spam logs)
}


/* =========================================================
   MANUAL SAVE
========================================================= */

function manualSave() {
    const data = collectSaveData();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));

    console.log("Game saved manually.");
}


/* =========================================================
   LOAD SAVE
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
    } catch (e) {
        console.error("Save load failed:", e);
    }
}


/* =========================================================
   COLLECT SAVE DATA
========================================================= */

function collectSaveData() {

    return {
        version: SAVE_VERSION,

        playerData,
        questDatabase,
        eventDatabase,
        bossDatabase,
        itemDatabase,

        timestamp: Date.now()
    };
}


/* =========================================================
   APPLY SAVE DATA
========================================================= */

function applySaveData(data) {

    if (!data || !data.playerData) return;

    // Basic version guard (future-proofing)
    if (data.version !== SAVE_VERSION) {
        console.warn("Save version mismatch — attempting compatibility load.");
    }

    Object.assign(playerData, data.playerData);

    // Deep overwrite for databases
    overwriteDatabase("questDatabase", data.questDatabase);
    overwriteDatabase("eventDatabase", data.eventDatabase);
    overwriteDatabase("bossDatabase", data.bossDatabase);
    overwriteDatabase("itemDatabase", data.itemDatabase);

    // re-render UI after load
    if (typeof renderAll === "function") {
        renderAll();
    }
}


/* =========================================================
   SAFE DATABASE OVERWRITE
========================================================= */

function overwriteDatabase(name, newData) {

    if (!newData) return;

    if (name === "questDatabase") {
        questDatabase.normal = newData.normal || [];
        questDatabase.daily = newData.daily || [];
        questDatabase.events = newData.events || [];
        questDatabase.boss = newData.boss || [];
    }

    if (name === "eventDatabase") {
        eventDatabase.length = 0;
        eventDatabase.push(...newData);
    }

    if (name === "bossDatabase") {
        bossDatabase.length = 0;
        bossDatabase.push(...newData);
    }

    if (name === "itemDatabase") {
        itemDatabase.length = 0;
        itemDatabase.push(...newData);
    }
}


/* =========================================================
   EXPORT SAVE (DOWNLOAD JSON FILE)
========================================================= */

function exportSave() {

    const data = collectSaveData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quest_chronicles_save.json";
    a.click();

    URL.revokeObjectURL(url);

    console.log("Save exported.");
}


/* =========================================================
   IMPORT SAVE (FROM FILE INPUT)
========================================================= */

function importSave(file) {

    const reader = new FileReader();

    reader.onload = function (e) {

        try {
            const data = JSON.parse(e.target.result);
            applySaveData(data);
            console.log("Save imported.");
        } catch (err) {
            console.error("Invalid save file:", err);
        }
    };

    reader.readAsText(file);
}


/* =========================================================
   RESET GAME
========================================================= */

function resetGame() {

    localStorage.removeItem(SAVE_KEY);

    console.log("Save cleared. Reload page to restart.");
}