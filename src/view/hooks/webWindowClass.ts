export function webWindowClass(
  width: number,
  web: boolean,
  breakpoints: { medium: number; expanded: number; large: number },
) {
  if (!web || width < breakpoints.medium) return 'compact' as const;
  if (width < breakpoints.expanded) return 'medium' as const;
  if (width < breakpoints.large) return 'expanded' as const;
  return 'large' as const;
}
