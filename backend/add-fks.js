const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://quiz_db_j820_user:OWmIfE0yOgcnsZQeMBweSIENDe1oeTbW@dpg-d7a0i0ea2pns7389t2og-a.frankfurt-postgres.render.com/quiz_db_j820',
    ssl: { rejectUnauthorized: false }
});

const applyForeignKeys = async () => {
    try {
        console.log("Дерекқорға қосылуда...");

        // 1. results -> users (user_id)
        await pool.query(`
            ALTER TABLE results
            ADD CONSTRAINT fk_results_user_id
            FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE CASCADE;
        `).catch(e => console.log("fk_results_user_id failed:", e.message));

        // 2. results -> users (username)
        await pool.query(`
            ALTER TABLE results
            ADD CONSTRAINT fk_results_username
            FOREIGN KEY (username) REFERENCES users(username)
            ON UPDATE CASCADE ON DELETE CASCADE;
        `).catch(e => console.log("fk_results_username failed:", e.message));

        // 3. results -> quizzes (quiz_id)
        await pool.query(`
            ALTER TABLE results
            ADD CONSTRAINT fk_results_quiz_id
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
            ON DELETE SET NULL;
        `).catch(e => console.log("fk_results_quiz_id failed:", e.message));

        // 4. leaderboard -> users (user_id)
        await pool.query(`
            ALTER TABLE leaderboard
            ADD CONSTRAINT fk_leaderboard_user_id
            FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE CASCADE;
        `).catch(e => console.log("fk_leaderboard_user_id failed:", e.message));

        // 5. mistakes -> users (username)
        await pool.query(`
            ALTER TABLE mistakes
            ADD CONSTRAINT fk_mistakes_username
            FOREIGN KEY (username) REFERENCES users(username)
            ON UPDATE CASCADE ON DELETE CASCADE;
        `).catch(e => console.log("fk_mistakes_username failed:", e.message));

        console.log("Байланыстар (Foreign Keys) орнатылды!");
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

applyForeignKeys();
