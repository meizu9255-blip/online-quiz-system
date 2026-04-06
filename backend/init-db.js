const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://quiz_db_j820_user:OWmIfE0yOgcnsZQeMBweSIENDe1oeTbW@dpg-d7a0i0ea2pns7389t2og-a.frankfurt-postgres.render.com/quiz_db_j820',
    ssl: { rejectUnauthorized: false }
});

const createTables = async () => {
    try {
        console.log("Дерекқорға қосылуда...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL
            );
        `);
        console.log("users кестесі сәтті құрылды.");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS quizzes (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(255),
                difficulty VARCHAR(50),
                questions JSONB
            );
        `);
        console.log("quizzes кестесі сәтті құрылды.");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS results (
                id SERIAL PRIMARY KEY,
                quiz_id INTEGER,
                quiz_title VARCHAR(255),
                score NUMERIC,
                correct_count INTEGER,
                total_questions INTEGER,
                time_spent VARCHAR(50),
                username VARCHAR(255),
                user_id INTEGER,
                answers JSONB,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("results кестесі сәтті құрылды.");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                user_id INTEGER PRIMARY KEY,
                total_xp INTEGER,
                quizzes_passed INTEGER,
                average_score NUMERIC,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("leaderboard кестесі сәтті құрылды.");

        console.log("Барлық кестелер дайын! Енді қосымшаны қолдана аласыз.");
    } catch (error) {
        console.error("Қате:", error);
    } finally {
        await pool.end();
    }
};

createTables();
