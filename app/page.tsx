"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Card } from "@/components/ui/card"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MarketAsset {
  name: string
  symbol: string
  price: string
  change: string
  isPositive: boolean
}

export default function HomePage() {
  const { user } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [cryptoData, setCryptoData] = useState<MarketAsset[]>([])
  const [commoditiesData, setCommoditiesData] = useState<MarketAsset[]>([])
  const [currenciesData, setCurrenciesData] = useState<MarketAsset[]>([])
  const [loading, setLoading] = useState(true)

  const slides = [
    {
      title: "Fortune X",
      subtitle: "Welcome to the Future of Trading",
      description: "Experience the next generation of crypto and AI-powered trading",
      image:
        "/images/gold-20bar-20laying-20on-20stack-20of-20us-20dollars-20and-20having-20bitcoin-20on-20top-id-6d3b0366-42f3-4ba0-9ee2-0b8bd2770442-size900.jpg",
    },
    {
      title: "Your Gateway to the AI World",
      subtitle: "Powered by AI Arbitrage",
      description: "Leverage cutting-edge AI technology to maximize your trading potential",
      image:
        "/images/stack-of-shiny-gold-bars-on-down-trend-financial-gold-price-graph-concept-of-economy-crash-and-financial-crisis-3d-illustration-c1dd97f64f.webp",
    },
  ]

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch("/api/crypto-prices")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setCryptoData(data)
      } catch (error) {
        console.error("Error fetching crypto data:", error)
        setCryptoData([
          { name: "Bitcoin", symbol: "BTC", price: "$96,000", change: "+2.5%", isPositive: true },
          { name: "Ethereum", symbol: "ETH", price: "$3,400", change: "+1.8%", isPositive: true },
          { name: "BNB", symbol: "BNB", price: "$620", change: "-0.5%", isPositive: false },
        ])
      }
    }

    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchCommodityData = async () => {
      try {
        const response = await fetch("/api/commodities")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        const commodities = result.data || result

        if (!Array.isArray(commodities)) {
          throw new Error("Invalid data format from commodities API")
        }

        const formattedData = commodities.map((commodity: any) => ({
          name: commodity.name,
          symbol: commodity.symbol,
          price: `$${commodity.price.toFixed(2)}`,
          change: `${commodity.change24h >= 0 ? "+" : ""}${commodity.change24h.toFixed(2)}%`,
          isPositive: commodity.change24h >= 0,
        }))

        setCommoditiesData(formattedData)
      } catch (error) {
        console.error("Error fetching commodity data:", error)
        setCommoditiesData([
          { name: "Gold", symbol: "XAU", price: "$2,650", change: "+0.3%", isPositive: true },
          { name: "Silver", symbol: "XAG", price: "$30.50", change: "+0.8%", isPositive: true },
          { name: "Oil", symbol: "WTI", price: "$75.20", change: "-1.2%", isPositive: false },
        ])
      }
    }

    fetchCommodityData()
    const interval = setInterval(fetchCommodityData, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch forex rates
        const forexResponse = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
        const forexData = await forexResponse.json()

        const currencies = [
          { name: "US Dollar", symbol: "USD", rate: 1, prevRate: 1 },
          { name: "Euro", symbol: "EUR", rate: forexData.rates.EUR, prevRate: forexData.rates.EUR * 1.001 },
          { name: "British Pound", symbol: "GBP", rate: forexData.rates.GBP, prevRate: forexData.rates.GBP * 0.999 },
          { name: "Japanese Yen", symbol: "JPY", rate: forexData.rates.JPY, prevRate: forexData.rates.JPY * 1.002 },
          { name: "Swiss Franc", symbol: "CHF", rate: forexData.rates.CHF, prevRate: forexData.rates.CHF * 0.998 },
          { name: "Canadian Dollar", symbol: "CAD", rate: forexData.rates.CAD, prevRate: forexData.rates.CAD * 1.001 },
          {
            name: "Australian Dollar",
            symbol: "AUD",
            rate: forexData.rates.AUD,
            prevRate: forexData.rates.AUD * 0.999,
          },
          { name: "Chinese Yuan", symbol: "CNY", rate: forexData.rates.CNY, prevRate: forexData.rates.CNY * 1.0005 },
          { name: "Indian Rupee", symbol: "INR", rate: forexData.rates.INR, prevRate: forexData.rates.INR * 0.9995 },
          { name: "Singapore Dollar", symbol: "SGD", rate: forexData.rates.SGD, prevRate: forexData.rates.SGD * 1.001 },
        ]

        const formattedCurrencies = currencies.map((currency) => {
          const changePercent = ((currency.rate - currency.prevRate) / currency.prevRate) * 100
          return {
            name: currency.name,
            symbol: currency.symbol,
            price: currency.rate.toFixed(4),
            change: `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`,
            isPositive: changePercent >= 0,
          }
        })

        setCurrenciesData(formattedCurrencies)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching market data:", error)
        setLoading(false)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div className="flex flex-col bg-black text-white">
      {/* Hero Slideshow Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden border-b border-zinc-800">
        {/* Background image slideshow */}
        <div className="absolute inset-0">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }} />
              <div className="absolute inset-0 bg-black/60" />
            </div>
          ))}
        </div>

        <div className="container relative z-10 mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="transition-all duration-500">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {slides[currentSlide].title}
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-blue-300 mb-6">
                {slides[currentSlide].subtitle}
              </h2>
              <p className="text-lg sm:text-xl text-gray-300">{slides[currentSlide].description}</p>
            </div>
          </div>

          {/* Slide controls */}
          <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4">
            <button onClick={prevSlide} className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700 transition">
              <span className="text-xl">←</span>
            </button>
            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide ? "w-8 bg-blue-500" : "w-2 bg-zinc-600"
                  }`}
                />
              ))}
            </div>
            <button onClick={nextSlide} className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700 transition">
              <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Fortune X Section */}
      <section className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Why Choose Fortune X</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 mb-4 text-2xl">
                  🛡️
                </div>
                <CardTitle className="text-white">Bank-Level Security</CardTitle>
                <CardDescription className="text-gray-400">
                  Multi-grade encryption and single signature data store with end-to-end encrypted system and technology
                  ensure your assets are always safe and protected.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 mb-4 text-2xl">
                  ⚡
                </div>
                <CardTitle className="text-white">Lightning Fast</CardTitle>
                <CardDescription className="text-gray-400">
                  Near-instant transactions across multiple blockchains with our optimized network infrastructure for
                  seamless trading.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 mb-4 text-2xl">
                  📈
                </div>
                <CardTitle className="text-white">AI Optimized</CardTitle>
                <CardDescription className="text-gray-400">
                  Smart algorithms analyze market trends to maximize your portfolio performance with real-time insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 mb-4 text-2xl">
                  🎁
                </div>
                <CardTitle className="text-white">Earn Rewards</CardTitle>
                <CardDescription className="text-gray-400">
                  Automated staking and yield farming with competitive APYs on your holdings to grow your wealth
                  passively.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Security Update Section */}
      <section className="py-20 bg-black border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Enhanced Security Updates</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              We've significantly updated our security and trading infrastructure to provide you with the latest and
              safest experience with this site.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 mb-4 text-2xl">
                  🔒
                </div>
                <CardTitle className="text-white">Multi Layer</CardTitle>
                <CardDescription className="text-gray-400">
                  Added additional encryption with Quantum-Resistant algorithms for future-proof security protection.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 mb-4 text-2xl">
                  👁️
                </div>
                <CardTitle className="text-white">Real-time Threat Detection</CardTitle>
                <CardDescription className="text-gray-400">
                  AI-powered threat monitoring that detects and prevents suspicious activities in real-time for your
                  protection.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 mb-4 text-2xl">
                  💰
                </div>
                <CardTitle className="text-white">Insurance Protection</CardTitle>
                <CardDescription className="text-gray-400">
                  All assets are now insured against theft and unauthorized access with our new protection system.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Market Review Section */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Market Review</h2>

          {loading ? (
            <div className="text-center text-gray-400">Loading market data...</div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Top 10 Cryptocurrencies */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-blue-400">Top Cryptocurrencies</h3>
                <div className="space-y-3">
                  {cryptoData.map((crypto, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between hover:border-blue-600 transition"
                    >
                      <div>
                        <div className="font-semibold text-white">{crypto.name}</div>
                        <div className="text-sm text-gray-500">{crypto.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">{crypto.price}</div>
                        <div className={`text-sm ${crypto.isPositive ? "text-green-500" : "text-red-500"}`}>
                          {crypto.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 10 Commodities */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-blue-400">Top Commodities</h3>
                <div className="space-y-3">
                  {commoditiesData.map((commodity, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between hover:border-blue-600 transition"
                    >
                      <div>
                        <div className="font-semibold text-white">{commodity.name}</div>
                        <div className="text-sm text-gray-500">{commodity.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">{commodity.price}</div>
                        <div className={`text-sm ${commodity.isPositive ? "text-green-500" : "text-red-500"}`}>
                          {commodity.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 10 Currencies */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-blue-400">Top Currencies</h3>
                <div className="space-y-3">
                  {currenciesData.map((currency, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between hover:border-blue-600 transition"
                    >
                      <div>
                        <div className="font-semibold text-white">{currency.name}</div>
                        <div className="text-sm text-gray-500">{currency.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">{currency.price}</div>
                        <div className={`text-sm ${currency.isPositive ? "text-green-500" : "text-red-500"}`}>
                          {currency.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-zinc-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Company */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Fortune X</h3>
              <p className="text-gray-400 text-sm">
                Your gateway to the AI-powered trading world. Trade smarter, not harder.
              </p>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="#" className="hover:text-blue-400 transition">
                    Wallet
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400 transition">
                    Exchange
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400 transition">
                    DeFi Platform
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400 transition">
                    NFT Marketplace
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="#" className="hover:text-blue-400 transition">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400 transition">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400 transition">
                    Status
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400 transition">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">About Us</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="#" className="hover:text-blue-400 transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400 transition">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400 transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400 transition">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-gray-500 text-sm">
            <p>&copy; 2025 Fortune X. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
