import type { PlainPrimitivesObject } from './types';

export const isErrorWithDetails = (
    target: unknown
): target is Error & { details: PlainPrimitivesObject } => {
    if (!(target instanceof Error)) {
        return false;
    }

    if (
        !('details' in target) ||
        !target.details ||
        typeof target.details !== 'object'
    ) {
        return false;
    }

    return true;
};
