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
