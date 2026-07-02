// Демо-данные свёрнутой сетки (сверено с Figma 2813:69546). count — число ячеек в стопке;
// ячейки рендерятся серой заливкой (Background/Secondary), без реальных фото.
export interface DocItem {
  id: string;
  title: string;
  count: number;
}

export const documents: DocItem[] = [
  { id: 'passport-1', title: 'Паспорт', count: 2 },
  { id: 'snils', title: 'СНИЛС', count: 12 },
  { id: 'birth', title: 'Свидетельство о рождении', count: 3 },
  { id: 'inn', title: 'ИНН', count: 1 },
  { id: 'passport-2', title: 'Паспорт', count: 2 },
];
