/**
 * @file renderer.js
 * @project BetFinder - Betting News Aggregator
 * @description
 *   Main renderer script for the BetFinder application. Handles UI rendering,
 *   user interactions, and communication with the betfinder API for fetching
 *   betting news from multiple sources. Provides logic for displaying loading
 *   states, rendering results, copying links, and navigation between screens.
 *
 * @author
 *   BetFinder Development Team
 * @copyright
 *   Copyright (c) 2025 BetFinder. All rights reserved.
 */

/**
 * Handles the click event for the "Buscar Notícias" button.
 * Fetches news from multiple sites using the betfinder API, displays a loading spinner,
 * and renders the results or an error message. Also sets up the "Voltar" (Back) button
 * to return to the initial screen.
 *
 * @async
 * @function
 * @returns {Promise<void>} Resolves when the news fetching and rendering is complete.
 */
document.getElementById("buscarBtn").onclick = async function () {
  const container = document.getElementById("container");
  container.innerHTML = `
    <div class="loading-area">
      <div class="spinner"></div>
      <div class="loading-text">Buscando notícias...</div>
    </div>
  `;

  let noticiasPorSite = [];
  try {
    noticiasPorSite = await window.betfinder.buscarNoticias();
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Erro ao buscar notícias: ${err.message}</p>`;
    return;
  }

  // Displays a success message with a green tick for 2 seconds
  container.innerHTML = `
    <div class="loading-area">
      <div style="font-size: 56px; color: #22c55e; margin-bottom: 18px;">&#10003;</div>
      <div class="loading-text" style="color: #22c55e;">Notícias encontradas!</div>
    </div>
  `;

  setTimeout(() => {
    renderNoticias(noticiasPorSite, container);
  }, 2000);
};

/**
 * Renders the news results for each site.
 * Displays site cards, news items, and action buttons for copying links and viewing summaries.
 *
 * @function
 * @param {Array} noticiasPorSite - Array of news results grouped by site.
 * @param {HTMLElement} container - The container element to render into.
 * @returns {void}
 */
function renderNoticias(noticiasPorSite, container) {
  // Back button and title
  let html = `
    <div class="top-bar">
      <button id="voltarBtn" class="voltar-btn" title="Voltar">
        <span class="seta-esquerda">&#8592;</span> Voltar
      </button>
      <h1 class="app-title">BetFinder</h1>
    </div>
  `;

  // Adds search date/time
  const agora = new Date();
  const dataFormatada = agora.toLocaleDateString("pt-BR");
  const horaFormatada = agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  html += `<div class="busca-info">Notícias encontradas em ${dataFormatada}, às ${horaFormatada}</div>`;

  for (const site of noticiasPorSite) {
    html += `
      <div class="site-card">
        <div class="site-title">${site.nome}</div>
        <div class="noticias-list">
          ${
            site.filtradas.length === 0
              ? '<div class="noticia">Nenhuma notícia encontrada.</div>'
              : site.filtradas
                  .map(
                    (n, idx) => `
    <div class="noticia" data-link="${n.link}" id="noticia-${site.nome}-${idx}">
      <input type="checkbox" class="noticia-checkbox" style="margin-right:8px;">
      ${n.data ? `<div class="noticia-data">${formatarData(n.data)}</div>` : ""}
      <a href="${n.link}" target="_blank">${n.titulo}</a>
      <div class="noticia-actions-central">
        <button class="btn-pequeno copiar-link-btn" title="Copiar link">Copiar Link</button>
        <button class="btn-pequeno ver-resumo-btn" title="Ver resumo" data-resumo="${encodeURIComponent(n.resumo || "")}">Ver Resumo</button>
        <button class="btn-pequeno copiar-multiplas-btn" style="display:none; float:right;">Copiar Selecionadas</button>
      </div>
    </div>
  `
                  )
                  .join("")
          }
        </div>
      </div>
    `;
  }

  // Final button, centered
  html += `
    <div style="width:100%;display:flex;justify-content:center;margin:32px 0 0 0;">
      <button id="copiarLinksBtn" class="btn-pequeno">Copiar todos os links</button>
    </div>
  `;

  // Global button for copying selected news (initially hidden)
  html += `
    <button id="copiarSelecionadasBtn" style="display:none;position:fixed;left:50%;bottom:32px;transform:translateX(-50%);z-index:10000;" class="btn-copiar-global">
      Copiar selecionadas
    </button>
  `;

  container.innerHTML = html;

  // Adds click events to news actions
  document.querySelectorAll(".noticia").forEach((el) => {
    // "Copy link" button
    const copiarBtn = el.querySelector(".copiar-link-btn");
    if (copiarBtn) {
      copiarBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const link = el.getAttribute("data-link");
        navigator.clipboard.writeText(link);
        alert("Link copiado!");
      };
    }

    // "View Summary" button
    const resumoBtn = el.querySelector(".ver-resumo-btn");
    if (resumoBtn) {
      resumoBtn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const resumo = decodeURIComponent(
          resumoBtn.getAttribute("data-resumo")
        );
        const titulo = el.querySelector("a").innerText;
        const link = el.getAttribute("data-link");
        exibirResumoModal(titulo, resumo, link);
      };
    }
  });

  /**
   * Handles the click event for the "Copiar todos os links" button.
   * Copies all filtered news links to the clipboard.
   *
   * @function
   * @returns {void}
   */
  document.getElementById("copiarLinksBtn").onclick = function () {
    const todosLinks = noticiasPorSite
      .flatMap((site) => site.filtradas.map((n) => n.link))
      .join("\n");
    if (todosLinks) {
      navigator.clipboard.writeText(todosLinks);
      alert("Links copiados para a área de transferência!");
    } else {
      alert("Nenhum link para copiar.");
    }
  };

  /**
   * Handles the click event for the "Voltar" button, rendering the initial screen.
   *
   * @function
   * @returns {void}
   */
  document.getElementById("voltarBtn").onclick = renderTelaInicial;

  // Updates the visibility of the "Copy Selected" button
  function atualizarBotoesCopiar() {
    document.querySelectorAll('.noticia').forEach(noticia => {
      const btn = noticia.querySelector('.copiar-multiplas-btn');
      const checkbox = noticia.querySelector('.noticia-checkbox');
      btn.style.display = checkbox.checked ? 'inline-block' : 'none';
    });
  }

  // Updates the visibility of the global copy button
  function atualizarBotaoGlobal() {
    const algumSelecionado = document.querySelectorAll('.noticia-checkbox:checked').length > 0;
    document.getElementById('copiarSelecionadasBtn').style.display = algumSelecionado ? 'block' : 'none';
  }

  // Event for each checkbox to update global copy button
  document.querySelectorAll('.noticia-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', atualizarBotaoGlobal);
  });

  // Event for copying selected news
  document.querySelectorAll('.copiar-multiplas-btn').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      e.preventDefault();
      // Gets all selected news
      const selecionadas = Array.from(document.querySelectorAll('.noticia-checkbox:checked')).map(cb => cb.closest('.noticia'));
      if (selecionadas.length === 0) return;
      const textos = selecionadas.map(noticia => {
        const titulo = noticia.querySelector('a').innerText;
        const resumoBtn = noticia.querySelector('.ver-resumo-btn');
        const resumo = resumoBtn ? decodeURIComponent(resumoBtn.getAttribute('data-resumo')) : '';
        const link = noticia.getAttribute('data-link');
        return `*${titulo}*\n${resumo}\nLink: ${link}`;
      });
      navigator.clipboard.writeText(textos.join('\n\n'));
      alert('Notícias copiadas para a área de transferência!');
    };
  });

  /**
   * Handles the click event for the "Copiar selecionadas" button.
   * Copies the links of all selected news items to the clipboard.
   *
   * @function
   * @returns {void}
   */
  document.getElementById("copiarSelecionadasBtn").onclick = function () {
    const selecionadas = Array.from(
      document.querySelectorAll(".noticia-checkbox:checked")
    ).map((cb) => cb.closest(".noticia"));

    if (selecionadas.length === 0) {
      alert("Nenhuma notícia selecionada.");
      return;
    }

    const textos = selecionadas.map((noticia) => {
      const titulo = noticia.querySelector("a").innerText;
      const resumoBtn = noticia.querySelector(".ver-resumo-btn");
      const resumo = resumoBtn ? decodeURIComponent(resumoBtn.getAttribute("data-resumo")) : "";
      const link = noticia.getAttribute("data-link");
      return `*${titulo}*\n${resumo}\nLink: ${link}`;
    });

    navigator.clipboard.writeText(textos.join('\n\n'));
    alert("Notícias copiadas para a área de transferência!");
  };
}

/**
 * Mock function for frontend testing.
 * Simulates fetching news from different sites, returning a static array of news data.
 *
 * @async
 * @function
 * @returns {Promise<Array<{nome: string, total: number, filtradas: Array<{titulo: string, link: string, data: string, score: number}>}>>}
 *   Resolves to an array of site news objects, each containing site name, total news, and filtered news list.
 */
async function buscarNoticiasMock() {
  return [
    {
      nome: "BNLData",
      total: 10,
      filtradas: [
        { titulo: "Notícia 1", link: "#", data: "2025-06-09", score: 2 },
        { titulo: "Notícia 2", link: "#", data: "2025-06-09", score: 1 },
      ],
    },
    {
      nome: "GamesBras",
      total: 10,
      filtradas: [
        { titulo: "Notícia 3", link: "#", data: "2025-06-09", score: 3 },
      ],
    },
  ];
}

/**
 * Renders the initial screen of the application.
 * Displays a welcome message and the "Buscar Notícias" button.
 * Sets up the button to trigger the news search handler.
 *
 * @function
 * @returns {void}
 */
function renderTelaInicial() {
  const container = document.getElementById("container");
  container.innerHTML = `
    <h1>Bem-vindo ao BetFinder!</h1>
    <p>
      Encontre rapidamente as principais notícias sobre apostas nos principais
      portais do Brasil.
    </p>
    <button id="buscarBtn">Buscar Notícias</button>
    <div id="resultados"></div>
  `;
  document.getElementById("buscarBtn").onclick = buscarNoticiasHandler;
}

/**
 * Handles the process of fetching and displaying news articles.
 * Shows a loading spinner, fetches news using the betfinder API, and renders results or errors.
 * Sets up the "Voltar" button to return to the initial screen.
 *
 * @async
 * @function
 * @returns {Promise<void>} Resolves when the news fetching and rendering is complete.
 */
async function buscarNoticiasHandler() {
  const container = document.getElementById("container");
  container.innerHTML = `
    <div class="loading-area">
      <div class="spinner"></div>
      <div class="loading-text">Buscando notícias...</div>
    </div>
  `;

  let noticiasPorSite = [];
  try {
    noticiasPorSite = await window.betfinder.buscarNoticias();
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Erro ao buscar notícias: ${err.message}</p>`;
    return;
  }

  // Displays a success message with a green tick for 2 seconds
  container.innerHTML = `
    <div class="loading-area">
      <div style="font-size: 56px; color: #22c55e; margin-bottom: 18px;">&#10003;</div>
      <div class="loading-text" style="color: #22c55e;">Notícias encontradas!</div>
    </div>
  `;

  setTimeout(() => {
    renderNoticias(noticiasPorSite, container);
  }, 2000);
}

/**
 * Initializes the application by rendering the initial screen when the script loads.
 *
 * @function
 * @returns {void}
 */
renderTelaInicial();

/**
 * Formats a date string to the format dd/mm/yy.
 * Accepts formats such as '2025-06-10', '2025-06-10 00:00', '06.10.25', etc.
 * If unable to convert, returns an empty string.
 *
 * @function
 * @param {string} data - The date string to format.
 * @returns {string} The formatted date string in dd/mm/yy format, or an empty string if invalid.
 */
function formatarData(data) {
  if (!data) return "";
  // Try common formats: yyyy-mm-dd or yyyy-mm-dd hh:mm
  let match = data.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1].slice(-2)}`;
  }
  // Try format dd.mm.yy or dd.mm.yyyy
  match = data.match(/^(\d{2})\.(\d{2})\.(\d{2,4})/);
  if (match) {
    const ano = match[3].length === 4 ? match[3].slice(-2) : match[3];
    return `${match[1]}/${match[2]}/${ano}`;
  }
  // Try format dd/mm/yy
  match = data.match(/^(\d{2})\/(\d{2})\/(\d{2,4})/);
  if (match) {
    const ano = match[3].length === 4 ? match[3].slice(-2) : match[3];
    return `${match[1]}/${match[2]}/${ano}`;
  }
  // If no match, return empty
  return "";
}

/**
 * Displays a modal with the news summary and action buttons.
 *
 * @function
 * @param {string} titulo - The title of the news article.
 * @param {string} resumo - The summary of the news article.
 * @param {string} link - The link to the news article.
 * @returns {void}
 */
function exibirResumoModal(titulo, resumo, link) {
  // Removes old modal if it exists
  const antigo = document.getElementById("modalResumo");
  if (antigo) antigo.remove();

  const modal = document.createElement("div");
  modal.id = "modalResumo";
  modal.innerHTML = `
    <div class="modal-resumo-bg"></div>
    <div class="modal-resumo-box">
      <div class="modal-resumo-header">
        <span class="modal-resumo-titulo">${titulo}</span>
        <button class="modal-resumo-fechar" title="Fechar">&times;</button>
      </div>
      <div class="modal-resumo-body">${resumo ? resumo.replace(/\n/g, "<br>") : "Resumo não disponível."}</div>
      <div class="modal-resumo-ver-materia">
        <button class="btn-copiar-materia">Copiar matéria</button>
        <a href="${link}" target="_blank" rel="noopener noreferrer" class="btn-pequeno btn-ver-materia">Ver matéria</a>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".modal-resumo-fechar").onclick = () => modal.remove();
  modal.querySelector(".modal-resumo-bg").onclick = () => modal.remove();

  // Copies the formatted title, summary, and link
  modal.querySelector(".btn-copiar-materia").onclick = () => {
    const texto = `*${titulo}*\n${resumo || ""}\nLink: ${link}`;
    navigator.clipboard.writeText(texto);
    alert("Matéria copiada para a área de transferência!");
  };
}
