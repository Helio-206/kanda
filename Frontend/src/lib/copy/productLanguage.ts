export const PRODUCT_NAME = 'KANDA';
export const PRODUCT_TAGLINE = 'Plataforma inteligente de gestão de ocorrências';
export const PRODUCT_SUBTITLE = 'Sistema de apoio à decisão baseado em análise automática';

export const VISION_FLOW = [
  { step: 'Registo', detail: 'Fotografia e localização.' },
  { step: 'Interpretação', detail: 'Categoria, risco e impacto.' },
  { step: 'Priorização', detail: 'KANDA Score.' },
  { step: 'Histórico', detail: 'Código único e linha temporal.' },
] as const;

export const INSTITUTIONAL = {
  reportTitle: 'Nova ocorrência',
  reportSubtitle:
    'Registe uma ocorrência com fotografia, localização e contexto. O KANDA estrutura a informação e calcula a prioridade automaticamente.',
  trackSubtitle:
    'Consulte o estado, histórico e análise de uma ocorrência registada no KANDA.',
  successSubtitle:
    'A ocorrência foi registada com sucesso. Guarde o código para acompanhar o histórico.',
} as const;
