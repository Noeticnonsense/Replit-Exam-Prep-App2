import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useExamContext } from '@/context/ExamContext';
import { CheckCircle2, XCircle, ChevronRight, BookOpen, RotateCcw } from 'lucide-react';

export default function Results() {
  const [, setLocation] = useLocation();
  const { mockExamResult, mockExam, setMockExamResult } = useExamContext();

  useEffect(() => {
    if (!mockExamResult) {
      setLocation('/');
    }
  }, [mockExamResult, setLocation]);

  if (!mockExamResult) return null;

  const res = mockExamResult;

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center p-4 rounded-full mb-8 relative">
          <div className={`absolute inset-0 rounded-full opacity-20 blur-2xl ${res.passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {res.passed ? (
            <CheckCircle2 className="h-24 w-24 text-green-600 relative z-10" />
          ) : (
            <XCircle className="h-24 w-24 text-red-600 relative z-10" />
          )}
        </div>
        
        <h1 className="font-serif text-6xl md:text-7xl font-bold mb-6 text-foreground">
          {res.score}%
        </h1>
        <h2 className={`text-2xl font-bold uppercase tracking-widest mb-6 ${res.passed ? 'text-green-600' : 'text-red-600'}`}>
          {res.passed ? 'Pass' : 'Fail'}
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {res.passed 
            ? "Great job! You're on track to pass the real exam. Keep reviewing to maintain your knowledge."
            : "Keep studying. Focus on your weak areas and try again when you're ready."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm">
          <h2 className="font-serif text-3xl font-semibold mb-8">Performance Snapshot</h2>
          <div className="space-y-5">
            <div className="flex justify-between items-center p-5 bg-muted/30 rounded-2xl border border-border/50">
              <span className="text-muted-foreground font-semibold text-lg">Result</span>
              <span className={`font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider ${res.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {res.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <div className="flex justify-between items-center p-5 bg-muted/30 rounded-2xl border border-border/50">
              <span className="text-muted-foreground font-semibold text-lg">Correct Answers</span>
              <span className="font-bold text-2xl text-foreground">{res.correctAnswers} <span className="text-muted-foreground text-lg">/ {res.totalQuestions}</span></span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-sm">
          <h2 className="font-serif text-3xl font-semibold mb-8">Recommended Focus</h2>
          <ul className="space-y-4">
            {res.studyRecommendations.map((rec, i) => (
              <li key={i} className="flex gap-4 items-start">
                <ChevronRight className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-lg font-medium leading-relaxed text-foreground/90">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-20">
        <h2 className="font-serif text-4xl font-semibold mb-10 text-center">Detailed Feedback</h2>
        <div className="space-y-8">
          {res.feedback.map((item, i) => {
            const originalQuestion = mockExam?.questions.find(q => q.id === item.questionId);
            
            return (
              <div key={item.questionId} className={`bg-card border-2 rounded-3xl p-8 shadow-sm ${item.correct ? 'border-green-500/30' : 'border-red-500/30'}`}>
                <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                    item.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="font-serif text-2xl font-medium mb-8 leading-relaxed">
                      {originalQuestion ? originalQuestion.question : `Question ID: ${item.questionId}`}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className={`p-6 rounded-2xl border-2 ${item.correct ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                        <span className="text-sm text-muted-foreground uppercase font-bold tracking-wider block mb-2">Your Answer</span>
                        <span className={`font-semibold text-xl leading-relaxed ${item.correct ? 'text-green-700' : 'text-red-700'}`}>
                          {item.yourAnswer || 'None'}
                        </span>
                      </div>
                      <div className="p-6 rounded-2xl border-2 border-green-200 bg-green-50/50">
                        <span className="text-sm text-muted-foreground uppercase font-bold tracking-wider block mb-2">Correct Answer</span>
                        <span className="font-semibold text-xl leading-relaxed text-green-700">{item.correctAnswer}</span>
                      </div>
                    </div>

                    <div className="bg-accent/10 border border-accent/20 p-6 rounded-2xl">
                      <span className="text-sm text-accent-foreground uppercase font-bold tracking-wider block mb-3 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" /> Explanation
                      </span>
                      <p className="text-lg leading-relaxed text-foreground/90">{item.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-6">
        <Link href="/study-guide" className="px-10 py-5 border-2 border-border bg-background hover:bg-muted text-foreground font-bold rounded-2xl transition-colors text-lg text-center shadow-sm">
          Review Study Guide
        </Link>
        <button 
          onClick={() => {
            setMockExamResult(null);
            setLocation('/mock-exam');
          }} 
          className="flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-colors text-lg shadow-sm"
        >
          <RotateCcw className="h-6 w-6" /> Retake Exam
        </button>
      </div>
    </div>
  );
}
