# 🔞 Antifelca

> Extensão para Chrome que confirma automaticamente modais e avisos de verificação de idade — para usuários maiores de 18 anos.

---

## O que é?

Sabe aquele pop-up chato que aparece em sites de bebida, tabaco ou conteúdo adulto perguntando se você tem mais de 18 anos? O **Antifelca** clica no "Sim" pra você, automaticamente, antes mesmo de você perceber que o modal apareceu.

---

## Como funciona

A extensão roda em segundo plano em todas as páginas e:

- Usa um `MutationObserver` para detectar modais e overlays em tempo real, inclusive em SPAs (React, Next.js, etc.)
- Identifica o contexto de verificação de idade por palavras-chave em **português, inglês e espanhol**
- Encontra o botão de confirmação e clica nele automaticamente
- Evita clicar em botões de negação ("Não", "Sair", "Exit")
- Exibe um **contador no hover do ícone** mostrando quantos modais foram dispensados na página atual e no total histórico

---

## Funcionalidades

- ✅ Detecção automática de age gates em tempo real
- ✅ Suporte multilíngue (PT / EN / ES)
- ✅ Contador por página e histórico total persistente
- ✅ Tooltip no hover do ícone com o placar atualizado
- ✅ Toggle para ativar/desativar sem remover a extensão
- ✅ Botão de scan manual para forçar uma varredura
- ✅ Botão para zerar o contador
- ✅ Badge verde no ícone com a contagem da aba atual

---

## Instalação (modo desenvolvedor)

Por enquanto a extensão não está publicada na Chrome Web Store. Para instalar manualmente:

1. Faça o download do repositório (botão **Code → Download ZIP**)
2. Descompacte o arquivo
3. Abra o Chrome e acesse `chrome://extensions/`
4. Ative o **Modo do desenvolvedor** (canto superior direito)
5. Clique em **"Carregar sem compactação"**
6. Selecione a pasta `antifelca-extension`

Pronto! O ícone aparecerá na barra de extensões do Chrome.

---

## Estrutura do projeto

```
antifelca-extension/
├── manifest.json      # Configuração da extensão (Manifest V3)
├── content.js         # Script principal: detecção e clique automático
├── background.js      # Service worker: contadores e tooltip
├── popup.html         # Interface do popup
├── popup.js           # Lógica do popup
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Aviso

Esta extensão foi criada para uso pessoal por pessoas **maiores de 18 anos**. O objetivo é apenas eliminar fricção desnecessária em sites que já exigem confirmação de idade por obrigação legal. Use com responsabilidade.

---

## Licença

MIT — faça o que quiser, mas não culpe a gente se você tomar um susto com o conteúdo do outro lado. 😄
