export function injectTheme(variables: Record<string, string>): void {
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    if (!key) return;
    const cssKey = key.startsWith('--') ? key : `--${key}`;
    root.style.setProperty(cssKey, value);
  });
}
