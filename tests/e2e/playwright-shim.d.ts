declare module '@playwright/test' {
  export interface Locator {
    click(): Promise<void>;
    locator(selector: string): Locator;
    getByText(text: string, options?: { exact?: boolean }): Locator;
    evaluateAll<T>(callback: (nodes: Element[]) => T): Promise<T>;
  }

  export interface Page {
    goto(url: string): Promise<void>;
    getByTestId(testId: string): Locator;
    getByText(text: string, options?: { exact?: boolean }): Locator;
    setViewportSize(size: { width: number; height: number }): Promise<void>;
    screenshot(options: { path: string; fullPage?: boolean }): Promise<Buffer>;
  }

  export interface TestArgs {
    page: Page;
  }

  export interface TestFunction {
    (name: string, callback: (args: TestArgs) => Promise<void> | void): void;
  }

  export const test: TestFunction;
  export function expect(actual: unknown): {
    toBeVisible(): Promise<void>;
    toHaveLength(length: number): void;
  };
  export const devices: Record<string, unknown>;
  export function defineConfig(config: unknown): unknown;
}
