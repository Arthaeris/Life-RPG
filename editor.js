/* =========================================================
   QUEST CHRONICLES - EDITOR ENGINE v3.1
   Artwork + Icons + UI Background Editing
   Compatible with:
   - database.js v3.1+
   - systems.js v4.x+
   - render.js v4.2+
   - save.js v4.x+
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
                options: [
                    "normal",
                    "daily",
                    "event",
                    "boss"
                ]
            },

            artwork: {
                type: "text",
                label: "Artwork Path"
            },

            tags: {
                type: "text",
                label: "Tags"
            },

            eventTags: {
                type: "text",
                label: "Event Tags"
            },

            rarity: {
                type: "select",
                label: "Rarity",
                options: [
                    "Common",
                    "Daily",
                    "Event",
                    "Rare",
                    "Epic",
                    "Legendary"
                ]
            },

            xp: {
                type: "number",
                label: "XP Reward"
            },

            gold: {
                type: "number",
                label: "Gold Reward"
            },

            gems: {
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
                label: "Reward Items"
            },

            rewardRelics: {
                type: "text",
                label: "Reward Relics"
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

            xpReward: {
                type: "number",
                label: "XP Reward"
            },

            goldReward: {
                type: "number",
                label: "Gold Reward"
            },

            gemReward: {
                type: "number",
                label: "Gem Reward"
            },

            titleReward: {
                type: "text",
                label: "Title Reward"
            },

            rewardItems: {
                type: "text",
                label: "Reward Items"
            },

            rewardRelics: {
                type: "text",
                label: "Reward Relics"
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
                options: [
                    "consumable",
                    "boost",
                    "utility",
                    "prestige",
                    "title"
                ]
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
                options: [
                    "relative_buff",
                    "absolute_buff",
                    "relative_debuff",
                    "absolute_debuff"
                ]
            },

            attribute: {
                type: "select",
                label: "Attribute",
                options: [
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
                ]
            },

            amount: {
                type: "number",
                label: "Amount"
            },

            effectDuration: {
                type: "select",
                label: "Duration Type",
                options: [
                    "instant",
                    "seconds",
                    "minutes",
                    "hours",
                    "days",
                    "months",
                    "permanent"
                ]
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
                options: [
                    "Common",
                    "Rare",
                    "Epic",
                    "Legendary"
                ]
            },

            effectType: {
                type: "select",
                label: "Effect Type",
                options: [
                    "relative_buff",
                    "absolute_buff",
                    "relative_debuff",
                    "absolute_debuff"
                ]
            },

            attribute: {
                type: "select",
                label: "Attribute",
                options: [
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
                ]
            },

            amount: {
                type: "number",
                label: "Amount"
            },

            effectDuration: {
                type: "select",
                label: "Duration Type",
                options: [
                    "instant",
                    "seconds",
                    "minutes",
                    "hours",
                    "days",
                    "months",
                    "permanent"
                ]
            },

            durationValue: {
                type: "number",
                label: "Duration Value"
            }
        }
    },


    ui: {
        title: "UI Background Editor",
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
                label: "Quest Placeholder"
            },

            placeholderEvent: {
                type: "text",
                label: "Event Placeholder"
            },

            placeholderBoss: {
                type: "text",
                label: "Boss Placeholder"
            },

            placeholderItem: {
                type: "text",
                label: "Item Placeholder"
            },

            placeholderRelic: {
                type: "text",
                label: "Relic Placeholder"
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
        normalizeDataForForm(type, id);

    container.innerHTML =
        buildEditorList(type) +
        buildForm(schema, data);
}


/* =========================================================
   EXISTING ENTRIES
========================================================= */

function buildEditorList(type) {

    if (type === "ui") {

        return `
            <div class="panel">
                <div class="panel-content">

                    <div class="title">
                        UI Backgrounds
                    </div>

                    <div class="sub">
                        Edit screen backgrounds, panel backgrounds, and fallback placeholders.
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
                    Existing ${escapeEditorValue(type)}s
                </div>

                ${
                    db.length
                        ? db.map(item => `
                            <div class="editor-entry">

                                <div class="sub">
                                    ${escapeEditorValue(item.name || item.tag || item.id)}
                                </div>

                                <div class="btn"
                                     onclick="openEditor('${escapeEditorValue(type)}','${escapeEditorValue(item.id)}')">
                                    Edit
                                </div>

                                <div class="btn"
                                     onclick="deleteEditorEntry('${escapeEditorValue(type)}','${escapeEditorValue(item.id)}')">
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
   NORMALIZE FOR FORM
========================================================= */

function normalizeDataForForm(type, id) {

    if (type === "ui") {
        return normalizeUIConfigForForm();
    }

    if (!id) return {};

    const db =
        getEditorDatabase(type);

    const item =
        db.find(x => x.id === id);

    if (!item) return {};

    if (type === "quest") {

        return {
            ...item,

            artwork:
                item.artwork || "",

            tags:
                (item.tags || []).join(", "),

            eventTags:
                (item.eventTags || []).join(", "),

            xp:
                item.rewards?.xp || 0,

            gold:
                item.rewards?.gold || 0,

            gems:
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
                (item.rewards?.items || []).join(", "),

            rewardRelics:
                (item.rewards?.relics || []).join(", "),

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
                item.artwork || "",

            isActiveOverride:
                String(item.isActiveOverride || false)
        };
    }

    if (type === "boss") {

        return {
            ...item,

            artwork:
                item.artwork || "",

            weaknesses:
                (item.weaknesses || []).join(", "),

            resistances:
                (item.resistances || []).join(", "),

            abilities:
                serializeAbilities(item.abilities),

            modifiers:
                serializeEffects(item.modifiers),

            xpReward:
                item.rewards?.xp || 0,

            goldReward:
                item.rewards?.gold || 0,

            gemReward:
                item.rewards?.gems || 0,

            titleReward:
                item.rewards?.title || "",

            rewardItems:
                (item.rewards?.items || []).join(", "),

            rewardRelics:
                (item.rewards?.relics || []).join(", ")
        };
    }

    if (type === "item") {

        const effect =
            item.effects?.[0] || {};

        return {
            ...item,

            icon:
                item.icon || "",

            stackable:
                String(item.stackable || false),

            effectType:
                effect.type || EFFECT_TYPES.RELATIVE_BUFF,

            attribute:
                effect.attribute || "xp_gain",

            amount:
                effect.amount || 0,

            effectDuration:
                effect.duration || "instant",

            durationValue:
                effect.durationValue || 0
        };
    }

    if (type === "relic") {

        const effect =
            item.effects?.[0] || {};

        return {
            ...item,

            icon:
                item.icon || "",

            effectType:
                effect.type || EFFECT_TYPES.RELATIVE_BUFF,

            attribute:
                effect.attribute || "gold_gain",

            amount:
                effect.amount || 0,

            effectDuration:
                effect.duration || "permanent",

            durationValue:
                effect.durationValue || 0
        };
    }

    return item;
}

function normalizeUIConfigForForm() {

    return {
        dashboard:
            UI_CONFIG?.backgrounds?.dashboard || "",

        quests:
            UI_CONFIG?.backgrounds?.quests || "",

        profile:
            UI_CONFIG?.backgrounds?.profile || "",

        shop:
            UI_CONFIG?.backgrounds?.shop || "",

        inventory:
            UI_CONFIG?.backgrounds?.inventory || "",

        settings:
            UI_CONFIG?.backgrounds?.settings || "",

        normalQuests:
            UI_CONFIG?.backgrounds?.normalQuests || "",

        dailyQuests:
            UI_CONFIG?.backgrounds?.dailyQuests || "",

        eventQuests:
            UI_CONFIG?.backgrounds?.eventQuests || "",

        bossCampaign:
            UI_CONFIG?.backgrounds?.bossCampaign || "",

        placeholderQuest:
            UI_CONFIG?.placeholders?.quest || "",

        placeholderEvent:
            UI_CONFIG?.placeholders?.event || "",

        placeholderBoss:
            UI_CONFIG?.placeholders?.boss || "",

        placeholderItem:
            UI_CONFIG?.placeholders?.item || "",

        placeholderRelic:
            UI_CONFIG?.placeholders?.relic || ""
    };
}


/* =========================================================
   FORM BUILDER
========================================================= */

function buildForm(schema, data) {

    let html = `
        <div class="panel">
            <div class="panel-content">

                <div class="title">
                    ${escapeEditorValue(schema.title)}
                </div>
    `;

    for (const key in schema.fields) {

        const field =
            schema.fields[key];

        const value =
            data[key] ?? "";

        html += `
            <div class="sub">
                ${escapeEditorValue(field.label)}
            </div>
        `;

        if (field.type === "textarea") {

            html += `
                <textarea
                    id="field_${escapeEditorValue(key)}"
                    style="width:100%;height:80px;">${escapeEditorValue(value)}</textarea>
            `;
        }

        else if (field.type === "select") {

            html += `
                <select id="field_${escapeEditorValue(key)}">
                    ${field.options.map(option => `
                        <option
                            value="${escapeEditorValue(option)}"
                            ${String(value) === String(option) ? "selected" : ""}>
                            ${escapeEditorValue(option)}
                        </option>
                    `).join("")}
                </select>
            `;
        }

        else {

            html += `
                <input
                    type="${escapeEditorValue(field.type)}"
                    id="field_${escapeEditorValue(key)}"
                    value="${escapeEditorValue(value)}">
            `;
        }
    }

    html += `
                <div class="btn primary"
                     onclick="saveEditor()">
                    ${editingId ? "Save Changes" : schema.target === "ui" ? "Save UI Settings" : "Create"}
                </div>

                <div class="btn"
                     onclick="clearEditor()">
                    Close Editor
                </div>

            </div>
        </div>
    `;

    return html;
}


/* =========================================================
   SAVE
========================================================= */

function saveEditor() {

    const schema =
        editorSchemas[currentEditorType];

    if (!schema) return;

    const raw =
        collectEditorFields(schema);

    if (schema.target === "ui") {

        applyUIConfigFromForm(raw);

        renderAll?.();
        manualSave?.();

        openEditor("ui");

        return;
    }

    const db =
        getEditorDatabase(schema.target);

    if (!Array.isArray(db)) return;

    const existing =
        editingId
            ? db.find(x => x.id === editingId)
            : null;

    const obj =
        normalizeFormForDatabase(
            schema.target,
            raw,
            existing
        );

    if (editingId) {

        obj.id = editingId;

        const index =
            db.findIndex(
                x => x.id === editingId
            );

        if (index !== -1) {
            db[index] = obj;
        }

    } else {

        obj.id =
            generateEditorId(schema.target);

        db.push(obj);
    }

    if (
        schema.target === "quest" &&
        typeof generateQuestBoard === "function"
    ) {
        generateQuestBoard();
    }

    if (
        schema.target === "event" &&
        typeof generateEventQuestBoard === "function"
    ) {
        generateEventQuestBoard();
    }

    if (
        schema.target === "boss" &&
        typeof updateBossUnlocks === "function"
    ) {
        updateBossUnlocks();
    }

    renderAll?.();
    manualSave?.();

    openEditor(currentEditorType);
}

function collectEditorFields(schema) {

    const raw = {};

    for (const key in schema.fields) {

        const el =
            document.getElementById(`field_${key}`);

        if (!el) continue;

        raw[key] =
            el.value;
    }

    return raw;
}


/* =========================================================
   DB CONVERSION
========================================================= */

function normalizeFormForDatabase(type, raw, existing = null) {

    if (type === "quest") {

        return {

            name:
                raw.name || "Unnamed Quest",

            description:
                raw.description || "",

            type:
                raw.type || QUEST_TYPES.NORMAL,

            artwork:
                raw.artwork || "",

            tags:
                splitList(raw.tags),

            eventTags:
                splitList(raw.eventTags),

            rarity:
                raw.rarity || "Common",

            rewards: {

                xp:
                    numberOrZero(raw.xp),

                gold:
                    numberOrZero(raw.gold),

                gems:
                    numberOrZero(raw.gems),

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
                        GAME_CONFIG.questLifetimeMinutes || 180
                    ),

                cooldownMinutes:
                    numberOrFallback(
                        raw.cooldownMinutes,
                        GAME_CONFIG.questCooldownMinutes || 15
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
                raw.artwork || "",

            startDate:
                raw.startDate || "",

            endDate:
                raw.endDate || "",

            isActiveOverride:
                raw.isActiveOverride === "true"
        };
    }

    if (type === "boss") {

        return {

            name:
                raw.name || "Unnamed Boss",

            description:
                raw.description || "",

            artwork:
                raw.artwork || "",

            unlockLevel:
                numberOrFallback(raw.unlockLevel, 5),

            maxHp:
                numberOrFallback(raw.maxHp, 100),

            hp:
                clampBossHp(
                    numberOrFallback(
                        raw.hp,
                        raw.maxHp || 100
                    ),
                    numberOrFallback(raw.maxHp, 100)
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
                    numberOrZero(raw.xpReward),

                gold:
                    numberOrZero(raw.goldReward),

                gems:
                    numberOrZero(raw.gemReward),

                title:
                    raw.titleReward || "",

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
                raw.icon || "",

            category:
                raw.category || "consumable",

            cost:
                numberOrZero(raw.cost),

            stackable:
                raw.stackable === "true",

            effects:
                [
                    buildEffectFromRaw(raw)
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
                raw.icon || "",

            rarity:
                raw.rarity || "Common",

            effects:
                [
                    buildEffectFromRaw(raw)
                ].filter(Boolean)
        };
    }

    return existing || raw;
}

function buildEffectFromRaw(raw) {

    const duration =
        raw.effectDuration || "instant";

    const effect = {

        type:
            raw.effectType || EFFECT_TYPES.RELATIVE_BUFF,

        attribute:
            raw.attribute || "",

        amount:
            numberOrZero(raw.amount),

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

function applyUIConfigFromForm(raw) {

    if (!UI_CONFIG.backgrounds) {
        UI_CONFIG.backgrounds = {};
    }

    if (!UI_CONFIG.placeholders) {
        UI_CONFIG.placeholders = {};
    }

    UI_CONFIG.backgrounds.dashboard =
        raw.dashboard || "";

    UI_CONFIG.backgrounds.quests =
        raw.quests || "";

    UI_CONFIG.backgrounds.profile =
        raw.profile || "";

    UI_CONFIG.backgrounds.shop =
        raw.shop || "";

    UI_CONFIG.backgrounds.inventory =
        raw.inventory || "";

    UI_CONFIG.backgrounds.settings =
        raw.settings || "";

    UI_CONFIG.backgrounds.normalQuests =
        raw.normalQuests || "";

    UI_CONFIG.backgrounds.dailyQuests =
        raw.dailyQuests || "";

    UI_CONFIG.backgrounds.eventQuests =
        raw.eventQuests || "";

    UI_CONFIG.backgrounds.bossCampaign =
        raw.bossCampaign || "";

    UI_CONFIG.placeholders.quest =
        raw.placeholderQuest || "";

    UI_CONFIG.placeholders.event =
        raw.placeholderEvent || "";

    UI_CONFIG.placeholders.boss =
        raw.placeholderBoss || "";

    UI_CONFIG.placeholders.item =
        raw.placeholderItem || "";

    UI_CONFIG.placeholders.relic =
        raw.placeholderRelic || "";
}


/* =========================================================
   DELETE
========================================================= */

function deleteEditorEntry(type, id) {

    if (type === "ui") return;

    const db =
        getEditorDatabase(type);

    const index =
        db.findIndex(x => x.id === id);

    if (index === -1) return;

    db.splice(index, 1);

    if (
        type === "quest" &&
        playerData.activeQuest?.id === id
    ) {
        playerData.activeQuest = null;
    }

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
        bossProgression.selectedBossId === id
    ) {
        bossProgression.selectedBossId = null;

        if (typeof updateBossUnlocks === "function") {
            updateBossUnlocks();
        }
    }

    renderAll?.();
    manualSave?.();

    openEditor(type);
}


/* =========================================================
   CLEAR EDITOR
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
        .map(ability => `${ability.name || ""}|${ability.effect || ""}`)
        .join("\n");
}

function serializeEffects(effects) {

    return (effects || [])
        .map(effect => [
            effect.type || "",
            effect.attribute || "",
            effect.amount ?? 0,
            effect.duration || "permanent",
            effect.durationValue ?? ""
        ].join("|"))
        .join("\n");
}


/* =========================================================
   PARSERS
========================================================= */

function splitList(value) {

    return String(value || "")
        .split(",")
        .map(v => v.trim())
        .filter(Boolean);
}

function parseAbilities(value) {

    return String(value || "")
        .split("\n")
        .map(v => v.trim())
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
        .map(v => v.trim())
        .filter(Boolean)
        .map(line => {

            const parts =
                line.split("|");

            const effect = {

                type:
                    parts[0]?.trim() || EFFECT_TYPES.RELATIVE_BUFF,

                attribute:
                    parts[1]?.trim() || "",

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


/* =========================================================
   HELPERS
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

    return Number.isFinite(number) && number !== 0
        ? number
        : fallback;
}

function clampBossHp(hp, maxHp) {

    return Math.max(
        0,
        Math.min(
            hp,
            maxHp
        )
    );
}

function generateEditorId(prefix = "id") {

    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)}`;
}

function escapeEditorValue(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}