/**
 * A class that extends the native Map to handle HTTP headers with case-insensitive keys.
 *
 * @example
 * const headers = new WrakerHeaders({
 *  "Content-Type": "application/json",
 * });
 *
 * headers.get("content-type"); // "application/json"
 * headers.has("content-type"); // true
 * headers.has("Content-Type"); // true
 */
export class WrakerHeaders extends Map<string, string> {
  /**
   * Creates an instance of WrakerHeaders.
   *
   * @param entries - An optional record of key-value pairs to initialize the headers.
   */
  constructor(entries?: Record<string, string> | null) {
    super();

    if (entries) {
      for (const [key, value] of Object.entries(entries)) {
        this.set(key, value);
      }
    }
  }

  /**
   * Retrieves the value associated with the given header name.
   *
   * @param name - The name of the header.
   * @returns The value of the header, or undefined if the header does not exist.
   */
  public get(name: string): any {
    return super.get(name.toLowerCase());
  }

  /**
   * Sets the value for a given header name.
   *
   * @param name - The name of the header.
   * @param value - The value to set for the header.
   * @returns The WrakerHeaders instance.
   */
  public set(name: string, value: any): this {
    return super.set(name.toLowerCase(), value);
  }

  /**
   * Checks if a header with the given name exists.
   *
   * @param name - The name of the header.
   * @returns True if the header exists, false otherwise.
   */
  public has(name: string): boolean {
    return super.has(name.toLowerCase());
  }

  /**
   * Deletes a header with the given name.
   *
   * @param name - The name of the header.
   * @returns True if the header was deleted, false otherwise.
   */
  public delete(name: string): boolean {
    return super.delete(name.toLowerCase());
  }

  /**
   * Serializes the headers into a plain object.
   *
   * @returns A record containing all headers as key-value pairs.
   */
  public serialize(): Record<string, string> {
    const result: Record<string, any> = {};
    for (const [key, value] of this) {
      result[key] = value;
    }
    return result;
  }
}
