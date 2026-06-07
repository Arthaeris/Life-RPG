/* =========================================================
   QUEST CHRONICLES - EDITOR ENGINE v0.1
   Unified Schema-Based Game Editor
========================================================= */


/* =========================================================
   SCHEMA REGISTRY
========================================================= */

const editorSchemas = {

    quest: {
        title: "Quest Editor",

        fields: {
            name: { type: "text", label: "Name" },
            description: { type: "textarea", label: "Description" },

            type: {
                type: "select",
                label: "Type",
                options: ["normal", "daily", "event"]
            },

            tags: {
                type: "multiselect",
                label: "Tags",
                options: ["Fitness", "Health", "Wisdom", "Home"]
            },

            eventTags: {
                type: "text",
                label: "Event Tags (comma separated)"
            },

            rarity: {
                type: "select",
                label: "Rarity",
                options: ["Common", "Rare", "Epic", "Legendary"]
            },

            xp: { type: "number", label: "XP Reward" },
            gold: { type: "number", label: "Gold Reward" }
        },

        target: "quest"
    },

    event: {
        title: "Event Editor",

        fields: {
            name: { type: "text", label: "Name" },
            tag: { type: "text", label: "Tag" },
            description: { type: "textarea", label: "Description" },
            startDate: { type: "date", label: "Start Date" },
            endDate: { type: "date", label: "End Date" }
        },

        target: "event"
    },

    boss: {
        title: "Boss Editor",

        fields: {
            name: { type: "text", label: "Name" },
            description: { type: "textarea", label: "Description" },

            maxHp: { type: "number", label: "Max HP" },
            hp: { type: "number", label: "Current HP" },

            regenRate: { type: "number", label: "Regeneration Rate" },

            weaknesses: {
                type: "multiselect",
                label: "Weaknesses",
                options: ["Fitness", "Health", "Wisdom", "Home"]
            },

            resistances: {
                type: "multiselect",
                label: "Resistances",
                options: ["Fitness", "Health", "Wisdom", "Home"]
            },

            xpReward: { type: "number", label: "XP Reward" },
            goldReward: { type: "number", label: "Gold Reward" },
            titleReward: { type: "text", label: "Title Reward" }
        },

        target: "boss"
    },

    item: {
        title: "Item Editor",

        fields: {
            name: { type: "text", label: "Name" },
            description: { type: "textarea", label: "Description" },

            category: {
                type: "select",
                label: "Category",
                options: ["consumable", "boost", "utility", "prestige"]
            },

            cost: { type: "number", label: "Cost" },

            stackable: {
                type: "select",
                label: "Stackable",
                options: ["true", "false"]
            },

            effectType: {
                type: "text",
                label: "Effect Type"
            },

            duration: { type: "number", label: "Duration (seconds)" }
        },

        target: "item"
    }
};


/* =========================================================
   EDITOR STATE
========================================================= */

let currentEditorType = null;
let editingId = null;


/* =========================================================
   OPEN EDITOR
========================================================= */

function openEditor(type, id = null) {

    currentEditorType = type;
    editingId = id;

    const schema = editorSchemas[type];
    if (!schema) return;

    const container = document.getElementById("editorContainer");
    if (!container) {
        console.warn("No editorContainer found in HTML");
        return;
    }

    const data = getEditingData(type, id);

    container.innerHTML = buildForm(schema, data);

    console.log("Editor opened:", type, id);
}


/* =========================================================
   GET EXISTING DATA OR NEW
========================================================= */

function getEditingData(type, id) {

    if (!id) return {};

    const db = getDatabaseByType(type);

    return db.find(item => item.id === id) || {};
}


/* =========================================================
   DATABASE RESOLVER
========================================================= */

function getDatabaseByType(type) {

    switch (type) {
        case "quest":
            return [
                ...questDatabase.normal,
                ...questDatabase.daily,
                ...questDatabase.events
            ];

        case "event":
            return eventDatabase;

        case "boss":
            return bossDatabase;

        case "item":
            return itemDatabase;

        default:
            return [];
    }
}


/* =========================================================
   FORM BUILDER
========================================================= */

function buildForm(schema, data) {

    let html = `<div class="panel"><div class="panel-content">`;
    html += `<div class="title">${schema.title}</div>`;

    for (const key in schema.fields) {

        const field = schema.fields[key];
        const value = data[key] ?? "";

        html += `<div class="sub">${field.label}</div>`;

        if (field.type === "text" || field.type === "number" || field.type === "date") {
            html += `<input 
                        type="${field.type}" 
                        id="field_${key}" 
                        value="${value}"
                        style="width:100%;padding:6px;margin-bottom:8px;">
                    `;
        }

        else if (field.type === "textarea") {
            html += `<textarea id="field_${key}" style="width:100%;height:60px;margin-bottom:8px;">${value}</textarea>`;
        }

        else if (field.type === "select") {
            html += `<select id="field_${key}" style="width:100%;margin-bottom:8px;">`;

            field.options.forEach(opt => {
                html += `<option ${value === opt ? "selected" : ""}>${opt}</option>`;
            });

            html += `</select>`;
        }

        else if (field.type === "multiselect") {
            html += `<input 
                        type="text" 
                        id="field_${key}" 
                        value="${Array.isArray(value) ? value.join(",") : value}"
                        placeholder="comma separated"
                        style="width:100%;margin-bottom:8px;">
                    `;
        }
    }

    html += `
        <div class="btn primary" onclick="saveEditor()">
            Save
        </div>
    `;

    html += `</div></div>`;

    return html;
}


/* =========================================================
   SAVE FROM EDITOR
========================================================= */

function saveEditor() {

    const schema = editorSchemas[currentEditorType];
    if (!schema) return;

    const db = getDatabaseByType(schema.target);

    let obj = {};

    // collect values
    for (const key in schema.fields) {

        const field = schema.fields[key];
        const el = document.getElementById("field_" + key);

        if (!el) continue;

        let value = el.value;

        if (field.type === "number") {
            value = Number(value);
        }

        if (field.type === "multiselect") {
            value = value.split(",").map(v => v.trim()).filter(Boolean);
        }

        obj[key] = value;
    }

    // ID handling
    if (!editingId) {
        obj.id = generateId();
        db.push(obj);
    } else {
        const index = db.findIndex(i => i.id === editingId);
        if (index !== -1) {
            obj.id = editingId;
            db[index] = obj;
        }
    }

    console.log("Saved:", obj);

    // refresh game systems
    if (typeof renderAll === "function") renderAll();
}


/* =========================================================
   ID GENERATOR
========================================================= */

function generateId() {
    return Math.random().toString(36).substring(2, 10);
}