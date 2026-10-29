/** Shared, in-memory log of status lines actually received (or simulated). */
export const feedLog = { lines: [] as string[], activeCount: 0, push(l: string) { this.lines.push(l); if (this.lines.length > 40) this.lines.shift(); } };
