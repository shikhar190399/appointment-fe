type EnvConfig = {
  apiBaseUrl: string
}

const fallbackConfig: EnvConfig = {
  apiBaseUrl: 'http://localhost:8000',
}

export const getEnvConfig = (): EnvConfig => {
  return {
    apiBaseUrl: import.meta.env.VITE_API_URL ?? fallbackConfig.apiBaseUrl,
  }
}

