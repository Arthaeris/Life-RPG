/* =========================================================
   QUEST CHRONICLES - DATABASE v0.1
   Core Data Layer (JSON-driven)
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
   QUEST DATABASE
========================================================= */

const questDatabase = {
    normal: [],
    daily: [],
    events: [],
    boss: []
};


/* =========================================================
   SAMPLE QUESTS (TEST DATA)
========================================================= */

questDatabase.normal.push(
    {
        id: "q001",
        name: "Morning Walk",
        description: "Take a 15 minute walk outside.",
        tags: ["Fitness", "Health"],
        rarity: "Common",
        rewards: {
            xp: 25,
            gold: 15,
            stats: {
                Fitness: 5,
                Health: 3
            }
        },
        timeLimit: null,
        eventTags: []
    },
    {
        id: "q002",
        name: "Clean Desk",
        description: "Organize your workspace.",
        tags: ["Home"],
        rarity: "Common",
        rewards: {
            xp: 20,
            gold: 10,
            stats: {
                Home: 5
            }
        },
        timeLimit: null,
        eventTags: []
    }
);


/* =========================================================
   DAILY QUESTS
========================================================= */

questDatabase.daily.push(
    {
        id: "d001",
        name: "Drink Water",
        description: "Drink at least 2 liters of water.",
        tags: ["Health"],
        rarity: "Daily",
        rewards: {
            xp: 15,
            gold: 5,
            stats: {
                Health: 4
            }
        },
        reset: "daily",
        eventTags: []
    }
);


/* =========================================================
   EVENT SYSTEM (SEASONAL REPLACEMENT)
========================================================= */

const eventDatabase = [
    {
        id: "e001",
        name: "Halloween 2026",
        tag: "halloween2026",
        startDate: "2026-10-15",
        endDate: "2026-11-01",
        description: "Spooky seasonal event.",
        active: false
    }
];


/* =========================================================
   EVENT QUESTS
========================================================= */

questDatabase.events.push(
    {
        id: "eq001",
        name: "Carve a Pumpkin",
        description: "Create or decorate a pumpkin.",
        tags: ["Home", "Creativity"],
        rarity: "Event",
        rewards: {
            xp: 50,
            gold: 40,
            stats: {
                Home: 10
            }
        },
        eventTags: ["halloween2026"]
    }
);


/* =========================================================
   BOSSES
========================================================= */

const bossDatabase = [
    {
        id: "boss001",
        name: "Goblin King",
        description: "A stubborn early-game boss.",
        maxHp: 100,
        hp: 100,

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
   ITEMS / SHOP DATABASE
========================================================= */

const itemDatabase = [
    {
        id: "i001",
        name: "Quest Refresh Token",
        description: "Refresh an active quest slot instantly.",
        category: "consumable",
        cost: 50,
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
        effect: {
            type: "xp_multiplier",
            value: 1.5,
            duration: 3600
        }
    }
];


/* =========================================================
   EXPORTS (for later modular use)
========================================================= */

window.playerData = playerData;
window.questDatabase = questDatabase;
window.eventDatabase = eventDatabase;
window.bossDatabase = bossDatabase;
window.itemDatabase = itemDatabase;