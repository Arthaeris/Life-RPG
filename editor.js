/* =========================================================
   QUEST CHRONICLES - EDITOR ENGINE v4.0
   Artwork + Icons + UI Background Editing
   Compatible with:
   - database.js v3.x+
   - systems.js v4.x+
   - render.js v4.3+
   - save.js v3.x+
========================================================= */


/* =========================================================
   EDITOR STATE
========================================================= */

let currentEditorType = null;
let editingId = null;


/* =========================================================
   FALLBACK CONSTANTS
========================================================= */

const EDITOR_QUEST_TYPES = [
    "normal",
    "daily",
    "event",
    "boss"
];

const EDITOR_RARITIES = [
    "Common",
    "Daily",
    "Event",
    "Rare",
    "Epic",
    "Legendary"
];

const EDITOR_ITEM_CATEGORIES = [
    "consumable",
    "boost",
    "utility",
    "prestige",
    "title",
    "key_item"
];

const EDITOR_EFFECT_TYPES =
    typeof EFFECT_TYPES !== "undefined"
        ? Object.values(EFFECT_TYPES)
        : [
            "relative_buff",
            "relative_debuff",
            "absolute_buff",
            "absolute_debuff"
        ];

const EDITOR_EFFECT_ATTRIBUTES =
    typeof EFFECT_ATTRIBUTES !== "undefined"
        ? EFFECT_ATTRIBUTES
        : [
            "gold",
            "gold_gain",
            "xp",
            "xp_gain",
            "fitness_xp_gain",
            "health_xp_gain",
            "wisdom_xp_gain",
            "home_xp_gain",
            "quest_lifetime",
            "quest_cooldown",
            "quest_slot_refresh",
            "boss_damage",
            "boss_damage_taken",
            "boss_regeneration",
            "relic_power",
            "item_cost",
            "shop_discount"
        ];

const EDITOR_EFFECT_DURATIONS =
    typeof EFFECT_DURATIONS !== "undefined"
        ? EFFECT_DURATIONS
        : [
            "instant",
            "seconds",
            "minutes",
            "hours",
            "days",
            "months",
            "permanent"
        ];


/* =========================================================
   UI CONFIG SAFETY
========================================================= */

function ensureUIConfig() {

    if (typeof window.UI_CONFIG === "undefined") {
        window.UI_CONFIG = {};
    }

    if (!window.UI_CONFIG.backgrounds) {
        window.UI_CONFIG.backgrounds = {};
    }

    if (!window.UI_CONFIG.placeholders) {
        window.UI_CONFIG.placeholders = {};
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

        if (window.UI_CONFIG.backgrounds[key] === undefined) {
            window.UI_CONFIG.backgrounds[key] =
                backgroundDefaults[key];
        }
    });

    Object.keys(placeholderDefaults).forEach(key => {

        if (window.UI_CONFIG.placeholders[key] === undefined) {
            window.UI_CONFIG.placeholders[key] =
                placeholderDefaults[key];
        }
    });

    return window.UI_CONFIG;
}


/* =========================================================
   EDITOR SCHEMAS
========================================================= */

const editorSchemas = {

    quest: {

        title: "Quest Editor",
        target: "quest",

        fields: {

            name: {
                type: "text",
                label: "Quest Name"
            },

            description: {
                type: "textarea",
                label: "Description"
            },

            type: {
                type: "select",
                label: "Quest Type",
                options: EDITOR_QUEST_TYPES
            },

            artwork: {
                type: "text",
                label: "Artwork Path"
            },

            rarity: {
                type: "select",
                label: "Rarity",
                options: EDITOR_RARITIES
            },

            tags: {
                type: "text",
                label: "Tags"
            },

            eventTags: {
                type: "text",
                label: "Event Tags"
            },

            rewardXP: {
                type: "number",
                label: "XP Reward"
            },

            rewardGold: {
                type: "number",
                label: "Gold Reward"
            },

            rewardGems: {
                type: "number",
                label: "Gem Reward"
            },

            fitnessXP: {
                type: "number",
                label: "Fitness XP"
            },

            healthXP: {
                type: "number",
                label: "Health XP"
            },

            wisdomXP: {
                type: "number",
                label: "Wisdom XP"
            },

            homeXP: {
                type: "number",
                label: "Home XP"
            },

            rewardItems: {
                type: "text",
                label: "Reward Item IDs"
            },

            rewardRelics: {
                type: "text",
                label: "Reward Relic IDs"
            },

            expiresAfterMinutes: {
                type: "number",
                label: "Slot Lifetime Minutes"
            },

            cooldownMinutes: {
                type: "number",
                label: "Cooldown Minutes"
            }
        }
    },


    event: {

        title: "Event Editor",
        target: "event",

        fields: {

            name: {
                type: "text",
                label: "Event Name"
            },

            tag: {
                type: "text",
                label: "Event Tag"
            },

            description: {
                type: "textarea",
                label: "Description"
            },

            artwork: {
                type: "text",
                label: "Artwork Path"
            },

            startDate: {
                type: "date",
                label: "Start Date"
            },

            endDate: {
                type: "date",
                label: "End Date"
            },

            isActiveOverride: {
                type: "select",
                label: "Force Active",
                options: [
                    "false",
                    "true"
                ]
            }
        }
    },


    boss: {

        title: "Boss Editor",
        target: "boss",

        fields: {

            name: {
                type: "text",
                label: "Boss Name"
            },

            description: {
                type: "textarea",
                label: "Description"
            },

            artwork: {
                type: "text",
                label: "Artwork Path"
            },

            unlockLevel: {
                type: "number",
                label: "Unlock Level"
            },

            maxHp: {
                type: "number",
                label: "Max HP"
            },

            hp: {
                type: "number",
                label: "Current HP"
            },

            regenRate: {
                type: "number",
                label: "Regeneration"
            },

            weaknesses: {
                type: "text",
                label: "Weaknesses"
            },

            resistances: {
                type: "text",
                label: "Resistances"
            },

            abilities: {
                type: "textarea",
                label: "Abilities"
            },

            modifiers: {
                type: "textarea",
                label: "Modifiers"
            },

            rewardXP: {
                type: "number",
                label: "XP Reward"
            },

            rewardGold: {
                type: "number",
                label: "Gold Reward"
            },

            rewardGems: {
                type: "number",
                label: "Gem Reward"
            },

            rewardTitle: {
                type: "text",
                label: "Title Reward"
            },

            rewardItems: {
                type: "text",
                label: "Reward Item IDs"
            },

            rewardRelics: {
                type: "text",
                label: "Reward Relic IDs"
            }
        }
    },


    item: {

        title: "Item Editor",
        target: "item",

        fields: {

            name: {
                type: "text",
                label: "Item Name"
            },

            description: {
                type: "textarea",
                label: "Description"
            },

            icon: {
                type: "text",
                label: "Icon Path"
            },

            category: {
                type: "select",
                label: "Category",
                options: EDITOR_ITEM_CATEGORIES
            },

            cost: {
                type: "number",
                label: "Cost"
            },

            stackable: {
                type: "select",
                label: "Stackable",
                options: [
                    "false",
                    "true"
                ]
            },

            effectType: {
                type: "select",
                label: "Effect Type",
                options: EDITOR_EFFECT_TYPES
            },

            effectAttribute: {
                type: "select",
                label: "Effect Attribute",
                options: EDITOR_EFFECT_ATTRIBUTES
            },

            effectAmount: {
                type: "number",
                label: "Effect Amount"
            },

            effectDuration: {
                type: "select",
                label: "Effect Duration"
            },

            durationValue: {
                type: "number",
                label: "Duration Value"
            }
        }
    },


    relic: {

        title: "Relic Editor",
        target: "relic",

        fields: {

            name: {
                type: "text",
                label: "Relic Name"
            },

            description: {
                type: "textarea",
                label: "Description"
            },

            icon: {
                type: "text",
                label: "Icon Path"
            },

            rarity: {
                type: "select",
                label: "Rarity",
                options: EDITOR_RARITIES
            },

            effectType: {
                type: "select",
                label: "Effect Type",
                options: EDITOR_EFFECT_TYPES
            },

            effectAttribute: {
                type: "select",
                label: "Effect Attribute",
                options: EDITOR_EFFECT_ATTRIBUTES
            },

            effectAmount: {
                type: "number",
                label: "Effect Amount"
            },

            effectDuration: {
                type: "select",
                label: "Effect Duration",
                options: EDITOR_EFFECT_DURATIONS
            },

            durationValue: {
                type: "number",
                label: "Duration Value"
            }
        }
    },


    ui: {

        title: "Background Editor",
        target: "ui",

        fields: {

            dashboard: {
                type: "text",
                label: "Dashboard Background"
            },

            quests: {
                type: "text",
                label: "Quests Screen Background"
            },

            profile: {
                type: "text",
                label: "Profile Background"
            },

            shop: {
                type: "text",
                label: "Shop Background"
            },

            inventory: {
                type: "text",
                label: "Inventory Background"
            },

            settings: {
                type: "text",
                label: "Settings Background"
            },

            normalQuests: {
                type: "text",
                label: "Normal Quest Panel Background"
            },

            dailyQuests: {
                type: "text",
                label: "Daily Quest Panel Background"
            },

            eventQuests: {
                type: "text",
                label: "Event Quest Panel Background"
            },

            bossCampaign: {
                type: "text",
                label: "Boss Campaign Panel Background"
            },

            placeholderQuest: {
                type: "text",
                label: "Quest Placeholder Artwork"
            },

            placeholderEvent: {
                type: "text",
                label: "Event Placeholder Artwork"
            },

            placeholderBoss: {
                type: "text",
                label: "Boss Placeholder Artwork"
            },

            placeholderItem: {
                type: "text",
                label: "Item Placeholder Icon"
            },

            placeholderRelic: {
                type: "text",
                label: "Relic Placeholder Icon"
            }
        }
    }
};


/* =========================================================
   DATABASE RESOLVER
========================================================= */

function getEditorDatabase(type) {

    switch (type) {

        case "quest":
            return questDatabase;

        case "event":
            return eventDatabase;

        case "boss":
            return bossDatabase;

        case "item":
            return itemDatabase;

        case "relic":
            return relicDatabase;

        default:
            return [];
    }
}


/* =========================================================
   OPEN EDITOR
========================================================= */

function openEditor(type, id = null) {

    currentEditorType = type;
    editingId = id;

    const schema =
        editorSchemas[type];

    if (!schema) return;

    const container =
        document.getElementById("editorContainer");

    if (!container) return;

    const data =
        loadEditorData(type, id);

    container.innerHTML =
        buildEditorList(type) +
        buildEditorForm(schema, data);
}


/* =========================================================
   LIST
========================================================= */

function buildEditorList(type) {

    if (type === "ui") {

        return `
            <div class="panel">
                <div class="panel-content">

                    <div class="title">
                        UI Artwork Settings
                    </div>

                    <div class="sub">
                        Set screen backgrounds, quest-board panel backgrounds, and fallback artwork paths.
                    </div>

                </div>
            </div>
        `;
    }

    const db =
        getEditorDatabase(type);

    return `
        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    Existing ${escapeEditorHTML(type)}s
                </div>

                ${
                    db.length
                        ? db.map(entry => `
                            <div class="editor-entry">

                                <div class="sub">
                                    ${escapeEditorHTML(entry.name || entry.tag || entry.id)}
                                </div>

                                <div
                                    class="btn"
                                    onclick="openEditor('${escapeEditorAttr(type)}','${escapeEditorAttr(entry.id)}')">
                                    Edit
                                </div>

                                <div
                                    class="btn"
                                    onclick="deleteEditorEntry('${escapeEditorAttr(type)}','${escapeEditorAttr(entry.id)}')">
                                    Delete
                                </div>

                            </div>
                        `).join("")
                        : `
                            <div class="sub">
                                No entries yet.
                            </div>
                        `
                }

            </div>
        </div>
    `;
}


/* =========================================================
   FORM
========================================================= */

function buildEditorForm(schema, data) {

    let html = `
        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    ${escapeEditorHTML(schema.title)}
                </div>
    `;

    for (const key in schema.fields) {

        const field =
            schema.fields[key];

        const value =
            data[key] ?? "";

        const description =
            getFieldHint(schema.target, key);

        html += `
            <div class="sub">
                ${escapeEditorHTML(field.label)}
            </div>
        `;

        if (description) {

            html += `
                <div class="sub muted">
                    ${escapeEditorHTML(description)}
                </div>
            `;
        }

        if (field.type === "textarea") {

            html += `
                <textarea
                    id="field_${escapeEditorAttr(key)}">${escapeEditorHTML(value)}</textarea>
            `;

        } else if (field.type === "select") {

            const options =
                key === "effectDuration"
                    ? EDITOR_EFFECT_DURATIONS
                    : field.options || [];

            html += `
                <select id="field_${escapeEditorAttr(key)}">
                    ${options.map(option => `
                        <option
                            value="${escapeEditorAttr(option)}"
                            ${String(value) === String(option) ? "selected" : ""}>
                            ${escapeEditorHTML(option)}
                        </option>
                    `).join("")}
                </select>
            `;

        } else {

            html += `
                <input
                    type="${escapeEditorAttr(field.type)}"
                    id="field_${escapeEditorAttr(key)}"
                    value="${escapeEditorAttr(value)}">
            `;
        }
    }

    html += `
                <div
                    class="btn primary"
                    onclick="saveEditor()">
                    ${
                        schema.target === "ui"
                            ? "Save UI Settings"
                            : editingId
                                ? "Save Changes"
                                : "Create Entry"
                    }
                </div>

                <div
                    class="btn"
                    onclick="clearEditor()">
                    Close Editor
                </div>

            </div>
        </div>
    `;

    return html;
}

function getFieldHint(type, key) {

    if (
        key === "artwork" ||
        key === "icon" ||
        key.includes("placeholder") ||
        [
            "dashboard",
            "quests",
            "profile",
            "shop",
            "inventory",
            "settings",
            "normalQuests",
            "dailyQuests",
            "eventQuests",
            "bossCampaign"
        ].includes(key)
    ) {
        return "Use a relative path like assets/bosses/goblinking.PNG";
    }

    if (
        key === "rewardItems" ||
        key === "rewardRelics"
    ) {
        return "Comma separated IDs, for example: i001, i002";
    }

    if (
        key === "abilities"
    ) {
        return "One per line: Name|effect_id";
    }

    if (
        key === "modifiers"
    ) {
        return "One per line: type|attribute|amount|duration|durationValue";
    }

    if (
        key === "tags" ||
        key === "eventTags" ||
        key === "weaknesses" ||
        key === "resistances"
    ) {
        return "Comma separated values.";
    }

    return "";
}


/* =========================================================
   LOAD EDITOR DATA
========================================================= */

function loadEditorData(type, id) {

    if (type === "ui") {
        return loadUIEditorData();
    }

    if (!id) {
        return getDefaultEditorData(type);
    }

    const db =
        getEditorDatabase(type);

    const item =
        db.find(entry => entry.id === id);

    if (!item) {
        return getDefaultEditorData(type);
    }

    if (type === "quest") {

        return {
            ...item,

            artwork:
                cleanEditorPath(item.artwork || ""),

            tags:
                joinList(item.tags),

            eventTags:
                joinList(item.eventTags),

            rewardXP:
                item.rewards?.xp || 0,

            rewardGold:
                item.rewards?.gold || 0,

            rewardGems:
                item.rewards?.gems || 0,

            fitnessXP:
                item.rewards?.stats?.Fitness || 0,

            healthXP:
                item.rewards?.stats?.Health || 0,

            wisdomXP:
                item.rewards?.stats?.Wisdom || 0,

            homeXP:
                item.rewards?.stats?.Home || 0,

            rewardItems:
                joinList(item.rewards?.items),

            rewardRelics:
                joinList(item.rewards?.relics),

            expiresAfterMinutes:
                item.boardConfig?.expiresAfterMinutes ||
                GAME_CONFIG.questLifetimeMinutes ||
                180,

            cooldownMinutes:
                item.boardConfig?.cooldownMinutes ||
                GAME_CONFIG.questCooldownMinutes ||
                15
        };
    }

    if (type === "event") {

        return {
            ...item,

            artwork:
                cleanEditorPath(item.artwork || ""),

            isActiveOverride:
                String(item.isActiveOverride || false)
        };
    }

    if (type === "boss") {

        return {
            ...item,

            artwork:
                cleanEditorPath(item.artwork || ""),

            weaknesses:
                joinList(item.weaknesses),

            resistances:
                joinList(item.resistances),

            abilities:
                serializeAbilities(item.abilities),

            modifiers:
                serializeEffects(item.modifiers),

            rewardXP:
                item.rewards?.xp || 0,

            rewardGold:
                item.rewards?.gold || 0,

            rewardGems:
                item.rewards?.gems || 0,

            rewardTitle:
                item.rewards?.title || "",

            rewardItems:
                joinList(item.rewards?.items),

            rewardRelics:
                joinList(item.rewards?.relics)
        };
    }

    if (type === "item") {

        const effect =
            getFirstEffect(item);

        return {
            ...item,

            icon:
                cleanEditorPath(item.icon || ""),

            stackable:
                String(item.stackable || false),

            effectType:
                effect.type || EDITOR_EFFECT_TYPES[0],

            effectAttribute:
                effect.attribute || EDITOR_EFFECT_ATTRIBUTES[0],

            effectAmount:
                effect.amount || 0,

            effectDuration:
                effect.duration || "instant",

            durationValue:
                effect.durationValue || 0
        };
    }

    if (type === "relic") {

        const effect =
            getFirstEffect(item);

        return {
            ...item,

            icon:
                cleanEditorPath(item.icon || ""),

            effectType:
                effect.type || EDITOR_EFFECT_TYPES[0],

            effectAttribute:
                effect.attribute || EDITOR_EFFECT_ATTRIBUTES[0],

            effectAmount:
                effect.amount || 0,

            effectDuration:
                effect.duration || "permanent",

            durationValue:
                effect.durationValue || 0
        };
    }

    return item;
}

function getDefaultEditorData(type) {

    if (type === "quest") {

        return {
            type: QUEST_TYPES?.NORMAL || "normal",
            artwork: "",
            rarity: "Common",
            rewardXP: 0,
            rewardGold: 0,
            rewardGems: 0,
            fitnessXP: 0,
            healthXP: 0,
            wisdomXP: 0,
            homeXP: 0,
            rewardItems: "",
            rewardRelics: "",
            expiresAfterMinutes: GAME_CONFIG?.questLifetimeMinutes || 180,
            cooldownMinutes: GAME_CONFIG?.questCooldownMinutes || 15
        };
    }

    if (type === "event") {

        return {
            artwork: "",
            isActiveOverride: "false"
        };
    }

    if (type === "boss") {

        return {
            artwork: "",
            unlockLevel: 5,
            maxHp: 100,
            hp: 100,
            regenRate: 0,
            rewardXP: 0,
            rewardGold: 0,
            rewardGems: 0,
            rewardTitle: "",
            rewardItems: "",
            rewardRelics: "",
            modifiers: "",
            abilities: ""
        };
    }

    if (type === "item") {

        return {
            icon: "",
            category: "consumable",
            cost: 0,
            stackable: "false",
            effectType: EDITOR_EFFECT_TYPES[0],
            effectAttribute: EDITOR_EFFECT_ATTRIBUTES[0],
            effectAmount: 0,
            effectDuration: "instant",
            durationValue: 0
        };
    }

    if (type === "relic") {

        return {
            icon: "",
            rarity: "Common",
            effectType: EDITOR_EFFECT_TYPES[0],
            effectAttribute: EDITOR_EFFECT_ATTRIBUTES[0],
            effectAmount: 0,
            effectDuration: "permanent",
            durationValue: 0
        };
    }

    return {};
}

function loadUIEditorData() {

    const config =
        ensureUIConfig();

    return {
        dashboard:
            config.backgrounds.dashboard || "",

        quests:
            config.backgrounds.quests || "",

        profile:
            config.backgrounds.profile || "",

        shop:
            config.backgrounds.shop || "",

        inventory:
            config.backgrounds.inventory || "",

        settings:
            config.backgrounds.settings || "",

        normalQuests:
            config.backgrounds.normalQuests || "",

        dailyQuests:
            config.backgrounds.dailyQuests || "",

        eventQuests:
            config.backgrounds.eventQuests || "",

        bossCampaign:
            config.backgrounds.bossCampaign || "",

        placeholderQuest:
            config.placeholders.quest || "",

        placeholderEvent:
            config.placeholders.event || "",

        placeholderBoss:
            config.placeholders.boss || "",

        placeholderItem:
            config.placeholders.item || "",

        placeholderRelic:
            config.placeholders.relic || ""
    };
}


/* =========================================================
   SAVE EDITOR
========================================================= */

function saveEditor() {

    const schema =
        editorSchemas[currentEditorType];

    if (!schema) return;

    const raw =
        collectEditorFields(schema);

    if (schema.target === "ui") {

        saveUIEditorData(raw);

        if (typeof renderAll === "function") {
            renderAll();
        }

        if (typeof manualSave === "function") {
            manualSave();
        }

        openEditor("ui");

        return;
    }

    const db =
        getEditorDatabase(schema.target);

    if (!Array.isArray(db)) return;

    const existing =
        editingId
            ? db.find(entry => entry.id === editingId)
            : null;

    const entry =
        normalizeEntry(
            schema.target,
            raw,
            existing
        );

    if (editingId) {

        entry.id =
            editingId;

        const index =
            db.findIndex(
                item => item.id === editingId
            );

        if (index !== -1) {
            db[index] = entry;
        }

    } else {

        entry.id =
            generateEditorId(schema.target);

        db.push(entry);
    }

    postEditorSave(schema.target);

    if (typeof manualSave === "function") {
        manualSave();
    }

    if (typeof renderAll === "function") {
        renderAll();
    }

    openEditor(currentEditorType);
}

function collectEditorFields(schema) {

    const raw = {};

    Object.keys(schema.fields).forEach(key => {

        const el =
            document.getElementById(`field_${key}`);

        raw[key] =
            el?.value ?? "";
    });

    return raw;
}

function postEditorSave(type) {

    if (
        type === "quest" &&
        typeof generateQuestBoard === "function"
    ) {
        generateQuestBoard();
    }

    if (
        type === "event" &&
        typeof generateEventQuestBoard === "function"
    ) {
        generateEventQuestBoard();
    }

    if (
        type === "boss" &&
        typeof updateBossUnlocks === "function"
    ) {
        updateBossUnlocks();
    }
}


/* =========================================================
   NORMALIZATION
========================================================= */

function normalizeEntry(type, raw, existing = null) {

    if (type === "quest") {

        return {
            name:
                raw.name || "Unnamed Quest",

            description:
                raw.description || "",

            type:
                raw.type || QUEST_TYPES?.NORMAL || "normal",

            artwork:
                cleanEditorPath(raw.artwork),

            rarity:
                raw.rarity || "Common",

            tags:
                splitList(raw.tags),

            eventTags:
                splitList(raw.eventTags),

            rewards: {

                xp:
                    numberOrZero(raw.rewardXP),

                gold:
                    numberOrZero(raw.rewardGold),

                gems:
                    numberOrZero(raw.rewardGems),

                stats: {

                    Fitness:
                        numberOrZero(raw.fitnessXP),

                    Health:
                        numberOrZero(raw.healthXP),

                    Wisdom:
                        numberOrZero(raw.wisdomXP),

                    Home:
                        numberOrZero(raw.homeXP)
                },

                items:
                    splitList(raw.rewardItems),

                relics:
                    splitList(raw.rewardRelics)
            },

            boardConfig: {

                expiresAfterMinutes:
                    numberOrFallback(
                        raw.expiresAfterMinutes,
                        GAME_CONFIG?.questLifetimeMinutes || 180
                    ),

                cooldownMinutes:
                    numberOrFallback(
                        raw.cooldownMinutes,
                        GAME_CONFIG?.questCooldownMinutes || 15
                    )
            }
        };
    }

    if (type === "event") {

        return {
            name:
                raw.name || "Unnamed Event",

            tag:
                raw.tag || generateEditorId("eventtag"),

            description:
                raw.description || "",

            artwork:
                cleanEditorPath(raw.artwork),

            startDate:
                raw.startDate || "",

            endDate:
                raw.endDate || "",

            isActiveOverride:
                raw.isActiveOverride === "true"
        };
    }

    if (type === "boss") {

        const maxHp =
            numberOrFallback(raw.maxHp, 100);

        const hp =
            numberOrFallback(
                raw.hp,
                existing?.hp || maxHp
            );

        return {
            name:
                raw.name || "Unnamed Boss",

            description:
                raw.description || "",

            artwork:
                cleanEditorPath(raw.artwork),

            unlockLevel:
                numberOrFallback(raw.unlockLevel, 5),

            maxHp:
                maxHp,

            hp:
                clampNumber(
                    hp,
                    0,
                    maxHp
                ),

            regenRate:
                numberOrZero(raw.regenRate),

            weaknesses:
                splitList(raw.weaknesses),

            resistances:
                splitList(raw.resistances),

            modifiers:
                parseEffects(raw.modifiers),

            abilities:
                parseAbilities(raw.abilities),

            rewards: {

                xp:
                    numberOrZero(raw.rewardXP),

                gold:
                    numberOrZero(raw.rewardGold),

                gems:
                    numberOrZero(raw.rewardGems),

                title:
                    raw.rewardTitle || "",

                relics:
                    splitList(raw.rewardRelics),

                items:
                    splitList(raw.rewardItems)
            }
        };
    }

    if (type === "item") {

        return {
            name:
                raw.name || "Unnamed Item",

            description:
                raw.description || "",

            icon:
                cleanEditorPath(raw.icon),

            category:
                raw.category || "consumable",

            cost:
                numberOrZero(raw.cost),

            stackable:
                raw.stackable === "true",

            effects:
                [
                    buildEffect(raw)
                ].filter(Boolean)
        };
    }

    if (type === "relic") {

        return {
            name:
                raw.name || "Unnamed Relic",

            description:
                raw.description || "",

            icon:
                cleanEditorPath(raw.icon),

            rarity:
                raw.rarity || "Common",

            effects:
                [
                    buildEffect(raw)
                ].filter(Boolean)
        };
    }

    return existing || raw;
}

function buildEffect(raw) {

    const duration =
        raw.effectDuration || "instant";

    const effect = {
        type:
            raw.effectType || EDITOR_EFFECT_TYPES[0],

        attribute:
            raw.effectAttribute || EDITOR_EFFECT_ATTRIBUTES[0],

        amount:
            numberOrZero(raw.effectAmount),

        duration:
            duration
    };

    const durationValue =
        numberOrZero(raw.durationValue);

    if (
        duration !== "instant" &&
        duration !== "permanent" &&
        durationValue > 0
    ) {
        effect.durationValue =
            durationValue;
    }

    return effect;
}

function saveUIEditorData(raw) {

    const config =
        ensureUIConfig();

    config.backgrounds.dashboard =
        cleanEditorPath(raw.dashboard);

    config.backgrounds.quests =
        cleanEditorPath(raw.quests);

    config.backgrounds.profile =
        cleanEditorPath(raw.profile);

    config.backgrounds.shop =
        cleanEditorPath(raw.shop);

    config.backgrounds.inventory =
        cleanEditorPath(raw.inventory);

    config.backgrounds.settings =
        cleanEditorPath(raw.settings);

    config.backgrounds.normalQuests =
        cleanEditorPath(raw.normalQuests);

    config.backgrounds.dailyQuests =
        cleanEditorPath(raw.dailyQuests);

    config.backgrounds.eventQuests =
        cleanEditorPath(raw.eventQuests);

    config.backgrounds.bossCampaign =
        cleanEditorPath(raw.bossCampaign);

    config.placeholders.quest =
        cleanEditorPath(raw.placeholderQuest);

    config.placeholders.event =
        cleanEditorPath(raw.placeholderEvent);

    config.placeholders.boss =
        cleanEditorPath(raw.placeholderBoss);

    config.placeholders.item =
        cleanEditorPath(raw.placeholderItem);

    config.placeholders.relic =
        cleanEditorPath(raw.placeholderRelic);
}


/* =========================================================
   DELETE
========================================================= */

function deleteEditorEntry(type, id) {

    if (type === "ui") return;

    const db =
        getEditorDatabase(type);

    const index =
        db.findIndex(entry => entry.id === id);

    if (index === -1) return;

    db.splice(index, 1);

    if (
        type === "quest" &&
        playerData.activeQuest?.id === id
    ) {
        playerData.activeQuest = null;
    }

    if (
        type === "boss" &&
        bossProgression?.selectedBossId === id
    ) {
        bossProgression.selectedBossId = null;
    }

    postEditorSave(type);

    if (typeof manualSave === "function") {
        manualSave();
    }

    if (typeof renderAll === "function") {
        renderAll();
    }

    openEditor(type);
}


/* =========================================================
   CLOSE
========================================================= */

function clearEditor() {

    currentEditorType = null;
    editingId = null;

    const container =
        document.getElementById("editorContainer");

    if (container) {
        container.innerHTML = "";
    }
}


/* =========================================================
   SERIALIZERS
========================================================= */

function serializeAbilities(abilities) {

    return (abilities || [])
        .map(ability => {
            return [
                ability.name || "",
                ability.effect || ""
            ].join("|");
        })
        .join("\n");
}

function serializeEffects(effects) {

    return (effects || [])
        .map(effect => {
            return [
                effect.type || "",
                effect.attribute || "",
                effect.amount ?? 0,
                effect.duration || "permanent",
                effect.durationValue ?? ""
            ].join("|");
        })
        .join("\n");
}


/* =========================================================
   PARSERS
========================================================= */

function splitList(value) {

    return String(value || "")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
}

function joinList(value) {

    if (!Array.isArray(value)) {
        return "";
    }

    return value.join(", ");
}

function parseAbilities(value) {

    return String(value || "")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {

            const parts =
                line.split("|");

            return {
                name:
                    parts[0]?.trim() || "Unnamed Ability",

                effect:
                    parts[1]?.trim() || ""
            };
        });
}

function parseEffects(value) {

    return String(value || "")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {

            const parts =
                line.split("|");

            const effect = {
                type:
                    parts[0]?.trim() || EDITOR_EFFECT_TYPES[0],

                attribute:
                    parts[1]?.trim() || EDITOR_EFFECT_ATTRIBUTES[0],

                amount:
                    numberOrZero(parts[2]),

                duration:
                    parts[3]?.trim() || "permanent"
            };

            const durationValue =
                numberOrZero(parts[4]);

            if (durationValue > 0) {
                effect.durationValue =
                    durationValue;
            }

            return effect;
        });
}

function getFirstEffect(item) {

    if (Array.isArray(item?.effects)) {
        return item.effects[0] || {};
    }

    if (item?.effect) {
        return item.effect;
    }

    return {};
}


/* =========================================================
   VALUE HELPERS
========================================================= */

function numberOrZero(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}

function numberOrFallback(value, fallback) {

    const number =
        Number(value);

    if (
        Number.isFinite(number) &&
        value !== "" &&
        value !== null &&
        value !== undefined
    ) {
        return number;
    }

    return fallback;
}

function clampNumber(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}

function cleanEditorPath(value) {

    return String(value || "")
        .trim()
        .replaceAll("\\", "/");
}

function generateEditorId(prefix = "id") {

    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 7)}`;
}


/* =========================================================
   ESCAPE HELPERS
========================================================= */

function escapeEditorHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeEditorAttr(value) {
    return escapeEditorHTML(value);
}