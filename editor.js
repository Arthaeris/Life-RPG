/* =========================================================
   QUEST CHRONICLES - EDITOR ENGINE v0.4
   Fits database.js v1.2 + systems.js v2.2 + render.js v1.2
========================================================= */


/* =========================================================
   EDITOR STATE
========================================================= */

let currentEditorType = null;
let editingId = null;


/* =========================================================
   EDITOR SCHEMAS
========================================================= */

const editorSchemas = {

    quest: {
        title: "Quest Editor",
        target: "quest",
        fields: {
            name: { type: "text", label: "Quest Name" },
            description: { type: "textarea", label: "Description" },

            type: {
                type: "select",
                label: "Quest Type",
                options: ["normal", "daily", "event", "boss"]
            },

            tags: { type: "text", label: "Tags (comma separated)" },
            eventTags: { type: "text", label: "Event Tags (comma separated)" },

            rarity: {
                type: "select",
                label: "Rarity",
                options: ["Common", "Rare", "Epic", "Legendary"]
            },

            xp: { type: "number", label: "XP Reward" },
            gold: { type: "number", label: "Gold Reward" },

            fitnessXP: { type: "number", label: "Fitness XP" },
            healthXP: { type: "number", label: "Health XP" },
            wisdomXP: { type: "number", label: "Wisdom XP" },
            homeXP: { type: "number", label: "Home XP" }
        }
    },

    event: {
        title: "Event Editor",
        target: "event",
        fields: {
            name: { type: "text", label: "Event Name" },
            tag: { type: "text", label: "Event Tag" },
            description: { type: "textarea", label: "Description" },
            startDate: { type: "date", label: "Start Date" },
            endDate: { type: "date", label: "End Date" },
            artwork: { type: "text", label: "Artwork URL / Path" }
        }
    },

    boss: {
        title: "Boss Editor",
        target: "boss",
        fields: {
            name: { type: "text", label: "Boss Name" },
            description: { type: "textarea", label: "Description" },

            maxHp: { type: "number", label: "Max HP" },
            hp: { type: "number", label: "Current HP" },
            regenRate: { type: "number", label: "Regeneration Rate" },

            weaknesses: { type: "text", label: "Weaknesses (comma separated)" },
            resistances: { type: "text", label: "Resistances (comma separated)" },

            abilities: { type: "textarea", label: "Abilities: one per line, Name|effect" },

            xpReward: { type: "number", label: "XP Reward" },
            goldReward: { type: "number", label: "Gold Reward" },
            titleReward: { type: "text", label: "Title Reward" }
        }
    },

    item: {
        title: "Item Editor",
        target: "item",
        fields: {
            name: { type: "text", label: "Item Name" },
            description: { type: "textarea", label: "Description" },

            category: {
                type: "select",
                label: "Category",
                options: ["consumable", "boost", "utility", "prestige", "title"]
            },

            cost: { type: "number", label: "Cost" },

            stackable: {
                type: "select",
                label: "Stackable",
                options: ["false", "true"]
            },

            effectType: { type: "text", label: "Effect Type" },
            effectValue: { type: "number", label: "Effect Value" },
            duration: { type: "number", label: "Duration Seconds" }
        }
    }
};


/* =========================================================
   DATABASE RESOLVER
========================================================= */

function getEditorDatabase(type) {

    if (type === "quest") return questDatabase;
    if (type === "event") return eventDatabase;
    if (type === "boss") return bossDatabase;
    if (type === "item") return itemDatabase;

    return [];
}


/* =========================================================
   OPEN EDITOR
========================================================= */

function openEditor(type, id = null) {

    currentEditorType = type;
    editingId = id;

    const container = document.getElementById("editorContainer");
    if (!container) return;

    const schema = editorSchemas[type];
    if (!schema) return;

    const data = normalizeDataForForm(type, id);

    container.innerHTML = `
        ${buildEditorList(type)}
        ${buildForm(schema, data)}
    `;
}


/* =========================================================
   BUILD EXISTING ENTRY LIST
========================================================= */

function buildEditorList(type) {

    const db = getEditorDatabase(type);

    if (!db.length) {
        return `
            <div class="panel">
                <div class="panel-content">
                    <div class="title">Existing ${type}s</div>
                    <div class="sub">No entries yet.</div>
                </div>
            </div>
        `;
    }

    return `
        <div class="panel">
            <div class="panel-content">
                <div class="title">Existing ${type}s</div>

                ${db.map(item => `
                    <div class="sub" style="margin-top:8px;">
                        ${item.name || item.tag || item.id}
                    </div>

                    <div class="btn" onclick="openEditor('${type}', '${item.id}')">
                        Edit
                    </div>

                    <div class="btn" onclick="deleteEditorEntry('${type}', '${item.id}')">
                        Delete
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}


/* =========================================================
   DB → FORM NORMALIZATION
========================================================= */

function normalizeDataForForm(type, id) {

    if (!id) return {};

    const db = getEditorDatabase(type);
    const item = db.find(entry => entry.id === id);

    if (!item) return {};

    if (type === "quest") {
        return {
            ...item,
            tags: (item.tags || []).join(", "),
            eventTags: (item.eventTags || []).join(", "),
            xp: item.rewards?.xp || 0,
            gold: item.rewards?.gold || 0,
            fitnessXP: item.rewards?.stats?.Fitness || 0,
            healthXP: item.rewards?.stats?.Health || 0,
            wisdomXP: item.rewards?.stats?.Wisdom || 0,
            homeXP: item.rewards?.stats?.Home || 0
        };
    }

    if (type === "boss") {
        return {
            ...item,
            weaknesses: (item.weaknesses || []).join(", "),
            resistances: (item.resistances || []).join(", "),
            abilities: (item.abilities || [])
                .map(a => `${a.name}|${a.effect}`)
                .join("\n"),
            xpReward: item.rewards?.xp || 0,
            goldReward: item.rewards?.gold || 0,
            titleReward: item.rewards?.title || ""
        };
    }

    if (type === "item") {
        return {
            ...item,
            stackable: String(item.stackable || false),
            effectType: item.effect?.type || "",
            effectValue: item.effect?.value || 0,
            duration: item.effect?.duration || 0
        };
    }

    return item;
}


/* =========================================================
   FORM BUILDER
========================================================= */

function buildForm(schema, data) {

    let html = `
        <div class="panel">
            <div class="panel-content">
                <div class="title">${schema.title}</div>
    `;

    for (const key in schema.fields) {

        const field = schema.fields[key];
        const value = data[key] ?? "";

        html += `<div class="sub">${field.label}</div>`;

        if (field.type === "textarea") {
            html += `
                <textarea id="field_${key}" style="width:100%;height:70px;margin-bottom:8px;">${escapeEditorValue(value)}</textarea>
            `;
        }

        else if (field.type === "select") {
            html += `
                <select id="field_${key}" style="width:100%;padding:6px;margin-bottom:8px;">
                    ${field.options.map(opt => `
                        <option value="${opt}" ${String(value) === String(opt) ? "selected" : ""}>
                            ${opt}
                        </option>
                    `).join("")}
                </select>
            `;
        }

        else {
            html += `
                <input 
                    type="${field.type}" 
                    id="field_${key}" 
                    value="${escapeEditorValue(value)}"
                    style="width:100%;padding:6px;margin-bottom:8px;"
                >
            `;
        }
    }

    html += `
                <div class="btn primary" onclick="saveEditor()">
                    ${editingId ? "Save Changes" : "Create Entry"}
                </div>

                <div class="btn" onclick="clearEditor()">
                    Close Editor
                </div>
            </div>
        </div>
    `;

    return html;
}


/* =========================================================
   SAVE EDITOR ENTRY
========================================================= */

function saveEditor() {

    const schema = editorSchemas[currentEditorType];
    if (!schema) return;

    const db = getEditorDatabase(schema.target);
    if (!Array.isArray(db)) return;

    const raw = collectEditorFields(schema);
    const obj = normalizeFormForDatabase(schema.target, raw);

    if (editingId) {
        obj.id = editingId;

        const index = db.findIndex(entry => entry.id === editingId);
        if (index !== -1) db[index] = obj;
    } else {
        obj.id = generateEditorId(schema.target);
        db.push(obj);
    }

    if (typeof renderAll === "function") renderAll();
    if (typeof manualSave === "function") manualSave();

    openEditor(currentEditorType);
}


/* =========================================================
   COLLECT FORM VALUES
========================================================= */

function collectEditorFields(schema) {

    const obj = {};

    for (const key in schema.fields) {

        const field = schema.fields[key];
        const el = document.getElementById("field_" + key);

        if (!el) continue;

        let value = el.value;

        if (field.type === "number") {
            value = Number(value) || 0;
        }

        obj[key] = value;
    }

    return obj;
}


/* =========================================================
   FORM → DB NORMALIZATION
========================================================= */

function normalizeFormForDatabase(type, raw) {

    if (type === "quest") {
        return {
            name: raw.name || "Unnamed Quest",
            description: raw.description || "",
            type: raw.type || "normal",

            tags: splitList(raw.tags),
            eventTags: splitList(raw.eventTags),

            rarity: raw.rarity || "Common",

            rewards: {
                xp: raw.xp || 0,
                gold: raw.gold || 0,
                stats: {
                    Fitness: raw.fitnessXP || 0,
                    Health: raw.healthXP || 0,
                    Wisdom: raw.wisdomXP || 0,
                    Home: raw.homeXP || 0
                }
            },

            timeLimit: null,

            scaling: {
                xpMultiplier: 1,
                goldMultiplier: 1
            }
        };
    }

    if (type === "event") {
        return {
            name: raw.name || "Unnamed Event",
            tag: raw.tag || generateEditorId("eventtag"),
            description: raw.description || "",
            startDate: raw.startDate || "",
            endDate: raw.endDate || "",
            artwork: raw.artwork || "",
            isActiveOverride: false
        };
    }

    if (type === "boss") {
        return {
            name: raw.name || "Unnamed Boss",
            description: raw.description || "",

            maxHp: raw.maxHp || 100,
            hp: raw.hp || raw.maxHp || 100,

            regenRate: raw.regenRate || 0,

            weaknesses: splitList(raw.weaknesses),
            resistances: splitList(raw.resistances),

            abilities: parseAbilities(raw.abilities),

            rewards: {
                xp: raw.xpReward || 0,
                gold: raw.goldReward || 0,
                title: raw.titleReward || ""
            }
        };
    }

    if (type === "item") {
        return {
            name: raw.name || "Unnamed Item",
            description: raw.description || "",

            category: raw.category || "consumable",
            cost: raw.cost || 0,
            stackable: raw.stackable === "true",

            effect: {
                type: raw.effectType || "",
                value: raw.effectValue || 0,
                duration: raw.duration || 0
            }
        };
    }

    return raw;
}


/* =========================================================
   DELETE ENTRY
========================================================= */

function deleteEditorEntry(type, id) {

    const db = getEditorDatabase(type);
    const index = db.findIndex(entry => entry.id === id);

    if (index === -1) return;

    db.splice(index, 1);

    if (type === "quest" && typeof removeActiveQuest === "function") {
        removeActiveQuest(id);
    }

    if (typeof renderAll === "function") renderAll();
    if (typeof manualSave === "function") manualSave();

    openEditor(type);
}


/* =========================================================
   CLEAR EDITOR
========================================================= */

function clearEditor() {

    currentEditorType = null;
    editingId = null;

    const container = document.getElementById("editorContainer");
    if (container) container.innerHTML = "";
}


/* =========================================================
   HELPERS
========================================================= */

function splitList(value) {

    if (!value) return [];

    return String(value)
        .split(",")
        .map(v => v.trim())
        .filter(Boolean);
}

function parseAbilities(value) {

    if (!value) return [];

    return String(value)
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
            const parts = line.split("|");

            return {
                name: parts[0]?.trim() || "Unnamed Ability",
                effect: parts[1]?.trim() || ""
            };
        });
}

function generateEditorId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function escapeEditorValue(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}