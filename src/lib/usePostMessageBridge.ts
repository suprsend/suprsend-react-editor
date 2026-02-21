import { useEffect, useRef, useCallback } from 'react';
import type { RefObject } from 'react';

type MessageHandler = (payload: unknown, event: MessageEvent) => void;
type HandlerMap = Record<string, MessageHandler[]>;

/**
 * Bidirectional, event-driven communication bridge for iframe ↔ parent.
 * Works in both contexts (parent or iframe).
 *
 * Example:
 *   const bridge = usePostMessageBridge(iframeRef);
 *   bridge.on("PING", (payload) => console.log(payload));
 *   bridge.post("PONG", { message: "Hi!" });
 */
export function usePostMessageBridge(
  iframeRef: RefObject<HTMLIFrameElement | null> | null,
  allowedOrigin = '*'
) {
  const handlers = useRef<HandlerMap>({});

  // Register an event handler
  const on = useCallback((type: string, handler: MessageHandler) => {
    if (!handlers.current[type]) handlers.current[type] = [];
    handlers.current[type].push(handler);
    return () => {
      handlers.current[type] = handlers.current[type].filter(
        (h) => h !== handler
      );
    };
  }, []);

  // Post a message
  const post = useCallback(
    (type: string, payload?: unknown) => {
      const message = { type, payload };
      if (iframeRef?.current?.contentWindow) {
        // Parent → Iframe
        iframeRef.current.contentWindow.postMessage(message, allowedOrigin);
      } else if (window.parent && window.parent !== window) {
        // Iframe → Parent
        window.parent.postMessage(message, allowedOrigin);
      } else {
        console.warn('usePostMessageBridge: No valid target for postMessage.');
      }
    },
    [iframeRef, allowedOrigin]
  );

  // Message listener (works in both parent and iframe)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (allowedOrigin !== '*' && event.origin !== allowedOrigin) return;
      const { type, payload } = (event.data || {}) as { type: string; payload: unknown };
      const registered = handlers.current[type];
      if (registered) registered.forEach((fn) => fn(payload, event));
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [allowedOrigin]);

  return { on, post };
}
