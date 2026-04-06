# Mapa Rapido Do Projeto

## Raiz
| Arquivo | O que e / o que faz |
| --- | --- |
| `package.json` | Define dependencias, scripts e metadados principais do projeto. |
| `package-lock.json` | Trava as versoes instaladas das dependencias do npm. |
| `index.html` | HTML base onde o app React e montado pelo Vite. |
| `vite.config.ts` | Configura o Vite para desenvolvimento e build do frontend. |
| `tsconfig.json` | Configura o TypeScript do codigo principal em `src`. |
| `tsconfig.node.json` | Configura o TypeScript para arquivos de ambiente Node, como o Vite. |
| `tailwind.config.js` | Define o escopo e extensoes do Tailwind CSS. |
| `postcss.config.js` | Liga o Tailwind e o Autoprefixer no pipeline de CSS. |
| `.gitignore` | Lista arquivos e pastas que nao devem entrar no Git. |

## `src`
| Arquivo | O que e / o que faz |
| --- | --- |
| `src/main.tsx` | Inicia a aplicacao React e renderiza o `App` no DOM. |
| `src/App.tsx` | Controla o estado principal e alterna entre home, detalhe e carrinho. |
| `src/index.css` | Guarda os estilos globais, fundo, tipografia e ajustes gerais da interface. |

## `src/components`
| Arquivo | O que e / o que faz |
| --- | --- |
| `src/components/BrandHeader.tsx` | Renderiza o cabecalho com a marca centralizada e o botao do carrinho. |
| `src/components/HomePage.tsx` | Mostra a pagina inicial com o destaque do sorteio e o resumo rapido. |
| `src/components/RaffleDetailPage.tsx` | Mostra o sorteio aberto com a grade de numeros e o resumo da compra. |
| `src/components/CartPage.tsx` | Mostra o carrinho e o fechamento do pedido pelo WhatsApp. |
| `src/components/KitVisual.tsx` | Exibe a vitrine visual do kit sorteado em formato de destaque. |
| `src/components/Icons.tsx` | Centraliza os icones SVG reutilizados na interface. |

## `src/data`
| Arquivo | O que e / o que faz |
| --- | --- |
| `src/data/raffle.ts` | Guarda os dados fixos do sorteio atual e constantes globais do fluxo. |

## `src/types`
| Arquivo | O que e / o que faz |
| --- | --- |
| `src/types/raffle.ts` | Define os tipos TypeScript usados no dominio do sorteio e do carrinho. |

## `src/utils`
| Arquivo | O que e / o que faz |
| --- | --- |
| `src/utils/formatters.ts` | Reune formatadores de moeda, contagem e numero exibido na cartela. |
| `src/utils/raffle.ts` | Reune regras de negocio da cartela, disponibilidade e combinacao de numeros. |
| `src/utils/whatsapp.ts` | Monta o link de WhatsApp com a mensagem da compra. |
