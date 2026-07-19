import { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useExamContext } from '@/context/ExamContext';
import { useGetStudyGuide } from '@workspace/api-client-react';
import { ArrowRight, FileText, Lightbulb, Copy, BrainCircuit, BookOpen } from 'lucide-react';
import type { StudyNote, Flashcard as FlashcardType, Mnemonic } from '@workspace/api-client-react/src/generated/api.schemas';

export default function StudyGuide() {
  const [, setLocation] = useLocation();
  const { examName, state } = useExamContext();
  const getStudyGuide = useGetStudyGuide();
  const [activeTab, setActiveTab] = useState<'plan' | 'notes' | 'flashcards' | 'mnemonics'>('plan');
  
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!examName || !state) {
      setLocation('/');
      return;
    }
    
    if (!hasFetched.current) {
      hasFetched.current = true;
      getStudyGuide.mutate({ data: { examName, state } });
    }
  }, [examName, state, setLocation]);

  if (getStudyGuide.isPending || !getStudyGuide.data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8"></div>
        <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">Generating Study Guide...</h2>
        <p className="text-lg text-muted-foreground text-center max-w-md leading-relaxed">
          Compiling high-yield notes, flashcards, and mnemonics tailored for {state}. This process takes about 20-30 seconds.
        </p>
      </div>
    );
  }

  const guide = getStudyGuide.data;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl flex flex-col min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8 pt-4">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-3 text-foreground">Study Guide</h1>
          <p className="text-lg text-muted-foreground">Personalized materials for {guide.examName} ({guide.state})</p>
        </div>
        <Link href="/mock-exam" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm">
          Take Mock Exam <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-10 flex-1">
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 md:sticky md:top-24 scrollbar-hide">
            <TabButton active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon={<FileText size={18} />} label="Study Plan" />
            <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<Copy size={18} />} label="High-Yield Notes" />
            <TabButton active={activeTab === 'flashcards'} onClick={() => setActiveTab('flashcards')} icon={<BrainCircuit size={18} />} label="Flashcards" />
            <TabButton active={activeTab === 'mnemonics'} onClick={() => setActiveTab('mnemonics')} icon={<Lightbulb size={18} />} label="Mnemonics" />
          </nav>
        </div>

        <div className="flex-1 pb-20">
          {activeTab === 'plan' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-serif text-3xl font-semibold mb-8">Recommended Approach</h2>
              <div className="prose prose-slate prose-lg max-w-none text-foreground/90">
                {guide.studyPlan.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="mb-6 leading-relaxed">{paragraph}</p>
                ))}
              </div>
              
              <h3 className="font-serif text-2xl font-semibold mt-16 mb-6">Recommended Resources</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {guide.recommendedResources.map((resource, i) => (
                  <li key={i} className="bg-card p-5 rounded-xl text-base font-medium border border-border shadow-sm flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                    {resource}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-serif text-3xl font-semibold mb-8">High-Yield Notes</h2>
              <div className="grid grid-cols-1 gap-6">
                {guide.notes.map((note, i) => (
                  <NoteCard key={i} note={note} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-serif text-3xl font-semibold mb-4">Interactive Flashcards</h2>
              <p className="text-lg text-muted-foreground mb-10">Click on a card to reveal the answer.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {guide.flashcards.map((card) => (
                  <Flashcard key={card.id} card={card} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mnemonics' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="font-serif text-3xl font-semibold mb-8">Mnemonics & Memory Aids</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {guide.mnemonics.map((m, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-4">{m.concept}</h3>
                    <div className="font-serif text-3xl text-primary font-bold mb-6 leading-tight">{m.mnemonic}</div>
                    <p className="text-base leading-relaxed text-foreground/90">{m.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-4 rounded-xl text-base font-semibold transition-colors whitespace-nowrap ${
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function NoteCard({ note }: { note: StudyNote }) {
  const importanceColor = {
    high: 'bg-destructive text-destructive-foreground border-destructive/20',
    medium: 'bg-accent text-accent-foreground border-accent/20',
    low: 'bg-muted text-foreground border-border'
  }[note.importance];

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <h3 className="font-serif text-2xl font-semibold leading-tight">{note.title}</h3>
        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-sm self-start ${importanceColor}`}>
          {note.importance}
        </span>
      </div>
      <div className="prose prose-slate max-w-none text-foreground/80">
        {note.content.split('\n').map((paragraph, i) => (
          <p key={i} className="mb-4 leading-relaxed text-lg">{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

function Flashcard({ card }: { card: FlashcardType }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative h-72 w-full perspective-1000 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-3d shadow-sm ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-card border border-border rounded-2xl p-6 flex flex-col justify-center items-center text-center group-hover:border-primary/40 transition-colors">
          <span className="absolute top-5 left-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {card.category}
          </span>
          <p className="font-serif text-2xl font-medium leading-tight px-2">{card.front}</p>
          <span className="absolute bottom-5 text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">Tap to flip</span>
        </div>
        
        {/* Back */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col justify-center items-center text-center rotate-y-180 border border-primary/20">
          <p className="text-xl leading-relaxed">{card.back}</p>
        </div>
      </div>
    </div>
  );
}
