export default function containsFilter(key, substring) {
    return record => {
        if (!substring) return true;
        const value = record.print(key);
        if (value === undefined || value === null) return false;

        return value.toString().toLowerCase().includes(substring.toLowerCase());
    };
}
