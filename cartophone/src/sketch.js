// Mouse Ripple by Happy Coding
// https://happycoding.io/examples/p5js/input/mouse-ripple

let circleX;
let circleY;
let circleSize;
let circle;

export function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas'); // Parent p5.js canvas to the div element
    noFill();
    strokeWeight(5);
    circleX = width / 2;
    circleY = height / 2;
    circleSize = 0;
}

export function draw() {
    background(0, 128, 255);

    circleSize += 10; // += operator adds two values together and assigns the result to a variable

    stroke(40, 64, 128); // (r, g, b)
    circle(circleX, circleY, circleSize); // (x, y, size) -- big circle
    circle(circleX, circleY, circleSize * 0.75); // decreases size by 25% -- medium circle
    circle(circleX, circleY, circleSize * 0.5); // decreases size by 50% -- small circle
}

export function mousePressed() {
    circleX = mouseX;
    circleY = mouseY;
    circleSize = 0; // starts circle size off as 0 so slate appears empty before you press the mouse
}