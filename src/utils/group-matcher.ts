/**
 * Optimized group matcher with compiled regex cache
 */

import { Config } from '../types';

export class GroupMatcher {
    private groupCache = new Map<string, string>();
    private compiledPatterns: { name: string; pattern: RegExp }[] = [];
    private defaultGroup: string;

    constructor(groups: Config['groups']) {
        // Pre-compile all patterns and store them
        this.compiledPatterns = groups
            .filter(g => g.match)
            .map(g => ({ name: g.name, pattern: g.match! }))
            .sort((a, b) => {
                // Put more specific patterns first (those with more literals)
                const aLiterals = a.pattern.source.replace(/[.*+?^${}()|[\]\\]/g, '').length;
                const bLiterals = b.pattern.source.replace(/[.*+?^${}()|[\]\\]/g, '').length;
                return bLiterals - aLiterals;
            });

        const defaultGroupObj = groups.find(g => g.isDefault);
        this.defaultGroup = defaultGroupObj ? defaultGroupObj.name : 'Misc';
    }

    /**
     * Get group for import source with caching
     */
    getGroup(source: string): string {
        // Check cache first
        const cached = this.groupCache.get(source);
        if (cached) {
            return cached;
        }

        // Test against compiled patterns
        for (const { name, pattern } of this.compiledPatterns) {
            if (pattern.test(source)) {
                this.groupCache.set(source, name);
                return name;
            }
        }

        // Use default group
        this.groupCache.set(source, this.defaultGroup);
        return this.defaultGroup;
    }

    /**
     * Clear cache (useful when configuration changes)
     */
    clearCache(): void {
        this.groupCache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; hitRate: number } {
        return {
            size: this.groupCache.size,
            hitRate: 0 // Would need to track hits/misses for accurate rate
        };
    }
}