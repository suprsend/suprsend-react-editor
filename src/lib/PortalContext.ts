import { createContext, useContext } from 'react';

export const PortalContext = createContext<HTMLElement | null>(null);

export function usePortalContainer() {
  return useContext(PortalContext);
}
