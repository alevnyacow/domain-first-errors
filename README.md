<p align="center">
    <picture>
        <img src='https://raw.githubusercontent.com/alevnyacow/domain-first-errors/refs/heads/main/logo.svg?sanitize=true'>
    </picture>
</p>

<p align="center">
    Strongly typed domain errors that remain identifiable across application boundaries.
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

In Domain-Driven Design, domain errors are part of the domain model, yet they are often treated as generic exceptions or untyped payloads. Serialized native `Error` objects lose their runtime identity after crossing process boundaries, making `instanceof` unreliable. Domain-First Errors let you define strongly typed domain errors that remain identifiable both as runtime instances and as serialized objects.

# Quick Start

```ts
import { defineErrorClass } from "@domain-first/errors";

// Define an error class
const IncorrectPasswordError = defineErrorClass<{
    login: string;
}>({
    code: "INCORRECT_PASSWORD",
});

// Throw and identify it
try {
    throw new IncorrectPasswordError({
        login: "test-login",
    });
} catch (e: unknown) {
    if (IncorrectPasswordError.is(e)) {
        console.log(`Incorrect password (${e.details.login})`);
    }
}

// Recognize a serialized error
const error = new IncorrectPasswordError({
    login: "test-login",
});

// { metadata: { code: "INCORRECT_PASSWORD" } }
const serializedError = error.serialized;

if (IncorrectPasswordError.matches(serializedError)) {
    console.log("Incorrect password");
}
```

# About

A utility for defining strongly typed domain errors that remain identifiable across application boundaries. Every defined error extends the native `Error` class, supports native Error causes and has:

- metadata describing the error type;
- details describing a specific instance.

This makes errors easy to serialize, transport between layers, and recognize. Every error class provides two ways to identify that error type:

- `is` for runtime instances;
- `matches` for serialized or transported errors.

# Examples

## Defining

### With details contract

```ts
import { defineErrorClass } from "@domain-first/errors";

type Details = { email: string };

const RegistrationOnExistingEmailError = defineErrorClass<Details>({
    code: "REGISTRATION_ON_EXISTING_EMAIL",
});

const err = new RegistrationOnExistingEmailError(
    {
        email: "hello@test.test",
    },
    // cause can be passed in any error
    { cause: 42 },
);

console.log(err);

/**
 * REGISTRATION_ON_EXISTING_EMAIL: {"email":"hello@test.test"}
  ...stack
  details: { email: 'hello@test.test' },
  metadata: { code: 'REGISTRATION_ON_EXISTING_EMAIL' },
  [cause]: 42
}
 */
```

### With additional metadata contract

```ts
import { defineErrorClass } from "@domain-first/errors";

type Details = { email: string };

type AdditionalMetadata = {
    retryable: boolean;
    critical: boolean;
};

const ErrorWithAdditionalMetadata = defineErrorClass<
    Details,
    AdditionalMetadata
>({ code: "DUMMY_ERROR_00", retryable: false, critical: true });
```

### With custom error name and message

```ts
import { defineErrorClass } from "@domain-first/errors";

type Details = { email: string };

const ErrorWithCustomNameAndMessage = defineErrorClass<Details>(
    {
        code: "DUMMY_ERROR_01",
    },
    {
        message: (details) => `${details.email} is in error state`,
        name: (metadata) => JSON.stringify(metadata),
    },
);

const errWithCustomName = new ErrorWithCustomNameAndMessage({
    email: "test@mail.mail",
});

console.log(errWithCustomName);

/**
 * {"code":"DUMMY_ERROR_01"}: test@mail.mail is in error state
   ...stack
   details: { email: 'test@mail.mail' },
   metadata: { code: 'DUMMY_ERROR_01' }
 }
 */
```

### With dynamic details and metadata

```ts
import { defineErrorClass } from "@domain-first/errors";

const ErrorWithUnknownDetails = defineErrorClass({
    code: "DUMMY_ERROR_02",
    stringField: "string field",
    booleanField: true,
});

const err = new ErrorWithUnknownDetails({
    email: "test@mail.mail",
    language: "EN",
    artist: "Slowdive",
    album: "Souvlaki Space Station",
});
```

## Identifying

### Checking instance with `is`

```ts
import { RegistrationOnExistingEmailError } from "./errors";

const register = () => {
    try {
        // registration logic
    } catch (e: unknown) {
        if (RegistrationOnExistingEmailError.is(e)) {
            // e is narrowed to RegistrationOnExistingEmailError
            console.log(`${e.details.email} is already taken`);
        }
    }
};
```

### Matching serialized errors with `matches`

```ts
import { RegistrationOnExistingEmailError } from "@/errors";

const register = async (email: string) => {
    const { error } = await registrationMutation(email);

    if (!error) {
        return;
    }

    if (RegistrationOnExistingEmailError.matches(error)) {
        console.log("Email is already taken");
    }
};
```

# Glossary

| Term     | Definition                                                                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Metadata | Object with data identifying the error **type**. This data will be the same for every instance of this error (`code`, for example). Metadata is passed when you define an error class. |
| Details  | Object with data identifying the error **instance** (`email`, for example). Details are passed in constructor of error class.                                                          |
