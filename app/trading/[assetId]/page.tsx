"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AssetDetails {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
}

const timeframes = [
  { seconds: 60, label: "60s", minAmount: 500, minReturn: 5, maxReturn: 10 },
  { seconds: 90, label: "90s", minAmount: 5000, minReturn: 12, maxReturn: 15 },
  { seconds: 120, label: "120s", minAmount: 10000, minReturn: 15, maxReturn: 20 },
  { seconds: 180, label: "180s", minAmount: 30000, minReturn: 20, maxReturn: 25 },
  { seconds: 360, label: "360s", minAmount: 50000, minReturn: 25, maxReturn: 30 },
]

const forexPairs: Record<string, { name: string; symbol: string; base: number }> = {
  eurusd: { name: "Euro / US Dollar", symbol: "EUR/USD", base: 1.09 },
  gbpusd: { name: "British Pound / US Dollar", symbol: "GBP/USD", base: 1.27 },
  usdjpy: { name: "US Dollar / Japanese Yen", symbol: "USD/JPY", base: 149.5 },
  usdchf: { name: "US Dollar / Swiss Franc", symbol: "USD/CHF", base: 0.88 },
  audusd: { name: "Australian Dollar / US Dollar", symbol: "AUD/USD", base: 0.64 },
  usdcad: { name: "US Dollar / Canadian Dollar", symbol: "USD/CAD", base: 1.39 },
  nzdusd: { name: "New Zealand Dollar / US Dollar", symbol: "NZD/USD", base: 0.59 },
  eurgbp: { name: "Euro / British Pound", symbol: "EUR/GBP", base: 0.86 },
  eurjpy: { name: "Euro / Japanese Yen", symbol: "EUR/JPY", base: 163.0 },
  gbpjpy: { name: "British Pound / Japanese Yen", symbol: "GBP/JPY", base: 189.5 },
}

export default function TradingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const assetId = params?.assetId as string

  const [asset, setAsset] = useState<AssetDetails | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState(360)
  const [tradeAmount, setTradeAmount] = useState("")
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        if (assetId === "gold") {
          const goldResponse = await fetch("/api/gold-price")
          const goldData = await goldResponse.json()

          setAsset({
            id: "gold",
            name: "COMEX Gold",
            symbol: "GOLD",
            price: goldData.success ? goldData.data.price : 2650.0,
            change24h: goldData.success ? goldData.data.change24h : 0,
          })
        } else if (forexPairs[assetId]) {
          const forex = forexPairs[assetId]
          const randomVariation = (Math.random() - 0.5) * 0.02
          setAsset({
            id: assetId,
            name: forex.name,
            symbol: forex.symbol,
            price: forex.base * (1 + randomVariation),
            change24h: (Math.random() - 0.5) * 2,
          })
        } else {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${assetId}&vs_currencies=usd&include_24hr_change=true`,
          )
          const data = await response.json()

          if (data[assetId]) {
            setAsset({
              id: assetId,
              name: assetId.charAt(0).toUpperCase() + assetId.slice(1),
              symbol: assetId === "bitcoin" ? "BTC" : assetId === "ethereum" ? "ETH" : assetId.toUpperCase(),
              price: data[assetId].usd,
              change24h: data[assetId].usd_24h_change,
            })
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching asset details:", error)
      }
    }

    if (assetId) {
      fetchAssetDetails()
      const interval = setInterval(fetchAssetDetails, 5000)
      return () => clearInterval(interval)
    }
  }, [assetId])

  const handleTrade = (direction: "long" | "short") => {
    const amount = Number.parseFloat(tradeAmount)
    const selectedTf = timeframes.find((tf) => tf.seconds === selectedTimeframe)
    const minAmount = selectedTf?.minAmount || 50000

    if (isNaN(amount) || amount < minAmount) {
      alert(`Minimum trade amount for ${selectedTf?.label} is $${minAmount.toLocaleString()}`)
      return
    }

    if (amount > balance && balance > 0) {
      alert("Insufficient balance")
      return
    }

    // Store trade in localStorage
    const trades = JSON.parse(localStorage.getItem("activeTrades") || "[]")
    const newTrade = {
      id: Date.now().toString(),
      assetId: asset?.id,
      assetName: asset?.name,
      assetSymbol: asset?.symbol,
      direction,
      amount,
      entryPrice: asset?.price || 0,
      timeframe: selectedTimeframe,
      startTime: Date.now(),
      endTime: Date.now() + selectedTimeframe * 1000,
    }
    trades.push(newTrade)
    localStorage.setItem("activeTrades", JSON.stringify(trades))

    router.push("/active-trades")
  }

  const handleMegaTrade = () => {
    router.push(`/mega-trade/${assetId}`)
  }

  if (loading || !user || !asset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <p className="text-slate-400">Loading asset details...</p>
      </div>
    )
  }

  const selectedTf = timeframes.find((tf) => tf.seconds === selectedTimeframe)
  const minAmount = selectedTf?.minAmount || 50000

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/trade-list")}
              className="text-slate-400 hover:text-white"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{asset.name}</h1>
              <p className="text-slate-400">{asset.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Balance</p>
            <p className="text-2xl font-bold text-yellow-500">${balance.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Price Card */}
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-400">Current Price</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold mb-2 text-white">
                ${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-lg font-medium ${asset.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                {asset.change24h >= 0 ? "+" : ""}
                {asset.change24h.toFixed(2)}% (24h)
              </p>
            </CardContent>
          </Card>

          {/* Place Trade Card */}
          <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Place Trade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timeframe Selection */}
              <div>
                <p className="text-sm text-slate-400 mb-3">Select Timeframe</p>
                <div className="grid grid-cols-5 gap-2">
                  {timeframes.map((tf) => (
                    <button
                      key={tf.seconds}
                      onClick={() => setSelectedTimeframe(tf.seconds)}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedTimeframe === tf.seconds
                          ? "bg-orange-600 border-orange-500 text-white"
                          : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      <p className="font-bold text-base text-white">{tf.label}</p>
                      <p className="text-xs text-slate-300">Min ${tf.minAmount / 1000}k</p>
                      <p className="text-xs text-green-400">
                        {tf.minReturn}-{tf.maxReturn}%
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trade Amount */}
              <div>
                <p className="text-sm text-slate-400 mb-2">Trade Amount (Min: ${minAmount.toLocaleString()})</p>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              {/* Trade Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg"
                  onClick={() => handleTrade("long")}
                >
                  Buy Long ↑
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg"
                  onClick={() => handleTrade("short")}
                >
                  Sell Short ↓
                </Button>
              </div>

              {/* Mega Trade Button */}
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-lg"
                onClick={handleMegaTrade}
              >
                MEGA TRADE 🚀
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
