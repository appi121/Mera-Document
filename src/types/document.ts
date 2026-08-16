export type Language = 'hi' | 'en';

export interface ToolItem {
  id: string;
  titleHi: string;
  titleEn: string;
  descHi: string;
  descEn: string;
  icon: string;
  category: 'popular' | 'pdf' | 'organize' | 'convert-to-pdf' | 'convert-from-pdf' | 'security' | 'ai' | 'utilities';
  badgeHi?: string;
  badgeEn?: string;
  keywords?: string;
  badgeColor?: string;
}