import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, TrendingUp, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { outfitData, getStoredVotes, storeVote } from './mockData';
import { useToast } from '../hooks/use-toast';
import useScrollAnimation from '../hooks/useScrollAnimation';

const OutfitRanking = () => {
  const [outfits, setOutfits] = useState(outfitData);
  const [userVotes, setUserVotes] = useState({});
  const [selectedEmoji, setSelectedEmoji] = useState({});
  const { toast } = useToast();
  const sectionRef = useScrollAnimation();

  useEffect(() => {
    setUserVotes(getStoredVotes());
  }, []);

  const handleVote = (outfitId) => {
    if (userVotes[outfitId]) {
      toast({
        title: "¡Ya votaste por este outfit!",
        description: "Solo puedes votar una vez por outfit.",
        variant: "destructive"
      });
      return;
    }

    setOutfits(prev => 
      prev.map(outfit => 
        outfit.id === outfitId 
          ? { ...outfit, votes: outfit.votes + 1, percentage: outfit.percentage + 1 }
          : outfit
      )
    );

    const newVotes = { ...userVotes, [outfitId]: true };
    setUserVotes(newVotes);
    storeVote(outfitId);

    toast({
      title: "¡Voto registrado!",
      description: "Gracias por votar por tu outfit favorito.",
    });
  };

  const addEmoji = (outfitId, emoji) => {
    setOutfits(prev =>
      prev.map(outfit =>
        outfit.id === outfitId
          ? {
              ...outfit,
              comments: [...outfit.comments, {
                id: Date.now(),
                text: `Reacción: ${emoji}`,
                emoji: emoji
              }]
            }
          : outfit
      )
    );

    setSelectedEmoji({ ...selectedEmoji, [outfitId]: emoji });
    
    toast({
      title: "¡Reacción añadida!",
      description: `Has reaccionado con ${emoji}`,
    });
  };

  const sortedOutfits = [...outfits].sort((a, b) => b.votes - a.votes);

  return (
    <section ref={sectionRef} className="section section-bg py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Award className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            🏆 Ranking de Outfits
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vota por tus looks favoritos de Stephanie y deja tu reacción
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedOutfits.map((outfit, index) => (
            <Card 
              key={outfit.id} 
              className="card group overflow-hidden border-amber-200/50"
            >
              <div className="relative">
                {index < 3 && (
                  <Badge 
                    className={`absolute top-3 left-3 z-10 ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                      'bg-gradient-to-r from-amber-600 to-orange-600'
                    } text-white font-bold`}
                  >
                    #{index + 1}
                  </Badge>
                )}
                
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={outfit.image} 
                    alt={outfit.title}
                    className="outfit-image w-full h-full object-cover"
                  />
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className={`font-semibold text-lg text-gray-900 mb-2 ${
                  index === 0 ? 'top-fan' : ''
                }`}>
                  {outfit.title}
                </h3>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>{outfit.votes} votos</span>
                  </div>
                  <span className="text-sm font-medium text-amber-600">
                    {outfit.percentage}%
                  </span>
                </div>

                <div className="vote-bar-container mb-3">
                  <div 
                    className="vote-bar" 
                    style={{ width: `${outfit.percentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <Button
                    onClick={() => handleVote(outfit.id)}
                    disabled={userVotes[outfit.id]}
                    size="sm"
                    className={`${
                      userVotes[outfit.id] 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    } text-white rounded-lg transition-all duration-300`}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${userVotes[outfit.id] ? 'fill-white' : ''}`} />
                    {userVotes[outfit.id] ? 'Votado' : 'Votar'}
                  </Button>

                  <div className="flex space-x-1">
                    {['💖', '🔥', '👏'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => addEmoji(outfit.id, emoji)}
                        className="w-8 h-8 rounded-full hover:bg-amber-100 transition-colors duration-200 flex items-center justify-center text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {outfit.comments.length > 0 && (
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      <span>{outfit.comments.length} reacciones</span>
                    </div>
                    <div className="space-y-1">
                      {outfit.comments.slice(0, 2).map(comment => (
                        <p key={comment.id} className={`text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 ${
                          comment.text.includes('Perfecto') || comment.text.includes('Amor') ? 'top-fan' : ''
                        }`}>
                          {comment.emoji} {comment.text}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OutfitRanking;