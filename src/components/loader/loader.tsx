import './loader.scss'

type LoaderProps = {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullscreen?: boolean
}

const sizeClass: Record<NonNullable<LoaderProps['size']>, string> = {
  sm: 'loader__spinner--sm',
  md: 'loader__spinner--md',
  lg: 'loader__spinner--lg',
}

export const Loader = ({ message = 'Loading…', size = 'md', fullscreen = false }: LoaderProps) => {
  return (
    <div className={`loader ${fullscreen ? 'loader--fullscreen' : ''}`}>
      <div className={`spinner-border text-primary loader__spinner ${sizeClass[size]}`} role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      {message && <span className="loader__message">{message}</span>}
    </div>
  )
}

