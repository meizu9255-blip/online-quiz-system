const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://quiz_db_j820_user:OWmIfE0yOgcnsZQeMBweSIENDe1oeTbW@dpg-d7a0i0ea2pns7389t2og-a.frankfurt-postgres.render.com/quiz_db_j820',
    ssl: { rejectUnauthorized: false }
});

const createMistakes = async () => {
    try {
        console.log("Дерекқорға қосылуда...");

        // mistakes кестесі
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mistakes (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                category VARCHAR(255) DEFAULT 'Жалпы',
                question TEXT NOT NULL,
                options JSONB NOT NULL,
                correct_answer TEXT NOT NULL,
                UNIQUE(username, question) 
                -- бір сұрақты қайталап сақтамас үшін
            );
        `);
        console.log("mistakes кестесі сәтті құрылды.");

        // results кестесіне category бағанын қосу
        await pool.query(`
            ALTER TABLE results ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT 'Жалпы';
        `);
        console.log("results кестесіне category бағаны қосылды.");

    } catch (error) {
        console.error("Қате:", error);
    } finally {
        await pool.end();
    }
};

createMistakes();
