// src/namespaces/consulta/consulta.events.ts
export const EVENTOS_CONSULTA = {
  STATUS: 'rastrear:status',
} as const;

export const salaConsulta = (id: string) => `consulta:${id}`;