export function formatarDataBR(data: Date): string {
  return data.toLocaleDateString("pt-BR");
}

export function formatarDataHoraBR(data: Date): string {
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function inicioDoDia(data?: string): Date {
  const d = data ? new Date(data) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function fimDoDia(data?: string): Date {
  const d = data ? new Date(data) : new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}