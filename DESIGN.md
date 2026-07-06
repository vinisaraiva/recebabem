---
name: RecebaBem
description: Treinamento prático de inglês gamificado para hotelaria
colors:
  brand-blue: "#1565C0"
  brand-blue-dark: "#0D47A1"
  brand-green: "#00897B"
  brand-green-dark: "#00695C"
  brand-sand: "#FDF6E3"
  neutral-text: "#111827"
typography:
  display:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "'Inter', system-ui, sans-serif"
    fontWeight: 400
rounded:
  xl: "16px"
  2xl: "20px"
spacing:
  md: "16px"
  lg: "24px"
components:
  btn-primary:
    backgroundColor: "{colors.brand-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
  btn-primary-hover:
    backgroundColor: "{colors.brand-blue-dark}"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.2xl}"
    padding: "{spacing.md}"
---

# Design System: RecebaBem

## 1. Overview

**Creative North Star: "O Guia Confiável à Beira-Mar"**

O design do RecebaBem equilibra o rigor e a clareza de um software tradicional (necessário para gestores) com a receptividade calorosa e envolvente do turismo baiano (para os colaboradores). A interface transpira confiança sem ser rígida, e gamificação sem ser infantil. O fundo em tom de areia (`brand-sand`) oferece conforto visual contínuo, enquanto os azuis e verdes pontuam interações com nitidez. A prioridade é a clareza de foco: o colaborador sempre sabe qual é a próxima missão, e o gerente sempre vê a métrica vital.

**Key Characteristics:**
- Fundo quente e convidativo (`brand-sand`) no lugar de um branco hospitalar.
- Acentos vivos (Azul e Verde) usados com precisão em botões primários e gamificação.
- Formas acolhedoras com cantos arredondados generosos (`16px` a `20px`).
- Feedback imediato e tátil (animações curtas tipo `bounce-in`).

## 2. Colors

A paleta evoca o frescor do litoral (azuis da água e verdes da vegetação nativa) sobre uma base contínua de areia clara.

### Primary
- **Corporate Blue** (#1565C0): Usado para ações primárias do sistema, botões principais e elementos de foco do painel gerencial. Passa confiança e seriedade.
- **Ocean Blue Dark** (#0D47A1): Estado de hover/foco para ações primárias.

### Secondary
- **Gamified Green** (#00897B): A cor da vitória, da conclusão de tarefas e do progresso nas trilhas. Usada em barras de progresso, botões secundários positivos e recompensas.
- **Deep Green** (#00695C): Hover para as ações verdes e contraste em fundos claros.

### Neutral
- **Coastal Sand** (#FDF6E3): A cor de fundo global. Remove a frieza do SaaS padrão, entregando conforto visual para quem usa o sistema por longos períodos.
- **Ink Gray** (#111827): Texto principal. Maior contraste e legibilidade, garantindo que o design permaneça utilitário.

### Named Rules
**The Warm Contrast Rule.** Não use o Coastal Sand como background de elementos interativos (cards/inputs). O Coastal Sand é o fundo global; os cards devem ser puramente brancos para que saltem naturalmente através da sombra sutil, criando profundidade.

## 3. Typography

**Display Font:** Inter (with system-ui, sans-serif)
**Body Font:** Inter (with system-ui, sans-serif)

**Character:** A Inter oferece uma leitura sem atritos, com neutralidade suíça. Ao usá-la em toda a plataforma, garantimos que o sistema se comporte de forma robusta e altamente legível em qualquer dispositivo móvel antigo ou monitor grande.

### Hierarchy
- **Display** (700, 2rem+): Cabeçalhos de dashboards, saudações diárias, ou níveis grandes nas trilhas.
- **Headline** (600, 1.5rem): Títulos de seções ou cards principais.
- **Body** (400, 1rem, 1.5): Texto longo de aulas, instruções para colaboradores, e-mails. Limitar a 75 caracteres de largura.
- **Label** (600, 0.875rem, +0.02em): Identificadores de UI, campos de form, tags e badges gamificados (streaks).

### Named Rules
**The Legibility Floor Rule.** Texto secundário nunca deve descer abaixo da taxa de contraste WCAG 4.5:1. O foco é em colaboradores lendo no meio da correria do hotel; a leitura tem que ser fácil a um braço de distância.

## 4. Elevation

O sistema utiliza sombreamento direcional leve. A profundidade não é dramática; ela apenas destaca o que é interativo ou agrupa informações (cards). O fundo areia faz a transição entre o card branco e a base ser mais notável.

### Shadow Vocabulary
- **Resting Shadow** (`box-shadow: 0 1px 3px rgba(0,0,0,.08)`): Padrão para cards e inputs.
- **Hover/Float Shadow** (`box-shadow: 0 4px 12px rgba(0,0,0,.12)`): Quando cards se tornam interativos ou em botões em hover.
- **Modal/Popover Shadow** (`box-shadow: 0 8px 24px rgba(0,0,0,.16)`): Exclusivo para menus suspensos e modais.

### Named Rules
**The Grounded Card Rule.** Elementos de conteúdo usam a sombra mais sutil disponível (`shadow-sm`). Reservamos a `shadow-lg` exclusivamente para elementos que fisicamente "sobrepõem" a interface, como modais ou menus dropdown.

## 5. Components

### Buttons
- **Shape:** Arredondados e modernos (16px, `.rounded-xl`).
- **Primary:** Azul corporativo (`bg-brand-blue`) com texto branco e padding generoso (px-6 py-3). Passa autoridade.
- **Hover / Focus:** Escurecem (`bg-brand-blue-dark`) e possuem um micro-interação de clique (`active:scale-95`).
- **Secondary:** O verde gamificado (`bg-brand-green`) para avançar aulas ou finalizar missões.

### Cards / Containers
- **Corner Style:** Extremamente acolhedores (20px, `.rounded-2xl`).
- **Background:** Branco puro (`bg-white`) sobre o fundo areia global.
- **Shadow Strategy:** Sombra baixa (`shadow-sm`) com borda hiper-suave (`border-gray-100`) para separar do fundo sem peso.
- **Internal Padding:** 16px a 24px (`p-4` a `p-6`).

### Inputs / Fields
- **Style:** Fundo branco, contorno cinza suave, muito redondos (`rounded-xl`, `py-3`).
- **Focus:** Foco marcante e claro com anel azul (`focus:ring-2 focus:ring-brand-blue`). Acessibilidade em primeiro lugar.

### Badges / Streaks
- **Style:** Elementos da gamificação utilizam fundos alaranjados claros (`bg-orange-100`) com texto escuro e vibrante (`text-orange-700`). Cantos totalmente arredondados (`rounded-full`).

## 6. Do's and Don'ts

As diretrizes visuais para honrar o direcionamento de `PRODUCT.md`.

### Do:
- **Do** manter as animações de entrada e finalização de aula rápidas (bounce-in de 0.3s). Elas encorajam, mas não perdem tempo.
- **Do** usar branco puro para cards sobre o fundo Coastal Sand, garantindo a separação e hierarquia.
- **Do** utilizar a cor verde (`brand-green`) para sucessos e recompensas nas trilhas; o usuário de hotelaria reage visualmente a cores de "sinal verde".

### Don't:
- **Don't** criar o visual de um sistema de contabilidade dos anos 90 (não use layouts em blocos apertados, tabelas cinzas sem respiro ou letras pequenas coladas).
- **Don't** aplicar cores neon ou excesso de arco-íris, nem sombras gigantes, simulando um "jogo de criança". A gamificação é na estrutura de recompensas, não na poluição da tela.
- **Don't** usar o padrão SaaS corporativo genérico (fundo cinza frio `#f9fafb` com azul padrão e cantos pontiagudos). O fundo areia e os cantos `2xl` existem exatamente para quebrar essa expectativa.
