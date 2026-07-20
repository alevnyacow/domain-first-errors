export type PlainPrimitivesObject = Record<string, string | number | boolean>;

export type ErrorProps<Metadata, Details> = {
    name: (metadata: Metadata) => string;
    message: (details: Details, metadata: Metadata) => string;
};

export type ErrorPropsWithoutMetadata<Details> = {
    message: (details: Details) => string;
};
