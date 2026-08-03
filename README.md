<p align="center">
    <picture>
        <img src='https://raw.githubusercontent.com/alevnyacow/domain-first-errors/refs/heads/main/logo.svg?sanitize=true'>
    </picture>
</p>

<p align="center">
    Strongly typed namespace-based domain errors that remain identifiable across application boundaries.
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/%40domain-first%2Ferrors?style=for-the-badge" alt="version">
  <img src="https://img.shields.io/bundlephobia/minzip/%40domain-first%2Ferrors?style=for-the-badge" alt="size">
  <img src="https://img.shields.io/npm/l/%40domain-first%2Ferrors?style=for-the-badge" alt="license">
</p>

# Installation

```
npm i @domain-first/errors
```

# Motivation

In Domain-Driven Design, domain errors are part of the domain model, yet they are often treated as generic exceptions or untyped payloads. Serialized native `Error` objects lose their runtime identity after crossing process boundaries, making `instanceof` unusable after serialization. Domain-First Errors let you define strongly typed domain errors that remain identifiable both as runtime instances and as serialized objects.

# Quick Start

```ts
import { errorNamespace } from "@domain-first/errors";

const UserErrors = errorNamespace("USER");

const AuthErrors = UserErrors.subnamespace("AUTH");

// Define an error class
const IncorrectPasswordError = AuthErrors.error<{
    login: string;
}>("INCORRECT_PASSWORD");

// Throw and identify it
try {
    throw new IncorrectPasswordError(
        {
            login: "test-login",
        },
        // optional cause can be passed in any error
        { cause: 42 },
    );
} catch (e: unknown) {
    /**
       USER.AUTH.INCORRECT_PASSWORD: {"login":"test-login"}
       ...stack
       details: { login: 'test-login' },
       code: 'USER.AUTH.INCORRECT_PASSWORD',
       metadata: {},
       [cause]: 42
     }

     */
    console.error(e);

    if (IncorrectPasswordError.is(e)) {
        console.log(`Incorrect password (${e.details.login})`);
    }
}

// Recognize a serialized error
const error = new IncorrectPasswordError({
    login: "test-login",
});

// { code: "USER.AUTH.INCORRECT_PASSWORD", metadata: { } }
const serializedError = error.serialized;

if (IncorrectPasswordError.matches(serializedError)) {
    console.log("Incorrect password");
}
```

# About

A utility for defining strongly typed namespace-based domain errors that remain identifiable across application boundaries. Every defined error extends the native `Error` class and supports the native `Error.cause` property.

This makes errors easy to serialize, transport between layers, and recognize. Every error class provides two ways to identify that error type:

- `is` for runtime instances (`instanceof` works as well);
- `matches` for serialized or transported errors.
