# HTML 5 Canvas Path Creator

cd docs && python3 -m http.server && /usr/bin/open -a "/Applications/Google Chrome.app" 'http://localhost:8000/'

## Description

While trying to develope a 2D video game on THREE.js (WebGL), I wanted to create custom shapes. Because it's using similar features like those of the HTML5 Canvas Path and because Bezier curves are pretty hard to make without a visual tool, I finally created one to ease this process.

It took me an afternoon to do and it is enough for my goals, but if you wish to use it and need more features, do not hesitate to contribute or to ask.

## The web page

You can find the page at: [https://adriencastex.github.io/HTML5-Canvas-Path-Creator](https://adriencastex.github.io/HTML5-Canvas-Path-Creator).

Thank you, GitHub, for hosting it.

## Missing features

- [ ] Load points from a text source
- [ ] Manage the size and the position of the background image
- [ ] Options for colors (if the background image is black, the black points will be hard to see)
- [ ] Allow to select multiple points to move more at once (add the `SELECT/MOVE` tool)
- [x] Clean up the code (explode the file `src/index.ts` into multiple files)
- [ ] Add a button to switch between producing JavaScript or TypeScript

## Rebuild

If you wish to clone the project and make your own changes, you will be able to recompile the TS file with `npm run build`, or `npm run dev`. Be sure to have the dependencies (`npm i`) installed.
