"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ForexData {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
}

export default function ForexMarketPage() {
  const router = useRouter()
  const [forexData, setForexData] = useState<ForexData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForexData = async () => {
      try {
        // Top 10 currency pairs
        const currencies = [
          { id: "eurusd", symbol: "EUR/USD", name: "Euro / US Dollar", base: 1.09 },
          { id: "gbpusd", symbol: "GBP/USD", name: "British Pound / US Dollar", base: 1.27 },
          { id: "usdjpy", symbol: "USD/JPY", name: "US Dollar / Japanese Yen", base: 149.5 },
          { id: "usdchf", symbol: "USD/CHF", name: "US Dollar / Swiss Franc", base: 0.88 },
          { id: "audusd", symbol: "AUD/USD", name: "Australian Dollar / US Dollar", base: 0.64 },
          { id: "usdcad", symbol: "USD/CAD", name: "US Dollar / Canadian Dollar", base: 1.39 },
          { id: "nzdusd", symbol: "NZD/USD", name: "New Zealand Dollar / US Dollar", base: 0.59 },
          { id: "eurgbp", symbol: "EUR/GBP", name: "Euro / British Pound", base: 0.86 },
          { id: "eurjpy", symbol: "EUR/JPY", name: "Euro / Japanese Yen", base: 163.0 },
          { id: "gbpjpy", symbol: "GBP/JPY", name: "British Pound / Japanese Yen", base: 189.5 },
        ]

        const formatted = currencies.map((currency) => ({
          ...currency,
          price: currency.base * (1 + (Math.random() - 0.5) * 0.02),
          change24h: (Math.random() - 0.5) * 2,
        }))

        setForexData(formatted)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching forex data:", error)
        setLoading(false)
      }
    }

    fetchForexData()
    const interval = setInterval(fetchForexData, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleTradeNow = (forexId: string) => {
    router.push(`/trading/${forexId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4 text-slate-400 hover:text-white"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2 text-emerald-500">Forex Market</h1>
          <p className="text-slate-400">Trade top 10 global currency pairs</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-slate-400">Loading forex data...</p>
          ) : (
            forexData.map((forex) => (
              <Card
                key={forex.id}
                className="bg-slate-900/80 border-slate-700 hover:border-emerald-500/50 transition-all"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{forex.symbol}</h3>
                      <p className="text-slate-400 text-sm">{forex.name}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold text-white">{forex.price.toFixed(4)}</p>
                        <p
                          className={`text-lg font-semibold ${forex.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {forex.change24h >= 0 ? "+" : ""}
                          {forex.change24h.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleTradeNow(forex.id)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 text-lg"
                    >
                      Trade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
