"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CommodityData {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
}

export default function CommodityMarketsPage() {
  const router = useRouter()
  const [commodities, setCommodities] = useState<CommodityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        const response = await fetch("/api/commodities")
        const data = await response.json()

        if (data.success && data.data) {
          // Top 5 commodities with COMEX Gold first
          const top5 = data.data.slice(0, 5).map((commodity: any) => ({
            id: commodity.symbol.toLowerCase(),
            symbol: commodity.symbol,
            name: commodity.name,
            price: commodity.price,
            change24h: commodity.change24h,
          }))
          setCommodities(top5)
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching commodity data:", error)
        setLoading(false)
      }
    }

    fetchCommodities()
    const interval = setInterval(fetchCommodities, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleTradeNow = (commodityId: string) => {
    router.push(`/trading/${commodityId}`)
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
          <h1 className="text-4xl font-bold mb-2 text-orange-500">Commodity Markets</h1>
          <p className="text-slate-400">Trade top 5 global commodities</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-slate-400">Loading commodities...</p>
          ) : (
            commodities.map((commodity) => (
              <Card
                key={commodity.id}
                className="bg-slate-900/80 border-slate-700 hover:border-orange-500/50 transition-all"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{commodity.name}</h3>
                      <p className="text-slate-400 text-sm">{commodity.symbol}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold text-white">
                          $
                          {commodity.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p
                          className={`text-lg font-semibold ${commodity.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {commodity.change24h >= 0 ? "+" : ""}
                          {commodity.change24h.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleTradeNow(commodity.id)}
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
