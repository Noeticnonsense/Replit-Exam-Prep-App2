import React, { useState, useMemo } from 'react';
import { useAnalyzeText, useHumanizeText } from '@workspace/api-client-react';
import type { TextAnalysisResult, HumanizeResult } from '@workspace/api-client-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Search, Feather, Info, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Gauge } from '@/components/gauge';
import { EngagingLoader } from '@/components/engaging-loader';

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

function AnalysisResultView({ result }: { result: TextAnalysisResult }) {
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
  );
}

function HumanizeResultView({ result }: { result: HumanizeResult }) {
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

      <div className="flex-1 space-y-8">
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

export default function Home() {
  const [text, setText] = useState("");
  const [writingType, setWritingType] = useState("essay");
  const { toast } = useToast();

  const analyzeMutation = useAnalyzeText();
  const humanizeMutation = useHumanizeText();

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

  const isLoading = analyzeMutation.isPending || humanizeMutation.isPending;

  return (
    <div className="min-h-[100dvh] flex flex-col selection:bg-primary/30 selection:text-primary">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur z-20 sticky top-0">
        <div className="container flex h-16 items-center max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-4">
            <img src={import.meta.env.BASE_URL + 'noeticnonsense-logo.png'} alt="Noeticnonsense" className="h-10 w-10 drop-shadow-md" />
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xl font-medium tracking-wide text-foreground">WordWatch</span>
              <span className="text-muted-foreground text-sm font-serif italic hidden sm:inline-block">— Noeticnonsense</span>
            </div>
          </div>
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
                <Select value={writingType} onValueChange={setWritingType}>
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
                <AnalysisResultView result={analyzeMutation.data} />
              ) : humanizeMutation.data ? (
                <HumanizeResultView result={humanizeMutation.data} />
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
