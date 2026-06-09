/* =========================================================
   QUEST CHRONICLES - DATABASE v3.1
   Progression + Quest Board + Boss Campaign System
   Artwork + UI Background Foundation
========================================================= */


/* =========================================================
   GLOBAL CONFIG
========================================================= */

const GAME_CONFIG = {

    /* Quest Board */
    acceptedQuestLimit: 1,

    normalQuestSlots: 5,
    dailyQuestSlots: 3,

    questLifetimeMinutes: 180,
    questCooldownMinutes: 15,

    /* Boss Progression */
    bossUnlockInterval: 5,

    bossDamageWeaknessMultiplier: 2.0,
    bossDamageResistanceMultiplier: 0.5,
    bossDamageNeutralMultiplier: 1.0,

    /* Relics */
    relicSlots: 3
};


/* =========================================================
   UI CONFIG
   Paths are relative to index.html.
   Use empty strings until artwork exists in your repository.
========================================================= */

const UI_CONFIG = {

    backgrounds: {

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
    },

    placeholders: {

        quest: "",
        event: "",
        boss: "",
        item: "",
        relic: ""
    }
};


/* =========================================================
   PLAYER DATA
========================================================= */

const playerData = {

    name: "Hero",

    level: 1,
    xp: 0,
    xpToNext: 100,

    gold: 100,
    gems: 0,

    title: "Novice Adventurer",

    stats: {
        Fitness: { level: 1, xp: 0 },
        Health: { level: 1, xp: 0 },
        Wisdom: { level: 1, xp: 0 },
        Home: { level: 1, xp: 0 }
    },

    lifetime: {

        questsCompleted: 0,

        questsByType: {
            normal: 0,
            daily: 0,
            event: 0,
            boss: 0
        },

        bossesDefeated: 0,

        totalBossDamageDealt: 0
    },

    inventory: [],
    relicInventory: [],

    buffs: [],

    activeQuest: null,

    titleHistory: []
};


/* =========================================================
   QUEST BOARD STATE
========================================================= */

const questBoardState = {

    normalSlots: [],

    dailySlots: [],

    eventSlots: [],

    slotCooldowns: {},

    generatedAt: Date.now()
};


/* =========================================================
   BOSS PROGRESSION
========================================================= */

const bossProgression = {

    unlockedBosses: [],

    completedBosses: [],

    selectedBossId: null
};


/* =========================================================
   QUEST TYPES
========================================================= */

const QUEST_TYPES = {
    NORMAL: "normal",
    DAILY: "daily",
    EVENT: "event",
    BOSS: "boss"
};


/* =========================================================
   EFFECT DEFINITIONS
========================================================= */

const EFFECT_TYPES = {
    RELATIVE_BUFF: "relative_buff",
    RELATIVE_DEBUFF: "relative_debuff",
    ABSOLUTE_BUFF: "absolute_buff",
    ABSOLUTE_DEBUFF: "absolute_debuff"
};


const EFFECT_ATTRIBUTES = [

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


const EFFECT_DURATIONS = [
    "instant",
    "seconds",
    "minutes",
    "hours",
    "days",
    "months",
    "permanent"
];


/* =========================================================
   ACTIVE EFFECTS
========================================================= */

const activeEffects = [];


/* =========================================================
   RELIC LOADOUT
========================================================= */

const relicLoadout = {

    slots: GAME_CONFIG.relicSlots,

    equipped: [
        null,
        null,
        null
    ]
};


/* =========================================================
   QUEST DATABASE
   artwork = faded card background image.
========================================================= */

const questDatabase = [

    {
        id: "q001",

        name: "Morning Walk",
        description: "Take a 15 minute walk outside.",

        type: QUEST_TYPES.NORMAL,

        artwork: "assets/quests/morning-walk.png",

        tags: ["Fitness", "Health"],
        eventTags: [],

        rarity: "Common",

        rewards: {

            xp: 25,
            gold: 15,
            gems: 0,

            stats: {
                Fitness: 5,
                Health: 3,
                Wisdom: 0,
                Home: 0
            },

            items: [],
            relics: []
        },

        boardConfig: {
            expiresAfterMinutes: 180,
            cooldownMinutes: 15
        }
    },

    {
        id: "d001",

        name: "Drink Water",
        description: "Drink at least 2 liters of water.",

        type: QUEST_TYPES.DAILY,

        artwork: "assets/quests/drink-water.png",

        tags: ["Health"],
        eventTags: [],

        rarity: "Daily",

        rewards: {

            xp: 15,
            gold: 5,
            gems: 0,

            stats: {
                Fitness: 0,
                Health: 4,
                Wisdom: 0,
                Home: 0
            },

            items: [],
            relics: []
        },

        reset: "daily",

        boardConfig: {
            expiresAfterMinutes: 180,
            cooldownMinutes: 15
        }
    },

    {
        id: "eq001",

        name: "Carve a Pumpkin",
        description: "Create or decorate a pumpkin.",

        type: QUEST_TYPES.EVENT,

        artwork: "assets/quests/carve-pumpkin.png",

        tags: ["Home", "Creativity"],
        eventTags: ["halloween2026"],

        rarity: "Event",

        rewards: {

            xp: 50,
            gold: 40,
            gems: 0,

            stats: {
                Fitness: 0,
                Health: 0,
                Wisdom: 0,
                Home: 10
            },

            items: [],
            relics: []
        },

        boardConfig: {
            expiresAfterMinutes: 180,
            cooldownMinutes: 15
        }
    }
];


/* =========================================================
   EVENT DATABASE
   artwork = event banner/card background image.
========================================================= */

const eventDatabase = [

    {
        id: "e001",

        name: "Halloween 2026",

        tag: "halloween2026",

        description: "Spooky seasonal event.",

        artwork: "assets/events/halloween-2026.png",

        startDate: "2026-10-15",
        endDate: "2026-11-01",

        isActiveOverride: false
    }
];


/* =========================================================
   BOSS DATABASE
   artwork = large faded boss card background image.
========================================================= */

const bossDatabase = [

    {
        id: "boss001",

        unlockLevel: 5,

        name: "Goblin King",

        description: "A stubborn early-game boss with a greedy crown and too much confidence.",

        artwork: "assets/bosses/goblin-king.png",

        maxHp: 100,
        hp: 100,

        regenRate: 1,

        weaknesses: ["Fitness"],
        resistances: ["Home"],

        modifiers: [],

        abilities: [

            {
                name: "Tax Raid",
                effect: "gold_drain"
            },

            {
                name: "Pressure Curse",
                effect: "quest_timer_reduction"
            }
        ],

        rewards: {

            xp: 200,
            gold: 500,
            gems: 25,

            title: "Goblin Slayer",

            relics: [
                "r001"
            ],

            items: []
        }
    },

    {
        id: "boss002",

        unlockLevel: 10,

        name: "Forest Warden",

        description: "An ancient guardian of roots, moss and quiet discipline.",

        artwork: "assets/bosses/forest-warden.png",

        maxHp: 250,
        hp: 250,

        regenRate: 2,

        weaknesses: ["Wisdom", "Home"],
        resistances: ["Health"],

        modifiers: [

            {
                type: EFFECT_TYPES.RELATIVE_DEBUFF,
                attribute: "boss_damage",
                amount: 5,
                duration: "permanent"
            }
        ],

        abilities: [

            {
                name: "Root Snare",
                effect: "quest_cooldown_increase"
            },

            {
                name: "Ancient Patience",
                effect: "boss_regeneration"
            }
        ],

        rewards: {

            xp: 450,
            gold: 900,
            gems: 50,

            title: "Warden Breaker",

            relics: [
                "r002"
            ],

            items: []
        }
    },

    {
        id: "boss003",

        unlockLevel: 15,

        name: "Iron Tyrant",

        description: "A massive armored tyrant forged from steel, fire and relentless pressure.",

        artwork: "assets/bosses/iron-tyrant.png",

        maxHp: 500,
        hp: 500,

        regenRate: 3,

        weaknesses: ["Health"],
        resistances: ["Fitness", "Home"],

        modifiers: [

            {
                type: EFFECT_TYPES.RELATIVE_BUFF,
                attribute: "boss_damage_taken",
                amount: 10,
                duration: "permanent"
            }
        ],

        abilities: [

            {
                name: "Iron Wall",
                effect: "boss_damage_reduction"
            },

            {
                name: "Forge Heat",
                effect: "gold_lock_pressure"
            }
        ],

        rewards: {

            xp: 800,
            gold: 1500,
            gems: 100,

            title: "Ironbreaker",

            relics: [
                "r003"
            ],

            items: []
        }
    }
];


/* =========================================================
   BOSS CHALLENGE STATE
========================================================= */

const bossChallengeState = {

    active: false,

    currentBossId: null,

    startedAt: null,

    damageDealt: 0,

    xpLocked: false,

    goldLocked: false,

    pendingRewards: {
        xp: 0,
        gold: 0,
        gems: 0,
        items: [],
        relics: []
    }
};


/* =========================================================
   RELIC DATABASE
   icon = small icon image for inventory/loadout UI.
========================================================= */

const relicDatabase = [

    {
        id: "r001",

        name: "Goblin Crown",

        rarity: "Rare",

        description: "+10% Gold Gain",

        icon: "assets/relics/goblin-crown.png",

        effects: [

            {
                type: EFFECT_TYPES.RELATIVE_BUFF,
                attribute: "gold_gain",
                amount: 10,
                duration: "permanent"
            }
        ]
    },

    {
        id: "r002",

        name: "Warden Seed",

        rarity: "Epic",

        description: "-10% Quest Cooldown Time",

        icon: "assets/relics/warden-seed.png",

        effects: [

            {
                type: EFFECT_TYPES.RELATIVE_DEBUFF,
                attribute: "quest_cooldown",
                amount: 10,
                duration: "permanent"
            }
        ]
    },

    {
        id: "r003",

        name: "Iron Core",

        rarity: "Legendary",

        description: "+15% Boss Damage",

        icon: "assets/relics/iron-core.png",

        effects: [

            {
                type: EFFECT_TYPES.RELATIVE_BUFF,
                attribute: "boss_damage",
                amount: 15,
                duration: "permanent"
            }
        ]
    }
];


/* =========================================================
   ITEM DATABASE
   icon = small icon image for shop/inventory UI.
========================================================= */

const itemDatabase = [

    {
        id: "i001",

        name: "Quest Refresh Token",

        description: "Refresh an active quest slot instantly.",

        icon: "assets/items/quest-refresh-token.png",

        category: "consumable",

        cost: 50,

        stackable: false,

        effects: [

            {
                type: EFFECT_TYPES.ABSOLUTE_BUFF,
                attribute: "quest_slot_refresh",
                amount: 1,
                duration: "instant"
            }
        ]
    },

    {
        id: "i002",

        name: "XP Boost Potion",

        description: "+50% XP for 1 hour.",

        icon: "assets/items/xp-boost-potion.png",

        category: "boost",

        cost: 120,

        stackable: false,

        effects: [

            {
                type: EFFECT_TYPES.RELATIVE_BUFF,
                attribute: "xp_gain",
                amount: 50,
                duration: "hours",
                durationValue: 1
            }
        ]
    }
];


/* =========================================================
   DATABASE HELPERS
========================================================= */

function getQuestsByType(type) {
    return questDatabase.filter(q => q.type === type);
}

function getBossesUnlockedAtLevel(level) {
    return bossDatabase.filter(b => b.unlockLevel <= level);
}

function getBossById(id) {
    return bossDatabase.find(boss => boss.id === id);
}

function getQuestById(id) {
    return questDatabase.find(quest => quest.id === id);
}

function getItemById(id) {
    return itemDatabase.find(item => item.id === id);
}

function getRelicById(id) {
    return relicDatabase.find(relic => relic.id === id);
}

function getEventByTag(tag) {
    return eventDatabase.find(event => event.tag === tag);
}


/* =========================================================
   GLOBAL EXPORTS
========================================================= */

window.GAME_CONFIG = GAME_CONFIG;
window.UI_CONFIG = UI_CONFIG;

window.playerData = playerData;

window.questBoardState = questBoardState;

window.bossProgression = bossProgression;

window.questDatabase = questDatabase;
window.eventDatabase = eventDatabase;
window.bossDatabase = bossDatabase;
window.itemDatabase = itemDatabase;
window.relicDatabase = relicDatabase;

window.activeEffects = activeEffects;
window.relicLoadout = relicLoadout;
window.bossChallengeState = bossChallengeState;

window.QUEST_TYPES = QUEST_TYPES;

window.EFFECT_TYPES = EFFECT_TYPES;
window.EFFECT_ATTRIBUTES = EFFECT_ATTRIBUTES;
window.EFFECT_DURATIONS = EFFECT_DURATIONS;

window.getQuestsByType = getQuestsByType;
window.getBossesUnlockedAtLevel = getBossesUnlockedAtLevel;

window.getBossById = getBossById;
window.getQuestById = getQuestById;
window.getItemById = getItemById;
window.getRelicById = getRelicById;
window.getEventByTag = getEventByTag;