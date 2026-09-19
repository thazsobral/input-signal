# input-signal ⚡

> **Bancada de Diagnóstico de Periféricos e Sinais de Entrada em Tempo Real**  
> Executada 100% no navegador, com latência zero (*raw hardware event loop*), privacidade total e sem necessidade de instalação de softwares ou drivers de terceiros.

---

## 📋 Visão Geral

O **input-signal** foi desenvolvido para diagnosticar com precisão milimétrica falhas mecânicas e elétricas em periféricos de entrada. É uma ferramenta essencial para gamers, desenvolvedores, técnicos de manutenção de hardware, entusiastas de teclados mecânicos e usuários que precisam emitir relatórios de garantia (**RMA**).

### 🎯 Problemas que a ferramenta diagnostica:
- **Chattering / Repique Elétrico:** Múltiplos acionamentos involuntários causados por lâminas oxidadas, solda fria ou bounce excessivo em switches mecânicos e botões de mouse (< 130 ms).
- **Perda Intermitente de Pressão (Drops):** Falso contato em teclas contínuas mantidas pressionadas (ex: solavancos ou cortes na barra de espaço ao correr em jogos).
- **Double-Click Fantasma no Mouse:** Falha no microswitch principal (Omron, Huano, Kailh, etc.) registrando cliques duplos instantâneos.
- **Ghosting e Key Rollover (NKRO):** Teste de saturação e limite de bloqueio de acionamento simultâneo de teclas.
- **Integridade de Sensores Auxiliares:** Teste de áudio (VU meter com decibéis em tempo real) e vídeo (webcam).

---

## 🛠️ Funcionalidades e Módulos da Bancada

### 1. Matriz de Teclado Vetorial (*Keyboard Matrix*)
- **Padrões Internacionais Suportados:**
  - `ABNT2` (Brasil com tecla `Ç` e `AltGr`)
  - `ANSI` (Padrão internacional / US)
  - `ISO-PT` (Portugal)
  - `AZERTY` (França / Bélgica)
  - `QWERTZ` (Alemanha / Europa Central)
- **Linha Completa de Funções (F1 a F24):** Interceptação estrita de eventos para impedir que o navegador execute ações nativas indesejadas (como recarregar com `F5`, abrir ajuda com `F1` ou abrir o DevTools com `F12`).
- **Detecção Inteligente de Teclado Numérico (Numpad):**
  - Identificação em tempo real de hardware com Numpad físico através dos códigos nativos `Numpad0`-`Numpad9`, `NumLock`, etc.
  - Alternador dinâmico entre **TKL (Tenkeyless)** e **100% Full-Size**.
- **Contadores Individuais de Acionamento:** Exibição da quantidade de cliques e do tempo exato de retenção em milissegundos por switch.

### 2. Bancada de Mouse Ergonômico
- **Mapeamento Completo de Botões:**
  - Botão Esquerdo (Primary Click)
  - Botão Direito (Secondary Click)
  - Botão Central / Scroll Click (Middle Button)
  - Botões Laterais (Forward / Backward - botões 4 e 5)
- **Medidor de CPS em Tempo Real:** Cálculo contínuo de cliques por segundo com histórico de pico máximo (*Peak CPS*).
- **Sensor de Scroll Bidirecional:** Identificação visual da rolagem para cima e para baixo com indicador de amplitude de passo (*delta*).
- **Área de Rastreamento de Arrastes:** Canvas interativo com teste contínuo de sustentação do clique durante o movimento.

### 3. Osciloscópio de Pressão & Análise de Chattering
- **Gráfico de Onda em Tempo Real (60 FPS via Canvas):** Renderiza o nível analógico e estabilidade de sustentação de pressão da Barra de Espaço e da última tecla acionada.
- **Detecção de Quedas Falso-Contato:** Identifica quedas abruptas de sinal enquanto a tecla permanece fisicamente acionada.
- **Web Worker em Segundo Plano:** Processamento paralelo de análise estatística de *bounce time* (tempo mínimo e tempo médio de recuperação do switch).

### 4. Scanner de Periféricos & Controladores
- **Suporte à WebHID API:** Identificação nominal precisa do modelo de teclados e mouses USB ou Bluetooth autorizados (ex: *Keychron*, *Razer*, *Logitech*), exibindo *Vendor ID (VID)* e *Product ID (PID)*.
- **Identificação de Dispositivos de Mídia:** Botão com um toque para revelar nomes de fábrica de microfones, fones de ouvido e câmeras conectados via `MediaDevices`.
- **Gamepad API:** Detecção automática de controles, volantes e joysticks USB/Bluetooth conectados (ex: controles Xbox, PlayStation DualSense).

### 5. Registro de Eventos (*Event Log*) & Exportação
- **Log Stream de Alta Resolução:** Exibe cada evento de `keydown`, `keyup`, `mousedown`, `mouseup` e `wheel` com carimbo de tempo em precisão de microssegundos (`performance.now()`).
- **Exportação de Laudos:**
  - **Exportar JSON:** Estrutura completa de dados com contadores, anomalias e estatísticas para auditoria ou arquivamento.
  - **Exportar CSV:** Tabela formatada para abertura direta no Excel ou Google Sheets.

### 6. Recursos Adicionais de UX/UI
- **Alertas Sonoros Sintetizados:** Feedback sonoro imediato sintetizado via Web Audio API ao registrar chattering ou perda de pressão.
- **Temas Dark e Light:** Adaptação completa de contraste e paleta visual, com preferência salva localmente.
- **PWA / Modo Offline:** Pode ser instalado no sistema operacional e funciona 100% offline.

---

## 📖 Guia de Uso Rápido

### Testando se uma tecla está com Double-Click / Chattering
1. Abra a aplicação e selecione o layout do seu teclado (ex: `ABNT2`).
2. Pressione a tecla sob suspeita repetidamente de forma rápida.
3. Se o switch apresentar repique elétrico (< 130 ms entre ciclos de liberação e novo contato), a tecla ficará destacada em **vermelho**, emitirá um aviso sonoro (se ativado) e registrará o incidente no painel **Análise de Chattering**.

### Testando se a Barra de Espaço está falhando
1. Mantenha a **Barra de Espaço** pressionada continuamente.
2. Observe o **Monitor Contínuo de Pressão**: a linha deve permanecer contínua e estável no topo.
3. Se a linha oscilar ou cair para zero enquanto seu dedo continua pressionando a tecla, há perda de pressão mecânica ou falso contato.

### Identificando os Nomes dos Seus Periféricos
1. Clique em **Scanner de Periféricos & Controladores** para expandir o painel.
2. Para microfones/webcams: clique em **"Identificar Nomes Reais (Áudio/Vídeo)"** e autorize a leitura rápida efêmera.
3. Para teclados e mouses USB/Bluetooth: clique em **"Identificar Teclado/Mouse via WebHID"** e selecione o dispositivo na janela do navegador para visualizar modelo, VID e PID.

### Exportando Laudo Técnico para Garantia (RMA)
1. Realize os testes necessários para registrar as falhas.
2. No cabeçalho ou no painel **Registro de Eventos**, clique em **"Exportar Logs"**.
3. Selecione **JSON** (para dados completos estruturados) ou **CSV** (para planilha de conferência).

---

## 💻 Tecnologias Empregadas

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animações:** [Motion](https://motion.dev/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **APIs Nativas da Web:**
  - Raw Input Event Loop (`keydown`, `keyup`, `pointerdown`, `wheel`)
  - Web Workers (`diagnostics.worker.ts` para processamento paralelo de debounce)
  - Web Audio API (Sintetizador de alerta de anomalias e VU meter)
  - WebHID API & Gamepad API (Detecção de periféricos e hardware)
  - Canvas API (Osciloscópio de pressão a 60 FPS)
  - MediaDevices API (Câmera e microfone)
  - Progressive Web App (PWA via `vite-plugin-pwa`)

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior
- [npm](https://www.npmjs.com/) ou [bun](https://bun.sh/)

### Passo a passo
```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/input-signal.git

# 2. Acesse a pasta do projeto
cd input-signal

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Scripts Disponíveis
- `npm run dev`: Inicia o servidor Vite na porta 3000.
- `npm run build`: Gera o build de produção otimizado na pasta `dist/`.
- `npm run preview`: Visualiza o build de produção localmente.
- `npm run lint`: Executa a checagem de tipos estáticos do TypeScript (`tsc --noEmit`).

---

## 📄 Licença e Créditos

Desenvolvido por **ThazSobral**.

© 2026 ThazSobral. Todos os direitos reservados.
