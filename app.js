// Dados do site. Fontes: R-ZW/t9-leas (analise/comparacao.md, medicoes.json) e R-ZW/t8-leas (relatório da T8).

const ROTULO = { sim: "Sim", nao: "Não", ind: "?" };
const NOME = { sim: "atribuído", nao: "não atribuído", ind: "indeterminado" };

// Decisões da T9 no Foremost-NG: uma letra por cadeia (s = sim, n = não, i = indeterminado).
const PARECER = [
  { quem: "Comitê do SBSeg", detalhe: "selos oficiais", comite: true, A: { F: "s", R: "s" }, B2: { F: "s", R: "s" } },
  { quem: "Claude", detalhe: "Opus 5.5, nível High", A: { F: "nnn", R: "nnn" }, B2: { F: "nns", R: "nnn" } },
  { quem: "GPT", detalhe: "6 Sol, nível xhigh", A: { F: "nnn", R: "nnn" }, B2: { F: "nnn", R: "nnn" } },
  { quem: "Gemini", detalhe: "3.8 Flash, nível High", A: { F: "iii", R: "nnn" }, B2: { F: "sss", R: "nnn" } },
];
const LETRA = { s: "sim", n: "nao", i: "ind" };
const GIROS = [-7, 4, -3, 6, -5, 2, -8, 5, -2];

const COINCIDENCIA = [
  { grupo: "T7" },
  { rotulo: "Só lendo e decidindo", acertos: 1, total: 12, antes: true },
  { grupo: "T8" },
  { rotulo: "Só com a documentação", acertos: 0, total: 12, antes: true },
  { rotulo: "Com o registro de execução", acertos: 5, total: 8 },
  { grupo: "T9" },
  { rotulo: "Só com a documentação", acertos: 0, total: 18, antes: true },
  { rotulo: "Depois de executar", acertos: 4, total: 18 },
];

const CUSTO = [
  { nome: "Claude Opus 5.5", porCadeia: 7.44, total: 22.31, minutos: 28.6, saida: 108 },
  { nome: "GPT 6 Sol", porCadeia: 3.85, total: 11.55, minutos: 23.4, saida: 74 },
  { nome: "Gemini 3.8 Flash", porCadeia: 1.83, total: 5.48, minutos: 24.5, saida: 117 },
];

const LINHA = [
  { data: "14/09", tema: "Analisadores de logs", entregue: "Três analisadores de logs feitos com IA (SSH e web) e artigos sobre o valor dos selos de artefatos.", combinado: "Trocar de provedor entre as tarefas e registrar tempo e etapas do trabalho com IA." },
  { data: "21/09", tema: "Mudança de tema", entregue: "Três LLMs em três níveis de raciocínio gerando o mesmo analisador: 18 soluções, 360 testes aprovados.", combinado: "Fazer a T7: avaliar, em trio, dois artefatos reais já avaliados no SBSeg e no SBRC." },
  { data: "05/10", tema: "T7", entregue: "Foremost-NG e MiniNet-GUI avaliados pelas três LLMs. Só 1 de 6 decisões de F e 0 de 6 de R bateram com o oficial.", combinado: "Refinar o protocolo, subir o esforço, rodar em ambiente isolado e estimar tokens e custo." },
  { data: "19/10", tema: "T8", entregue: "Execução única e registro factual igual para as três: 18 conversas, 72 decisões, 580 evidências. Com o registro, 5 de 8 iguais ao oficial.", combinado: "Cada LLM executar o artefato, com a chave do VirusTotal; pedir a evidence2.dd aos autores; medir tokens e custo." },
  { data: "26/10", tema: "T9", entregue: "Nove cadeias autônomas em contêineres: R negado em todas, F dividido, três defeitos reais, US$ 39,34 no total.", combinado: "Usar o sistema de avaliação de artefatos do Cristhian, com avaliador de IA e avaliadores humanos." },
  { data: "09/11", tema: "Sistema do Cristhian", entregue: "Foremost-NG e MiniNet-GUI indicados para a prova de conceito; Reinaldo oferece o próprio TCC como artefato.", combinado: "Publicar os artefatos do TCC para a simulação." },
  { data: "16/11", tema: "Simulação", entregue: "Artefatos do TCC publicados no Zenodo e no GitHub. O grupo aguarda o sistema para avaliar como autores e revisores.", combinado: "Participar da simulação como autores e revisores." },
];

const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmt = (n, casas = 2) => n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

// Quadro de carimbos
const corpo = document.getElementById("quadro-corpo");
function carimbo(letra, grande, i, atraso) {
  const tipo = LETRA[letra];
  const el = document.createElement("span");
  el.className = `carimbo ${tipo}${grande ? " grande" : ""}`;
  el.textContent = ROTULO[tipo];
  el.style.setProperty("--giro", `${GIROS[i % GIROS.length]}deg`);
  el.style.setProperty("--atraso", `${atraso}ms`);
  el.dataset.tipo = tipo;
  return el;
}
function desenhaQuadro(momento, animar, soMudancas) {
  const anteriores = [...corpo.querySelectorAll(".carimbo")].map((c) => c.dataset.tipo);
  corpo.innerHTML = "";
  let n = 0, k = 0;
  PARECER.forEach((linha) => {
    const tr = document.createElement("tr");
    if (linha.comite) tr.className = "comite";
    const th = document.createElement("th");
    th.scope = "row";
    th.innerHTML = `${linha.quem}<small>${linha.detalhe}</small>`;
    tr.appendChild(th);
    ["F", "R"].forEach((selo) => {
      const td = document.createElement("td");
      td.dataset.selo = selo === "F" ? "Funcional (F)" : "Reprodutível (R)";
      const box = document.createElement("div");
      box.className = "carimbos";
      const letras = linha[momento][selo];
      const partes = [];
      [...letras].forEach((l, j) => {
        const c = carimbo(l, linha.comite, n, 0);
        const mudou = anteriores.length && anteriores[k] !== c.dataset.tipo;
        if (animar && !menosMovimento && (!soMudancas || mudou)) {
          c.classList.add("batendo");
          c.style.setProperty("--atraso", `${soMudancas ? 0 : 150 + n * 70}ms`);
        }
        partes.push(linha.comite ? NOME[c.dataset.tipo] : `cadeia ${j + 1} ${NOME[c.dataset.tipo]}`);
        box.appendChild(c);
        n++; k++;
      });
      box.setAttribute("role", "img");
      box.setAttribute("aria-label", `${linha.quem}, selo ${selo}: ${partes.join(", ")}`);
      td.appendChild(box);
      tr.appendChild(td);
    });
    corpo.appendChild(tr);
  });
}
desenhaQuadro("B2", true, false);
document.querySelectorAll(".alternador button").forEach((b) => {
  b.addEventListener("click", () => {
    if (b.getAttribute("aria-pressed") === "true") return;
    document.querySelectorAll(".alternador button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    desenhaQuadro(b.dataset.momento, true, true);
  });
});

// Coincidência com o oficial
const grafC = document.getElementById("graf-coincidencia");
COINCIDENCIA.forEach((d) => {
  if (d.grupo) {
    const g = document.createElement("p");
    g.className = "barra-grupo";
    g.textContent = d.grupo;
    grafC.appendChild(g);
    return;
  }
  const pct = (d.acertos / d.total) * 100;
  const row = document.createElement("div");
  row.className = `barra${d.antes ? " antes" : ""}`;
  row.innerHTML = `<span class="barra-rotulo">${d.rotulo}</span><span class="barra-trilho"><span class="barra-cheia" style="width:${pct}%"></span></span><span class="barra-valor">${d.acertos} de ${d.total}</span>`;
  grafC.appendChild(row);
});

// Custo
const grafCusto = document.getElementById("graf-custo");
const maximo = Math.max(...CUSTO.map((c) => c.porCadeia));
CUSTO.forEach((c) => {
  const el = document.createElement("div");
  el.className = "custo";
  el.innerHTML = `
    <div class="custo-coluna" aria-hidden="true"><div class="custo-barra" style="height:${(c.porCadeia / maximo) * 100}%"></div></div>
    <p class="custo-dolar">US$ ${fmt(c.porCadeia)}</p>
    <p class="custo-nome">${c.nome}</p>
    <p class="custo-detalhe">por cadeia; US$ ${fmt(c.total)} nas três. ${fmt(c.minutos, 1)} min e ${c.saida} mil tokens de saída por cadeia.</p>`;
  grafCusto.appendChild(el);
});

// Linha do tempo
const lista = document.getElementById("linha-lista");
LINHA.forEach((l) => {
  const li = document.createElement("li");
  li.innerHTML = `
    <p class="linha-data">${l.data}<small>${l.tema}</small></p>
    <div class="linha-col"><p class="rot">Entregue</p><p>${l.entregue}</p></div>
    <div class="linha-col"><p class="rot">Combinado para a próxima</p><p>${l.combinado}</p></div>`;
  lista.appendChild(li);
});

// Rodar uma cadeia: anima as etapas só quando a pessoa pede.
const NOTAS = {
  A: "A: a LLM lê o artigo, o código e as instruções oficiais e decide F e R sem executar nada.",
  B1: "B1: ela escreve o roteiro que vai seguir, com comando, resultado esperado e critério de falha para cada passo.",
  E: "E: dentro do contêiner, instala as dependências, compila, monta imagens de teste e roda o Foremost-NG. Tudo vai para um registro factual.",
  B2: "B2: relê o próprio registro e decide de novo. É aqui que o veredito muda.",
};
const botao = document.getElementById("rodar");
const nota = document.getElementById("cadeia-nota");
const etapas = [...document.querySelectorAll("#etapas li")];
botao.addEventListener("click", () => {
  botao.disabled = true;
  etapas.forEach((e) => e.classList.remove("ativa", "feita"));
  const passo = menosMovimento ? 0 : 1600;
  etapas.forEach((e, i) => {
    setTimeout(() => {
      etapas.forEach((x, j) => { x.classList.toggle("ativa", j === i); x.classList.toggle("feita", j < i); });
      nota.textContent = NOTAS[e.dataset.etapa];
      if (i === etapas.length - 1) setTimeout(() => { botao.disabled = false; botao.textContent = "Rodar de novo"; }, passo);
    }, i * passo);
  });
});
