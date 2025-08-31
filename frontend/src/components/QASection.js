import React, { useState } from 'react';
import { MessageSquare, Send, Play, Heart, Clock, Video } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { questionsData, getStoredQuestions, storeQuestion } from './mockData';
import { useToast } from '../hooks/use-toast';
import useScrollAnimation from '../hooks/useScrollAnimation';

const QASection = () => {
  const [questions, setQuestions] = useState(questionsData);
  const [newQuestion, setNewQuestion] = useState('');
  const [userQuestions, setUserQuestions] = useState(getStoredQuestions());
  const { toast } = useToast();
  const sectionRef = useScrollAnimation();

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) {
      toast({
        title: "Error",
        description: "Por favor escribe una pregunta.",
        variant: "destructive"
      });
      return;
    }

    const question = storeQuestion(newQuestion);
    setUserQuestions([...userQuestions, question]);
    setNewQuestion('');
    
    toast({
      title: "¡Pregunta enviada!",
      description: "Stephanie responderá pronto tu pregunta.",
    });
  };

  const likeAnswer = (questionId) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, likes: q.likes + 1 } : q
      )
    );
    
    toast({
      title: "¡Like añadido!",
      description: "Has marcado esta respuesta como útil.",
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <section ref={sectionRef} className="section section-bg py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            💬 Pregúntame Algo
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Envía tus preguntas y recibe respuestas personalizadas de Stephanie
          </p>
        </div>

        {/* Question Form */}
        <Card className="mb-12 bg-white/80 backdrop-blur-sm border-amber-200/50">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900">
              Haz tu pregunta
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="¿Qué te gustaría preguntarle a Stephanie?..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="min-h-[100px] resize-none border-amber-200 focus:border-amber-400"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {newQuestion.length}/500 caracteres
                </span>
                <Button
                  onClick={handleSubmitQuestion}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Pregunta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Questions Status */}
        {userQuestions.length > 0 && (
          <Card className="mb-8 bg-amber-50/50 border-amber-200/50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-amber-800 mb-2">Tus preguntas enviadas:</h4>
              <div className="space-y-2">
                {userQuestions.slice(-3).map(q => (
                  <div key={q.id} className="flex items-center justify-between text-sm">
                    <span className="text-amber-700 truncate flex-1 mr-2">{q.question}</span>
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      {q.status === 'pending' ? 'Pendiente' : 'Respondida'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Answered Questions */}
        <div className="space-y-6">
          {questions.map(question => (
            <Card key={question.id} className="bg-white/70 backdrop-blur-sm border-amber-200/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {question.question}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(question.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{question.likes} likes</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={question.type === 'video' ? 'default' : 'secondary'}
                    className={question.type === 'video' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : ''}
                  >
                    {question.type === 'video' ? (
                      <>
                        <Video className="h-3 w-3 mr-1" />
                        Video
                      </>
                    ) : (
                      'Texto'
                    )}
                  </Badge>
                </div>

                {question.type === 'text' ? (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-800 leading-relaxed">
                      {question.answer}
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden mb-4 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                    <div className="aspect-video bg-gradient-to-br from-amber-200 to-orange-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <img 
                        src={question.videoThumbnail} 
                        alt="Video thumbnail"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                      <div className="relative z-10 flex flex-col items-center text-white">
                        <Play className="h-12 w-12 mb-2 bg-white/20 rounded-full p-3 backdrop-blur-sm" />
                        <span className="text-sm font-medium bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                          {question.duration}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-3 font-medium">
                      {question.answer}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm" 
                    onClick={() => likeAnswer(question.id)}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-100/50"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Me gusta ({question.likes})
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                      Compartir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QASection;