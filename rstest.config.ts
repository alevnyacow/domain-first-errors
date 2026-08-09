import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
    extends: withRslibConfig(),
    reporters: 'verbose',
    coverage: {
        enabled: true,
        exclude: ['**/index.ts'],
        thresholds: {
            statements: 80,
            branches: 60,
            functions: 85,
            lines: 80
        }
    }
});
