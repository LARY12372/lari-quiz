import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { userId } = req.query;

  // Valida userId
  if (!userId || !/^[a-zA-Z0-9\-]{8,64}$/.test(userId)) {
    return res.status(400).json({ error: 'userId inválido' });
  }

  try {
    // Busca todas as respostas do usuário (lista no KV)
    const raw = await kv.lrange(`respostas:${userId}`, 0, -1);

    const respostas = raw.map(item =>
      typeof item === 'string' ? JSON.parse(item) : item
    );

    return res.status(200).json(respostas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
