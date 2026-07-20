import { expect, test } from '@rstest/core';
import { defineErrorClass } from './error';

test('w', () => {
    type DetailsPayload = { userEmail: string };
    const UserRegistrationError = defineErrorClass<DetailsPayload>({
        code: 'USER_REGISTRATION_ERROR'
    });

    const ErrorWithCustomNameAndMessage = defineErrorClass<{ email: string }>(
        {
            code: 'DUMMY_ERROR_01'
        },
        {
            message: (details) => `${details.email} is in error state`,
            name: (metadata) => JSON.stringify(metadata)
        }
    );
    const err2 = new ErrorWithCustomNameAndMessage({ email: 'test@mail.mail' });
    console.log(err2);

    const err = new UserRegistrationError({ userEmail: 'hello@test.test' });

    console.log(UserRegistrationError.matches(err));
    console.log(UserRegistrationError.is(err));
    console.log(err instanceof UserRegistrationError);

    console.log(err);
    console.log(err.formattedDetails);

    console.log(err.metadata);

    expect(true).toBe(true);
});
