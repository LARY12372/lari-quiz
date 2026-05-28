import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { pergunta, resposta, explicacao, acertou, userId } = req.body;

  // Validação
  if (!pergunta || !resposta || !explicacao || acertou === undefined || !userId) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  // Sanitiza userId: só permite UUID (letras, números e hífens)
  if (!/^[a-zA-Z0-9\-]{8,64}$/.test(userId)) {
    return res.status(400).json({ error: 'userId inválido' });
  }

  try {
    const entrada = {
      pergunta: String(pergunta).slice(0, 500),
      resposta: String(resposta).slice(0, 500),
      explicacao: String(explicacao).slice(0, 1000),
      acertou: acertou === 1 || acertou === true ? 1 : 0,
      criadoEm: new Date().toISOString()
    };

    // Salva numa lista por userId: "respostas:<userId>"
    await kv.lpush(`respostas:${userId}`, JSON.stringify(entrada));

    // Também salva o userId numa lista global (para o admin listar todos)
    await kv.sadd('usuarios', userId);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
