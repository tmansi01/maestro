# Maestro 🦄🎹 — Unicorn Piano Adventure

An interactive, progressive note-reading game for a 7-year-old learning piano across both the **Treble** and **Bass** clefs (`C3` to `C5`), guided by **Maestro the Unicorn**.

## ✨ Key Features

- **8 Progressive Worlds (Landmark Note System)**:
  1. **The Magic Whisker**: Middle C (`C4`) & stepping up to `D4` and down to `B3` (*Hot Cross Buns*)
  2. **The Treble Swirl**: Landmark `G4` (line 2) & stepping down to `F4` and `E4` (*Mary Had a Little Lamb*)
  3. **Climbing the Rainbow**: Upper Treble `A4`, `B4`, and High `C5` (*Twinkle, Twinkle, Little Star*)
  4. **Treble Clef Champion**: Full Treble octave (`C4–C5`) & `F-A-C-E` space trick (*Ode to Joy*)
  5. **The Two Magic Dots**: Bass Clef Landmark `F3` (line 4), `G3`, and `A3` (*Row, Row, Row Your Boat*)
  6. **Deep in the Crystal Cave**: Lower Bass `E3`, `D3`, and Landmark Bass `C3` (*Old MacDonald*)
  7. **Bass Clef Explorer**: Full Bass octave (`C3–C4`) (*London Bridge*)
  8. **The Grand Unicorn Concert**: Full Grand Staff combining Treble & Bass Clefs (*Grand Unicorn Symphony*)
- **Sequential Unlocking + Unlimited Replay of Unlocked Worlds**:
  - World 1 starts unlocked; Worlds 2–8 unlock sequentially as she clears each World's Boss Melody Concert.
  - Once unlocked, every World (its Story Lesson, all 3 Game Modes, and Boss Melody Concert) can be replayed infinitely with dynamically generated note queues to reinforce learning.
- **3 Selectable Game Modes**:
  1. **🎹 Mode 1: Magic Piano** (Interactive 2-octave keyboard `C3–C5` + physical keyboard shortcuts `C D E F G A B` on MacBook/Chromebook)
  2. **🏷️ Mode 2: Rainbow Bubbles** (Large touch buttons for rapid note-naming)
  3. **🎤 Mode 3: Real Piano Mic** (Web Audio YIN autocorrelation pitch detection that listens to her real piano!)
- **Progressive Hints & Spaced Repetition**:
  - **1st Mistake**: Shows the nearest Landmark Note on the staff with stepping-stone arrows (`+1`, `+2`, `-1`) and re-queues the note 3 questions later.
  - **2nd Mistake**: Highlights the exact answer in glowing yellow and reads it aloud so she never gets stuck.
- **Parent Gate & Cross-Device Magic Sync Code**:
  - Click the gear icon (Parent Gate: `6 × 7 = 42`) to switch between **English Letters (`C, D, E`)**, **Fixed-Do Solfège (`Do, Re, Mi`)**, or **Both**, adjust progressive color coding, unlock all worlds, or copy a `UNI-...` **Magic Sync Code** to transfer progress between her **Google Chromebook**, **Amazon Fire Tablet**, and your **MacBook**.

---

## 💻 Running Locally on Your MacBook (Chrome)

Since Node.js is installed via Homebrew (`/opt/homebrew/bin`), run:

```bash
npm run dev
```

Then open the local URL shown in Chrome on your MacBook!

To run the unit test suite or build the offline PWA bundle:

```bash
npm test
npm run build
```

---

## 🚀 Deploying to GitHub Pages (for Her Chromebook & Amazon Fire Tablet)

This repository includes a ready-to-go GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. Create a new repository on GitHub (e.g., `maestro`) and push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Maestro Unicorn Piano Adventure"
   git branch -M main
   git remote add origin https://github.com/<your-username>/maestro.git
   git push -u origin main
   ```
2. On GitHub, go to **Settings ➔ Pages**, and under **Build and deployment ➔ Source**, select **GitHub Actions**.
3. Within ~60 seconds, her game will be live at `https://<your-username>.github.io/maestro/`!
   - **On her Google Chromebook**: Open the link in Chrome and click the **Install Maestro** icon in the address bar to pin it to her shelf for offline play.
   - **On her Amazon Fire Tablet**: Open the link in **Amazon Silk Browser** and tap **Menu (⋮) ➔ Add to Home Screen** (or add the URL in **Amazon Parent Dashboard ➔ Add Content ➔ Add Websites** if using an Amazon Kids+ profile).
