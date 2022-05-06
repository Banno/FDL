export default function containsAnyFilter(key, testValues) {
    return record => {
        if (!record.hasField(key)) return true;
        if (testValues.length === 0) return true;
        return testValues.some(value => value.toLowerCase() === record.getField(key).toLowerCase());
    };
}
