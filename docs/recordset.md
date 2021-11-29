# Recordset

A Recordset is an aggregate of Records that can be sorted, filtered, and paginated. In practice, it's common to start with a LocalRecordset with test data and switch to a Recordset when the API is available.

## Recordset Definition

A Recordset is constructed from a set of fields and a "fetch" function that returns a promise with the data. The fetch function takes five arguments:

- `sortColumns`: An array of objects, where `field` is the name of the field and `sort` is "ascending" or "descending"
- `filterTree`: A LISP-inspired data structure describing all of the filters and supports nested boolean expressions. It's used by LocalRecordset and can be used by Recordset if the fetchFunction supports it.
- `startRowNumber`: The first row to fetch (i.e. would be 11 if there are 10 rows per page and you want page 2)
- `rowCount`: How many rows to fetch (i.e. how many rows per page)
- `parameters`: key-value pair that acts as a dumbed-down version of filterTree (doesn't support nested expressions but easier to use)

```js
const fields = {
  id,
  title: string,
  isFavorite: boolean,
  isCustom: boolean,
};

// Note: "reportsAPI" is an imaginary API that demonstrates how the fetchFunction may need to massage
// the input and output data
function fetchReports(
  sortColumns,
  filterTree,
  startRowNumber,
  rowCount,
  parameters
) {
  return reportsApi
    .fetch(
      { type: parameters.type, includeCustom: true },
      sortColumn[0].field,
      sortColumn[0].direction,
      startRowNumber,
      rowCount
    )
    .then((reports) =>
      reports.map((report) => ({
        id: report.id,
        title: report.customTitle ?? report.title,
        isFavorite: favoriteReports.includes(report.id),
        isCustom: report.isCustom,
      }))
    );
}

const reports = new Recordset(fields, fetchReports);

const reportsTable = html`<!-- -->
  <your-table .recordset=${reports}>
    <your-table-column
      field="title"
      label="Title"
      path="/reports/:id"
    ></your-table-column>
    <your-table-column field="isFavorite" label="Favorite?"></your-table-column>
  </your-table>`;
```

## ExampleRecordset

For use in prototyping only, ExampleRecordset generates random data automatically, using FieldType#exampleValues() to produce values. The second argument is the number of values to produce.

_ExampleRecordset is handicapped until we can find a better way to produce random values. We were using Chance.js, but that bloated the build. We might want to configure the build so that it substitutes a dummy object for Chance that throws an exception when any function is called, as we don't want to use example values in production. And we should look at using Faker instead of chance._

```js
const fields = {
  id,
  title: string,
  isFavorite: boolean,
  isCustom: boolean,
};

const recordset = new ExampleRecordset(fields, 100);
```
