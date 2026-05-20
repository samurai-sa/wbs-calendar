const assert = require("node:assert/strict");
const {
  calculateSchedule,
  formatYmd,
  getJapaneseHolidays,
  parseDateInput,
} = require("../app.js");

const weekdays = new Set([1, 2, 3, 4, 5]);

function schedule(overrides) {
  return calculateSchedule({
    startDate: parseDateInput("2026-05-20"),
    effortDays: 10,
    allowedWeekdays: weekdays,
    countStartDate: true,
    excludePublicHolidays: true,
    extraHolidaySet: new Set(),
    ...overrides,
  });
}

{
  const holidays = getJapaneseHolidays(2026);
  assert.equal(holidays.get("2026-05-06"), "振替休日");
  assert.equal(holidays.get("2026-07-20"), "海の日");
  assert.equal(holidays.get("2026-08-11"), "山の日");
  assert.equal(holidays.get("2026-09-22"), "国民の休日");
  assert.equal(holidays.get("2026-09-23"), "秋分の日");
}

{
  const holidays = getJapaneseHolidays(2027);
  assert.equal(holidays.get("2027-03-21"), "春分の日");
  assert.equal(holidays.get("2027-03-22"), "振替休日");
  assert.equal(holidays.get("2027-07-19"), "海の日");
}

{
  const result = schedule();
  assert.equal(formatYmd(result.finishDate), "2026-06-02");
  assert.equal(result.workingDays, 10);
  assert.equal(result.calendarDays, 14);
  assert.equal(result.counts.closed, 4);
}

{
  const result = schedule({
    startDate: parseDateInput("2026-09-18"),
    effortDays: 3,
  });
  assert.equal(formatYmd(result.finishDate), "2026-09-25");
  assert.equal(result.workingDays, 3);
  assert.equal(result.counts.closed, 2);
  assert.equal(result.counts.holiday, 3);
}

{
  const result = schedule({
    effortDays: 1.25,
  });
  assert.equal(formatYmd(result.finishDate), "2026-05-21");
  assert.equal(result.workingDays, 2);
  assert.equal(result.lastDayEffort, 0.25);
}

{
  const result = schedule({
    effortDays: 1,
    extraHolidaySet: new Set(["2026-05-20"]),
  });
  assert.equal(formatYmd(result.finishDate), "2026-05-21");
  assert.equal(result.counts.extra, 1);
}

{
  const result = schedule({
    tasks: [
      { name: "A", effortDays: 2 },
      { name: "B", effortDays: 1 },
    ],
  });
  assert.equal(formatYmd(result.taskResults[0].firstWorkDate), "2026-05-20");
  assert.equal(formatYmd(result.taskResults[0].finishDate), "2026-05-21");
  assert.equal(formatYmd(result.taskResults[1].firstWorkDate), "2026-05-22");
  assert.equal(formatYmd(result.taskResults[1].finishDate), "2026-05-22");
  assert.equal(formatYmd(result.finishDate), "2026-05-22");
  assert.equal(result.effortDays, 3);
  assert.equal(result.workingDays, 3);
}

{
  const result = schedule({
    startDate: parseDateInput("2026-05-22"),
    tasks: [
      { name: "A", effortDays: 1 },
      { name: "B", effortDays: 1 },
    ],
  });
  assert.equal(formatYmd(result.taskResults[0].finishDate), "2026-05-22");
  assert.equal(formatYmd(result.taskResults[1].firstWorkDate), "2026-05-25");
  assert.equal(formatYmd(result.finishDate), "2026-05-25");
  assert.equal(result.counts.closed, 2);
}

{
  const result = schedule({
    tasks: [
      { name: "A", effortDays: 0.5 },
      { name: "B", effortDays: 1 },
    ],
  });
  assert.equal(formatYmd(result.taskResults[0].finishDate), "2026-05-20");
  assert.equal(formatYmd(result.taskResults[1].firstWorkDate), "2026-05-21");
  assert.equal(result.lastDayEffort, 1);
}

console.log("calendar tests passed");
