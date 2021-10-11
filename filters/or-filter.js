export default function orFilter(filters) {
    return record => {
        if (filters.length === 0) {
            return true;
        }
        return filters.some(filter => filter(record));
    };
}
