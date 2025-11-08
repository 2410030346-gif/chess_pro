# Chess AI Training Dataset Setup

## Quick Start

### Step 1: Install Python Dependencies

```powershell
cd ai-training
pip install -r requirements.txt
```

### Step 2: Download Dataset

```powershell
python download_dataset.py
```

This will:
- Download 10,000 games from Lichess (October 2024)
- Extract them to `dataset/` folder
- Optionally filter for high-quality games (ELO 1800+)

**Dataset will be approximately 50-100 MB**

---

## Dataset Options

### Option 1: Small Sample (Recommended for Testing)
- **Games**: 10,000 games
- **Size**: ~50 MB
- **Download time**: 2-5 minutes
- **Good for**: Testing the pipeline, quick iteration

### Option 2: Medium Dataset (Recommended for Training)
- **Games**: 100,000 games
- **Size**: ~500 MB
- **Download time**: 10-20 minutes
- **Good for**: Actual fine-tuning with decent results

### Option 3: Large Dataset (Best Quality)
- **Games**: 1,000,000+ games
- **Size**: 5+ GB
- **Download time**: 1-2 hours
- **Good for**: Production-quality AI

---

## Customizing the Download

Edit `download_dataset.py` to change:

```python
# Change the month (any month from 2013-01 to present)
pgn_file = download_lichess_games(year_month="2024-10", max_games=10000)

# Change number of games
max_games=100000  # for medium dataset

# Change minimum ELO for filtering
filter_high_quality_games(pgn_file, filtered_file, min_elo=2000)  # only masters
```

---

## Available Lichess Databases

Visit: https://database.lichess.org/

### Monthly Standard Games
- `lichess_db_standard_rated_YYYY-MM.pgn.bz2` - All rated games
- Compressed size: 200-500 MB per month
- Uncompressed: 2-5 GB per month

### Example URLs:
- October 2024: `https://database.lichess.org/standard/lichess_db_standard_rated_2024-10.pgn.bz2`
- September 2024: `https://database.lichess.org/standard/lichess_db_standard_rated_2024-09.pgn.bz2`

---

## What Makes a Good Training Dataset?

### Quality Factors:
1. **Player Strength**: Higher ELO = better moves
   - Beginners (0-1400): Noisy data
   - Intermediate (1400-1800): Some good patterns
   - Advanced (1800-2200): Solid training data ✅
   - Masters (2200+): Excellent quality ✅✅

2. **Game Length**: 
   - Too short (<20 moves): Likely resignations/disconnects
   - Good range (20-80 moves): Full games with strategy
   - Too long (>100 moves): Endgame grinding

3. **Time Control**:
   - Bullet (<3 min): Fast but lower quality
   - Blitz (3-10 min): Good balance ✅
   - Rapid (10-30 min): High quality ✅
   - Classical (30+ min): Best quality ✅✅

### Recommended Filters:
```
Minimum ELO: 1800
Time Control: Blitz or higher
Number of games: 50,000-100,000
```

---

## Dataset Structure

After running the script, you'll have:

```
ai-training/
├── dataset/
│   ├── lichess_2024-10_sample.pgn      # Original sample
│   └── lichess_filtered_high_quality.pgn  # Filtered (optional)
├── download_dataset.py
├── requirements.txt
└── DATASET_SETUP.md
```

---

## PGN Format Example

Your dataset will look like this:

```
[Event "Rated Blitz game"]
[Site "https://lichess.org/abc123"]
[Date "2024.10.15"]
[Round "-"]
[White "PlayerOne"]
[Black "PlayerTwo"]
[Result "1-0"]
[WhiteElo "1950"]
[BlackElo "1920"]
[TimeControl "180+0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 
6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5
... more moves ...
1-0

[Event "Rated Blitz game"]
[Site "https://lichess.org/xyz789"]
...
```

---

## Next Steps

After downloading the dataset:

1. ✅ **Dataset Ready** - You now have PGN games
2. ⏭️ **Convert to LC0 Format** - Transform PGN to training format
3. ⏭️ **Fine-tune Model** - Train Leela Chess Zero
4. ⏭️ **Export Weights** - Get model for inference
5. ⏭️ **Integrate into Website** - Add to your chess app

---

## Troubleshooting

### Download Fails
- Check internet connection
- Try a different month
- Reduce `max_games` to a smaller number

### Out of Disk Space
- Start with fewer games (1,000-5,000)
- Use filtered dataset only
- Delete compressed `.bz2` files after extraction

### Slow Download
- Lichess servers might be busy
- Try downloading during off-peak hours
- Use a different month with smaller database

---

## Alternative Datasets

If Lichess doesn't work:

1. **Chess.com** - Contact for data access (commercial)
2. **FICS Games Database** - Free, older games: http://www.ficsgames.org/
3. **CCRL Computer Chess Database** - Engine vs engine games
4. **Your Own Games** - Export from Lichess/Chess.com profile

---

## Storage Requirements

| Games | Uncompressed | Compressed | Recommended RAM |
|-------|--------------|------------|-----------------|
| 10K   | 50 MB        | 10 MB      | 2 GB            |
| 100K  | 500 MB       | 100 MB     | 4 GB            |
| 1M    | 5 GB         | 1 GB       | 8 GB            |
| 10M   | 50 GB        | 10 GB      | 16 GB           |

---

## Ready to Download?

Run this command now:

```powershell
cd C:\Users\Niranjan\OneDrive\Desktop\chess_website\ai-training
pip install -r requirements.txt
python download_dataset.py
```

This will download a starter dataset of 10,000 high-quality games! 🎉
