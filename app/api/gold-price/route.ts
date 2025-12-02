import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try to fetch real COMEX Gold price
    // Note: metals-api.com requires API key, using goldapi.io as alternative
    const response = await fetch("https://www.goldapi.io/api/XAU/USD", {
      headers: {
        "x-access-token": process.env.GOLD_API_KEY || "",
      },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        source: "goldapi.io",
        data: {
          symbol: "GOLD",
          name: "COMEX Gold",
          price: data.price_gram_24k * 31.1035, // Convert to per troy ounce
          change24h: data.ch_24h || 0,
          timestamp: Date.now(),
        },
      })
    }

    // Fallback to realistic price simulation based on recent COMEX data
    const basePrice = 2650.0 // Current approximate COMEX Gold price per oz
    const now = Date.now()
    const seed = Math.floor(now / (60 * 1000)) // Update every minute
    const random = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000)
    const volatility = 0.005 // 0.5% intraday volatility

    const currentPrice = basePrice * (1 + (random - 0.5) * volatility)
    const prevSeed = seed - 1440 // 24 hours ago
    const prevRandom = Math.sin(prevSeed) * 10000 - Math.floor(Math.sin(prevSeed) * 10000)
    const prevPrice = basePrice * (1 + (prevRandom - 0.5) * volatility)
    const change24h = ((currentPrice - prevPrice) / prevPrice) * 100

    return NextResponse.json({
      success: true,
      source: "simulation",
      data: {
        symbol: "GOLD",
        name: "COMEX Gold",
        price: currentPrice,
        change24h: change24h,
        timestamp: now,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching COMEX Gold price:", error)
    return NextResponse.json({ error: "Failed to fetch gold price" }, { status: 500 })
  }
}
