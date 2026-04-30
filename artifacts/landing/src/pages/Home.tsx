import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Clock, Activity, Shield, Sparkles, ChevronRight, Heart, ArrowRight } from "lucide-react";

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = document.querySelectorAll(".reveal-on-scroll");

    if (prefersReducedMotion) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in", "fade-in", "slide-in-from-bottom-8", "duration-1000", "fill-mode-forwards");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => {
      el.classList.add("opacity-0");
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] overflow-x-hidden font-sans bg-background text-foreground">
      
      {/* Skip navigation link for keyboard users (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Nav */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-2 text-foreground">
          <Moon className="h-6 w-6 fill-current text-primary" aria-hidden="true" />
          <span className="font-bold text-xl tracking-tight">Let's Snooze</span>
        </div>
        <nav aria-label="Main navigation" className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">Stories</a>
        </nav>
        <Button asChild className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90 shadow-md hover:shadow-lg transition-all">
          <a href="https://ashy-moss-0384b1e10.7.azurestaticapps.net"
        </Button>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 lg:px-12 overflow-hidden min-h-[90vh] flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl -z-10" aria-hidden="true"></div>
          
          <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur border border-white text-foreground text-sm font-medium mb-4 shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>For the exhausted overachiever</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              Stop doomscrolling. <br/>
              <span className="relative inline-block mt-4">
                Start sleeping.
                <svg className="absolute w-[110%] h-4 -bottom-2 -left-2 text-accent/60 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A calm, caring digital curfew that gently holds you accountable. 
              Because you can't lead your team or build your company if you're running on empty.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button asChild size="lg" className="rounded-full px-8 h-14 text-lg bg-foreground hover:bg-foreground/90 text-background shadow-xl hover:shadow-foreground/20 hover:-translate-y-1 transition-all">
                <a href="https://ashy-moss-0384b1e10.7.azurestaticapps.net"
                  Reclaim your bedtime <ChevronRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <p className="text-sm text-muted-foreground mt-4 sm:mt-0 sm:ml-4">
                Free forever. No ads. Just sleep.
              </p>
            </div>
          </div>
          
        </section>

        {/* Social Proof / The Problem */}
        <section id="testimonials" className="py-24 bg-white px-6 lg:px-12 border-y border-border reveal-on-scroll">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
              Sound familiar?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Just one more page refresh...",
                  author: "Startup Founder at 2:00 AM"
                },
                {
                  quote: "I'll go to sleep after this video...",
                  author: "Tech Lead at 1:30 AM"
                },
                {
                  quote: "Why am I so tired today?",
                  author: "You, every morning"
                }
              ].map((item, i) => (
                <div key={i} className="bg-background p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-lg font-medium text-foreground mb-4 leading-relaxed">"{item.quote}"</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                    <Heart className="h-4 w-4 text-primary/50" aria-hidden="true" />
                    {item.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Highlights with Images */}
        <section id="how-it-works" className="py-32 px-6 lg:px-12 bg-background overflow-hidden">
          <div className="max-w-6xl mx-auto">
            {/* Feature Row 1 */}
            <div className="flex flex-col md:flex-row items-center gap-16 mb-32 reveal-on-scroll">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/30 text-accent-foreground mb-4" aria-hidden="true">
                  <Shield className="h-6 w-6" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  The gentle digital curfew
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Set your My Sleep Window. When it's time for bed, we gently lock you out of distracting apps. It's a warm boundary, not a punishment.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-center gap-3 text-foreground font-medium">
                    <ArrowRight className="h-5 w-5 text-primary" aria-hidden="true" /> No scrolling past bedtime
                  </li>
                  <li className="flex items-center gap-3 text-foreground font-medium">
                    <ArrowRight className="h-5 w-5 text-primary" aria-hidden="true" /> Easy to bypass in an emergency
                  </li>
                  <li className="flex items-center gap-3 text-foreground font-medium">
                    <ArrowRight className="h-5 w-5 text-primary" aria-hidden="true" /> Builds healthy boundaries
                  </li>
                </ul>
              </div>
              <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] -rotate-3 transform origin-bottom-left"></div>
                <img src="/src/assets/images/bedtime-peace.png" alt="Peaceful cozy bedroom" className="relative rounded-[2rem] shadow-xl w-full object-cover aspect-square" />
              </div>
            </div>

            {/* Feature Row 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-16 reveal-on-scroll">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary mb-4" aria-hidden="true">
                  <Sun className="h-6 w-6" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  Start your day with intent
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Morning Pulse is a caring daily check-in. How rested do you actually feel today? Connect how you feel with what time you put the phone down.
                </p>
                 <ul className="space-y-4 pt-4">
                  <li className="flex items-center gap-3 text-foreground font-medium">
                    <ArrowRight className="h-5 w-5 text-accent-foreground" aria-hidden="true" /> One-tap morning check-in
                  </li>
                  <li className="flex items-center gap-3 text-foreground font-medium">
                    <ArrowRight className="h-5 w-5 text-accent-foreground" aria-hidden="true" /> Track your alertness over time
                  </li>
                  <li className="flex items-center gap-3 text-foreground font-medium">
                    <ArrowRight className="h-5 w-5 text-accent-foreground" aria-hidden="true" /> See the impact of sleep on your mood
                  </li>
                </ul>
              </div>
              <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-secondary rounded-[2.5rem] rotate-3 transform origin-top-right"></div>
                <img src="/src/assets/images/morning-light.png" alt="Morning light on bed" className="relative rounded-[2rem] shadow-xl w-full object-cover aspect-[4/3]" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 px-6 lg:px-12 bg-white relative reveal-on-scroll">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Everything you need. <br/>Nothing you don't.</h2>
              <p className="text-lg text-muted-foreground">
                We don't scold you for staying up. We just make it easier to put the phone down and close your eyes.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
              {/* Feature 1 */}
              <div className="flex gap-6 p-8 rounded-3xl bg-background border border-border/50 hover:shadow-md transition-all">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-secondary flex items-center justify-center text-secondary-foreground" aria-hidden="true">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">My Sleep Log</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    A frictionless way to track when you sleep and wake. 
                    No complicated charts or wearables required. Just tap and go to sleep.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-6 p-8 rounded-3xl bg-background border border-border/50 hover:shadow-md transition-all">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-accent/30 flex items-center justify-center text-accent-foreground" aria-hidden="true">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">My Sleep Insights</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Watch your streak grow. See how your screen-free nights correlate with your morning alertness. 
                    Gentle encouragement to keep the streak alive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Empathy Section */}
        <section className="py-32 px-6 lg:px-12 bg-secondary/50 text-center reveal-on-scroll">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">You're doing enough.</h2>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              The emails can wait until morning. The Slack messages will be there tomorrow. 
              The news cycle will continue without you. 
            </p>
            <p className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed pt-4">
              Give yourself permission to log off.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 lg:px-12 relative overflow-hidden bg-foreground text-background reveal-on-scroll">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
              Ready to sink into clean sheets?
            </h2>
            <p className="text-xl md:text-2xl text-background/80 max-w-2xl mx-auto">
              Join thousands of professionals who are reclaiming their nights and dominating their days.
            </p>
            
            <Button asChild size="lg" className="rounded-full px-12 h-16 text-xl bg-background text-foreground hover:bg-background/90 shadow-2xl hover:scale-105 transition-transform duration-300">
              <a href="https://ashy-moss-0384b1e10.7.azurestaticapps.net"
                Open Let's Snooze
              </a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 lg:px-12 bg-white border-t border-border text-center text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-6 text-foreground">
          <Moon className="h-5 w-5 fill-current text-primary" aria-hidden="true" />
          <span className="font-bold text-lg">Let's Snooze</span>
        </div>
        <p className="text-sm">Built for tired people, with care.</p>
        <p className="text-sm mt-2">&copy; {new Date().getFullYear()} Let's Snooze. Sleep well.</p>
      </footer>
    </div>
  );
}
