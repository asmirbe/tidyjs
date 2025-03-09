export function sortImportNamesByLength(names: string[]): string[] {
    return [...names].sort((a, b) => {
        // Extract actual name without 'type' keyword for length comparison
        const aName = a.startsWith('type ') ? a.substring(5) : a;
        const bName = b.startsWith('type ') ? b.substring(5) : b;
        
        // Compare lengths (shortest first)
        return aName.length - bName.length;
    });
}