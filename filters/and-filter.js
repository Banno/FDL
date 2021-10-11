export default function andFilter(filters) {
    return record => filters.every(filter => filter(record));
}
