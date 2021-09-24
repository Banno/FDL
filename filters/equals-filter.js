export default function equalsFilter(key, testValue) {
    return record => {
        if (testValue === '') return true;

        const value = record.getField(key);

        if (!value && !testValue) return true;
        if (typeof value === 'undefined') return true;
        if (typeof value === 'string' && typeof testValue === 'string') {
            return value.toLowerCase() === testValue.toLowerCase();
        }
        return value === testValue;
    };
}
