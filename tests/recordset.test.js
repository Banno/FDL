import { nextFrame } from '@open-wc/testing'; // eslint-disable-line import/no-extraneous-dependencies
import FieldType from '../field-type.js';
import Recordset from '../recordset.js';

function manyObjects(n) {
    return new Array(n).fill(null).map(() => ({}));
}

// eslint-disable-next-line no-unused-vars
function numberNames(recordset) {
    return [
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
        'nine',
        'ten',
        'eleven',
        'twelve',
    ].map((name, index) => ({ name, isANumber: true, value: index + 1, isEven: index % 2 === 1 }));
}

function numberNamesServerSide({ startIndex, pageSize }) {
    const data = numberNames();
    return {
        totalCount: data.length,
        data: data.slice(startIndex, startIndex + pageSize),
    };
}

function pluck(records, field) {
    return records.map(record => record.getField(field));
}

describe('Recordset', () => {
    describe('sync or async constructor', () => {
        it('loads synchronous data into records', async () => {
            const rs = new Recordset({}, () => [{ name: 'one' }, { name: 'two' }]);
            await rs.update();
            expect(pluck(rs.currentPage, 'name')).toEqual(['one', 'two']);
        });

        it('loads asynchronous data into records', async () => {
            const rs = new Recordset({}, () => Promise.resolve([{ name: 'one' }, { name: 'two' }]));
            await rs.update();
            expect(pluck(rs.currentPage, 'name')).toEqual(['one', 'two']);
        });
    });

    describe('gets computed values', () => {
        it('gets the record number on the current page', async () => {
            const rs = new Recordset({}, () => Promise.resolve([{ name: 'one' }, { name: 'two' }]));
            await rs.requestUpdate();
            rs.setInitialPageSize(25);
            expect(rs.firstRecordNumberOnPage).toEqual(1);
        });
        it('gets the last record number on the current page', async () => {
            const rs = new Recordset({}, () => Promise.resolve([{ name: 'one' }, { name: 'two' }]));
            await rs.requestUpdate();
            rs.setInitialPageSize(25);
            expect(rs.lastRecordNumberOnPage).toEqual(2);
        });
    });

    describe('calls the fetch function passed in the constructor and interprets the results', () => {
        it('passes a query to the fetch function', async () => {
            const rs = new Recordset({}, query => [{ name: query.parameters.name }]);
            rs.parameters.name = 'Jim';
            await rs.update();
            expect(pluck(rs.currentPage, 'name')).toEqual(['Jim']);
        });

        it('receives an array and interprets that mean it got a complete set of data', async () => {
            const rs = new Recordset({}, () => manyObjects(99));
            await rs.update();
            expect(rs.totalCount).toEqual(99);
        });

        it('receives an object with totalCount and uses that for the total', async () => {
            const rs = new Recordset({}, () => ({
                data: manyObjects(10),
                totalCount: 99,
            }));
            await rs.update();
            expect(rs.totalCount).toEqual(99);
        });
    });

    describe('figures out if the data is client-side or not', () => {
        // TODO: if <= one page of data on page one, assume server-side
        it('is client-side when we have all the data locally', async () => {
            const rs = new Recordset({}, () => ({
                data: manyObjects(10),
                totalCount: 10,
            }));
            await rs.update();
            expect(rs.isClientSide).toEqual(true);
        });

        it('is not client-side when there are more items available than we have', async () => {
            const rs = new Recordset({}, () => ({
                data: manyObjects(10),
                totalCount: 20,
            }));
            await rs.update();
            expect(rs.isClientSide).toEqual(false);
        });

        it('is not client-side when we have no data', async () => {
            const rs = new Recordset({}, () => []);
            expect(rs.isClientSide).toEqual(false);
        });
    });

    describe('handles client-side pagination', () => {
        it('updates the default page size without running an update', async () => {
            const rs = new Recordset({}, numberNames);
            rs.setInitialPageSize(25);
            expect(rs._.isFetchNeeded).toEqual(true);
        });
        it('has the first page of records', async () => {
            const rs = new Recordset({}, numberNames);
            rs.pageSize = 3;
            await nextFrame();
            expect(rs.currentPage.map(r => r.values.name)).toEqual(['one', 'two', 'three']);
        });

        it('has the second page of records', async () => {
            const rs = new Recordset({}, numberNames);
            rs.pageSize = 3;
            rs.pageNumber = 2;

            await nextFrame();
            expect(rs.currentPage.map(r => r.values.name)).toEqual(['four', 'five', 'six']);
        });

        it('has the last page of records', async () => {
            const rs = new Recordset({}, numberNames);
            rs.pageSize = 5;
            rs.pageNumber = 3;
            await nextFrame();
            expect(rs.currentPage.map(r => r.values.name)).toEqual(['eleven', 'twelve']);
        });

        it('does not call the fetch function again', async () => {
            let timesFetchCalled = 0;
            const rs = new Recordset({}, self => {
                timesFetchCalled++;
                return numberNames(self);
            });

            rs.requestUpdate();
            await nextFrame();

            rs.pageNumber = 3;
            await nextFrame();

            rs.pageNumber = 3;
            await nextFrame();

            expect(timesFetchCalled).toEqual(1);
        });
    });

    describe('handles server-side pagination', () => {
        it('sets filtered count to equal total count when running server side filtering', async () => {
            const rs = new Recordset({}, numberNamesServerSide);
            rs.pageSize = 5;
            await nextFrame();
            expect(rs.isServerSide).toEqual(true);
            expect(rs.filteredCount).toEqual(rs._.totalCount);
            expect(rs._.cursor.pageCount()).toEqual(3);
        });

        it('has the first page of records', async () => {
            const rs = new Recordset({}, numberNamesServerSide);
            rs.pageSize = 3;
            await nextFrame();
            expect(rs.currentPage.map(r => r.values.name)).toEqual(['one', 'two', 'three']);
        });

        it('has the second page of records', async () => {
            const rs = new Recordset({}, numberNamesServerSide);
            rs.pageSize = 3;
            rs.pageNumber = 2;

            await nextFrame();
            expect(rs.currentPage.map(r => r.values.name)).toEqual(['four', 'five', 'six']);
        });

        it('has the last page of records', async () => {
            const rs = new Recordset({}, numberNamesServerSide);
            rs.pageSize = 5;
            rs.pageNumber = 3;
            await nextFrame();
            expect(rs.currentPage.map(r => r.values.name)).toEqual(['eleven', 'twelve']);
        });
    });

    describe('filtering', () => {
        it('filters client-side data', async () => {
            const rs = new Recordset({}, numberNames);
            rs.filter = record => record.values.name.includes('e');
            rs.pageSize = 2;
            rs.pageNumber = 2;
            await nextFrame();
            expect(rs.currentPage.map(r => r.values.name)).toEqual(['five', 'seven']);
        });
        it('sets the page to 1 after filtering', async () => {
            const rs = new Recordset({}, numberNames);
            rs.pageSize = 2;
            rs.pageNumber = 2;
            rs.filter = record => record.values.name.includes('e');
            await nextFrame();
            expect(rs.pageNumber).toEqual(1);
        });
    });

    describe('sorting', () => {
        it('sorts client-side data', async () => {
            const rs = new Recordset({}, numberNames);
            rs.sortColumns = [{ field: 'name', sort: 'ascending' }];
            rs.pageSize = 2;
            rs.pageNumber = 2;
            await nextFrame();
            expect(rs.currentPage.map(r => r.values.name)).toEqual(['five', 'four']);
        });
        it('sets the page to 1 after sorting', async () => {
            const rs = new Recordset({}, numberNames);
            rs.pageSize = 2;
            rs.pageNumber = 2;
            rs.sortColumns = [{ field: 'name', sort: 'ascending' }];
            await nextFrame();
            expect(rs.pageNumber).toEqual(1);
        });
    });

    describe('requestUpdate()', () => {
        it('only updates once per event loop', async () => {
            let sequence = '';
            async function defer() {
                sequence += 'd';
                await nextFrame();
            }

            const rs = new Recordset({}, numberNames);
            rs.update = () => {
                sequence += 'u';
            };
            rs.requestUpdate();
            rs.requestUpdate();
            rs.requestUpdate();
            await defer();
            rs.requestUpdate();
            rs.requestUpdate();
            rs.requestUpdate();
            await defer();

            expect(sequence).toEqual('dudu'); // cSpell:disable-line
        });
    });

    describe('loading state', () => {
        it('is loading while waiting for fetch to return', async () => {
            let doResolve;
            function fetchData() {
                return new Promise(resolve => {
                    doResolve = resolve;
                });
            }

            const rs = new Recordset({}, fetchData);
            rs.update();

            doResolve([{ a: 1, b: 2 }]);

            expect(rs.isLoading).toEqual(true);

            await nextFrame();

            expect(rs.isLoading).toEqual(false);
        });
    });

    describe('events', () => {
        it('fires a page-changed event after updating the list of records on the current page', async () => {
            let timesChangeFired = 0;
            let timesPageChangeFired = 0;
            const rs = new Recordset({}, numberNames);
            rs.addEventListener('page-changed', () => timesPageChangeFired++);
            rs.addEventListener('change', () => timesChangeFired++);
            rs.pageNumber = 1;
            await nextFrame();
            rs.pageSize = 5;
            await nextFrame();
            rs.filter = () => true;
            await nextFrame();
            rs.sortColumns = [];
            await nextFrame();
            rs.parameters = {};
            await nextFrame();

            expect(timesPageChangeFired).toEqual(5);

            // The "change" event is needed for backwards-compatibility
            expect(timesChangeFired).toEqual(timesPageChangeFired);
        });

        it('fires a loading event when standard and hard updates are requested, not on soft updates', async () => {
            let isLoadingCount = 0;
            let isFinishedLoadingCount = 0;
            const rs = new Recordset({}, numberNames);
            rs.addEventListener('loading', ({ detail }) => {
                if (detail.loading) {
                    isLoadingCount++;
                } else {
                    isFinishedLoadingCount++;
                }
            });
            rs.requestUpdate();
            await nextFrame();
            rs.requestHardUpdate();
            await nextFrame();
            rs.requestSoftUpdate();
            await nextFrame();
            expect(isLoadingCount).toEqual(2);
            expect(isFinishedLoadingCount).toEqual(2);
        });

        it('fires an updated event when a record changes', async () => {
            let timesUpdated = 0;
            const rs = new Recordset({}, numberNames);
            rs.addEventListener('updated', () => timesUpdated++);
            rs.requestUpdate();
            await nextFrame();
            rs.currentPage[0].setField('name', 'uno');
            rs.currentPage[1].setField('name', 'dos');
            expect(timesUpdated).toEqual(2);
        });

        it('stops listening to a record after it is removed', async () => {
            let timesUpdated = 0;
            const rs = new Recordset({}, numberNames);
            rs.addEventListener('updated', () => timesUpdated++);
            rs.requestUpdate();
            await nextFrame();

            const recordToRemove = rs.currentPage[0];
            rs.deleteRecord(recordToRemove);
            recordToRemove.setField('name', 'bye');
            expect(timesUpdated).toEqual(0);
        });

        it('stops listening to a record after it is disconnected from the recordset', async () => {
            let timesUpdated = 0;
            const rs = new Recordset({}, numberNames);
            rs.addEventListener('updated', () => timesUpdated++);
            rs.requestUpdate();
            await nextFrame();
            const recordToForget = rs.currentPage[0];
            rs.requestHardUpdate();
            await nextFrame();
            recordToForget.setField('name', 'bye');
            expect(timesUpdated).toEqual(0);

            // make sure we're not leaking memory by holding on to old listeners
            expect(rs._.listeningTo.length).toEqual(12);
        });

        it('fires a counts-changed event after any change that could change the count of selected / invalid / matching records', async () => {
            let timesCountsChangeFired = 0;
            const rs = new Recordset({}, numberNames);
            rs.addEventListener('counts-changed', () => timesCountsChangeFired++);
            rs.pageNumber = 1;
            await nextFrame();
            expect(timesCountsChangeFired).toEqual(1);
            rs.pageSize = 5;
            await nextFrame();
            expect(timesCountsChangeFired).toEqual(2);
            rs.filter = () => true;
            await nextFrame();
            expect(timesCountsChangeFired).toEqual(3);
            rs.sortColumns = [];
            await nextFrame();
            expect(timesCountsChangeFired).toEqual(4);
            rs.parameters = {};
            await nextFrame();
            expect(timesCountsChangeFired).toEqual(5);
            rs.currentPage[0].setField('name', 'uno');
            await nextFrame();
            expect(timesCountsChangeFired).toEqual(6);
            const oneRecord = rs.currentPage[0];
            rs.deleteRecord(oneRecord);
            await nextFrame();
            expect(timesCountsChangeFired).toEqual(7);
            rs.insertRecord(oneRecord);
            await nextFrame();
            expect(timesCountsChangeFired).toEqual(8);
        });
    });

    describe('adding and removing records', () => {
        it('appends a record', async () => {
            const numberName = new FieldType().with.defaultValue('zero');
            const rs = new Recordset({ name: numberName }, numberNames);
            rs.pageSize = 5;
            rs.pageNumber = 3;
            await nextFrame();
            rs.appendRecord();
            expect(rs.totalCount).toEqual(13);
            expect(rs.currentPage[2].getField('name')).toEqual('zero');
        });

        it('clones a record', async () => {
            const numberName = new FieldType().with.defaultValue('zero');
            const rs = new Recordset({ name: numberName }, numberNames);
            rs.pageSize = 5;
            rs.pageNumber = 1;
            await nextFrame();
            const two = rs.currentPage[1];
            rs.cloneRecord(two, 1, ['name']);
            expect(rs.totalCount).toEqual(13);
            expect(rs.currentPage[2].getField('name')).toEqual('two');
        });

        it('temporarily increases the size of the page when a new record is added', async () => {
            const numberName = new FieldType().with.defaultValue('zero');
            const rs = new Recordset({ name: numberName }, numberNames);
            rs.pageSize = 5;
            rs.pageNumber = 1;
            await nextFrame();
            const two = rs.currentPage[1];
            rs.cloneRecord(two, 1, ['name']);
            rs.cloneRecord(two, 1, ['name']);
            expect(rs.currentPage.map(record => record.values.name)).toEqual([
                'one',
                'two',
                'two',
                'two',
                'three',
                'four',
                'five',
            ]);
        });

        it('deletes a record', async () => {
            const numberName = new FieldType();
            const rs = new Recordset({ name: numberName }, numberNames);
            rs.pageSize = 5;
            rs.pageNumber = 1;
            await nextFrame();
            const secondRecord = rs._.sortedFilteredRecords[1];
            rs.deleteRecord(secondRecord);
            expect(rs.totalCount).toEqual(11);
            expect(rs.currentPage.map(record => record.values.name)).toEqual([
                'one',
                'three',
                'four',
                'five',
                'six',
            ]);
        });
    });

    describe('working with a field across all records (i.e. a column)', () => {
        it('sets a column value', async () => {
            const disabledVowels = new FieldType().thatIs.disabledWhen(
                record => 'aeiou'.includes(record.getField('letter')) // cSpell:disable-line
            );
            const rs = new Recordset({ letter: disabledVowels }, () => [
                { letter: 'j' },
                { letter: 'h' },
                { letter: 'a' },
            ]);
            rs.pageNumber = 1;
            rs.pageSize = 3;
            await nextFrame();
            rs.setColumnValue('letter', 'x');

            expect(rs._.records.map(record => record.values.letter)).toEqual(['x', 'x', 'a']);
        });

        it('allRecordsMatch(field, value)', async () => {
            const rs = new Recordset({}, numberNames);
            rs.filter = record => record.getField('value') > 6;
            await nextFrame();
            expect(rs.allRecordsMatch('name', 'one')).toEqual(false);
            expect(rs.allRecordsMatch('isANumber', true)).toEqual(true);
            expect(rs.allRecordsMatch('isANumber', false)).toEqual(false);
        });

        it('noRecordsMatch(field, value)', async () => {
            const rs = new Recordset({}, numberNames);
            rs.filter = record => record.getField('value') > 6;
            await nextFrame();
            expect(rs.noRecordsMatch('name', 'ten')).toEqual(false);
            expect(rs.noRecordsMatch('name', 'one')).toEqual(true);
        });

        it('partialRecordsMatch(field, value)', async () => {
            const rs = new Recordset({}, numberNames);
            rs.filter = record => record.getField('value') > 6;
            await nextFrame();
            expect(rs.partialRecordsMatch('name', 'ten')).toEqual(true);
            expect(rs.partialRecordsMatch('name', 'one')).toEqual(false);
        });

        it('recordsMatching(field, value)', async () => {
            const rs = new Recordset({}, numberNames);
            rs.filter = record => record.getField('value') > 6;
            await nextFrame();
            expect(pluck(rs.recordsMatching('isEven', true), 'name')).toEqual([
                'eight',
                'ten',
                'twelve',
            ]);
        });

        it('countRecordsMatching(field, value)', async () => {
            const rs = new Recordset({}, numberNames);
            rs.filter = record => record.getField('value') > 6;
            await nextFrame();
            expect(rs.countRecordsMatching('isEven', true)).toEqual(3);
        });
    });

    describe('validation', () => {
        it('counts the invalid records', async () => {
            const disallowVowels = new FieldType().with.validator({
                name: 'no-vowel',
                validate: letter => !'aeiou'.includes(letter), // cSpell:disable-line
            });
            const rs = new Recordset({ letter: disallowVowels }, () => [
                { letter: 'a' },
                { letter: 'b' },
                { letter: 'c' },
            ]);
            rs.pageNumber = 1;
            rs.pageSize = 3;
            await nextFrame();

            expect(rs.invalidRecordCount()).toEqual(1);
        });

        it('isValid()', async () => {
            let valid = false;
            const hardCoded = new FieldType().with.validator({
                name: 'hard-coded',
                validate: () => valid,
            });
            const rs = new Recordset({ letter: hardCoded }, () => [
                { letter: 'a' },
                { letter: 'b' },
            ]);

            await rs.requestUpdate();

            expect(rs.isValid()).toEqual(false);
            valid = true;
            expect(rs.isValid()).toEqual(true);
        });
    });

    describe('getData() / setData()', () => {
        it('getData()', async () => {
            const rs = new Recordset({}, numberNames);
            rs.requestUpdate();
            await nextFrame();
            expect(rs.getData()[0]).toEqual({
                isANumber: true,
                isEven: false,
                name: 'one',
                value: 1,
            });
            expect(rs.getData().length).toEqual(12);
        });

        it('setData()', async () => {
            const rs = new Recordset({}, numberNames);
            rs.setData([
                {
                    isANumber: false,
                    isEven: false,
                    name: 'omega',
                    value: 'ω',
                },
            ]);
            await nextFrame();
            expect(rs.getData()).toEqual([
                {
                    isANumber: false,
                    isEven: false,
                    name: 'omega',
                    value: 'ω',
                },
            ]);
        });
    });
});
