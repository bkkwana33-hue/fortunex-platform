"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MarketData {
  symbol: string
  name: string
  price: number
  change24h: number
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [cryptoData, setCryptoData] = useState<MarketData[]>([])
  const [commodityData, setCommodityData] = useState<MarketData[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,ripple,cardano&vs_currencies=usd&include_24hr_change=true",
        )
        const data = await response.json()

        const formatted: MarketData[] = [
          {
            symbol: "BTC",
            name: "Bitcoin",
            price: data.bitcoin?.usd || 0,
            change24h: data.bitcoin?.usd_24h_change || 0,
          },
          {
            symbol: "ETH",
            name: "Ethereum",
            price: data.ethereum?.usd || 0,
            change24h: data.ethereum?.usd_24h_change || 0,
          },
          {
            symbol: "BNB",
            name: "Binance Coin",
            price: data.binancecoin?.usd || 0,
            change24h: data.binancecoin?.usd_24h_change || 0,
          },
          { symbol: "XRP", name: "Ripple", price: data.ripple?.usd || 0, change24h: data.ripple?.usd_24h_change || 0 },
          {
            symbol: "ADA",
            name: "Cardano",
            price: data.cardano?.usd || 0,
            change24h: data.cardano?.usd_24h_change || 0,
          },
        ]

        setCryptoData(formatted)
      } catch (error) {
        console.error("Error fetching crypto data:", error)
      }
    }

    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchCommodityData = async () => {
      try {
        const response = await fetch("/api/commodities")
        const data = await response.json()
        if (data.success && data.data) {
          setCommodityData(data.data.slice(0, 4))
        }
      } catch (error) {
        console.error("Error fetching commodity data:", error)
      }
    }

    fetchCommodityData()
    const interval = setInterval(fetchCommodityData, 300000)
    return () => clearInterval(interval)
  }, [])

  const demoUser = user || { name: "Demo User", role: "user", createdAt: new Date().toISOString() }

  const initials = demoUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const dashboardCards = [
    {
      title: "Trade",
      description: "Start trading cryptocurrencies and gold",
      icon: "📈",
      link: "/trade-list",
      iconBg: "bg-orange-900/50",
    },
    {
      title: "Profile",
      description: "View trade history and transactions",
      icon: "👤",
      link: "/profile",
      iconBg: "bg-indigo-900/50",
    },
    {
      title: "Security",
      description: "Manage your password and profile",
      icon: "🔒",
      link: "/settings",
      iconBg: "bg-purple-900/50",
    },
    {
      title: "AI Arbitrage",
      description: "Learn about AI-powered trading",
      icon: "💡",
      link: "/ai-arbitrage",
      iconBg: "bg-blue-900/50",
    },
    {
      title: "Market Analysis",
      description: "Real-time market K-charts",
      icon: "📊",
      link: "/market-analysis",
      iconBg: "bg-teal-900/50",
    },
    {
      title: "Market Review",
      description: "View detailed market overview",
      icon: "🎯",
      link: "/market-review",
      iconBg: "bg-cyan-900/50",
    },
    {
      title: "Commodity Markets",
      description: "Trade top 5 global commodities",
      icon: "📦",
      link: "/commodity-markets",
      iconBg: "bg-orange-800/50",
    },
    {
      title: "Forex Market",
      description: "Trade top 10 global currencies",
      icon: "💱",
      link: "/forex-market",
      iconBg: "bg-emerald-900/50",
    },
  ]

  const getUserBalance = () => {
    if (typeof window !== "undefined") {
      return Number.parseFloat(localStorage.getItem("userBalance") || "0")
    }
    return 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 p-6">
      <div className="container mx-auto">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, {demoUser.name.split(" ")[0]}!</h1>
            <p className="text-slate-400">Track your Fortune X portfolio and market movements</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm mb-1">Current Balance</p>
            <p className="text-4xl font-bold text-orange-500">
              ${getUserBalance().toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
          {dashboardCards.map((card) => (
            <Card
              key={card.title}
              className="bg-slate-900/80 border-slate-700 hover:bg-slate-800/80 transition-all cursor-pointer backdrop-blur-sm hover:border-orange-500/50"
              onClick={() => router.push(card.link)}
            >
              <CardHeader className="flex flex-col items-center text-center space-y-4 pb-6 pt-8">
                <div
                  className={`w-20 h-20 rounded-full ${card.iconBg} flex items-center justify-center text-4xl border-2 border-slate-700`}
                >
                  {card.icon}
                </div>
                <div>
                  <CardTitle className="text-2xl mb-2 text-white">{card.title}</CardTitle>
                  <CardDescription className="text-slate-400">{card.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Account Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Account Balance</CardDescription>
              <CardTitle className="text-2xl text-white">$0.00</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Available for trading</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Total Profit/Loss</CardDescription>
              <CardTitle className="text-2xl text-green-500">+$0.00</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">All time performance</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Open Positions</CardDescription>
              <CardTitle className="text-2xl text-white">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Active trades</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Account Status</CardDescription>
              <CardTitle className="text-2xl capitalize text-white">{demoUser.role}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Member since {new Date(demoUser.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Market Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cryptocurrencies */}
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Top Cryptocurrencies</CardTitle>
              <CardDescription className="text-slate-400">Real-time market prices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cryptoData.length > 0 ? (
                  cryptoData.map((crypto) => (
                    <div
                      key={crypto.symbol}
                      className="flex items-center justify-between border-b border-slate-700 pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-white">{crypto.symbol}</p>
                        <p className="text-xs text-slate-400">{crypto.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">
                          $
                          {crypto.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className={`text-xs ${crypto.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {crypto.change24h >= 0 ? "+" : ""}
                          {crypto.change24h.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Loading market data...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Commodities */}
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Top Commodities</CardTitle>
              <CardDescription className="text-slate-400">Real-time commodity prices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commodityData.length > 0 ? (
                  commodityData.map((commodity) => (
                    <div
                      key={commodity.symbol}
                      className="flex items-center justify-between border-b border-slate-700 pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-white">{commodity.symbol}</p>
                        <p className="text-xs text-slate-400">{commodity.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">
                          $
                          {commodity.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className={`text-xs ${commodity.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {commodity.change24h >= 0 ? "+" : ""}
                          {commodity.change24h.toFixed(2)}%
                        </p>
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
    </div>
  )
}
