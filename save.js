/* =========================================================
   QUEST CHRONICLES - SAVE SYSTEM v1.1
   Persistence Layer (Editor-Safe + Schema Stable)
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
   COLLECT SAVE DATA (SANITIZED SNAPSHOT)
========================================================= */

function collectSaveData() {

    return {
        version: SAVE_VERSION,

        playerData: structuredClone(playerData),

        questDatabase: structuredClone(questDatabase),
        eventDatabase: structuredClone(eventDatabase),
        bossDatabase: structuredClone(bossDatabase),
        itemDatabase: structuredClone(itemDatabase),

        timestamp: Date.now()
    };
}


/* =========================================================
   APPLY SAVE DATA (SAFE MERGE INSTEAD OF RAW OVERWRITE)
========================================================= */

function applySaveData(data) {

    if (!data || !data.playerData) return;

    if (data.version !== SAVE_VERSION) {
        console.warn("Save version mismatch — attempting compatibility load.");
    }

    /* -------------------------
       PLAYER MERGE
    ------------------------- */
    Object.assign(playerData, data.playerData);

    /* -------------------------
       DATABASE REBUILD (SAFE RESET)
    ------------------------- */

    rebuildDatabase("questDatabase", data.questDatabase);
    rebuildDatabase("eventDatabase", data.eventDatabase);
    rebuildDatabase("bossDatabase", data.bossDatabase);
    rebuildDatabase("itemDatabase", data.itemDatabase);

    /* -------------------------
       UI REFRESH
    ------------------------- */

    if (typeof renderAll === "function") {
        renderAll();
    }
}


/* =========================================================
   DATABASE REBUILDER (EDITOR SAFE)
========================================================= */

function rebuildDatabase(name, newData) {

    if (!newData) return;

    if (name === "questDatabase") {

        questDatabase.normal = newData.normal || [];
        questDatabase.daily = newData.daily || [];
        questDatabase.events = newData.events || [];
        questDatabase.boss = newData.boss || [];
    }

    if (name === "eventDatabase") {
        eventDatabase.length = 0;
        eventDatabase.push(...(newData || []));
    }

    if (name === "bossDatabase") {
        bossDatabase.length = 0;
        bossDatabase.push(...(newData || []));
    }

    if (name === "itemDatabase") {
        itemDatabase.length = 0;
        itemDatabase.push(...(newData || []));
    }
}


/* =========================================================
   EXPORT SAVE
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
   IMPORT SAVE
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