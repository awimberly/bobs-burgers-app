import React from 'react';
import { Card, CardContent, Typography, CardMedia } from '@mui/material';
import { Character } from '../interfaces/Character';

interface CharacterCardProps {
  character: Character;
  flipped: boolean;
  onClick: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, flipped, onClick }) => {
  return (
    <Card onClick={onClick} sx={{ cursor: 'pointer', width: 150, height: 220 }}>
      {flipped ? (
        <CardMedia
          component="img"
          image={character.image}
          alt={character.name}
          sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
      ) : (
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ccc', height: '100%' }}>
          <Typography variant="h6">?</Typography>
        </CardContent>
      )}
    </Card>
  );
};

export default CharacterCard;