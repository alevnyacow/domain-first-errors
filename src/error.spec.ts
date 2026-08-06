import { expect, test } from '@rstest/core';
import { errorNamespace } from './error';

const UserErrors = errorNamespace('user');
const UserAuth = UserErrors.subnamespace('auth');

test('error.serialized', () => {
    // Define an error class
    const IncorrectPasswordError = UserAuth.define<{
        login: string;
    }>('INCORRECT_PASSWORD');

    // Throw and identify it
    try {
        throw new IncorrectPasswordError({
            login: 'test-login'
        });
    } catch (e: unknown) {
        expect(e instanceof IncorrectPasswordError).toBe(true);
        expect(IncorrectPasswordError.is(e)).toBe(true);
    }

    // Recognize a serialized error
    const error = new IncorrectPasswordError({
        login: 'test-login'
    });

    // { metadata: { }, code: "INCORRECT_PASSWORD" }
    const serializedError = error.serialized;

    expect(serializedError).toEqual({
        metadata: {},
        code: 'user.auth.INCORRECT_PASSWORD'
    });

    expect(IncorrectPasswordError.matches(serializedError)).toBe(true);
});

test('README', () => {
    // Define an error class
    const IncorrectPasswordError = UserAuth.error<{
        login: string;
    }>('INCORRECT_PASSWORD');

    // Throw and identify it
    try {
        throw new IncorrectPasswordError(
            {
                login: 'test-login'
            },
            // optional cause can be passed in any error
            { cause: 42 }
        );
    } catch (e: unknown) {
        console.error(e);
        if (IncorrectPasswordError.is(e)) {
            console.log(`Incorrect password (${e.details.login})`);
        }
        expect(true).toBe(true);
    }
});
