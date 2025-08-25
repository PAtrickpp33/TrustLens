export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) || (typeof __API_BASE_URL__ !== 'undefined' ? __API_BASE_URL__ : ''),
};

declare global {
  const __API_BASE_URL__: string | undefined;
}


