# FDL

FDL, pronounced "fiddle", is a library developed by Jack Henry's Digital UX team to **build complex forms and tables with many interdependent fields and validation rules**.

## Example: Dog Walking Service

Let's say you're building a scheduling form for your dog walking business. It has four fields: name, date, new customer, and comments, with the following rules:

- the name can be between 2 and 20 characters and should be capitalized when displayed (regardless of how it's input)
- new customer is <del>a checkbox</del> <del>radio buttons</del> a checkbox that defaults to "yes" and becomes disabled if the name isn't recognized
- the date can be any Monday - Friday, excluding holidays, and new customers can only book on Friday
- comments are optional, unless it's a new customer

**Traditionally we would put all of these rules in the HTML template**, but that gets hairy quick. Then we try to move some of the business logic to the controller, and it still gets hard to maintain. (We're typically dealing with 10-20 fields with a lot more rules and the business constantly throwing us curve balls).

FDL is a powerful but easy to read **domain specific language** that corrals all of these business rules so **the view code only has to worry about what field goes where**.

It looks something like this:

```js
import { string, boolean, date, Record } from "@jack-henry/FDL";

const name = string.with
  .minLength(2)
  .and.maxLength(20)
  .and.formatter(capitalize);
const newCustomer = boolean.with
  .defaultValue(false)
  .thatIs.disabledWhen(isNewCustomer);
const date = date.with
  .validator((record) => isWeekday(record.date))
  .and.validator((record) => isNotHoliday(record.date))
  .and.validator(isExistingCustomerOrNewCustomerDay);
const comments = string.thatIs.requiredWhen(isNewCustomer);

const appointment = new Record({
  name,
  newCustomer,
  date,
  comments,
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function isNewCustomer(record) {
  return !existingCustomers.includes(record.name);
}

function isWeekday(date) {
  return date.getDay() !== 0 && date.getDay() !== 6;
}

function isNotHoliday(date) {
  return !holidays.includes(date);
}

function isExistingCustomerOrNewCustomerDay(record) {
  return existingCustomers.includes(record.name) || record.date.getDay() === 5;
}
```

## Docs

In the above code, `string`, `boolean`, and `date` are all instances of [FieldType](./docs/field-type.md) class. They're connected to one another in a [Record](./docs/record.md). Not shown is a [Recordset](./docs/recordset.md), which we would use to present a list of appointments, with pagination, sorting, filtering, and specific rules around how those work for each field.

## More to come

Currently the best way to understand FDL is looking at how it's used in Jack Henry's internal codebase. We decided to open source the core as we believe it can be useful in other contexts.
