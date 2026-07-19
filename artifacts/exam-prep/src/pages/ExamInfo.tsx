import { useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { useExamContext } from '@/context/ExamContext';
import { useGetExamInfo } from '@workspace/api-client-react';
import { ArrowRight, CheckCircle2, AlertCircle, FileText, FileBadge } from 'lucide-react';

export default function ExamInfo() {
  const [, setLocation] = useLocation();
  const { examName, state } = useExamContext();
  const getExamInfo = useGetExamInfo();
  
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!examName || !state) {
      setLocation('/');
      return;
    }
    
    if (!hasFetched.current) {
      hasFetched.current = true;
      getExamInfo.mutate({ data: { examName, state } });
    }
  }, [examName, state, setLocation]);

  if (getExamInfo.isPending || !getExamInfo.data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8"></div>
        <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">Analyzing Requirements...</h2>
        <p className="text-lg text-muted-foreground text-center max-w-md leading-relaxed">
          Gathering the latest official guidelines for the {examName} in {state}. This usually takes about 10-15 seconds.
        </p>
      </div>
    );
  }

  if (getExamInfo.isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-2xl font-serif font-semibold mb-2">Failed to load exam info</h2>
        <p className="text-muted-foreground mb-6">We encountered an issue fetching the curriculum data.</p>
        <button onClick={() => getExamInfo.mutate({ data: { examName, state } })} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  const info = getExamInfo.data;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <span className="inline-block px-3 py-1 bg-accent/20 text-accent-foreground font-semibold rounded-full text-sm mb-4">
          Official Overview
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-foreground">{info.examName} ({info.state})</h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">{info.overview}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 text-primary">
            <FileText className="h-6 w-6" />
            <h3 className="font-serif text-xl font-semibold">Format</h3>
          </div>
          <ul className="space-y-4 text-base">
            <li className="flex justify-between items-center border-b border-border/50 pb-3">
              <span className="text-muted-foreground">Questions</span>
              <span className="font-semibold text-foreground">{info.examFormat.questionCount || 'Varies'}</span>
            </li>
            <li className="flex justify-between items-center border-b border-border/50 pb-3">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold text-foreground">{info.examFormat.duration || 'Varies'}</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-muted-foreground">Passing Score</span>
              <span className="font-semibold text-foreground">{info.passingScore}</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 text-primary">
            <CheckCircle2 className="h-6 w-6" />
            <h3 className="font-serif text-xl font-semibold">Eligibility</h3>
          </div>
          <ul className="space-y-3 text-sm">
            {info.eligibilityRequirements.map((req, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="text-accent text-lg leading-none mt-0.5">&bull;</span>
                <span className="leading-relaxed">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 text-primary">
            <FileBadge className="h-6 w-6" />
            <h3 className="font-serif text-xl font-semibold">Key Topics</h3>
          </div>
          <ul className="space-y-3 text-sm">
            {info.keyTopics.map((topic, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="text-accent text-lg leading-none mt-0.5">&bull;</span>
                <span className="leading-relaxed">{topic}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h3 className="font-serif text-3xl font-semibold mb-8">Registration Process</h3>
          <ol className="space-y-6">
            {info.registrationProcess.map((step, i) => (
              <li key={i} className="flex gap-5 bg-card border border-border p-5 rounded-2xl shadow-sm">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {i + 1}
                </div>
                <p className="pt-1.5 text-base leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>
        
        <div className="space-y-10">
          {info.stateSpecificNotes && (
            <div className="bg-accent/10 border border-accent/20 p-8 rounded-2xl">
              <h3 className="font-serif text-2xl font-semibold mb-4 text-accent-foreground">State-Specific Notes</h3>
              <p className="text-base leading-relaxed text-foreground/90">{info.stateSpecificNotes}</p>
            </div>
          )}
          
          <div>
            <h3 className="font-serif text-3xl font-semibold mb-6">Exam Day Tips</h3>
            <ul className="space-y-4">
              {info.examDayTips.map((tip, i) => (
                <li key={i} className="flex gap-4 items-start bg-muted/50 p-4 rounded-xl border border-border/50">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-base leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-12 pt-12 border-t border-border">
        <Link href="/study-guide" className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-xl font-bold hover:bg-primary/90 transition-all text-lg shadow-sm">
          Generate Study Guide <ArrowRight className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
}
