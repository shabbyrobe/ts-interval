import { Interval, Span } from "../src/interval";

function toDate(iso: string): Date {
  return new Date(Date.parse(iso));
}

test('interval', () => {
  expect(new Interval(4, Span.Month).start(toDate("2017-07-01T00:00Z")))
    .toEqual(toDate("2017-05-01T00:00Z"));

  expect(new Interval(3, Span.Week).start(toDate("2017-07-01T00:00Z")))
    .toEqual(toDate("2017-06-26T00:00Z"));

  expect(new Interval(4, Span.Hour).start(toDate("2017-06-26T05:30Z")))
    .toEqual(toDate("2017-06-26T04:00Z"));

  expect(new Interval(4, Span.Month).start(toDate("2017-07-01T00:00+10:00")))
    .toEqual(toDate("2017-05-01T00:00Z"));

  expect(new Interval(4, Span.Month).start(toDate("2017-04-01T02:00+10:00")))
    .toEqual(toDate("2017-01-01T00:00Z"));

  expect(new Interval(3, Span.Week).start(toDate("2017-07-01T00:00Z")))
    .toEqual(toDate("2017-06-26T00:00Z"));

  // This is 02:00 instead of 04:00 because the timezone offset is 10 hours
  // and the buckets start from UTC.
  expect(new Interval(4, Span.Hour).start(toDate("2017-06-26T05:30+10:00")))
    .toEqual(toDate("2017-06-26T02:00+10:00"));
});

test('interval', () => {
  expect(new Interval(1, Span.Second).toString()).toEqual("1sec");
  expect(new Interval(2, Span.Second).toString()).toEqual("2sec");
  expect(new Interval(1, Span.Minute).toString()).toEqual("1min");
  expect(new Interval(2, Span.Minute).toString()).toEqual("2min");
  expect(new Interval(1, Span.Hour).toString()).toEqual("1hr");
  expect(new Interval(2, Span.Hour).toString()).toEqual("2hr");
  expect(new Interval(1, Span.Week).toString()).toEqual("1wk");
  expect(new Interval(2, Span.Week).toString()).toEqual("2wk");
  expect(new Interval(1, Span.Day).toString()).toEqual("1d");
  expect(new Interval(2, Span.Day).toString()).toEqual("2d");
  expect(new Interval(1, Span.Month).toString()).toEqual("1mo");
  expect(new Interval(2, Span.Month).toString()).toEqual("2mo");
  expect(new Interval(1, Span.Year).toString()).toEqual("1yr");
  expect(new Interval(2, Span.Year).toString()).toEqual("2yr");
});

/*
test('sort', () => {
    in := []Interval{New(61, Minute), New(1, Hour), New(59, Minute)}
    ex := []Interval{New(59, Minute), New(1, Hour), New(61, Minute)}
    sort.Slice(in, func(i, j int) bool { return in[i].Less(in[j]) })
    tt.MustEqual(ex, in)

    in = []Interval{New(61, Second), New(1, Minute), New(59, Second)}
    ex = []Interval{New(59, Second), New(1, Minute), New(61, Second)}
    sort.Slice(in, func(i, j int) bool { return in[i].Less(in[j]) })
    tt.MustEqual(ex, in)
}
*/

// Less-fucked Date.UTC variant that uses 1-indexed months like the
// entire world does; this facilitates easier pasting of table-driven
// test cases from the Go implementation.
function utc(y, mo, d, h, min, s=0, msec=0) {
  return Date.UTC(y, mo-1, d, h, min, s, msec);
}

// Accepts nanos instead of millis, to facilitate even easier pasting from Go.
function utcns(y, mo, d, h, min, s=0, nsec=0) {
  return utc(y, mo, d, h, min, s, nsec/1000000);
}

const periodCases = [
  {interval: new Interval(1, Span.Second), period: 0, testTime: new Date(utcns(1970,1,1,0,0,0,0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0))},

  // 1 second
  {interval: new Interval(1, Span.Second), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Second), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Second), period: 1, testTime: new Date(utcns(1970, 1, 1, 0, 0, 1, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 1, 0))},
  {interval: new Interval(1, Span.Second), period: 1, testTime: new Date(utcns(1970, 1, 1, 0, 0, 1, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 1, 0))},
  {interval: new Interval(1, Span.Second), period: 2, testTime: new Date(utcns(1970, 1, 1, 0, 0, 2, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 2, 0))},
  {interval: new Interval(1, Span.Second), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 0))},
  {interval: new Interval(1, Span.Second), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 0))},
  {interval: new Interval(1, Span.Second), period: -2, testTime: new Date(utcns(1969, 12, 31, 23, 59, 58, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 58, 0))},
  {interval: new Interval(1, Span.Second), period: -2, testTime: new Date(utcns(1969, 12, 31, 23, 59, 58, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 58, 0))},
  {interval: new Interval(1, Span.Second), period: -3, testTime: new Date(utcns(1969, 12, 31, 23, 59, 57, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 57, 0))},

  // 4 second
  {interval: new Interval(4, Span.Second), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Second), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 3, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Second), period: 1, testTime: new Date(utcns(1970, 1, 1, 0, 0, 4, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 4, 0))},
  {interval: new Interval(4, Span.Second), period: 1, testTime: new Date(utcns(1970, 1, 1, 0, 0, 7, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 4, 0))},
  {interval: new Interval(4, Span.Second), period: 2, testTime: new Date(utcns(1970, 1, 1, 0, 0, 8, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 8, 0))},
  {interval: new Interval(4, Span.Second), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 56, 0))},
  {interval: new Interval(4, Span.Second), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 57, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 56, 0))},
  {interval: new Interval(4, Span.Second), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 56, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 56, 0))},
  {interval: new Interval(4, Span.Second), period: -2, testTime: new Date(utcns(1969, 12, 31, 23, 59, 55, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 52, 0))},
  {interval: new Interval(4, Span.Second), period: -2, testTime: new Date(utcns(1969, 12, 31, 23, 59, 55, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 52, 0))},
  {interval: new Interval(4, Span.Second), period: -2, testTime: new Date(utcns(1969, 12, 31, 23, 59, 52, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 52, 0))},
  {interval: new Interval(4, Span.Second), period: -3, testTime: new Date(utcns(1969, 12, 31, 23, 59, 51, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 48, 0))},

  // 1 minute
  {interval: new Interval(1, Span.Minute), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Minute), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Minute), period: 1, testTime: new Date(utcns(1970, 1, 1, 0, 1, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 1, 0, 0))},
  {interval: new Interval(1, Span.Minute), period: 1, testTime: new Date(utcns(1970, 1, 1, 0, 1, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 1, 0, 0))},
  {interval: new Interval(1, Span.Minute), period: 2, testTime: new Date(utcns(1970, 1, 1, 0, 2, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 2, 0, 0))},
  {interval: new Interval(1, Span.Minute), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 0, 0))},
  {interval: new Interval(1, Span.Minute), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 59, 0, 0))},
  {interval: new Interval(1, Span.Minute), period: -2, testTime: new Date(utcns(1969, 12, 31, 23, 58, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 23, 58, 0, 0))},
  {interval: new Interval(1, Span.Minute), period: -2, testTime: new Date(utcns(1969, 12, 31, 23, 58, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 58, 0, 0))},
  {interval: new Interval(1, Span.Minute), period: -3, testTime: new Date(utcns(1969, 12, 31, 23, 57, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 23, 57, 0, 0))},

  // 4 minute
  {interval: new Interval(4, Span.Minute), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Minute), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 3, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Minute), period: 1, testTime: new Date(utcns(1970, 1, 1, 0, 4, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 4, 0, 0))},
  {interval: new Interval(4, Span.Minute), period: 1, testTime: new Date(utcns(1970, 1, 1, 0, 7, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 4, 0, 0))},
  {interval: new Interval(4, Span.Minute), period: 2, testTime: new Date(utcns(1970, 1, 1, 0, 8, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 8, 0, 0))},
  {interval: new Interval(4, Span.Minute), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 23, 56, 0, 0))},
  {interval: new Interval(4, Span.Minute), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 57, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 56, 0, 0))},
  {interval: new Interval(4, Span.Minute), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 56, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 56, 0, 0))},
  {interval: new Interval(4, Span.Minute), period: -2, testTime: new Date(utcns(1969, 12, 31, 23, 55, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 23, 52, 0, 0))},
  {interval: new Interval(4, Span.Minute), period: -2, testTime: new Date(utcns(1969, 12, 31, 23, 53, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 52, 0, 0))},
  {interval: new Interval(4, Span.Minute), period: -2, testTime: new Date(utcns(1969, 12, 31, 23, 52, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 52, 0, 0))},
  {interval: new Interval(4, Span.Minute), period: -3, testTime: new Date(utcns(1969, 12, 31, 23, 51, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 23, 48, 0, 0))},

  // 1 hour
  {interval: new Interval(1, Span.Hour), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Hour), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Hour), period: 1, testTime: new Date(utcns(1970, 1, 1, 1, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 1, 0, 0, 0))},
  {interval: new Interval(1, Span.Hour), period: 1, testTime: new Date(utcns(1970, 1, 1, 1, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 1, 0, 0, 0))},
  {interval: new Interval(1, Span.Hour), period: 2, testTime: new Date(utcns(1970, 1, 1, 2, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 2, 0, 0, 0))},
  {interval: new Interval(1, Span.Hour), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 0, 0, 0))},
  {interval: new Interval(1, Span.Hour), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 23, 0, 0, 0))},
  {interval: new Interval(1, Span.Hour), period: -2, testTime: new Date(utcns(1969, 12, 31, 22, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 22, 0, 0, 0))},
  {interval: new Interval(1, Span.Hour), period: -2, testTime: new Date(utcns(1969, 12, 31, 22, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 22, 0, 0, 0))},
  {interval: new Interval(1, Span.Hour), period: -3, testTime: new Date(utcns(1969, 12, 31, 21, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 21, 0, 0, 0))},

  // 4 hour
  {interval: new Interval(4, Span.Hour), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Hour), period: 0, testTime: new Date(utcns(1970, 1, 1, 3, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Hour), period: 1, testTime: new Date(utcns(1970, 1, 1, 4, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 4, 0, 0, 0))},
  {interval: new Interval(4, Span.Hour), period: 1, testTime: new Date(utcns(1970, 1, 1, 7, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 4, 0, 0, 0))},
  {interval: new Interval(4, Span.Hour), period: 2, testTime: new Date(utcns(1970, 1, 1, 8, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 8, 0, 0, 0))},
  {interval: new Interval(4, Span.Hour), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 20, 0, 0, 0))},
  {interval: new Interval(4, Span.Hour), period: -1, testTime: new Date(utcns(1969, 12, 31, 21, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 20, 0, 0, 0))},
  {interval: new Interval(4, Span.Hour), period: -1, testTime: new Date(utcns(1969, 12, 31, 20, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 20, 0, 0, 0))},
  {interval: new Interval(4, Span.Hour), period: -2, testTime: new Date(utcns(1969, 12, 31, 19, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 16, 0, 0, 0))},
  {interval: new Interval(4, Span.Hour), period: -2, testTime: new Date(utcns(1969, 12, 31, 19, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 16, 0, 0, 0))},
  {interval: new Interval(4, Span.Hour), period: -2, testTime: new Date(utcns(1969, 12, 31, 17, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 16, 0, 0, 0))},
  {interval: new Interval(4, Span.Hour), period: -2, testTime: new Date(utcns(1969, 12, 31, 16, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 16, 0, 0, 0))},
  {interval: new Interval(4, Span.Hour), period: -3, testTime: new Date(utcns(1969, 12, 31, 15, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 12, 0, 0, 0))},

  // 1 day
  {interval: new Interval(1, Span.Day), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Day), period: 0, testTime: new Date(utcns(1970, 1, 1, 10, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Day), period: 0, testTime: new Date(utcns(1970, 1, 1, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Day), period: 1, testTime: new Date(utcns(1970, 1, 2, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 2, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Day), period: 1, testTime: new Date(utcns(1970, 1, 2, 10, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 2, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Day), period: 1, testTime: new Date(utcns(1970, 1, 2, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 2, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Day), period: 2, testTime: new Date(utcns(1970, 1, 3, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 3, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Day), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 31, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Day), period: -1, testTime: new Date(utcns(1969, 12, 31, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 31, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Day), period: -2, testTime: new Date(utcns(1969, 12, 30, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 30, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Day), period: -2, testTime: new Date(utcns(1969, 12, 30, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 30, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Day), period: -3, testTime: new Date(utcns(1969, 12, 29, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 29, 0, 0, 0, 0))},

  // 4 day
  {interval: new Interval(4, Span.Day), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Day), period: 0, testTime: new Date(utcns(1970, 1, 3, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Day), period: 1, testTime: new Date(utcns(1970, 1, 5, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 5, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Day), period: 1, testTime: new Date(utcns(1970, 1, 5, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 5, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Day), period: 2, testTime: new Date(utcns(1970, 1, 9, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 9, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Day), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 28, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Day), period: -1, testTime: new Date(utcns(1969, 12, 30, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 28, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Day), period: -1, testTime: new Date(utcns(1969, 12, 28, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 28, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Day), period: -2, testTime: new Date(utcns(1969, 12, 27, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 24, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Day), period: -2, testTime: new Date(utcns(1969, 12, 24, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 24, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Day), period: -3, testTime: new Date(utcns(1969, 12, 23, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 20, 0, 0, 0, 0))},

  // 1 week - epoch week does not begin on 1970-01-01, it begins on 1969-12-29
  {interval: new Interval(1, Span.Week), period: 0, testTime: new Date(utcns(1969, 12, 29, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 29, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Week), period: 0, testTime: new Date(utcns(1970, 1, 4, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 29, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Week), period: 1, testTime: new Date(utcns(1970, 1, 5, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 5, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Week), period: 1, testTime: new Date(utcns(1970, 1, 11, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 5, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Week), period: 2, testTime: new Date(utcns(1970, 1, 12, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 12, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Week), period: -1, testTime: new Date(utcns(1969, 12, 28, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 22, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Week), period: -1, testTime: new Date(utcns(1969, 12, 22, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 22, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Week), period: -2, testTime: new Date(utcns(1969, 12, 21, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 15, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Week), period: -2, testTime: new Date(utcns(1969, 12, 15, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 15, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Week), period: -3, testTime: new Date(utcns(1969, 12, 14, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 8, 0, 0, 0, 0))},

  // 3 weeks - epoch week does not begin on 1970-01-01, it begins on 1969-12-29
  {interval: new Interval(3 , Span.Week) , period: 0  , testTime: new Date(utcns(1969 , 12 , 29 , 0  , 0  , 0  , 0))         , periodTime: new Date(utcns(1969 , 12 , 29 , 0 , 0 , 0 , 0))} ,
  {interval: new Interval(3 , Span.Week) , period: 0  , testTime: new Date(utcns(1970 , 1  , 18 , 23 , 59 , 59 , 999999999)) , periodTime: new Date(utcns(1969 , 12 , 29 , 0 , 0 , 0 , 0))} ,
  {interval: new Interval(3 , Span.Week) , period: 1  , testTime: new Date(utcns(1970 , 1  , 19 , 0  , 0  , 0  , 0))         , periodTime: new Date(utcns(1970 , 1  , 19 , 0 , 0 , 0 , 0))} ,
  {interval: new Interval(3 , Span.Week) , period: 1  , testTime: new Date(utcns(1970 , 2  , 8  , 23 , 59 , 59 , 999999999)) , periodTime: new Date(utcns(1970 , 1  , 19 , 0 , 0 , 0 , 0))} ,
  {interval: new Interval(3 , Span.Week) , period: 2  , testTime: new Date(utcns(1970 , 2  , 9  , 0  , 0  , 0  , 0))         , periodTime: new Date(utcns(1970 , 2  , 9  , 0 , 0 , 0 , 0))} ,
  {interval: new Interval(3 , Span.Week) , period: -1 , testTime: new Date(utcns(1969 , 12 , 28 , 23 , 59 , 59 , 999999999)) , periodTime: new Date(utcns(1969 , 12 , 8  , 0 , 0 , 0 , 0))} ,
  {interval: new Interval(3 , Span.Week) , period: -1 , testTime: new Date(utcns(1969 , 12 , 8  , 0  , 0  , 0  , 0))         , periodTime: new Date(utcns(1969 , 12 , 8  , 0 , 0 , 0 , 0))} ,
  {interval: new Interval(3 , Span.Week) , period: -2 , testTime: new Date(utcns(1969 , 12 , 7  , 23 , 59 , 59 , 999999999)) , periodTime: new Date(utcns(1969 , 11 , 17 , 0 , 0 , 0 , 0))} ,
  {interval: new Interval(3 , Span.Week) , period: -2 , testTime: new Date(utcns(1969 , 11 , 17 , 0  , 0  , 0  , 0))         , periodTime: new Date(utcns(1969 , 11 , 17 , 0 , 0 , 0 , 0))} ,
  {interval: new Interval(3 , Span.Week) , period: -3 , testTime: new Date(utcns(1969 , 11 , 16 , 23 , 59 , 59 , 999999999)) , periodTime: new Date(utcns(1969 , 10 , 27 , 0 , 0 , 0 , 0))} ,

  // 4 weeks - epoch week does not begin on 1970-01-01, it begins on 1969-12-29
  {interval: new Interval(4, Span.Week), period: 0, testTime: new Date(utcns(1969, 12, 29, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 29, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Week), period: 0, testTime: new Date(utcns(1970, 1, 25, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 29, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Week), period: 1, testTime: new Date(utcns(1970, 1, 26, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 26, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Week), period: 1, testTime: new Date(utcns(1970, 2, 22, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 26, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Week), period: 2, testTime: new Date(utcns(1970, 2, 23, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 2, 23, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Week), period: -1, testTime: new Date(utcns(1969, 12, 28, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Week), period: -1, testTime: new Date(utcns(1969, 12, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 12, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Week), period: -2, testTime: new Date(utcns(1969, 11, 30, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 11, 3, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Week), period: -2, testTime: new Date(utcns(1969, 11, 26, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 11, 3, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Week), period: -2, testTime: new Date(utcns(1969, 11, 3, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 11, 3, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Week), period: -3, testTime: new Date(utcns(1969, 11, 2, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 10, 6, 0, 0, 0, 0))},

  // 1 month
  {interval: new Interval(1, Span.Month), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Month), period: 0, testTime: new Date(utcns(1970, 1, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Month), period: 1, testTime: new Date(utcns(1970, 2, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 2, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Month), period: 1, testTime: new Date(utcns(1970, 2, 28, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 2, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Month), period: 2, testTime: new Date(utcns(1970, 3, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 3, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Month), period: 2, testTime: new Date(utcns(1970, 3, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 3, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Month), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Month), period: -1, testTime: new Date(utcns(1969, 12, 1, 0, 0, 59, 999999999)), periodTime: new Date(utcns(1969, 12, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Month), period: -2, testTime: new Date(utcns(1969, 11, 30, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 11, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Month), period: -2, testTime: new Date(utcns(1969, 11, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 11, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Month), period: -3, testTime: new Date(utcns(1969, 10, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 10, 1, 0, 0, 0, 0))},

  // 4 months
  {interval: new Interval(4, Span.Month), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Month), period: 0, testTime: new Date(utcns(1970, 4, 30, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Month), period: 1, testTime: new Date(utcns(1970, 5, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 5, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Month), period: 1, testTime: new Date(utcns(1970, 8, 28, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 5, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Month), period: 2, testTime: new Date(utcns(1970, 9, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 9, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Month), period: 2, testTime: new Date(utcns(1970, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 9, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Month), period: 3, testTime: new Date(utcns(1971, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1971, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Month), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 9, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Month), period: -1, testTime: new Date(utcns(1969, 9, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 9, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Month), period: -2, testTime: new Date(utcns(1969, 8, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 5, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Month), period: -2, testTime: new Date(utcns(1969, 5, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 5, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Month), period: -3, testTime: new Date(utcns(1969, 4, 30, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Month), period: -3, testTime: new Date(utcns(1969, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Month), period: -4, testTime: new Date(utcns(1968, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1968, 9, 1, 0, 0, 0, 0))},

  // 1 year
  {interval: new Interval(1, Span.Year), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Year), period: 0, testTime: new Date(utcns(1970, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Year), period: 1, testTime: new Date(utcns(1971, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1971, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Year), period: 1, testTime: new Date(utcns(1971, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1971, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Year), period: 2, testTime: new Date(utcns(1972, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1972, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Year), period: 2, testTime: new Date(utcns(1972, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1972, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Year), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1969, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Year), period: -1, testTime: new Date(utcns(1969, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1969, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Year), period: -2, testTime: new Date(utcns(1968, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1968, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Year), period: -2, testTime: new Date(utcns(1968, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1968, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(1, Span.Year), period: -3, testTime: new Date(utcns(1967, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1967, 1, 1, 0, 0, 0, 0))},

  // 4 years
  {interval: new Interval(4, Span.Year), period: 0, testTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Year), period: 0, testTime: new Date(utcns(1973, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1970, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Year), period: 1, testTime: new Date(utcns(1974, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1974, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Year), period: 1, testTime: new Date(utcns(1977, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1974, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Year), period: 2, testTime: new Date(utcns(1978, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1978, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Year), period: 2, testTime: new Date(utcns(1981, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1978, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Year), period: -1, testTime: new Date(utcns(1969, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1966, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Year), period: -1, testTime: new Date(utcns(1966, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1966, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Year), period: -2, testTime: new Date(utcns(1965, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1962, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Year), period: -2, testTime: new Date(utcns(1962, 1, 1, 0, 0, 0, 0)), periodTime: new Date(utcns(1962, 1, 1, 0, 0, 0, 0))},
  {interval: new Interval(4, Span.Year), period: -3, testTime: new Date(utcns(1961, 12, 31, 23, 59, 59, 999999999)), periodTime: new Date(utcns(1958, 1, 1, 0, 0, 0, 0))},
];

test.each(
  periodCases.map((v) => [
    `period.${v.interval.toString()}.${v.period}.${v.testTime.toISOString()}=>${v.periodTime.toISOString()}`, 
    ...(<any>Object).values(v)
  ])
)('%s', (name, intvl, period, testTime, periodTime) => {
  const p = intvl.period(testTime)
  expect(p).toEqual(period);

  const pt = intvl.time(p);
  expect(pt).toEqual(periodTime);
  
  const b = intvl.period(periodTime)
  expect(b).toEqual(period);
  
  const bt = intvl.time(b);
  expect(bt).toEqual(periodTime);
});


test.each([
  [new Interval(1, Span.Minute), new Interval(1, Span.Minute), false],
  [new Interval(1, Span.Minute), new Interval(2, Span.Minute), true],
  [new Interval(1, Span.Minute), new Interval(60, Span.Minute), true],
  [new Interval(1, Span.Minute), new Interval(1, Span.Hour), true],
  [new Interval(1, Span.Minute), new Interval(2, Span.Hour), true],
  [new Interval(1, Span.Minute), new Interval(1, Span.Day), true],
  [new Interval(1, Span.Minute), new Interval(1, Span.Week), true],
  [new Interval(1, Span.Minute), new Interval(1, Span.Month), true],
  [new Interval(1, Span.Minute), new Interval(1, Span.Year), true],

  [new Interval(1, Span.Hour), new Interval(2, Span.Hour), true],
  [new Interval(1, Span.Hour), new Interval(24, Span.Hour), true],
  [new Interval(1, Span.Hour), new Interval(48, Span.Hour), true],
  [new Interval(1, Span.Hour), new Interval(1, Span.Day), true],
  [new Interval(1, Span.Hour), new Interval(2, Span.Day), true],
  [new Interval(1, Span.Hour), new Interval(1, Span.Week), true],
  [new Interval(1, Span.Hour), new Interval(2, Span.Week), true],
  [new Interval(1, Span.Hour), new Interval(1, Span.Month), true],
  [new Interval(1, Span.Hour), new Interval(1, Span.Year), true],
  [new Interval(2, Span.Hour), new Interval(4, Span.Hour), true],
  [new Interval(4, Span.Hour), new Interval(1, Span.Day), true],
  [new Interval(12, Span.Hour), new Interval(1, Span.Week), true],
  [new Interval(12, Span.Hour), new Interval(3, Span.Week), true],
  [new Interval(1, Span.Hour), new Interval(1, Span.Minute), false],
  [new Interval(1, Span.Hour), new Interval(60, Span.Minute), false],
  [new Interval(1, Span.Hour), new Interval(120, Span.Minute), true],
  [new Interval(1, Span.Hour), new Interval(119, Span.Minute), false],
  [new Interval(1, Span.Hour), new Interval(121, Span.Minute), false],

  [new Interval(1, Span.Day), new Interval(1, Span.Hour), false],
  [new Interval(1, Span.Day), new Interval(1, Span.Day), false],
  [new Interval(1, Span.Day), new Interval(1, Span.Week), true],
  [new Interval(2, Span.Day), new Interval(1, Span.Week), false],
  [new Interval(7, Span.Day), new Interval(2, Span.Week), false], // No way to specify how these line up, so it makes sense that you can't convert.

  [new Interval(1, Span.Week), new Interval(1, Span.Minute), false],
  [new Interval(1, Span.Week), new Interval(1, Span.Hour), false],
  [new Interval(1, Span.Week), new Interval(1, Span.Day), false],
  [new Interval(1, Span.Week), new Interval(14, Span.Day), false],
  [new Interval(1, Span.Week), new Interval(1, Span.Week), false],
  [new Interval(1, Span.Week), new Interval(2, Span.Week), true],
  [new Interval(1, Span.Week), new Interval(1, Span.Month), false],
  [new Interval(1, Span.Week), new Interval(1, Span.Year), false],

  [new Interval(1, Span.Month), new Interval(1, Span.Minute), false],
  [new Interval(1, Span.Month), new Interval(1, Span.Day), false],
  [new Interval(1, Span.Month), new Interval(1, Span.Week), false],
  [new Interval(1, Span.Month), new Interval(1, Span.Month), false],
  [new Interval(1, Span.Month), new Interval(2, Span.Month), true],
  [new Interval(1, Span.Month), new Interval(1, Span.Year), true],
  [new Interval(2, Span.Month), new Interval(3, Span.Month), false],
  [new Interval(2, Span.Month), new Interval(4, Span.Month), true],
  [new Interval(2, Span.Month), new Interval(1, Span.Year), true],
])('%s.%s.%s', (i: Interval, to: Interval, result: boolean) => {
  expect(i.canCombine(to)).toEqual(result);
});

test.each([
  [2561, new Interval(1, Span.Minute)],
  [2817, new Interval(1, Span.Hour)],
  [3073, new Interval(1, Span.Day)],
])('%d==%s', (input: number, out: Interval) => {
  expect(Interval.decode(input).span).toEqual(out.span);
  expect(Interval.decode(input).qty).toEqual(out.qty);
  expect(Interval.decode(input).encode()).toEqual(input);
});

