# Maestro 🦄🎹 — Unicorn Piano Adventure

An interactive, progressive note-reading game for a 7-year-old learning piano across both the **Treble** and **Bass** clefs (`C3` to `C5`), guided by **Maestro the Unicorn**.

## ✨ Key Features

- **8 Progressive Worlds Across 3 Chapters (Landmark Note System)**:
  - **Chapter 1 — Right Hand • Treble Clef (`𝄞`, 1-Octave Keyboard `C4–C5`)**:
    1. **Magic Whisker**: Landmark Middle C (`C4`) & stepping up to `D4` and `E4` (3 notes • *Hot Cross Buns*)
    2. **Treble Swirl**: Landmark `G4` (line 2) & cumulative lower treble `C4–G4` (5 notes • *Mary Had a Little Lamb*)
    3. **Rainbow Climb**: Landmark High `C5` & upper treble `C4, F4–C5` (6 notes • *Twinkle, Twinkle, Little Star*)
    4. **Right Hand Champ**: Full Treble octave (`C4–C5`) & `F-A-C-E` space trick (8 notes • *Ode to Joy*)
  - **Chapter 2 — Left Hand • Bass Clef (`𝄢`, 1-Octave Keyboard `C3–C4`)**:
    5. **Two Magic Dots**: Landmark Bass `F3` (line 4) & cumulative upper bass `F3–C4` (5 notes • *Row, Row, Row Your Boat*)
    6. **Crystal Cave**: Landmark Low `C3` & lower bass `C3–G3, C4` (6 notes • *Old MacDonald*)
    7. **Left Hand Hero**: Full Bass octave (`C3–C4`) (8 notes • *London Bridge*)
  - **Chapter 3 — Both Hands • Grand Staff (`𝄞 + 𝄢`, 2-Octave Keyboard `C3–C5`)**:
    8. **Grand Concert**: All 5 Landmarks & all 15 notes (`C3–C5`) across Treble & Bass Clefs (*Grand Unicorn Symphony*)
- **Progressive 3-Tier Star Mastery Within Every World**:
  - **1️⃣ Lesson + Quick Check**: Interactive story introducing the World's Landmark anchor, ending with an unassisted Quick Check quiz slide.
  - **2️⃣ Practice (`⭐ Rainbow Guide` ➔ `⭐⭐ Sight Reader` ➔ `⭐⭐⭐ World Master`)**: Round 1 uses rainbow color scaffolding (`⭐`); Round 2 switches to classic black-and-white notes (`⭐⭐`, unlocking the Boss Song); Round 3 challenges her to master the world at $\ge 85\%$ accuracy (`⭐⭐⭐`).
  - **3️⃣ Boss Song Concert**: Sight-read the World's melody in classic black-and-white sheet music to unlock the next World!
- **🕹️ Endless Arcade Mode & Hall of Fame Leaderboard**:
  - **Custom Setup**: Pick Treble, Bass, or Grand Staff, toggle any combination of notes (`C3–C5`), and choose any of the 3 input modes.
  - **3 Hearts + Configurable Beat Timer**: Starts at a gentle `20.0s` per note at Level 1 by default (customizable from `8s` to `35s` in **Parent Settings**) and levels up every 6 notes (`-7.5%` per level down to a proportional high-level floor), using classic black-and-white sheet music for genuine sight-reading reinforcement.
  - **2-Second "Pause & Learn" Flash**: Losing a heart on a mistake or timeout briefly pauses the timer to reveal the Landmark Stepping-Stone Hint + play the true note (and re-queues it 3 turns ahead!).
  - **Mystery Golden Notes (`✨`)**: Randomly drop **❤️ Extra Hearts** (up to 5 max), **❄️ Ice Freeze**, **🌈 2x Rainbow Fever**, **🛡️ Unicorn Shields**, and **🎁 Boutique Sparkle Chests**!
  - **Family & Rival Hall of Fame**: Pre-seeded with 5 Unicorn Rivals, lets family/friends save their name & emoji avatar to the Top 10 Leaderboard, and syncs via `UNI-...` Magic Codes!
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
