import './main.scss';
import { Emulator } from "./app/emulator";
import { games } from './app/data/games';

const emulator = new Emulator("chip8-display");

document.addEventListener("DOMContentLoaded", () => {
  const gameSelect = document.getElementById('game');
  const uploadInput = document.createElement('input');
  uploadInput.type = 'file';
  uploadInput.accept = '.ch8';
  uploadInput.style.display = 'none';
  uploadInput.onchange = handleFileUpload;
  document.body.appendChild(uploadInput);

  const uploadButton = document.createElement('button');
  uploadButton.innerText = 'Upload ROM...';
  uploadButton.classList.add('rom-item');
  uploadButton.onclick = () => uploadInput.click();

  for(let game of games) {
    const card = document.createElement('div');
    card.classList.add('rom-item');
    card.innerText = game.name;
    card.onclick = () => startGame(game.romFile);
    gameSelect?.appendChild(card);
  }

  gameSelect?.appendChild(uploadButton);
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

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      const buffer = e.target?.result as ArrayBuffer;
      const rom = new Uint8Array(buffer);
      emulator.loadProgram(rom);
      emulator.start();
    };
    reader.onerror = function(error) {
      console.error("Failed to read file:", error);
    };
    reader.readAsArrayBuffer(file);
  }
}