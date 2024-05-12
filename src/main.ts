import './main.scss';
import { Emulator } from "./app/emulator";
import { games } from './app/data/games';

const emulator = new Emulator("chip8-display");

document.addEventListener("DOMContentLoaded", () => {
  const gameSelect = document.getElementById('game');

  for(let game of games) {
    const card = document.createElement('div');
    card.innerText = game.name;
    card.onclick = () => startGame(game.romFile);
    gameSelect?.appendChild(card);
  }

});

function startGame(romFile: string) {
  fetch(`roms/${romFile}`)
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      console.log(buffer);
      const rom = new Uint8Array(buffer);
      emulator.loadProgram(rom);
      emulator.start();
    })
    .catch((error) => console.error("Failed to load ROM:", error));
}