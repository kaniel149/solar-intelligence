const PERFORMANCE_RATIO = 0.80
const DEFAULT_EPC_COST_PER_KWP = 32000     // THB/kWp
const DEFAULT_DISCOUNT_RATE = 0.08         // 8%
const DEFAULT_DEGRADATION_RATE = 0.005     // 0.5%/year
const DEFAULT_TARIFF_ESCALATION = 0.03     // 3%/year
const DEFAULT_SYSTEM_LIFE_YEARS = 25
const OM_COST_PCT = 0.01                   // 1% of EPC/year
const CO2_KG_PER_KWH = 0.5                // Thailand grid emission factor
const PANEL_WATT = 550
const PANEL_AREA_M2 = 2.0

// Monthly distribution factors for Thailand (relative to annual average)
// Higher in dry season (Nov–Apr), lower in wet season (May–Oct)
const MONTHLY_FACTORS = [
  1.05, // Jan
  1.10, // Feb
  1.12, // Mar
  1.08, // Apr
  0.95, // May
  0.88, // Jun
  0.87, // Jul
  0.88, // Aug
  0.90, // Sep
  0.93, // Oct
  0.98, // Nov
  1.02, // Dec
]

export interface FinancialAnalysis {
  // System
  capacityKwp: number
  panelCount: number
  annualKwhYear1: number

  // Costs
  epcCost: number
  annualOMCost: number

  // Revenue
  annualSavingsYear1: number
  monthlyRevenue: number[]   // 12 months (THB)
  monthlyKwh: number[]       // 12 months

  // Returns
  paybackYears: number
  roi25Year: number          // 25-year ROI %
  irr: number                // Internal Rate of Return %
  npv: number                // Net Present Value (THB)
  lcoe: number               // Levelized Cost of Energy (THB/kWh)

  // Lifetime
  lifetimeKwh: number        // 25 years with annual degradation
  lifetimeSavings: number    // With tariff escalation (THB)
  co2Avoided: number         // tons CO2 over 25 years
}

function calculateNPV(cashflows: number[], rate: number): number {
  return cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0)
}

function calculateIRR(cashflows: number[]): number {
  // Bisection method — reliable for typical solar cashflow patterns
  let lo = -0.5
  let hi = 2.0
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2
    const npv = calculateNPV(cashflows, mid)
    if (npv > 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export function calculateFinancials(params: {
  capacityKwp: number
  annualGHI: number          // kWh/m²/day from NASA POWER
  tariffRate: number         // THB/kWh
  epcCostPerKwp?: number
  discountRate?: number
  degradationRate?: number
  tariffEscalation?: number
  systemLifeYears?: number
}): FinancialAnalysis {
  const {
    capacityKwp,
    annualGHI,
    tariffRate,
    epcCostPerKwp = DEFAULT_EPC_COST_PER_KWP,
    discountRate = DEFAULT_DISCOUNT_RATE,
    degradationRate = DEFAULT_DEGRADATION_RATE,
    tariffEscalation = DEFAULT_TARIFF_ESCALATION,
    systemLifeYears = DEFAULT_SYSTEM_LIFE_YEARS,
  } = params

  // System sizing
  const panelCount = Math.round((capacityKwp * 1000) / PANEL_WATT)
  const epcCost = capacityKwp * epcCostPerKwp
  const annualOMCost = epcCost * OM_COST_PCT

  // Year 1 production
  const annualKwhYear1 = capacityKwp * annualGHI * 365 * PERFORMANCE_RATIO
  const annualSavingsYear1 = annualKwhYear1 * tariffRate

  // Monthly production based on NASA GHI distributed by monthly factors
  const factorSum = MONTHLY_FACTORS.reduce((a, b) => a + b, 0)
  const monthlyKwh = MONTHLY_FACTORS.map((f) => annualKwhYear1 * (f / factorSum))
  const monthlyRevenue = monthlyKwh.map((kwh) => kwh * tariffRate)

  // 25-year cashflow model
  const cashflows: number[] = [-epcCost] // t=0 investment
  let lifetimeKwh = 0
  let lifetimeSavings = 0

  for (let year = 1; year <= systemLifeYears; year++) {
    const degradationFactor = Math.pow(1 - degradationRate, year - 1)
    const tariffFactor = Math.pow(1 + tariffEscalation, year - 1)
    const yearlyKwh = annualKwhYear1 * degradationFactor
    const yearlySavings = yearlyKwh * tariffRate * tariffFactor
    const yearlyNetCashflow = yearlySavings - annualOMCost

    cashflows.push(yearlyNetCashflow)
    lifetimeKwh += yearlyKwh
    lifetimeSavings += yearlySavings
  }

  // Financial metrics
  const paybackYears = epcCost / (annualSavingsYear1 - annualOMCost)
  const npv = calculateNPV(cashflows, discountRate)
  const irr = calculateIRR(cashflows)

  // ROI over 25 years
  const totalRevenue = cashflows.slice(1).reduce((a, b) => a + b, 0)
  const roi25Year = ((totalRevenue - epcCost) / epcCost) * 100

  // LCOE: total discounted costs / total discounted energy
  const totalDiscountedCost = epcCost + cashflows.slice(1).map((_, i) =>
    annualOMCost / Math.pow(1 + discountRate, i + 1)
  ).reduce((a, b) => a + b, 0)
  const totalDiscountedKwh = Array.from({ length: systemLifeYears }, (_, i) => {
    const yearlyKwh = annualKwhYear1 * Math.pow(1 - degradationRate, i)
    return yearlyKwh / Math.pow(1 + discountRate, i + 1)
  }).reduce((a, b) => a + b, 0)
  const lcoe = totalDiscountedKwh > 0 ? totalDiscountedCost / totalDiscountedKwh : 0

  // CO2 avoided
  const co2Avoided = (lifetimeKwh * CO2_KG_PER_KWH) / 1000 // convert kg → tons

  return {
    capacityKwp,
    panelCount,
    annualKwhYear1,
    epcCost,
    annualOMCost,
    annualSavingsYear1,
    monthlyRevenue,
    monthlyKwh,
    paybackYears,
    roi25Year,
    irr,
    npv,
    lcoe,
    lifetimeKwh,
    lifetimeSavings,
    co2Avoided,
  }
}
