export class WrakerHeaders extends Map<string, string> {
  constructor(entries?: Record<string, string> | null) {
    super();

    if (entries) {
      for (const [key, value] of Object.entries(entries)) {
        this.set(key, value);
      }
    }
  }
  public get(name: string): any {
    return super.get(name.toLowerCase());
  }

  public set(name: string, value: any): this {
    return super.set(name.toLowerCase(), value);
  }

  public has(name: string): boolean {
    return super.has(name.toLowerCase());
  }

  public delete(name: string): boolean {
    return super.delete(name.toLowerCase());
  }

  public serialize(): Record<string, string> {
    const result: Record<string, any> = {};
    for (const [key, value] of this) {
      result[key] = value;
    }
    return result;
  }
}
