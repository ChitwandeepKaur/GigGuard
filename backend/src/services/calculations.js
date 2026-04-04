export function calcFloorIncome(worstWeek) { return worstWeek }
export function calcAverageIncome(low, high) { return (low + high) / 2 }
export function calcVolatilityScore(low, high) {
  const avg = calcAverageIncome(low, high)
  return avg === 0 ? 0 : ((high - low) / avg) * 100
}
export function calcWeeklySurvivalNumber(nonNegotiableExpenses) { return 0 }
export function calcSEtaxReserve(weeklyIncome) { return weeklyIncome * 0.153 * 0.9 }
export function calcSafeToSpend(params) { return 0 }
export function getSafeToSpendState(safeAmount, survivalNumber, avgFlexible) { return 'safe' }
export function calcBufferWeeks(currentBuffer, survivalNumber) { return currentBuffer / survivalNumber }
export function calcWindfall(currentWeekIncome, goodWeekThreshold) { return null }
