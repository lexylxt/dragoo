const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY
);

async function initUser(userid) {
    // Vérifier si l'utilisateur existe déjà
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("userid", userid)
        .maybeSingle(); // ← change ici

    if (error) throw error;

    if (!data) {
        // Créer la row par défaut
        const { data: insertData, error: insertError } = await supabase
            .from("users")
            .insert({
                userid,
                candy: 0,
                rank: 0,
                level: 0,
                xp: 0,
                inventory: { candle: 0, pumpkin: 0, book: 0, candy: 0 },
                msgs: 0,
                sales: 0,
                purchases: 0
            })
            .select()
            .single();

        if (insertError) throw insertError;
        return { data: insertData, created: true }; // indique que le compte vient d’être créé
    }

    return { data, created: false }; // compte déjà existant
}

async function getUserData(userid) {
    const { data, error } = await supabase
        .from("users")
        .select("*") // toutes les colonnes
        .eq("userid", userid)
        .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return data; // retourne tout l'objet utilisateur
}

// utils/userVars.js

// Tableau des rôles/ranks Halloween
const HALLOWEEN_RANKS = [
    {
        name: "Citrouille",
        roleId: "1428073428640075867",
        rank: 0,
        candyRequired: 0,
        itemsRequired: { candles: 0, pumpkin: 0, book: 0 }
    },
    {
        name: "Gobelin",
        roleId: "1425900768522666054",
        rank: 1,
        candyRequired: 300,
        itemsRequired: { candles: 10, pumpkin: 0, book: 0 }
    },
    {
        name: "Zombie",
        roleId: "1425900803687714846",
        rank: 2,
        candyRequired: 500,
        itemsRequired: { candles: 20, pumpkin: 0, book: 0 }
    },
    {
        name: "Fantôme",
        roleId: "1425900838345510963",
        rank: 3,
        candyRequired: 700,
        itemsRequired: { candles: 0, pumpkin: 3, book: 0 }
    },
    {
        name: "Loup-Garou",
        roleId: "1425900863704268880",
        rank: 4,
        candyRequired: 1000,
        itemsRequired: { candles: 10, pumpkin: 3, book: 0 }
    },
    {
        name: "Vampire",
        roleId: "1425900886890250271",
        rank: 5,
        candyRequired: 1300,
        itemsRequired: { candles: 0, pumpkin: 6, book: 0 }
    },
    {
        name: "Clown Maléfique",
        roleId: "1425900915294208110",
        rank: 6,
        candyRequired: 1600,
        itemsRequired: { candles: 10, pumpkin: 6, book: 0 }
    },
    {
        name: "Sorcier",
        roleId: "1425900937746186300",
        rank: 7,
        candyRequired: 2000,
        itemsRequired: { candles: 10, pumpkin: 0, book: 1 }
    },
    {
        name: "Frankenstein",
        roleId: "1425900961137823874",
        rank: 8,
        candyRequired: 2400,
        itemsRequired: { candles: 0, pumpkin: 6, book: 1 }
    },
    {
        name: "Démon",
        roleId: "1425900990049026251",
        rank: 9,
        candyRequired: 2800,
        itemsRequired: { candles: 0, pumpkin: 0, book: 2 }
    },
    {
        name: "Kraken",
        roleId: "1425901021837656165",
        rank: 10,
        candyRequired: 3200,
        itemsRequired: { candles: 10, pumpkin: 6, book: 3 }
    }
];

module.exports = { initUser, getUserData, HALLOWEEN_RANKS, supabase };
