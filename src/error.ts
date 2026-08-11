import { detailsFromUnknownData } from './details-from-unknown-data';
import type {
    ErrorProps,
    PlainPrimitivesObject,
    SerializedError
} from './types';

const defineErrorClass = <
    Details extends Record<string, unknown> = Record<string, unknown>,
    Metadata extends PlainPrimitivesObject = PlainPrimitivesObject
>(
    code: string,
    metadata: Metadata,
    errorProps?: Partial<ErrorProps<Metadata, Details>>
) => {
    const defaultErrorMessage: ErrorProps<Metadata, Details>['message'] = ({
        formattedDetails
    }) => JSON.stringify(formattedDetails);

    const defaultErrorName: ErrorProps<Metadata, Details>['name'] = ({
        code
    }) => code;

    const symbol = Symbol();

    class DomainFirstErrorBase extends Error {
        static matchesCode = (target: string | { code: string }) => {
            const codeFromTarget =
                typeof target === 'string' ? target : target.code;
            if (codeFromTarget === code) {
                return metadata;
            }
        };

        static is = (target: unknown): target is DomainFirstErrorBase => {
            return typeof target === 'object' && !!target && symbol in target;
        };

        public readonly code: string;
        public readonly metadata: Metadata;

        constructor(
            public readonly details: Details,
            options?: ErrorOptions
        ) {
            super(
                (errorProps?.message ?? defaultErrorMessage)({
                    code,
                    details,
                    formattedDetails: detailsFromUnknownData(details),
                    metadata
                }),
                options
            );

            this.code = code;
            this.name = (errorProps?.name ?? defaultErrorName)({
                code,
                metadata
            });
            this.metadata = metadata;

            Object.defineProperty(this, symbol, { value: true });
        }

        get formattedDetails(): PlainPrimitivesObject {
            return detailsFromUnknownData(this.details);
        }

        get serialized(): SerializedError<Metadata> {
            return {
                metadata,
                message: this.message,
                name: this.name,
                details: detailsFromUnknownData(this.details),
                code
            };
        }
    }

    return DomainFirstErrorBase;
};

export const errorNamespace = (namespace: string) => {
    const subnamespace = (subnamespace: string) => {
        return errorNamespace(`${namespace}.${subnamespace}`);
    };
    const define = <
        Details extends Record<string, unknown> = Record<string, unknown>
    >(
        code: string,
        errorProps?: Partial<ErrorProps<{}, Details>>
    ) => defineErrorClass<Details, {}>(`${namespace}.${code}`, {}, errorProps);

    const defineWithMetadata = <
        Details extends Record<string, unknown> = Record<string, unknown>,
        Metadata extends PlainPrimitivesObject = PlainPrimitivesObject
    >(
        code: string,
        metadata: Metadata,
        errorProps?: Partial<ErrorProps<Metadata, Details>>
    ) =>
        defineErrorClass<Details, Metadata>(
            `${namespace}.${code}`,
            metadata,
            errorProps
        );

    const matchesCode = (target: string | { code: string }) => {
        const code = typeof target === 'string' ? target : target.code;
        return code === namespace || code.startsWith(`${namespace}.`);
    };

    return {
        subnamespace,
        define,
        defineWithMetadata,
        matchesCode
    };
};
