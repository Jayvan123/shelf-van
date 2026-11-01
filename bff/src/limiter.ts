export class ConcurrencyQueue {
  private maxConcurrency: number;
  private currentRunning: number = 0;
  private queue: Array<() => void> = [];

  constructor(maxConcurrency: number = 3) {
    this.maxConcurrency = maxConcurrency;
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.currentRunning >= this.maxConcurrency) {
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.currentRunning++;
    try {
      return await fn();
    } finally {
      this.currentRunning--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) next();
      }
    }
  }

  get stats() {
    return {
      running: this.currentRunning,
      queued: this.queue.length,
    };
  }
}

export const olQueue = new ConcurrencyQueue(3);

