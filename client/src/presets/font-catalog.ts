export interface ApprovedFont {
  id: string;
  displayName: string;
  cssStack: string;
  description: string;
}

export const APPROVED_FONTS: ApprovedFont[] = [
  {
    id: 'umbraco-default',
    displayName: 'Umbraco default',
    cssStack: 'inherit',
    description: 'Native backoffice font stack',
  },
  {
    id: 'system-ui',
    displayName: 'System UI',
    cssStack: 'system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    description: 'Platform UI fonts',
  },
  {
    id: 'source-sans',
    displayName: 'Source Sans 3',
    cssStack: '"Source Sans 3", "Segoe UI", sans-serif',
    description: 'Approved open UI font',
  },
  {
    id: 'ibm-plex-sans',
    displayName: 'IBM Plex Sans',
    cssStack: '"IBM Plex Sans", "Segoe UI", sans-serif',
    description: 'Approved open UI font',
  },
  {
    id: 'atkinson-hyperlegible',
    displayName: 'Atkinson Hyperlegible',
    cssStack: '"Atkinson Hyperlegible", "Segoe UI", sans-serif',
    description: 'Legibility-oriented approved font',
  },
  {
    id: 'opendyslexic',
    displayName: 'OpenDyslexic',
    cssStack: 'OpenDyslexic, "Segoe UI", sans-serif',
    description: 'Approved dyslexia-friendly option; not a medical claim',
  },
  {
    id: 'georgia',
    displayName: 'Georgia',
    cssStack: 'Georgia, "Times New Roman", serif',
    description: 'Approved serif option',
  },
  {
    id: 'verdana',
    displayName: 'Verdana',
    cssStack: 'Verdana, Geneva, sans-serif',
    description: 'Approved high-x-height sans',
  },
];

export function isApprovedFont(id: string | undefined | null): boolean {
  return !!id && APPROVED_FONTS.some((f) => f.id === id);
}

export function resolveFontStack(id: string | undefined | null): string {
  return APPROVED_FONTS.find((f) => f.id === id)?.cssStack ?? APPROVED_FONTS[0].cssStack;
}
