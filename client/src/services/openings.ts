// Chess Opening Book
// Maps move sequences to opening names

interface Opening {
  name: string;
  moves: string;
  eco?: string; // Encyclopedia of Chess Openings code
}

const openingsDatabase: Opening[] = [
  // King's Pawn Openings (1.e4)
  { name: "King's Pawn Opening", moves: "e2e4", eco: "B00" },
  { name: "Sicilian Defense", moves: "e2e4 c7c5", eco: "B20" },
  { name: "French Defense", moves: "e2e4 e7e6", eco: "C00" },
  { name: "Caro-Kann Defense", moves: "e2e4 c7c6", eco: "B10" },
  { name: "Pirc Defense", moves: "e2e4 d7d6", eco: "B07" },
  { name: "Alekhine's Defense", moves: "e2e4 g8f6", eco: "B02" },
  { name: "Scandinavian Defense", moves: "e2e4 d7d5", eco: "B01" },
  
  // Italian Game
  { name: "Italian Game", moves: "e2e4 e7e5 g1f3 b8c6 f1c4", eco: "C50" },
  { name: "Giuoco Piano", moves: "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5", eco: "C53" },
  
  // Ruy Lopez
  { name: "Ruy Lopez", moves: "e2e4 e7e5 g1f3 b8c6 f1b5", eco: "C60" },
  { name: "Ruy Lopez: Berlin Defense", moves: "e2e4 e7e5 g1f3 b8c6 f1b5 g8f6", eco: "C65" },
  { name: "Ruy Lopez: Morphy Defense", moves: "e2e4 e7e5 g1f3 b8c6 f1b5 a7a6", eco: "C70" },
  
  // Scotch Game
  { name: "Scotch Game", moves: "e2e4 e7e5 g1f3 b8c6 d2d4", eco: "C44" },
  
  // Queen's Pawn Openings (1.d4)
  { name: "Queen's Pawn Opening", moves: "d2d4", eco: "A40" },
  { name: "Queen's Gambit", moves: "d2d4 d7d5 c2c4", eco: "D06" },
  { name: "Queen's Gambit Accepted", moves: "d2d4 d7d5 c2c4 d5c4", eco: "D20" },
  { name: "Queen's Gambit Declined", moves: "d2d4 d7d5 c2c4 e7e6", eco: "D30" },
  { name: "Slav Defense", moves: "d2d4 d7d5 c2c4 c7c6", eco: "D10" },
  { name: "King's Indian Defense", moves: "d2d4 g8f6 c2c4 g7g6", eco: "E60" },
  { name: "Nimzo-Indian Defense", moves: "d2d4 g8f6 c2c4 e7e6 b1c3 f8b4", eco: "E20" },
  { name: "Grünfeld Defense", moves: "d2d4 g8f6 c2c4 g7g6 b1c3 d7d5", eco: "D70" },
  
  // Other First Moves
  { name: "English Opening", moves: "c2c4", eco: "A10" },
  { name: "Réti Opening", moves: "g1f3", eco: "A04" },
  { name: "Bird's Opening", moves: "f2f4", eco: "A02" },
  
  // Four Knights
  { name: "Four Knights Game", moves: "e2e4 e7e5 g1f3 b8c6 b1c3 g8f6", eco: "C47" },
  
  // Two Knights Defense
  { name: "Two Knights Defense", moves: "e2e4 e7e5 g1f3 b8c6 f1c4 g8f6", eco: "C55" },
  
  // Petrov Defense
  { name: "Petrov Defense", moves: "e2e4 e7e5 g1f3 g8f6", eco: "C42" },
  
  // Vienna Game
  { name: "Vienna Game", moves: "e2e4 e7e5 b1c3", eco: "C25" },
  
  // King's Gambit
  { name: "King's Gambit", moves: "e2e4 e7e5 f2f4", eco: "C30" },
];

class OpeningBook {
  /**
   * Get opening name from move sequence
   */
  getOpening(moves: string[]): string | null {
    // Convert moves array to space-separated string
    const movesString = moves.join(' ');
    
    // Find the longest matching opening
    let matchedOpening: Opening | null = null;
    let maxMatchLength = 0;
    
    for (const opening of openingsDatabase) {
      if (movesString.startsWith(opening.moves) && opening.moves.length > maxMatchLength) {
        matchedOpening = opening;
        maxMatchLength = opening.moves.length;
      }
    }
    
    if (matchedOpening) {
      return matchedOpening.eco 
        ? `${matchedOpening.name} (${matchedOpening.eco})`
        : matchedOpening.name;
    }
    
    return null;
  }
  
  /**
   * Check if we're still in the opening phase
   */
  isInOpening(moveCount: number): boolean {
    return moveCount <= 15; // First 15 moves considered opening
  }
}

export const openingBook = new OpeningBook();
