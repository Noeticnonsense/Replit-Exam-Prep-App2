import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useExamContext } from '@/context/ExamContext';
import { useGetMockExam, useSubmitMockExam } from '@workspace/api-client-react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export default function MockExam() {
  const [, setLocation] = useLocation();
  const { examName, state, setMockExamResult, setMockExam } = useExamContext();
  const getMockExam = useGetMockExam();
  const submitExam = useSubmitMockExam();
  
  const hasFetched = useRef(false);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!examName || !state) {
      setLocation('/');
      return;
    }
    
    if (!hasFetched.current) {
      hasFetched.current = true;
      getMockExam.mutate({ data: { examName, state, questionCount: 20 } }, {
        onSuccess: (data) => {
          if (data.timeLimit) {
            setTimeLeft(data.timeLimit * 60);
          }
        }
      });
    }
  }, [examName, state, setLocation]);

  useEffect(() => {
    if (getMockExam.data) {
      setMockExam(getMockExam.data);
    }
  }, [getMockExam.data, setMockExam]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitExam.isPending) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, submitExam.isPending]);

  const handleTimeUp = () => {
    if (getMockExam.data) {
      submit();
    }
  };

  const submit = () => {
    if (!getMockExam.data) return;
    
    const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer
    }));
    
    submitExam.mutate({
      data: {
        examName,
        state,
        questions: getMockExam.data.questions,
        answers: formattedAnswers
      }
    }, {
      onSuccess: (result) => {
        setMockExamResult(result);
        setLocation('/results');
      }
    });
  };

  if (getMockExam.isPending || (!getMockExam.data && !getMockExam.isError)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8"></div>
        <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">Generating Mock Exam...</h2>
        <p className="text-lg text-muted-foreground text-center max-w-md leading-relaxed">
          Drafting questions based on the latest {state} state rules. This usually takes about 15-20 seconds.
        </p>
      </div>
    );
  }

  if (getMockExam.isError || !getMockExam.data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-serif font-semibold mb-4">Failed to generate mock exam</h2>
        <button onClick={() => getMockExam.mutate({ data: { examName, state, questionCount: 20 } })} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  const exam = getMockExam.data;
  const question = exam.questions[currentIdx];
  const total = exam.questions.length;
  const isLast = currentIdx === total - 1;
  const progress = Math.round((Object.keys(answers).length / total) * 100);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const letters = ['A', 'B', 'C', 'D'];

  if (submitExam.isPending) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8"></div>
        <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">Grading your exam...</h2>
        <p className="text-lg text-muted-foreground text-center">Calculating score and generating personalized feedback.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-muted/30 flex flex-col animate-in fade-in duration-500">
      <div className="bg-background border-b border-border sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-5 max-w-4xl flex items-center justify-between">
          <div className="flex flex-col gap-2 w-full max-w-sm">
            <div className="flex items-center justify-between text-sm font-bold text-foreground/80 uppercase tracking-wide">
              <span>Question {currentIdx + 1} of {total}</span>
              <span>{progress}% Answered</span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 text-lg font-bold px-4 py-2 rounded-lg font-mono border ${
              timeLeft < 300 
                ? 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse' 
                : 'bg-muted text-foreground border-border'
            }`}>
              <Clock className="h-5 w-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-12 max-w-4xl flex flex-col">
        <div className="bg-card border border-border shadow-sm rounded-3xl p-8 md:p-12 mb-10 flex-1">
          <div className="mb-10">
            <span className="text-sm font-bold uppercase tracking-widest text-primary mb-4 inline-block bg-primary/10 px-4 py-1.5 rounded-full">
              {question.category}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-medium leading-relaxed text-foreground">
              {question.question}
            </h2>
          </div>

          <div className="space-y-5">
            {question.options.map((opt, i) => {
              const letter = letters[i];
              const isSelected = answers[question.id] === letter;
              
              return (
                <button
                  key={letter}
                  onClick={() => setAnswers(prev => ({ ...prev, [question.id]: letter }))}
                  className={`w-full flex items-start p-5 md:p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary text-primary-foreground shadow-md transform scale-[1.01]' 
                      : 'border-border bg-card hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full font-bold mr-5 text-lg transition-colors ${
                    isSelected ? 'bg-primary-foreground text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {letter}
                  </span>
                  <span className="text-lg md:text-xl pt-1 leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pb-8">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            <ArrowLeft className="h-6 w-6" /> Previous
          </button>
          
          {isLast ? (
            <button
              onClick={submit}
              disabled={Object.keys(answers).length === 0}
              className="flex items-center gap-3 bg-accent text-accent-foreground px-10 py-4 rounded-xl font-bold hover:bg-accent/90 disabled:opacity-50 transition-colors shadow-md text-lg"
            >
              Submit Exam <CheckCircle2 className="h-6 w-6" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(prev => Math.min(total - 1, prev + 1))}
              className="flex items-center gap-3 bg-foreground text-background px-10 py-4 rounded-xl font-bold hover:bg-foreground/90 transition-colors shadow-md text-lg"
            >
              Next <ArrowRight className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
