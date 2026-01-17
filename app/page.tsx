import Image from "next/image"
import { VinChecker } from "@/components/vin-checker"
import { Shield, Zap, Car } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
            <Image 
              src="/favicon.ico" 
              alt="VinCheckHub" 
              className="h-10 w-10 rounded" 
              width={40} 
              height={40}
            />
            <span className="font-bold text-xl text-blue-700">
              VINCheckHub
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/50 to-background">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Free & Instant Results
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
              Check Any VIN Free
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
              Decode vehicle identification numbers instantly. Get detailed information about any vehicle including
              make, model, year, engine, and body style.
            </p>

            <VinChecker />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Why Use VinCheckHub?</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Instant Results</h3>
                <p className="text-muted-foreground text-sm">
                  Get vehicle information in seconds with our fast API connection.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Official Data</h3>
                <p className="text-muted-foreground text-sm">
                  Powered by NHTSA's official vehicle database for accurate results.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">100% Free</h3>
                <p className="text-muted-foreground text-sm">
                  No hidden fees or subscriptions. Check unlimited VINs for free.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-3xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <span className="text-muted-foreground">Enter your 17-character VIN</span>
              </div>
              <div className="hidden md:block w-12 h-px bg-border"></div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <span className="text-muted-foreground">Click Decode VIN</span>
              </div>
              <div className="hidden md:block w-12 h-px bg-border"></div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-muted-foreground">View vehicle details</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">Powered by NHTSA vPIC</p>
          <p className="text-xs text-muted-foreground mt-2">
            Data provided by the National Highway Traffic Safety Administration Vehicle Product Information Catalog
          </p>
        </div>
      </footer>
    </div>
  )
}
