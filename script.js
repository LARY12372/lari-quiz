// =============================================
// GERENCIAMENTO DE USUÁRIO (ID único por device)
// =============================================
function getUserId() {
  let uid = localStorage.getItem('quiz_user_id');
  if (!uid) {
    uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    localStorage.setItem('quiz_user_id', uid);
  }
  return uid;
}

// =============================================
// ESTADO DO JOGO
// =============================================
let acertos = 0;
let currentQuestionIndex = 0;
let respondido = false;
let questions = []; // 10 perguntas sorteadas a cada rodada

// =============================================
// PERGUNTAS
// =============================================
const perguntas = [
  { pergunta: "Quem liderou o Quilombo dos Palmares no século XVII junto a Zumbi?", alternativas: ["Dandara dos Palmares", "Lélia Gonzalez", "Marielle Franco", "Carolina Maria de Jesus"], correta: 0, explicacao: "Dandara dos Palmares foi uma das principais líderes e guerreiras do Quilombo dos Palmares, lutando contra a escravidão no Brasil colonial." },
  { pergunta: "Quem foi Dandara dos Palmares?", alternativas: ["Líder e guerreira do Quilombo dos Palmares", "Primeira médica negra", "Escritora", "Cantora"], correta: 0, explicacao: "Dandara foi uma importante guerreira e líder do Quilombo dos Palmares, conhecida por sua luta contra a escravidão." },
  { pergunta: "Quem foi Rosa Parks e qual seu ato histórico?", alternativas: ["Cantora americana", "Se recusou a ceder seu lugar no ônibus, combatendo segregação racial", "Escritora feminista", "Primeira mulher negra no Senado"], correta: 1, explicacao: "Em 1955, Rosa Parks recusou-se a ceder seu assento num ônibus a um branco, ação que impulsionou o movimento pelos direitos civis nos EUA." },
  { pergunta: "Qual evento marcou o fim do apartheid na África do Sul?", alternativas: ["Eleição de Nelson Mandela", "Início da Guerra Civil", "Abolição da escravidão", "Lei de Cotas"], correta: 0, explicacao: "O apartheid terminou formalmente com as primeiras eleições multirraciais em 1994, impulsionado por décadas de lutas contra a segregação racial." },
  { pergunta: "Quando ocorreu a primeira Marcha das Mulheres Negras no Brasil?", alternativas: ["1988", "1995", "2015", "2005"], correta: 2, explicacao: "A primeira Marcha das Mulheres Negras no Brasil aconteceu em 2015, reunindo mulheres para denunciar desigualdades raciais e de gênero." },
  { pergunta: "Quem foi a primeira mulher negra a ocupar um cargo de ministra no Brasil?", alternativas: ["Marielle Franco", "Benedita da Silva", "Lélia Gonzalez", "Dandara dos Palmares"], correta: 1, explicacao: "Benedita da Silva assumiu um ministério no governo federal em 2003, sendo referência histórica como a primeira mulher negra ministra." },
  { pergunta: "O que o movimento Black Lives Matter denuncia?", alternativas: ["Corrupção política", "Violência policial contra negros", "Violência doméstica", "Desigualdade de gênero"], correta: 1, explicacao: "O movimento denuncia o racismo estrutural e a violência policial dirigida a pessoas negras, buscando responsabilidade e mudanças institucionais." },
  { pergunta: "Quando foi reconhecido oficialmente o casamento homoafetivo no Brasil?", alternativas: ["2008", "2011", "2013", "2017"], correta: 2, explicacao: "Em 2013 o Conselho Nacional de Justiça publicou norma que assegurou a realização do casamento civil entre pessoas do mesmo sexo nos cartórios brasileiros." },
  { pergunta: "Quem foi Lélia Gonzalez?", alternativas: ["Ativista negra e intelectual", "Cantora", "Primeira astronauta brasileira", "Presidenta do Brasil"], correta: 0, explicacao: "Lélia Gonzalez foi intelectual e ativista brasileira, referência nos estudos sobre raça, gênero e cultura." },
  { pergunta: "O Dia Internacional da Mulher é celebrado em qual data?", alternativas: ["8 de março", "1 de maio", "12 de junho", "25 de novembro"], correta: 0, explicacao: "O Dia Internacional da Mulher é comemorado em 8 de março, data ligada à luta por direitos e reconhecimento das mulheres." },
  { pergunta: "O que significa a sigla LGBTQIA+?", alternativas: ["Conjunto de identidades sexuais e de gênero", "Nome de movimento político", "Prêmio literário", "Lei de proteção"], correta: 0, explicacao: "LGBTQIA+ reúne diversas orientações sexuais e identidades de gênero, representando essa diversidade." },
  { pergunta: "Quem foi Marielle Franco?", alternativas: ["Ativista e política brasileira", "Cantora", "Escritora", "Atriz"], correta: 0, explicacao: "Marielle Franco foi vereadora e ativista dos direitos humanos, conhecida por denunciar violência policial; foi assassinada em 2018." },
  { pergunta: "Quem foi Katherine Johnson?", alternativas: ["Astronauta", "Matemática da NASA", "Escritora", "Professora"], correta: 1, explicacao: "Katherine Johnson foi matemática da NASA cujos cálculos foram fundamentais para o sucesso de missões tripuladas." },
  { pergunta: "O que simboliza Zumbi dos Palmares?", alternativas: ["Resistência à escravidão", "Exploração", "Colonização", "Escravidão"], correta: 0, explicacao: "Zumbi representa a resistência à escravidão e a luta pela liberdade dos negros no Brasil." },
  { pergunta: "Qual o principal objetivo do movimento feminista?", alternativas: ["Promover desigualdade", "Lutar por direitos iguais entre homens e mulheres", "Proibir mulheres de trabalhar", "Apoiar apenas mulheres ricas"], correta: 1, explicacao: "O feminismo busca a igualdade de direitos entre gêneros e combate à discriminação de gênero." },
  { pergunta: "Quem foi a primeira mulher a ganhar um Prêmio Nobel?", alternativas: ["Ada Lovelace", "Marie Curie", "Malala Yousafzai", "Frida Kahlo"], correta: 1, explicacao: "Marie Curie foi a primeira mulher laureada com um Prêmio Nobel (Física, 1903)." },
  { pergunta: "Qual movimento social surgiu para denunciar racismo e violência contra negros nos EUA em 2013?", alternativas: ["MeToo", "Black Lives Matter", "Occupy Wall Street", "Civil Rights Movement"], correta: 1, explicacao: "O Black Lives Matter surgiu em 2013 como resposta a casos de violência policial e racismo institucional." },
  { pergunta: "Em que década começou a segunda onda do feminismo nos EUA?", alternativas: ["1920", "1960", "1980", "2000"], correta: 1, explicacao: "A segunda onda do feminismo começou na década de 1960, focando em direitos civis, igualdade no trabalho e direitos reprodutivos." },
  { pergunta: "Quem foi Simone de Beauvoir?", alternativas: ["Filósofa francesa e ativista feminista", "Cantora", "Primeira astronauta", "Política brasileira"], correta: 0, explicacao: "Simone de Beauvoir foi filósofa e escritora; 'O Segundo Sexo' é marco do pensamento feminista moderno." },
  { pergunta: "O que significa a sigla ONU?", alternativas: ["Organização Nacional Única", "Organização das Nações Unidas", "Organização Nacional da União", "Ordem das Nações Unidas"], correta: 1, explicacao: "ONU significa Organização das Nações Unidas, criada em 1945 para promover paz e direitos humanos." },
  { pergunta: "Quando a escravidão foi abolida oficialmente no Brasil?", alternativas: ["1888", "1822", "1871", "1900"], correta: 0, explicacao: "A escravidão foi abolida no Brasil pela Lei Áurea, assinada pela Princesa Isabel em 13 de maio de 1888." },
  { pergunta: "Quem foi Malala Yousafzai?", alternativas: ["Ativista paquistanesa pela educação", "Cantora", "Política", "Escritora francesa"], correta: 0, explicacao: "Malala é uma ativista paquistanesa pelo direito à educação e ganhou o Nobel da Paz em 2014." },
  { pergunta: "O que significa o termo 'racismo estrutural'?", alternativas: ["Racismo individual", "Preconceito em leis e instituições", "Apenas bullying escolar", "Assédio moral no trabalho"], correta: 1, explicacao: "Racismo estrutural refere-se a práticas e normas institucionais que produzem desigualdades raciais sistemáticas." },
  { pergunta: "Quem foi Harriet Tubman?", alternativas: ["Ativista americana e abolicionista", "Cantora", "Primeira médica negra", "Política americana"], correta: 0, explicacao: "Harriet Tubman ajudou pessoas escravizadas a fugirem pela 'Underground Railroad' e lutou pelos direitos civis." },
  { pergunta: "Qual movimento denunciou assédio e violência contra mulheres globalmente em 2017?", alternativas: ["MeToo", "Black Lives Matter", "Occupy Wall Street", "Civil Rights Movement"], correta: 0, explicacao: "O movimento MeToo ganhou visibilidade em 2017 por denunciar assédio e violência sexual contra mulheres." },
  { pergunta: "Quem foi Frida Kahlo?", alternativas: ["Pintora mexicana e ativista", "Cantora", "Primeira astronauta", "Política americana"], correta: 0, explicacao: "Frida Kahlo foi pintora mexicana cuja obra aborda identidade, dor e questões de gênero; é ícone cultural." },
  { pergunta: "Quem foi Sojourner Truth?", alternativas: ["Ativista americana abolicionista e feminista", "Cantora", "Primeira médica negra", "Política americana"], correta: 0, explicacao: "Sojourner Truth foi ativista abolicionista e defensora dos direitos das mulheres no século XIX nos EUA." },
  { pergunta: "Quando a Constituição brasileira garantiu igualdade de gênero (texto atual)?", alternativas: ["1934", "1988", "1967", "2000"], correta: 1, explicacao: "A Constituição Federal de 1988 consagra a igualdade de direitos entre homens e mulheres no Brasil." },
  { pergunta: "Quem foi Angela Davis?", alternativas: ["Ativista e acadêmica americana", "Cantora", "Primeira astronauta", "Política brasileira"], correta: 0, explicacao: "Angela Davis é acadêmica e ativista conhecida por sua luta contra racismo, sexismo e o encarceramento em massa." },
  { pergunta: "O que significa feminismo interseccional?", alternativas: ["Combina gênero, raça e classe social", "Apenas direitos das mulheres brancas", "Combina apenas gênero e idade", "É uma lei internacional"], correta: 0, explicacao: "Feminismo interseccional analisa como gênero, raça, classe e outras desigualdades se cruzam e afetam experiências." },
  { pergunta: "Quem foi Toni Morrison?", alternativas: ["Escritora afro-americana e ativista", "Cantora", "Primeira astronauta", "Política americana"], correta: 0, explicacao: "Toni Morrison foi escritora afro-americana vencedora do Nobel de Literatura e referência na literatura e na questão racial." },
  { pergunta: "Quando a ONU adotou a Declaração Universal dos Direitos Humanos?", alternativas: ["1945", "1948", "1950", "1960"], correta: 1, explicacao: "A Declaração Universal dos Direitos Humanos foi adotada em 10 de dezembro de 1948." },
  { pergunta: "Quem foi bell hooks?", alternativas: ["Feminista e escritora americana", "Cantora", "Primeira astronauta", "Política americana"], correta: 0, explicacao: "bell hooks foi uma influente teórica feminista que abordou gênero, raça e classe em suas obras." },
  { pergunta: "Qual mulher trans é reconhecida por suas contribuições à ciência da computação?", alternativas: ["Lynn Conway", "Ada Lovelace", "Marie Curie", "Grace Hopper"], correta: 0, explicacao: "Lynn Conway foi uma pioneira na ciência da computação e microeletrônica, sendo uma importante referência trans na tecnologia." },
  { pergunta: "Quem foi Bertha Lutz?", alternativas: ["Zoóloga brasileira e líder do movimento sufragista", "Primeira médica do mundo", "Astronauta", "Escritora de romances"], correta: 0, explicacao: "Bertha Lutz foi uma cientista (zoóloga) e importante líder feminista brasileira que lutou pelo direito das mulheres ao voto." }
];

// =============================================
// EMBARALHAR ARRAY
// =============================================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// =============================================
// FUNÇÕES DO JOGO
// =============================================
function startGame() {
  acertos = 0;
  currentQuestionIndex = 0;
  respondido = false;
  questions = shuffle(perguntas).slice(0, 10); // sorteia 10 do banco
  showScreen('game-screen');
  mostrarQuestao();
}

function mostrarQuestao() {
  respondido = false;

  const explicacaoEl = document.getElementById('explicacao');
  explicacaoEl.style.display = 'none';
  explicacaoEl.innerHTML = '';
  document.getElementById('next-btn').style.display = 'none';

  const q = questions[currentQuestionIndex];

  document.getElementById('question-area').innerHTML =
    `<b>Pergunta ${currentQuestionIndex + 1} de ${questions.length}:</b> ${q.pergunta}`;

  let html = '';
  q.alternativas.forEach((alt, i) => {
    html += `<button onclick="responder(this, ${i})">${alt}</button>`;
  });
  document.getElementById('answers').innerHTML = html;
}

function responder(btn, i) {
  if (respondido) return;
  respondido = true;

  const q = questions[currentQuestionIndex];
  const buttons = document.querySelectorAll('#answers button');
  buttons.forEach(b => (b.disabled = true));

  const acertou = i === q.correta;
  const respostaSelecionada = q.alternativas[i];

  if (acertou) {
    acertos++;
    btn.classList.add('correct');
  } else {
    btn.classList.add('wrong');
    buttons[q.correta].classList.add('correct');
  }

  // Mostra explicação
  const explicacaoEl = document.getElementById('explicacao');
  explicacaoEl.innerHTML = acertou
    ? `<b style="color:#4CAF50">✔️ Você acertou!</b><br>${q.explicacao}`
    : `<b style="color:#f44336">❌ Não foi dessa vez!</b><br>${q.explicacao}`;
  explicacaoEl.style.display = 'block';

  // Salva no localStorage
  saveResposta(q.pergunta, respostaSelecionada, acertou ? 1 : 0);

  // Botão próxima
  const nextBtn = document.getElementById('next-btn');
  nextBtn.style.display = 'block';
  nextBtn.innerText = currentQuestionIndex < questions.length - 1
    ? 'Próxima Pergunta ➡️'
    : 'Ver Resultado 🏆';
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= questions.length) {
    mostrarResultado();
    return;
  }
  mostrarQuestao();
}

// =============================================
// TELA DE RESULTADO (fim da rodada)
// =============================================
function mostrarResultado() {
  showScreen('acertos-screen');

  const total = questions.length;
  const pct   = Math.round((acertos / total) * 100);

  let icon = '💡';
  if (pct === 100)    icon = '🏆';
  else if (pct >= 80) icon = '🎉';
  else if (pct >= 60) icon = '👍';
  else if (pct >= 40) icon = '📚';

  // Lista detalhada da rodada
  let lista = '';
  questions.forEach((q, idx) => {
    const item = historicoRodada[idx];
    if (!item) return;
    if (item.acertou === 1) {
      lista += `<li class="correta">✔️ ${q.pergunta}</li>`;
    } else {
      lista += `<li class="errada">❌ ${q.pergunta}<br><small>Sua resposta: ${item.resposta}</small></li>`;
    }
  });

  document.getElementById('acertos-count').innerHTML = `
    <div style="font-size:48px; margin-bottom:8px;">${icon}</div>
    <h3>Você acertou <b>${acertos}</b> de <b>${total}</b> perguntas! (${pct}%)</h3>
    <ul style="text-align:left; max-width:600px; margin:20px auto 0;">${lista}</ul>
  `;
}

// =============================================
// TELA DE ACERTOS HISTÓRICO (botão do menu)
// =============================================
function showAcertos() {
  showScreen('acertos-screen');

  const h = loadHistorico();
  if (h.length === 0) {
    document.getElementById('acertos-count').innerHTML =
      '<p>Você ainda não jogou nenhuma rodada!</p>';
    return;
  }

  const totalAcertos   = h.filter(x => x.acertou === 1).length;
  const totalPerguntas = h.length;

  let lista = '';
  h.forEach(item => {
    if (item.acertou === 1) {
      lista += `<li class="correta">✔️ ${item.pergunta}</li>`;
    } else {
      lista += `<li class="errada">❌ ${item.pergunta}<br><small>Sua resposta: ${item.resposta}</small></li>`;
    }
  });

  document.getElementById('acertos-count').innerHTML = `
    <h3>Seus Resultados 🌟</h3>
    <p>Você acertou <b>${totalAcertos}</b> de <b>${totalPerguntas}</b> respostas no histórico!</p>
    <ul style="text-align:left; max-width:600px; margin:0 auto;">${lista}</ul>
  `;
}

// =============================================
// SALVAR RESPOSTA NO LOCALSTORAGE
// =============================================
const STORAGE_KEY = 'quiz_diversidade_history';
let historicoRodada = [];

function saveResposta(pergunta, resposta, acertou) {
  // Guarda na rodada atual
  historicoRodada.push({ pergunta, resposta, acertou });

  // Guarda no histórico geral
  const h = loadHistorico();
  h.unshift({
    date: new Date().toLocaleString('pt-BR'),
    userId: getUserId(),
    pergunta,
    resposta,
    acertou
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(h.slice(0, 500)));
}

function loadHistorico() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

// =============================================
// NAVEGAÇÃO
// =============================================
function backToMenu() {
  historicoRodada = [];
  showScreen('menu-screen');
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
