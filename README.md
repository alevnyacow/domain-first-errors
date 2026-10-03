<p align="center">
    <picture>
        <img src="https://raw.githubusercontent.com/alevnyacow/domain-first-errors/refs/heads/main/logo.svg?sanitize=true" alt="Domain-First Errors">
    </picture>
</p>

<p align="center">
    Typed errors in your code. Recognizable errors over the wire.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@domain-first/errors"><img src="https://img.shields.io/npm/v/%40domain-first%2Ferrors" alt="npm version"></a>
  <img src="https://img.shields.io/badge/TypeScript-ready-3178C6?logo=typescript&logoColor=white" alt="TypeScript ready">
  <img src="https://img.shields.io/npm/l/%40domain-first%2Ferrors" alt="license">
</p>

Define a domain error once, attach typed details, and recognize its code across API responses, queues, and services. No custom error class boilerplate. Zero runtime dependencies.

- **Typed details** — autocomplete when creating errors and after narrowing with `.is()`.
- **Namespaced codes** — organize errors by domain, like `USER.AUTH.INCORRECT_PASSWORD`.
- **Native errors** — `instanceof`, stack traces, and `cause` work as expected.
- **Ready for transport** — serialize to a plain object and recognize it with `.matchesCode()`.

## Try it

```sh
npm i @domain-first/errors
```

```ts
import { errorNamespace } from "@domain-first/errors";

const OrderErrors = errorNamespace("ORDER");
const OutOfStock = OrderErrors.define<{ productId: string }>("OUT_OF_STOCK");

try {
    throw new OutOfStock({ productId: "coffee-beans" });
} catch (error: unknown) {
    if (OutOfStock.is(error)) {
        console.log(error.details.productId); // string, fully typed
        console.log(error.code);              // "ORDER.OUT_OF_STOCK"
    } else {
        throw error;
    }
}
```

## Across application boundaries

JSON loses class identity. The error code survives:

```ts
const error = new OutOfStock({ productId: "coffee-beans" });
const received: unknown = JSON.parse(JSON.stringify(error.serialized));

if (OutOfStock.matchesCode(received)) {
    console.log("Offer a restock notification");
}

OrderErrors.matchesCode(received); // true for any ORDER.* error
```

`.is()` narrows runtime instances. `.matchesCode()` checks a code string or an object's `code`; it does not validate the payload or narrow its details. On an error class, it returns the class's metadata on a match, or `undefined` otherwise.

`.serialized` includes `code`, `name`, `message`, `details`, and `metadata`. Nested details become flat, dot-separated keys; stack and cause are omitted.

## A little more when you need it

| Need | Use |
| --- | --- |
| Nested namespaces | `OrderErrors.subnamespace("PAYMENT")` → `ORDER.PAYMENT.*` |
| Static metadata | `OrderErrors.defineWithMetadata("OUT_OF_STOCK", { retryable: false })` |
| Custom messages | `OrderErrors.define<{ productId: string }>("OUT_OF_STOCK", { message: ({ details }) => details.productId + " is sold out" })` |
| Original cause | `new OutOfStock({ productId: "coffee-beans" }, { cause: originalError })` |

ESM and CommonJS supported. [MIT licensed](./LICENSE).
