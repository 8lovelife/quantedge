"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Bot, Zap, Shield, BarChart2, RefreshCw, Smartphone, Star, GitPullRequest, BookOpen, LifeBuoy } from 'lucide-react';

export default function Page() {
  // Using a 3-color palette: Primary (blue), Secondary (teal), Accent (gray)
  const colors = {
    primary: "blue",
    secondary: "teal",
    accent: "gray"
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-sm shadow-md z-50">
        <div className="container mx-auto max-w-7xl flex items-center justify-between py-4 px-6">
          <Link href="/" className="flex items-center space-x-2"       // ← flex + gap
          >
            <img src="/logo.svg" alt="QuantEdge Logo" className="w-8 h-8" />

            <span className="text-2xl font-extrabold text-blue-600">
              QuantEdge
            </span>
          </Link>
          <nav className="hidden md:flex space-x-8 text-gray-800">
            {["Features", "How It Works", "Results", "Pricing"].map(
              (item) => (
                <Link
                  key={item}
                  href={
                    `#${item.toLowerCase().replace(/\s/g, "-")}`
                  }
                  className="font-medium hover:text-blue-600 transition"
                >
                  {item}
                </Link>
              )
            )}
          </nav>

          <Link href="/login">
            <Button variant="outline" className="ml-4 text-blue-600 border-blue-600 hover:bg-blue-50">
              Sign In
            </Button>
          </Link>

        </div>
      </header>

      <main className="pt-24">
        {/* Hero */}
        <section
          id="hero"
          className="relative bg-gradient-to-r from-blue-500 to-teal-500 pt-32 pb-20 text-center overflow-hidden"
        >
          {/* white overlay for clarity */}
          <div className="absolute inset-0 bg-white/20"></div>
          <div className="relative container mx-auto max-w-4xl px-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              <GitPullRequest className="inline-block mr-3 text-blue-100" /> Smart Crypto Trading, Simplified
            </h1>
            <p className="text-lg md:text-xl text-white mb-8">
              QuantEdge delivers institutional‐grade algorithmic strategies to maximize your crypto returns while minimizing risk. No coding required.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white">
                  Start Trading
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/20 text-white border-white hover:bg-white/30 font-medium"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto max-w-5xl px-6">
            <h2 className="text-3xl font-bold text-blue-700 text-center mb-8">
              Powerful Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <Bot className="text-blue-500 mx-auto" size={36} />, title: "Smart Algorithms", desc: "AI-powered 24/7 market analysis." },
                { icon: <Zap className="text-teal-500 mx-auto" size={36} />, title: "Lightning Fast", desc: "Microsecond trade execution." },
                { icon: <Shield className="text-blue-500 mx-auto" size={36} />, title: "Risk Management", desc: "Automatic stop-loss safeguards." },
                { icon: <BarChart2 className="text-teal-500 mx-auto" size={36} />, title: "Real-time Analytics", desc: "Live P/L, ROI, detailed history." },
                { icon: <RefreshCw className="text-blue-500 mx-auto" size={36} />, title: "Auto Rebalancing", desc: "Optimize allocations automatically." },
                { icon: <Smartphone className="text-teal-500 mx-auto" size={36} />, title: "Mobile Friendly", desc: "Manage strategies on any device." },
              ].map((f) => (
                <Card key={f.title} className="hover:shadow-lg transition border-2 border-gray-100 hover:border-blue-200">
                  <CardContent className="text-center pt-6">
                    {f.icon}
                    <CardTitle className="text-lg font-semibold mt-4 text-blue-700">{f.title}</CardTitle>
                    <p className="text-sm text-gray-700 mt-2">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-blue-50">
          <div className="container mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-3xl font-bold text-blue-700 mb-6">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { n: 1, icon: <BookOpen className="mx-auto text-blue-500" size={32} />, t: "Connect", d: "Link your exchange with secure API keys." },
                { n: 2, icon: <GitPullRequest className="mx-auto text-teal-500" size={32} />, t: "Select", d: "Pick or customize a proven strategy." },
                { n: 3, icon: <BarChart2 className="mx-auto text-blue-500" size={32} />, t: "Backtest", d: "Validate performance with one click." },
                { n: 4, icon: <LifeBuoy className="mx-auto text-teal-500" size={32} />, t: "Launch", d: "Deploy live and let algorithms run." },
              ].map((s) => (
                <div key={s.n} className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 text-white flex items-center justify-center font-bold text-lg">
                    {s.n}
                  </div>
                  {s.icon}
                  <h4 className="font-semibold text-blue-700 mb-2 mt-2">{s.t}</h4>
                  <p className="text-gray-700">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Results */}
        <section id="results" className="py-20 bg-white">
          <div className="container mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-bold text-blue-700 mb-6">Performance Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { quote: "Bitcoin strategy delivered 34% in Q1 2025 with 18% outperformance.", title: "BTC Momentum", color: "blue" },
                { quote: "Arbitrage executed 14K trades in March with 99.7% success rate.", title: "Cross‑Exchange", color: "teal" },
                { quote: "Protection algo cut drawdown by 65% vs. holding during crash.", title: "Volatility Shield", color: "blue" },
              ].map((t) => (
                <Card key={t.title} className={`bg-${t.color}-50 hover:shadow-lg transition border-2 border-${t.color}-100`}>
                  <CardContent className="pt-6">
                    <p className="italic mb-4 text-gray-800">"{t.quote}"</p>
                    <h4 className="font-semibold text-blue-700">{t.title}</h4>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 bg-gradient-to-br from-blue-50 to-teal-50">
          <div className="container mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-3xl font-bold text-blue-700 mb-6">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Starter", price: "$99/mo", feats: ["5 Algorithms", "Basic Backtests", "Email Support"], popular: false },
                { name: "Pro", price: "$249/mo", feats: ["15 Algos", "Advanced Backtests", "Priority Support"], popular: true },
                { name: "Enterprise", price: "Contact", feats: ["Unlimited", "White Label", "Dedicated Support"], popular: false },
              ].map((p) => (
                <Card
                  key={p.name}
                  className={`transition transform hover:-translate-y-2 ${p.popular ? "border-4 border-teal-400 shadow-xl" : "border-2 border-blue-100"}`}>
                  <CardContent className="text-center pt-6">
                    {p.popular && <div className="mb-2 text-sm font-semibold text-teal-500">MOST POPULAR</div>}
                    <h3 className="text-2xl font-bold text-blue-700 mb-2">{p.name}</h3>
                    <div className="text-4xl font-extrabold text-blue-800 mb-4">{p.price}</div>
                    <ul className="space-y-1 mb-4 text-gray-700">
                      {p.feats.map((f) => <li key={f}>• {f}</li>)}
                    </ul>
                    <Button className={`w-full ${p.popular ? "bg-teal-500 hover:bg-teal-600" : "bg-blue-600 hover:bg-blue-700"} text-white`}>
                      {p.popular ? "Get Pro" : `Select ${p.name}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 bg-white">
          <div className="container mx-auto max-w-3xl px-6">
            <h2 className="text-3xl font-bold text-blue-700 text-center mb-6">Frequently Asked Questions</h2>
            {[
              { q: "Is coding required?", a: "No—guided setup walks you through every step." },
              { q: "How secure is my data?", a: "We use end-to-end encryption and never store keys." },
              { q: "Which exchanges?", a: "Connect any major exchange via API in minutes." },
            ].map(({ q, a }) => (
              <details key={q} className="mb-4 border-b pb-2 border-blue-100">
                <summary className="cursor-pointer font-medium text-blue-700">{q}</summary>
                <p className="mt-2 text-gray-700">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-center">
          <div className="container mx-auto max-w-3xl px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Trade Smarter?</h2>
            <p className="mb-6">Start your free 14-day trial and experience professional quant trading today.</p>

            <Link href="/login">
              <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white">Create Free Account</Button>
            </Link>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-16">
        <div className="container mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">QuantEdge</h3>
            <p className="text-sm text-blue-200">Next‑generation algorithmic trading for crypto markets.</p>
          </div>
          {[
            { title: "Company", links: ["About", "Team", "Careers", "Blog"] },
            { title: "Product", links: ["Features", "Pricing", "API", "Docs"] },
            { title: "Support", links: ["Help Center", "Community", "Contact", "Status"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold mb-3 text-teal-300">{col.title}</h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l}><Link href="#" className="text-blue-200 hover:text-white hover:underline">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-blue-300 mt-8">© 2025 QuantEdge. All rights reserved.</div>
      </footer>
    </>
  );
}