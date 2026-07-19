import { useState } from 'react';
import { useLocation } from 'wouter';
import { useExamContext } from '@/context/ExamContext';
import { BookOpen, Compass, GraduationCap, Target } from 'lucide-react';

export default function Home() {
  const [, setLocation] = useLocation();
  const { setExamContext } = useExamContext();
  const [examName, setExamName] = useState('');
  const [state, setState] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (examName && state) {
      setExamContext(examName, state);
      setLocation('/exam-info');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <section className="w-full py-24 lg:py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="container px-4 md:px-6 relative z-10 mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 text-sm font-medium mb-8">
            <GraduationCap className="h-4 w-4" /> The Intelligent Way to Study
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto mb-6 leading-tight">
            Master your exam with a personalized AI tutor.
          </h1>
          <p className="max-w-[700px] text-lg text-primary-foreground/80 mx-auto mb-10 leading-relaxed">
            Enter your target exam and state. We'll instantly generate a comprehensive overview, bespoke study guide, and dynamic mock exams tailored to your local requirements.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
            <div className="flex-1 w-full relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                <Target className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="e.g., Real Estate License"
                className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-transparent focus:border-accent bg-background text-foreground text-lg focus:outline-none focus:ring-0 transition-colors shadow-sm"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                required
              />
            </div>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                <Compass className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="e.g., California"
                className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-transparent focus:border-accent bg-background text-foreground text-lg focus:outline-none focus:ring-0 transition-colors shadow-sm"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="h-14 px-8 w-full sm:w-auto bg-accent text-accent-foreground font-semibold rounded-xl hover:bg-accent/90 transition-colors shadow-sm text-lg whitespace-nowrap"
            >
              Start Studying
            </button>
          </form>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center text-primary shadow-sm border border-border">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-semibold">Precise Syllabus</h3>
              <p className="text-muted-foreground leading-relaxed">Know exactly what's on the test. We pull the latest curriculum and eligibility rules for your specific state.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center text-primary shadow-sm border border-border">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-semibold">Tailored Study Guides</h3>
              <p className="text-muted-foreground leading-relaxed">High-yield notes, flashcards, and clever mnemonics organized by importance to optimize your study time.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center text-primary shadow-sm border border-border">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-semibold">Realistic Mock Exams</h3>
              <p className="text-muted-foreground leading-relaxed">Test your knowledge with timed, multiple-choice exams that mimic the real format, complete with detailed feedback.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
