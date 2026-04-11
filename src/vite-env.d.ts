/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_JSONNET_API_BASE_URL: string;
  readonly VITE_DESIGNER_EDITOR_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'markdown-it-task-lists';

declare module '*.svg?react' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default ReactComponent;
}
