# Domain First Errors

<p>
    <img src="https://img.shields.io/npm/v/%40domain-first%2Ferrors" alt="version">
    <img src="https://img.shields.io/badge/TypeScript-ready-3178C6?logo=typescript&logoColor=white?style=for-the-badge" alt="TypeScript ready">
    <img src="https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release" alt="semver">
    <img src="https://img.shields.io/npm/l/%40domain-first%2Ferrors" alt="license">
</p>

Typed errors in your code. Recognizable errors over the wire.

## What is it?

In most TypeScript codebases errors are `new Error("something went wrong")`. The catch block gets `unknown`, the useful data is glued into a message string, and once the error crosses an HTTP response or a queue, nobody can tell which error it was.

Domain First Errors gives every error **a namespaced code and typed details**. One line defines an error class: it extends `Error`, narrows with `.is()` to its typed details, and serializes to a plain object whose code is recognized on the other side with `.matchesCode()`. No custom error class boilerplate, zero runtime dependencies.

```
npm i @domain-first/errors
```

## API

The full technical specification lives in [API.md](./API.md).

## Guide

### How to declare

Create a namespace and define errors in it. The type argument describes the details.

```ts
import { errorNamespace } from "@domain-first/errors";

const OrderErrors = errorNamespace("ORDER");

const OutOfStock = OrderErrors.define<{ productId: string }>("OUT_OF_STOCK");

OutOfStock.code; // "ORDER.OUT_OF_STOCK"
```

### How to throw

Errors are regular classes extending `Error`. Pass details and, optionally, a native `cause`.

```ts
throw new OutOfStock({ productId: "coffee-beans" });

throw new OutOfStock({ productId: "coffee-beans" }, { cause: originalError });
```

### How to catch

`.is()` narrows `unknown` to the error class with fully typed details.

```ts
try {
    reserve(order);
} catch (error: unknown) {
    if (OutOfStock.is(error)) {
        error.details.productId; // string
        error.code; // "ORDER.OUT_OF_STOCK"
    } else {
        throw error;
    }
}
```

### How to add behavior

Extend the defined class. `.is()` narrows to the subclass.

```ts
class OutOfStock extends OrderErrors.define<{ productId: string }>("OUT_OF_STOCK") {
    get userMessage() {
        return `${this.details.productId} is sold out`;
    }
}

if (OutOfStock.is(error)) {
    error.userMessage;
}
```

### How to organize codes

Nest namespaces. Each level adds a dot-separated segment.

```ts
const PaymentErrors = OrderErrors.subnamespace("PAYMENT");
const Declined = PaymentErrors.define("DECLINED");

Declined.code; // "ORDER.PAYMENT.DECLINED"
```

### How to attach metadata

Static metadata is shared by every instance of the class: HTTP status, retryability, severity.

```ts
const PaymentDeclined = PaymentErrors.defineWithMetadata("DECLINED", {
    status: 402,
    retryable: false,
});

new PaymentDeclined({}).metadata.status; // 402
```

### How to send across boundaries

JSON loses class identity. The code survives: send `.serialized` and recognize it with `.matchesCode()`.

```ts
// server
res.status(error.metadata.status).json(error.serialized);
// { code, name, message, details, metadata }

// client
const received: unknown = await response.json();

if (PaymentDeclined.matchesCode(received)) {
    showRetryForm(); // returns the class metadata on a match
}

OrderErrors.matchesCode(received); // true for any ORDER.* code
```

Nested details are flattened into dot-separated keys. Stack and cause are not serialized.

### How to customize name and message

By default the name is the code and the message is the JSON of the details.

```ts
const OutOfStock = OrderErrors.define<{ productId: string }>("OUT_OF_STOCK", {
    name: () => "OutOfStockError",
    message: ({ details }) => `${details.productId} is sold out`,
});
```

## License

MIT
