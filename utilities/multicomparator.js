export default function multicomparator(comparators) {
    return function compare(a, b) {
        let result = 0;
        let i = 0;
        while (result === 0 && i < comparators.length) {
            result = comparators[i](a, b);
            i++;
        }
        return result;
    };
}
