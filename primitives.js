/* eslint-disable @treasury/no-date */
import FieldType from './field-type.js';

export const string = new FieldType().with.defaultValue('');

export const boolean = new FieldType().with.schema('boolean').and.defaultValue(false);

export const number = new FieldType().with
    .cellClass('numeric')
    .and.exampleValue(1234.56)
    .and.defaultValue(0)
    .and.inputMask(/[0-9$.,]/);

export const date = new FieldType().with
    .cellClass('date')
    .and.minColumnWidth(50)
    .and.targetColumnWidth(80)
    .and.maxColumnWidth(200)
    .and.defaultValue(new Date());
