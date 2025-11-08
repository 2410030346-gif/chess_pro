"""
Download and prepare chess dataset for AI training
This script downloads a subset of Lichess games suitable for training
"""

import requests
import bz2
import os
from pathlib import Path

def download_lichess_games(year_month="2024-10", max_games=10000):
    """
    Download Lichess database for a specific month
    
    Args:
        year_month: Format "YYYY-MM" (e.g., "2024-10")
        max_games: Number of games to extract (start small for testing)
    """
    
    # Create directories
    data_dir = Path("dataset")
    data_dir.mkdir(exist_ok=True)
    
    # Lichess database URL
    url = f"https://database.lichess.org/standard/lichess_db_standard_rated_{year_month}.pgn.bz2"
    
    print(f"📥 Downloading games from {year_month}...")
    print(f"URL: {url}")
    print(f"This may take a few minutes depending on your connection...")
    
    compressed_file = data_dir / f"lichess_{year_month}.pgn.bz2"
    output_file = data_dir / f"lichess_{year_month}_sample.pgn"
    
    try:
        # Download compressed file
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        downloaded = 0
        
        with open(compressed_file, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        progress = (downloaded / total_size) * 100
                        print(f"\rDownload progress: {progress:.1f}%", end="")
        
        print("\n✅ Download complete!")
        
        # Decompress and extract sample
        print(f"\n📦 Extracting {max_games} games...")
        
        with bz2.open(compressed_file, 'rt', encoding='utf-8') as f_in:
            with open(output_file, 'w', encoding='utf-8') as f_out:
                game_count = 0
                current_game = []
                
                for line in f_in:
                    current_game.append(line)
                    
                    # Empty line indicates end of game
                    if line.strip() == "" and current_game:
                        if game_count < max_games:
                            f_out.writelines(current_game)
                            game_count += 1
                            
                            if game_count % 1000 == 0:
                                print(f"Extracted {game_count} games...")
                        else:
                            break
                        current_game = []
        
        print(f"\n✅ Successfully extracted {game_count} games!")
        print(f"📁 Output file: {output_file}")
        print(f"📊 File size: {output_file.stat().st_size / (1024*1024):.2f} MB")
        
        # Clean up compressed file to save space
        if compressed_file.exists():
            compressed_file.unlink()
            print("🗑️  Cleaned up compressed file")
        
        return output_file
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return None


def filter_high_quality_games(input_file, output_file, min_elo=1800):
    """
    Filter games to only include high-quality games (higher rated players)
    
    Args:
        input_file: Input PGN file
        output_file: Output PGN file with filtered games
        min_elo: Minimum ELO rating for both players
    """
    print(f"\n🔍 Filtering games (minimum ELO: {min_elo})...")
    
    with open(input_file, 'r', encoding='utf-8') as f_in:
        with open(output_file, 'w', encoding='utf-8') as f_out:
            current_game = []
            white_elo = 0
            black_elo = 0
            filtered_count = 0
            total_count = 0
            
            for line in f_in:
                current_game.append(line)
                
                # Extract ELO ratings
                if line.startswith('[WhiteElo "'):
                    try:
                        white_elo = int(line.split('"')[1])
                    except:
                        white_elo = 0
                        
                if line.startswith('[BlackElo "'):
                    try:
                        black_elo = int(line.split('"')[1])
                    except:
                        black_elo = 0
                
                # End of game
                if line.strip() == "" and current_game:
                    total_count += 1
                    
                    # Check if both players meet minimum ELO
                    if white_elo >= min_elo and black_elo >= min_elo:
                        f_out.writelines(current_game)
                        filtered_count += 1
                    
                    current_game = []
                    white_elo = 0
                    black_elo = 0
    
    print(f"✅ Filtered {filtered_count} games out of {total_count} (kept {filtered_count/total_count*100:.1f}%)")
    print(f"📁 Output file: {output_file}")


def analyze_dataset(pgn_file):
    """
    Analyze the dataset and show statistics
    """
    print(f"\n📊 Analyzing dataset: {pgn_file}")
    
    game_count = 0
    elo_ratings = []
    time_controls = {}
    
    with open(pgn_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('[Event "'):
                game_count += 1
            elif line.startswith('[WhiteElo "'):
                try:
                    elo = int(line.split('"')[1])
                    elo_ratings.append(elo)
                except:
                    pass
            elif line.startswith('[TimeControl "'):
                tc = line.split('"')[1]
                time_controls[tc] = time_controls.get(tc, 0) + 1
    
    print(f"Total games: {game_count}")
    if elo_ratings:
        print(f"Average ELO: {sum(elo_ratings) / len(elo_ratings):.0f}")
        print(f"ELO range: {min(elo_ratings)} - {max(elo_ratings)}")
    print(f"Time controls: {len(time_controls)} different types")


if __name__ == "__main__":
    print("=" * 60)
    print("Chess Dataset Download Tool")
    print("=" * 60)
    
    # Step 1: Download and extract sample
    # Using August 2024 - you can change to any month
    pgn_file = download_lichess_games(year_month="2024-08", max_games=10000)
    
    if pgn_file:
        # Step 2: Analyze the dataset
        analyze_dataset(pgn_file)
        
        # Step 3: Optional - Filter for high quality games
        print("\n" + "=" * 60)
        user_input = input("Do you want to filter for high-quality games only? (y/n): ")
        
        if user_input.lower() == 'y':
            filtered_file = Path("dataset") / "lichess_filtered_high_quality.pgn"
            filter_high_quality_games(pgn_file, filtered_file, min_elo=1800)
            analyze_dataset(filtered_file)
            print(f"\n✅ Use this file for training: {filtered_file}")
        else:
            print(f"\n✅ Use this file for training: {pgn_file}")
        
        print("\n" + "=" * 60)
        print("Next steps:")
        print("1. Install Leela Chess Zero training tools")
        print("2. Convert PGN to LC0 training format")
        print("3. Fine-tune the model")
        print("=" * 60)
