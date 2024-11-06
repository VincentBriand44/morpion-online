import * as v from 'valibot';

export const Role = v.picklist(['X', 'O']);
export const Pos = v.pipe(v.number(), v.toMinValue(0), v.toMaxValue(8), v.integer());
