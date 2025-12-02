"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Trade {
  id: string
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
  completedTime: number
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"history" | "deposit" | "withdraw" | "transactions">("history")
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([])
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [balance, setBalance] = useState(99288.1)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Load trade history from localStorage
    const history = JSON.parse(localStorage.getItem("tradeHistory") || "[]")
    // Sort by completion time (most recent first)
    const sortedHistory = history.sort((a: Trade, b: Trade) => b.completedTime - a.completedTime)
    setTradeHistory(sortedHistory)
  }, [])

  if (loading || !user) {
    return null
  }

  const totalProfit = tradeHistory.reduce((sum, trade) => sum + trade.profit, 0)
  const totalTrades = tradeHistory.length
  const winningTrades = tradeHistory.filter((t) => t.profit > 0).length
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 p-6">
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
            <h1 className="text-3xl font-bold text-white">Profile</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Current Balance</p>
            <p className="text-3xl font-bold text-orange-500">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="bg-slate-900/80 border-slate-700 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-slate-400">{user.email}</p>
                <p className="text-slate-500 text-sm">{user.phone || "+1 342 234 6574"}</p>
              </div>
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <p className={`text-3xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {totalProfit >= 0 ? "+" : ""}${Math.abs(totalProfit).toFixed(2)}
                  </p>
                  <p className="text-slate-400 text-sm">Total Profit</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{totalTrades}</p>
                  <p className="text-slate-400 text-sm">Total Trades</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-500">{winRate.toFixed(0)}%</p>
                  <p className="text-slate-400 text-sm">Win Rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Button
            onClick={() => setActiveTab("history")}
            className={`h-14 text-lg font-semibold ${
              activeTab === "history"
                ? "bg-slate-700 text-white hover:bg-slate-600"
                : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-700"
            }`}
          >
            Trade History
          </Button>
          <Button
            onClick={() => setActiveTab("deposit")}
            className={`h-14 text-lg font-semibold ${
              activeTab === "deposit"
                ? "bg-slate-700 text-white hover:bg-slate-600"
                : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-700"
            }`}
          >
            Deposit
          </Button>
          <Button
            onClick={() => setActiveTab("withdraw")}
            className={`h-14 text-lg font-semibold ${
              activeTab === "withdraw"
                ? "bg-slate-700 text-white hover:bg-slate-600"
                : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-700"
            }`}
          >
            Withdraw
          </Button>
          <Button
            onClick={() => setActiveTab("transactions")}
            className={`h-14 text-lg font-semibold ${
              activeTab === "transactions"
                ? "bg-slate-700 text-white hover:bg-slate-600"
                : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-700"
            }`}
          >
            Transactions
          </Button>
        </div>

        {/* Trade History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {tradeHistory.length > 0 ? (
              tradeHistory.map((trade) => (
                <Card key={trade.id} className="bg-slate-900/80 border-slate-700 hover:border-slate-600 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-1">{trade.assetName}</h3>
                        <p
                          className={`text-sm font-medium ${trade.direction === "long" ? "text-green-500" : "text-red-500"}`}
                        >
                          {trade.direction === "long" ? "Buy Long ↑" : "Sell Short ↓"}
                        </p>
                        <p className="text-xs text-slate-500">{new Date(trade.completedTime).toLocaleString()}</p>
                      </div>

                      <div className="text-center px-6">
                        <p className="text-sm text-slate-400 mb-1">Trade Amount</p>
                        <p className="text-xl font-bold text-white">${trade.amount.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{trade.timeframe}s</p>
                      </div>

                      <div className="text-center px-6">
                        <p className="text-sm text-slate-400 mb-1">Loss/Profit</p>
                        <p className={`text-2xl font-bold ${trade.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                        </p>
                        <p className={`text-sm ${trade.profitPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {trade.profitPercent >= 0 ? "+" : ""}
                          {trade.profitPercent.toFixed(2)}%
                        </p>
                      </div>

                      <div className="text-center px-6">
                        <p className="text-sm text-slate-400 mb-1">Total Return</p>
                        <p className="text-xl font-bold text-white">
                          ${(trade.amount + trade.profit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <Button
                        onClick={() => setSelectedTrade(trade)}
                        className="bg-slate-700 hover:bg-slate-600 text-white"
                      >
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-slate-900/80 border-slate-700">
                <CardContent className="p-12 text-center">
                  <p className="text-slate-400 text-lg">No trade history yet</p>
                  <Button
                    onClick={() => router.push("/trade-list")}
                    className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Start Trading
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Deposit Tab */}
        {activeTab === "deposit" && (
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Deposit Funds</CardTitle>
              <CardDescription className="text-slate-400">Add funds to your trading account</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-300">Deposit functionality coming soon...</p>
            </CardContent>
          </Card>
        )}

        {/* Withdraw Tab */}
        {activeTab === "withdraw" && (
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Withdraw Funds</CardTitle>
              <CardDescription className="text-slate-400">Withdraw from your trading account</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-300">Withdrawal functionality coming soon...</p>
            </CardContent>
          </Card>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Transaction History</CardTitle>
              <CardDescription className="text-slate-400">View all your account transactions</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-300">No transactions yet</p>
            </CardContent>
          </Card>
        )}

        {/* Trade Details Modal */}
        <Dialog open={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-orange-500">{selectedTrade?.assetName} - Trade Details</DialogTitle>
              <p className="text-slate-400">Complete information about your trade</p>
            </DialogHeader>

            {selectedTrade && (
              <div className="space-y-6">
                {/* Asset and Trade Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Asset</p>
                    <p className="text-xl font-bold text-white">{selectedTrade.assetName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Trade Type</p>
                    <p
                      className={`text-xl font-bold ${selectedTrade.direction === "long" ? "text-green-500" : "text-red-500"}`}
                    >
                      {selectedTrade.direction === "long" ? "Buy Long ↑" : "Sell Short ↓"}
                    </p>
                  </div>
                </div>

                {/* Time Information */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">Time Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Started</p>
                      <p className="text-white font-medium">{new Date(selectedTrade.startTime).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Completed</p>
                      <p className="text-white font-medium">{new Date(selectedTrade.completedTime).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Duration</p>
                      <p className="text-orange-500 font-bold">{selectedTrade.timeframe}s</p>
                    </div>
                  </div>
                </div>

                {/* Price Movement */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">Price Movement</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Entry Price</p>
                      <p className="text-white font-bold text-lg">${selectedTrade.entryPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Exit Price</p>
                      <p className="text-red-500 font-bold text-lg">${selectedTrade.exitPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Price Change</p>
                      <p className="text-red-500 font-bold text-lg">
                        -
                        {(
                          ((selectedTrade.entryPrice - selectedTrade.exitPrice) / selectedTrade.entryPrice) *
                          100
                        ).toFixed(2)}
                        %
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-lg p-6 border border-red-700/50">
                  <h3 className="text-white font-semibold mb-4 text-lg">Financial Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-slate-300">Trade Amount</p>
                      <p className="text-white font-bold text-xl">${selectedTrade.amount.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-slate-300">Loss</p>
                      <p className="text-red-500 font-bold text-xl">
                        -${Math.abs(selectedTrade.profit).toFixed(2)} (-
                        {Math.abs(selectedTrade.profitPercent).toFixed(2)}%)
                      </p>
                    </div>
                    <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                      <p className="text-white font-semibold text-lg">Total Return</p>
                      <p className="text-orange-500 font-bold text-2xl">
                        ${(selectedTrade.amount + selectedTrade.profit).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
