export default function Logo({ size = 48 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue circle background */}
      <circle cx="50" cy="50" r="50" fill="#0D146B" />
      
      {/* Green dollar sign */}
      <text 
        x="50" 
        y="70" 
        fontFamily="Arial, sans-serif" 
        fontSize="60" 
        fontWeight="900" 
        textAnchor="middle" 
        fill="#00BF63"
      >
        $
      </text>
    </svg>
  )
}

