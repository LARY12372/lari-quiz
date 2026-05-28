import { kv } from '@vercel/kv';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Autenticação via header: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    // Lista todos os userIds registrados
    const usuarios = await kv.smembers('usuarios');

    if (!usuarios || usuarios.length === 0) {
      return res.status(200).json({ totalUsuarios: 0, usuarios: [] });
    }

    // Para cada usuário, busca as respostas
    const resultado = await Promise.all(
      usuarios.map(async (uid) => {
        const raw = await kv.lrange(`respostas:${uid}`, 0, -1);
        const respostas = raw.map(item =>
          typeof item === 'string' ? JSON.parse(item) : item
        );
        return {
          userId: uid,
          totalRespostas: respostas.length,
          totalAcertos: respostas.filter(r => r.acertou === 1).length,
          respostas
        };
      })
    );

    return res.status(200).json({
      totalUsuarios: resultado.length,
      usuarios: resultado
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
