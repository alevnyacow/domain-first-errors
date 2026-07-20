import { expect, test } from '@rstest/core';
import { detailsFromUnknownData } from './details-from-unknown-data';

test('undefined', () => {
    expect(detailsFromUnknownData(undefined)).toEqual({});
});

test('primitives', () => {
    expect(detailsFromUnknownData(1)).toEqual({ additionalInfo: 1 });
    expect(detailsFromUnknownData('1')).toEqual({ additionalInfo: '1' });
    expect(detailsFromUnknownData(true)).toEqual({ additionalInfo: true });
});
