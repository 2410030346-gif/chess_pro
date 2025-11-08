"""
Generate a sample chess dataset for testing the training pipeline
This creates synthetic but realistic chess games
"""

import chess
import chess.pgn
import random
from pathlib import Path
from datetime import datetime, timedelta

def generate_sample_games(num_games=1000):
    """
    Generate sample chess games with realistic play patterns
    """
    data_dir = Path("dataset")
    data_dir.mkdir(exist_ok=True)
    
    output_file = data_dir / "sample_training_dataset.pgn"
    
    print("=" * 60)
    print("Generating Sample Chess Dataset")
    print("=" * 60)
    print(f"\n📝 Creating {num_games} sample games...")
    print("This will take a few minutes...\n")
    
    # Common opening moves for variety
    opening_sequences = [
        # Italian Game
        ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"],
        # Sicilian Defense
        ["e2e4", "c7c5", "g1f3", "d7d6", "d2d4", "c5d4"],
        # French Defense
        ["e2e4", "e7e6", "d2d4", "d7d5"],
        # Caro-Kann
        ["e2e4", "c7c6", "d2d4", "d7d5"],
        # Queen's Gambit
        ["d2d4", "d7d5", "c2c4"],
        # King's Indian
        ["d2d4", "g8f6", "c2c4", "g7g6"],
        # English Opening
        ["c2c4", "e7e5"],
        # Ruy Lopez
        ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5"],
    ]
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for game_num in range(num_games):
            # Create new game
            game = chess.pgn.Game()
            
            # Add headers
            game.headers["Event"] = "Sample Training Game"
            game.headers["Site"] = "Training Dataset"
            
            # Random date in the past year
            date = datetime.now() - timedelta(days=random.randint(0, 365))
            game.headers["Date"] = date.strftime("%Y.%m.%d")
            
            game.headers["Round"] = str(random.randint(1, 10))
            game.headers["White"] = f"Player{random.randint(1000, 9999)}"
            game.headers["Black"] = f"Player{random.randint(1000, 9999)}"
            
            # Random ELO ratings (1400-2200)
            game.headers["WhiteElo"] = str(random.randint(1400, 2200))
            game.headers["BlackElo"] = str(random.randint(1400, 2200))
            
            # Time control
            time_controls = ["180+0", "300+0", "600+0", "900+10"]
            game.headers["TimeControl"] = random.choice(time_controls)
            
            # Generate moves
            board = chess.Board()
            node = game
            
            # Start with a random opening
            opening = random.choice(opening_sequences)
            for uci_move in opening:
                try:
                    move = chess.Move.from_uci(uci_move)
                    if move in board.legal_moves:
                        board.push(move)
                        node = node.add_variation(move)
                except:
                    break
            
            # Continue with random legal moves (weighted towards good moves)
            move_count = 0
            max_moves = random.randint(30, 80)
            
            while not board.is_game_over() and move_count < max_moves:
                legal_moves = list(board.legal_moves)
                
                if not legal_moves:
                    break
                
                # Bias towards captures and checks (more interesting moves)
                captures = [m for m in legal_moves if board.is_capture(m)]
                checks = [m for m in legal_moves if board.gives_check(m)]
                
                # 30% chance to make a capture if available
                if captures and random.random() < 0.3:
                    move = random.choice(captures)
                # 20% chance to make a check if available
                elif checks and random.random() < 0.2:
                    move = random.choice(checks)
                # Otherwise random legal move
                else:
                    move = random.choice(legal_moves)
                
                board.push(move)
                node = node.add_variation(move)
                move_count += 1
                
                # Small chance to end game early (resignation)
                if move_count > 15 and random.random() < 0.05:
                    break
            
            # Determine result
            if board.is_checkmate():
                game.headers["Result"] = "0-1" if board.turn == chess.WHITE else "1-0"
            elif board.is_stalemate() or board.is_insufficient_material():
                game.headers["Result"] = "1/2-1/2"
            elif move_count >= max_moves:
                # Timeout or random result
                game.headers["Result"] = random.choice(["1-0", "0-1", "1/2-1/2"])
            else:
                # Resignation
                game.headers["Result"] = random.choice(["1-0", "0-1"])
            
            # Write game to file
            print(game, file=f, end="\n\n")
            
            # Progress update
            if (game_num + 1) % 100 == 0:
                print(f"  Generated {game_num + 1}/{num_games} games...")
    
    print(f"\n✅ Successfully generated {num_games} games!")
    print(f"📁 Output file: {output_file}")
    print(f"📊 File size: {output_file.stat().st_size / (1024*1024):.2f} MB")
    
    analyze_dataset(output_file)
    
    return output_file


def analyze_dataset(pgn_file):
    """
    Analyze the generated dataset
    """
    print(f"\n📊 Dataset Analysis:")
    print("-" * 60)
    
    game_count = 0
    total_moves = 0
    results = {"1-0": 0, "0-1": 0, "1/2-1/2": 0}
    
    try:
        with open(pgn_file, 'r', encoding='utf-8') as f:
            while True:
                game = chess.pgn.read_game(f)
                if game is None:
                    break
                
                game_count += 1
                
                # Count moves
                moves = list(game.mainline_moves())
                total_moves += len(moves)
                
                # Count results
                result = game.headers.get("Result", "*")
                if result in results:
                    results[result] += 1
        
        avg_moves = total_moves / game_count if game_count > 0 else 0
        
        print(f"✅ Total games: {game_count}")
        print(f"✅ Average moves per game: {avg_moves:.1f}")
        print(f"✅ Results distribution:")
        print(f"   White wins: {results['1-0']} ({results['1-0']/game_count*100:.1f}%)")
        print(f"   Black wins: {results['0-1']} ({results['0-1']/game_count*100:.1f}%)")
        print(f"   Draws: {results['1/2-1/2']} ({results['1/2-1/2']/game_count*100:.1f}%)")
        print(f"✅ Ready for training!")
        
    except Exception as e:
        print(f"❌ Analysis error: {e}")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("Sample Dataset Generator")
    print("=" * 60)
    print("\n⚠️  NOTE: This creates synthetic games for testing.")
    print("For production AI, use real games from Lichess/Chess.com")
    print("=" * 60 + "\n")
    
    # Generate 1000 games (good for testing)
    result = generate_sample_games(num_games=1000)
    
    if result:
        print("\n" + "=" * 60)
        print("✅ SUCCESS! Sample dataset created")
        print("=" * 60)
        print("\nDataset details:")
        print("• Source: Generated (synthetic)")
        print("• Quality: Good for testing pipeline")
        print("• Recommendation: Replace with real Lichess data for production")
        print("\nNext steps:")
        print("1. ✅ Dataset ready")
        print("2. ⏭️  Test the training pipeline with this sample")
        print("3. ⏭️  Later, replace with real Lichess dataset")
        print("=" * 60)
