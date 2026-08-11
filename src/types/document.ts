export type Language = 'hi' | 'en';

export interface ToolItem {
  id: string;
  titleHi: string;
  titleEn: string;
  descHi: string;
  descEn: string;
  icon: string;
  category: 'popular' | 'pdf' | 'ai' | 'utilities';
  badgeHi?: string;
  badgeEn?: string;
}