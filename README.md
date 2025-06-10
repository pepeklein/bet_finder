<img width="467" alt="Captura de Tela 2025-06-09 às 18 52 49" src="https://github.com/user-attachments/assets/0fbcc963-17e2-4bce-8857-e49bf752682a" />

# BetFinder

**BetFinder** é um agregador de notícias sobre apostas, focado no mercado brasileiro. Ele automatiza a busca por notícias relevantes em portais especializados, aplicando filtros por palavras-chave e exibindo os resultados em uma interface desktop simples.

## Visão Geral

- Busca notícias nos principais sites do setor de apostas no Brasil.
- Permite filtrar notícias por palavras-chave.
- Exibe título, data (se disponível), link e pontuação de relevância.
- Interface desktop (Electron) fácil de usar.
- Possibilidade de exportar resultados (futuro).

## Funcionalidades

- Busca manual de notícias nos sites:
  - [BNLData](https://bnldata.com.br/)
  - [iGamingBrazil](https://igamingbrazil.com/)
  - [GamesBras](https://www.gamesbras.com/)
  - [GovFazenda](https://www.gov.br/fazenda/pt-br/composicao/orgaos/secretaria-de-premios-e-apostas)
- Filtragem por palavras-chave (configuráveis em [`src/keywords.json`](bet_finder/src/keywords.json))
- Exibição do número total de notícias e das filtradas por relevância.
- Interface amigável, com botão para buscar notícias e visualização dos resultados.
- Pontuação de relevância baseada no número de palavras-chave encontradas.

## Requisitos

- Node.js 20+
- npm (Node Package Manager)
- Ambiente Windows 10+ (para uso final) ou macOS (para desenvolvimento)

## Instalação

1. **Clone o repositório:**

   ```sh
   git clone <url-do-repositorio>
   cd bet_finder
   ```

2. **Instale as dependências:**

   ```sh
   npm install
   ```

3. **Execute o aplicativo em modo desenvolvimento:**

   ```sh
   npm start
   ```

4. **Para gerar o executável (Windows):**
   ```sh
   npm run dist
   ```
   O instalador será gerado na pasta `dist/`.

## Estrutura dos Arquivos

```
bet_finder/
  package.json
  src/
    keywords.json         # Lista de palavras-chave para filtragem
    main.js               # Processo principal Electron
    preload.js            # Script preload para IPC seguro
    relevance.js          # Lógica de pontuação por relevância
    renderer/
      index.html          # Interface HTML principal
      renderer.js         # Lógica de renderização e interação
      style.css           # Estilos da interface
      icon.png            # Ícone do app
    scraper/
      bnldata.js          # Scraper do site BNLData
      gamebras.js         # Scraper do site GamesBras
      govfazenda.js       # Scraper do site GovFazenda
      igamingbrazil.js    # Scraper do site iGamingBrazil
```

## Dependências

- [axios](https://www.npmjs.com/package/axios) — Requisições HTTP
- [cheerio](https://www.npmjs.com/package/cheerio) — Parsing de HTML (scraping)
- [electron](https://www.npmjs.com/package/electron) — Aplicativo desktop
- [electron-builder](https://www.npmjs.com/package/electron-builder) — Empacotamento para distribuição

## Como funciona

1. O usuário clica em "Buscar Notícias".
2. O app coleta notícias dos sites configurados.
3. Cada notícia recebe uma pontuação de relevância baseada nas palavras-chave.
4. Apenas notícias com score ≥ 1 são exibidas.
5. O usuário pode visualizar título, data, link e score de cada notícia.

## Personalização

- **Palavras-chave:** Edite o arquivo [`src/keywords.json`](bet_finder/src/keywords.json) para adicionar ou remover termos relevantes.
- **Visual:** Modifique [`src/renderer/style.css`](bet_finder/src/renderer/style.css) para alterar o tema.

## Roadmap (Próximos Passos)

- Exportação dos resultados em `.csv` ou `.txt`
- Filtros por data (ex: últimas 24h)
- Agendamento automático de buscas
- Histórico de buscas anteriores
- Notificações locais

---

Desenvolvido para facilitar o acompanhamento do setor de apostas no Brasil, para uma advogada da área.
