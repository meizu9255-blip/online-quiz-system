const { Pool } = require('pg');

const localPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'beksh_db', 
    password: '1212',     
    port: 5432,
});

const remotePool = new Pool({
    connectionString: 'postgresql://quiz_db_j820_user:OWmIfE0yOgcnsZQeMBweSIENDe1oeTbW@dpg-d7a0i0ea2pns7389t2og-a.frankfurt-postgres.render.com/quiz_db_j820',
    ssl: { rejectUnauthorized: false }
});

const migrate = async () => {
    try {
        console.log("Локальды базадан тесттерді іздеу...");
        const res = await localPool.query('SELECT * FROM quizzes');
        const quizzes = res.rows;
        console.log(`Табылды: ${quizzes.length} тест. Ғаламторға (Render) жүктелуде...`);

        for (let q of quizzes) {
            await remotePool.query(
                `INSERT INTO quizzes (id, title, category, difficulty, questions) 
                 VALUES ($1, $2, $3, $4, $5) 
                 ON CONFLICT (id) DO NOTHING`,
                [q.id, q.title, q.category, q.difficulty, q.questions !== undefined ? JSON.stringify(q.questions) : null]
            );
        }
        
        // ID счетчигін дұрыстау (келесі тест жаңа ID алуы үшін)
        await remotePool.query("SELECT setval('quizzes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM quizzes));");
        
        console.log("Барлық тесттер ғаламторға сәтті көшірілді! 🎉");
    } catch (e) {
        console.error("Қате шықты:", e);
    } finally {
        await localPool.end();
        await remotePool.end();
    }
}

migrate();
