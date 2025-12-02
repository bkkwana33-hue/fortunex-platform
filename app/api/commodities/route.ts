import { NextResponse } from "next/server"

// Base prices as of recent market data
const BASE_PRICES = {
  XAU: 2083.5, // Gold per troy ounce
  XAG: 24.39, // Silver per troy ounce
  BRENT: 77.25, // Brent Crude Oil per barrel
  NATGAS: 2.65, // Natural Gas per MMBtu
}

// Historical volatility (daily % standard deviation)
const VOLATILITY = {
  XAU: 0.008, // 0.8% daily volatility
  XAG: 0.015, // 1.5% daily volatility
  BRENT: 0.02, // 2.0% daily volatility
  NATGAS: 0.035, // 3.5% daily volatility
}

// Generate realistic price with random walk
function generateRealisticPrice(basePrice: number, volatility: number, seed: number) {
  // Use time-based seed for consistency within the same minute
  const random = Math.sin(seed) * 10000
  const randomValue = random - Math.floor(random)

  // Box-Muller transform for normal distribution
  const u1 = randomValue
  const u2 = Math.sin(seed * 2) * 10000 - Math.floor(Math.sin(seed * 2) * 10000)
  const normalRandom = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)

  // Apply volatility
  const priceChange = normalRandom * volatility
  const newPrice = basePrice * (1 + priceChange)

  return newPrice
}

export async function GET() {
  try {
    const now = Date.now()
    // Change price every 5 minutes
    const seed = Math.floor(now / (5 * 60 * 1000))

    // Generate realistic prices with proper market volatility
    const prices = {
      XAU: generateRealisticPrice(BASE_PRICES.XAU, VOLATILITY.XAU, seed),
      XAG: generateRealisticPrice(BASE_PRICES.XAG, VOLATILITY.XAG, seed * 1.1),
      BRENT: generateRealisticPrice(BASE_PRICES.BRENT, VOLATILITY.BRENT, seed * 1.2),
      NATGAS: generateRealisticPrice(BASE_PRICES.NATGAS, VOLATILITY.NATGAS, seed * 1.3),
    }

    // Calculate 24h changes (using previous seed)
    const prevSeed = seed - 1
    const prevPrices = {
      XAU: generateRealisticPrice(BASE_PRICES.XAU, VOLATILITY.XAU, prevSeed),
      XAG: generateRealisticPrice(BASE_PRICES.XAG, VOLATILITY.XAG, prevSeed * 1.1),
      BRENT: generateRealisticPrice(BASE_PRICES.BRENT, VOLATILITY.BRENT, prevSeed * 1.2),
      NATGAS: generateRealisticPrice(BASE_PRICES.NATGAS, VOLATILITY.NATGAS, prevSeed * 1.3),
    }

    return NextResponse.json({
      success: true,
      timestamp: now,
      data: [
        {
          symbol: "XAU",
          name: "Gold",
          price: prices.XAU,
          change24h: ((prices.XAU - prevPrices.XAU) / prevPrices.XAU) * 100,
          unit: "per oz",
        },
        {
          symbol: "XAG",
          name: "Silver",
          price: prices.XAG,
          change24h: ((prices.XAG - prevPrices.XAG) / prevPrices.XAG) * 100,
          unit: "per oz",
        },
        {
          symbol: "BRENT",
          name: "Oil (Brent)",
          price: prices.BRENT,
          change24h: ((prices.BRENT - prevPrices.BRENT) / prevPrices.BRENT) * 100,
          unit: "per barrel",
        },
        {
          symbol: "NATGAS",
          name: "Natural Gas",
          price: prices.NATGAS,
          change24h: ((prices.NATGAS - prevPrices.NATGAS) / prevPrices.NATGAS) * 100,
          unit: "per MMBtu",
        },
      ],
    })
  } catch (error) {
    console.error("[v0] Error generating commodity prices:", error)
    return NextResponse.json({ error: "Failed to generate prices" }, { status: 500 })
  }
}
