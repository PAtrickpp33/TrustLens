// Minimal ambient declaration to satisfy TS in build without installing @types
declare module 'papaparse' {
  export interface ParseResult<T> {
    data: T[];
    errors: Array<{ type: string; code: string; message: string; row?: number }>;
    meta: Record<string, unknown>;
  }

  export interface ParseConfig<T> {
    download?: boolean;
    header?: boolean;
    dynamicTyping?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    complete?: (results: ParseResult<T>) => void;
    error?: (error: { message?: string }) => void;
  }

  export function parse<T = any>(input: string, config?: ParseConfig<T>): void;
  const Papa: { parse: typeof parse };
  export default Papa;
}


