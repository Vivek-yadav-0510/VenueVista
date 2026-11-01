export const CATEGORIES = ['Concert', 'Comedy', 'Theatre', 'Festival', 'Sports', 'Conference'];
const HUES: Record<string, string> = { Concert: '#3B3A8F', Comedy: '#B8862B', Theatre: '#8E1230', Festival: '#1D6E8C', Sports: '#1F7A4D', Conference: '#4B4F6B' };
export const catColor = (c: string) => HUES[c] ?? '#3A3768';
