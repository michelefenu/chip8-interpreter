import { frameRate } from "../config/config";
import { SoundManager } from "./sound-manager";

export class Timers {
    private delayTimer = 0;
    private soundTimer = 0;
    private timerInterval: NodeJS.Timeout | undefined;

    constructor(private soundManager: SoundManager) {
        this.startTimers();
    }

    setDelayTimer(value: number): void {
        this.delayTimer = value;
    }

    getDelayTimer(): number {
        return this.delayTimer;
    }

    setSoundTimer(value: number): void {
        this.soundTimer = value;
    }

    resetTimers() {
        this.dispose();
        this.startTimers();
    }

    private startTimers(): void {
        this.timerInterval = setInterval(() => {
            if (this.delayTimer > 0) {
                this.delayTimer--;
            }

            if (this.soundTimer > 0) {
                this.soundTimer--;
                this.playSound();
            } else {
                this.stopSound();
            }
        }, 1000 / frameRate); // Update every 1/60th of a second TODO da capire con requestAnimationFrame
    }

    private playSound(): void {
        this.soundManager.playSound();
    }

    private stopSound(): void {
        this.soundManager.stopSound();
    }

    private dispose(): void {
        if (this.timerInterval !== undefined) {
            clearInterval(this.timerInterval);
        }
        this.soundManager.stopSound();
    }
}
