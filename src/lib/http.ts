import { getEnvConfig } from '@/config/env'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = Omit<RequestInit, 'method'> & {
  method?: HttpMethod
}

const { apiBaseUrl } = getEnvConfig()

const buildUrl = (endpoint: string) => {
  const base = apiBaseUrl.replace(/\/$/, '')
  const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${base}/${path}`
}

export const httpClient = async <TResponse>(
  endpoint: string,
  { method = 'GET', headers, ...requestOptions }: RequestOptions = {},
): Promise<TResponse> => {
  const response = await fetch(buildUrl(endpoint), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...requestOptions,
  })

  if (!response.ok) {
    const errorPayload = await response
      .json()
      .catch(() => ({ message: 'Unexpected error response' }))

    throw new Error(errorPayload?.message ?? 'Request failed')
  }

  if (response.status === 204) {
    return null as TResponse
  }

  return (await response.json()) as TResponse
}

