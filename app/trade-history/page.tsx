"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CompletedTrade {
  id: string
  assetId: string
  assetName: string
  assetSymbol: string
  direction: "long" | "short"
  amount: number
  entryPrice: number
  exitPrice: number
  profit: number
  profitPercent: number
  timeframe: number
  startTime: number
  endTime: number
  completedAt: number
}

export default function TradeHistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState<CompletedTrade[]>([])
  const [balance, setBalance] = useState(95000)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Load trade history from localStorage
    const loadHistory = () => {
      const storedHistory = JSON.parse(localStorage.getItem("tradeHistory") || "[]")

      // Calculate final profit for completed trades
      const processedHistory = storedHistory.map((trade: any) => {
        // Simulate final price change based on timeframe
        const timeframeMultiplier =
          trade.timeframe === 60
            ? 0.14
            : trade.timeframe === 90
              ? 0.135
              : trade.timeframe === 120
                ? 0.175
                : trade.timeframe === 180
                  ? 0.225
                  : 0.28

        // Random outcome with some losses
        const outcome = Math.random() < 0.6 ? 1 : -1
        const priceChangePercent = timeframeMultiplier * outcome * (trade.direction === "long" ? 1 : -1) * 100
        const exitPrice = trade.entryPrice * (1 + priceChangePercent / 100)
        const profit = trade.amount * (priceChangePercent / 100)

        return {
          ...trade,
          exitPrice,
          profit,
          profitPercent: priceChangePercent,
          completedAt: trade.endTime,
        }
      })

      setHistory(processedHistory.reverse())
    }

    loadHistory()
  }, [])

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all trade history?")) {
      localStorage.setItem("tradeHistory", "[]")
      setHistory([])
    }
  }

  if (loading || !user) {
    return null
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm p-8 max-w-md">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Trades Finished!</h2>
            <p className="text-slate-400 mb-6">All your trades have been completed</p>
            <p className="text-sm text-slate-500 mb-6">No trade history available yet</p>
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

  const totalProfit = history.reduce((sum, trade) => sum + trade.profit, 0)
  const winRate = (history.filter((t) => t.profit > 0).length / history.length) * 100

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
            <h1 className="text-3xl font-bold">Trade History</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Balance</p>
            <p className="text-2xl font-bold text-yellow-500">${balance.toLocaleString()}</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-slate-400 mb-2">Total Trades</p>
              <p className="text-3xl font-bold">{history.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-slate-400 mb-2">Total Profit/Loss</p>
              <p className={`text-3xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-slate-400 mb-2">Win Rate</p>
              <p className="text-3xl font-bold text-blue-500">{winRate.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Trade History List */}
        <div className="space-y-4">
          {history.map((trade) => (
            <Card key={trade.id} className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-5 gap-4 items-center">
                  {/* Asset Info */}
                  <div>
                    <h3 className="text-xl font-bold mb-1">{trade.assetName}</h3>
                    <p
                      className={`text-sm font-medium ${trade.direction === "long" ? "text-green-500" : "text-red-500"}`}
                    >
                      {trade.direction === "long" ? "Buy Long ↑" : "Sell Short ↓"}
                    </p>
                    <p className="text-xs text-slate-500">{trade.timeframe}s</p>
                  </div>

                  {/* Trade Amount */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Trade Amount</p>
                    <p className="text-lg font-semibold">${trade.amount.toLocaleString()}</p>
                  </div>

                  {/* Entry/Exit Price */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Entry → Exit</p>
                    <p className="text-sm font-medium">
                      ${trade.entryPrice.toFixed(2)} → ${trade.exitPrice.toFixed(2)}
                    </p>
                  </div>

                  {/* Profit/Loss */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Profit/Loss</p>
                    <p className={`text-2xl font-bold ${trade.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                    </p>
                    <p className={`text-sm ${trade.profitPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {trade.profitPercent >= 0 ? "+" : ""}
                      {trade.profitPercent.toFixed(2)}%
                    </p>
                  </div>

                  {/* Completed Time */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Completed</p>
                    <p className="text-sm">{new Date(trade.completedAt).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-500">{new Date(trade.completedAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
            onClick={() => router.push("/trade-list")}
          >
            Start New Trade
          </Button>
          <Button
            variant="outline"
            className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white px-8 bg-transparent"
            onClick={clearHistory}
          >
            Clear History
          </Button>
        </div>
      </div>
    </div>
  )
}
