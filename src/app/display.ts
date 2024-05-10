export class Display {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private scale = 10;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d')!;
        this.canvas.width = 64 * this.scale;
        this.canvas.height = 32 * this.scale;
    }

    clear(): void {
        this.context.fillStyle = 'black';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw(x: number, y: number, value: number): void {
        const color = value ? 'white' : 'black';
        this.context.fillStyle = color;
        this.context.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
    }
}