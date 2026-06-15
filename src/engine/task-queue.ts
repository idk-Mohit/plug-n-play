export type TaskPriority = "high" | "normal" | "low";

type QueuedTask<T> = {
  id: string;
  priority: TaskPriority;
  version: number;
  run: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

const PRIORITY_RANK: Record<TaskPriority, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

/**
 * Simple in-worker priority queue with versioned supersession.
 */
export class PriorityTaskQueue {
  private queue: QueuedTask<unknown>[] = [];
  private running = 0;
  private readonly maxConcurrent: number;
  private latestVersion = new Map<string, number>();

  constructor(maxConcurrent = 4) {
    this.maxConcurrent = maxConcurrent;
  }

  enqueue<T>(
    key: string,
    priority: TaskPriority,
    version: number,
    run: () => Promise<T>,
  ): Promise<T> {
    this.latestVersion.set(key, version);
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        id: key,
        priority,
        version,
        run: run as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.queue.sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
      );
      void this.drain();
    });
  }

  private async drain(): Promise<void> {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      const latest = this.latestVersion.get(task.id);
      if (latest !== undefined && task.version < latest) {
        task.reject(
          Object.assign(new Error("Task superseded"), { name: "AbortError" }),
        );
        continue;
      }

      this.running += 1;
      void task
        .run()
        .then((result) => {
          const stillLatest = this.latestVersion.get(task.id) === task.version;
          if (stillLatest) task.resolve(result);
          else
            task.reject(
              Object.assign(new Error("Task superseded"), {
                name: "AbortError",
              }),
            );
        })
        .catch(task.reject)
        .finally(() => {
          this.running -= 1;
          void this.drain();
        });
    }
  }
}

export const workerTaskQueue = new PriorityTaskQueue(4);
