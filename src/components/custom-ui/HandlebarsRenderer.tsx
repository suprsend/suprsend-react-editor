import { useMemo } from 'react';
import Handlebars from 'handlebars';

export interface RenderHandlebarsOptions {
  compileOptions?: CompileOptions;
  runtimeOptions?: Handlebars.RuntimeOptions;
  onCompileError?: (error: unknown) => void;
  onRenderError?: (error: unknown) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export function renderHandlebars(
  template: string,
  data: Record<string, unknown>,
  options?: RenderHandlebarsOptions
): string {
  const { compileOptions, runtimeOptions, onCompileError, onRenderError } = options ?? {};
  let compiled: Handlebars.TemplateDelegate;
  try {
    compiled = Handlebars.compile(template, compileOptions);
  } catch (error) {
    onCompileError?.(error);
    return template;
  }
  try {
    return compiled(data, runtimeOptions);
  } catch (error) {
    onRenderError?.(error);
    return template;
  }
}

interface HandlebarsRendererProps {
  template: string;
  data: Record<string, unknown>;
  options?: RenderHandlebarsOptions;
  className?: string;
}

export default function HandlebarsRenderer({
  template,
  data,
  options,
  className,
}: HandlebarsRendererProps) {
  const rendered = useMemo(
    () => renderHandlebars(template, data, options),
    [template, data, options]
  );

  return <p className={className}>{rendered}</p>;
}
