import Link from "next/link";
import { ArrowRight, Zap, Lock, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">₵</span>
            </div>
            <span className="text-xl font-bold text-primary">BuyData</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              href="/login"
              className="px-6 py-2 text-primary hover:text-accent transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
            >
              Join as Agent
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-primary mb-6 leading-tight">
                Sell Data <span className="text-accent">Effortlessly</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Become a data reseller in minutes. Activate your account, get your unique link, and start earning with BuyData.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 gradient-primary text-white rounded-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2 justify-center"
                >
                  Get Started <ArrowRight size={20} />
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-4 border-2 border-primary text-primary rounded-lg hover:bg-light-purple transition-all font-semibold"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-2xl blur-3xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-l-4 border-primary">
                    <p className="text-sm text-gray-600">Agent Link</p>
                    <p className="font-mono text-primary font-bold">buydata.shop/great-data-17687</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Monthly Earnings</p>
                    <p className="text-2xl font-bold text-green-600">GH₵ 2,450.50</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-primary">845</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-light-purple">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-primary mb-16">
            Why Choose BuyData?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Quick Setup",
                description: "Register and activate in minutes. Pay just GH₵20 to start selling.",
              },
              {
                icon: TrendingUp,
                title: "Earn More",
                description: "10% commission on every sale. Withdraw anytime to your mobile wallet.",
              },
              {
                icon: Lock,
                title: "Secure & Reliable",
                description: "Powered by Paystack for secure payments. DataMart for instant delivery.",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-8 border border-gray-200 hover:border-primary hover:shadow-lg transition-all"
                >
                  <div className="w-14 h-14 rounded-lg gradient-primary flex items-center justify-center mb-6">
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Price Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-primary mb-6">Simple Pricing</h2>
          <p className="text-xl text-gray-600 mb-12">
            Just one-time activation fee to get started
          </p>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-primary max-w-sm mx-auto">
            <h3 className="text-2xl font-bold text-primary mb-4">Activation</h3>
            <div className="text-5xl font-bold text-primary mb-2">GH₵ 20</div>
            <p className="text-gray-600 mb-8">One-time payment to activate your account</p>
            <Link
              href="/register"
              className="block w-full px-6 py-3 gradient-primary text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Activate Now
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join hundreds of agents already making money with BuyData
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-primary rounded-lg hover:shadow-xl transition-all font-semibold"
          >
            Register Free Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-600">
          <p>© 2026 BuyData. All rights reserved.</p>
          <p className="text-sm mt-2">
            Secure payments powered by Paystack. Data fulfilled by DataMart.
          </p>
        </div>
      </footer>
    </div>
  );
}
