import { detailsFromUnknownData } from './details-from-unknown-data';
import type { ErrorProps, PlainPrimitivesObject } from './types';

export const defineErrorClass = <
    Details = unknown,
    AdditionalMetadata extends PlainPrimitivesObject = {}
>(
    metadata: AdditionalMetadata & { code: string },
    errorProps: ErrorProps<AdditionalMetadata & { code: string }, Details> = {
        message: (details) =>
            typeof details === 'object'
                ? JSON.stringify(details)
                : String(details),
        name: (metadata) => metadata.code
    }
) => {
    const symbol = Symbol();
    class DomainFirstErrorBase extends Error {
        static matches = (target: unknown) => {
            return (
                typeof target === 'object' &&
                target &&
                'metadata' in target &&
                JSON.stringify(target.metadata) === JSON.stringify(metadata)
            );
        };

        static is = (target: unknown): target is DomainFirstErrorBase => {
            return typeof target === 'object' && !!target && symbol in target;
        };

        public readonly metadata: AdditionalMetadata & { code: string };

        constructor(
            public readonly details: Details,
            options?: ErrorOptions
        ) {
            super(errorProps.message(details, metadata), options);

            this.name = errorProps.name(metadata);
            this.metadata = metadata;

            Object.defineProperty(this, symbol, { value: true });
        }

        get formattedDetails(): PlainPrimitivesObject {
            return detailsFromUnknownData(this.details);
        }
    }

    return DomainFirstErrorBase;
};
