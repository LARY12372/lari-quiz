import { neon } from '@neondatabase/serverless';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING);

    const respostas = await sql`
      SELECT user_id, pergunta, resposta, acertou, criado_em
      FROM respostas
      ORDER BY criado_em DESC
    `;

    // Agrupa por usuário
    const agrupado = {};
    for (const r of respostas) {
      if (!agrupado[r.user_id]) agrupado[r.user_id] = [];
      agrupado[r.user_id].push(r);
    }

    const usuarios = Object.entries(agrupado).map(([uid, resps]) => ({
      userId: uid,
      totalRespostas: resps.length,
      totalAcertos: resps.filter(r => r.acertou === 1).length,
      respostas: resps
    }));

    return res.status(200).json({ totalUsuarios: usuarios.length, usuarios });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
