/* =========================================================
   QUEST CHRONICLES - DATABASE v1
   Core Data Layer (Editor-Compatible Schema)
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
   QUEST DATABASE (UNIFIED STRUCTURE)
========================================================= */

const questDatabase = {
    normal: [],
    daily: [],
    events: [],
    boss: []
};


/* =========================================================
   EVENT DATABASE
========================================================= */

const eventDatabase = [];


/* =========================================================
   BOSS DATABASE
========================================================= */

const bossDatabase = [];


/* =========================================================
   ITEM DATABASE (SHOP + INVENTORY UNIFIED)
========================================================= */

const itemDatabase = [];


/* =========================================================
   SAMPLE DATA (TESTING ONLY)
========================================================= */

questDatabase.normal.push({
    id: "q001",

    name: "Morning Walk",
    description: "Take a 15 minute walk outside.",

    type: "normal",

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
});


questDatabase.daily.push({
    id: "d001",

    name: "Drink Water",
    description: "Drink at least 2 liters of water.",

    type: "daily",

    tags: ["Health"],
    eventTags: [],

    rarity: "Daily",

    rewards: {
        xp: 15,
        gold: 5,
        stats: {
            Health: 4,
            Fitness: 0,
            Wisdom: 0,
            Home: 0
        }
    },

    reset: "daily",

    scaling: {
        xpMultiplier: 1,
        goldMultiplier: 1
    }
});


questDatabase.events.push({
    id: "eq001",

    name: "Carve a Pumpkin",
    description: "Create or decorate a pumpkin.",

    type: "event",

    tags: ["Home", "Creativity"],
    eventTags: ["halloween2026"],

    rarity: "Event",

    rewards: {
        xp: 50,
        gold: 40,
        stats: {
            Home: 10,
            Fitness: 0,
            Health: 0,
            Wisdom: 0
        }
    }
});


/* =========================================================
   EVENT SYSTEM
========================================================= */

eventDatabase.push({
    id: "e001",

    name: "Halloween 2026",
    tag: "halloween2026",

    description: "Spooky seasonal event.",

    startDate: "2026-10-15",
    endDate: "2026-11-01",

    artwork: "",

    isActiveOverride: false
});


/* =========================================================
   BOSSES (WITH REGENERATION SYSTEM)
========================================================= */

bossDatabase.push({
    id: "boss001",

    name: "Goblin King",
    description: "A stubborn early-game boss.",

    maxHp: 100,
    hp: 100,

    regenRate: 1,   // HP per tick (future loop system)

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
});


/* =========================================================
   ITEMS (SHOP + INVENTORY)
========================================================= */

itemDatabase.push(
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
);


/* =========================================================
   GLOBAL EXPORTS
========================================================= */

window.playerData = playerData;
window.questDatabase = questDatabase;
window.eventDatabase = eventDatabase;
window.bossDatabase = bossDatabase;
window.itemDatabase = itemDatabase;