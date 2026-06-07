/* =========================================================
   QUEST CHRONICLES - DATABASE v1.2
   Unified Data Model for render.js v1.2 + systems.js v2.2
========================================================= */


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

    activeQuestSlots: 1,
    activeQuests: [],

    buffs: [],

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
        }
    },

    inventory: []
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
   QUEST DATABASE
   Unified array model.
   render.js filters by quest.type.
   systems.js finds quests by id.
========================================================= */

const questDatabase = [
    {
        id: "q001",
        name: "Morning Walk",
        description: "Take a 15 minute walk outside.",
        type: QUEST_TYPES.NORMAL,

        tags: ["Fitness", "Health"],
        eventTags: [],

        rarity: "Common",

        rewards: {
            xp: 25,
            gold: 15,
            stats: {
                Fitness: 5,
                Health: 3,
                Wisdom: 0,
                Home: 0
            }
        },

        timeLimit: null,

        scaling: {
            xpMultiplier: 1,
            goldMultiplier: 1
        }
    },

    {
        id: "d001",
        name: "Drink Water",
        description: "Drink at least 2 liters of water.",
        type: QUEST_TYPES.DAILY,

        tags: ["Health"],
        eventTags: [],

        rarity: "Daily",

        rewards: {
            xp: 15,
            gold: 5,
            stats: {
                Fitness: 0,
                Health: 4,
                Wisdom: 0,
                Home: 0
            }
        },

        reset: "daily",

        timeLimit: null,

        scaling: {
            xpMultiplier: 1,
            goldMultiplier: 1
        }
    },

    {
        id: "eq001",
        name: "Carve a Pumpkin",
        description: "Create or decorate a pumpkin.",
        type: QUEST_TYPES.EVENT,

        tags: ["Home", "Creativity"],
        eventTags: ["halloween2026"],

        rarity: "Event",

        rewards: {
            xp: 50,
            gold: 40,
            stats: {
                Fitness: 0,
                Health: 0,
                Wisdom: 0,
                Home: 10
            }
        },

        timeLimit: null,

        scaling: {
            xpMultiplier: 1,
            goldMultiplier: 1
        }
    }
];


/* =========================================================
   EVENT DATABASE
   render.js shows event quests only if their eventTags match
   an active event returned by systems.js getActiveEvents().
========================================================= */

const eventDatabase = [
    {
        id: "e001",

        name: "Halloween 2026",
        tag: "halloween2026",
        description: "Spooky seasonal event.",

        startDate: "2026-10-15",
        endDate: "2026-11-01",

        artwork: "",

        isActiveOverride: false
    }
];


/* =========================================================
   BOSS DATABASE
   systems.js handles damage.
   render.js displays bossDatabase[0].
   processBossRegeneration() uses regenRate.
========================================================= */

const bossDatabase = [
    {
        id: "boss001",

        name: "Goblin King",
        description: "A stubborn early-game boss.",

        maxHp: 100,
        hp: 100,

        regenRate: 1,

        weaknesses: ["Fitness"],
        resistances: ["Home"],

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
            title: "Goblin Slayer"
        }
    }
];


/* =========================================================
   ITEM DATABASE
   Unified shop + inventory item structure.
========================================================= */

const itemDatabase = [
    {
        id: "i001",

        name: "Quest Refresh Token",
        description: "Refresh an active quest slot instantly.",

        category: "consumable",
        cost: 50,
        stackable: false,

        effect: {
            type: "refresh_quest_slot"
        }
    },

    {
        id: "i002",

        name: "XP Boost Potion",
        description: "+50% XP for 1 hour.",

        category: "boost",
        cost: 120,
        stackable: false,

        effect: {
            type: "xp_multiplier",
            value: 1.5,
            duration: 3600
        }
    }
];


/* =========================================================
   DATABASE HELPERS
========================================================= */

function getQuestsByType(type) {
    return questDatabase.filter(q => q.type === type);
}


/* =========================================================
   GLOBAL EXPORTS
========================================================= */

window.playerData = playerData;
window.questDatabase = questDatabase;
window.eventDatabase = eventDatabase;
window.bossDatabase = bossDatabase;
window.itemDatabase = itemDatabase;
window.QUEST_TYPES = QUEST_TYPES;
window.getQuestsByType = getQuestsByType;