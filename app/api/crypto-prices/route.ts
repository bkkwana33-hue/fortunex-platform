export async function GET() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h",
      {
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    const formattedData = data.map((coin: any) => ({
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: `$${coin.current_price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${coin.price_change_percentage_24h >= 0 ? "+" : ""}${coin.price_change_percentage_24h.toFixed(2)}%`,
      isPositive: coin.price_change_percentage_24h >= 0,
    }))

    return Response.json(formattedData)
  } catch (error) {
    console.error("Error fetching crypto prices:", error)

    // Return fallback data on error
    return Response.json([
      { name: "Bitcoin", symbol: "BTC", price: "$96,000", change: "+2.5%", isPositive: true },
      { name: "Ethereum", symbol: "ETH", price: "$3,400", change: "+1.8%", isPositive: true },
      { name: "Binance Coin", symbol: "BNB", price: "$620", change: "-0.5%", isPositive: false },
      { name: "Solana", symbol: "SOL", price: "$180", change: "+3.2%", isPositive: true },
      { name: "XRP", symbol: "XRP", price: "$2.10", change: "+1.5%", isPositive: true },
      { name: "Cardano", symbol: "ADA", price: "$0.92", change: "-1.8%", isPositive: false },
      { name: "Dogecoin", symbol: "DOGE", price: "$0.32", change: "+0.8%", isPositive: true },
      { name: "Polkadot", symbol: "DOT", price: "$7.50", change: "-0.3%", isPositive: false },
      { name: "Polygon", symbol: "MATIC", price: "$0.85", change: "+2.1%", isPositive: true },
      { name: "Avalanche", symbol: "AVAX", price: "$42", change: "+1.2%", isPositive: true },
    ])
  }
}
