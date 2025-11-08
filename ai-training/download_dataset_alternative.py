"""
Alternative dataset download using smaller, more reliable sources
"""

import requests
import gzip
import os
from pathlib import Path

def download_ficsgames_sample():
    """
    Download a sample from FICS Games Database - smaller and more reliable
    """
    
    # Create directories
    data_dir = Path("dataset")
    data_dir.mkdir(exist_ok=True)
    
    print("=" * 60)
    print("Chess Dataset Download - FICS Database")
    print("=" * 60)
    print("\n📥 Downloading sample chess games...")
    print("Source: Free Internet Chess Server (FICS)")
    print("This will download approximately 50MB of games\n")
    
    # FICS has reliable, smaller datasets
    # We'll download a year's worth of games which is manageable
    url = "https://www.ficsgames.org/download/ficsgames-2023.pgn.gz"
    
    compressed_file = data_dir / "ficsgames-2023.pgn.gz"
    output_file = data_dir / "chess_training_dataset.pgn"
    
    try:
        print(f"Downloading from: {url}")
        response = requests.get(url, stream=True, timeout=60)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        downloaded = 0
        
        print("\nDownload progress:")
        with open(compressed_file, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        progress = (downloaded / total_size) * 100
                        mb_downloaded = downloaded / (1024 * 1024)
                        mb_total = total_size / (1024 * 1024)
                        print(f"\r  {progress:.1f}% ({mb_downloaded:.1f} MB / {mb_total:.1f} MB)", end="")
        
        print("\n✅ Download complete!")
        
        # Decompress
        print("\n📦 Decompressing files...")
        
        with gzip.open(compressed_file, 'rt', encoding='utf-8', errors='ignore') as f_in:
            with open(output_file, 'w', encoding='utf-8') as f_out:
                game_count = 0
                max_games = 10000  # Extract first 10,000 games
                current_game = []
                
                for line in f_in:
                    current_game.append(line)
                    
                    if line.strip() == "" and current_game:
                        if game_count < max_games:
                            f_out.writelines(current_game)
                            game_count += 1
                            
                            if game_count % 1000 == 0:
                                print(f"  Extracted {game_count} games...")
                        else:
                            break
                        current_game = []
        
        print(f"\n✅ Successfully extracted {game_count} games!")
        print(f"📁 Output file: {output_file}")
        print(f"📊 File size: {output_file.stat().st_size / (1024*1024):.2f} MB")
        
        # Clean up
        if compressed_file.exists():
            compressed_file.unlink()
            print("🗑️  Cleaned up compressed file")
        
        # Analyze dataset
        analyze_dataset(output_file)
        
        return output_file
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Download Error: {e}")
        print("\n🔄 Trying alternative method...")
        return download_lichess_elite_games()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return None


def download_lichess_elite_games():
    """
    Download a curated subset of high-quality games from Lichess Elite database
    """
    data_dir = Path("dataset")
    data_dir.mkdir(exist_ok=True)
    
    print("\n📥 Downloading Lichess Elite database (masters only)...")
    
    # Lichess Elite contains games from titled players
    url = "https://database.lichess.org/lichess_elite_2024-01.pgn.bz2"
    
    output_file = data_dir / "chess_training_dataset.pgn"
    
    try:
        import bz2
        
        print(f"Downloading from: {url}")
        response = requests.get(url, stream=True, timeout=60)
        response.raise_for_status()
        
        # Download and decompress in chunks
        print("\nDownloading and processing...")
        
        with open(output_file, 'w', encoding='utf-8') as f_out:
            decompressor = bz2.BZ2Decompressor()
            game_count = 0
            max_games = 5000  # Elite games are higher quality, need fewer
            current_game = []
            buffer = ""
            
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    try:
                        decompressed = decompressor.decompress(chunk).decode('utf-8', errors='ignore')
                        buffer += decompressed
                        
                        lines = buffer.split('\n')
                        buffer = lines[-1]  # Keep incomplete line
                        
                        for line in lines[:-1]:
                            current_game.append(line + '\n')
                            
                            if line.strip() == "" and current_game:
                                if game_count < max_games:
                                    f_out.writelines(current_game)
                                    game_count += 1
                                    
                                    if game_count % 500 == 0:
                                        print(f"  Extracted {game_count} elite games...")
                                else:
                                    break
                                current_game = []
                        
                        if game_count >= max_games:
                            break
                    except:
                        continue
        
        print(f"\n✅ Successfully extracted {game_count} elite games!")
        print(f"📁 Output file: {output_file}")
        
        analyze_dataset(output_file)
        
        return output_file
        
    except Exception as e:
        print(f"\n❌ Error with Elite database: {e}")
        print("\n💡 Creating a manual download guide...")
        create_manual_download_guide()
        return None


def create_manual_download_guide():
    """
    Create a guide for manual dataset download
    """
    guide_file = Path("dataset") / "MANUAL_DOWNLOAD.md"
    
    guide_content = """# Manual Dataset Download Guide

Since automatic download failed, here's how to manually get chess games:

## Option 1: Lichess Database (Recommended)

1. Visit: https://database.lichess.org/
2. Download any month's standard games (look for the most recent available)
3. Example: `lichess_db_standard_rated_2024-07.pgn.bz2`
4. Save it to this folder: `ai-training/dataset/`
5. Extract first 10,000 games using this command:

```powershell
# Install 7-Zip if you don't have it, then:
7z x lichess_db_standard_rated_2024-07.pgn.bz2
```

## Option 2: FICS Database

1. Visit: https://www.ficsgames.org/download.html
2. Download any year: `ficsgames-2023.pgn.gz`
3. Save and extract to `ai-training/dataset/`

## Option 3: Use Sample Games

I can generate a small sample dataset (1000 games) from common openings
and patterns. This won't be as good but will let you test the pipeline.

Would you like me to generate a sample dataset instead?
"""
    
    with open(guide_file, 'w') as f:
        f.write(guide_content)
    
    print(f"📝 Created manual download guide: {guide_file}")
    print("\n" + "=" * 60)
    print("Please see MANUAL_DOWNLOAD.md for next steps")
    print("=" * 60)


def analyze_dataset(pgn_file):
    """
    Analyze the dataset and show statistics
    """
    print(f"\n📊 Dataset Analysis:")
    print("-" * 60)
    
    game_count = 0
    
    try:
        with open(pgn_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('[Event '):
                    game_count += 1
        
        print(f"✅ Total games: {game_count}")
        print(f"✅ File location: {pgn_file}")
        print(f"✅ Ready for training!")
        
    except Exception as e:
        print(f"❌ Analysis error: {e}")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("Starting dataset download...")
    print("=" * 60 + "\n")
    
    # Try FICS first (more reliable)
    result = download_ficsgames_sample()
    
    if result:
        print("\n" + "=" * 60)
        print("✅ SUCCESS! Dataset ready for training")
        print("=" * 60)
        print("\nNext steps:")
        print("1. ✅ Dataset downloaded")
        print("2. ⏭️  Convert to Leela Chess Zero format")
        print("3. ⏭️  Fine-tune the AI model")
        print("4. ⏭️  Integrate into your chess website")
        print("=" * 60)
    else:
        print("\n⚠️  Automatic download failed")
        print("Please check MANUAL_DOWNLOAD.md for alternative options")
