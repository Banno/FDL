import deepEquality from '../utilities/deep-equality';

describe('Objects are deep compared', () => {
    const fiProductFeatures = {
        positivePay: '1',
        ach: '1',
        transfers: {
            international: '1',
            domestic: '0',
            payments: [5, 9, 11],
        },
    };

    const companyProductFeatures = {
        positivePay: '0',
        ach: '1',
        transfers: {
            international: '1',
            domestic: '0',
            payments: [5, 9, 11],
        },
    };

    it('knows objects are different', () => {
        expect(deepEquality(fiProductFeatures, companyProductFeatures)).toEqual(false);
    });

    it('knows objects are the same', () => {
        companyProductFeatures.positivePay = '1';
        expect(deepEquality(fiProductFeatures, companyProductFeatures)).toEqual(true);
    });

    it('knows nested properties deep in objects are different', () => {
        companyProductFeatures.transfers.international = '0';
        expect(deepEquality(fiProductFeatures, companyProductFeatures)).toEqual(false);
    });
    it('knows if array values change', () => {
        companyProductFeatures.transfers.payments.push(90);
        expect(deepEquality(fiProductFeatures, companyProductFeatures)).toEqual(false);
    });
});
