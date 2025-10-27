// Utility functions for formatting

/**
 * Formats a number as currency with . as thousands separator and , as decimal separator
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount as string
 */
export function formatPrice(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0,00'
  }

  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  // Format with 2 decimal places
  const fixed = numAmount.toFixed(2)

  // Split into integer and decimal parts
  const parts = fixed.split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]

  // Add thousands separator
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${formattedInteger},${decimalPart}`
}

