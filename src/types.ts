export type PlainPrimitivesObject = Record<string, string | number | boolean>;

export type ErrorProps<Metadata, Details> = {
    name: (metadata: Metadata) => string;
    message: (details: Details, metadata: Metadata) => string;
};

export type ErrorPropsWithoutMetadata<Details> = {
    message: (details: Details) => string;
};

export type TransportedError<Metadata = PlainPrimitivesObject> = {
    metadata: Metadata;
};

export type TransportedErrorWithNativeData<Metadata = PlainPrimitivesObject> =
    TransportedError<Metadata> & {
        name: string;
        message: string;
    };

export type FullTransportedError<
    Details = PlainPrimitivesObject,
    Metadata = PlainPrimitivesObject
> = {
    metadata: Metadata;
    message: string;
    name: string;
    details: Details;
};
