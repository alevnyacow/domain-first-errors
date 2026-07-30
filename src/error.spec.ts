import { expect, test } from '@rstest/core';
import { defineError } from './error';

test('error.serialized', () => {
    // Define an error class
    const IncorrectPasswordError = defineError<{
        login: string;
    }>({
        code: 'INCORRECT_PASSWORD'
    });

    // Throw and identify it
    try {
        throw new IncorrectPasswordError({
            login: 'test-login'
        });
    } catch (e: unknown) {
        expect(IncorrectPasswordError.is(e)).toBe(true);
    }

    // Recognize a serialized error
    const error = new IncorrectPasswordError({
        login: 'test-login'
    });

    // { metadata: { code: "INCORRECT_PASSWORD" } }
    const serializedError = error.serialized;

    expect(serializedError).toEqual({
        metadata: { code: 'INCORRECT_PASSWORD' }
    });

    expect(IncorrectPasswordError.matches(serializedError)).toBe(true);
});
