import Link from "next/link";
import { ArrowRight, Zap, Lock, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-lg">₵</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-primary hidden xs:inline">BuyData</span>
          </div>
          <div className="flex gap-2 sm:gap-4 items-center">
            <Link
              href="/login"
              className="px-3 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-base text-primary hover:text-accent transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3 sm:px-6 py-1.5 sm:py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-shadow font-medium text-xs sm:text-base"
            >
              Join
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-4 sm:mb-6 leading-tight">
                Sell Data <span className="text-accent">Effortlessly</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Become a data reseller in minutes. Activate your account, get your unique link, and start earning with BuyData.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/register"
                  className="px-6 sm:px-8 py-3 sm:py-4 gradient-primary text-white rounded-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2 justify-center text-sm sm:text-base"
                >
                  Get Started <ArrowRight size={18} className="hidden sm:inline" />
                </Link>
                <Link
                  href="#features"
                  className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-primary text-primary rounded-lg hover:bg-light-purple transition-all font-semibold text-sm sm:text-base"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-xl sm:rounded-2xl blur-3xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-indigo-200">
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-white rounded-lg p-3 sm:p-4 border-l-4 border-primary">
                    <p className="text-xs sm:text-sm text-gray-600">Agent Link</p>
                    <p className="font-mono text-xs sm:text-sm text-primary font-bold break-all">buydata.shop/your-unique-link</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600">Monthly Earnings</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">GH₵ 2,450.50</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
                    <p className="text-xl sm:text-2xl font-bold text-primary">845</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-3 sm:px-4 bg-light-purple">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-primary mb-12 lg:mb-16">
            Why Choose BuyData?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Zap,
                title: "Quick Setup",
                description: "Register and activate in minutes. Pay just GH₵20 to start selling.",
              },
              {
                icon: TrendingUp,
                title: "Earn More",
                description: "set your own prices. Withdraw anytime to your mobile wallet.",
              },
              {
                icon: Lock,
                title: "Secure & Reliable",
                description: "Powered by Paystack for secure payments.",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 border border-gray-200 hover:border-primary hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg gradient-primary flex items-center justify-center mb-4 sm:mb-6">
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Price Section */}
      <section className="py-16 sm:py-20 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-4 sm:mb-6">Simple Pricing</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-10 sm:mb-12">
            Just one-time activation fee to get started
          </p>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg sm:rounded-2xl p-6 sm:p-8 border-2 border-primary max-w-sm mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">Activation</h3>
            <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">GH₵ 20</div>
            <p className="text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8">One-time payment to activate your account</p>
            <Link
              href="/register"
              className="block w-full px-6 py-3 gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm sm:text-base"
            >
              Activate Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 sm:py-12 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-600 text-xs sm:text-sm">
          <p>© 2026 BuyData. All rights reserved.</p>
          <p className="text-xs sm:text-xs mt-2">
            Secure payments powered by Paystack. Data fulfilled by DataMart.
          </p>
        </div>
      </footer>
    </div>
  );
}
