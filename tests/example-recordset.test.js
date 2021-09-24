import ExampleRecordset from '../example-recordset.js';
import FieldType from '../field-type.js';

const exampleRecordset = new ExampleRecordset(
    {
        name: new FieldType().with.exampleValue(() => 'Bobby'),
        info: new FieldType().with.exampleValue(() => 'administrator'),
    },
    5
);

const nameOnRow = index => exampleRecordset.allRecords[index].values.name;

describe('An Example Recordset', () => {
    it('exists', async () => {
        await exampleRecordset.requestUpdate();
        expect(exampleRecordset).toBeDefined();
        expect(exampleRecordset.allRecords.length).toEqual(5);
    });
    it('creates a recordset with example data', async () => {
        await exampleRecordset.requestUpdate();
        expect(nameOnRow(0)).toEqual('Bobby');
    });
});
