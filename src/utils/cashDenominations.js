export const toNonNegativeInt = (val) => {
  const num = Number(val)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, Math.trunc(num))
}

export const toNonNegativeFloat = (val) => {
  const num = Number(val)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, num)
}

export const normalizeDenominations = (entry = {}) => ({
  bill_500: toNonNegativeInt(entry?.bill_500),
  bill_200: toNonNegativeInt(entry?.bill_200),
  bill_100: toNonNegativeInt(entry?.bill_100),
  bill_50: toNonNegativeInt(entry?.bill_50),
  bill_20: toNonNegativeInt(entry?.bill_20),
  coins: toNonNegativeFloat(entry?.coins)
})

export const getDenomBreakdown = (entry = {}) => {
  const normalized = normalizeDenominations(entry)

  const hasBreakdown =
    normalized.bill_500 > 0 ||
    normalized.bill_200 > 0 ||
    normalized.bill_100 > 0 ||
    normalized.bill_50 > 0 ||
    normalized.bill_20 > 0 ||
    normalized.coins > 0

  const total =
    normalized.bill_500 * 500 +
    normalized.bill_200 * 200 +
    normalized.bill_100 * 100 +
    normalized.bill_50 * 50 +
    normalized.bill_20 * 20 +
    normalized.coins

  return {
    ...normalized,
    hasBreakdown,
    total
  }
}
