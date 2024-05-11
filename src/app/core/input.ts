import { keyMap } from '../data/keymap'

export class Input {
    private keysPressed: boolean[];
    private resolveKeyPress: ((key: number) => void) | null = null;

    constructor() {
        this.keysPressed = new Array(16).fill(false);

        this.registerKeyEvents();
    }
   
    private registerKeyEvents(): void {
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    public isKeyPressed(keyCode: number): boolean {
        return this.keysPressed[keyCode];
    }

    public waitForKeyPress(): Promise<number> {
        return new Promise(resolve => {
            this.resolveKeyPress = resolve;
        });
    }

    private onKeyDown(event: KeyboardEvent): void {
        if (event.code in keyMap) {
            const key = keyMap[event.code];
            this.keysPressed[key] = true;

            // Resolve waiting for key press if there's a promise waiting to be resolved
            if (this.resolveKeyPress) {
                this.resolveKeyPress(key);
                this.resolveKeyPress = null; // Reset after resolving
            }
        }
    }

    private onKeyUp(event: KeyboardEvent): void {
        if (event.code in keyMap) {
            this.keysPressed[keyMap[event.code]] = false;
        }
    }
}
