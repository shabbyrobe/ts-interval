TypeScript Date Intervals
=========================

This is the TypeScript counterpart to my [Go
library](https://github.com/shabbyrobe/golib/tree/master/times/interval) for handing
monotonic date intervals.

Installing:

    npm i --save ts-iterval

Simple usage:

```typescript

import { Interval, Span } from "ts-interval/interval";

// let's make some intervals:
const mins1 = new Interval(1, Span.Minute);
const weeks1 = new Interval(1, Span.Week);

// period 1 will be 1 minute after the epoch:
// 1970-01-01T00:01:00.000Z
console.log(mins1.time(1));

// 10 weeks after the epoch (epoch week starts on 1969-12-29):
// 1970-03-09T00:00:00.000Z
console.log(weeks1.time(10));

// Find me the period for the passed-in time:
console.log(mins1.period(new Date(Date.UTC(1999, 0, 1)))); // 15252480
console.log(weeks1.period(new Date(Date.UTC(1999, 0, 1)))); // 1513

// Serialise/deserialise:
const encoded: number = mins1.encode();
const decoded: Interval = Interval.decode(encoded);
```

Valid interval spans are:

- Second
- Minute
- Hour
- Day
- Week
- Month
- Year

