// Mouse Ripple by Happy Coding
// https://happycoding.io/examples/p5js/input/mouse-ripple

let circleX;
let circleY;
let circleSize;

export function draw() {
    background(0, 128, 255);

    circleSize += 10; // += operator adds two values together and assigns the result to a variable

    stroke(0, 64, 128); // (r, g, b)
    circle(circleX, circleY, circleSize); // (x, y, size) -- big circle
    circle(circleX, circleY, circleSize * 0.75); // decreases size by 25% -- medium circle
    circle(circleX, circleY, circleSize * 0.5); // decreases size by 50% -- small circle
}

export function mousePressed() {
    circleX = mouseX;
    circleY = mouseY;
    circleSize = 0; // starts circle size off as 0 so slate appears empty before you press the mouse
}