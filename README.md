# Mapa Rapido Do Projeto

## Raiz
| Arquivo | O que e / o que faz |
| --- | --- |
| `package.json` | Define dependencias, scripts e comandos de dev, build e testes. |
| `package-lock.json` | Trava as versoes instaladas das dependencias do npm. |
| `index.html` | HTML base onde o app React e montado pelo Vite. |
| `vite.config.ts` | Configura o Vite para desenvolvimento e build do frontend. |
| `tsconfig.json` | Configura o TypeScript do codigo principal em `src`. |
| `tsconfig.node.json` | Configura o TypeScript para arquivos de ambiente Node, como o Vite. |
| `tsconfig.test.json` | Configura a compilacao dos testes do backend. |
| `tailwind.config.js` | Define o escopo e extensoes do Tailwind CSS. |
| `postcss.config.js` | Liga o Tailwind e o Autoprefixer no pipeline de CSS. |
| `.gitignore` | Lista arquivos e pastas que nao devem entrar no Git. |

## `src`
| Arquivo | O que e / o que faz |
| --- | --- |
| `src/main.tsx` | Inicia a aplicacao React e renderiza o `App` no DOM. |
| `src/App.tsx` | Orquestra estado, navegacao, auth em memoria e integracao frontend/backend. |
| `src/index.css` | Guarda os estilos globais, fundo, tipografia e ajustes gerais da interface. |

## `src/backend`
| Arquivo | O que e / o que faz |
| --- | --- |
| `src/backend/domain.ts` | Define entidades e contratos do dominio de usuarios, sorteios e ganhadores. |
| `src/backend/database.ts` | Mantem o banco em memoria usado pelo MVP e pelos testes. |
| `src/backend/services.ts` | Reune regras de auth, administracao, participacao, estatisticas e ganhadores. |

## `src/components`
| Arquivo | O que e / o que faz |
| --- | --- |
| `src/components/BrandHeader.tsx` | Renderiza o cabecalho com a logo centralizada e o botao do carrinho. |
| `src/components/HomePage.tsx` | Mostra a pagina inicial com o destaque do sorteio e o resumo rapido. |
| `src/components/RaffleDetailPage.tsx` | Mostra o sorteio aberto com a grade de numeros e o resumo da compra. |
| `src/components/CartPage.tsx` | Mostra o carrinho e o fechamento do pedido pelo WhatsApp. |
| `src/components/AuthPanel.tsx` | Mostra cadastro, login, sessao ativa e logout. |
| `src/components/UserDashboard.tsx` | Mostra participacao do usuario e historico de resultados. |
| `src/components/AdminDashboard.tsx` | Mostra criacao, edicao, status, estatisticas, participantes e ganhadores. |
| `src/components/KitVisual.tsx` | Exibe a vitrine visual do kit sorteado em formato de destaque. |
| `src/components/Icons.tsx` | Centraliza os icones SVG reutilizados na interface. |

## `src/data`
| Arquivo | O que e / o que faz |
| --- | --- |
| `src/data/raffle.ts` | Guarda os dados fixos do sorteio visual atual e constantes globais do fluxo. |

## `src/types`
| Arquivo | O que e / o que faz |
| --- | --- |
| `src/types/raffle.ts` | Define os tipos TypeScript usados na vitrine do sorteio e no carrinho. |

## `src/utils`
| Arquivo | O que e / o que faz |
| --- | --- |
| `src/utils/formatters.ts` | Reune formatadores de moeda, contagem e numero exibido na cartela. |
| `src/utils/raffle.ts` | Reune regras da cartela visual, disponibilidade e combinacao de numeros. |
| `src/utils/whatsapp.ts` | Monta o link de WhatsApp com a mensagem da compra. |

## `supabase`
| Arquivo | O que e / o que faz |
| --- | --- |
| `supabase/schema.sql` | Define tabelas, enums, chaves, RLS e policies iniciais do banco Supabase. |

## `tests`
| Arquivo | O que e / o que faz |
| --- | --- |
| `tests/backend.test.ts` | Testa auth, sorteios, participantes, ganhadores, estatisticas e exclusao. |

## Lembrete De Seguranca
| Item | O que revisar antes de producao |
| --- | --- |
| RLS do Supabase | Manter ativo e revisar policies antes de liberar dados reais. |
| Variaveis `.env` | Nunca commitar chaves do Supabase, tokens ou `service_role`. |
| Admin | Criar whitelist segura para administradores em vez de credencial hardcoded. |
| Auditoria | Registrar acoes sensiveis do admin, como editar, fechar, concluir e excluir sorteios. |
