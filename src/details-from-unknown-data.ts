import { isErrorWithDetails } from './guards';
import type { PlainPrimitivesObject } from './types';

export const detailsFromUnknownData = (
    source: unknown
): PlainPrimitivesObject => {
    if (
        typeof source === 'number' ||
        typeof source === 'string' ||
        typeof source === 'boolean'
    ) {
        return { additionalInfo: source };
    }

    if (typeof source === 'object' && source) {
        if (isErrorWithDetails(source)) {
            return { ...source.details };
        }

        if (source instanceof Error) {
            if (source.stack) {
                return {
                    errorMessage: source.message,
                    errorName: source.name,
                    errorStack: source.stack
                };
            }
            return {
                errorMessage: source.message,
                errorName: source.name
            };
        }

        const detailsPart = {} as PlainPrimitivesObject;
        for (const sourceEntry of Object.entries(source)) {
            const [key, value] = sourceEntry;

            const currentDetailsPart = detailsFromUnknownData(value);
            const currentEntries = Object.entries(currentDetailsPart);
            for (const currentEntry of currentEntries) {
                const [currentKey, currentValue] = currentEntry;
                if (currentKey === 'additionalInfo') {
                    detailsPart[key] = currentValue;
                    continue;
                }
                detailsPart[`${key}.${currentKey}`] = currentValue;
            }
        }
        return detailsPart;
    }
    return {};
};
