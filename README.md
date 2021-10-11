# FDL

Jack Henry's Digital UX Field Definition Language

````

# Field Types

A field type is the special sauce that gives an ordinary piece of data some flavor by defining modifiers, rules and descriptors.

For example, suppose we want to define a type of "number" and give it the following properties:

1. If the number is in a form field, validate that the entry is a valid number.
2. If a number shows up in a table cell, it will have the class "numeric" (`<td class="numeric">`).
3. If that number happens to be negative, it will _also_ have a class of negative (`<td class="numeric negative">`)

FieldType allows us to encode these rules in a declarative API that reads like a sentence.

```js
const number = new FieldType().with
    .validator(mustBeNumeric)
    .and.cellClass('numeric')
    .and.conditionalCellClass(isNegative, 'negative');
````

The variables `mustBeNumeric` and `isNegative` each point to functions (not shown here) that take the value as an argument and return `true` or `false`. Callback functions are used extensively in FieldType definitions to add new behaviors without touching existing code<sup>1</sup>.

The `with` and `and` properties are there to help the code read more like a sentence. You can use `with`, `and`, and `thatIs` interchangeably. They all point to the same object, a `FieldTypeBuilder`.

FieldTypes are immutable. Each of the functions, which we'll call _modifiers_, returns a new object. As such, we're able to build a new field type out of an existing field type, ala the [prototype](https://refactoring.guru/design-patterns/prototype) pattern.

```js
const money = number.with
  .formatter(usdFormat)
  .and.formatter(accountingNotation)
  .and.parser(reverseUsdFormat)
  .and.parser(reverseAccountingNotation)
  .and.parser(parseFloat)
  .and.minColumnWidth(50)
  .and.targetColumnWidth(80)
  .and.maxColumnWidth(200);
```

Reusing field types cuts down on the amount of code we have to maintain while keeping business rules separate from presentation code. It also ensures that the business rules are implemented consistently -- if a rule changes, we only have to change the code in one place.

What about special cases where we need a field type to have a slightly different behavior on one screen only? These cases are quite common, and there is an elegant solution. Because a modifier always produces a new FieldType, we can start with a basic, reusable FieldType and add the special behaviors inline!

```js
import { name, address, date, accountNumber } from 'my-field-library/fieldTypes';
import { accountService } from 'services/account';

const transferRecord = new Record({
    beneficiaryName: name,
    beneficiaryAddress: address,
    date: date.with.angularValidator(isValidTransferDate)
    fromAccount: accountNumber.with.options(accountService.getAvailableFromAccounts),
    toAccount: accountNumber.with.options(
        (record) => accountService.getAvailableToAccounts().then(
            (accounts) => accounts.filter(
                (account) => account.number !== record.getField('fromAccount'))))
})
```

<small>1. i.e. the [open-closed principle](https://deviq.com/open-closed-principle/)</small>

```js preview-story
export function Modifiers() {
  return html`<!-- this is a hack to make "modifiers" show up in the menu -->`;
}
```

## Modifiers

The following modifiers are available to extend a FieldType.

<table>
    <tr>
        <th>Name</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><a href="#compare-function">compareFunction((a, b) => number)</a></td>
        <td>A function to compare to values for sorting</td>
    </tr>
    <tr>
        <td><a href="#hash-function">hashFunction(fn)</a></td>
        <td>A function to compare to values for setting display</td>
    </tr>
    <tr>
        <td><a href="#disabled-when">disabledWhen(predicate)</a></td>
        <td>Indicates when a form field should be disabled</td>
    </tr>
    <tr>
        <td><a href="#empty-when">emptyWhen(value => boolean)</a></td>
        <td>Condition under which the field would be considered empty if required</td>
    </tr>
    <tr>
        <td><a href="#filter">filter(predicate)</a></td>
        <td>Used for type-to-search</td>
    </tr>
    <tr>
        <td><a href="#formatter">formatter(fn)</a></td>
        <td>Applies formatting to a value wherever it's output</td>
    </tr>
    <tr>
        <td><a href="#label">label(string | (record, labelSoFar) => string)</a></td>
        <td>The label associated with a form field</td>
    </tr>
    <tr>
        <td><a href="#lookup">lookup(asyncFn)</a></td>
        <td>Attaches a button to a form field that launches a lookup dialog</td>
    </tr>
    <tr>
        <td><a href="#min-column-width">maxColumnWidth(pixels)</a></td>
        <td>The maximum column width in a table</td>
    </tr>
    <tr>
        <td><a href="#min-column-width">minColumnWidth(pixels)</a></td>
        <td>The minimum column width in a table</td>
    </tr>
    <tr>
        <td><a href="#min-length">maxLength(int)</a></td>
        <td>The maximum input length in a text field</td>
    </tr>
    <tr>
        <td><a href="#min-length">minLength(int)</a></td>
        <td>The minimum input length in a text field</td>
    </tr>
    <tr>
        <td><a href="#multiple-values">multipleValues</a></td>
        <td>The field can have zero or more values (i.e. multi-select)</td>
    </tr>
    <tr>
        <td><a href="#options">options(config)</a></td>
        <td>List of options (for a dropdown control)</td>
    </tr>
    <tr>
        <td><a href="#parser">parser(fn)</a></td>
        <td>Parse text input (inverse of <a href="#formatter">formatter</a>)</td>
    </tr>
    <tr>
        <td><a href="#read-only-when">readOnlyWhen(predicate)</a></td>
        <td>Whether to render a read-only value instead of a form field</td>
    </tr>
    <tr>
        <td><a href="#schema">schema(string)</a></td>
        <td>A hack there we're hoping to eliminate soon</td>
    </tr>
    <tr>
        <td><a href="#search">search(config)</a></td>
        <td>Used for type-to-search within options</td>
    </tr>
    <tr>
        <td><a href="#suggestions">suggestions(asyncFn)</a></td>
        <td>Provide combobox-style suggestions</td>
    </tr>
     <tr>
        <td><a href="#min-column-width">targetColumnWidth(pixels)</a></td>
        <td>The ideal column width in a table</td>
    </tr>
    <tr>
        <td><a href="#validator">validator(validatorObject[, config])</a></td>
        <td>Used to create client-side validation rules</td>
    </tr>
    <tr>
        <td><a href="#visible-when">visibleWhen(predicate)</a></td>
        <td>Whether the field should be visible</td>
    </tr>
</table>

### <a id="compare-function"></a> compareFunction((a, b) => number)

Used for sorting. `compare` is a function that takes two arguments, compares them, and returns -1, 0, or 1, i.e. the same type of function that can optionally be passed to [Array#sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).

```js
function caseInsensitiveSort(a, b) {
  if (a.toLowerCase() < b.toLowerCase()) {
    return -1;
  }
  if (a.toLowerCase() > b.toLowerCase()) {
    return 1;
  }

  return 0;
}

const example = new FieldType().with.compareFunction(caseInsensitiveSort);
```

### <a id="hash-function"></a> hashFunction(compare)

Used for selecting an option in a select where the object needs selection based on a unique property value.

```js
function functionHasUniqueName(a) {
  return a.name;
}

const example = new FieldType().with.hashFunction(functionHasUniqueName);
```

### <a id="disabled-when"></a> disabledWhen(condition)

Causes an input field to be disabled when the `condition(record)` returns true. `disabledWhen()` functions can be stacked and will disable the field when _any_ condition is true. You can use the shorthand .disabled() to disable the field.

```js
const example = username.thatIs
  .disabledWhen((record) => typeof record.getField("company") === "undefined")
  .and.disabledWhen((record) => !record.getField("userId"));
```

```js
const shortHand = username.thatIs.disabled();
```

### <a id="empty-when"></a> emptyWhen(val => boolean)

Causes an input field to fail the required validator `condition(value)` returns true. Values `null`, `undefined`, and `''` (zero-length string) are considered empty by default. Use `emptyWhen()` to assign any additional values under which the field would be considered empty, such as `0`.

```js
const example = username.thatIs.emptyWhen((val) => val === 0);
```

### <a id="filter"></a> filter()

Makes the field type filterable (with type to filter). By default a field type is not filterable and will be considered to match any substring. When called without arguments, `filter()` will make the field match when the search text is a case-insensitive substring of the value.

```js
const text = new FieldType().with.filter();
text.match("world", "Hello World"); // true
text.match("hi", "Hello World"); // false
```

`filter()` can take an optional callback function which provides a more refined match function

```js
const number = new FieldType().with.filter((searchText, value) => {
  if (searchText[0] === "<") return value < parseFloat(searchText.slice(1));
  if (searchText[0] === ">") return value > parseFloat(searchText.slice(1));
  if (searchText[0] === "=") return value === parseFloat(searchText.slice(1));
  if (searchText.slice(0, 2) === "<=")
    return value <= parseFloat(searchText.slice(2));
  if (filter.slice(0, 2) === ">=")
    return value >= parseFloat(searchText.slice(2));
  return true;
});

number.match("<5.00", 5.75); // false
number.match(">=1200", 1200); // true
```

### <a id="formatter"></a>formatter(fn)

Applies formatting to a value wherever it's output. Note that formatters can be composed. If a FieldType has multiple formatters, the output of one formatter becomes the input of the next formatter.

```js
const usdFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatUsd(value) {
  return usdFormat.format(value);
}

function accountingNotation(value) {
  const valueAsString = value.toString();
  if (valueAsString[0] === "-") {
    return `(${valueAsString.slice(1)})`;
  }
  return valueAsString;
}

const money = number.with
  .formatter(formatUsd)
  .and.formatter(accountingNotation);
```

Specifically, it affects the output of `Record#print()`.

Wherever there is a a `formatter()` for a field that can be used in input, you should pair it with a [`parser()`](#parserfn) to do the reverse translation.

_Note: Should we add a second argument, `appliesToInput`? It doesn't make sense for accounting notation to be used in input. However, we have no use case currently for a user inputting a negative value, so the point is moot._

```js
const record = new Record(
  {
    balance: money,
  },
  { value: -123 }
);

record.print("balance"); // ($123.00)
```

### <a id="label"></a>label(string | (record, labelSoFar) => string)

`label()` provides a label to your gateway / form element component. A label can be simply passed as a string:

```js
const example = new FieldType().with.label("Name");
```

or as a function which expects a record and/or the label calculated up to this point:

```js
const example = new FieldType().with.label((record) =>
  record.getField("company") ? "Name" : "ID Number"
);
```

```js
const example = new FieldType().with.label((_, labelSoFar) =>
  labelSoFar.toLowerCase()
);
```

### <a id="lookup"></a> lookup(doLookup)

Takes an async function which returns a value. The function is responsible for opening a dialog and / or whatever else it takes to complete the lookup and fill in an input.

```js
const example = new FieldType().with.lookup(getAccountNumberFromUser);
```

_The idea here is based on [hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture/). The application doesn't distinguish between getting data from a user, a service that's operated by a computer, or a test._

### <a id="min-column-width"></a> minColumnWidth(width) / maxColumnWidth(width) / targetColumnWidth(width)

These modifiers do exactly what's on the label: they specify the minimum, maximum, and target width of each column in pixels.

```js
const example = new FieldType().with
  .minColumnWidth(50)
  .and.maxColumnWidth(200)
  .and.targetColumnWidth(100);
```

### <a id="min-length"></a> minLength(n) and maxLength(n)

adds the minLength and maxLength attributes to an input and validators to support the conditions

```js
const example = username.with.minLength(5).and.maxLength(20);
```

### <a id="multiple-values"></a> multipleValues()

Causes the FieldType to have an array of values instead of just one value (e.g. changes a dropdown to a multiple-select dropdown with checkboxes.

_In the future, we may consider adding optional parameters for minValueCount and maxValueCount._

```js
const example = account.with.options(/* ... */).and.multipleValues();
```

### <a id="options"></a> options(config)

Provides a list of options for input (i.e. dropdown control)

`config` is an object with the following properties:

- `data` or `fetch` (one or the other is required, with data taking precedence)
  - `data`: an array of source data
  - `fetch`: a function that takes the record values as an object and returns a promise with source data
- `text` (default = "text")
  - a string corresponding to the key containing display text (e.g. "name"), or
  - a function that takes the source object and returns the display text (e.g. `user => user.name + ' ' +user.userId`
- `value` (default = "value")
  - a string corresponding to the key containing value (e.g. "id"), or
  - a function that takes the source object and returns the value (e.g. user => user.id)
- `sort` (default = undefined)
  - a compareFunction to pass to [Array#sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- `fields` (default = undefined)
  - an array of field names that, when changed, can cause the options to be updated
  - only applies when fetch is used
  - used for performance tuning
    - to prevent your select from looking up new options when nothing significant changed
    - to cache (memoize) the results and not look up options for the same input twice
- `hideSelectAll` (default = false)
  - When rendering a select list, hide the "Select All" option.

#### Shorthand APIs

```js
.with.options(array) // equivalent to .with.options({ data: array })
.with.options(fn) // equivalent to .with.options({fetch: fn});
```

#### Examples

```js
account.with.options({
  data: accounts,
  value: "accountId",
  text(account) {
    return account.nickname || account.maskedAccountNumber;
  },
});

companyUser.with.options({
  fetch(values) {
    return companyService.fetchUsers(values.companyID);
  },
  fields: ["companyId"],
  sort(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  },
});
```

### <a id="parser"></a> parser(fn)

Used to translate user input to an unambiguous machine-readable value. One of the primary use cases for `parser()` is to rewind a [`formatter()`](#formatterfn).

```js
function parseUsd(s) {
  return s.replace(/\$|,/g, "");
}

function formatUsd(n) {
  // see implementation under formatter()
}

const money = new FieldType().with.formatter(formatUsd).and.parser(parseUsd);
```

### <a id="read-only-when"></a> readOnlyWhen(condition)

Renders the `print()` and formatted value of the field type when `condition(record)` returns true
field.readonly() is `false` by default. You may use the shorthand readOnly() to set the value to always true

```js
const example = username.thatIs.readOnlyWhen(
  (record) => record.getField("company") === "Joe's Crab Shack"
);
```

```js
const shortHand = username.thatIs.readOnly();
```

### <a id="schema"></a> schema(name)

_Deprecated. If all goes well, this hack will not survive the conversion to Lit. Instead, FieldType will take a base JavaScript datatype in its constructor, similar to the way Lit properties are configured. The "range" schemas are no longer needed; CompositeFieldType gets the job done with infinitely more flexibility._

The `name` is a string that must be one of the following values:

- "boolean" (toggle)
- "datepicker"
- "range"
- "date-range"

### <a id="search"></a> search(config)

Takes an object with properties title, columns, and filters to render a dialog, filter bar and table from which a user can select a value.
Currently only works in conjunction with options() that provide the data needed to build a recordset and table.

```js
const withSearch = new FieldType().with
  .options({ id: 123, name: "John Smith" })
  .and.search({
    title: "Search Users",
    columns: [
      { label: "User ID", field: "id" },
      { label: "User Name", field: "name" },
    ],
  });
```

### <a id="suggestions"></a> suggestions(fetchSuggestions)

Provides a list of options matching what the user typed. The `fetchSuggestions` function takes the typed text and returns an array of values, each of which is either:

- an objects with `text` and `value`
- a DOM node
- a [TemplateResult](https://lit-html.polymer-project.org/api/classes/_lit_html_.templateresult.html)

```js
default function accountSuggestions(text) {
    return fetch(`/services/suggestAchCompany?text=${text}`)
        .then(response =>
            response.json().map(item => {
                return {
                    text: item.achCompanyName,
                    value: item.achCompanyName,
                };
            })
        );
}

const example = new FieldType().with.suggestions(accountSuggestions)
```

_Note. We need to provide an option for select and multiple select to not have search boxes. Would it make sense to use `suggestions()` as the signal that it should have a search box? `.with.options(...)` = no search box, `.with.options(...).and.suggestions()` = search box._

<a id="required-when"></a> requiredWhen(condition)

Causes an input field to be required when the `condition(record)` returns true.
field.required() is `false` by default. You may use the shorthand required() to set the value to always true.

```js
const example = username.thatIs.requiredWhen((record) =>
  record.getField("company")
);
```

```js
const shortHand = username.thatIs.required();
```

### <a id="validator"></a>validator(validatorObject [, config])

Provides a validation rule. The first argument is an object containing a `name` and a function called `validator`. When validation is needed, the `validator` function will be called with value (both `modelValue` and `viewValue`) the `record`, and the optional second parameter, `config`. If the function returns true, the value is valid. Here's a simple example that validates a number is greater than zero.

```js
const greaterThanZero = {
  name: "positive",
  validate(modelValue /* viewValue , record, config */) {
    return modelValue > 0;
  },
};

const positiveNumber = number.with.angularValidator(greaterThanZero);
```

Notice that 3 of the 4 arguments to `validate()` were not used. To demonstrate why the other arguments are needed (sometimes), here's an example validating that the end date is after the start date.

```js
const dateIsAfter = {
  name: "minimum-date",
  validator(modelValue, viewValue, record, otherDateField) {
    return modelValue > record.getField(otherDateField);
  },
};

const searchRecord = new Record({
  startDate: date,
  endDate: date.with.angularValidator(dateIsAfter, "startDate"),
});
```

### <a id="visible-when"></a> visibleWhen(condition)

Causes an input field to be visible when the `condition(record)` returns true.
field.visible() is `true` by default

```js
const example = username.thatIs.visibleWhen((record) =>
  record.getField("company")
);
```

```js script
import { html } from "@open-wc/demoing-storybook";

export default {
  title: "Models/Record",
  parameters: {
    componentSubtitle: "Record API",
  },
};
```

# Record

A record is a group of named fields, described by FieldTypes, with each field having a value. In [Domain Driven Design](https://martinfowler.com/bliki/EvansClassification.html) parlance, a Record is an entity. In PoEE, it's a [data transfer object](https://martinfowler.com/eaaCatalog/dataTransferObject.html).

Unless you're working on the components themselves, you won't interact with Record much other than to instantiate them and pass them to `field`

```js
import { name, accountNumber, money } from "FDL/fieldTypes";

const accountRecord = new Record(
  {
    // FieldTypes
    name,
    accountNumber,
    collectedBalance: money,
    availableBalance: money,
    currentBalance: money,
  },
  {
    // values
    name: "Checking",
    accountNumber: "92120391",
    collectedBalance: 1000,
    availableBalance: 1900,
    currentBalance: 900,
  }
);
```

```html
<your-field .record="accountRecord" field="name" label="Name"></your-field>
<your-field
  .record="accountRecord"
  field="accountNumber"
  label="Account Number"
></your-field>
<your-field
  .record="accountRecord"
  field="collectedBalance"
  label="Balance (Col)"
></your-field>
<your-field
  .record="accountRecord"
  field="availableBalance"
  label="Balance (Avl)"
></your-field>
<your-field
  .record="accountRecord"
  field="currentBalance"
  label="Balance (Cur)"
></your-field>
```

## Methods

### field(fieldName)

### reset()

Resets all values to those that were passed into the constructor.

```js
accountRecord.setField("accountNumber", "99999");
accountRecord.getField("accountNumber"); // '99999'
accountRecord.reset();
accountRecord.getField("accountNumber"); // '92120391'
```

### onChange(listener)

Notifies the listener when the record is changed.

```js
accountRecord.addEventListener("change", () => console.log("changed"));
accountRecord.setField("name", "Make It Rain"); // prints 'changed' to the console
```

### isValid()

Returns true if all of the values in the record are valid (according to their respective fieldTypes).

```js
accountRecord.setField("name", "$aving$");
accountRecord.isValid(); // false

accountRecord.setField("name", "Savings");
accountRecord.isValid(); // true
```

### errors() / errorCount() / hasErrors()

_Here be dragons. These functions exist, but they're not used anywhere yet and the design needs to be reviewed. We will need this functionality in ACH recipients, where we have a table of recipients that can be edited, and the first column marks the recipients that have errors._

## Deprecated Functions

_A field object (described at the top of this page) is a much more powerful abstraction that can do all fo the below and more._

### getField(fieldName)

Returns the value of the specified field.

```js
const howMuchCanISpend = accountRecord.getField("availableBalance"); // 1900
```

### setField(fieldName, value)

Sets the value of the specified field.

```js
accountRecord.setField("name", "Make It Rain");
```

### fieldTypeForField(fieldName)

Returns the FieldType corresponding to the field.

```js
accountRecord.fieldTypeForField("currentBalance"); // returns a FieldType object
```

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

