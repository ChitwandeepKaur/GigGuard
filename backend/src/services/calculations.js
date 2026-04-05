export function calcFloorIncome(worstWeek) {
  return worstWeek
}

export function calcAverageIncome(low, high) {
  return (low + high) / 2
}

export function calcVolatilityScore(low, high) {
  const avg = calcAverageIncome(low, high)
  return avg === 0 ? 0 : ((high - low) / avg) * 100
}

export function calcWeeklySurvivalNumber(nonNegotiableExpenses) {
  const total = Object.values(nonNegotiableExpenses).reduce((a, b) => a + b, 0)
  return total / 4.33
}

export function calcSafeToSpend({ availableCash, billsDueThisWeek, volatilityScore }) {
  const volatilityCushion = availableCash * (volatilityScore / 1000)
  return availableCash - billsDueThisWeek - volatilityCushion
}

export function getSafeToSpendState(safeAmount, survivalNumber, avgFlexible = 150) {
  if (safeAmount > avgFlexible) return 'safe' // Confidently safe (Teal)
  if (safeAmount > 0) return 'warning'         // Safe if income arrives (Amber)
  if (safeAmount > -survivalNumber) return 'risky' // Risky (Orange)
  return 'danger'                             // Overspending danger (Red)
}

export function calcBufferWeeks(currentBuffer, survivalNumber) {
  if (survivalNumber <= 0) return 3 // default to "protected" if no expenses
  return currentBuffer / survivalNumber
}

export function getBufferTier(weeks) {
  if (weeks < 1) return 'vulnerable'
  if (weeks < 3) return 'building'
  return 'protected'
}


export function calcWindfall(currentWeekIncome, goodWeekThreshold) {
  const excess = currentWeekIncome - goodWeekThreshold
  if (excess <= 0) return null
  return {
    excess,
    buffer: excess * 0.5,
    bills: excess * 0.2,
    essentials: excess * 0.2,
    flex: excess * 0.1
  }
}
