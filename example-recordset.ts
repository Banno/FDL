import Recordset from './recordset.js';
import FieldType from './field-type';

export default class ExampleRecordset extends Recordset {
    constructor(fields:Record<string, FieldType>, rowCount:number) {
        const data:Record<string, number>[] = [];
        for (let i = 0; i < rowCount; i++) {
            const row:Record<string, number> = {};
            Object.keys(fields).forEach(fieldName => {
                row[fieldName] = fields[fieldName].exampleValue()(i) as number;
            });
            data.push(row);
        }
        super(fields, () => data);
    }
}
