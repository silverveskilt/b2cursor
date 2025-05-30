type PredefinedIDE = 'cursor' | 'vscode';

interface J2SConfig {
  projectDir: string;
  enabled?: boolean;
  /**
   * Resolver function to generate the IDE URL. 'vscode' and 'cursor' are supported shorthands.
   * @param filePath The absolute file path
   * @returns The IDE URL to open
   */
  resolver: ((filePath: string) => string) | PredefinedIDE;
}

const predefinedResolvers: Record<PredefinedIDE, (filePath: string) => string> = {
  cursor: (filePath: string) => `cursor://file//${filePath}`,
  vscode: (filePath: string) => `vscode://file/${filePath}`
};

/**
 * Hook that enables browser-to-cursor navigation
 * @param config Configuration object
 * @param config.projectDir Absolute path to the project root directory
 * @param config.enabled Whether the feature is enabled (defaults to true in development)
 * @param config.resolver Resolver function to generate the IDE URL. 'vscode' and 'cursor' are supported shorthands.
 */
export function initJ2S(config: J2SConfig) {
  const { 
    projectDir, 
    resolver,
    enabled = process.env.NODE_ENV === 'development',
  } = config;

  const getResolver = (): (filePath: string) => string => {
    if (typeof resolver === 'function') {
      return resolver;
    }
    return predefinedResolvers[resolver];
  };

  if (!enabled || !projectDir || !resolver) return;

  const handleClick = (e: MouseEvent) => {
    if (e.metaKey) {
      e.preventDefault();
      const el = (e.target as HTMLElement).closest('[data-source]');
      if (el) {
        const fileInfo = el.getAttribute('data-source');
        if (fileInfo) {
          const filePath = `${projectDir}/src/${fileInfo}`;
          window.location.href = getResolver()(filePath);
        }
      }
    }
  };

  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
}

