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

export function calcSEtaxReserve(weeklyIncome) {
  return weeklyIncome * 0.153 * 0.9
}

export function calcSafeToSpend({ availableCash, billsDueThisWeek, emergencyBufferTarget, currentBuffer, weeklyTaxReserve, volatilityScore }) {
  const bufferGap = Math.max(0, emergencyBufferTarget - currentBuffer)
  const volatilityCushion = availableCash * (volatilityScore / 1000)
  return availableCash - billsDueThisWeek - bufferGap - weeklyTaxReserve - volatilityCushion
}

export function getSafeToSpendState(safeAmount, survivalNumber, avgFlexible) {
  if (safeAmount > avgFlexible) return 'safe'
  if (safeAmount > 0) return 'warning'
  if (safeAmount > -survivalNumber) return 'risky'
  return 'danger'
}

export function calcBufferWeeks(currentBuffer, survivalNumber) {
  return currentBuffer / survivalNumber
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
