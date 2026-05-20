(function (root) {
  "use strict";

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
  const EPSILON = 0.000001;

  function createUtcDate(year, month, day) {
    return new Date(Date.UTC(year, month - 1, day));
  }

  function cloneUtcDate(date) {
    return createUtcDate(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
    );
  }

  function parseDateInput(value) {
    if (typeof value !== "string") return null;
    const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = createUtcDate(year, month, day);

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return date;
  }

  function formatYmd(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDays(date, amount) {
    const next = cloneUtcDate(date);
    next.setUTCDate(next.getUTCDate() + amount);
    return next;
  }

  function daysBetweenInclusive(start, end) {
    return Math.floor((cloneUtcDate(end) - cloneUtcDate(start)) / MS_PER_DAY) + 1;
  }

  function getDaysInMonth(year, month) {
    return createUtcDate(year, month + 1, 0).getUTCDate();
  }

  function getNthMonday(year, month, nth) {
    const first = createUtcDate(year, month, 1);
    const offset = (8 - first.getUTCDay()) % 7;
    return 1 + offset + (nth - 1) * 7;
  }

  function vernalEquinoxDay(year) {
    if (year <= 1979) {
      return Math.floor(
        20.8357 + 0.242194 * (year - 1980) - Math.floor((year - 1983) / 4),
      );
    }
    if (year <= 2099) {
      return Math.floor(
        20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4),
      );
    }
    return Math.floor(
      21.851 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4),
    );
  }

  function autumnalEquinoxDay(year) {
    if (year <= 1979) {
      return Math.floor(
        23.2588 + 0.242194 * (year - 1980) - Math.floor((year - 1983) / 4),
      );
    }
    if (year <= 2099) {
      return Math.floor(
        23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4),
      );
    }
    return Math.floor(
      24.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4),
    );
  }

  function addHoliday(map, year, month, day, name) {
    map.set(formatYmd(createUtcDate(year, month, day)), name);
  }

  function getBaseJapaneseHolidays(year) {
    const holidays = new Map();

    if (year < 1948 || year > 2150) return holidays;

    addHoliday(holidays, year, 1, 1, "元日");

    if (year >= 2000) {
      addHoliday(holidays, year, 1, getNthMonday(year, 1, 2), "成人の日");
    } else if (year >= 1949) {
      addHoliday(holidays, year, 1, 15, "成人の日");
    }

    if (year >= 1967) addHoliday(holidays, year, 2, 11, "建国記念の日");
    if (year >= 2020) addHoliday(holidays, year, 2, 23, "天皇誕生日");
    if (year >= 1949) addHoliday(holidays, year, 3, vernalEquinoxDay(year), "春分の日");

    if (year >= 2007) {
      addHoliday(holidays, year, 4, 29, "昭和の日");
    } else if (year >= 1989) {
      addHoliday(holidays, year, 4, 29, "みどりの日");
    } else if (year >= 1949) {
      addHoliday(holidays, year, 4, 29, "天皇誕生日");
    }

    addHoliday(holidays, year, 5, 3, "憲法記念日");
    if (year >= 2007) addHoliday(holidays, year, 5, 4, "みどりの日");
    addHoliday(holidays, year, 5, 5, "こどもの日");

    if (year === 2019) {
      addHoliday(holidays, year, 5, 1, "即位の日");
      addHoliday(holidays, year, 10, 22, "即位礼正殿の儀");
    }

    if (year === 2020) {
      addHoliday(holidays, year, 7, 23, "海の日");
      addHoliday(holidays, year, 7, 24, "スポーツの日");
      addHoliday(holidays, year, 8, 10, "山の日");
    } else if (year === 2021) {
      addHoliday(holidays, year, 7, 22, "海の日");
      addHoliday(holidays, year, 7, 23, "スポーツの日");
      addHoliday(holidays, year, 8, 8, "山の日");
    } else {
      if (year >= 2003) {
        addHoliday(holidays, year, 7, getNthMonday(year, 7, 3), "海の日");
      } else if (year >= 1996) {
        addHoliday(holidays, year, 7, 20, "海の日");
      }
      if (year >= 2016) addHoliday(holidays, year, 8, 11, "山の日");
    }

    if (year >= 2003) {
      addHoliday(holidays, year, 9, getNthMonday(year, 9, 3), "敬老の日");
    } else if (year >= 1966) {
      addHoliday(holidays, year, 9, 15, "敬老の日");
    }

    addHoliday(holidays, year, 9, autumnalEquinoxDay(year), "秋分の日");

    if (year !== 2020 && year !== 2021) {
      if (year >= 2000) {
        const name = year >= 2020 ? "スポーツの日" : "体育の日";
        addHoliday(holidays, year, 10, getNthMonday(year, 10, 2), name);
      } else if (year >= 1966) {
        addHoliday(holidays, year, 10, 10, "体育の日");
      }
    }

    addHoliday(holidays, year, 11, 3, "文化の日");
    addHoliday(holidays, year, 11, 23, "勤労感謝の日");

    if (year >= 1989 && year <= 2018) {
      addHoliday(holidays, year, 12, 23, "天皇誕生日");
    }

    return holidays;
  }

  function addCitizensHolidays(year, baseHolidays) {
    const holidays = new Map(baseHolidays);

    if (year < 1985) return holidays;

    for (let month = 1; month <= 12; month += 1) {
      const daysInMonth = getDaysInMonth(year, month);
      for (let day = 1; day <= daysInMonth; day += 1) {
        const date = createUtcDate(year, month, day);
        const key = formatYmd(date);
        if (holidays.has(key)) continue;

        const previousKey = formatYmd(addDays(date, -1));
        const nextKey = formatYmd(addDays(date, 1));

        if (baseHolidays.has(previousKey) && baseHolidays.has(nextKey)) {
          holidays.set(key, "国民の休日");
        }
      }
    }

    return holidays;
  }

  function addSubstituteHolidays(year, holidays) {
    const resolved = new Map(holidays);

    if (year < 1973) return resolved;

    const holidayEntries = Array.from(holidays.keys()).sort();

    for (const key of holidayEntries) {
      const date = parseDateInput(key);
      if (!date || date.getUTCDay() !== 0) continue;

      let substitute = addDays(date, 1);
      while (resolved.has(formatYmd(substitute))) {
        substitute = addDays(substitute, 1);
      }
      resolved.set(formatYmd(substitute), "振替休日");
    }

    return resolved;
  }

  function getJapaneseHolidays(year) {
    const base = getBaseJapaneseHolidays(year);
    const withCitizensHolidays = addCitizensHolidays(year, base);
    return addSubstituteHolidays(year, withCitizensHolidays);
  }

  const holidayCache = new Map();

  function getHolidayName(date) {
    const year = date.getUTCFullYear();
    if (!holidayCache.has(year)) {
      holidayCache.set(year, getJapaneseHolidays(year));
    }
    return holidayCache.get(year).get(formatYmd(date)) || "";
  }

  function parseExtraHolidays(value) {
    const dates = new Set();
    const invalid = [];
    const tokens = value
      .split(/[\s,;、，]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    for (const token of tokens) {
      const date = parseDateInput(token);
      if (!date) {
        invalid.push(token);
        continue;
      }
      dates.add(formatYmd(date));
    }

    return { dates, invalid };
  }

  function classifyDay(date, settings) {
    const key = formatYmd(date);
    const weekday = date.getUTCDay();
    const holidayName = settings.excludePublicHolidays ? getHolidayName(date) : "";
    const isExtraHoliday = settings.extraHolidaySet.has(key);

    if (!settings.allowedWeekdays.has(weekday)) {
      return { type: "closed", label: "非稼働日" };
    }

    if (isExtraHoliday) {
      return { type: "extra", label: "会社休日" };
    }

    if (holidayName) {
      return { type: "holiday", label: holidayName };
    }

    return { type: "work", label: "稼働日" };
  }

  function calculateSchedule(settings) {
    if (!settings.startDate) {
      throw new Error("開始日を入力してください。");
    }
    if (!Number.isFinite(settings.effortDays) || settings.effortDays <= 0) {
      throw new Error("工数は0より大きい人日で入力してください。");
    }
    if (settings.allowedWeekdays.size === 0) {
      throw new Error("稼働曜日を1つ以上選択してください。");
    }

    let remainingDays = settings.effortDays;
    let cursor = settings.countStartDate
      ? cloneUtcDate(settings.startDate)
      : addDays(settings.startDate, 1);
    let loopGuard = 0;
    let firstWorkDate = null;
    let finishDate = null;
    let lastDayEffort = 0;
    const workEntries = [];
    const excludedDays = [];
    const counts = {
      closed: 0,
      holiday: 0,
      extra: 0,
    };

    while (remainingDays > EPSILON) {
      loopGuard += 1;
      if (loopGuard > 50000) {
        throw new Error("計算範囲が大きすぎます。入力値を見直してください。");
      }

      const classification = classifyDay(cursor, settings);

      if (classification.type === "work") {
        const allocatedEffort = Math.min(1, remainingDays);
        const entry = {
          date: cloneUtcDate(cursor),
          key: formatYmd(cursor),
          effort: allocatedEffort,
        };
        workEntries.push(entry);
        firstWorkDate = firstWorkDate || cloneUtcDate(cursor);
        finishDate = cloneUtcDate(cursor);
        lastDayEffort = allocatedEffort;
        remainingDays -= allocatedEffort;
      } else {
        counts[classification.type] += 1;
        excludedDays.push({
          date: cloneUtcDate(cursor),
          key: formatYmd(cursor),
          type: classification.type,
          label: classification.label,
        });
      }

      cursor = addDays(cursor, 1);
    }

    return {
      startDate: cloneUtcDate(settings.startDate),
      firstWorkDate,
      finishDate,
      workEntries,
      excludedDays,
      counts,
      effortDays: settings.effortDays,
      workingDays: workEntries.length,
      calendarDays: daysBetweenInclusive(settings.startDate, finishDate),
      lastDayEffort,
    };
  }

  function formatJapaneseDate(date, includeWeekday = true) {
    if (!date) return "-";
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: includeWeekday ? "short" : undefined,
      timeZone: "UTC",
    });
    return formatter.format(date);
  }

  function formatEffort(value) {
    return `${new Intl.NumberFormat("ja-JP", {
      maximumFractionDigits: 2,
    }).format(value)}人日`;
  }

  function formatDays(value) {
    return `${new Intl.NumberFormat("ja-JP").format(value)}日`;
  }

  function todayInputValue() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function readSettings() {
    const startDate = parseDateInput(document.querySelector("#startDate").value);
    const effortDays = Number(document.querySelector("#effortDays").value);
    const allowedWeekdays = new Set(
      Array.from(document.querySelectorAll('input[name="weekday"]:checked')).map((input) =>
        Number(input.value),
      ),
    );
    const { dates: extraHolidaySet, invalid } = parseExtraHolidays(
      document.querySelector("#extraHolidays").value,
    );

    if (invalid.length > 0) {
      throw new Error(`会社休日の日付形式を確認してください: ${invalid.join(", ")}`);
    }

    return {
      startDate,
      effortDays,
      allowedWeekdays,
      countStartDate: document.querySelector("#countStartDate").checked,
      excludePublicHolidays: document.querySelector("#excludePublicHolidays").checked,
      extraHolidaySet,
    };
  }

  function renderMetrics(result) {
    document.querySelector("#finishDate").textContent = formatJapaneseDate(result.finishDate);
    document.querySelector("#workingDays").textContent = formatDays(result.workingDays);
    document.querySelector("#calendarDays").textContent = formatDays(result.calendarDays);
    document.querySelector("#lastDayEffort").textContent = formatEffort(result.lastDayEffort);
  }

  function renderBreakdown(result) {
    const rows = [
      ["開始日", formatJapaneseDate(result.startDate)],
      ["初回稼働日", formatJapaneseDate(result.firstWorkDate)],
      ["総工数", formatEffort(result.effortDays)],
      ["非稼働曜日", formatDays(result.counts.closed)],
      ["祝日", formatDays(result.counts.holiday)],
      ["会社休日", formatDays(result.counts.extra)],
    ];

    document.querySelector("#breakdown").innerHTML = rows
      .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
      .join("");
  }

  function renderExcludedDays(result) {
    const container = document.querySelector("#excludedList");
    const relevantDays = result.excludedDays.filter((day) => day.type !== "closed");

    if (relevantDays.length === 0) {
      container.innerHTML = "<p>該当なし</p>";
      return;
    }

    const visibleDays = relevantDays.slice(0, 24);
    const items = visibleDays
      .map(
        (day) =>
          `<span class="excluded-item"><strong>${day.label}</strong>${formatJapaneseDate(
            day.date,
            false,
          )}</span>`,
      )
      .join("");

    const remaining =
      relevantDays.length > visibleDays.length
        ? `<span class="excluded-item">ほか${relevantDays.length - visibleDays.length}日</span>`
        : "";

    container.innerHTML = items + remaining;
  }

  function getMonthsBetween(start, end) {
    const months = [];
    let year = start.getUTCFullYear();
    let month = start.getUTCMonth() + 1;
    const endYear = end.getUTCFullYear();
    const endMonth = end.getUTCMonth() + 1;

    while (year < endYear || (year === endYear && month <= endMonth)) {
      months.push({ year, month });
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }

    return months;
  }

  function renderCalendar(result, settings) {
    const container = document.querySelector("#calendarMonths");
    const months = getMonthsBetween(result.startDate, result.finishDate);

    if (months.length > 24) {
      container.innerHTML =
        '<p class="calendar-note">カレンダー表示は24か月以内の工期で表示されます。</p>';
      return;
    }

    const workMap = new Map(result.workEntries.map((entry) => [entry.key, entry.effort]));
    const startKey = formatYmd(result.startDate);
    const finishKey = formatYmd(result.finishDate);
    const todayKey = todayInputValue();

    container.innerHTML = months
      .map(({ year, month }) => {
        const firstDate = createUtcDate(year, month, 1);
        const daysInMonth = getDaysInMonth(year, month);
        const leadingBlanks = firstDate.getUTCDay();
        const weekdayHeaders = WEEKDAY_LABELS.map((label) => `<div class="weekday">${label}</div>`)
          .join("");
        const blanks = Array.from({ length: leadingBlanks }, () => '<div class="day blank"></div>')
          .join("");
        const days = Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const date = createUtcDate(year, month, day);
          const key = formatYmd(date);
          const classification = classifyDay(date, settings);
          const classes = ["day"];
          const effort = workMap.get(key);
          const titleParts = [formatJapaneseDate(date)];

          if (classification.type !== "work") {
            classes.push(classification.type === "extra" ? "extra" : classification.type);
            titleParts.push(classification.label);
          }
          if (effort) {
            classes.push("worked");
            titleParts.push(formatEffort(effort));
          }
          if (key === startKey) classes.push("start");
          if (key === finishKey) classes.push("finish");
          if (key === todayKey) classes.push("today");

          return `<div class="${classes.join(" ")}" title="${titleParts.join(" / ")}">
            <span class="day-number">${day}</span>
            ${effort ? `<span class="day-effort">${formatEffort(effort)}</span>` : ""}
          </div>`;
        }).join("");

        return `<article class="month">
          <h3>${year}年${month}月</h3>
          <div class="month-grid">${weekdayHeaders}${blanks}${days}</div>
        </article>`;
      })
      .join("");
  }

  function render(result, settings) {
    renderMetrics(result);
    renderBreakdown(result);
    renderExcludedDays(result);
    renderCalendar(result, settings);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const error = document.querySelector("#formError");
    error.textContent = "";

    try {
      const settings = readSettings();
      const result = calculateSchedule(settings);
      render(result, settings);
    } catch (caught) {
      error.textContent = caught.message;
    }
  }

  function init() {
    const form = document.querySelector("#calculatorForm");
    document.querySelector("#startDate").value = todayInputValue();
    form.addEventListener("submit", handleSubmit);
    form.dispatchEvent(new Event("submit", { cancelable: true }));
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", init);
  }

  if (typeof module !== "undefined") {
    module.exports = {
      addDays,
      calculateSchedule,
      createUtcDate,
      formatYmd,
      getJapaneseHolidays,
      parseDateInput,
    };
  } else {
    root.WbsCalendar = {
      calculateSchedule,
      getJapaneseHolidays,
      parseDateInput,
    };
  }
})(typeof window !== "undefined" ? window : globalThis);
