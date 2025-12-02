"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ActiveTrade {
  id: string
  assetId: string
  assetName: string
  assetSymbol: string
  direction: "long" | "short"
  amount: number
  entryPrice: number
  currentPrice?: number
  timeframe: number
  startTime: number
  endTime: number
  profit?: number
  profitPercent?: number
  targetPercent?: number
}

export default function ActiveTradesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [trades, setTrades] = useState<ActiveTrade[]>([])
  const [balance, setBalance] = useState(95000)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const loadTrades = () => {
      const storedTrades = JSON.parse(localStorage.getItem("activeTrades") || "[]")
      const now = Date.now()

      // Filter out expired trades
      const activeTrades = storedTrades.filter((trade: ActiveTrade) => trade.endTime > now)

      // Move expired trades to history
      const expiredTrades = storedTrades.filter((trade: ActiveTrade) => trade.endTime <= now)
      if (expiredTrades.length > 0) {
        const history = JSON.parse(localStorage.getItem("tradeHistory") || "[]")
        localStorage.setItem("tradeHistory", JSON.stringify([...history, ...expiredTrades]))
        localStorage.setItem("activeTrades", JSON.stringify(activeTrades))
      }

      setTrades(activeTrades)
    }

    loadTrades()
    const interval = setInterval(loadTrades, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Update prices and calculate profit
    const updatePrices = async () => {
      const updatedTrades = await Promise.all(
        trades.map(async (trade) => {
          try {
            let currentPrice = trade.entryPrice

            if (trade.assetId === "gold") {
              const response = await fetch("/api/commodities")
              const data = await response.json()
              const goldData = data.success ? data.data.find((c: any) => c.symbol === "XAU") : null
              currentPrice = goldData?.price || trade.entryPrice
            } else {
              const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${trade.assetId}&vs_currencies=usd`,
              )
              const data = await response.json()
              currentPrice = data[trade.assetId]?.usd || trade.entryPrice
            }

            // Calculate profit based on direction
            const priceChange = currentPrice - trade.entryPrice
            const multiplier = trade.direction === "long" ? 1 : -1
            const profit = (priceChange / trade.entryPrice) * trade.amount * multiplier
            const profitPercent = (priceChange / trade.entryPrice) * 100 * multiplier

            // Calculate target based on timeframe
            const timeframeMultiplier =
              trade.timeframe === 60
                ? 0.13
                : trade.timeframe === 90
                  ? 0.135
                  : trade.timeframe === 120
                    ? 0.175
                    : trade.timeframe === 180
                      ? 0.225
                      : 0.275
            const targetPercent = timeframeMultiplier * (trade.direction === "long" ? -1 : 1) * 100

            return { ...trade, currentPrice, profit, profitPercent, targetPercent }
          } catch (error) {
            console.error("Error updating trade:", error)
            return trade
          }
        }),
      )

      setTrades(updatedTrades)
    }

    if (trades.length > 0) {
      updatePrices()
      const interval = setInterval(updatePrices, 3000)
      return () => clearInterval(interval)
    }
  }, [trades.length])

  const getTimeRemaining = (endTime: number) => {
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
    return remaining
  }

  if (loading || !user) {
    return null
  }

  if (trades.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm p-8 max-w-md">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">No Active Trades</h2>
            <p className="text-slate-400 mb-6">You don't have any active trades at the moment</p>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              onClick={() => router.push("/trade-list")}
            >
              Start Trading
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="text-slate-400 hover:text-white"
            >
              ← Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Active Trades</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Balance</p>
            <p className="text-2xl font-bold text-yellow-500">${balance.toLocaleString()}</p>
          </div>
        </div>

        {/* Trades */}
        <div className="space-y-4">
          {trades.map((trade) => {
            const timeRemaining = getTimeRemaining(trade.endTime)
            return (
              <Card key={trade.id} className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-4 gap-6 items-center">
                    {/* Asset Info */}
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{trade.assetName}</h3>
                      <p
                        className={`text-sm font-medium ${trade.direction === "long" ? "text-green-500" : "text-red-500"}`}
                      >
                        {trade.direction === "long" ? "Buy Long ↑" : "Sell Short ↓"}
                      </p>
                    </div>

                    {/* Trade Amount */}
                    <div className="text-center">
                      <p className="text-sm text-slate-400 mb-1">Trade Amount</p>
                      <p className="text-2xl font-bold">${trade.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{trade.timeframe}s</p>
                    </div>

                    {/* Current Profit */}
                    <div className="text-center">
                      <p className="text-sm text-slate-400 mb-1">Current Profit</p>
                      <p
                        className={`text-3xl font-bold ${(trade.profit || 0) >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {(trade.profit || 0) >= 0 ? "+" : ""}${(trade.profit || 0).toFixed(2)}
                      </p>
                      <p className={`text-sm ${(trade.profitPercent || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {(trade.profitPercent || 0) >= 0 ? "+" : ""}
                        {(trade.profitPercent || 0).toFixed(2)}%
                      </p>
                      <p className="text-xs text-slate-500">Target: {trade.targetPercent?.toFixed(1)}%</p>
                    </div>

                    {/* Time Remaining */}
                    <div className="text-center">
                      <p className="text-5xl font-bold text-yellow-500">{timeRemaining}s</p>
                      <p className="text-sm text-slate-400">remaining</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* View History Button */}
        <div className="mt-8 text-center">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
            onClick={() => router.push("/trade-history")}
          >
            View Trade History
          </Button>
        </div>
      </div>
    </div>
  )
}
