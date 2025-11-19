# Plan: Plane Dodger - Boarding Pass Edition Implementation

## TL;DR
Build a fast-paced, offline arcade game in vanilla HTML/CSS/JS with a traveler dodging taxiing planes while collecting boarding passes and power-ups. The game features progressive difficulty, retro arcade aesthetics, and GitHub Pages deployment readiness. Within 40 minutes, we'll create modular game logic, simple pixel-art or geometric sprites, and essential sound effects for an addictive, complete experience.

---

## File Structure
```
ENGfest game 2/
├── index.html          # Main entry point with canvas
├── style.css           # Game styling & layout
├── game.js             # Core game engine
├── entities/
│   ├── player.js       # Player movement & collision
│   ├── plane.js        # Plane spawning & movement
│   ├── collectible.js  # Items (boarding passes, fuel, upgrades)
├── assets/
│   ├── sprites.png     # Spritesheet (player, planes, items)
│   ├── bg.png          # Background/tarmac
│   ├── sounds/
│   │   ├── collect.mp3
│   │   ├── crash.mp3
│   │   ├── bgm.mp3
├── README.md           # GitHub Pages documentation
└── .nojekyll           # For GitHub Pages
```

---

## Implementation Steps

1. **Create HTML structure** – Canvas setup, score/lives display, game container with responsive layout.

2. **Build core game engine** (`game.js`) – Game loop (requestAnimationFrame), collision detection, game states (menu, playing, game-over), difficulty scaling.

3. **Implement player controller** (`player.js`) – Keyboard/touch movement (left/right), boundary checks, collision detection with planes.

4. **Create plane spawner** (`plane.js`) – Random spawning from top, velocity increase over time, taxi animation, removal when off-screen.

5. **Add collectibles system** (`collectible.js`) – Boarding passes (points), fuel cans (life recovery), upgrades (temporary speed/invincibility).

6. **Build UI & scoring** – Display score, remaining lives, game-over screen, restart button, difficulty level indicator.

7. **Create/embed assets** – Use CSS/Canvas shapes for MVP (colored rectangles for planes/player), add sprite images if time permits. Placeholder sounds or browser audio synthesis.

8. **Polish & optimize** – Smooth animations, particle effects on collection, responsiveness, GitHub Pages setup.

---

## Key Design Decisions

1. **Graphics approach:** Start with **CSS/Canvas shapes** (fast), upgrade to **sprites if time allows** (1-2 min max).

2. **Physics model:** Simple **collision detection** (AABB bounding boxes), no complex physics needed for arcade feel.

3. **Difficulty curve:** Increase plane spawn rate + speed every 30 seconds or per 500 points—keeps engagement high.

4. **Sound strategy:** Use **browser Web Audio API** for simple beeps/tones (no file dependency) OR embed minimal MP3s as data URIs.

5. **Mobile support:** Implement **touch controls** (left/right screen zones) alongside keyboard for broader playability.

6. **GitHub Pages:** Single `index.html` with inline CSS/JS, assets as data URIs or lightweight sprites—fully self-contained file.

---

## Time Allocation (40 minutes)

| Task | Time |
|------|------|
| HTML + CSS setup | 3 min |
| Game loop & core logic | 10 min |
| Player & plane mechanics | 8 min |
| Collectibles & scoring | 6 min |
| UI, polish, sounds | 8 min |
| Testing & GitHub Pages setup | 5 min |

---

## Further Considerations

1. **Asset creation:** Generate the sprites and sounds with what you consider appropiate
2. **Complexity scope:** Include power-ups like temporary invincibility, temporal slow-motion, and also the oposite, speed ups and making the character bigger (temporary as well).
3. **Deployment:** Separate files with GitHub Pages folder structure
