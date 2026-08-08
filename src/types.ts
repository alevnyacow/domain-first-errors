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

export type SerializedError<Metadata extends PlainPrimitivesObject> = {
    code: string;
    details: PlainPrimitivesObject;
    name: string;
    message: string;
    metadata: Metadata;
};
