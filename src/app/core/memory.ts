import { font } from "../data/font";

export class Memory {
    private memory: Uint8Array;

    constructor() {
        this.memory = new Uint8Array(4096);
        this.initialize();
    }

    public initialize(): void {
        this.memory.fill(0);
        this.loadFonts();
    }

    public loadProgram(program: Uint8Array): void {
        this.initialize();
        
        for (let i = 0; i < program.length; i++) {
            this.memory[0x200 + i] = program[i];
        }
    }

    public read(address: number): number {
        if (address < 0 || address >= this.memory.length) {
            throw new Error("Memory access violation");
        }
        return this.memory[address];
    }

    public write(address: number, value: number): void {
        if (address < 0 || address >= this.memory.length) {
            throw new Error("Memory access violation");
        }
        this.memory[address] = value & 0xFF;
    }

    private loadFonts(): void {
        for (let i = 0; i < font.length; i++) {
            this.memory[i] = font[i];
        }
    }
}
