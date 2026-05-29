import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { pergunta, resposta, explicacao, acertou, userId } = req.body;

  if (!pergunta || !resposta || !explicacao || acertou === undefined || !userId) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  if (!/^[a-zA-Z0-9\-]{8,64}$/.test(userId)) {
    return res.status(400).json({ error: 'userId inválido' });
  }

  // Tenta todas as variáveis possíveis do Neon
  const connString =
    process.env.NEON_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED;

  if (!connString) {
    return res.status(500).json({ error: 'Banco não configurado' });
  }

  try {
    const sql = neon(connString);

    await sql`
      CREATE TABLE IF NOT EXISTS respostas (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        pergunta TEXT NOT NULL,
        resposta TEXT NOT NULL,
        explicacao TEXT NOT NULL,
        acertou INTEGER NOT NULL DEFAULT 0,
        criado_em TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO respostas (user_id, pergunta, resposta, explicacao, acertou)
      VALUES (
        ${userId},
        ${String(pergunta).slice(0, 500)},
        ${String(resposta).slice(0, 500)},
        ${String(explicacao).slice(0, 1000)},
        ${acertou === 1 || acertou === true ? 1 : 0}
      )
    `;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('ERRO SAVE:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
