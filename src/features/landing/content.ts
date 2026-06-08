/**
 * Conteúdo centralizado da landing page KANDA.
 * Edite aqui para alterar textos sem procurar em múltiplos componentes.
 */

export const heroContent = {
  overline: 'GESTÃO INTELIGENTE DE OCORRÊNCIAS',
  headline: 'Da fotografia à decisão operacional.',
  subtitle: [
    'O KANDA transforma registos de campo em ocorrências qualificadas, com classificação automática, localização, nível de risco, prioridade e responsável sugerido.',
    'Uma experiência simples para cidadãos e uma base de decisão mais clara para equipas operacionais.',
  ],
  ctaPrimary: 'Criar ocorrência',
  ctaSecondary: 'Ver plataforma',
} as const;

export const automatedAnalysisContent = {
  overline: 'ANÁLISE AUTOMÁTICA',
  title: 'Triagem mais rápida, decisões mais consistentes.',
  description:
    'A camada inteligente do KANDA estrutura cada ocorrência para reduzir ruído, acelerar a análise e orientar a resposta.',
  cards: [
    {
      title: 'Classificação automática',
      description: 'Identifica o tipo de problema a partir da fotografia submetida.',
    },
    {
      title: 'Avaliação de risco',
      description: 'Calcula gravidade, impacto e confiança para apoiar a priorização.',
    },
    {
      title: 'Georreferenciação',
      description: 'Associa cada ocorrência a uma localização clara para facilitar a intervenção.',
    },
    {
      title: 'Encaminhamento inteligente',
      description: 'Sugere o responsável adequado e a próxima ação operacional.',
    },
  ],
} as const;

export const beneficiosContent = {
  overline: 'VALOR DO PRODUTO',
  title: 'Uma operação mais clara para quem reporta e para quem resolve.',
  groups: [
    {
      title: 'Para os cidadãos',
      items: [
        'Registo simples através de fotografia.',
        'Código único para acompanhamento.',
        'Mais transparência sobre o estado da ocorrência.',
      ],
    },
    {
      title: 'Para equipas operacionais',
      items: [
        'Ocorrências já estruturadas.',
        'Menos tempo perdido na triagem manual.',
        'Prioridade baseada em risco, impacto e confiança.',
      ],
    },
    {
      title: 'Para gestores',
      items: [
        'Visibilidade sobre pontos críticos.',
        'Histórico organizado por ocorrência.',
        'Base de dados preparada para indicadores.',
      ],
    },
    {
      title: 'Para parceiros',
      items: [
        'Protótipo navegável e extensível.',
        'Arquitetura preparada para backend.',
        'Modelo aplicável a municípios, condomínios e serviços.',
      ],
    },
  ],
} as const;

export const visaoContent = {
  overline: 'VISÃO DO PRODUTO',
  title: 'Uma plataforma única para transformar sinais do terreno em ação.',
  paragraphs: [
    'O KANDA foi desenhado para instituições, operadores urbanos e equipas que precisam receber ocorrências com contexto suficiente para agir.',
    'O protótipo demonstra o fluxo essencial: registar, interpretar, priorizar, acompanhar e manter histórico.',
    'A evolução natural inclui autenticação, backend, integrações operacionais, relatórios e notificações multicanal.',
  ],
} as const;

export const finalCtaContent = {
  headline: 'Menos ruído na triagem. Mais clareza na resposta.',
  subtitle:
    'Explore o fluxo principal do KANDA e veja como uma ocorrência passa de fotografia a registo qualificado.',
  cta: 'Criar ocorrência',
} as const;

export const navLinks = [
  { label: 'Início', target: 'hero' },
  { label: 'Como Funciona', target: 'como-funciona' },
  { label: 'Análise', target: 'analysis' },
  { label: 'Benefícios', target: 'beneficios' },
] as const;
