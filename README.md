# ✈️ Plane Dodger - Boarding Pass Edition

A fast-paced, addictive arcade game built in vanilla HTML5, CSS3, and JavaScript. Guide your character through a busy airport tarmac, dodging taxiing planes while collecting boarding passes and power-ups!

## 🎮 How to Play

- **Move Left/Right**: Use arrow keys (`←` `→`) or `A`/`D`
- **Mobile**: Tap left or right side of the screen
- **Objective**: Dodge planes and collect items to rack up points

### Collectibles

| Item | Effect |
|------|--------|
| 🎫 **Boarding Pass** | +100 points |
| ⛽ **Fuel Can** | +1 life |
| ⚡ **Speed Boost** | Move 2x faster (5s) |
| 🛡️ **Shield** | Invincible (5s) |
| 🐌 **Slow-Mo** | Planes move slower (5s) |
| 📦 **Size Up** | Bigger hitbox (5s) |
| 🚀 **Speed Up** | Planes faster (5s) |

## ✨ Features

- **Progressive Difficulty**: Difficulty increases every 30 seconds
- **Power-up System**: 7 unique power-ups with visual indicators
- **Collision Detection**: Pixel-perfect AABB collision system
- **Sound Effects**: Retro beep sounds powered by Web Audio API
- **Particle Effects**: Visual feedback on collection and collisions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Offline Play**: No dependencies, pure vanilla JavaScript
- **GitHub Pages Ready**: Deploy directly from this repo

## 🚀 Quick Start

### Local Play
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Click "START GAME" to begin

### GitHub Pages Deployment
1. Push this repository to your GitHub account
2. Go to Settings → Pages
3. Set source to `main` branch (or your branch)
4. Your game will be live at `https://yourusername.github.io/repo-name`

## 📁 File Structure

```
├── index.html      # Main game file (HTML + embedded CSS/JS)
├── style.css       # Game styling
├── game.js         # Complete game engine
├── README.md       # This file
└── .nojekyll       # GitHub Pages configuration
```

## 🎯 How-to-Play

### Difficulty Curve
- **Level 1** (0-30s): Spawn rate 1.5%, base speed 1.5
- **Level 2** (30-60s): Spawn rate 1.8%, base speed 1.8
- **Level 3+**: Increases by 0.3% and 0.3 speed per 30s

### Scoring System
- Standard dodging: +1 point per frame
- Boarding pass: +100 points
- Surviving difficulty increases builds multipliers

### Lives & Game Over
- Start with 3 lives
- Lose 1 life when hit by a plane (unless shielded)
- Fuel cans restore 1 life
- Game ends at 0 lives

### Controls
- 🕹️ Use LEFT/RIGHT ARROW KEYS or A/D to move
- 📱 Or tap LEFT/RIGHT sides of screen on mobile
- 🎯 Dodge the planes and collect items!

## 🎨 Design Notes

- **Color Scheme**: Retro arcade aesthetic with neon accents (#e94560, #00d4ff, #00ff00)
- **Graphics**: Canvas-based rendering with geometric shapes
- **Sound**: Web Audio API for procedural beep synthesis (no files needed)
- **Animations**: CSS and canvas-based particle effects

## 🛠️ Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## ⚙️ Technical Details

### Game Loop
- 60 FPS using `requestAnimationFrame`
- Delta-time based physics for frame-rate independence

### Collision Detection
- Axis-Aligned Bounding Box (AABB) algorithm
- O(n²) broad-phase (acceptable for ~50 objects)

### Audio
- Web Audio API synthesis (zero file dependencies)
- Frequencies: 150Hz (crash), 800Hz (collect), 1200Hz (powerup)

## 📝 Future Enhancements

- Sprite-based graphics
- Multiple level themes
- Leaderboard system
- Combo multipliers
- Boss encounters
- Achievements

## 🎓 Educational Value

This game demonstrates:
- Canvas API and 2D graphics rendering
- Event handling (keyboard, touch, mouse)
- Game loop architecture
- Collision detection algorithms
- Object-oriented programming in JavaScript
- Web Audio API basics
- Responsive design principles
- State management patterns

## 📄 License

Free to use, modify, and distribute. Created for educational purposes.

## 🙏 Inspired By

- Classic arcade games (Pac-Man, Space Invaders)
- Endless runner game design
- Airport/aviation themes

---

**Made with ❤️ for arcade gaming enthusiasts**

Fly safe, collect those boarding passes, and dodge those planes! 🛫
