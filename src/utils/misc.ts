export function sortImportNamesByLength(names: string[]): string[] {
    return [...names].sort((a, b) => a.length - b.length);
}