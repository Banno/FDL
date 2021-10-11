import Recordset from './recordset.js';

export default class ExampleRecordset extends Recordset {
    constructor(fields, rowCount) {
        const data = [];
        for (let i = 0; i < rowCount; i++) {
            const row = {};
            Object.keys(fields).forEach(field => {
                row[field] = fields[field].exampleValue()(i);
            });
            data.push(row);
        }
        super(fields, () => data);
    }
}
