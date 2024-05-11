export class Display {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private scale: number = 20;  // Scale factor to enlarge the CHIP-8's 64x32 display
    private width: number = 64;
    private height: number = 32;
    private display: Uint8Array;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d')!;
        this.canvas.width = this.width * this.scale;
        this.canvas.height = this.height * this.scale;
        this.display = new Uint8Array(this.width * this.height);
        this.clear();

    }

    public clear(): void {
        this.display.fill(0);
        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public setPixel(x: number, y: number): boolean {
        const index = x + (y * this.width);
        this.display[index] ^= 1;  // XOR the current pixel

        // Draw the pixel
        const color = this.display[index] ? 'lightgreen' : 'black';
        this.context.fillStyle = color;
        this.context.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);

        // Return true if the pixel was turned off (collision detection)
        return this.display[index] === 0;
    }
}
