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
                quiz_id INTEGER REFERENCES quizzes(id) ON DELETE SET NULL,
                quiz_title VARCHAR(255),
                score NUMERIC,
                correct_count INTEGER,
                total_questions INTEGER,
                time_spent VARCHAR(50),
                username VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                answers JSONB,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("results кестесі сәтті құрылды.");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                total_xp INTEGER,
                quizzes_passed INTEGER,
                average_score NUMERIC,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("leaderboard кестесі сәтті құрылды.");

        try {
            await pool.query(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'results_user_id_fkey') THEN
                        ALTER TABLE results ADD CONSTRAINT results_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'results_username_fkey') THEN
                        ALTER TABLE results ADD CONSTRAINT results_username_fkey FOREIGN KEY (username) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'results_quiz_id_fkey') THEN
                        ALTER TABLE results ADD CONSTRAINT results_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leaderboard_user_id_fkey') THEN
                        ALTER TABLE leaderboard ADD CONSTRAINT leaderboard_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
                    END IF;
                END $$;
            `);
            console.log("Байланыстар (Foreign Keys) орнатылды.");
        } catch(e) {
            console.log("Байланыстар бұрыннан бар немесе қате:", e.message);
        }

        console.log("Барлық кестелер дайын! Енді қосымшаны қолдана аласыз.");
    } catch (error) {
        console.error("Қате:", error);
    } finally {
        await pool.end();
    }
};

createTables();
