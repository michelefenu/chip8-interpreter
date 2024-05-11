import { Emulator } from "./app/emulator";

document.addEventListener("DOMContentLoaded", () => {
  const emulator = new Emulator("chip8-display");
  fetch("roms/Space-Invaders.ch8")
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      console.log(buffer);
      const rom = new Uint8Array(buffer);
      emulator.loadProgram(rom);
      emulator.start();
    })
    .catch((error) => console.error("Failed to load ROM:", error));
});
