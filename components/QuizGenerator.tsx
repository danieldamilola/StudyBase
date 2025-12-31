'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Sparkles, RotateCw, CheckCircle2, ChevronRight, ChevronLeft, MessageCircle, Send, X } from 'lucide-react';

interface QuizQuestion {
    question: string;
    answer: string;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface QuizGeneratorProps {
    fileTitle: string;
    fileDescription?: string;
    fileUrl?: string;
    fileType?: string;
}

export function QuizGenerator({ fileTitle, fileDescription = '', fileUrl, fileType }: QuizGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Chat state
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_flashcards',
                    fileTitle,
                    fileDescription,
                }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
                return;
            }

            if (data.flashcards && data.flashcards.length > 0) {
                setQuestions(data.flashcards);
                setCurrentIndex(0);
                setIsFlipped(false);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate flashcards');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isSending) return;

        const userMessage = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsSending(true);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'ask_question',
                    fileTitle,
                    fileDescription,
                    question: userMessage,
                    fileUrl,
                    fileType,
                }),
            });

            const data = await response.json();

            if (data.answer) {
                setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
            } else {
                setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process your question.' }]);
            }
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to AI service.' }]);
        } finally {
            setIsSending(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(c => c + 1), 200);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(c => c - 1), 200);
        }
    };

    // Initial state - no flashcards yet
    if (questions.length === 0) {
        return (
            <Card className="border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 overflow-hidden">
                <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">AI Study Assistant</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Generate &ldquo;Smart Flashcards&rdquo; for this content to study faster.
                    </p>

                    {error && (
                        <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            size="lg"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                        >
                            {isGenerating ? (
                                <>
                                    <RotateCw className="w-5 h-5 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate Flashcards
                                </>
                            )}
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => setShowChat(true)}
                            className="border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400"
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Ask Questions
                        </Button>
                    </div>

                    {/* Chat Modal */}
                    {showChat && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <Card className="w-full max-w-lg h-[500px] flex flex-col">
                                <div className="flex items-center justify-between p-4 border-b">
                                    <h4 className="font-bold flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5 text-indigo-500" />
                                        Ask about "{fileTitle}"
                                    </h4>
                                    <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {chatMessages.length === 0 && (
                                        <p className="text-center text-muted-foreground text-sm">
                                            Ask any question about this document...
                                        </p>
                                    )}
                                    {chatMessages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-lg ${msg.role === 'user'
                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 ml-8'
                                                : 'bg-muted mr-8'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    ))}
                                    {isSending && (
                                        <div className="bg-muted mr-8 p-3 rounded-lg">
                                            <RotateCw className="w-4 h-4 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t flex gap-2">
                                    <Input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type your question..."
                                        className="flex-1"
                                    />
                                    <Button onClick={handleSendMessage} disabled={isSending || !chatInput.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Flashcard view
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    Flashcards ({currentIndex + 1}/{questions.length})
                </h3>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowChat(true)}>
                        <MessageCircle className="w-4 h-4 mr-1" /> Ask
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setQuestions([])} className="text-muted-foreground hover:text-red-500">
                        Reset
                    </Button>
                </div>
            </div>

            <div className="h-64 w-full cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                <div className="relative w-full h-full text-center" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
                    {/* Front */}
                    <Card 
                        className={`absolute w-full h-full bg-white dark:bg-card border-2 border-indigo-100 dark:border-indigo-900 shadow-xl flex flex-col items-center justify-center p-8 transition-transform duration-500`}
                        style={{ 
                            backfaceVisibility: 'hidden',
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}
                    >
                        <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-4">Question</div>
                        <h4 className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
                            {questions[currentIndex]?.question}
                        </h4>
                        <div className="absolute bottom-4 text-xs text-muted-foreground flex items-center gap-1 opacity-60">
                            <RotateCw className="w-3 h-3" /> Click to flip
                        </div>
                    </Card>

                    {/* Back */}
                    <Card 
                        className={`absolute w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl flex flex-col items-center justify-center p-8 transition-transform duration-500`}
                        style={{ 
                            backfaceVisibility: 'hidden',
                            transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)'
                        }}
                    >
                        <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-4">Answer</div>
                        <p className="text-lg md:text-xl font-medium leading-relaxed">
                            {questions[currentIndex]?.answer}
                        </p>
                        <div className="absolute bottom-4 text-xs text-indigo-200 flex items-center gap-1 opacity-80">
                            <CheckCircle2 className="w-3 h-3" /> Got it!
                        </div>
                    </Card>
                </div>
            </div>

            <div className="flex items-center justify-center gap-4">
                <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="rounded-full w-12 h-12 p-0"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex gap-2">
                    {questions.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                        />
                    ))}
                </div>
                <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentIndex === questions.length - 1}
                    className="rounded-full w-12 h-12 p-0"
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>

            {/* Chat Modal */}
            {showChat && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg h-[500px] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h4 className="font-bold flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-indigo-500" />
                                Ask about "{fileTitle}"
                            </h4>
                            <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.length === 0 && (
                                <p className="text-center text-muted-foreground text-sm">
                                    Ask any question about this document...
                                </p>
                            )}
                            {chatMessages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`p-3 rounded-lg ${msg.role === 'user'
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 ml-8'
                                        : 'bg-muted mr-8'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            ))}
                            {isSending && (
                                <div className="bg-muted mr-8 p-3 rounded-lg">
                                    <RotateCw className="w-4 h-4 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t flex gap-2">
                            <Input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type your question..."
                                className="flex-1"
                            />
                            <Button onClick={handleSendMessage} disabled={isSending || !chatInput.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
