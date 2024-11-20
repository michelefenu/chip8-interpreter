import { Display } from "./display";
import { Input } from "./input";
import { Memory } from "./memory";
import { Timers } from "./timers";

export class CPU {
  private V: Uint8Array = new Uint8Array(16);
  private I: number = 0;
  private PC: number = 0x200; // Program counter starts at 0x200 as the first 512 bytes are reserved
  private stack: number[] = [];
  private SP: number = 0; // Stack pointer

  constructor(
    private memory: Memory,
    private display: Display,
    private input: Input,
    private timers: Timers
  ) {
    this.reset();
  }

  reset() {
    this.memory.initialize();
    this.timers.resetTimers();
    this.display.clear();
    this.V = new Uint8Array(16);
    this.I = 0;
    this.PC = 0x200; // Program counter starts at 0x200 as the first 512 bytes are reserved
    this.stack = [];
    this.SP = 0; // Stack pointer
  }

  loadGame(gameData: Uint8Array): void {
    this.reset();
    this.memory.loadProgram(gameData);
  }

  async cycle() {
    // Fetch opcode
    let opcode =
      (this.memory.read(this.PC) << 8) | this.memory.read(this.PC + 1);
    this.PC += 2;

    // Decode and execute opcode
    await this.executeOpcode(opcode);
  }

  // Part of the CPU class
  async executeOpcode(opcode: number) {
    let x = (opcode & 0x0f00) >> 8;
    let y = (opcode & 0x00f0) >> 4;
    let n = opcode & 0x000f;
    let nn = opcode & 0x00ff;
    let nnn = opcode & 0x0fff;

    switch (opcode & 0xf000) {
      case 0x0000:
        switch (nn) {
          case 0x00: // 0x0000: Machine language subroutine
            break;
          case 0xe0: // 0x00E0: Clears the screen
            this.display.clear();
            break;
          case 0xee: // 0x00EE: Returns from subroutine
            this.PC = this.stack.pop()!;
            break;
        }
        break;

      case 0x1000: // 1NNN: Jump to address NNN
        this.PC = nnn;
        break;

      case 0x2000: // 2NNN: Calls subroutine at NNN
        this.stack.push(this.PC);
        this.PC = nnn;
        break;

      case 0x3000: // 3XNN: Skip the next instruction if VX equals NN
        if (this.V[x] === nn) {
          this.PC += 2;
        }
        break;

      case 0x4000: // 4XNN: Skip the next instruction if VX does not equal NN
        if (this.V[x] !== nn) {
          this.PC += 2;
        }
        break;

      case 0x5000: // 5XY0: Skip the next instruction if VX equals VY
        if (this.V[x] === this.V[y]) {
          this.PC += 2;
        }
        break;

      case 0x6000: // 6XNN: Set VX to NN
        this.V[x] = nn;
        break;

      case 0x7000: // 7XNN: Add NN to VX (Carry flag is not changed)
        this.V[x] += nn;
        break;

      case 0x8000:
        switch (n) {
          case 0x0: // 8XY0: Set VX to the value of VY
            this.V[x] = this.V[y];
            break;
          case 0x1: // 8XY1: Set VX to VX OR VY
            this.V[x] |= this.V[y];
            break;
          case 0x2: // 8XY2: Set VX to VX AND VY
            this.V[x] &= this.V[y];
            break;
          case 0x3: // 8XY3: Set VX to VX XOR VY
            this.V[x] ^= this.V[y];
            break;
          case 0x4: // 8XY4: Add VY to VX, VF is set to 1 when there's a carry, and to 0 when there isn't
            let sum = this.V[x] + this.V[y];
            this.V[0xf] = sum > 255 ? 1 : 0;
            this.V[x] = sum & 0xff;
            break;
          case 0x5: // 8XY5: VX subtracts VY, VF is set to 0 when there's a borrow, and 1 when there isn't
            this.V[0xf] = this.V[x] > this.V[y] ? 1 : 0;
            this.V[x] -= this.V[y];
            break;
          case 0x6: // 8XY6: Shift VX right by one. VF is set to the value of the least significant bit of VX before the shift
            this.V[0xf] = this.V[x] & 0x1;
            this.V[x] >>= 1;
            break;
          case 0x7: // 8XY7: Set VX to VY minus VX, VF is set to 0 when there's a borrow, and 1 when there isn't
            this.V[0xf] = this.V[y] > this.V[x] ? 1 : 0;
            this.V[x] = this.V[y] - this.V[x];
            break;
          case 0xe: // 8XYE: Shift VX left by one. VF is set to the value of the most significant bit of VX before the shift
            this.V[0xf] = this.V[x] >> 7;
            this.V[x] <<= 1;
            break;
        }
        break;

      case 0x9000: // 9XY0: Skip the next instruction if VX doesn't equal VY
        if (this.V[x] !== this.V[y]) {
          this.PC += 2;
        }
        break;

      case 0xa000: // ANNN: Set I to the address NNN
        this.I = nnn;
        break;

      case 0xb000: // BNNN: Jump to the address NNN plus V0
        this.PC = nnn + this.V[0];
        break;

      case 0xc000: // CXNN: Set VX to a random number and NN
        this.V[x] = Math.floor(Math.random() * 0x100) & nn;
        break;

      case 0xd000: // DXYN: Draw a sprite at coordinate (VX, VY) with N bytes of sprite data starting at the address stored in I
        this.V[0xf] = 0;
        for (let i = 0; i < n; i++) {
          let pixel = this.memory.read(this.I + i);
          for (let j = 0; j < 8; j++) {
            if ((pixel & (0x80 >> j)) !== 0) {
              let xCoord = (this.V[x] + j) % 64;
              let yCoord = (this.V[y] + i) % 32;
              if (this.display.setPixel(xCoord, yCoord)) {
                this.V[0xf] = 1;
              }
            }
          }
        }
        break;

      case 0xe000:
        switch (nn) {
          case 0x9e: // EX9E: Skip the next instruction if the key stored in VX is pressed
            if (this.input.isKeyPressed(this.V[x])) {
              this.PC += 2;
            }
            break;
          case 0xa1: // EXA1: Skip the next instruction if the key stored in VX isn't pressed
            if (!this.input.isKeyPressed(this.V[x])) {
              this.PC += 2;
            }
            break;
        }
        break;

      case 0xf000:
        switch (nn) {
          case 0x07: // FX07: Set VX to the value of the delay timer
            this.V[x] = this.timers.getDelayTimer();
            break;
          case 0x0a: // FX0A: A key press is awaited, and then stored in VX
            let keyPress = await this.input.waitForKeyPress();
            if (keyPress >= 0) {
              this.V[x] = keyPress;
            } else {
              this.PC -= 2; // Decrement PC to stay at this instruction until a key is pressed
            }
            break;
          case 0x15: // FX15: Set the delay timer to VX
            this.timers.setDelayTimer(this.V[x]);
            break;
          case 0x18: // FX18: Set the sound timer to VX
            this.timers.setSoundTimer(this.V[x]);
            break;
          case 0x1e: // FX1E: Add VX to I
            this.I += this.V[x];
            break;
          case 0x29: // FX29: Set I to the location of the sprite for the character in VX
            this.I = this.V[x] * 5; // Assuming each character is 5 bytes long
            break;
          case 0x33: // FX33: Store the binary-coded decimal representation of VX, with the most significant of three digits at the address in I
            this.memory.write(this.I, this.V[x] / 100);
            this.memory.write(this.I + 1, (this.V[x] / 10) % 10);
            this.memory.write(this.I + 2, (this.V[x] % 100) % 10);
            break;
          case 0x55: // FX55: Store V0 to VX in memory starting at address I
            for (let i = 0; i <= x; i++) {
              this.memory.write(this.I + i, this.V[i]);
            }
            break;
          case 0x65: // FX65: Fill V0 to VX with values from memory starting at address I
            for (let i = 0; i <= x; i++) {
              this.V[i] = this.memory.read(this.I + i);
            }
            break;
        }
        break;

      default:
        throw new Error("Unknown opcode: " + opcode);
    }
  }
}
