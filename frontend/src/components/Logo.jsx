export default function Logo({ size = 48 }) {
  return (
    <img 
      src="/logo.svg" 
      alt="SABU Logo" 
      width={size} 
      height={size}
      style={{ display: 'block' }}
    />
  )
}

