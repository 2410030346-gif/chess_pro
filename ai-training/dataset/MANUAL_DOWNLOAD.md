# Manual Dataset Download Guide

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
