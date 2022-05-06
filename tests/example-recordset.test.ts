import ExampleRecordset from '../example-recordset';
import Recordset from '../recordset';
import FieldType from '../field-type.js';

let exampleRecordset:Recordset;
const nameOnRow = (index:number) => exampleRecordset.allRecords[index].values.name as string;

describe('An Example Recordset', () => {
    beforeEach(() => {
        exampleRecordset = new ExampleRecordset(
            {
                name: new FieldType().with.exampleValue(() => 'Bobby'),
                info: new FieldType().with.exampleValue(() => 'administrator'),
            },
            5
        );
    });

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
