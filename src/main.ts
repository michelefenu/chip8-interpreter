import { Display } from './app/display';

document.addEventListener('DOMContentLoaded', () => {
    const display = new Display('chip8-display');
    display.clear();

    display.draw(30, 10, 1);
});