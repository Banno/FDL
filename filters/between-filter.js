export default function betweenFilter(key, start, end) {
    return record => {
        if (!record.hasField(key)) return true;
        const value = record.getField(key);

        return start <= value && value <= end;
    };
}
