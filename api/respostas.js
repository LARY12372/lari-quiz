import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { userId } = req.query;

  if (!userId || !/^[a-zA-Z0-9\-]{8,64}$/.test(userId)) {
    return res.status(400).json({ error: 'userId inválido' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING);

    const respostas = await sql`
      SELECT pergunta, resposta, explicacao, acertou, criado_em
      FROM respostas
      WHERE user_id = ${userId}
      ORDER BY criado_em DESC
    `;

    return res.status(200).json(respostas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
