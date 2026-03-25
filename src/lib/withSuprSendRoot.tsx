import { useRef, useState, useEffect, type ComponentType } from 'react';
import { PortalContext } from '@/lib/PortalContext';
import { useTheme } from '@/lib/ThemeContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function withSuprSendRoot<P extends Record<string, any>>(
  Component: ComponentType<P>
) {
  const Wrapped = (props: P) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const [container, setContainer] = useState<HTMLElement | null>(null);
    const { resolvedTheme, overridesStyle } = useTheme();

    useEffect(() => {
      setContainer(rootRef.current);
    }, []);

    return (
      <div
        ref={rootRef}
        className={`suprsend-root${resolvedTheme === 'dark' ? ' dark' : ''}`}
        style={{ height: '100%', ...overridesStyle }}
      >
        <PortalContext.Provider value={container}>
          <Component {...props} />
        </PortalContext.Provider>
      </div>
    );
  };
  Wrapped.displayName = `withSuprSendRoot(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}
