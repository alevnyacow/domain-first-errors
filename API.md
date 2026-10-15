# API Reference

Technical specification of the public API of `@domain-first/errors`.

- [Package](#package)
- [Exports overview](#exports-overview)
- [Functions](#functions)
    - [`errorNamespace`](#errornamespace)
- [Namespace](#namespace)
    - [`namespace.define()`](#namespacedefine)
    - [`namespace.defineWithMetadata()`](#namespacedefinewithmetadata)
    - [`namespace.subnamespace()`](#namespacesubnamespace)
    - [`namespace.matchesCode()`](#namespacematchescode)
- [Error class](#error-class)
    - [Constructor](#constructor)
    - [`Class.code`](#classcode)
    - [`Class.is()`](#classis)
    - [`Class.matchesCode()`](#classmatchescode)
    - [`instance.code`](#instancecode)
    - [`instance.details`](#instancedetails)
    - [`instance.metadata`](#instancemetadata)
    - [`instance.name` and `instance.message`](#instancename-and-instancemessage)
    - [`instance.formattedDetails`](#instanceformatteddetails)
    - [`instance.serialized`](#instanceserialized)
- [Types](#types)
    - [`PlainPrimitivesObject`](#plainprimitivesobject)
    - [`ErrorProps<M, D>`](#errorpropsm-d)
    - [`SerializedError<M>`](#serializederrorm)
- [Runtime semantics](#runtime-semantics)
    - [Details flattening](#details-flattening)

Notation used below:

- `D` is the details type of an error class. It extends `Record<string, unknown>` and defaults to `Record<string, unknown>`.
- `M` is the metadata type of an error class. It extends [`PlainPrimitivesObject`](#plainprimitivesobject). Classes created with [`define()`](#namespacedefine) have `M = {}`.
- **Full code** is `"<namespace>.<code>"`, for example `"ORDER.PAYMENT.DECLINED"`.

## Package

| Property     | Value                                              |
| ------------ | -------------------------------------------------- |
| Name         | `@domain-first/errors`                             |
| Entry point  | `.` (single entry, no subpath exports)             |
| Formats      | ESM (`dist/index.js`), CommonJS (`dist/index.cjs`) |
| Types        | `dist/index.d.ts`                                  |
| Dependencies | None                                               |
| Syntax       | ES syntax supported by Node.js 22                  |

## Exports overview

| Export                  | Kind     | Section                                       |
| ----------------------- | -------- | --------------------------------------------- |
| `errorNamespace`        | function | [`errorNamespace`](#errornamespace)           |
| `PlainPrimitivesObject` | type     | [`PlainPrimitivesObject`](#plainprimitivesobject) |
| `ErrorProps`            | type     | [`ErrorProps<M, D>`](#errorpropsm-d)          |
| `SerializedError`       | type     | [`SerializedError<M>`](#serializederrorm)     |

Nothing else is part of the public API.

## Functions

### `errorNamespace`

Creates a namespace: a prefix for error codes and a factory for error classes.

**Signature**

```ts
function errorNamespace(namespace: string): Namespace;
```

**Parameters**

| Name        | Type     | Description                                                   |
| ----------- | -------- | ------------------------------------------------------------- |
| `namespace` | `string` | Code prefix. Can contain dots: `"ORDER.PAYMENT"` is the same as `errorNamespace("ORDER").subnamespace("PAYMENT")`. |

**Returns**

`Namespace`. See [Namespace](#namespace).

**Behavior**

- Namespaces are plain objects with no shared registry. Calling `errorNamespace` twice with the same string gives two equivalent namespaces.
- The string is not validated or normalized.

**Throws**

Nothing.

**Example**

```ts
const OrderErrors = errorNamespace("ORDER");
```

## Namespace

The object returned by [`errorNamespace`](#errornamespace). It is not exported as a named type. Its shape:

```ts
type Namespace = {
    define<D extends Record<string, unknown> = Record<string, unknown>>(
        code: string,
        errorProps?: Partial<ErrorProps<{}, D>>
    ): ErrorClass<D, {}>;
    defineWithMetadata<
        D extends Record<string, unknown> = Record<string, unknown>,
        M extends PlainPrimitivesObject = PlainPrimitivesObject
    >(
        code: string,
        metadata: M,
        errorProps?: Partial<ErrorProps<M, D>>
    ): ErrorClass<D, M>;
    subnamespace(subnamespace: string): Namespace;
    matchesCode(target: unknown): boolean;
};
```

### `namespace.define()`

Creates an error class without metadata.

**Signature**

```ts
define<D extends Record<string, unknown> = Record<string, unknown>>(
    code: string,
    errorProps?: Partial<ErrorProps<{}, D>>
): ErrorClass<D, {}>;
```

**Parameters**

| Name         | Type                              | Description                                                         |
| ------------ | --------------------------------- | ------------------------------------------------------------------- |
| `code`       | `string`                          | Code inside the namespace. The full code is `"<namespace>.<code>"`. |
| `errorProps` | `Partial<ErrorProps<{}, D>>`      | Optional `name` and `message` builders. See [`ErrorProps`](#errorpropsm-d). |

**Returns**

`ErrorClass<D, {}>`: a class extending `Error`. See [Error class](#error-class).

**Behavior**

Same as `defineWithMetadata(code, {}, errorProps)`.

**Example**

```ts
const OutOfStock = OrderErrors.define<{ productId: string }>("OUT_OF_STOCK");
```

### `namespace.defineWithMetadata()`

Creates an error class with static metadata shared by all its instances.

**Signature**

```ts
defineWithMetadata<
    D extends Record<string, unknown> = Record<string, unknown>,
    M extends PlainPrimitivesObject = PlainPrimitivesObject
>(
    code: string,
    metadata: M,
    errorProps?: Partial<ErrorProps<M, D>>
): ErrorClass<D, M>;
```

**Parameters**

| Name         | Type                         | Description                                                         |
| ------------ | ---------------------------- | ------------------------------------------------------------------- |
| `code`       | `string`                     | Code inside the namespace.                                          |
| `metadata`   | `M`                          | Flat object of primitives: HTTP status, retryability, severity, …   |
| `errorProps` | `Partial<ErrorProps<M, D>>`  | Optional `name` and `message` builders.                             |

**Returns**

`ErrorClass<D, M>`. See [Error class](#error-class).

**Behavior**

- Every call creates a new, independent class with its own hidden identity marker. Two calls with the same code produce classes that share a code but not identity: see [`Class.is()`](#classis).
- `metadata` is stored by reference. It is not copied or frozen.
- Explicit type arguments are all-or-nothing in TypeScript: when you pass `D`, pass `M` too, or `M` falls back to `PlainPrimitivesObject`.

**Example**

```ts
const PaymentDeclined = OrderErrors.defineWithMetadata<
    { orderId: string },
    { status: number; retryable: boolean }
>("PAYMENT_DECLINED", { status: 402, retryable: false });
```

### `namespace.subnamespace()`

Creates a nested namespace.

**Signature**

```ts
subnamespace(subnamespace: string): Namespace;
```

**Returns**

`errorNamespace("<namespace>.<subnamespace>")`.

**Example**

```ts
const PaymentErrors = OrderErrors.subnamespace("PAYMENT");
PaymentErrors.define("DECLINED").code; // "ORDER.PAYMENT.DECLINED"
```

### `namespace.matchesCode()`

Checks whether a code belongs to the namespace or any of its subnamespaces.

**Signature**

```ts
matchesCode(target: unknown): boolean;
```

**Parameters**

| Name     | Type      | Description                                                     |
| -------- | --------- | --------------------------------------------------------------- |
| `target` | `unknown` | A code string, or any object with a string `code` property.     |

**Returns**

| Code read from `target`                        | Result  |
| ---------------------------------------------- | ------- |
| Equal to the namespace                         | `true`  |
| Starts with `"<namespace>."`                   | `true`  |
| Anything else (`"ORDERS.X"` for `ORDER`, …)   | `false` |
| No code (not a string, no string `code`)       | `false` |

**Behavior**

- Works with live errors, serialized errors and raw code strings alike.
- Does not narrow the type of `target`.

**Throws**

Nothing.

**Example**

```ts
OrderErrors.matchesCode("ORDER.PAYMENT.DECLINED"); // true
OrderErrors.matchesCode({ code: "ORDER" }); // true
OrderErrors.matchesCode("ORDERS.X"); // false
```

## Error class

`ErrorClass<D, M>` is the class returned by [`define()`](#namespacedefine) and [`defineWithMetadata()`](#namespacedefinewithmetadata). It is not exported as a named type. Its shape:

```ts
type ErrorClass<D, M> = {
    new (details: D & { [key: string]: unknown }, options?: ErrorOptions): ErrorInstance<D, M>;
    readonly code: string;
    is<T extends abstract new (...args: any[]) => any>(
        this: T,
        target: unknown
    ): target is InstanceType<T>;
    matchesCode(target: unknown): M | undefined;
};

type ErrorInstance<D, M> = Error & {
    readonly code: string;
    readonly details: D & { [key: string]: unknown };
    readonly metadata: M;
    readonly formattedDetails: PlainPrimitivesObject;
    readonly serialized: SerializedError<M>;
};
```

The class can be used directly or extended:

```ts
class OutOfStock extends OrderErrors.define<{ productId: string }>("OUT_OF_STOCK") {
    get retryable() {
        return false;
    }
}
```

### Constructor

**Signature**

```ts
new (details: D & { [key: string]: unknown }, options?: ErrorOptions)
```

**Parameters**

| Name      | Type                                | Description                                              |
| --------- | ----------------------------------- | -------------------------------------------------------- |
| `details` | `D & { [key: string]: unknown }`    | Typed payload. Extra keys are allowed.                   |
| `options` | `ErrorOptions`                      | Native error options. `options.cause` is set as `cause`. |

**Behavior**

1. Computes the message with `errorProps.message` or the default `JSON.stringify(formattedDetails)`. See [`instance.name` and `instance.message`](#instancename-and-instancemessage).
2. Calls `Error` with the message and `options`.
3. Defines own properties `details`, `code`, `name` and `metadata`.
4. Marks the instance with the class's hidden symbol (non-enumerable), used by [`Class.is()`](#classis).

**Throws**

| Error                  | When                                                                   |
| ---------------------- | ---------------------------------------------------------------------- |
| Whatever it throws     | A custom `errorProps.name` or `errorProps.message` throws.             |
| `RangeError`           | `details` contains a circular reference (flattening recurses forever). |

**Example**

```ts
throw new OutOfStock({ productId: "coffee-beans" }, { cause: originalError });
```

### `Class.code`

**Signature**

```ts
static readonly code: string;
```

The full code, for example `"ORDER.OUT_OF_STOCK"`. Equal to `instance.code` for every instance.

### `Class.is()`

Type guard for live instances.

**Signature**

```ts
static is<T extends abstract new (...args: any[]) => any>(
    this: T,
    target: unknown
): target is InstanceType<T>;
```

**Returns**

| `target`                                                      | Result  |
| ------------------------------------------------------------- | ------- |
| An instance of the class `is` was called on, or its subclass  | `true`  |
| An instance of a parent class, when called on a subclass      | `false` |
| An instance of another class, even with the same code         | `false` |
| A serialized or deserialized error (plain object)             | `false` |
| Anything else                                                 | `false` |

**Behavior**

- Narrows `target` to the class `is` was called on: `OutOfStock.is(e)` gives `OutOfStock`, a subclass gives the subclass with its own members.
- Checks the class's hidden symbol and `target instanceof this`.
- Can be passed as a callback: `errors.filter(OutOfStock.is)`. Called this way it loses `this`, so it checks only the hidden symbol and also accepts instances of parent classes created by the same `define()` call.
- Identity is per `define()` call and per copy of the package. Use [`matchesCode()`](#classmatchescode) to recognize errors across boundaries.

**Throws**

Nothing.

**Example**

```ts
if (OutOfStock.is(error)) {
    error.details.productId; // string
}
```

### `Class.matchesCode()`

Recognizes an error of this class by its code.

**Signature**

```ts
static matchesCode(target: unknown): M | undefined;
```

**Parameters**

| Name     | Type      | Description                                                 |
| -------- | --------- | ----------------------------------------------------------- |
| `target` | `unknown` | A code string, or any object with a string `code` property. |

**Returns**

| Code read from `target`    | Result                                                |
| -------------------------- | ----------------------------------------------------- |
| Equal to `Class.code`      | The class's `metadata` (the same object; `{}` for `define()`) |
| Anything else, or no code  | `undefined`                                           |

**Behavior**

- The result is truthy on a match even for `{}`, so it works in `if` directly.
- Does not validate `details` and does not narrow the type of `target`.

**Throws**

Nothing.

**Example**

```ts
const metadata = PaymentDeclined.matchesCode(response.error);
if (metadata) {
    metadata.status; // number
}
```

### `instance.code`

**Type**: `readonly code: string`

The full code. Own enumerable property.

### `instance.details`

**Type**: `readonly details: D & { [key: string]: unknown }`

- The exact object passed to the constructor, stored by reference. It is not copied or frozen.
- `readonly` only at the type level: the property is writable at runtime, and mutating the object changes `formattedDetails` and `serialized` but not `message`, which is computed once.

### `instance.metadata`

**Type**: `readonly metadata: M`

The `metadata` passed to `defineWithMetadata()`, shared by reference by all instances of the class. `{}` for classes created with `define()`.

### `instance.name` and `instance.message`

Both are computed once, in the constructor.

| Property  | Default                              | Custom                                                  |
| --------- | ------------------------------------ | ------------------------------------------------------- |
| `name`    | The full code                        | `errorProps.name({ code, metadata })`                   |
| `message` | `JSON.stringify(formattedDetails)`   | `errorProps.message({ code, details, formattedDetails, metadata })` |

`stack` starts with `"<name>: <message>"`, as for any `Error`.

### `instance.formattedDetails`

**Signature**

```ts
get formattedDetails(): PlainPrimitivesObject;
```

`details` flattened into a flat object of primitives. Recomputed on every access. See [Details flattening](#details-flattening).

**Example**

```ts
new OutOfStock({ productId: "x", stock: { left: 0 } }).formattedDetails;
// { productId: "x", "stock.left": 0 }
```

### `instance.serialized`

**Signature**

```ts
get serialized(): SerializedError<M>;
```

**Returns**

A new plain object on every access:

| Field      | Value                                                     |
| ---------- | --------------------------------------------------------- |
| `code`     | The full code                                             |
| `name`     | `instance.name`                                           |
| `message`  | `instance.message`                                        |
| `details`  | `instance.formattedDetails`                               |
| `metadata` | `instance.metadata` (same object)                         |

`stack` and `cause` are not included. The result is JSON-safe as long as `details` flattens to finite values.

**Example**

```ts
res.status(500).json(error.serialized);
```

## Types

### `PlainPrimitivesObject`

```ts
type PlainPrimitivesObject = Record<string, string | number | boolean>;
```

Used for metadata, `formattedDetails` and `serialized.details`.

### `ErrorProps<M, D>`

The `errorProps` argument of `define()` and `defineWithMetadata()` is `Partial<ErrorProps<M, D>>`.

```ts
type ErrorProps<M extends PlainPrimitivesObject, D extends Record<string, any>> = {
    name: (payload: { code: string; metadata: M }) => string;
    message: (payload: {
        code: string;
        details: D;
        formattedDetails: PlainPrimitivesObject;
        metadata: M;
    }) => string;
};
```

| Payload field      | Value                                          |
| ------------------ | ---------------------------------------------- |
| `code`             | The full code                                  |
| `details`          | The constructor's `details`                    |
| `formattedDetails` | `details` flattened                            |
| `metadata`         | The class metadata                             |

### `SerializedError<M>`

```ts
type SerializedError<M extends PlainPrimitivesObject> = {
    code: string;
    details: PlainPrimitivesObject;
    name: string;
    message: string;
    metadata: M;
};
```

The shape of [`instance.serialized`](#instanceserialized).

## Runtime semantics

| Topic               | Behavior                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Native errors       | Instances extend `Error`: `instanceof Error`, `instanceof Class`, `stack` and `cause` work as usual.                           |
| Class identity      | Each `define()` / `defineWithMetadata()` call creates a distinct class with its own hidden marker symbol.                      |
| Code identity       | Codes are plain strings with no registry. Two classes may share a code; `matchesCode()` cannot tell them apart.                |
| Across boundaries   | Only the code survives serialization. Use `Class.matchesCode()` and `namespace.matchesCode()`, not `is()` or `instanceof`.      |
| Enumeration / JSON  | Own enumerable keys: `details`, `code`, `metadata`, `name`. `JSON.stringify(error)` includes raw `details` and omits `message` and `stack`; use `serialized` instead. |
| Immutability        | `readonly` is type-level only. Nothing is frozen.                                                                               |

### Details flattening

`formattedDetails`, `serialized.details` and the default `message` flatten `details` with these rules:

| Value                                         | Result                                                              |
| --------------------------------------------- | ------------------------------------------------------------------- |
| `string`, `number`, `boolean`                 | Kept under its key                                                  |
| Plain object, class instance                  | Own enumerable properties, keys joined with `.`: `{ a: { b: 1 } }` → `{ "a.b": 1 }` |
| Array                                         | Indexes as keys: `{ ids: [1, 2] }` → `{ "ids.0": 1, "ids.1": 2 }`   |
| `Error` with an object `details` (e.g. another domain error) | Its `details`, flattened under the key           |
| Other `Error`                                 | `errorMessage`, `errorName` and, if present, `errorStack` under the key |
| `null`, `undefined`, `bigint`, `symbol`, function | Dropped                                                         |
| `Date`, `Map`, `Set`                          | Dropped (no own enumerable properties)                              |

If `details` itself is a primitive (possible from plain JavaScript), it becomes `{ additionalInfo: value }`. If it is `undefined` or `null`, the result is `{}`.

**Example**

```ts
new OutOfStock({
    productId: "x",
    tags: ["a"],
    at: new Date(),
    cause: new Error("db down"),
}).formattedDetails;
// {
//     productId: "x",
//     "tags.0": "a",
//     "cause.errorMessage": "db down",
//     "cause.errorName": "Error",
//     "cause.errorStack": "Error: db down\n    at …",
// }
```
