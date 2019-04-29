// Span identifies the unit of the Interval.
export enum Span {
  Second  = 9,
  Minute  = 10,
  Hour    = 11,
  Day     = 12,
  Week    = 13,
  Month   = 14,
  Year    = 15,
}

export const spans: Span[] = [
  Span.Second,
  Span.Minute,
  Span.Hour,
  Span.Day,
  Span.Week,
  Span.Month,
  Span.Year,
];

export function formatSpan(span: Span): string {
  if (spanStrings[span] === undefined) {
    throw new RangeError("invalid span "+span);
  }
  return spanStrings[span];
}

export function epoch(): Date { return new Date(0); }

const _epoch = new Date(0);

// The Epoch doesn't fall at the start of the week. We calculate weeks from
// the start of the epoch's week.
export const firstDayOfEpochWeek = startOfWeek(new Date(0));

// intervalRefTime is used for sorting. It is an imperfect mechanism to sort
// intervals that may have different Qtys, i.e. 25 hours should come after 1
// day. It can not account for leap-seconds or leap-years.
let intervalRefTime = new Date(Date.UTC(2018, 0, 1, 12, 0, 0));

// IntervalData is included to play nicely with React/Redux-style apps that
// can't cope with classes.
export interface IntervalData {
  readonly qty: number;
  readonly span: Span;
}

export class Interval {
  private _qty: number;
  private _span: Span;
  private _str: string = undefined;

  constructor(data: IntervalData);
  constructor(qty: number, span: Span);

  constructor(qtyOrData: number | IntervalData, span?: Span) {
    let qty: number;
    if (typeof qtyOrData === 'object') {
      qty = qtyOrData.qty;
      span = qtyOrData.span;
    } else {
      qty = qtyOrData;
    }
    
    this._qty = qty;
    this._span = span;
    if (spanStrings[span] == undefined) {
      throw new RangeError("invalid span "+span);
    }
    if (qty <= 0 || qty > 255) {
      throw new RangeError("qty must be > 0 and <= 255");
    }
  }

  // Create an Interval from a serialized numeric representation.
  public static decode(v: number): Interval {
    return new Interval(v & 0xFF, v >> 8);
  }

  // Encode the Interval to a numeric representation. The encoded
  // representation has no semantic meaning and should not be used directly.
  public encode(): number {
    return this._span << 8 | this._qty;
  }

  public get qty(): number { return this._qty; }
  public get span(): Span  { return this._span; }

  public get data(): IntervalData {
    return { span: this._span, qty: this._qty };
  }

  public toString = (): string => { 
    if (this._str === undefined) {
      this._str = this._qty.toString() + spanStrings[this._span];
    }
    return this._str;
  }

  public next(d: Date): Date  { return this.time(this.period(d)+1); }
  public prev(d: Date): Date  { return this.time(this.period(d)-1); }
  public start(d: Date): Date { return this.time(this.period(d)); }
  public end(d: Date): Date   { return this.time(this.period(d)+1); }

  public truncate(d: Date): Date { return this.time(this.period(d)); }
  public range(from: Date, to: Date): {from: number, to: number} { 
    return { from: this.period(from), to: this.period(to)+1 };
  }

  // Period identifies the number of Intervals that have passed since the
  // Unix Epoch. It represents a monotonically increasing interval of time;
  // it has no meaning without an Interval.
  //
  // The "0" period always represents the period that opens on the Unix epoch,
  // or if it spans the Unix epoch, the period that opens just before it.
  public period(d: Date): number {
    let qty = this._qty;
    let out: number;

    switch (this._span) {
    case Span.Second:
      return fixedPeriod(d.getTime() / 1000, qty);
    case Span.Minute:
      return fixedPeriod(d.getTime() / 1000 / 60, qty);
    case Span.Hour:
      return fixedPeriod(d.getTime() / 1000 / 60 / 60, qty);
    case Span.Day:
      return fixedPeriod(differenceInDays(d, _epoch), qty);

    case Span.Week:
      const ts = startOfWeek(d);
      const diff = differenceInDays(ts, firstDayOfEpochWeek);

      let weeks = Math.floor(diff / 7);

      let gap: number;
      if (diff >= 0) {
        gap = weeks - (weeks % qty);
      } else {
        weeks++;
        gap = weeks - qty - (weeks % qty);
      }
      return Math.floor(gap / qty);

    case Span.Month:
      return fixedPeriod(((d.getUTCFullYear() - 1970) * 12) + d.getUTCMonth(), qty);

    case Span.Year:
      return fixedPeriod(d.getUTCFullYear() - 1970, qty);
    }
    throw new Error();
  }

  // Time returns the date for the passed period based on the interval.
  // If the period was 3, and the Span was Days, the returned time
  // will be "1970-01-04T00:00Z".
  public time(period: number): Date {
    const qty = this._qty;
    switch (this._span) {
    case Span.Second:
      return new Date(period * qty * 1000);
    case Span.Minute:
      return new Date(period * 60 * qty * 1000);
    case Span.Hour:
      return new Date(period * 3600 * qty * 1000);
    case Span.Day:
      return new Date(period * 86400 * qty * 1000);

    case Span.Week:
      const d = addDays(firstDayOfEpochWeek, period * qty * 7)
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));

    case Span.Month:
      const out = period * qty;
      const ms = out;
    
      let oy, om: number;
      if (out >= 0) {
        oy = Math.trunc(ms / 12);
        om = (ms % 12) + 1;
      } else {
        oy = Math.trunc(ms / 12) - 1;
        om = 12 - (-ms % 12) + 1;
      }
      return new Date(Date.UTC(oy+1970, om-1, 1, 0, 0, 0, 0));
    
    case Span.Year:
      return new Date(Date.UTC((qty*period)+1970, 0, 1));

    default:
      throw new Error();
    }
  }

  // Less returns a best-effort guess as to whether one interval is smaller than
  // another. It is not 100% guaranteed to be accurate as it uses a reference
  // time.
  public less(than: Interval): boolean {
    return this.lessAt(than, intervalRefTime);
  }

  // LessAt returns whether one interval is less than another at the supplied
  // reference time.
  public lessAt(than: Interval, at: Date): boolean {
    const thisStart = this.start(at);
    const thanStart = than.start(at);

    const thisNext = this.next(thisStart);
    const thanNext = than.next(thanStart);

    return (thisNext.getTime() - thisStart.getTime()) < (thanNext.getTime() - thanStart.getTime());
  }

  // CanCombine reports whether this interval represents a clean subdivision of
  // the 'to' interval. For example, 4 hours can combine cleanly to 1 day, but 7
  // hours cannot.
  public canCombine(to: Interval): boolean {
    if (!this.less(to)) {
      return false;
    }

    const fromSpan = this.span;
    const toSpan = to.span;

    if (fromSpan == Span.Week && toSpan > Span.Week) {
      return false;
    } else if (toSpan == Span.Week && fromSpan > Span.Week) {
      return false;
    }

    const startOfPeriod = this.time(0);
    const startOfToPeriod = to.time(0);

    // Some periods have a start time for the 0-period that isn't exactly
    // the epoch.
    const offset = differenceInMilliseconds(startOfToPeriod, startOfPeriod);

    const endOfToPeriod = addMilliseconds(to.time(1), offset).getTime();
    for (let i = 0;; i++) {
      const inTime = this.time(i).getTime();
      if (inTime == endOfToPeriod) {
        return true;
      } else if (inTime > endOfToPeriod) {
        return false;
      }
    }
  }


  public ensureValid() {
    if (this.qty > MaxSpan[this.span]) {
      throw new Error(`qty too large for seconds: expected <= ${MaxSpan[this.span]}, found ${this.qty}`);
    }
  }
}

export function parse(intvl: string): Interval {
  intvl = intvl.trim();
  const match = intvl.match(/^(\d+)/);
  const num = match[0];
  const rest = intvl.substr(num.length);
  const period = parseInt(num);
  const span = spanInput[rest];
  if (span == undefined) {
    throw new Error(intvl);
  }
  return new Interval(period, span);
}

const spanStrings: {[x in Span]: string} = {
  9: "sec",
  10: "min",
  11: "hr",
  12: "d",
  13: "wk",
  14: "mo",
  15: "yr",
};

// These are somewhat arbitrary. They must never be > 255. Limits were set
// before Less and LessAt were written and relate to trying to limit overlapping
// quantity sizes. Realistically, we can probably just say 255 across the board.
export const MaxSpan: {[x in Span]: number} = {
  9: 60,
  10: 90,
  11: 48,
  12: 120,
  13: 52,
  14: 24,
  15: 255,
};

const spanInputStrings: {[x in Span]: string[]} = {
	9:  ["s", "sec", "secs", "second", "seconds"],
  10: ["min", "mins", "minute", "minutes"],
  11: ["h", "hr", "hrs", "hour", "hours"],
  12: ["d", "ds", "day", "days"],
  13: ["w", "ws", "wk", "wks", "weeks"],
  14: ["mo", "mos", "month", "months"],
  15: ["y", "yr", "ys", "yrs", "year", "years"],
};

const spanInput: {[key: string]: Span} = {};

for (const span in spanInputStrings) {
  spanInputStrings[span].map((v) => spanInput[v] = parseInt(span) as Span);
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime());
}

function fixedPeriod(d: number, qty: number): number {
  // d will contain the number of individual spans in the time
  // qty is the number of those spans contained in an interval.
  //
  // it answers the question "find me the 4-minute period, starting
  // from the epoch, this time represents", where 'time' ('d') is
  // the number of 1-minute periods since the epoch.

  let out = d;
  if (out >= 0) {
    out = (out - (out % qty)) / qty;
  } else {
    let gap = out % qty;
    if (gap != 0) {
      out -= qty + gap;
    }
    out = out / qty;
  }

  return out;
}

// {{{
// Vendored date functions. date-fns, which codifies a bunch of well-known
// stack overflow techniques for dealing with Javascript's horrendous
// Date type, doesn't handle our UTC-centric view of the world very well. It
// has a nice literate API, so these are re-implementations of the functions we
// need from there but without the bugs our use case flushes out.

function isBefore(d1: Date, d2: Date) {
  return d1.getTime() < d2.getTime();
}

function addMilliseconds(d: Date, ms: number): Date {
  return new Date(d.getTime() + ms);
}

function addDays(d: Date, days: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days));
}

function differenceInMilliseconds(d1: Date, d2: Date): number {
  return d1.getTime() - d2.getTime();
}

function differenceInDays(d1: Date, d2: Date): number {
  var startOfDayLeft = startOfDay(d1);
  var startOfDayRight = startOfDay(d2);

  var timestampLeft = startOfDayLeft.getTime();
  var timestampRight = startOfDayRight.getTime();

  // Round the number of days to the nearest integer
  // because the number of milliseconds in a day is not constant
  // (e.g. it's different in the day of the daylight saving time clock shift)
  return Math.round((timestampLeft - timestampRight) / 86400000);
}

function startOfDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function startOfWeek(d: Date): Date {
  // Weeks start on Monday in our view of the world
  var weekStartsOn = 1;

  var day = d.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;

  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
}

// }}}
