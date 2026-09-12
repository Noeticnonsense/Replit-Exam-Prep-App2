import React, { useState, useMemo, useEffect } from 'react';
import { getGetMembershipQueryKey, useAnalyzeText, useHumanizeText, useGetMembership, useStartCheckout, useVerifyCheckout } from '@workspace/api-client-react';
import type { TextAnalysisInputWritingType } from '@workspace/api-client-react';
import type { TextAnalysisResult, HumanizeResult } from '@workspace/api-client-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Search, Feather, Info, AlertTriangle, Sparkles, CheckCircle2, Lock, Crown, Loader2 } from 'lucide-react';
import { Gauge } from '@/components/gauge';
import { EngagingLoader } from '@/components/engaging-loader';
import { useLocation } from 'wouter';

const WRITING_TYPES = [
  { value: 'poem', label: 'Poem' },
  { value: 'essay', label: 'Essay' },
  { value: 'academic', label: 'Academic' },
  { value: 'blog', label: 'Blog' },
  { value: 'story', label: 'Story' },
  { value: 'letter', label: 'Letter' },
  { value: 'article', label: 'Article' },
  { value: 'social', label: 'Social' },
  { value: 'speech', label: 'Speech' },
  { value: 'technical', label: 'Technical' },
  { value: 'other', label: 'Other' },
];

function AnalysisResultView({ result, isMember }: { result: TextAnalysisResult; isMember: boolean }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center pb-8 border-b border-border/50">
        <h3 className="font-serif text-2xl text-foreground mb-8">Verification Result</h3>
        <Gauge value={result.aiProbability} label={result.label} />
      </div>

      <div className="space-y-4">
        <h4 className="font-serif text-lg text-primary flex items-center gap-2">
          <Info className="w-5 h-5" />
          Verdict Summary
        </h4>
        <p className="text-foreground/80 leading-relaxed text-lg">
          {result.summary}
        </p>
      </div>

      {/* Gated section — blurred for non-members */}
      <div className={`space-y-8 relative transition-all duration-300 ${!isMember ? 'pointer-events-none select-none' : ''}`}>
        {!isMember && (
          <div className="absolute inset-0 z-10 backdrop-blur-sm rounded-xl" />
        )}

        {result.reasons && result.reasons.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-primary flex items-center gap-2">
              <Search className="w-5 h-5" />
              Key Indicators
            </h4>
            <ul className="space-y-3">
              {result.reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/80">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span className="leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.signals && result.signals.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Flagged Passages
            </h4>
            <div className="space-y-4">
              {result.signals.map((signal, i) => (
                <div key={i} className="p-5 rounded-xl bg-card border border-border/40 shadow-sm space-y-3 relative overflow-hidden group hover:border-primary/30 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 group-hover:bg-primary transition-colors" />
                  <div className="font-serif text-foreground/90 italic text-lg leading-relaxed pl-2">
                    "{signal.phrase}"
                  </div>
                  <div className="text-sm text-muted-foreground pl-2 flex items-start gap-2">
                    <span className="text-primary/70 shrink-0 mt-0.5">↳</span>
                    {signal.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HumanizeResultView({ result, isMember }: { result: HumanizeResult; isMember: boolean }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.humanizedText);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "The text is ready for your quill.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      <div className="flex items-center justify-between pb-6 border-b border-border/50">
        <h3 className="font-serif text-2xl text-foreground">Translated Reality</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy} 
          className={`gap-2 transition-all ${copied ? 'bg-primary/20 text-primary border-primary/30' : ''}`}
        >
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      <div className={`flex-1 space-y-8 relative transition-all duration-300 ${!isMember ? 'pointer-events-none select-none' : ''}`}>
        {!isMember && (
          <div className="absolute inset-0 z-10 backdrop-blur-sm rounded-xl" />
        )}

        <div className="p-6 md:p-8 rounded-xl bg-card border border-border/40 shadow-sm relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] pointer-events-none" />
          <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed font-serif text-lg md:text-xl relative z-10">
            {result.humanizedText}
          </p>
        </div>

        {result.changesExplained && result.changesExplained.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Altered Nuances
            </h4>
            <ul className="space-y-3">
              {result.changesExplained.map((change, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/80">
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span className="leading-relaxed">{change}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function PaywallOverlay({ onUpgrade, isLoading }: { onUpgrade: () => void; isLoading: boolean }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-10 pointer-events-none">
      {/* fade-from-transparent gradient at the bottom of the results */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background/95 via-background/70 to-transparent pointer-events-none rounded-b-2xl" />
      
      <div className="relative pointer-events-auto flex flex-col items-center gap-5 text-center px-6 max-w-sm">
        <div className="flex items-center gap-2 text-primary/80">
          <Lock className="w-5 h-5" />
          <span className="font-serif text-lg">Full Results Locked</span>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Unlock Key Indicators, Flagged Passages, and Humanized text with a WordWatch Pro membership.
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 font-mono">
          <Crown className="w-3.5 h-3.5 text-primary/60" />
          <span>$9.99 / month — cancel anytime</span>
        </div>
        <Button
          onClick={onUpgrade}
          disabled={isLoading}
          className="h-12 px-8 font-serif text-base tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/50 shadow-[0_0_30px_rgba(201,168,76,0.3)] hover:shadow-[0_0_40px_rgba(201,168,76,0.45)] transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preparing checkout…
            </>
          ) : (
            <>
              <Crown className="w-4 h-4 mr-2 opacity-80" />
              Unlock Full Results
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function Home() {
  const [text, setText] = useState("");
  const [writingType, setWritingType] = useState<TextAnalysisInputWritingType>("essay");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const analyzeMutation = useAnalyzeText();
  const humanizeMutation = useHumanizeText();
  const startCheckoutMutation = useStartCheckout();
  const verifyCheckoutMutation = useVerifyCheckout();

  const membershipQuery = useGetMembership({
    query: {
      queryKey: getGetMembershipQueryKey(),
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    },
  });

  const isMember = membershipQuery.data?.active === true;

  // On mount, check if user is returning from Whop checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "complete") {
      // Strip the query param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());

      // Verify the payment server-side
      verifyCheckoutMutation.mutate(undefined, {
        onSuccess: (data) => {
          if (data.active) {
            membershipQuery.refetch();
            toast({
              title: "Welcome to WordWatch Pro!",
              description: "Your membership is now active. Full results unlocked.",
            });
          } else {
            toast({
              title: "Payment pending",
              description: "We couldn't confirm your payment yet. Please wait a moment and refresh.",
              variant: "destructive",
            });
          }
        },
        onError: () => {
          toast({
            title: "Verification failed",
            description: "Please contact support if you were charged.",
            variant: "destructive",
          });
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wordCount = useMemo(() => {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }, [text]);

  const handleAnalyze = () => {
    if (!text.trim()) {
      toast({ title: "No text provided", description: "Please enter some text to analyze.", variant: "destructive" });
      return;
    }
    humanizeMutation.reset();
    analyzeMutation.mutate({ data: { text, writingType } }, {
      onError: () => toast({ title: "Analysis failed", description: "The archives could not be reached. Try again.", variant: "destructive" })
    });
  };

  const handleHumanize = () => {
    if (!text.trim()) {
      toast({ title: "No text provided", description: "Please enter some text to humanize.", variant: "destructive" });
      return;
    }
    analyzeMutation.reset();
    humanizeMutation.mutate({ data: { text, writingType } }, {
      onError: () => toast({ title: "Translation failed", description: "The quill snapped. Please try again.", variant: "destructive" })
    });
  };

  const handleUpgrade = () => {
    startCheckoutMutation.mutate(undefined, {
      onSuccess: (data) => {
        // Redirect to Whop hosted checkout
        window.location.href = data.checkoutUrl;
      },
      onError: () => {
        toast({
          title: "Checkout unavailable",
          description: "Could not start checkout. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const hasResults = analyzeMutation.data || humanizeMutation.data;
  const showPaywall = hasResults && !isMember;
  const isLoading = analyzeMutation.isPending || humanizeMutation.isPending;

  return (
    <div className="min-h-[100dvh] flex flex-col selection:bg-primary/30 selection:text-primary">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur z-20 sticky top-0">
        <div className="container flex h-16 items-center justify-between max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-4">
            <img src={import.meta.env.BASE_URL + 'noeticnonsense-logo.png'} alt="Noeticnonsense" className="h-10 w-10 drop-shadow-md" />
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xl font-medium tracking-wide text-foreground">WordWatch</span>
              <span className="text-muted-foreground text-sm font-serif italic hidden sm:inline-block">— Noeticnonsense</span>
            </div>
          </div>

          {/* Membership badge */}
          {membershipQuery.data && (
            <div className="flex items-center gap-2">
              {isMember ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium font-serif">
                  <Crown className="w-3.5 h-3.5" />
                  Pro
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpgrade}
                  disabled={startCheckoutMutation.isPending}
                  className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 font-serif text-xs h-8"
                >
                  {startCheckoutMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Crown className="w-3.5 h-3.5" />
                  )}
                  Upgrade to Pro
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container max-w-screen-2xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 flex-1 items-stretch">
          
          {/* Left Column: Input */}
          <div className="flex flex-col space-y-8 lg:sticky lg:top-28 lg:h-[calc(100vh-8rem)]">
            <div className="space-y-3">
              <h1 className="font-serif text-4xl md:text-5xl text-foreground tracking-tight leading-tight">
                Inspect the Ink.
              </h1>
              <p className="text-muted-foreground font-sans text-lg md:text-xl max-w-md leading-relaxed">
                Detect artificial cadence, or translate it back into human reality.
              </p>
            </div>

            <div className="space-y-5 flex-1 flex flex-col">
              <div className="space-y-2">
                <Label htmlFor="writing-type" className="text-foreground/80 font-medium">Form of Writing</Label>
                <Select
                  value={writingType}
                  onValueChange={(value) =>
                    setWritingType(value as TextAnalysisInputWritingType)
                  }
                >
                  <SelectTrigger id="writing-type" className="bg-card border-border/50 h-12 text-base transition-colors hover:border-border">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card/95 backdrop-blur border-border/50">
                    {WRITING_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value} className="focus:bg-primary/10 focus:text-primary cursor-pointer">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex-1 flex flex-col relative group">
                <Label htmlFor="text-input" className="text-foreground/80 font-medium flex justify-between">
                  <span>Your Words</span>
                  <span className="text-xs font-mono text-muted-foreground/70 group-focus-within:text-primary/70 transition-colors">
                    {wordCount} words
                  </span>
                </Label>
                <Textarea 
                  id="text-input"
                  placeholder="Paste your prose here... Let the ink flow." 
                  className="flex-1 min-h-[300px] lg:min-h-0 resize-none bg-card border-border/50 text-base leading-relaxed p-5 font-sans placeholder:font-serif placeholder:italic placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/30 transition-all shadow-inner"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isLoading}
                  className="flex-1 h-14 font-serif text-lg tracking-wide hover:shadow-[0_0_25px_rgba(204,153,51,0.25)] transition-all bg-primary text-primary-foreground border border-primary/50"
                >
                  <Search className="w-5 h-5 mr-2 opacity-80" />
                  Detect Pattern
                </Button>
                <Button 
                  onClick={handleHumanize} 
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1 h-14 font-serif text-lg tracking-wide bg-secondary/50 hover:bg-secondary text-foreground border-border/50 hover:border-primary/30 transition-all group"
                >
                  <Feather className="w-5 h-5 mr-2 opacity-70 group-hover:text-primary transition-colors" />
                  Humanize Text
                </Button>
              </div>

              {/* Free tier note */}
              {!isMember && !membershipQuery.isLoading && (
                <p className="text-xs text-muted-foreground/50 text-center font-serif italic">
                  Free: Verdict summary only. <button onClick={handleUpgrade} className="text-primary/70 hover:text-primary underline underline-offset-2 transition-colors">Upgrade to Pro</button> for full indicators & humanized text.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="flex flex-col rounded-2xl border border-border/40 bg-card/30 p-6 md:p-10 min-h-[500px] lg:min-h-0 lg:h-[calc(100vh-8rem)] relative overflow-hidden shadow-2xl shadow-black/40">
            {/* Ambient background glows */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 h-full overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <EngagingLoader type={analyzeMutation.isPending ? 'analyze' : 'humanize'} />
              ) : analyzeMutation.data ? (
                <AnalysisResultView result={analyzeMutation.data} isMember={isMember} />
              ) : humanizeMutation.data ? (
                <HumanizeResultView result={humanizeMutation.data} isMember={isMember} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-50 transition-opacity hover:opacity-80">
                  <div className="w-24 h-24 rounded-full border border-border/50 flex items-center justify-center bg-card/50 shadow-inner">
                    <Feather className="w-10 h-10 text-muted-foreground/80" />
                  </div>
                  <div className="space-y-3 max-w-[300px]">
                    <h3 className="font-serif text-2xl text-foreground">The Desk is Clear</h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      Submit your text to peer into its origins or imbue it with life.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Paywall overlay — sits above the results panel */}
            {showPaywall && !isLoading && (
              <PaywallOverlay
                onUpgrade={handleUpgrade}
                isLoading={startCheckoutMutation.isPending}
              />
            )}
          </div>

        </div>
      </main>

      <footer className="border-t border-border/40 py-8 md:py-10 mt-auto bg-background/80 backdrop-blur z-10">
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
