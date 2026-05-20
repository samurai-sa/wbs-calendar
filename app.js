(function (root) {
  "use strict";

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
  const EPSILON = 0.000001;
  let latestResult = null;

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

  function createCounts() {
    return {
      closed: 0,
      holiday: 0,
      extra: 0,
    };
  }

  function normalizeTasks(settings) {
    const rawTasks = Array.isArray(settings.tasks)
      ? settings.tasks
      : [{ name: "タスク1", effortDays: settings.effortDays }];

    if (rawTasks.length === 0) {
      throw new Error("WBSタスクを1つ以上追加してください。");
    }

    return rawTasks.map((task, index) => {
      const effortDays = Number(task.effortDays);
      if (!Number.isFinite(effortDays) || effortDays <= 0) {
        throw new Error(`タスク${index + 1}の工数は0より大きい人日で入力してください。`);
      }

      return {
        index,
        name: typeof task.name === "string" && task.name.trim() ? task.name.trim() : `タスク${index + 1}`,
        effortDays,
      };
    });
  }

  function calculateTaskSchedule(settings, task, startDate, countStartDate) {
    let remainingDays = task.effortDays;
    let cursor = countStartDate ? cloneUtcDate(startDate) : addDays(startDate, 1);
    let loopGuard = 0;
    let firstWorkDate = null;
    let finishDate = null;
    let lastDayEffort = 0;
    const workEntries = [];
    const excludedDays = [];
    const counts = createCounts();

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
          taskIndex: task.index,
          taskName: task.name,
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
          taskIndex: task.index,
          taskName: task.name,
        });
      }

      cursor = addDays(cursor, 1);
    }

    return {
      index: task.index,
      name: task.name,
      startDate: cloneUtcDate(startDate),
      firstWorkDate,
      finishDate,
      workEntries,
      excludedDays,
      counts,
      effortDays: task.effortDays,
      workingDays: workEntries.length,
      lastDayEffort,
    };
  }

  function calculateSchedule(settings) {
    if (!settings.startDate) {
      throw new Error("開始日を入力してください。");
    }
    if (settings.allowedWeekdays.size === 0) {
      throw new Error("稼働曜日を1つ以上選択してください。");
    }

    const tasks = normalizeTasks(settings);
    const taskResults = [];
    const counts = createCounts();
    let nextStartDate = cloneUtcDate(settings.startDate);

    for (const task of tasks) {
      const taskResult = calculateTaskSchedule(
        settings,
        task,
        nextStartDate,
        taskResults.length === 0 ? settings.countStartDate : true,
      );
      taskResults.push(taskResult);
      counts.closed += taskResult.counts.closed;
      counts.holiday += taskResult.counts.holiday;
      counts.extra += taskResult.counts.extra;
      nextStartDate = addDays(taskResult.finishDate, 1);
    }

    const workEntries = taskResults.flatMap((task) => task.workEntries);
    const excludedDays = taskResults.flatMap((task) => task.excludedDays);
    const firstTask = taskResults[0];
    const lastTask = taskResults[taskResults.length - 1];
    const effortDays = taskResults.reduce((total, task) => total + task.effortDays, 0);

    return {
      startDate: cloneUtcDate(settings.startDate),
      firstWorkDate: firstTask.firstWorkDate,
      finishDate: lastTask.finishDate,
      taskResults,
      workEntries,
      excludedDays,
      counts,
      effortDays,
      workingDays: workEntries.length,
      calendarDays: daysBetweenInclusive(settings.startDate, lastTask.finishDate),
      lastDayEffort: lastTask.lastDayEffort,
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

  function formatShortDate(date) {
    if (!date) return "-";
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
      timeZone: "UTC",
    });
    return formatter.format(date);
  }

  function formatMetricDate(date) {
    if (!date) return "-";
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  }

  function formatEffort(value) {
    return `${new Intl.NumberFormat("ja-JP", {
      maximumFractionDigits: 2,
    }).format(value)}人日`;
  }

  function formatCsvCell(value) {
    const text = String(value);
    if (!/[",\n\r]/.test(text)) return text;
    return `"${text.replaceAll('"', '""')}"`;
  }

  function formatScheduleCopy(result) {
    const rows = result.taskResults.map((task) => [
      task.name,
      formatMetricDate(task.firstWorkDate),
      formatMetricDate(task.finishDate),
    ]);

    return rows.map((row) => row.map(formatCsvCell).join(",")).join("\n");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function parseCsvLine(line) {
    const parts = [];
    let current = "";
    let quoted = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];

      if (char === '"' && quoted && next === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        parts.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    parts.push(current);
    return parts;
  }

  function normalizeEffortToken(value) {
    return String(value)
      .trim()
      .replace(/[０-９．]/g, (char) => {
        if (char === "．") return ".";
        return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
      })
      .replace(/[,，]/g, "")
      .replace(/\s*人日?$/u, "");
  }

  function parsePastedTasks(value) {
    const tasks = [];
    const lines = String(value)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    lines.forEach((line, index) => {
      let name = "";
      let effortToken = "";

      if (line.includes("\t")) {
        const parts = line
          .split(/\t+/)
          .map((part) => part.trim())
          .filter(Boolean);
        effortToken = parts[parts.length - 1] || "";
        name = parts.slice(0, -1).join(" ");
      } else {
        const csvParts = parseCsvLine(line)
          .map((part) => part.trim())
          .filter(Boolean);

        if (csvParts.length > 1) {
          effortToken = csvParts[csvParts.length - 1] || "";
          name = csvParts.slice(0, -1).join(", ");
        } else {
          const match = line.match(/^(.+?)[\s　]+([+-]?[0-9０-９]+(?:[.．][0-9０-９]+)?(?:\s*人日?)?)$/u);
          if (match) {
            name = match[1].trim();
            effortToken = match[2].trim();
          }
        }
      }

      const effortDays = Number(normalizeEffortToken(effortToken));

      if (!name || !Number.isFinite(effortDays) || effortDays <= 0) {
        throw new Error(`${index + 1}行目を確認してください。`);
      }

      tasks.push({ name, effortDays });
    });

    if (tasks.length === 0) {
      throw new Error("貼付データを入力してください。");
    }

    return tasks;
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

  function readTasks() {
    const rows = Array.from(document.querySelectorAll(".task-row"));
    if (rows.length === 0) {
      throw new Error("WBSタスクを1つ以上追加してください。");
    }

    return rows.map((row, index) => {
      const nameInput = row.querySelector('input[name="taskName"]');
      const effortInput = row.querySelector('input[name="taskEffort"]');
      const effortDays = Number(effortInput.value);

      if (!Number.isFinite(effortDays) || effortDays <= 0) {
        throw new Error(`タスク${index + 1}の工数は0より大きい人日で入力してください。`);
      }

      return {
        name: nameInput.value.trim() || `タスク${index + 1}`,
        effortDays,
      };
    });
  }

  function readSettings() {
    const startDate = parseDateInput(document.querySelector("#startDate").value);
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
      tasks: readTasks(),
      allowedWeekdays,
      countStartDate: document.querySelector("#countStartDate").checked,
      excludePublicHolidays: document.querySelector("#excludePublicHolidays").checked,
      extraHolidaySet,
    };
  }

  function renderMetrics(result) {
    document.querySelector("#projectStartDate").textContent = formatMetricDate(result.startDate);
    document.querySelector("#finishDate").textContent = formatMetricDate(result.finishDate);
    document.querySelector("#workingDays").textContent = formatDays(result.workingDays);
    document.querySelector("#calendarDays").textContent = formatDays(result.calendarDays);
  }

  function renderTaskSchedule(result) {
    const table = document.querySelector("#taskSchedule");
    table.innerHTML = `<thead>
      <tr><th>タスク</th><th>開始</th><th>完了</th><th>工数</th></tr>
    </thead>
    <tbody>
      ${result.taskResults
        .map(
          (task) => `<tr>
            <td title="${escapeHtml(task.name)}">${escapeHtml(task.name)}</td>
            <td title="${escapeHtml(formatJapaneseDate(task.firstWorkDate))}">${formatShortDate(
              task.firstWorkDate,
            )}</td>
            <td title="${escapeHtml(formatJapaneseDate(task.finishDate))}">${formatShortDate(
              task.finishDate,
            )}</td>
            <td>${formatEffort(task.effortDays)}</td>
          </tr>`,
        )
        .join("")}
    </tbody>`;
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

    const workMap = new Map(result.workEntries.map((entry) => [entry.key, entry]));
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
          const workEntry = workMap.get(key);
          const effort = workEntry ? workEntry.effort : 0;
          const titleParts = [formatJapaneseDate(date)];

          if (classification.type !== "work") {
            classes.push(classification.type === "extra" ? "extra" : classification.type);
            titleParts.push(classification.label);
          }
          if (effort) {
            classes.push("worked");
            classes.push(`task-color-${workEntry.taskIndex % 6}`);
            titleParts.push(`${workEntry.taskName}: ${formatEffort(effort)}`);
          }
          if (key === startKey) classes.push("start");
          if (key === finishKey) classes.push("finish");
          if (key === todayKey) classes.push("today");

          return `<div class="${classes.join(" ")}" title="${escapeHtml(titleParts.join(" / "))}">
            <span class="day-number">${day}</span>
            ${
              effort
                ? `<span class="day-task">${escapeHtml(workEntry.taskName)}</span><span class="day-effort">${formatEffort(
                    effort,
                  )}</span>`
                : ""
            }
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
    latestResult = result;
    renderMetrics(result);
    renderTaskSchedule(result);
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

  function updateTaskRemoveButtons() {
    const rows = Array.from(document.querySelectorAll(".task-row"));
    rows.forEach((row, index) => {
      const nameInput = row.querySelector('input[name="taskName"]');
      const effortInput = row.querySelector('input[name="taskEffort"]');
      const removeButton = row.querySelector(".remove-task");
      nameInput.setAttribute("aria-label", `タスク${index + 1} 名称`);
      effortInput.setAttribute("aria-label", `タスク${index + 1} 工数`);
      removeButton.setAttribute("aria-label", `タスク${index + 1}を削除`);
      removeButton.disabled = rows.length === 1;
    });
  }

  function createTaskRow(index, task = {}) {
    const row = document.createElement("div");
    row.className = "task-row";
    row.innerHTML = `<input name="taskName" type="text" value="${escapeHtml(
      task.name || `タスク${index}`,
    )}" />
      <div class="input-with-unit task-effort">
        <input name="taskEffort" type="number" min="0.25" step="0.25" value="${
          task.effortDays || 1
        }" required />
        <span>人日</span>
      </div>
      <button class="icon-action remove-task" type="button" title="タスクを削除">x</button>`;
    return row;
  }

  function renderTaskRows(tasks) {
    const taskList = document.querySelector("#taskList");
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
      taskList.append(createTaskRow(index + 1, task));
    });
    updateTaskRemoveButtons();
  }

  function addTaskRow() {
    const taskList = document.querySelector("#taskList");
    taskList.append(createTaskRow(taskList.querySelectorAll(".task-row").length + 1));
    updateTaskRemoveButtons();
  }

  function handleTaskListClick(event) {
    const removeButton = event.target.closest(".remove-task");
    if (!removeButton || removeButton.disabled) return;
    removeButton.closest(".task-row").remove();
    updateTaskRemoveButtons();
  }

  function tasksToClipboardText() {
    return Array.from(document.querySelectorAll(".task-row"))
      .map((row, index) => {
        const name = row.querySelector('input[name="taskName"]').value.trim() || `タスク${index + 1}`;
        const effort = row.querySelector('input[name="taskEffort"]').value.trim() || "1";
        return `${name}\t${effort}`;
      })
      .join("\n");
  }

  function openImportDialog() {
    const dialog = document.querySelector("#importDialog");
    document.querySelector("#bulkTasks").value = tasksToClipboardText();
    document.querySelector("#importError").textContent = "";

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }

    document.querySelector("#bulkTasks").focus();
  }

  function closeImportDialog() {
    const dialog = document.querySelector("#importDialog");
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }

  function handleImportSubmit(event) {
    event.preventDefault();
    const error = document.querySelector("#importError");
    error.textContent = "";

    try {
      const tasks = parsePastedTasks(document.querySelector("#bulkTasks").value);
      renderTaskRows(tasks);
      closeImportDialog();
      document
        .querySelector("#calculatorForm")
        .dispatchEvent(new Event("submit", { cancelable: true }));
    } catch (caught) {
      error.textContent = caught.message;
    }
  }

  async function writeClipboardText(value) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  async function handleCopySchedule() {
    const button = document.querySelector("#copySchedule");
    const originalText = button.textContent;

    try {
      if (!latestResult) {
        throw new Error("コピーできるWBSがありません。");
      }
      await writeClipboardText(formatScheduleCopy(latestResult));
      button.textContent = "コピー済";
      window.setTimeout(() => {
        button.textContent = originalText;
      }, 1400);
    } catch (caught) {
      button.textContent = "失敗";
      window.setTimeout(() => {
        button.textContent = originalText;
      }, 1400);
    }
  }

  function init() {
    const form = document.querySelector("#calculatorForm");
    document.querySelector("#startDate").value = todayInputValue();
    document.querySelector("#openImport").addEventListener("click", openImportDialog);
    document.querySelector("#closeImport").addEventListener("click", closeImportDialog);
    document.querySelector("#cancelImport").addEventListener("click", closeImportDialog);
    document.querySelector("#importForm").addEventListener("submit", handleImportSubmit);
    document.querySelector("#copySchedule").addEventListener("click", handleCopySchedule);
    document.querySelector("#addTask").addEventListener("click", addTaskRow);
    document.querySelector("#taskList").addEventListener("click", handleTaskListClick);
    updateTaskRemoveButtons();
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
      formatScheduleCopy,
      parsePastedTasks,
      parseDateInput,
    };
  } else {
    root.WbsCalendar = {
      calculateSchedule,
      formatScheduleCopy,
      getJapaneseHolidays,
      parsePastedTasks,
      parseDateInput,
    };
  }
})(typeof window !== "undefined" ? window : globalThis);
