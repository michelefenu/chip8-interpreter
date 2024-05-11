
import { CPU } from './core/cpu';
import { Memory } from './core/memory';
import { Display } from './core/display';
import { Input } from './core/input';
import { Timers } from './core/timers';
import { SoundManager } from './core/sound-manager';
import { frameRate } from './config/config';

export class Emulator {
    private cpu: CPU;
    private memory: Memory;
    private display: Display;
    private input: Input;
    private timers: Timers;

    constructor(canvasId: string) {
        this.memory = new Memory();
        this.display = new Display(canvasId);
        this.input = new Input();
        this.timers = new Timers(new SoundManager());
        this.cpu = new CPU(this.memory, this.display, this.input, this.timers);
    }

    public loadProgram(program: Uint8Array): void {
        this.memory.loadProgram(program);
    }

    public start(): void {
        this.executeCycle();
    }

    private executeCycle(): void {
        setInterval(() => {
            this.cpu.cycle();
        }, 1000 / frameRate);  // Execute at 60 Hz TODO replace with requestAnimationFrame
    }
}
