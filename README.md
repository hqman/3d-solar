# 3D Solar System Simulator

This is an interactive 3D solar system simulator built with Three.js.

## Features

- Realistic solar system model, including the sun, eight planets, and the moon
- Planets created according to relative size proportions (orbital distances not to scale)
- Planet rotation and orbital movement
- Interactive controls: drag to rotate view, scroll wheel to zoom
- Beautiful space background and stars

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Three.js (latest version, loaded via CDN)

## Running the Project

Use any HTTP server to run the project. For example:

```bash
# If using Python
python3 -m http.server 8080

# If Node.js is installed
npx serve
```

Then visit `http://localhost:8080` in your browser.

## Browser Compatibility

This project works in all browsers that support modern JavaScript and WebGL.

## Resources

- All planet textures are from Three.js official example resources
- The relative sizes of the planets are based on real data, but the orbital distances have been adjusted for aesthetic purposes
