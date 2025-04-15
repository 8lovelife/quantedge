"use client"
import React from 'react';

// Component for the header section
const Header: React.FC = () => {
  return (
    <header className="fixed w-full top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto max-w-7xl px-4 py-5 flex justify-between items-center">
        <a href="#" className="text-2xl font-bold text-gray-800">
          Quant<span className="text-blue-600">Edge</span>
        </a>
        <nav className="hidden md:block">
          <ul className="flex">
            <li className="ml-8"><a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a></li>
            <li className="ml-8"><a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">How It Works</a></li>
            <li className="ml-8"><a href="#performance" className="text-gray-700 hover:text-blue-600 transition-colors">Performance</a></li>
            <li className="ml-8"><a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a></li>
            <li className="ml-8"><a href="#faq" className="text-gray-700 hover:text-blue-600 transition-colors">FAQ</a></li>
          </ul>
        </nav>
        <a href="#" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Get Started
        </a>
      </div>
    </header>
  );
};

// Component for the hero section
const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-blue-100 pt-40 pb-24 text-center">
      <div className="container mx-auto max-w-7xl px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-5 text-gray-800">Algorithmic Precision for Crypto Market Advantage</h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Advanced quantitative trading strategies designed to capitalize on market inefficiencies and deliver consistent returns in the volatile crypto landscape.
        </p>
        <div className="flex flex-wrap justify-center gap-5">
          <a href="#" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Start Free Trial
          </a>
          <a href="#" className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors">
            Request Demo
          </a>
        </div>
        <div className="mt-16">
          <img src="/api/placeholder/800/400" alt="QuantEdge Dashboard" className="mx-auto rounded-lg shadow-xl" />
        </div>
      </div>
    </section>
  );
};

// Feature component
interface FeatureProps {
  icon: string;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg hover:transform hover:-translate-y-2 transition-transform duration-300">
      <div className="text-4xl mb-5 text-blue-600">{icon}</div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Stat component
interface StatProps {
  value: string;
  label: string;
}

const Stat: React.FC<StatProps> = ({ value, label }) => {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-blue-600 mb-2">{value}</div>
      <p className="text-gray-600">{label}</p>
    </div>
  );
};

// Features section
const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-800">Powerful Features Built for Quant Traders</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our comprehensive suite of tools gives you the edge in the crypto markets with advanced algorithms and real-time data analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <Feature
            icon="📊"
            title="Algorithmic Trading Strategies"
            description="Multiple automated trading algorithms tailored specifically for cryptocurrency markets."
          />
          <Feature
            icon="📈"
            title="Data Analytics Engine"
            description="Real-time market analysis across multiple exchanges to identify optimal trading opportunities."
          />
          <Feature
            icon="🛡️"
            title="Risk Management Framework"
            description="Advanced position sizing and drawdown protection to preserve capital during market volatility."
          />
          <Feature
            icon="⏱️"
            title="Backtesting Platform"
            description="Comprehensive historical performance analysis to validate strategies before deployment."
          />
          <Feature
            icon="🔄"
            title="Exchange Integration"
            description="Direct API connections to all major crypto exchanges for seamless execution."
          />
          <Feature
            icon="📱"
            title="Performance Dashboard"
            description="Real-time monitoring of trading performance with detailed analytics and insights."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mt-16">
          <Stat value="12.4%" label="Average Monthly Return" />
          <Stat value="2.1" label="Sharpe Ratio" />
          <Stat value="15+" label="Trading Algorithms" />
          <Stat value="24/7" label="Automated Trading" />
        </div>
      </div>
    </section>
  );
};

// Step component for How It Works section
interface StepProps {
  number: number;
  title: string;
  description: string;
  isLast?: boolean;
}

const Step: React.FC<StepProps> = ({ number, title, description, isLast = false }) => {
  return (
    <div className="text-center relative">
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 font-bold text-white">
        {number}
      </div>
      {!isLast && (
        <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-blue-600 opacity-30"></div>
      )}
      <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// How It Works section
const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gray-100">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-800">How QuantEdge Works</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our advanced trading system operates seamlessly to identify and capitalize on market opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative">
          <Step
            number={1}
            title="Data Collection"
            description="Our system aggregates real-time data from multiple exchanges and market sources."
          />
          <Step
            number={2}
            title="Analysis"
            description="Proprietary algorithms analyze market patterns and identify trading opportunities."
          />
          <Step
            number={3}
            title="Execution"
            description="Trades are executed automatically with precision timing and risk parameters."
          />
          <Step
            number={4}
            title="Optimization"
            description="System continuously learns and adapts strategies based on performance feedback."
            isLast={true}
          />
        </div>
      </div>
    </section>
  );
};

// Performance section
const Performance: React.FC = () => {
  return (
    <section id="performance" className="py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-800">Performance Metrics</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our quantitative strategies have consistently outperformed major crypto benchmarks while maintaining lower volatility.
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <img src="/api/placeholder/800/400" alt="Performance Chart" className="mx-auto" />
        </div>

        <p className="text-gray-500 text-sm mt-3 text-center">
          *Past performance is not indicative of future results. Backtested data from January 2022 - October 2024.
        </p>
      </div>
    </section>
  );
};

// Testimonial component
interface TestimonialProps {
  quote: string;
  name: string;
  title: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ quote, name, title }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-blue-600">
      <p className="italic mb-5 text-gray-700">{quote}</p>
      <div className="flex items-center">
        <img src="/api/placeholder/50/50" alt={name} className="w-12 h-12 rounded-full mr-4" />
        <div>
          <h4 className="font-medium text-gray-800">{name}</h4>
          <p className="text-gray-600 text-sm">{title}</p>
        </div>
      </div>
    </div>
  );
};

// Testimonials section
const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-gray-100">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-800">What Our Clients Say</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Hear from traders who have transformed their crypto investment approach with QuantEdge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Testimonial
            quote="QuantEdge has completely transformed how I approach the crypto markets. The algorithmic strategies have delivered consistent returns even during market downturns."
            name="Alex Chen"
            title="Crypto Fund Manager"
          />
          <Testimonial
            quote="The backtesting capabilities are unmatched. I can validate strategies across multiple market conditions before deploying capital, which has been invaluable."
            name="Sarah Johnson"
            title="Quantitative Analyst"
          />
          <Testimonial
            quote="As someone who struggled with emotional trading, QuantEdge's systematic approach has been a game-changer. My portfolio has grown 3x since implementing their strategies."
            name="Michael Rivera"
            title="Individual Investor"
          />
        </div>
      </div>
    </section>
  );
};

// Plan component for pricing
interface PlanProps {
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
}

const Plan: React.FC<PlanProps> = ({ name, price, features, isPopular = false, buttonText }) => {
  return (
    <div className={`bg-white p-8 rounded-lg shadow-lg text-center transition-transform hover:scale-105 ${isPopular ? 'border-2 border-blue-600 relative' : ''}`}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-sm py-1 px-4 rounded-full font-medium">
          Most Popular
        </div>
      )}
      <div className="text-2xl font-bold mb-4 text-gray-800">{name}</div>
      <div className="text-4xl font-bold mb-5 text-gray-800">
        {price}<span className="text-gray-500 text-base">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="py-2 border-b border-gray-200 text-gray-600 last:border-b-0">{feature}</li>
        ))}
      </ul>
      <a
        href="#"
        className={`inline-block px-6 py-3 rounded-lg font-medium ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'} text-white transition-colors`}
      >
        {buttonText}
      </a>
    </div>
  );
};

// Pricing section
const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-800">Choose Your Plan</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Select the package that best suits your trading needs and investment goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Plan
            name="Starter"
            price="$99"
            features={[
              "5 Trading Algorithms",
              "Basic Backtesting",
              "Manual Strategy Execution",
              "Exchange Integration (2 exchanges)",
              "Email Support"
            ]}
            buttonText="Get Started"
          />
          <Plan
            name="Professional"
            price="$249"
            features={[
              "15 Trading Algorithms",
              "Advanced Backtesting",
              "Automated Strategy Execution",
              "Exchange Integration (5 exchanges)",
              "Priority Support",
              "Strategy Customization",
              "Risk Management Suite"
            ]}
            isPopular={true}
            buttonText="Get Started"
          />
          <Plan
            name="Enterprise"
            price="$599"
            features={[
              "All Trading Algorithms",
              "Premium Backtesting",
              "Fully Automated Trading",
              "Unlimited Exchange Integration",
              "24/7 Dedicated Support",
              "Custom Strategy Development",
              "Advanced Risk Management",
              "API Access",
              "White Label Solutions"
            ]}
            buttonText="Contact Sales"
          />
        </div>
      </div>
    </section>
  );
};

// FAQ Item component
interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md mb-5 overflow-hidden">
      <div
        className="p-5 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-medium text-gray-800">{question}</h3>
        <span className="text-blue-600 font-bold">{isOpen ? '−' : '+'}</span>
      </div>
      {isOpen && (
        <div className="px-5 pb-5 text-gray-600 border-t border-gray-200">
          {answer}
        </div>
      )}
    </div>
  );
};

// FAQ section
const Faq: React.FC = () => {
  return (
    <section id="faq" className="py-24 bg-gray-100">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gray-800">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about QuantEdge and quantitative crypto trading.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <FaqItem
            question="What is quantitative trading?"
            answer="Quantitative trading uses mathematical models and algorithms to identify and execute trading opportunities in financial markets. Unlike discretionary trading, quant trading removes emotional decision-making and relies on data-driven strategies."
          />
          <FaqItem
            question="How much capital do I need to start?"
            answer="While there's no minimum capital requirement to use QuantEdge, we typically recommend starting with at least $10,000 to effectively implement our strategies across multiple cryptocurrency pairs."
          />
          <FaqItem
            question="What kind of returns can I expect?"
            answer="Historical backtesting shows our strategies have generated average monthly returns of 8-15% during various market conditions. However, past performance is not indicative of future results, and all trading involves risk."
          />
          <FaqItem
            question="How secure is my trading data?"
            answer="QuantEdge employs industry-leading security measures including end-to-end encryption, two-factor authentication, and API key restrictions. We never store your private keys, and our system uses read-only API access when possible."
          />
          <FaqItem
            question="Do I need technical knowledge to use QuantEdge?"
            answer="No. While QuantEdge is built on sophisticated algorithms, our user interface is designed to be intuitive and accessible to traders of all experience levels. Advanced users can customize strategies, while beginners can use pre-configured algorithms."
          />
        </div>
      </div>
    </section>
  );
};

// CTA section
const CTA: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-500 text-center">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-5 text-white">Start Trading Smarter Today</h2>
        <p className="text-white mb-8 max-w-3xl mx-auto opacity-90">
          Join thousands of traders who have transformed their crypto investment approach with QuantEdge's powerful quantitative strategies.
        </p>
        <a href="#" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          Start Your Free 14-Day Trial
        </a>
      </div>
    </section>
  );
};

// Footer column component
interface FooterColumnProps {
  title: string;
  links: Array<{ text: string; href: string }>;
}

const FooterColumn: React.FC<FooterColumnProps> = ({ title, links }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-5 text-gray-800">{title}</h3>
      <ul className="space-y-3">
        {links.map((link, index) => (
          <li key={index}>
            <a href={link.href} className="text-gray-600 hover:text-blue-600 transition-colors">
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Footer
const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-16 pb-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-10">
          <div>
            <h3 className="text-lg font-medium mb-5 text-gray-800">QuantEdge</h3>
            <p className="text-gray-600">
              Advanced quantitative trading solutions for cryptocurrency markets.
            </p>
          </div>

          <FooterColumn
            title="Product"
            links={[
              { text: "Features", href: "#" },
              { text: "Pricing", href: "#" },
              { text: "Roadmap", href: "#" },
              { text: "Changelog", href: "#" }
            ]}
          />

          <FooterColumn
            title="Resources"
            links={[
              { text: "Documentation", href: "#" },
              { text: "API Reference", href: "#" },
              { text: "Blog", href: "#" },
              { text: "Knowledge Base", href: "#" }
            ]}
          />

          <FooterColumn
            title="Company"
            links={[
              { text: "About Us", href: "#" },
              { text: "Careers", href: "#" },
              { text: "Contact", href: "#" },
              { text: "Partners", href: "#" }
            ]}
          />

          <FooterColumn
            title="Legal"
            links={[
              { text: "Terms of Service", href: "#" },
              { text: "Privacy Policy", href: "#" },
              { text: "Risk Disclosure", href: "#" },
              { text: "Security", href: "#" }
            ]}
          />
        </div>

        <div className="border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
          <p>
            &copy; 2025 QuantEdge. All rights reserved. Trading cryptocurrencies involves significant risk and can result in the loss of your invested capital. You should not invest more than you can afford to lose.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main App component
const QuantEdgeLandingPage: React.FC = () => {
  return (
    <div className="bg-white text-gray-800">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Performance />
      <Testimonials />
      <Pricing />
      <Faq />
      <CTA />
      <Footer />
    </div>
  );
};

export default QuantEdgeLandingPage;