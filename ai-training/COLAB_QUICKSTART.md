# 🚀 Google Colab Training - Quick Start

## ✅ What You Have Ready

1. ✅ **Dataset**: `dataset/sample_training_dataset.pgn` (1,000 games)
2. ✅ **Colab Notebook**: `Chess_AI_Training_LC0.ipynb`
3. ✅ **Everything needed to train your AI!**

---

## 📋 Step-by-Step Instructions

### Step 1: Open Google Colab

1. Go to: **https://colab.research.google.com/**
2. Sign in with your Google account
3. Click **File** → **Upload notebook**
4. Upload: `Chess_AI_Training_LC0.ipynb` (from this folder)

---

### Step 2: Enable GPU (CRITICAL!)

1. In Colab, click **Runtime** → **Change runtime type**
2. Set **Hardware accelerator** to: **T4 GPU**
3. Click **Save**

**Without GPU, training will be 100x slower!**

---

### Step 3: Run the Notebook

1. Click the **▶️ Play button** on each cell, top to bottom
2. Wait for each cell to complete before running the next
3. When prompted, upload your dataset: `sample_training_dataset.pgn`

**Expected Timeline**:
- Setup (Steps 1-4): ~5 minutes
- Training (Step 5): ~4-6 hours
- Export (Steps 6-8): ~5 minutes

---

### Step 4: What Happens During Training

The notebook will:

1. **Install dependencies** (~3 min)
   - Leela Chess Zero tools
   - PyTorch for neural networks
   - Chess libraries

2. **Upload dataset** (~1 min)
   - You'll select: `sample_training_dataset.pgn`
   - File uploads to Colab

3. **Preprocess data** (~2 min)
   - Convert PGN → training format
   - Extract ~35,000 positions
   - Split train/validation

4. **Train model** (~4-6 hours) ⏰
   - Fine-tune neural network
   - 50 epochs
   - GPU accelerated
   - **You can close browser during this!**

5. **Export model** (~2 min)
   - Save trained weights
   - Convert to web format (ONNX)
   - Create metadata

6. **Download** (~1 min)
   - Get `trained_chess_model.zip`
   - Contains everything for your website

---

## 💡 Important Tips

### During Training:

- ✅ **Can close browser** - Training continues in Colab
- ✅ **Check progress** - Reopen notebook to see current epoch
- ✅ **Auto-saves** - Progress saved every 10 epochs
- ⚠️ **Session limit** - Free Colab: 12 hours max
- ⚠️ **Keep tab open** - Prevents disconnection

### If Training Stops:

1. Reopen the Colab notebook
2. Run the last cell (download)
3. You'll get the model trained so far
4. Still usable, just less trained

---

## 📦 After Training

You'll download: **`trained_chess_model.zip`**

Contains:
- `chess_model_trained.pth` - PyTorch weights
- `chess_model_web.onnx` - Web-compatible format
- `model_metadata.json` - Training info

**Save this to**: `C:\Users\Niranjan\OneDrive\Desktop\chess_website\ai-training\trained_model\`

---

## 🎯 Next: Integrate into Website

After downloading the model, I'll help you:

1. Install ONNX Runtime in your React app
2. Create `customai.ts` service
3. Load model in browser
4. Add "Custom AI" mode to your chess website
5. Test it out!

---

## 🐛 Troubleshooting

### "No GPU available"
→ Runtime → Change runtime type → Select GPU → Save

### "Session disconnected"
→ Refresh page, training should resume from last checkpoint

### "Out of memory"
→ Use smaller batch size (I'll help modify the notebook)

### "Upload fails"
→ Try uploading via Files panel (📁 icon on left sidebar)

---

## ⚡ Quick Start Commands

**Open Colab**:
```
https://colab.research.google.com/
```

**Upload this file**:
```
Chess_AI_Training_LC0.ipynb
```

**Upload when prompted**:
```
sample_training_dataset.pgn
```

**Download result**:
```
trained_chess_model.zip
```

---

## 🎓 What You're Actually Doing

This is **transfer learning** with neural networks:

1. Start with pre-trained chess knowledge
2. Fine-tune on YOUR games
3. Model learns YOUR playing style
4. Creates AI opponent matching your dataset

**Result**: Custom AI trained on your specific games! 🎉

---

## 📊 Expected Results

With 1,000 games:
- **Strength**: ~1600-1800 ELO
- **Style**: General chess principles
- **Speed**: Fast inference (<100ms per move)
- **Quality**: Good for beginners/intermediate

To improve (need more data):
- 10K games → 1800-2000 ELO
- 50K games → 2000-2200 ELO
- 100K+ games → 2200+ ELO (strong)

---

## 🔄 Training More Later

Want to train again with better data?

1. Get real Lichess games (50K+)
2. Upload to same Colab notebook
3. Re-run all cells
4. Get stronger model
5. Replace old model in website

**Models are swappable!** Just update the files.

---

## ✅ Ready to Start?

1. Open: https://colab.research.google.com/
2. Upload: `Chess_AI_Training_LC0.ipynb`
3. Enable GPU
4. Run all cells
5. Upload dataset when prompted
6. Wait ~4-6 hours
7. Download trained model
8. Come back here for integration!

---

## 🎉 You're All Set!

**Time to train your chess AI!**

Open Colab and start the notebook. I'll be here when you're ready to integrate it into your website! 🚀

---

## 📞 After Training

Once you have `trained_chess_model.zip`, message me:

**"Model is trained, ready to integrate!"**

And I'll help you:
- Install ONNX Runtime
- Create AI service
- Load model in React
- Add Custom AI mode
- Test everything

**Good luck with training!** 🏆
