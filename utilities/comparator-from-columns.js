import multicomparator from './multicomparator.js';

const sortWithModifier = (column, modifier, fields) => (a, b) => {
    const aValue = a[column.field];
    const bValue = b[column.field];

    if (fields[column.field]?.compare) {
        return fields[column.field]?.compare(aValue, bValue) * modifier;
    }

    if (aValue < bValue) {
        return modifier * -1;
    }
    if (aValue > bValue) {
        return modifier;
    }
    return 0;
};

export default function comparatorFromColumns(sortColumns, fields) {
    const comparators = sortColumns.map(column => {
        let modifier = 1;
        if (column.sort === 'descending') modifier = -1;

        return sortWithModifier(column, modifier, fields);
    });

    return multicomparator(comparators);
}
