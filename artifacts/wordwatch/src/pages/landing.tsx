import { Link } from "wouter";
import { Search, Feather, Info } from "lucide-react";

export default function Landing() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-[100dvh] flex flex-col selection:bg-primary/30 selection:text-primary bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur z-20 sticky top-0">
        <div className="container flex h-16 items-center justify-between max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-4">
            <img src={`${basePath}/logo.svg`} alt="Noeticnonsense" className="h-8 w-8 drop-shadow-md" />
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xl font-medium tracking-wide text-foreground">WordWatch</span>
              <span className="text-muted-foreground text-sm font-serif italic hidden sm:inline-block">— Noeticnonsense</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-foreground/80 hover:text-primary transition-colors font-sans text-sm font-medium">
              Sign In
            </Link>
            <Link href="/sign-up" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 font-sans">
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="container max-w-screen-xl mx-auto px-4 md:px-8 relative z-10 text-center space-y-8">
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground tracking-tight leading-tight max-w-4xl mx-auto">
              Inspect the <span className="text-primary italic">Ink.</span>
            </h1>
            <p className="text-muted-foreground font-sans text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
              The premier dark-academia tool to detect artificial cadence and translate machine prose back into human reality.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/sign-up" className="inline-flex h-14 items-center justify-center rounded-md bg-primary px-8 text-lg font-serif tracking-wide text-primary-foreground shadow-[0_0_25px_rgba(204,153,51,0.25)] transition-colors hover:bg-primary/90 w-full sm:w-auto">
                Begin Your Analysis
              </Link>
              <Link href="/sign-in" className="inline-flex h-14 items-center justify-center rounded-md border border-border/50 bg-secondary/50 px-8 text-lg font-serif tracking-wide text-foreground transition-colors hover:border-primary/30 hover:bg-secondary w-full sm:w-auto">
                Return to the Desk
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 border-t border-border/30 bg-card/10">
          <div className="container max-w-screen-xl mx-auto px-4 md:px-8 space-y-16">
            <div className="text-center space-y-4">
              <h2 className="font-serif text-3xl md:text-5xl text-foreground">Master Your Prose</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Equip yourself with the tools to discern origin and restore soul to your writing.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-card border border-border/40 shadow-sm space-y-4 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl text-foreground">Detect Pattern</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Identify artificial generation with precision. Our models parse the latent signals left by machine cadence.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-card border border-border/40 shadow-sm space-y-4 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl text-foreground">Understand Why</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Don't just get a score. Receive a detailed breakdown of flagged passages and key indicators driving the verdict.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-card border border-border/40 shadow-sm space-y-4 relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <Feather className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl text-foreground">Humanize Text</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Translate rigid, sterile prose into warm, human reality. Let your words breathe with natural nuance and flow.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-10 mt-auto bg-background z-10">
        <div className="container flex flex-col items-center justify-center gap-6 max-w-screen-2xl mx-auto px-4 text-center">
          <p className="text-lg text-primary/90 font-serif italic tracking-wide">
            "Words felt. Reality translated."
          </p>
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground/60 font-sans tracking-wide">
            <span>© 2026 Noeticnonsense. All verses reserved.</span>
            <a href="mailto:Noeticnonsense@icloud.com" className="hover:text-primary transition-colors duration-300">
              Noeticnonsense@icloud.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}