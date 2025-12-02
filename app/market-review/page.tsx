"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface MarketData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h?: number
}

export default function MarketReviewPage() {
  const router = useRouter()
  const [cryptoData, setCryptoData] = useState<MarketData[]>([])

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&locale=en",
        )
        const data = await response.json()

        const formatted: MarketData[] = data.map((coin: any) => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h,
          volume24h: coin.total_volume,
        }))

        setCryptoData(formatted)
      } catch (error) {
        console.error("Error fetching crypto data:", error)
      }
    }

    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="mb-4 text-slate-400 hover:text-white"
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold mb-2 text-white">Market Review</h1>
            <p className="text-slate-400">View detailed cryptocurrency market overview</p>
          </div>
        </div>

        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Top 10 Cryptocurrencies</CardTitle>
            <CardDescription className="text-slate-400">Real-time prices and 24h volume from CoinGecko</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cryptoData.length > 0 ? (
                cryptoData.map((crypto, index) => (
                  <div
                    key={crypto.symbol}
                    className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 font-mono text-sm w-6">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-white text-lg">{crypto.symbol}</p>
                        <p className="text-xs text-slate-400">{crypto.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white text-lg">
                        ${crypto.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className={`text-sm ${crypto.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {crypto.change24h >= 0 ? "+" : ""}
                        {crypto.change24h.toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">24h Volume</p>
                      <p className="font-medium text-white">${(crypto.volume24h! / 1000000).toFixed(2)}M</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Loading market data...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
