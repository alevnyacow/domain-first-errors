export type PlainPrimitivesObject = Record<string, string | number | boolean>;

export type ErrorProps<
    Metadata extends PlainPrimitivesObject,
    Details extends Record<string, any>
> = {
    name: (payload: { code: string; metadata: Metadata }) => string;
    message: (payload: {
        code: string;
        details: Details;
        formattedDetails: PlainPrimitivesObject;
        metadata: Metadata;
    }) => string;
};

export type ErrorPropsWithoutMetadata<Details> = {
    message: (details: Details) => string;
};

export type TransportedError<Metadata = PlainPrimitivesObject> = {
    metadata: Metadata;
    code: string;
};

export type TransportedErrorWithNativeData<Metadata = PlainPrimitivesObject> =
    TransportedError<Metadata> & {
        name: string;
        message: string;
    };

export type FullTransportedError<
    Details extends Record<string, any>,
    Metadata extends PlainPrimitivesObject
> = TransportedErrorWithNativeData<Metadata> & { details: Details };
