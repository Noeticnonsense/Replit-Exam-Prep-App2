import { Link, useLocation } from 'wouter';
import { useExamContext } from '@/context/ExamContext';

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { examName, state } = useExamContext();
  
  const hasContext = !!(examName && state);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img
              src={`${import.meta.env.BASE_URL}noeticnonsense-logo.png`}
              alt="Noeticnonsense logo"
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-serif text-xl font-semibold tracking-tight text-primary">
              Exam Prep AI
            </span>
            <span className="text-sm font-medium text-muted-foreground tracking-wide">
              &mdash;Noeticnonsense
            </span>
          </Link>
          
          {hasContext && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link 
                href="/exam-info" 
                className={`transition-colors hover:text-primary ${location === '/exam-info' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                Overview
              </Link>
              <Link 
                href="/study-guide" 
                className={`transition-colors hover:text-primary ${location === '/study-guide' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                Study Guide
              </Link>
              <Link 
                href="/mock-exam" 
                className={`transition-colors hover:text-primary ${location === '/mock-exam' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                Mock Exam
              </Link>
            </nav>
          )}
          
          {hasContext && (
            <div className="hidden md:flex items-center text-sm font-medium text-muted-foreground bg-muted px-4 py-1.5 rounded-full border border-border/50">
              {examName} &middot; {state}
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
