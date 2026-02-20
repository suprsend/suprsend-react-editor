import { createContext, useContext } from 'react';
import type { TemplateEditorContextValue } from '@/types';

export const TemplateEditorContext =
  createContext<TemplateEditorContextValue | null>(null);

export function useTemplateEditorContext(): TemplateEditorContextValue {
  const context = useContext(TemplateEditorContext);
  if (!context) {
    throw new Error(
      'useTemplateEditorContext must be used within a SuprSendTemplateEditorProvider'
    );
  }
  return context;
}
