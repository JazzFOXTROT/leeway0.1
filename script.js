/* =========================================================================
   Leeway — screen switching, transitions and flow logic.
   Every transition below (type, direction, duration, easing) was read out of
   the prototype connections in the Figma file "Demo Final Project Ver 3"
   (file key mJc7QbFA7CpcJTj1Tf4WRq, page "Screens Ver 1", 27 connections).
   Plain ES2015+. No build step, no dependencies.
   ========================================================================= */

(function () {
  "use strict";

  var app = document.getElementById("app");
  var overlay = document.getElementById("overlay");
  var screens = {};
  Array.prototype.forEach.call(document.querySelectorAll("[data-screen]"), function (el) {
    screens[el.dataset.screen] = el;
  });

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =====================================================================
     LANGUAGE
     Every visible string lives here; the markup carries data-i18n hooks and
     nothing user-facing is hardcoded. Hebrew and Arabic are RTL, English and
     Russian are LTR, so switching also flips <html dir> — the layout mirrors,
     it is not just retyped. Heebo has no Arabic and no Cyrillic glyphs, so
     the font stack moves with the language: Cairo carries Arabic, Rubik
     carries Cyrillic.
     ===================================================================== */
  var I18N = {
    he: {
      "app.title": "Leeway — זימון תור לביקורת ביטחון בנתב\"ג",
      "common.loading": "טוען",
      "common.confirm": "אישור",
      "common.continue": "המשך",
      "common.back": "חזרה",
      "common.backBtn": "אחורה",
      "common.home": "לדף הבית",
      "common.edit": "עריכה",
      "common.save": "שמירה",
      "common.done": "סיום",
      "common.passportShort": "דרכון",
      "menu.title": "תפריט",
      "menu.open": "פתיחת תפריט",
      "menu.close": "סגירת תפריט",
      "menu.profile": "פרופיל שלי",
      "menu.notifications": "התראות",
      "menu.language": "שפה",
      "landing.h1a": "תזמינו עכשיו",
      "landing.h1b": "כדי לא לחכות אחר כך",
      "landing.newBooking": "הזמינו חלון זמן חדש",
      "landing.myBooking": "הזמנה שלי",
      "coach.step": "שלב {n} מתוך {total}",
      "coach.next": "הבא",
      "coach.done": "מתחילים",
      "coach.skip": "דילוג",
      "coach.s1.title": "מזמינים חלון זמן",
      "coach.s1.body": "מספר טיסה ושם, ואתם בוחרים חלון פנוי לביקורת הביטחון — לפני שיצאתם מהבית.",
      "coach.s2.title": "עוקבים ביום הטיסה",
      "coach.s2.body": "הכרטיס מתעדכן לבד לאורך היום: צ'ק-אין, ביקורת ביטחון, ושער העלייה.",
      "coach.s3.title": "מציגים בעמדה",
      "coach.s3.body": "בכניסה לביקורת פותחים את ההזמנה ומציגים את קוד ה-QR. זהו.",
      "status.cardTitle": "סטטוס שלי",
      "status.note": "מידע כללי בלבד — ללא רמת עומס חזויה",
      "status.noneStep": "אין הזמנה פעילה",
      "status.noneState": "טרם נבחר חלון זמן",
      "status.h1a": "סטטוס",
      "status.h1b": "שלי",
      "step.checkin": "צ'ק-אין",
      "step.passenger": "פרטי נוסע",
      "step.time": "בחירת חלון זמן",
      "step.confirm": "אישור הזמנה",
      "state.inprogress": "בתהליך",
      "state.done": "הושלם",
      "state.waiting": "ממתין",
      "reg.h1a": "הכנס",
      "reg.h1b": "פרטיך",
      "reg.h2a": "טס",
      "reg.h2b": "לא לבד?",
      "reg.addPassenger": "+ הוסף נוסע",
      "flight.looking": "מאתר את פרטי הטיסה…",
      "alt.unknownRoute": "עננים — יעד הטיסה עדיין לא ידוע",
      "flight.notFound": "לא מצאנו את מספר הטיסה הזה. אפשר להמשיך בכל מקרה.",
      "flight.offline": "אין חיבור — פרטי הטיסה יושלמו כשהרשת תחזור.",
      "flight.found": "{airline} · {route}",
      "reg.removePassenger": "הסר",
      "aria.removePassenger": "הסרת נוסע",
      "reg.remember": "זכרו אותי",
      "reg.passengerN": "נוסע",
      "reg.max": "הגעת למקסימום {n} נוסעים",
      "ph.first": "שם פרטי",
      "ph.last": "שם משפחה",
      "ph.passport": "מס׳ דרכון",
      "ph.flight": "מס׳ טיסה",
      "err.first": "יש להזין שם פרטי באותיות בלבד",
      "err.last": "יש להזין שם משפחה באותיות בלבד",
      "err.passport": "מספר דרכון הוא 8 ספרות",
      "err.flight": "מספר טיסה לדוגמה: LY 315",
      "err.label.name": "שם",
      "err.label.passport": "מספר דרכון",
      "err.label.flight": "מספר טיסה",
      "fail.h1a": "אופס...משהו",
      "fail.h1b": "השתבש",
      "fail.badDetails": "הפרטים לא תואמים לרישומי הטיסה. בדקו: ",
      "fail.noSlot": "לא נבחר חלון זמן לביקורת הביטחון.",
      "fail.slotFull": "חלון הזמן {slot} התמלא. בחרו חלון זמן אחר.",
      "success.h1a": "הזמנה בוצע",
      "success.h1b": "בהצלחה",
      "success.track": "מעקב אחרי סטטוס הטיסה",
      "time.srTitle": "בחירת חלון זמן לביקורת ביטחון",
      "time.legend": "חלונות זמן פנויים לביקורת ביטחון",
      "time.full": "מלא",
      "time.windowsNote": "החלונות מסתיימים שעתיים לפני ההמראה ב-{time}",
      "time.passengers": "נוסעים",
      "flight.meta": "יום ג׳ · 25.05.2026 · טרמינל 3 · כניסה 03",
      "flight.terminal": "טרמינל {n}",
      "flight.zone": "אזור {z}",
      "flight.metaRoute": "{airline} · {city}",
      "flight.departs": "המראה {time}",
      "flight.updated": "עודכן ל-{time}",
      "flight.counters": "דלפקים {n}",
      "flight.canceled": "הטיסה בוטלה",
      "flight.delayed": "הטיסה מתעכבת",
      "flight.departed": "הטיסה כבר המריאה",
      "flight.notOnBoard": "לוח הטיסות מתעדכן כשלושה ימים מראש — הטרמינל והשעה יופיעו אז.",
      "flight.boardOffline": "לוח הטיסות לא זמין כרגע — הטרמינל והשעה יושלמו מאוחר יותר.",
      "pass.label": "כרטיס הכניסה שלך",
      "pass.where": "טרמינל 3 · כניסה 03",
      "pass.openFull": "פתיחה במסך מלא",
      "tl.identify": "זיהוי",
      "tl.security": "ביקורת ביטחון",
      "tl.eta": "צפי משך -",
      "qr.passenger": "נוסע",
      "qr.meta": "יום ג׳ · 25.05 · טרמינל 3 · כניסה 03",
      "qr.scan": "סרקו בעמדת הכניסה המהירה",
      "qr.wallet": "שמירה ל-Wallet",
      "theme.toDark": "מצב כהה",
      "theme.toLight": "מצב בהיר",
      "aria.toDark": "מעבר למצב כהה",
      "aria.toLight": "מעבר למצב בהיר",
      "aria.notifications": "הפעלת התראות",
      "aria.share": "שיתוף ההזמנה",
      "aria.backToSlots": "חזרה לבחירת חלון זמן",
      "aria.expandCard": "פתיחת פרטי ההזמנה המלאים",
      "aria.collapseCard": "סגירת פרטי ההזמנה וחזרה לבחירת חלון זמן",
      "aria.statusCard": "מעבר לסטטוס ההזמנה שלי",
      "aria.statusCardEmpty": "אין הזמנה פעילה — מעבר להזמנת חלון זמן",
      "aria.closeFull": "סגירת התצוגה המלאה",
      "alt.terminal": "איור של טרמינל נמל התעופה בן גוריון עם מגדל פיקוח ומטוס ממריא",
      "alt.airplane": "איור של מטוס ממריא",
      "alt.error": "איור של משולש אזהרה אדום",
      "alt.route": "קו הרקיע של סיאטל — יעד הטיסה",
      "alt.qrThumb": "קוד QR מוקטן של כרטיס הכניסה",
      "alt.qrFull": "קוד QR של אישור הזימון להצגה בעמדת הביקורת",
      "alt.avatar": "תמונת פרופיל",
      "profile.title": "פרופיל שלי",
      "profile.name": "דניאל כהן",
      "profile.editPhoto": "ערוך תמונת פרופיל",
      "profile.save": "שמור פרטים שלי",
      "reg.rememberOn": "זוכרים אותך",
      "profile.clear": "מחק את כל מה שנשמר",
      "profile.clearNote": "מוחק את הפרטים ששמרת במכשיר הזה. אין לזה השפעה על הזמנות שכבר אושרו.",
      "clear.done": "נמחקו {k} מפתחות ו-{c} מטמונים. בבדיקה חוזרת לא נשאר כלום.",
      "clear.left": "נמחק חלקית — נשארו {k} מפתחות ו-{c} מטמונים.",
      "clear.empty": "לא היה מה למחוק — המכשיר כבר נקי.",
      "profile.pickerLabel": "בחירת תמונת פרופיל",
      "profile.av.neutral": "אווטאר ניטרלי",
      "profile.av.male1": "נוסע",
      "profile.av.male2": "נוסע עם משקפי שמש",
      "profile.av.female1": "נוסעת",
      "profile.av.female2": "נוסעת עם כובע",
      "profile.av.older": "נוסע מבוגר",
      "profile.av.elderly": "נוסעת מבוגרת",
      "profile.av.assistant1": "עוזר דיגיטלי",
      "profile.av.assistant2": "עוזר דיגיטלי קורץ",
      "notif.title": "התראות",
      "notif.beforeFlight": "תזכורת לפני הטיסה הבאה",
      "notif.statusChange": "עדכון בשינוי סטטוס",
      "notif.on": "מופעל",
      "notif.off": "כבוי",
      "lang.title": "שפה",
      "lang.pickerLabel": "בחירת שפה",
      "lang.he": "עברית",
      "lang.en": "אנגלית",
      "lang.ar": "ערבית",
      "lang.ru": "רוסית"
    },
    en: {
      "app.title": "Leeway — Book a security-check slot at Ben Gurion",
      "common.loading": "Loading",
      "common.confirm": "Confirm",
      "common.continue": "Continue",
      "common.back": "Back",
      "common.backBtn": "Back",
      "common.home": "Home",
      "common.edit": "Edit",
      "common.save": "Save",
      "common.done": "Done",
      "common.passportShort": "Passport",
      "menu.title": "Menu",
      "menu.open": "Open menu",
      "menu.close": "Close menu",
      "menu.profile": "My profile",
      "menu.notifications": "Notifications",
      "menu.language": "Language",
      "landing.h1a": "Book now",
      "landing.h1b": "so you never queue later",
      "landing.newBooking": "Book a new time slot",
      "landing.myBooking": "My booking",
      "coach.step": "Step {n} of {total}",
      "coach.next": "Next",
      "coach.done": "Let's start",
      "coach.skip": "Skip",
      "coach.s1.title": "Book a time slot",
      "coach.s1.body": "A flight number and a name, and you pick a free security-check window — before you leave home.",
      "coach.s2.title": "Track it on the day",
      "coach.s2.body": "The card updates itself through the day: check-in, security check, and the gate.",
      "coach.s3.title": "Show it at the desk",
      "coach.s3.body": "At the security entrance you open the booking and show the QR code. That's it.",
      "status.cardTitle": "My status",
      "status.note": "General information only — no predicted queue level",
      "status.noneStep": "No active booking",
      "status.noneState": "No time window chosen yet",
      "status.h1a": "My",
      "status.h1b": "status",
      "step.checkin": "Check-in",
      "step.passenger": "Passenger details",
      "step.time": "Choose a time slot",
      "step.confirm": "Confirm booking",
      "state.inprogress": "In progress",
      "state.done": "Completed",
      "state.waiting": "Waiting",
      "reg.h1a": "Enter",
      "reg.h1b": "your details",
      "reg.h2a": "Flying",
      "reg.h2b": "with others?",
      "reg.addPassenger": "+ Add passenger",
      "flight.looking": "Looking up the flight…",
      "alt.unknownRoute": "Clouds — destination not identified yet",
      "flight.notFound": "We couldn’t find that flight number. You can continue anyway.",
      "flight.offline": "No connection — flight details will fill in once you’re back online.",
      "flight.found": "{airline} · {route}",
      "reg.removePassenger": "Remove",
      "aria.removePassenger": "Remove passenger",
      "reg.remember": "Remember me",
      "reg.passengerN": "Passenger",
      "reg.max": "Maximum of {n} passengers reached",
      "ph.first": "First name",
      "ph.last": "Last name",
      "ph.passport": "Passport no.",
      "ph.flight": "Flight no.",
      "err.first": "First name must be letters only",
      "err.last": "Last name must be letters only",
      "err.passport": "Passport number is 8 digits",
      "err.flight": "Flight number example: LY 315",
      "err.label.name": "name",
      "err.label.passport": "passport number",
      "err.label.flight": "flight number",
      "fail.h1a": "Oops… something",
      "fail.h1b": "went wrong",
      "fail.badDetails": "The details do not match the flight record. Check: ",
      "fail.noSlot": "No security-check time slot was selected.",
      "fail.slotFull": "The {slot} slot is now full. Please choose another.",
      "success.h1a": "Booking completed",
      "success.h1b": "successfully",
      "success.track": "Track flight status",
      "time.srTitle": "Choose a security-check time slot",
      "time.legend": "Available security-check slots",
      "time.full": "Full",
      "time.windowsNote": "Windows end two hours before the {time} departure",
      "time.passengers": "Passengers",
      "flight.meta": "Tue · 25.05.2026 · Terminal 3 · Gate 03",
      "flight.terminal": "Terminal {n}",
      "flight.zone": "Zone {z}",
      "flight.metaRoute": "{airline} · {city}",
      "flight.departs": "Departs {time}",
      "flight.updated": "updated to {time}",
      "flight.counters": "Desks {n}",
      "flight.canceled": "Flight canceled",
      "flight.delayed": "Flight delayed",
      "flight.departed": "Already departed",
      "flight.notOnBoard": "The daily board opens about three days ahead — terminal and time will appear then.",
      "flight.boardOffline": "The airport board is unreachable right now — terminal and time will fill in later.",
      "pass.label": "Your entry pass",
      "pass.where": "Terminal 3 · Gate 03",
      "pass.openFull": "Open full screen",
      "tl.identify": "Identification",
      "tl.security": "Security check",
      "tl.eta": "Est. until -",
      "qr.passenger": "passenger",
      "qr.meta": "Tue · 25.05 · Terminal 3 · Gate 03",
      "qr.scan": "Scan at the fast-entry gate",
      "qr.wallet": "Save to Wallet",
      "theme.toDark": "Dark mode",
      "theme.toLight": "Light mode",
      "aria.toDark": "Switch to dark mode",
      "aria.toLight": "Switch to light mode",
      "aria.notifications": "Enable notifications",
      "aria.share": "Share booking",
      "aria.backToSlots": "Back to slot selection",
      "aria.expandCard": "Show the full booking details",
      "aria.collapseCard": "Hide the booking details and go back to the time windows",
      "aria.statusCard": "Go to my booking status",
      "aria.statusCardEmpty": "No active booking — start a new one",
      "aria.closeFull": "Close full screen",
      "alt.terminal": "Illustration of Ben Gurion Airport terminal with a control tower and a departing plane",
      "alt.airplane": "Illustration of a departing airplane",
      "alt.error": "Illustration of a red warning triangle",
      "alt.route": "Seattle skyline — the flight destination",
      "alt.qrThumb": "Small QR code of the entry pass",
      "alt.qrFull": "QR code of the booking confirmation, to show at the checkpoint",
      "alt.avatar": "Profile picture",
      "profile.title": "My profile",
      "profile.name": "Daniel Cohen",
      "profile.editPhoto": "Edit profile picture",
      "profile.save": "Save my details",
      "reg.rememberOn": "We'll remember you",
      "profile.clear": "Delete everything saved",
      "profile.clearNote": "Deletes the details you saved on this device. Bookings already confirmed are not affected.",
      "clear.done": "Deleted {k} keys and {c} caches. Re-checked: nothing left.",
      "clear.left": "Partly deleted — {k} keys and {c} caches remain.",
      "clear.empty": "Nothing to delete — this device is already clean.",
      "profile.pickerLabel": "Choose a profile picture",
      "profile.av.neutral": "Neutral avatar",
      "profile.av.male1": "Male traveller",
      "profile.av.male2": "Male traveller with sunglasses",
      "profile.av.female1": "Female traveller",
      "profile.av.female2": "Female traveller with a hat",
      "profile.av.older": "Older traveller",
      "profile.av.elderly": "Elderly traveller",
      "profile.av.assistant1": "Digital assistant",
      "profile.av.assistant2": "Digital assistant winking",
      "notif.title": "Notifications",
      "notif.beforeFlight": "Reminder before the next flight",
      "notif.statusChange": "Alert when the status changes",
      "notif.on": "On",
      "notif.off": "Off",
      "lang.title": "Language",
      "lang.pickerLabel": "Choose a language",
      "lang.he": "Hebrew",
      "lang.en": "English",
      "lang.ar": "Arabic",
      "lang.ru": "Russian"
    },
    ru: {
      "app.title": "Leeway — запись на досмотр в аэропорту Бен-Гурион",
      "common.loading": "Загрузка",
      "common.confirm": "Подтвердить",
      "common.continue": "Далее",
      "common.back": "Назад",
      "common.backBtn": "Назад",
      "common.home": "На главную",
      "common.edit": "Изменить",
      "common.save": "Сохранить",
      "common.done": "Готово",
      "common.passportShort": "Паспорт",
      "menu.title": "Меню",
      "menu.open": "Открыть меню",
      "menu.close": "Закрыть меню",
      "menu.profile": "Мой профиль",
      "menu.notifications": "Уведомления",
      "menu.language": "Язык",
      "landing.h1a": "Забронируйте сейчас",
      "landing.h1b": "чтобы не стоять в очереди",
      "landing.newBooking": "Забронировать новое окно",
      "landing.myBooking": "Моя бронь",
      "coach.step": "Шаг {n} из {total}",
      "coach.next": "Далее",
      "coach.done": "Начнём",
      "coach.skip": "Пропустить",
      "coach.s1.title": "Бронируете окно",
      "coach.s1.body": "Номер рейса и имя — и вы выбираете свободное окно для проверки безопасности, ещё до выхода из дома.",
      "coach.s2.title": "Следите в день вылета",
      "coach.s2.body": "Карточка обновляется сама: регистрация, проверка безопасности и выход на посадку.",
      "coach.s3.title": "Показываете на месте",
      "coach.s3.body": "На входе в зону досмотра открываете бронь и показываете QR-код. Всё.",
      "status.cardTitle": "Мой статус",
      "status.note": "Только общая информация — без прогноза загруженности",
      "status.noneStep": "Нет активного бронирования",
      "status.noneState": "Окно времени ещё не выбрано",
      "status.h1a": "Мой",
      "status.h1b": "статус",
      "step.checkin": "Регистрация",
      "step.passenger": "Данные пассажира",
      "step.time": "Выбор окна",
      "step.confirm": "Подтверждение",
      "state.inprogress": "В процессе",
      "state.done": "Завершено",
      "state.waiting": "Ожидание",
      "reg.h1a": "Введите",
      "reg.h1b": "свои данные",
      "reg.h2a": "Летите",
      "reg.h2b": "не один?",
      "reg.addPassenger": "+ Добавить пассажира",
      "flight.looking": "Ищем рейс…",
      "alt.unknownRoute": "Облака — пункт назначения пока неизвестен",
      "flight.notFound": "Не удалось найти этот номер рейса. Можно продолжить.",
      "flight.offline": "Нет соединения — данные рейса появятся позже.",
      "flight.found": "{airline} · {route}",
      "reg.removePassenger": "Удалить",
      "aria.removePassenger": "Удалить пассажира",
      "reg.remember": "Запомнить меня",
      "reg.passengerN": "Пассажир",
      "reg.max": "Достигнут максимум: {n} пассажиров",
      "ph.first": "Имя",
      "ph.last": "Фамилия",
      "ph.passport": "Номер паспорта",
      "ph.flight": "Номер рейса",
      "err.first": "Имя — только буквы",
      "err.last": "Фамилия — только буквы",
      "err.passport": "Номер паспорта — 8 цифр",
      "err.flight": "Пример номера рейса: LY 315",
      "err.label.name": "имя",
      "err.label.passport": "номер паспорта",
      "err.label.flight": "номер рейса",
      "fail.h1a": "Ой… что-то",
      "fail.h1b": "пошло не так",
      "fail.badDetails": "Данные не совпадают с записью о рейсе. Проверьте: ",
      "fail.noSlot": "Окно для досмотра не выбрано.",
      "fail.slotFull": "Окно {slot} заполнено. Выберите другое.",
      "success.h1a": "Бронь оформлена",
      "success.h1b": "успешно",
      "success.track": "Следить за статусом рейса",
      "time.srTitle": "Выбор окна для досмотра",
      "time.legend": "Свободные окна досмотра",
      "time.full": "Занято",
      "time.windowsNote": "Окна заканчиваются за два часа до вылета в {time}",
      "time.passengers": "Пассажиры",
      "flight.meta": "Вт · 25.05.2026 · Терминал 3 · Выход 03",
      "flight.terminal": "Терминал {n}",
      "flight.zone": "Зона {z}",
      "flight.metaRoute": "{airline} · {city}",
      "flight.departs": "Вылет {time}",
      "flight.updated": "обновлено на {time}",
      "flight.counters": "Стойки {n}",
      "flight.canceled": "Рейс отменён",
      "flight.delayed": "Рейс задерживается",
      "flight.departed": "Рейс уже вылетел",
      "flight.notOnBoard": "Табло открывается примерно за три дня — тогда появятся терминал и время.",
      "flight.boardOffline": "Табло аэропорта сейчас недоступно — терминал и время появятся позже.",
      "pass.label": "Ваш пропуск",
      "pass.where": "Терминал 3 · Выход 03",
      "pass.openFull": "Открыть во весь экран",
      "tl.identify": "Идентификация",
      "tl.security": "Досмотр",
      "tl.eta": "Ожидается до -",
      "qr.passenger": "пассажир",
      "qr.meta": "Вт · 25.05 · Терминал 3 · Выход 03",
      "qr.scan": "Отсканируйте на быстром проходе",
      "qr.wallet": "Сохранить в Wallet",
      "theme.toDark": "Тёмная тема",
      "theme.toLight": "Светлая тема",
      "aria.toDark": "Переключить на тёмную тему",
      "aria.toLight": "Переключить на светлую тему",
      "aria.notifications": "Включить уведомления",
      "aria.share": "Поделиться бронью",
      "aria.backToSlots": "Назад к выбору окна",
      "aria.expandCard": "Показать все данные бронирования",
      "aria.collapseCard": "Скрыть данные и вернуться к выбору окна",
      "aria.statusCard": "Перейти к статусу бронирования",
      "aria.statusCardEmpty": "Нет активного бронирования — создать новое",
      "aria.closeFull": "Закрыть полный экран",
      "alt.terminal": "Иллюстрация терминала аэропорта Бен-Гурион с диспетчерской вышкой и взлетающим самолётом",
      "alt.airplane": "Иллюстрация взлетающего самолёта",
      "alt.error": "Иллюстрация красного предупреждающего треугольника",
      "alt.route": "Панорама Сиэтла — пункт назначения",
      "alt.qrThumb": "Маленький QR-код пропуска",
      "alt.qrFull": "QR-код подтверждения брони для предъявления на досмотре",
      "alt.avatar": "Фото профиля",
      "profile.title": "Мой профиль",
      "profile.name": "Даниэль Коэн",
      "profile.editPhoto": "Изменить фото профиля",
      "profile.save": "Сохранить мои данные",
      "reg.rememberOn": "Мы вас запомним",
      "profile.clear": "Удалить всё сохранённое",
      "profile.clearNote": "Удаляет данные, сохранённые на этом устройстве. Уже подтверждённые брони не затрагиваются.",
      "clear.done": "Удалено {k} ключей и {c} кэшей. Повторная проверка: ничего не осталось.",
      "clear.left": "Удалено частично — осталось {k} ключей и {c} кэшей.",
      "clear.empty": "Нечего удалять — устройство уже чистое.",
      "profile.pickerLabel": "Выбор фото профиля",
      "profile.av.neutral": "Нейтральный аватар",
      "profile.av.male1": "Пассажир",
      "profile.av.male2": "Пассажир в солнцезащитных очках",
      "profile.av.female1": "Пассажирка",
      "profile.av.female2": "Пассажирка в шляпе",
      "profile.av.older": "Пожилой пассажир",
      "profile.av.elderly": "Пожилая пассажирка",
      "profile.av.assistant1": "Цифровой помощник",
      "profile.av.assistant2": "Цифровой помощник подмигивает",
      "notif.title": "Уведомления",
      "notif.beforeFlight": "Напоминание перед следующим рейсом",
      "notif.statusChange": "Уведомление при смене статуса",
      "notif.on": "Вкл",
      "notif.off": "Выкл",
      "lang.title": "Язык",
      "lang.pickerLabel": "Выбор языка",
      "lang.he": "Иврит",
      "lang.en": "Английский",
      "lang.ar": "Арабский",
      "lang.ru": "Русский"
    },
    ar: {
      "app.title": "Leeway — حجز موعد للفحص الأمني في مطار بن غوريون",
      "common.loading": "جارٍ التحميل",
      "common.confirm": "تأكيد",
      "common.continue": "متابعة",
      "common.back": "رجوع",
      "common.backBtn": "رجوع",
      "common.home": "الصفحة الرئيسية",
      "common.edit": "تعديل",
      "common.save": "حفظ",
      "common.done": "تم",
      "common.passportShort": "جواز",
      "menu.title": "القائمة",
      "menu.open": "فتح القائمة",
      "menu.close": "إغلاق القائمة",
      "menu.profile": "ملفي الشخصي",
      "menu.notifications": "الإشعارات",
      "menu.language": "اللغة",
      "landing.h1a": "احجز الآن",
      "landing.h1b": "حتى لا تنتظر في الطابور",
      "landing.newBooking": "احجز موعدًا جديدًا",
      "landing.myBooking": "حجزي",
      "coach.step": "الخطوة {n} من {total}",
      "coach.next": "التالي",
      "coach.done": "لنبدأ",
      "coach.skip": "تخطٍّ",
      "coach.s1.title": "احجزوا نافذة زمنية",
      "coach.s1.body": "رقم الرحلة والاسم، وتختارون نافذة فحص أمني متاحة — قبل مغادرة البيت.",
      "coach.s2.title": "تابعوا يوم الرحلة",
      "coach.s2.body": "تتحدّث البطاقة وحدها خلال اليوم: تسجيل الوصول، الفحص الأمني، وبوابة الصعود.",
      "coach.s3.title": "اعرضوها عند النقطة",
      "coach.s3.body": "عند مدخل الفحص تفتحون الحجز وتعرضون رمز الـ QR. هذا كل شيء.",
      "status.cardTitle": "حالتي",
      "status.note": "معلومات عامة فقط — بدون توقّع الازدحام",
      "status.noneStep": "لا يوجد حجز نشط",
      "status.noneState": "لم يتم اختيار نافذة زمنية بعد",
      "status.h1a": "حالة",
      "status.h1b": "رحلتي",
      "step.checkin": "تسجيل الوصول",
      "step.passenger": "بيانات المسافر",
      "step.time": "اختيار الموعد",
      "step.confirm": "تأكيد الحجز",
      "state.inprogress": "قيد التنفيذ",
      "state.done": "اكتمل",
      "state.waiting": "في الانتظار",
      "reg.h1a": "أدخل",
      "reg.h1b": "بياناتك",
      "reg.h2a": "هل تسافر",
      "reg.h2b": "مع آخرين؟",
      "reg.addPassenger": "+ إضافة مسافر",
      "flight.looking": "جارٍ البحث عن الرحلة…",
      "alt.unknownRoute": "سحب — لم تُحدَّد الوجهة بعد",
      "flight.notFound": "لم نعثر على رقم الرحلة. يمكنك المتابعة على أي حال.",
      "flight.offline": "لا يوجد اتصال — ستُستكمل تفاصيل الرحلة لاحقًا.",
      "flight.found": "{airline} · {route}",
      "reg.removePassenger": "إزالة",
      "aria.removePassenger": "إزالة مسافر",
      "reg.remember": "تذكّرني",
      "reg.passengerN": "مسافر",
      "reg.max": "تم بلوغ الحد الأقصى {n} مسافرين",
      "ph.first": "الاسم الأول",
      "ph.last": "اسم العائلة",
      "ph.passport": "رقم الجواز",
      "ph.flight": "رقم الرحلة",
      "err.first": "يجب إدخال الاسم الأول بأحرف فقط",
      "err.last": "يجب إدخال اسم العائلة بأحرف فقط",
      "err.passport": "رقم الجواز مكوّن من 8 أرقام",
      "err.flight": "مثال على رقم الرحلة: LY 315",
      "err.label.name": "الاسم",
      "err.label.passport": "رقم الجواز",
      "err.label.flight": "رقم الرحلة",
      "fail.h1a": "عذرًا… حدث",
      "fail.h1b": "خطأ ما",
      "fail.badDetails": "البيانات لا تطابق سجل الرحلة. تحقّق من: ",
      "fail.noSlot": "لم يتم اختيار موعد للفحص الأمني.",
      "fail.slotFull": "الموعد {slot} ممتلئ. الرجاء اختيار موعد آخر.",
      "success.h1a": "تم الحجز",
      "success.h1b": "بنجاح",
      "success.track": "تتبّع حالة الرحلة",
      "time.srTitle": "اختيار موعد الفحص الأمني",
      "time.legend": "المواعيد المتاحة للفحص الأمني",
      "time.full": "ممتلئ",
      "time.windowsNote": "تنتهي النوافذ قبل ساعتين من الإقلاع في {time}",
      "time.passengers": "المسافرون",
      "flight.meta": "الثلاثاء · 25.05.2026 · المبنى 3 · البوابة 03",
      "flight.terminal": "المبنى {n}",
      "flight.zone": "منطقة {z}",
      "flight.metaRoute": "{airline} · {city}",
      "flight.departs": "الإقلاع {time}",
      "flight.updated": "حُدِّث إلى {time}",
      "flight.counters": "كاونترات {n}",
      "flight.canceled": "أُلغيت الرحلة",
      "flight.delayed": "تأخّرت الرحلة",
      "flight.departed": "أقلعت الرحلة بالفعل",
      "flight.notOnBoard": "تُفتح لوحة اليوم قبل نحو ثلاثة أيام — عندها يظهر المبنى والوقت.",
      "flight.boardOffline": "لوحة المطار غير متاحة حاليًا — سيُستكمل المبنى والوقت لاحقًا.",
      "pass.label": "بطاقة دخولك",
      "pass.where": "المبنى 3 · البوابة 03",
      "pass.openFull": "فتح ملء الشاشة",
      "tl.identify": "التحقق",
      "tl.security": "الفحص الأمني",
      "tl.eta": "متوقع حتى -",
      "qr.passenger": "مسافر",
      "qr.meta": "الثلاثاء · 25.05 · المبنى 3 · البوابة 03",
      "qr.scan": "امسح عند بوابة الدخول السريع",
      "qr.wallet": "حفظ في Wallet",
      "theme.toDark": "الوضع الداكن",
      "theme.toLight": "الوضع الفاتح",
      "aria.toDark": "التبديل إلى الوضع الداكن",
      "aria.toLight": "التبديل إلى الوضع الفاتح",
      "aria.notifications": "تفعيل الإشعارات",
      "aria.share": "مشاركة الحجز",
      "aria.backToSlots": "العودة لاختيار الموعد",
      "aria.expandCard": "عرض تفاصيل الحجز الكاملة",
      "aria.collapseCard": "إخفاء التفاصيل والعودة إلى نوافذ الوقت",
      "aria.statusCard": "الانتقال إلى حالة الحجز",
      "aria.statusCardEmpty": "لا يوجد حجز نشط — ابدأ حجزًا جديدًا",
      "aria.closeFull": "إغلاق ملء الشاشة",
      "alt.terminal": "رسم توضيحي لمبنى مطار بن غوريون مع برج المراقبة وطائرة مغادرة",
      "alt.airplane": "رسم توضيحي لطائرة مغادرة",
      "alt.error": "رسم توضيحي لمثلث تحذير أحمر",
      "alt.route": "أفق مدينة سياتل — وجهة الرحلة",
      "alt.qrThumb": "رمز QR مصغّر لبطاقة الدخول",
      "alt.qrFull": "رمز QR لتأكيد الحجز لعرضه عند نقطة الفحص",
      "alt.avatar": "صورة الملف الشخصي",
      "profile.title": "ملفي الشخصي",
      "profile.name": "دانيال كوهين",
      "profile.editPhoto": "تعديل صورة الملف الشخصي",
      "profile.save": "حفظ بياناتي",
      "reg.rememberOn": "سنتذكّرك",
      "profile.clear": "احذف كل ما تم حفظه",
      "profile.clearNote": "يحذف البيانات التي حفظتها على هذا الجهاز. لا يؤثر على الحجوزات المؤكدة.",
      "clear.done": "تم حذف {k} مفاتيح و{c} ذاكرات تخزين. عند إعادة الفحص: لم يتبقَّ شيء.",
      "clear.left": "تم الحذف جزئيًا — تبقّى {k} مفاتيح و{c} ذاكرات تخزين.",
      "clear.empty": "لا يوجد ما يُحذف — الجهاز نظيف بالفعل.",
      "profile.pickerLabel": "اختيار صورة الملف الشخصي",
      "profile.av.neutral": "صورة رمزية محايدة",
      "profile.av.male1": "مسافر",
      "profile.av.male2": "مسافر بنظارة شمسية",
      "profile.av.female1": "مسافرة",
      "profile.av.female2": "مسافرة بقبعة",
      "profile.av.older": "مسافر كبير السن",
      "profile.av.elderly": "مسافرة كبيرة السن",
      "profile.av.assistant1": "المساعد الرقمي",
      "profile.av.assistant2": "المساعد الرقمي يغمز",
      "notif.title": "الإشعارات",
      "notif.beforeFlight": "تذكير قبل الرحلة القادمة",
      "notif.statusChange": "تنبيه عند تغيّر الحالة",
      "notif.on": "مفعّل",
      "notif.off": "معطّل",
      "lang.title": "اللغة",
      "lang.pickerLabel": "اختيار اللغة",
      "lang.he": "العبرية",
      "lang.en": "الإنجليزية",
      "lang.ar": "العربية",
      "lang.ru": "الروسية"
    }
  };

  var LANGS = {
    he: { dir: "rtl", heading: '"Heebo","Rubik",system-ui,sans-serif', body: '"Inter","Rubik",system-ui,sans-serif' },
    ar: { dir: "rtl", heading: '"Cairo","Heebo",system-ui,sans-serif', body: '"Cairo","Inter",system-ui,sans-serif' },
    en: { dir: "ltr", heading: '"Heebo","Rubik",system-ui,sans-serif', body: '"Inter","Source Sans 3",system-ui,sans-serif' },
    ru: { dir: "ltr", heading: '"Rubik","Heebo",system-ui,sans-serif', body: '"Inter","Rubik",system-ui,sans-serif' }
  };

  var lang = "he";
  function t(key) {
    var d = I18N[lang] || I18N.he;
    if (d && d[key] != null) return d[key];
    return (I18N.he[key] != null) ? I18N.he[key] : key;
  }
  function qsa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  /* ---------------------------------------------------------------------
     Result titles fit themselves to one line.

     The same sentence is 307px wide in Arabic and 543px in English at the
     design's 40px, against 364px of usable width. One fixed size cannot
     serve both: English would have to drop to 26px, dragging Hebrew and
     Arabic down with it for no reason and breaking the match with the
     Success screen. So each title is measured and keeps the largest size
     that still fits on a single line.

     Measuring needs the element laid out, so this runs when a screen
     arrives — not while it is still hidden, where clientWidth is 0.
     --------------------------------------------------------------------- */
  var TITLE_MAX = 40;      /* the Figma size — nothing grows past it */
  var TITLE_MIN = 22;      /* below this it stops being a display title */
  var TITLE_LEADING = 1.2; /* 48/40, the design's own ratio */

  function fitTitle(el) {
    if (!el) return;
    el.style.whiteSpace = "nowrap";
    var size = TITLE_MAX;
    el.style.fontSize = size + "px";
    el.style.lineHeight = Math.round(size * TITLE_LEADING) + "px";
    if (!el.clientWidth) { el.style.whiteSpace = ""; return; }   /* still hidden */
    while (size > TITLE_MIN && el.scrollWidth > el.clientWidth) {
      size -= 1;
      el.style.fontSize = size + "px";
      el.style.lineHeight = Math.round(size * TITLE_LEADING) + "px";
    }
    /* If even the floor overflows, wrapping beats clipping. */
    if (el.scrollWidth > el.clientWidth) el.style.whiteSpace = "";
  }

  function fitTitlesIn(el) {
    if (!el) return;
    Array.prototype.forEach.call(el.querySelectorAll(".result__title"), fitTitle);
  }

  /* The status title is two words and only the possessive one is blue.
     Word order differs by language, so the possessive is not always the
     same slot: it is the FIRST word in English and Russian ("My status",
     "Мой статус") and the SECOND in Hebrew and Arabic ("סטטוס שלי").
     Marking a fixed span would colour the wrong word in half the languages. */
  var STATUS_ACCENT = { he: "b", en: "a", ru: "a", ar: "b" };

  function paintStatusTitle(code) {
    var slot = STATUS_ACCENT[code] || "b";
    qsa(".page-title h1").forEach(function (h1) {
      var spans = h1.querySelectorAll("span");
      if (spans.length < 2) return;
      spans[0].classList.toggle("is-accent", slot === "a");
      spans[1].classList.toggle("is-accent", slot === "b");
    });
  }

  function applyLanguage(code) {
    if (!LANGS[code]) return;
    lang = code;
    var cfg = LANGS[code], root = document.documentElement;
    root.lang = code;
    root.dir = cfg.dir;
    root.style.setProperty("--typography-family-heading", cfg.heading);
    root.style.setProperty("--typography-family-body", cfg.body);

    qsa("[data-i18n]").forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    /* טקסט ההדרכה נכתב ב-JS לפי השלב, ולכן אינו נושא data-i18n ולא
       מתעדכן בלולאה שמעליו. החלפת שפה באמצע ההדרכה חייבת להחליף גם
       אותו — אחרת המסך מתורגם וההסבר עליו נשאר בעברית. */
    if (typeof paintCoach === "function") paintCoach();
    qsa("[data-i18n-ph]").forEach(function (el) { el.placeholder = t(el.dataset.i18nPh); });
    qsa("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    qsa("[data-i18n-alt]").forEach(function (el) { el.alt = t(el.dataset.i18nAlt); });
    qsa("[data-lang]").forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.lang === code)); });

    if (lastSlot) applySlot(lastSlot);
    applyTheme(theme);
    paintStatusTitle(code);       /* the accented word moves between languages */
    fitTitlesIn(document);        /* the sentence just changed length */
    var photo = document.getElementById("route-photo");
    if (photo) photo.alt = t("alt.route");
    /* applyLanguage() has just overwritten every [data-i18n] node with the
       dictionary default, including the two that carry state: the
       "remember me" label and the saved profile name. Put them back. */
    if (typeof syncStatefulLabels === "function") syncStatefulLabels();
    /* The passenger rows and the pass names are generated, not marked up,
       so applyLanguage()'s [data-i18n] sweep cannot reach them. */
    if (typeof renderPassengers === "function") renderPassengers();
    /* applyLanguage() has just written the dictionary's demo meta over the
       live one; the weekday and the labels are language-dependent anyway. */
    if (flightInfo) applyFlightMeta(flightInfo);
    if (typeof paintSlotsNote === "function") paintSlotsNote(flightInfo);
  }

  /* ---------------------------------------------------------------------
     Destination photo per flight route.
     Add a route = add one line here and one file in assets/images/.
     --------------------------------------------------------------------- */
  var ROUTE_PHOTOS = {
    "TLV-SEA": { src: "assets/images/route-tlv-sea.png", altKey: "alt.route" }
  };

  /* =====================================================================
     Flight lookup + destination photo — three free, keyless, CORS-enabled
     APIs. None of them is ever sent a name or a passport number; the flight
     number and the destination city are the only things that leave the
     device, exactly as privacy.html says.

     data.gov.il     the airport's OWN board: date, departure time, terminal,
                     check-in zone and counters for this exact flight.
     adsbdb.com      turns "LY315" into airline + origin + destination, and
                     is the fallback for flights the board does not carry.
     Wikipedia       turns the destination city into a photo.

     Both were chosen because a static site on GitHub Pages cannot do
     anything else: it has no server to hide a key in, and a key shipped in
     this file would be readable by anyone. Verified before use — both send
     Access-Control-Allow-Origin: * and neither needs credentials.

     Everything here is ENRICHMENT. The form validates the flight number
     locally, as it always did, and submitting never waits on the network.
     Offline, or an unknown number, costs the traveller nothing.
     ===================================================================== */
  var ADSBDB = "https://api.adsbdb.com/v0";
  var WIKI = "https://en.wikipedia.org/w/api.php";
  var LOOKUP_TIMEOUT = 6000;
  var flightCache = {};             /* in memory only — never written to disk */
  var lookupSeq = 0;

  /* Returned instead of null when the request never reached the server at
     all. "We couldn't find that flight" and "your connection is down" are
     different facts, and telling a traveller the first when the second is
     true sends them hunting for a mistake they did not make. */
  var UNREACHABLE = { unreachable: true };

  function fetchJSON(url) {
    /* AbortController so a slow lookup cannot pile up behind a fast typist. */
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = window.setTimeout(function () { if (ctrl) ctrl.abort(); }, LOOKUP_TIMEOUT);
    return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (r) {
        if (r.ok) return r.json();
        /* A 404 is a real answer: that callsign has no route on file. */
        return r.status === 404 ? null : UNREACHABLE;
      })
      .catch(function () { return UNREACHABLE; })   /* offline, DNS, timeout, CORS */
      .then(function (v) { window.clearTimeout(timer); return v; });
  }

  /* "LY 315" / "ly315" -> { iata: "LY", num: "315" } */
  function parseFlight(raw) {
    /* Same shape as RULES.flight above — see the note there on 6H / A3 / W6. */
    var m = String(raw || "").trim().toUpperCase()
      .match(/^([A-Z][A-Z0-9]|[0-9][A-Z])\s?(\d{1,4})$/);
    return m ? { iata: m[1], num: m[2] } : null;
  }

  /* adsbdb routes are keyed by ICAO callsign (ELY315), not IATA (LY315),
     so the airline endpoint is asked for the ICAO code first.

     This is the FALLBACK source: it knows where a flight number goes, but
     it is a route database, not a schedule — no date, no time, no terminal.
     Those come from the airport's own board in lookupBoard() below. */
  function lookupRoute(parsed) {
    return fetchJSON(ADSBDB + "/airline/" + encodeURIComponent(parsed.iata))
      .then(function (a) {
        if (a === UNREACHABLE) return UNREACHABLE;
        var list = a && a.response;
        var icao = list && list[0] && list[0].icao;
        if (!icao) return null;
        return fetchJSON(ADSBDB + "/callsign/" + encodeURIComponent(icao + parsed.num))
          .then(function (c) {
            if (c === UNREACHABLE) return UNREACHABLE;
            var fr = c && c.response && c.response.flightroute;
            if (!fr || !fr.origin || !fr.destination) return null;
            return {
              airline: (fr.airline && fr.airline.name) || list[0].name,
              from: fr.origin.iata_code,
              to: fr.destination.iata_code,
              city: fr.destination.municipality || "",
              toName: fr.destination.name || ""
            };
          });
      });
  }

  /* =====================================================================
     The live Ben Gurion board — data.gov.il, the Israel Airports Authority's
     own departures and arrivals feed, published as open data.

     This is what makes the date, the departure time, the terminal and the
     check-in zone on the card REAL instead of the demo values from the Figma
     frame. It was chosen for the same two reasons adsbdb and Wikipedia were:
     it needs no API key (a static site on GitHub Pages has nowhere to hide
     one) and it answers with Access-Control-Allow-Origin: *.

     What it will NOT do, and why the fallback below still exists: the board
     is a rolling window of roughly the next three days. A flight further out
     than that is simply not on it yet, and inventing a terminal for it would
     be worse than leaving it blank.
     ===================================================================== */
  var IAA = "https://data.gov.il/api/3/action/datastore_search";
  var IAA_RESOURCE = "e83f763b-b7d7-479e-b172-ae981ddc6de5";
  var IAA_FIELDS = "CHOPER,CHFLTN,CHOPERD,CHSTOL,CHPTOL,CHLOC1,CHLOC1T,CHLOC1TH," +
                   "CHTERM,CHCINT,CHCKZN,CHRMINE,CHRMINH";
  /* A flight in one of these states is behind us; the next one on the board
     is the one the traveller means. */
  var BOARD_GONE = { "DEPARTED": 1, "LANDED": 1, "CANCELED": 1 };

  function boardURL(parsed) {
    var n = parsed.num.replace(/^0+/, "") || "0";
    /* CHFLTN is stored zero-padded to three characters — LY 3 is "003" — so
       an exact-match filter has to ask for every padding the board may hold. */
    var nums = [n, ("00" + n).slice(-3), ("000" + n).slice(-4)];
    var filters = { CHOPER: parsed.iata, CHAORD: "D", CHFLTN: nums };
    return IAA +
      "?resource_id=" + encodeURIComponent(IAA_RESOURCE) +
      "&fields=" + encodeURIComponent(IAA_FIELDS) +
      "&sort=" + encodeURIComponent("CHSTOL asc") +
      "&limit=8" +
      "&filters=" + encodeURIComponent(JSON.stringify(filters));
  }

  /* "LONDON" / "NEW YORK" -> "London" / "New York", because Wikipedia is
     asked for a page title, not for a boarding-card shout. */
  function titleCase(str) {
    return String(str || "").toLowerCase().replace(/(^|[\s\-'])([a-z])/g, function (m, pre, ch) {
      return pre + ch.toUpperCase();
    });
  }

  function lookupBoard(parsed) {
    return fetchJSON(boardURL(parsed)).then(function (d) {
      if (d === UNREACHABLE) return UNREACHABLE;
      var recs = d && d.result && d.result.records;
      if (!recs || !recs.length) return null;

      var pick = null;
      for (var i = 0; i < recs.length; i++) {
        if (!BOARD_GONE[String(recs[i].CHRMINE || "").toUpperCase()]) { pick = recs[i]; break; }
      }
      /* Every one of them has already gone — show the most recent rather
         than nothing, and let the status line say so. */
      if (!pick) pick = recs[recs.length - 1];

      return {
        airline: titleCase(pick.CHOPERD) || parsed.iata,
        from: "TLV",                       /* CHAORD "D" — a departure from TLV */
        to: pick.CHLOC1 || "",
        city: titleCase(pick.CHLOC1T),
        cityLocal: pick.CHLOC1TH || "",
        toName: titleCase(pick.CHLOC1T),
        dep: pick.CHSTOL || "",
        depUpdated: pick.CHPTOL || "",
        terminal: (pick.CHTERM == null || pick.CHTERM === "") ? "" : String(pick.CHTERM),
        zone: pick.CHCKZN || "",
        counters: pick.CHCINT || "",
        status: String(pick.CHRMINE || "").toUpperCase()
      };
    });
  }

  /* The board first — it is the airport speaking about this exact departure.
     Only when it has nothing do we fall back to the route database, and the
     card then shows what we actually know and no more. */
  function lookupFlight(parsed) {
    var key = parsed.iata + parsed.num;
    if (flightCache[key]) return Promise.resolve(flightCache[key]);
    return lookupBoard(parsed).then(function (board) {
      if (board && board !== UNREACHABLE) { flightCache[key] = board; return board; }
      var boardUnreachable = board === UNREACHABLE;
      return lookupRoute(parsed).then(function (route) {
        if (route && route !== UNREACHABLE) {
          /* "the board has not opened for this flight yet" and "we could not
             reach the board" are different facts, and the note must not tell
             the traveller the first when the second is true. A result that
             only got this far is deliberately NOT cached — the board may be
             back before the next keystroke. */
          route.boardDown = boardUnreachable;
          if (!boardUnreachable) flightCache[key] = route;
          return route;
        }
        /* Neither source answered. If the board was merely silent but the
           route database was unreachable, that is a network problem. */
        return (boardUnreachable || route === UNREACHABLE) ? UNREACHABLE : null;
      });
    });
  }

  /* Wikipedia gives a right-sized thumbnail, so the phone is not made to
     download an 8000px original just to fill a 343px card. */
  function lookupCityPhoto(city) {
    if (!city) return Promise.resolve(null);
    var url = WIKI + "?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=800" +
              "&titles=" + encodeURIComponent(city) + "&format=json&origin=*";
    return fetchJSON(url).then(function (d) {
      var pages = d && d.query && d.query.pages;
      if (!pages) return null;
      for (var id in pages) {
        var thumb = pages[id].thumbnail;
        if (thumb && thumb.source) return thumb.source;
      }
      return null;
    });
  }

  /* The route and photo the markup shipped with. A lookup that fails must
     fall back to these rather than leaving the PREVIOUS flight's route on
     the card — otherwise an unrecognised number silently inherits the last
     recognised one, which is worse than showing nothing. */
  var routeDefaults = null;

  function captureRouteDefaults() {
    if (routeDefaults) return;
    var el = document.querySelector("[data-route]");
    var photo = document.getElementById("route-photo");
    routeDefaults = {
      label: el ? el.textContent.trim() : "",
      src: photo ? photo.getAttribute("src") : "",
      alt: photo ? photo.getAttribute("alt") : ""
    };
  }

  /* =====================================================================
     Turning a board record into the two meta lines.

     Times arrive as "2026-09-02T10:10:00" with no offset — that is Ben
     Gurion's wall clock. They are read with a regex and never through
     Date.parse, so a phone set to another timezone cannot shift a 10:10
     departure to 07:10. The only Date built here is a date-only one, used
     purely to name the weekday.
     ===================================================================== */
  var flightInfo = null;            /* the last successful lookup, or null */

  function parseBoardTime(raw) {
    var m = String(raw || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    return m ? { y: +m[1], mo: +m[2], d: +m[3], hm: m[4] + ":" + m[5] } : null;
  }

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function weekdayName(date) {
    if (!date || !window.Intl || !window.Intl.DateTimeFormat) return "";
    try {
      return new Intl.DateTimeFormat(lang, { weekday: "short" }).format(date);
    } catch (err) { return ""; }
  }

  /* Minutes past midnight of the first time in "19:00-19:20". */
  function slotStartMinutes(raw) {
    var m = String(raw || "").match(/(\d{1,2}):(\d{2})/);
    return m ? (+m[1]) * 60 + (+m[2]) : null;
  }

  /* The windows are built backwards from take-off, so for a 00:05 departure
     they land on the evening BEFORE the flight. The boarding pass is shown
     at the security check, not at the aircraft, so it has to carry the
     window's own date — otherwise it reads 03.09 next to 19:00 and sends
     someone to the airport a full day late. */
  function windowDayShift(info) {
    var p = parseBoardTime(info && info.dep);
    var win = slotStartMinutes(lastSlot);
    if (!p || win == null) return 0;
    var dep = slotStartMinutes(p.hm);
    return (dep != null && win > dep) ? -1 : 0;
  }

  /* The card carries the full year and stops at the terminal; the boarding
     pass drops the year and adds the check-in zone. That is not decoration:
     with the year in place a fourth segment pushes the card's meta onto a
     second line, and the zone is check-in information anyway — on the card
     it rides with the counters, one line further down. */
  function metaLine(info, opts) {
    opts = opts || {};
    var out = [], p = parseBoardTime(info.dep);
    if (p) {
      /* Date arithmetic, not string arithmetic: a shift of one day off the
         first of the month has to roll the month, and the year with it. */
      var on = new Date(p.y, p.mo - 1, p.d + (opts.dayShift || 0));
      var day = weekdayName(on);
      if (day) out.push(day);
      out.push(pad2(on.getDate()) + "." + pad2(on.getMonth() + 1) +
               (opts.year ? "." + on.getFullYear() : ""));
    }
    if (info.terminal) out.push(fmt(t("flight.terminal"), { n: info.terminal }));
    if (opts.zone && info.zone) out.push(fmt(t("flight.zone"), { z: info.zone }));
    if (out.length) return out.join(" · ");

    /* Not on the board: say what the route database gave us and stop.
       A terminal we do not know must not be filled in with a plausible one. */
    var city = (lang === "he" && info.cityLocal) ? info.cityLocal : (info.city || info.to || "");
    if (!info.airline && !city) return "";
    return fmt(t("flight.metaRoute"), { airline: info.airline || "", city: city })
             .replace(/^ · | · $/g, "");
  }

  function whenLine(info) {
    var p = parseBoardTime(info.dep);
    if (!p) return "";
    var bits = [fmt(t("flight.departs"), { time: p.hm })];
    var upd = parseBoardTime(info.depUpdated);
    if (upd && upd.hm !== p.hm) bits.push(fmt(t("flight.updated"), { time: upd.hm }));
    if (info.zone) bits.push(fmt(t("flight.zone"), { z: info.zone }));
    if (info.counters) bits.push(fmt(t("flight.counters"), { n: info.counters }));
    return bits.join(" · ");
  }

  var BOARD_STATUS_KEY = {
    "CANCELED": "flight.canceled",
    "DELAYED": "flight.delayed",
    "DEPARTED": "flight.departed"
  };

  function writeText(sel, text) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.textContent = text || "";
    el.hidden = !text;
  }

  function applyFlightMeta(info) {
    if (!info) return;
    var card = document.querySelector("[data-flight-meta]");
    var qr = document.querySelector("[data-qr-meta]");
    /* The card describes the FLIGHT, so it keeps the flight's own date.
       The pass describes the security window, so it follows that. */
    if (card) card.textContent = metaLine(info, { year: true });
    if (qr) qr.textContent = metaLine(info, { zone: true, dayShift: windowDayShift(info) });
    writeText("[data-flight-when]", whenLine(info));
    var key = BOARD_STATUS_KEY[info.status];
    writeText("[data-flight-status]", key ? t(key) : "");
  }

  /* Two different "no data" cases, and they must not look the same.

     blank=false — the field is empty or not a flight number yet, so the card
     goes back to the frame the file shipped with. The meta nodes still carry
     their data-i18n, so the dictionary stays the single source for that text.

     blank=true — a number WAS typed and we could not identify it. Restoring
     the demo line here would put a specific, plausible, wrong terminal in
     front of the traveller, which reads as an answer rather than as "we
     don't know". Same reasoning as showUnknownRoute()'s neutral sky. */
  function resetFlightMeta(blank) {
    flightInfo = null;
    qsa("[data-flight-meta], [data-qr-meta]").forEach(function (el) {
      el.textContent = (!blank && el.dataset.i18n) ? t(el.dataset.i18n) : "";
    });
    writeText("[data-flight-when]", "");
    writeText("[data-flight-status]", "");
    /* No flight, no schedule to hang the grid on — back to the shipped nine. */
    if (typeof resetSlotWindows === "function") resetSlotWindows();
  }

  /* When the flight cannot be identified, the card must not fall back to the
     shipped TLV-SEA demo route. Showing a specific wrong destination is worse
     than showing none: it does not read as "unknown", it reads as an answer.
     So the card carries the number the traveller actually typed, over a
     neutral sky rather than a city they are not flying to. */
  function showUnknownRoute(raw) {
    resetFlightMeta(true);      /* never keep — or invent — a terminal */
    var label = String(raw || "").trim().toUpperCase();
    qsa("[data-route]").forEach(function (el) { el.textContent = label; });
    var photo = document.getElementById("route-photo");
    if (!photo) return;
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    photo.src = dark ? "assets/images/illustration-clouds-dark.png"
                     : "assets/images/illustration-clouds.png";
    photo.alt = t("alt.unknownRoute");
    photo.setAttribute("data-src-light", "assets/images/illustration-clouds.png");
    photo.setAttribute("data-src-dark", "assets/images/illustration-clouds-dark.png");
  }

  function resetFlightRoute() {
    resetFlightMeta();
    if (!routeDefaults) return;
    qsa("[data-route]").forEach(function (el) { el.textContent = routeDefaults.label; });
    var photo = document.getElementById("route-photo");
    if (!photo || !routeDefaults.src) return;
    photo.removeAttribute("data-src-light");
    photo.removeAttribute("data-src-dark");
    photo.src = routeDefaults.src;
    photo.alt = routeDefaults.alt;
  }

  function setLookupNote(state, text) {
    var el = document.querySelector("[data-flight-info]");
    if (!el) return;
    if (!state) { el.hidden = true; el.textContent = ""; el.removeAttribute("data-state"); return; }
    el.hidden = false;
    el.setAttribute("data-state", state);
    el.textContent = text;
  }

  /* Applies whatever the lookup found to the flight cards and the photo.
     Called only on success, so a failed lookup leaves the shipped defaults
     exactly as they were. */
  function applyFlightRoute(info) {
    var label = info.from + "-" + info.to;
    qsa("[data-route]").forEach(function (el) { el.textContent = label; });
    flightInfo = info;
    applyFlightMeta(info);
    applySlotWindows(info);

    var photo = document.getElementById("route-photo");
    if (!photo) return;
    photo.removeAttribute("data-src-light");   /* no longer the neutral sky */
    photo.removeAttribute("data-src-dark");
    var local = ROUTE_PHOTOS[label];
    if (local) { photo.src = local.src; photo.alt = t(local.altKey); return; }
    lookupCityPhoto(info.city).then(function (src) {
      if (!src) return;                       /* keep the bundled photo */
      photo.src = src;
      photo.alt = info.city || info.toName || t("alt.route");
    });
  }

  function runFlightLookup(raw) {
    var parsed = parseFlight(raw);
    if (!parsed) { setLookupNote(null); resetFlightRoute(); return; }
    if (!navigator.onLine) {
      setLookupNote("offline", t("flight.offline"));
      showUnknownRoute(raw);
      return;
    }

    var seq = ++lookupSeq;
    setLookupNote("looking", t("flight.looking"));
    lookupFlight(parsed).then(function (info) {
      if (seq !== lookupSeq) return;          /* a newer lookup already won */
      if (info === UNREACHABLE) {
        /* Say nothing about the number itself — we never got to ask. */
        setLookupNote("offline", t("flight.offline"));
        showUnknownRoute(raw);
        return;
      }
      if (!info) {
        setLookupNote("notfound", t("flight.notFound"));
        showUnknownRoute(raw);
        return;
      }
      var note = fmt(t("flight.found"), {
        airline: info.airline, route: info.from + " → " + info.to
      });
      if (info.dep) {
        note += " · " + metaLine(info, { zone: true });
      } else {
        /* The route is known but there is no board record. Saying which of
           the two reasons applies is better than a card that quietly drops
           the terminal. */
        note += " · " + t(info.boardDown ? "flight.boardOffline" : "flight.notOnBoard");
      }
      setLookupNote("found", note);
      applyFlightRoute(info);
    });
  }

  /* Delegated from document, not bound to the form element, because the
     lookup engine is defined before `form` is assigned. Debounced at 500ms
     so a typist is not chased down the wire on every keystroke. */
  var flightTimer;
  document.addEventListener("input", function (e) {
    if (!e.target || e.target.name !== "flight-1") return;
    var val = e.target.value;
    /* Drop the previous answer the instant the number changes. Without this
       the old airline and route stay on screen during the debounce, which
       reads as though they belong to the number now in the field. */
    setLookupNote(null);
    lookupSeq++;                       /* orphan any lookup still in flight */
    window.clearTimeout(flightTimer);
    flightTimer = window.setTimeout(function () { runFlightLookup(val); }, 500);
  });

  /* If the number was typed while offline, try again the moment we're back. */
  window.addEventListener("online", function () {
    var el = document.querySelector('[name="flight-1"]');
    if (el && el.value) runFlightLookup(el.value);
  });

  /* ---------------------------------------------------------------------
     Transition table — "from>to". `dir` follows Figma's own semantics:
     "Move in · Left" means the incoming frame travels leftwards, so it
     enters from the trailing edge of the viewport.
     --------------------------------------------------------------------- */
  var T = {
    "loading-1>loading-2":            { type: "dissolve", ms: 300, ease: "out" },
    "loading-2>landing":              { type: "move", dir: "left", ms: 500, ease: "out" },
    "landing>registration":           { type: "move", dir: "left", ms: 400, ease: "out" },
    "landing>status":                 { type: "move", dir: "right", ms: 500, ease: "out" },
    "registration>time-choosing":     { type: "smart", ms: 300, ease: "out" },
    "registration>landing":           { type: "move", dir: "right", ms: 500, ease: "out" },
    /* time-choosing>time-extended נמחק: המעבר בין הכרטיס המורחב לחלונות
       הזמן הוא כבר לא החלפת מסך אלא פתיחה וסגירה בתוך המסך — ראו
       setCardOpen(). */
    "time-choosing>success":          { type: "smart", ms: 500, ease: "out" },
    "time-choosing>landing":          { type: "move", dir: "right", ms: 500, ease: "out" },
    "success>status":                 { type: "move", dir: "left", ms: 500, ease: "out" },
    "success>landing":                { type: "move", dir: "right", ms: 300, ease: "linear" },
    "success>time-choosing":          { type: "smart", ms: 300, ease: "in" },
    "fail>landing":                   { type: "move", dir: "right", ms: 300, ease: "linear" },
    "status>status-qr":               { type: "smart", ms: 300, ease: "out" },
    "status-qr>status":               { type: "smart", ms: 300, ease: "out" },
    "status>landing":                 { type: "move", dir: "right", ms: 500, ease: "out" },
    "status-qr>landing":              { type: "move", dir: "right", ms: 500, ease: "out" },
    /* The three settings screens have no Figma prototype arrows — the menu
       was never wired in the file — so these follow the same grammar as the
       rest: forward slides in like landing>registration, home like the logo. */
    "profile>landing":                { type: "move", dir: "right", ms: 500, ease: "out" },
    "notifications>landing":          { type: "move", dir: "right", ms: 500, ease: "out" },
    "language>landing":               { type: "move", dir: "right", ms: 500, ease: "out" }
  };
  ["profile", "notifications", "language"].forEach(function (name) {
    Object.keys(screensList()).forEach(function (from) {
      if (from !== name) T[from + ">" + name] = { type: "move", dir: "left", ms: 400, ease: "out" };
    });
  });
  function screensList() { return screens; }
  var DEFAULT_T = { type: "smart", ms: 300, ease: "out" };

  var EASE = { out: "var(--ease-out)", "in": "var(--ease-in)", linear: "var(--ease-linear)" };

  var current = "loading-1";
  var history = [];

  function transitionFor(from, to) {
    return T[from + ">" + to] || DEFAULT_T;
  }

  function animateIn(el, t) {
    if (reduced) return null;
    el.style.setProperty("--duration", t.ms + "ms");
    el.style.setProperty("--ease", EASE[t.ease] || EASE.out);
    var cls =
      t.type === "dissolve" ? "anim-dissolve-in" :
      t.type === "move" ? (t.dir === "right" ? "anim-move-in-right" : "anim-move-in-left") :
      "anim-smart-in";
    el.classList.add(cls, "is-entering");
    return cls;
  }

  function animateOut(el, t) {
    if (reduced) return null;
    // Figma "Move in" leaves the outgoing frame in place — only dissolve and
    // smart animate fade it out.
    if (t.type === "move") { el.classList.add("is-leaving"); return null; }
    el.style.setProperty("--duration", t.ms + "ms");
    el.style.setProperty("--ease", EASE[t.ease] || EASE.out);
    var cls = t.type === "dissolve" ? "anim-dissolve-out" : "anim-smart-out";
    el.classList.add(cls, "is-leaving");
    return cls;
  }

  function cleanup(el, cls) {
    if (cls) el.classList.remove(cls);
    el.classList.remove("is-entering", "is-leaving");
    el.style.removeProperty("--duration");
    el.style.removeProperty("--ease");
  }

  var busy = false;

  function go(to, opts) {
    opts = opts || {};
    if (busy || !screens[to]) return;
    /* Tapping the menu entry for the screen you are already on should still
       dismiss the menu, otherwise it looks frozen. */
    if (to === current) { closeMenu(); return; }
    var from = current;
    var fromEl = screens[from];
    var toEl = screens[to];
    var t = opts.transition || transitionFor(from, to);

    busy = true;
    if (!opts.isBack) history.push(from);
    closeMenu(true);

    toEl.hidden = false;
    toEl.scrollTop = 0;
    var inCls = animateIn(toEl, t);
    var outCls = animateOut(fromEl, t);

    var done = function () {
      cleanup(toEl, inCls);
      cleanup(fromEl, outCls);
      fromEl.hidden = true;
      current = to;
      busy = false;
      var h = toEl.querySelector("h1");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
      onScreenArrived(to, toEl);
    };

    if (reduced) { done(); return; }
    window.setTimeout(done, t.ms);
  }

  /* everything that should happen only after a screen has settled */
  function onScreenArrived(name, el) {
    if (typeof advanceProgress === "function") advanceProgress(el);
    fitTitlesIn(el);
    /* ההדרכה שייכת למסך הבית בלבד. קיצור דרך בכתובת (?screen=...) חולף
       דרך הבית בדרך ליעד — שם אין למי להסביר, ולכן היא לא נפתחת. */
    if (name === "landing" && !shortcutScreen) {
      coachTimer = window.setTimeout(openCoach, COACH_DELAY);
    } else {
      closeCoach();
    }
    /* המסך תמיד נפתח על מצב הבחירה, גם כשחוזרים אליו מ-Success. */
    if (name === "time-choosing") setCardOpen(false, false);
    if (name === "success") {
      var art = el.querySelector(".result__art");
      if (art) {
        art.classList.remove("result__art--celebrate");
        void art.offsetWidth;                 /* restart the animation */
        art.classList.add("result__art--celebrate");
      }
    }
  }

  function back() {
    var to = history.pop();
    if (!to) { go("landing", { isBack: true }); return; }
    go(to, { isBack: true, transition: { type: "move", dir: "right", ms: 300, ease: "out" } });
  }

  /* ---------------------------------------------------------------------
     Theme. The phone's own light/dark setting decides how the page opens.
     The switch on the Landing page (and in the menu) overrides that for the
     rest of the visit — once the traveller has chosen, we stop following the
     system, even if they change it mid-session.
     The choice lives in memory only: the whole product is one page, so it
     survives every screen change without touching browser storage.
     To pin the product to light regardless of the phone, change the line
     marked SYSTEM SEED below to   var theme = "light";
     --------------------------------------------------------------------- */
  var THEME_COLORS = { light: "#1e5aba", dark: "#b6975b" };
  var themeChosenByUser = false;
  /* SYSTEM SEED — החלטת מוצר: המוצר נפתח תמיד בבהיר, בלי קשר להגדרת
     הטלפון. מי שרוצה כהה מקבל אותו בהקשה אחת על המתג. */
  var theme = "light";

  function applyTheme(next) {
    theme = next;
    var root = document.documentElement;
    if (next === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");

    Array.prototype.forEach.call(document.querySelectorAll("[data-src-dark]"), function (img) {
      var want = next === "dark" ? img.dataset.srcDark : img.dataset.srcLight;
      if (want && !img.src.endsWith(want)) img.src = want;
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-theme-toggle]"), function (btn) {
      btn.setAttribute("aria-pressed", String(next === "dark"));
      var label = btn.querySelector("[data-theme-label]");
      if (label) label.textContent = t(next === "dark" ? "theme.toLight" : "theme.toDark");
      btn.setAttribute("aria-label", t(next === "dark" ? "aria.toLight" : "aria.toDark"));
    });

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[next]);
  }
  applyTheme(theme);

  /* The phone's setting is deliberately NOT followed any more. Light is the
     product's default, and the toggle is the only thing that changes it —
     otherwise changing the phone's theme mid-visit would silently override
     a choice the traveller already made. */

  /* ---------------------------------------------------------------------
     Overlay menu — the hamburger is unconnected in the Figma prototype,
     so this wiring is added here to make the menu reachable.
     --------------------------------------------------------------------- */
  var menuBurger = overlay.querySelector(".hamburger");

  function openMenu() {
    if (overlay.open) return;
    overlay.showModal();                 /* <dialog> gives focus-trap + Escape */
    var panel = overlay.querySelector(".overlay__panel");
    if (panel) panel.focus({ preventScroll: true });   /* not the close button */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (menuBurger) menuBurger.classList.add("is-open");   /* the morph */
      });
    });
  }

  function closeMenu(instant) {
    if (!overlay.open) return;
    if (menuBurger) menuBurger.classList.remove("is-open");
    if (instant || reduced) { overlay.close(); return; }
    window.setTimeout(function () { if (overlay.open) overlay.close(); }, 220);
  }

  /* Escape and the backdrop are handled by <dialog> itself */
  overlay.addEventListener("cancel", function () {
    if (menuBurger) menuBurger.classList.remove("is-open");
  });
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeMenu();   /* tap outside the panel */
  });

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-theme-toggle]")) {
      themeChosenByUser = true;
      applyTheme(theme === "dark" ? "light" : "dark");
      return;
    }
    if (e.target.closest("[data-coach-skip]")) { closeCoach(); return; }
    if (e.target.closest("[data-coach-next]")) { coachNext(); return; }
    var t = e.target.closest("[data-menu-open]");
    if (t) { openMenu(); return; }
    if (e.target.closest("[data-menu-close]")) { closeMenu(); return; }

    var goEl = e.target.closest("[data-go]");
    if (goEl) { go(goEl.dataset.go); return; }
    if (e.target.closest("[data-back]")) {
      /* בזמן שהכרטיס פתוח "חזרה" היא סגירה שלו, לא יציאה מהמסך — זה
         היה עד היום מעבר בין שני מסכים, והמשמעות נשמרת. */
      if (current === "time-choosing" && cardOpen) { setCardOpen(false); return; }
      back();
      return;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var el = e.target.closest('[data-go][role="button"], [data-go][tabindex]');
    if (el) { e.preventDefault(); go(el.dataset.go); return; }
    /* Elements that are back controls but are not real <button>s (the masked
       slot strip) get no free Enter/Space from the browser. */
    var backEl = e.target.closest('[data-back][role="button"], [data-back][tabindex]');
    if (backEl) { e.preventDefault(); back(); }
  });

  /* ---------------------------------------------------------------------
     Swipe back, on every screen.

     Direction is not a matter of taste: back() animates with
     slide-from-start, so the incoming screen begins at translateX(-100%)
     and travels rightwards. The gesture that drives that motion is a drag
     to the RIGHT, and that is the only direction accepted.

     Deliberately not edge-only — the ask was an easier way back from
     anywhere. The guards are what keep that safe:
       · a gesture starting inside a sideways scroller (the avatar lane)
         belongs to that scroller, not to us;
       · if the finger travelled further down than across it was a scroll;
       · two fingers is a pinch;
       · the menu dialog and the splash screens are left alone.
     --------------------------------------------------------------------- */
  var SWIPE_MIN = 70;        /* px travelled before it counts as a swipe */
  var SWIPE_RATIO = 1.6;     /* horizontal must beat vertical by this    */
  var SWIPE_MAX_MS = 800;    /* slower than this is a drag, not a swipe  */
  var NO_SWIPE = { "loading-1": 1, "loading-2": 1 };
  var swipe = null;

  function scrollsSideways(node) {
    while (node && node !== document.body) {
      if (node.scrollWidth > node.clientWidth + 1) {
        var ox = window.getComputedStyle(node).overflowX;
        if (ox === "auto" || ox === "scroll") return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  document.addEventListener("touchstart", function (e) {
    swipe = null;
    if (e.touches.length !== 1) return;
    if (overlay.open) return;
    if (NO_SWIPE[current]) return;
    if (scrollsSideways(e.target)) return;
    var t = e.touches[0];
    swipe = { x: t.clientX, y: t.clientY, at: Date.now() };
  }, { passive: true });

  document.addEventListener("touchmove", function (e) {
    if (swipe && e.touches.length !== 1) swipe = null;   /* became a pinch */
  }, { passive: true });

  document.addEventListener("touchcancel", function () { swipe = null; }, { passive: true });

  /* Rotating the phone changes the available width, so the titles are
     re-fitted. Debounced — resize fires continuously during rotation. */
  var refitTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(refitTimer);
    refitTimer = window.setTimeout(function () { fitTitlesIn(document); }, 150);
  });

  document.addEventListener("touchend", function (e) {
    var s = swipe;
    swipe = null;
    if (!s) return;
    var t = e.changedTouches && e.changedTouches[0];
    if (!t) return;
    if (Date.now() - s.at > SWIPE_MAX_MS) return;
    var dx = t.clientX - s.x;
    var dy = t.clientY - s.y;
    if (dx < SWIPE_MIN) return;                       /* rightwards only */
    if (dx < Math.abs(dy) * SWIPE_RATIO) return;      /* that was a scroll */
    back();
  }, { passive: true });

  /* ---------------------------------------------------------------------
     Pressed state. On touch this carries the whole load — there is no
     hover. pointercancel matters: if the tap turns into a scroll the
     browser cancels it, and without this the control would stay shrunk.
     --------------------------------------------------------------------- */
  var PRESSABLE = ".btn, .slot, .status-card, .flight-card, .icon-btn, .theme-toggle," +
                  ".lang, .lang-switch__btn, .avatar-lane__item, .settings__link," +
                  ".overlay__link, .add-passenger, .link-btn, .hamburger," +
                  ".passenger__remove," +
                  '.logo[role="button"], .pass-shell[role="button"], .slots__mask';

  document.addEventListener("pointerdown", function (e) {
    var el = e.target.closest(PRESSABLE);
    if (!el || el.disabled || el.getAttribute("aria-busy") === "true") return;
    el.setAttribute("data-pressed", "");
  }, { passive: true });

  function clearPressed() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-pressed]"), function (el) {
      el.removeAttribute("data-pressed");
    });
  }
  /* NOTE: element "blur" must NOT be in this list. It fires on mousedown as
     focus moves, which would clear the press state in the same tick it was
     set. Window blur (tab switch) is a legitimate cancel; element blur is not. */
  document.addEventListener("pointerup", clearPressed, { passive: true });
  document.addEventListener("pointercancel", clearPressed, { passive: true });
  window.addEventListener("blur", clearPressed);

  /* ---------------------------------------------------------------------
     Progress bar fill
     --------------------------------------------------------------------- */
  var PCT = { 1: 0, 2: 50, 3: 100 };
  var lastStep = 1;

  function paintProgress(bar, step, fromStep) {
    bar.style.setProperty("--progress-fill", PCT[fromStep] + "%");
    var dots = bar.querySelectorAll(".progress__dot");
    var labels = bar.querySelectorAll(".progress__label");
    for (var i = 0; i < dots.length; i++) dots[i].classList.toggle("is-done", i < fromStep);
    for (var j = 0; j < labels.length; j++) labels[j].classList.toggle("is-current", j === step - 1);
    /* two frames: the first commits the start value, the second animates */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        bar.style.setProperty("--progress-fill", PCT[step] + "%");
        for (var k = 0; k < dots.length; k++) dots[k].classList.toggle("is-done", k < step);
      });
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-progress]"), function (bar) {
    paintProgress(bar, parseInt(bar.dataset.progress, 10), parseInt(bar.dataset.progress, 10));
  });

  /* called by go() once the screen transition has landed */
  function advanceProgress(screenEl) {
    var bar = screenEl.querySelector("[data-progress]");
    if (!bar) return;
    var step = parseInt(bar.dataset.progress, 10);
    paintProgress(bar, step, lastStep);
    lastStep = step;
  }

  /* ---------------------------------------------------------------------
     Splash sequence — Loading 1 (logo at opacity 0) fades to Loading 2,
     which auto-advances to the Landing page.
     --------------------------------------------------------------------- */
  /* A link can open the app straight at ?screen=registration or
     ?screen=status. Only those two names are honoured — anything else is
     ignored and the app opens normally. The jump happens AFTER the Landing
     page has settled, so Landing is on the back stack and Back from a
     shortcut lands there instead of dead-ending on the splash. */
  var SHORTCUT_SCREENS = { registration: 1, status: 1 };
  var shortcutScreen = null;
  try {
    var qs = new URLSearchParams(window.location.search).get("screen");
    if (qs && SHORTCUT_SCREENS[qs]) shortcutScreen = qs;
  } catch (err) { shortcutScreen = null; }

  window.setTimeout(function () {
    go("loading-2");
    window.setTimeout(function () {
      go("landing");
      /* 560ms > the 500ms loading-2>landing transition, so go() is no longer
         busy and the jump is not swallowed. */
      if (shortcutScreen) window.setTimeout(function () { go(shortcutScreen); }, 560);
    }, 400);
  }, 200);


  /* ---------------------------------------------------------------------
     ONBOARDING — הדרכת כניסה ראשונה

     מי שנכנס לראשונה לא יודע מה המוצר הזה עושה. שלושה שלבים מסבירים
     את כל התהליך, וכל שלב מצביע על אלמנט אמיתי שקיים כאן ועכשיו במסך
     הבית — אין הסבר על מסך שלא רואים, ואין סיור בין מסכים.

       1. הכפתור הראשי   → מזמינים חלון זמן
       2. כרטיס הסטטוס   → עוקבים ביום הטיסה
       3. "הזמנה שלי"     → מציגים את הקוד בעמדה

     ההדרכה עולה פעם אחת בחיי המכשיר:

       · נרשמת כ"נראתה" ברגע הפתיחה ולא בסגירה. מי שיצא באמצע לא יקבל
         אותה שוב — אילו נרשמה בסגירה, יציאה מהאפליקציה הייתה מחזירה
         אותה בכל כניסה.
       · אם הכתיבה ל-localStorage נכשלת (ספארי בגלישה פרטית זורק), היא
         תופיע שוב בכניסה הבאה. זו התנהגות סבירה למי שביקש מהדפדפן לא
         לזכור עליו כלום.
       · "מחק את כל מה שנשמר" מוחק גם אותה — מכשיר שנוקה חוזר להיות
         מכשיר של משתמש חדש.
     --------------------------------------------------------------------- */
  var COACH_KEY = "leeway.onboarded";
  var COACH_DELAY = 350;      /* אחרי שהמעבר למסך הבית כבר נגמר */

  /* ההדגמות. שלושה "פריימים" לכל שלב, שמתחלפים בלולאה בתוך מסגרת אחת
     ומראים את הפעולה שהטקסט מתאר. הם נבנים כאן ולא יושבים ב-HTML כי
     רק אחד מהם מוצג בכל רגע, ותשעה בלוקים מתים במסמך היו רעש. */
  function beat(inner) { return '<span class="mini__beat">' + inner + "</span>"; }

  function demoBook() {
    return beat('<span class="mini__bar"><span class="mini__ink"></span><i class="mini__caret"></i></span>' +
                '<span class="mini__bar mini__bar--dim"></span>') +
           beat('<span class="mini__grid"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>') +
           beat('<span class="mini__grid"><i></i><i></i><i class="is-on"></i><i></i><i></i><i></i><i></i><i></i></span>' +
                '<span class="mini__bar mini__bar--cta"></span>');
  }
  function rows(on) {
    var out = "";
    for (var i = 0; i < 3; i += 1) out += '<i class="' + (i === on ? "is-on" : "") + '"></i>';
    return '<span class="mini__rows">' + out + "</span>";
  }
  function demoTrack() { return beat(rows(0)) + beat(rows(1)) + beat(rows(2)); }
  function demoPass() {
    return beat('<span class="mini__bar mini__bar--cta"></span>') +
           beat('<span class="mini__code"></span>') +
           beat('<span class="mini__code"></span><span class="mini__bar mini__bar--cta"></span>');
  }

  var COACH_STEPS = [
    { key: "s1", target: '.landing__actions [data-go="registration"]', demo: demoBook },
    { key: "s2", target: ".status-card",                               demo: demoTrack },
    { key: "s3", target: '.landing__actions [data-go="status"]',       demo: demoPass }
  ];

  var coachEl = document.querySelector("[data-coach]");
  var coachScrim = document.querySelector("[data-coach-scrim]");
  var coachDemo = coachEl && coachEl.querySelector("[data-coach-demo]");
  var coachStepEl = coachEl && coachEl.querySelector("[data-coach-step]");
  var coachTitle = coachEl && coachEl.querySelector("[data-coach-title]");
  var coachBody = coachEl && coachEl.querySelector("[data-coach-body]");
  var coachNextBtn = coachEl && coachEl.querySelector("[data-coach-next]");
  var coachDots = coachEl ? Array.prototype.slice.call(coachEl.querySelectorAll(".coach__dot")) : [];
  var coachIndex = -1;        /* ‎-1 = סגורה */
  var coachTimer = null;
  var coachReturn = null;     /* לאן להחזיר את הפוקוס בסגירה */
  var coachShift = 0;         /* כמה עמודת התוכן נדחפה למעלה, בפיקסלים */
  var coachDrawn = -1;        /* השלב שההדגמה שלו כבר בנויה ב-DOM */
  var COACH_GAP = 16;         /* אוויר בין האלמנט המסומן לגג הגיליון */

  /* המיקום האנכי של כל יעד ביחס לראש המסך, כפי שהוא בלי הדחיפה.

     נמדד מחדש בכל ציור ולא נשמר פעם אחת בפתיחה: הגבהים כאן זזים מתחת
     לרגליים יותר משנדמה — Heebo נטען אחרי הצבע הראשון ומזיז את הכותרת
     הגדולה, והחלפת שפה שוברת אותה למספר שורות אחר. כל גרסה ששמרה
     מדידה אחת מצאה את עצמה מיישרת מול מסך שכבר לא קיים. */
  function coachMeasure() {
    var el = screens.landing;
    var prev = coachShift;
    /* מודדים על אפס דחיפה, עם המעבר מנוטרל: קריאת מלבן באמצע מעבר
       מחזירה מיקום בדרך ולא מיקום סופי. אחרי המדידה הערך הקודם חוזר
       בעודנו מנוטרלים, כדי שהמדידה עצמה לא תיראה כקפיצה. */
    el.classList.add("is-measuring");
    el.style.setProperty("--coach-shift", "0px");
    var screenTop = el.getBoundingClientRect().top;
    COACH_STEPS.forEach(function (st) {
      var node = el.querySelector(st.target);
      st.bottom = node ? (node.getBoundingClientRect().bottom - screenTop) : 0;
    });
    el.style.setProperty("--coach-shift", prev + "px");
    el.getBoundingClientRect();          /* מחייב חישוב לפני שהמעבר חוזר */
    el.classList.remove("is-measuring");
  }

  /* offsetTop ולא getBoundingClientRect: בשנייה הראשונה הגיליון עדיין
     נכנס מלמטה, והמלבן החי שלו היה מחזיר מיקום שאין לו קשר למקום
     שבו הוא ייעצר. offsetTop מתעלם מההנפשה. */
  function coachAlign() {
    var step = COACH_STEPS[coachIndex];
    if (!step) return;
    var over = step.bottom + COACH_GAP - coachEl.offsetTop;
    coachShift = over > 0 ? -Math.ceil(over) : 0;
    screens.landing.style.setProperty("--coach-shift", coachShift + "px");
  }

  function clearCoachTarget() {
    qsa("[data-coach-target]").forEach(function (el) { el.removeAttribute("data-coach-target"); });
  }

  /* נקראת גם מ-applyLanguage: החלפת שפה באמצע ההדרכה חייבת להחליף גם
     את הטקסט שלה, ולא רק את המסך שמאחוריה. */
  function paintCoach() {
    if (coachIndex < 0 || !coachEl) return;
    var step = COACH_STEPS[coachIndex];
    var last = coachIndex === COACH_STEPS.length - 1;

    coachStepEl.textContent = fmt(t("coach.step"), { n: coachIndex + 1, total: COACH_STEPS.length });
    coachTitle.textContent = t("coach." + step.key + ".title");
    coachBody.textContent = t("coach." + step.key + ".body");
    coachNextBtn.textContent = t(last ? "coach.done" : "coach.next");
    /* רק כשהשלב באמת התחלף. ציור חוזר (החלפת שפה, טעינת גופן, סיבוב
       מסך) לא אמור להתחיל את ההדגמה מהתחלה באמצע הלולאה. */
    if (coachDrawn !== coachIndex) {
      coachDemo.innerHTML = step.demo();
      coachDrawn = coachIndex;
    }
    coachDots.forEach(function (dot, i) { dot.classList.toggle("is-on", i === coachIndex); });

    clearCoachTarget();
    var target = screens.landing.querySelector(step.target);
    if (target) target.setAttribute("data-coach-target", "");

    /* אחרי שהתוכן החדש כבר בפנים: גובה הגיליון הוא חצי מהחישוב. */
    coachMeasure();
    coachAlign();
  }

  function openCoach() {
    if (!coachEl || current !== "landing" || readKey(COACH_KEY) === "1") return;
    writeKey(COACH_KEY, "1");
    coachReturn = document.activeElement;

    /* מודדים את שורת ההגדרות ועוצרים את הגיליון מעליה, כדי שמתג השפה
       יישאר גלוי ולחיץ (ראו ההערה ליד .coach ב-style.css). */
    var foot = screens.landing.querySelector(".landing__foot");
    if (foot) {
      var clear = app.getBoundingClientRect().bottom - foot.getBoundingClientRect().top;
      coachEl.style.setProperty("--coach-clear", Math.max(0, Math.round(clear)) + "px");
    }

    coachIndex = 0;
    coachShift = 0;
    coachDrawn = -1;
    screens.landing.style.setProperty("--coach-shift", "0px");
    /* נועלים את גובה האיור על מה שהוא עכשיו (ראו ההערה ב-style.css). */
    var art = screens.landing.querySelector(".landing__art");
    if (art) art.style.blockSize = Math.round(art.getBoundingClientRect().height) + "px";
    screens.landing.setAttribute("data-coach", "");
    coachEl.classList.remove("is-leaving");
    coachScrim.hidden = false;
    coachEl.hidden = false;
    paintCoach();
    coachNextBtn.focus({ preventScroll: true });
  }

  function closeCoach() {
    window.clearTimeout(coachTimer);
    coachTimer = null;
    if (coachIndex < 0) return;
    /* האינדקס יורד ראשון: מכאן והלאה הרקע שוב לחיץ, גם בזמן שהשכבות
       עדיין דועכות. */
    coachIndex = -1;

    var strip = function () {
      coachEl.classList.remove("is-leaving");
      coachScrim.classList.remove("is-leaving");
      coachEl.hidden = true;
      coachScrim.hidden = true;
      screens.landing.removeAttribute("data-coach");
      screens.landing.style.removeProperty("--coach-shift");
      var art = screens.landing.querySelector(".landing__art");
      if (art) art.style.removeProperty("block-size");
      clearCoachTarget();
    };
    coachShift = 0;

    if (reduced) {
      strip();
    } else {
      coachEl.classList.add("is-leaving");
      coachScrim.classList.add("is-leaving");
      window.setTimeout(strip, 140);        /* = --motion-fast */
    }
    if (coachReturn && coachReturn.focus) coachReturn.focus({ preventScroll: true });
    coachReturn = null;
  }

  function coachNext() {
    if (coachIndex < 0) return;
    if (coachIndex >= COACH_STEPS.length - 1) { closeCoach(); return; }
    coachIndex += 1;
    coachEl.classList.remove("is-swapping");
    void coachEl.offsetWidth;              /* מאתחל את ההנפשה מחדש */
    coachEl.classList.add("is-swapping");
    paintCoach();
  }

  /* שלב הלכידה, לפני המאזין הרגיל של האפליקציה: בזמן ההדרכה אף כפתור
     ברקע לא מנווט לשום מקום. היוצאים מן הכלל הם הגיליון עצמו ושורת
     ההגדרות. הקשה על האלמנט המסומן מתקדמת לשלב הבא — זו התשובה
     הטבעית ל"הנה, זה מה שלוחצים". */
  document.addEventListener("click", function (e) {
    if (coachIndex < 0) return;
    if (e.target.closest(".coach") || e.target.closest(".landing__foot")) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.target.closest("[data-coach-target]")) coachNext();
  }, true);

  document.addEventListener("keydown", function (e) {
    if (coachIndex >= 0 && e.key === "Escape") { e.preventDefault(); closeCoach(); }
  });

  window.addEventListener("resize", paintCoach);

  /* Heebo נטען אחרי הצבע הראשון. עד שהוא מגיע, הכותרת הגדולה נמדדת
     בגופן החלופי — וכשהוא מחליף אותה, כל העמודה מתחתיה זזה. בלי
     המדידה החוזרת הזאת השלב הראשון מסתדר מול מסך שכבר לא קיים. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { paintCoach(); });
  }

  /* ---------------------------------------------------------------------
     Registration — validation. Bad name / passport / flight number sends
     the traveller to the Fail screen, with the offending fields marked.
     --------------------------------------------------------------------- */
  var RULES = {
    name:     { test: /^[\u0590-\u05FF\u0600-\u06FF\u0400-\u04FFA-Za-z][\u0590-\u05FF\u0600-\u06FF\u0400-\u04FFA-Za-z'\- ]{1,}$/, labelKey: "err.label.name" },
    passport: { test: /^\d{8}$/, labelKey: "err.label.passport" },
    /* An IATA airline designator is two characters and only ONE of them has
       to be a letter: 6H is Israir, A3 is Aegean, W6 is Wizz Air — all of
       which fly out of Ben Gurion. The old [A-Za-z]{2} rejected every one of
       them as an invalid flight number. Two digits is never a real code, so
       that stays rejected. */
    flight:   { test: /^(?:[A-Za-z][A-Za-z0-9]|[0-9][A-Za-z])\s?\d{1,4}$/, labelKey: "err.label.flight" }
  };

  var form = document.getElementById("registration-form");
  var extraWrap = document.getElementById("extra-passengers");
  var addBtn = document.getElementById("add-passenger");
  var MAX_PASSENGERS = 9;
  var paxCount = 1;

  function passengerMarkup(n) {
    var f = function (key) { return '" data-i18n-ph="' + key + '" placeholder="' + t(key) + '"'; };
    var e = function (key) { return '<span class="field__error" data-i18n="' + key + '">' + t(key) + '</span>'; };
    var sr = function (key) { return '<span class="visually-hidden" data-i18n="' + key + '">' + t(key) + '</span>'; };
    return '' +
      '<h3 class="h3 passenger__title">' +
        '<span><span data-i18n="reg.passengerN">' + t("reg.passengerN") + '</span> <em>' + n + '</em></span>' +
        '<button type="button" class="passenger__remove" data-remove-passenger ' +
          'data-i18n="reg.removePassenger" data-i18n-aria="aria.removePassenger" ' +
          'aria-label="' + t("aria.removePassenger") + '">' + t("reg.removePassenger") + '</button>' +
      '</h3>' +
      '<div class="name-row">' +
        '<label class="field">' + sr("ph.first") +
        '<input class="input" type="text" data-rule="name" name="first-' + n + f("ph.first") + '>' + e("err.first") + '</label>' +
        '<label class="field">' + sr("ph.last") +
        '<input class="input" type="text" data-rule="name" name="last-' + n + f("ph.last") + '>' + e("err.last") + '</label>' +
      '</div>' +
      '<label class="field">' + sr("ph.passport") +
      '<input class="input" type="text" inputmode="numeric" data-rule="passport" name="passport-' + n + f("ph.passport") + '>' + e("err.passport") + '</label>' +
      '<label class="field">' + sr("ph.flight") +
      '<input class="input" type="text" data-rule="flight" name="flight-' + n + f("ph.flight") + '>' + e("err.flight") + '</label>';
  }

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      if (paxCount >= MAX_PASSENGERS) return;
      paxCount += 1;
      var block = document.createElement("div");
      block.className = "passenger";
      block.dataset.passenger = String(paxCount);
      block.innerHTML = passengerMarkup(paxCount);
      block.classList.add("passenger--entering");
      extraWrap.appendChild(block);
      block.addEventListener("animationend", function () {
        block.classList.remove("passenger--entering");
      }, { once: true });
      updatePaxCount();
      var first = block.querySelector("input");
      if (first) first.focus();
      if (paxCount >= MAX_PASSENGERS) {
        addBtn.disabled = true;
        addBtn.textContent = t("reg.max").replace("{n}", MAX_PASSENGERS);
        addBtn.removeAttribute("data-i18n");
      }
    });
  }

  /* Passenger fields are addressed by index (first-2, first-3 ...), so a
     removal from the middle must renumber everything after it. Skip this and
     the form silently ends up with a gap — first-2 and first-4, no first-3 —
     which validate() still walks but snapshotPassenger() and the flight card
     would read wrongly. */
  function renumberPassengers() {
    var blocks = extraWrap ? Array.prototype.slice.call(extraWrap.children) : [];
    blocks.forEach(function (block, i) {
      var n = i + 2;                     /* passenger 1 is in the static markup */
      block.dataset.passenger = String(n);
      var num = block.querySelector(".passenger__title em");
      if (num) num.textContent = String(n);
      ["first", "last", "passport", "flight"].forEach(function (base) {
        var el = block.querySelector('[name^="' + base + '-"]');
        if (el) el.name = base + "-" + n;
      });
    });
    paxCount = blocks.length + 1;
    updatePaxCount();
    if (addBtn) {
      addBtn.disabled = paxCount >= MAX_PASSENGERS;
      if (paxCount < MAX_PASSENGERS) {
        addBtn.setAttribute("data-i18n", "reg.addPassenger");
        addBtn.textContent = t("reg.addPassenger");
      }
    }
  }

  if (extraWrap) {
    extraWrap.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-remove-passenger]");
      if (!btn) return;
      var block = btn.closest(".passenger");
      if (!block) return;
      /* Move focus out before the node goes away, or the browser drops it to
         <body> and a keyboard user loses their place in the form. */
      var next = block.nextElementSibling;
      block.remove();
      renumberPassengers();
      var land = (next && next.querySelector("input")) || addBtn;
      if (land && typeof land.focus === "function") land.focus();
    });
  }

  function updatePaxCount() {
    var n = (passengers && passengers.length) || paxCount;
    Array.prototype.forEach.call(document.querySelectorAll("[data-pax-count]"), function (el) {
      el.textContent = String(n);
    });
  }

  function validate() {
    var bad = [];
    Array.prototype.forEach.call(form.querySelectorAll("[data-rule]"), function (input) {
      var rule = RULES[input.dataset.rule];
      var ok = rule.test.test(input.value.trim());
      var field = input.closest(".field");
      field.classList.toggle("has-error", !ok);
      input.setAttribute("aria-invalid", ok ? "false" : "true");
      var lbl = t(rule.labelKey);
      if (!ok && bad.indexOf(lbl) === -1) bad.push(lbl);
    });
    return bad;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = validate();
      if (bad.length) {
        failWith(t("fail.badDetails") + bad.join(", ") + ".");
        return;
      }
      passengers = readPassengers();   /* the card and the pass follow the form */
      renderPassengers();
      withLoading(e.submitter || form.querySelector("button[type=submit]"), 450, function () {
        go("time-choosing");
      });
    });

    form.addEventListener("input", function (e) {
      var input = e.target.closest("[data-rule]");
      if (!input) return;
      var field = input.closest(".field");
      if (field.classList.contains("has-error")) {
        var ok = RULES[input.dataset.rule].test.test(input.value.trim());
        field.classList.toggle("has-error", !ok);
        input.setAttribute("aria-invalid", ok ? "false" : "true");
      }
    });
  }

  /* ---------------------------------------------------------------------
     Time slots — a full window is selectable but fails on confirm.
     --------------------------------------------------------------------- */
  var slotsWrap = document.getElementById("slots");
  var chosenSlot = null;

  /* The nine windows the file ships with are the Figma frame, and they are
     also the fallback for every flight the board cannot tell us about. Read
     them synchronously, before any lookup can overwrite the grid. */
  var slotDefaults = slotsWrap
    ? Array.prototype.map.call(slotsWrap.querySelectorAll(".slot"), function (el) {
        return { label: el.dataset.slot, full: el.dataset.full === "true" };
      })
    : [];

  if (slotsWrap) {
    slotsWrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".slot");
      if (!btn) return;
      Array.prototype.forEach.call(slotsWrap.querySelectorAll(".slot"), function (s) {
        s.setAttribute("aria-pressed", String(s === btn));
      });
      chosenSlot = btn;
    });
  }

  /* ---------------------------------------------------------------------
     Flight card — open and close.

     Until now these were two screens (Time choosing / Time choosing extended
     info) and the "closing" direction could never be the real reverse of the
     opening one: the screen you were closing sat UNDERNEATH the one coming
     in, so its collapse was invisible. Folding both Figma frames into one
     screen makes it one motion played forwards and backwards.

     What actually moves, in both directions at once:
       · the destination photo and the passenger list unfurl from height 0,
         each cancelling its own flex gap with a negative margin so nothing
         jumps by 12px at the end;
       · the window grid shrinks to a single masked row (going down, behind
         the gradient) and grows back out of it (coming up).
     Everything below — the buttons, the clouds — simply follows the flow.
     --------------------------------------------------------------------- */
  var flightCard = document.getElementById("flight-card");
  var cardPhoto  = flightCard ? flightCard.querySelector(".flight-card__photo-wrap") : null;
  var paxList    = document.getElementById("pax-list");
  /* The bottom half that unfurls is the wrapper, not the passenger list on
     its own — the departure time and the flight status live in there too. */
  var cardExtra  = flightCard ? flightCard.querySelector(".flight-card__extra") : null;
  var slotsMask  = slotsWrap ? slotsWrap.querySelector(".slots__mask") : null;

  var MASK_H    = 42;                 /* the Figma value, and the fallback */
  var CARD_MS   = 420;
  var CARD_EASE = "cubic-bezier(0, 0, 0.58, 1)";   /* the product's own --ease-out */
  var cardOpen  = false;
  var cardAnims = [];
  var cardRun   = 0;              /* which open/close is the current one */

  function stopCardAnims() {
    cardAnims.forEach(function (a) { try { a.cancel(); } catch (err) {} });
    cardAnims = [];
  }

  /* Nothing to unfurl if neither the board nor the form gave us anything —
     an empty white gap under the route would read as a loading failure. */
  function extraHasContent() {
    if (!cardExtra) return false;
    if (paxList && paxList.children.length) return true;
    return !!cardExtra.querySelector("[data-flight-when]:not([hidden]), [data-flight-status]:not([hidden])");
  }

  /* The masked strip is "one row, very nearly": Figma's 42px against 46px
     chips. Measuring instead of hardcoding keeps that relationship after the
     chips changed height, and on a phone whose text renders larger. */
  function maskHeight() {
    var chip = slotsWrap && slotsWrap.querySelector(".slot");
    var h = chip ? chip.offsetHeight : 0;
    return h ? Math.max(32, h - 4) : MASK_H;
  }

  function rowGapOf(el) {
    var g = parseFloat(window.getComputedStyle(el).rowGap);
    return isNaN(g) ? 12 : g;
  }

  /* The height an element WOULD have, measured while it is hidden or pinned
     to a fixed height by a previous run. Everything is put back before the
     browser paints, so this is invisible. */
  function naturalHeight(el) {
    if (!el) return 0;
    var wasHidden = el.hidden, h = el.style.height, ov = el.style.overflow;
    el.hidden = false;
    el.style.height = "";
    el.style.overflow = "";
    var value = el.getBoundingClientRect().height;
    el.style.height = h;
    el.style.overflow = ov;
    el.hidden = wasHidden;
    return value;
  }

  /* The resting state for whichever side we ended on — no leftover inline
     heights, so the layout stays responsive to text length and screen size. */
  function settleCard(open) {
    if (cardPhoto) {
      cardPhoto.hidden = !open;
      cardPhoto.style.height = ""; cardPhoto.style.marginBottom = "";
      cardPhoto.style.overflow = ""; cardPhoto.style.opacity = "";
    }
    if (cardExtra) {
      cardExtra.hidden = !open || !extraHasContent();
      cardExtra.style.height = ""; cardExtra.style.marginTop = "";
      cardExtra.style.overflow = ""; cardExtra.style.opacity = "";
    }
    if (slotsWrap) {
      slotsWrap.style.overflow = open ? "hidden" : "";
      slotsWrap.style.height   = open ? maskHeight() + "px" : "";
    }
    if (slotsMask) { slotsMask.hidden = !open; slotsMask.style.opacity = ""; }
  }

  function setCardOpen(open, animate) {
    if (!flightCard || !slotsWrap) return;
    open = !!open;
    if (cardOpen === open && animate !== false) return;
    cardOpen = open;
    stopCardAnims();

    var lblKey = open ? "aria.collapseCard" : "aria.expandCard";
    flightCard.setAttribute("aria-expanded", String(open));
    flightCard.dataset.i18nAria = lblKey;
    flightCard.setAttribute("aria-label", t(lblKey));

    /* The masked grid is one target, not nine: while it is covered the chips
       come out of the tab order so a keyboard never lands on a hidden one. */
    slotsWrap.dataset.masked = String(open);
    /* Shown for the whole of BOTH directions; settleCard() is what finally
       removes it, so the closing fade has something to fade. */
    if (slotsMask) slotsMask.hidden = false;
    Array.prototype.forEach.call(slotsWrap.querySelectorAll(".slot"), function (chip) {
      if (open) chip.setAttribute("tabindex", "-1"); else chip.removeAttribute("tabindex");
    });

    var run = ++cardRun;
    var canAnimate = animate !== false && !reduced &&
                     typeof flightCard.animate === "function";
    if (!canAnimate) { settleCard(open); return; }

    var gap     = rowGapOf(flightCard);
    var photoH  = naturalHeight(cardPhoto);
    var extraH  = extraHasContent() ? naturalHeight(cardExtra) : 0;
    var slotsH  = naturalHeight(slotsWrap);

    if (cardPhoto) { cardPhoto.hidden = false; cardPhoto.style.overflow = "hidden"; }
    if (cardExtra) { cardExtra.hidden = !extraH; cardExtra.style.overflow = "hidden"; }
    slotsWrap.style.overflow = "hidden";

    var opts = { duration: CARD_MS, easing: CARD_EASE, fill: "both" };
    var pair = function (a, b) { return open ? [a, b] : [b, a]; };

    if (cardPhoto) cardAnims.push(cardPhoto.animate(pair(
      { height: "0px",           marginBottom: (-gap) + "px", opacity: 0 },
      { height: photoH + "px",   marginBottom: "0px",         opacity: 1 }
    ), opts));

    if (extraH) cardAnims.push(cardExtra.animate(pair(
      { height: "0px",           marginTop: (-gap) + "px", opacity: 0 },
      { height: extraH + "px",   marginTop: "0px",         opacity: 1 }
    ), opts));

    cardAnims.push(slotsWrap.animate(pair(
      { height: slotsH + "px" },
      { height: maskHeight() + "px" }
    ), opts));

    if (slotsMask) cardAnims.push(slotsMask.animate(pair(
      { opacity: 0 }, { opacity: 1 }
    ), opts));

    /* fill:"both" holds the last frame; settleCard() replaces it with the
       real resting styles, and only then are the animations dropped. It is
       idempotent and both paths are guarded by `run`, so whichever arrives
       first wins. The timer is not redundant: a phone backgrounded
       mid-animation may never deliver `finished`, and without it the card
       would stay pinned to inline heights that no longer match the text. */
    var finish = function () {
      if (run !== cardRun) return;          /* a newer open/close took over */
      settleCard(open);
      stopCardAnims();
    };
    Promise.all(cardAnims.map(function (a) { return a.finished; })).then(finish, function () {});
    window.setTimeout(finish, CARD_MS + 60);
  }

  if (flightCard) {
    flightCard.addEventListener("click", function () { setCardOpen(!cardOpen); });
  }
  if (slotsMask) {
    slotsMask.addEventListener("click", function (e) {
      e.stopPropagation();
      /* The button the traveller just used is about to be removed. Hand the
         focus to what they came back for instead of dropping it on <body>. */
      var hadFocus = document.activeElement === slotsMask;
      setCardOpen(false);
      if (hadFocus) {
        var first = slotsWrap.querySelector(".slot");
        if (first) first.focus({ preventScroll: true });
      }
    });
  }
  settleCard(false);

  /* ---------------------------------------------------------------------
     Who is actually flying.

     The card and the boarding pass used to carry two names typed into the
     markup, so a solo traveller was told she was two people and a family of
     five never saw three of them. Both now read the registration form.
     --------------------------------------------------------------------- */
  var passengers = [];

  function readPassengers() {
    if (!form) return [];
    var out = [];
    for (var n = 1; n <= paxCount; n++) {
      var first = field(form, "first-" + n);
      var last  = field(form, "last-" + n);
      var doc   = field(form, "passport-" + n);
      var name  = [first && first.value.trim(), last && last.value.trim()]
                    .filter(Boolean).join(" ");
      if (!name) continue;
      out.push({ name: name, passport: doc ? doc.value.trim() : "" });
    }
    return out;
  }

  function renderPassengers() {
    var list = passengers || [];
    if (paxList) {
      paxList.textContent = "";
      list.forEach(function (p) {
        var row = document.createElement("span");
        var name = document.createElement("span");
        name.className = "pax__name";
        name.setAttribute("dir", "auto");         /* a Latin name inside RTL */
        name.textContent = p.name;
        row.appendChild(name);
        if (p.passport) {
          var doc = document.createElement("span");
          doc.className = "pax__doc";
          doc.setAttribute("dir", "auto");
          doc.textContent = t("common.passportShort") + " " + p.passport;
          row.appendChild(doc);
        }
        paxList.appendChild(row);
      });
      /* An open card whose list just changed length must re-measure. */
      if (cardOpen) settleCard(true);
    }
    renderPassNames();
    updatePaxCount();
  }

  /* The pass names the lead traveller and counts the rest, exactly as the
     Figma frame does — "נוסע +1 · Daniel Cohen" — but with the real numbers,
     so one passenger reads "נוסע" and five read "נוסע +4". */
  function renderPassNames() {
    var el = document.querySelector("[data-qr-names]");
    if (!el) return;
    var list = passengers || [];
    var total = list.length || paxCount;
    var extra = Math.max(0, total - 1);
    el.textContent = "";
    var who = document.createElement("bdi");
    who.textContent = t("qr.passenger") + (extra ? " +" + extra : "");
    el.appendChild(who);
    if (list.length) {
      el.appendChild(document.createTextNode(" · "));
      var lead = document.createElement("bdi");
      lead.setAttribute("dir", "auto");
      lead.textContent = list[0].name;
      el.appendChild(lead);
    }
  }

  /* ---------------------------------------------------------------------
     The windows follow the flight.

     Until now the nine chips were the Figma frame's own times, frozen: a
     21:10 departure to Paphos was still offered a 06:40 security slot,
     fourteen hours early. Now that the board tells us when the aircraft
     actually leaves, the grid is built backwards from that.

     The numbers below are the product decision, and they are in one place
     so they can be argued with:
       · a window is 20 minutes and there are nine of them — the 3x3 grid
         the screen was designed around, so the layout is untouched;
       · the LAST window ends two hours before take-off. Security is the
         first step of the journey, and check-in, passport control and the
         walk to the gate all still have to happen after it;
       · which means the earliest window opens five hours before take-off.
     The two "מלא" windows keep the positions the prototype gave them, so
     the "this window is full" path to the Fail screen still demonstrates.
     --------------------------------------------------------------------- */
  var SLOT_PLAN = {
    windowMin: 20,
    count: 9,
    latestEndsBeforeMin: 120,
    fullIndexes: [4, 7]
  };

  /* The chips are written "6:40", not "06:40" — the padded form belongs to
     the boarding pass (hhmm), not to the grid. */
  function chipTime(mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    var h = Math.floor(mins / 60), m = mins % 60;
    return h + ":" + (m < 10 ? "0" : "") + m;
  }

  function slotsForDeparture(depMinutes) {
    var step = SLOT_PLAN.windowMin;
    /* Anchored to a clean :00 / :20 / :40 boundary so the grid reads as a
       timetable rather than as arithmetic on the departure time. */
    var lastEnd = Math.floor((depMinutes - SLOT_PLAN.latestEndsBeforeMin) / step) * step;
    var out = [];
    for (var i = SLOT_PLAN.count - 1; i >= 0; i--) {
      var end = lastEnd - i * step;
      out.push({
        label: chipTime(end - step) + "-" + chipTime(end),
        full: SLOT_PLAN.fullIndexes.indexOf(SLOT_PLAN.count - 1 - i) !== -1
      });
    }
    return out;
  }

  function paintSlots(list) {
    if (!slotsWrap || !list.length) return;
    /* Only the chips are replaced. The legend and the masking overlay belong
       to the screen, not to the timetable, and must survive. */
    Array.prototype.forEach.call(slotsWrap.querySelectorAll(".slot"), function (el) {
      el.parentNode.removeChild(el);
    });
    /* The previous choice pointed at a node that no longer exists — and it
       was a time for a different flight anyway. */
    chosenSlot = null;

    list.forEach(function (w) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "slot";
      chip.setAttribute("aria-pressed", "false");
      chip.dataset.slot = w.label;
      chip.appendChild(document.createTextNode(w.label));
      if (w.full) {
        chip.dataset.full = "true";
        var tag = document.createElement("span");
        tag.className = "slot__full";
        tag.dataset.i18n = "time.full";       /* so a language switch reaches it */
        tag.textContent = t("time.full");
        chip.appendChild(tag);
      }
      /* Rebuilt while the card happens to be open: the chips are behind the
         mask, so they stay out of the tab order like their predecessors. */
      if (cardOpen) chip.setAttribute("tabindex", "-1");
      slotsWrap.insertBefore(chip, slotsMask || null);
    });
  }

  /* Why these particular hours. Kept apart from paintSlots() on purpose:
     switching language must repaint the sentence WITHOUT rebuilding the
     chips, because rebuilding them would throw away a window the traveller
     had already chosen. */
  function paintSlotsNote(info) {
    var p = parseBoardTime(info && info.dep);
    writeText("[data-slots-note]", p ? fmt(t("time.windowsNote"), { time: p.hm }) : "");
  }

  function applySlotWindows(info) {
    var p = parseBoardTime(info && info.dep);
    paintSlotsNote(info);
    if (!p) { paintSlots(slotDefaults); return; }
    var hm = p.hm.split(":");
    paintSlots(slotsForDeparture((+hm[0]) * 60 + (+hm[1])));
  }

  function resetSlotWindows() {
    paintSlotsNote(null);       /* no schedule, nothing to explain */
    paintSlots(slotDefaults);
  }

  /* ---------------------------------------------------------------------
     The landing status card. It opens empty — nothing has been booked yet,
     so there is no step to report and tapping it belongs in the booking
     flow, not on a status screen with nothing on it. A confirmed booking
     turns it into the live step.
     --------------------------------------------------------------------- */
  var statusCard  = document.querySelector("[data-status-card]");
  var statusStep  = document.querySelector("[data-status-step]");
  var statusState = document.querySelector("[data-status-state]");
  var hasBooking  = false;

  function paintStatusCard() {
    if (!statusCard) return;
    var stepKey  = hasBooking ? "tl.security"     : "status.noneStep";
    var stateKey = hasBooking ? "state.inprogress" : "status.noneState";
    var ariaKey  = hasBooking ? "aria.statusCard"  : "aria.statusCardEmpty";
    statusCard.dataset.booking = hasBooking ? "active" : "none";
    statusCard.dataset.go      = hasBooking ? "status" : "registration";
    statusCard.dataset.i18nAria = ariaKey;
    statusCard.setAttribute("aria-label", t(ariaKey));
    /* data-i18n carries the state, so a language switch keeps it. */
    if (statusStep)  { statusStep.dataset.i18n  = stepKey;  statusStep.textContent  = t(stepKey); }
    if (statusState) { statusState.dataset.i18n = stateKey; statusState.textContent = t(stateKey); }
  }
  paintStatusCard();

  Array.prototype.forEach.call(document.querySelectorAll("[data-confirm-slot]"), function (btn) {
    btn.addEventListener("click", function () {
      if (!chosenSlot) {
        failWith(t("fail.noSlot"));
        return;
      }
      if (chosenSlot.dataset.full === "true") {
        failWith(t("fail.slotFull").replace("{slot}", chosenSlot.dataset.slot));
        return;
      }
      applySlot(chosenSlot.dataset.slot);
      hasBooking = true;              /* the landing card has something to show now */
      paintStatusCard();
      withLoading(btn, 450, function () { go("success"); });
    });
  });

  /* The PRD specifies a short spinner while the details are verified
     against the flight record, and again while the booking is sent. */
  function withLoading(btn, ms, next) {
    if (!btn) { next(); return; }
    btn.setAttribute("aria-busy", "true");
    window.setTimeout(function () {
      btn.removeAttribute("aria-busy");
      next();
    }, reduced ? 0 : ms);
  }

  /* ---------------------------------------------------------------------
     Every time shown on the status screen derives from the window the
     traveller actually picked. The offsets below are not invented: with the
     design's own default window (06:40–07:00) they reproduce the Figma
     numbers exactly — 05:30, 07:05 and 07:45 — so the default screen is
     unchanged and any other choice moves the whole card coherently.
        זיהוי, from   = start − 70min      (06:40 → 05:30)
        זיהוי, to     = end   +  5min      (07:00 → 07:05)
        צפי משך       = end   + 45min      (07:00 → 07:45)
     --------------------------------------------------------------------- */
  var TIME_OFFSETS = { identifyIn: -70, identifyOut: 5, securityEta: 45 };

  function hhmm(mins) {
    mins = ((mins % 1440) + 1440) % 1440;          /* wrap past midnight */
    var h = Math.floor(mins / 60), m = mins % 60;
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }

  function writeTime(sel, text) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
      el.textContent = text;
    });
  }

  var lastSlot = null;
  function applySlot(raw) {
    lastSlot = raw;
    var m = String(raw).match(/(\d{1,2}):(\d{2})\D+(\d{1,2}):(\d{2})/);
    if (!m) return;
    var start = (+m[1]) * 60 + (+m[2]);
    var end   = (+m[3]) * 60 + (+m[4]);
    if (end < start) end += 1440;                  /* window crosses midnight */

    writeTime("[data-slot-display]", hhmm(start) + " – " + hhmm(end));
    writeTime('[data-time="identify-in"]',  hhmm(start + TIME_OFFSETS.identifyIn));
    writeTime('[data-time="identify-out"]', hhmm(end   + TIME_OFFSETS.identifyOut));
    writeTime('[data-time="security-eta"]', t("tl.eta") + " " + hhmm(end + TIME_OFFSETS.securityEta));
    /* The chosen window decides which day the pass is for. */
    if (flightInfo) applyFlightMeta(flightInfo);
  }

  function failWith(reason) {
    var box = document.getElementById("fail-reason");
    if (box) box.textContent = reason;
    go("fail");
  }

  /* ---------------------------------------------------------------------
     Destination photo, chosen by route
     --------------------------------------------------------------------- */
  function applyRoutePhoto(route) {
    var photo = document.getElementById("route-photo");
    var entry = ROUTE_PHOTOS[route];
    if (!photo || !entry) return;
    photo.src = entry.src;
    photo.alt = t(entry.altKey);
  }

  /* ---------------------------------------------------------------------
     Drag to go back. The Figma prototype carries two ON_DRAG connections —
     Registration → Landing and Success → Time choosing — and neither was
     implemented until now. The screen follows the finger 1:1 with no
     easing at all; easing belongs only to the release. In RTL a forward
     screen enters from the right and travels left, so going back means
     pulling the current screen back to the right.
     touch-action: pan-y (in style.css) leaves vertical scrolling to the
     browser, so this never fights the page.
     --------------------------------------------------------------------- */
  (function enableDragBack() {
    var THRESHOLD = 0.25;     /* a quarter of the screen commits the move */
    var FLICK = 0.5;          /* px per ms — a fast flick commits early   */
    var startX = 0, startY = 0, startT = 0, dx = 0, active = null, decided = false;

    document.addEventListener("pointerdown", function (e) {
      if (busy || e.button) return;
      var el = e.target.closest("[data-draggable]");
      if (!el || el.hidden) return;
      if (e.target.closest("button, a, input, [role='button']")) return;
      active = el; startX = e.clientX; startY = e.clientY;
      startT = e.timeStamp; dx = 0; decided = false;
    }, { passive: true });

    document.addEventListener("pointermove", function (e) {
      if (!active) return;
      var mx = e.clientX - startX, my = e.clientY - startY;
      if (!decided) {
        if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
        if (Math.abs(my) > Math.abs(mx)) { active = null; return; }  /* it's a scroll */
        decided = true;
        active.classList.add("is-dragging");
      }
      dx = Math.max(0, mx);                       /* back only, never forward */
      active.style.transform = "translateX(" + dx + "px)";
    }, { passive: true });

    function release(e, cancelled) {
      if (!active) return;
      var el = active, target = el.dataset.draggable;
      active = null;
      el.classList.remove("is-dragging");
      if (!decided) { el.style.transform = ""; return; }

      var speed = dx / Math.max(1, e.timeStamp - startT);
      /* A cancelled pointer (the browser took over for scrolling, or a native
         image drag started) must always snap back — never navigate. */
      var commit = !cancelled && (dx > el.offsetWidth * THRESHOLD || speed > FLICK);

      el.classList.add("is-snapping");
      el.style.transform = "";
      window.setTimeout(function () { el.classList.remove("is-snapping"); }, 220);
      if (commit) go(target, { isBack: true });
    }
    document.addEventListener("pointerup", function (e) { release(e, false); }, { passive: true });
    document.addEventListener("pointercancel", function (e) { release(e, true); }, { passive: true });
  })();

  var seed = document.querySelector("[data-slot-display]");
  if (seed) applySlot(seed.textContent);

  /* ---------------------------------------------------------------------
     Settings screens: profile picture picker, notifications, language
     --------------------------------------------------------------------- */
  var lane = document.getElementById("avatar-lane");
  var laneToggle = document.querySelector("[data-avatar-toggle]");
  var profileAvatar = document.getElementById("profile-avatar");

  if (laneToggle && lane) {
    laneToggle.addEventListener("click", function () {
      var open = lane.hidden;
      lane.hidden = !open;
      laneToggle.setAttribute("aria-expanded", String(open));
      if (open) {
        var sel = lane.querySelector('[aria-checked="true"]') || lane.firstElementChild;
        if (sel) sel.scrollIntoView({ inline: "center", block: "nearest", behavior: reduced ? "auto" : "smooth" });
      }
    });

    lane.addEventListener("click", function (e) {
      var item = e.target.closest(".avatar-lane__item");
      if (!item) return;
      qsa(".avatar-lane__item").forEach(function (b) {
        b.setAttribute("aria-checked", String(b === item));
      });
      var img = item.querySelector("img");
      /* התמונה מתחלפת בכל מקום שבו היא מופיעה — גם בראש תפריט ההמבורגר,
         לא רק במסך הפרופיל. */
      if (img) qsa("[data-avatar-target]").forEach(function (slot) {
        slot.src = img.getAttribute("src");
        slot.dataset.i18nAlt = img.dataset.i18nAlt;
        slot.alt = t(img.dataset.i18nAlt);
      });
      item.scrollIntoView({ inline: "center", block: "nearest", behavior: reduced ? "auto" : "smooth" });
    });

    /* arrow keys move through the lane, as a radiogroup should */
    lane.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      var items = qsa(".avatar-lane__item");
      var i = items.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var step = (e.key === "ArrowRight") ? 1 : -1;
      var next = items[(i + step + items.length) % items.length];
      next.focus(); next.click();
    });
  }

  var profileForm = document.getElementById("profile-form");
  if (profileForm) profileForm.addEventListener("submit", function (e) {
    e.preventDefault();
    withLoading(e.submitter || profileForm.querySelector("button[type=submit]"), 450, back);
  });

  var notifForm = document.getElementById("notif-form");
  if (notifForm) notifForm.addEventListener("submit", function (e) {
    e.preventDefault();
    withLoading(e.submitter || notifForm.querySelector("button[type=submit]"), 450, back);
  });

  var langForm = document.getElementById("lang-form");
  if (langForm) langForm.addEventListener("submit", function (e) {
    e.preventDefault();
    withLoading(e.submitter || langForm.querySelector("button[type=submit]"), 450, back);
  });

  document.addEventListener("click", function (e) {
    var pick = e.target.closest("[data-lang]");
    if (pick) applyLanguage(pick.dataset.lang);
  });

  applyLanguage("he");

  /* =====================================================================
     STORAGE
     Everything this app writes to the device lives under the "leeway."
     prefix, and STORAGE_KEYS below is the complete list — the same four
     names that docs/PRIVACY.md lists, and the same four the "מחק את כל מה
     שנשמר" button removes. If a key is ever added here it has to be added
     there too; there is no fifth place data can hide.

       leeway.remember   "1" while "זכרו אותי" is on. Absent otherwise.
       leeway.passenger  the first passenger's details, so the form comes
                         back filled. Written only while leeway.remember
                         is "1", removed the moment it is switched off.
       leeway.profile    what the profile screen's save button saves,
                         including the chosen avatar.
       leeway.onboarded  "1" once the first-visit walkthrough has opened.
                         Carries no personal data — a single flag, whose
                         only job is to keep the walkthrough from opening
                         a second time.

     Every access is wrapped. Safari in private mode does not return null
     from localStorage — it throws, and an unguarded read would take the
     whole app down on the splash screen.
     ===================================================================== */

  var STORAGE_KEYS = ["leeway.remember", "leeway.passenger", "leeway.profile", "leeway.onboarded"];

  function readKey(key) {
    try { return window.localStorage.getItem(key); } catch (err) { return null; }
  }
  function writeKey(key, value) {
    try { window.localStorage.setItem(key, value); return true; } catch (err) { return false; }
  }
  function dropKey(key) {
    try { window.localStorage.removeItem(key); } catch (err) { /* nothing to do */ }
  }
  function readJSON(key) {
    var raw = readKey(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (err) { dropKey(key); return null; }
  }
  function writeJSON(key, value) { return writeKey(key, JSON.stringify(value)); }

  function fmt(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) {
      return Object.prototype.hasOwnProperty.call(vars, k) ? vars[k] : m;
    });
  }

  function field(form, name) { return form ? form.querySelector('[name="' + name + '"]') : null; }

  /* ---------------------------------------------------------------------
     "זכרו אותי" — the button used to be decorative. Now it is the only
     thing that turns storage on: nothing is written until it is pressed,
     and pressing it again deletes what was written.
     --------------------------------------------------------------------- */
  var rememberBtn = document.querySelector("[data-remember]");
  var PAX1 = ["first-1", "last-1", "passport-1", "flight-1"];

  function rememberOn() { return readKey("leeway.remember") === "1"; }

  function snapshotPassenger() {
    if (!form) return;
    var data = {};
    PAX1.forEach(function (n) {
      var el = field(form, n);
      if (el) data[n] = el.value;
    });
    writeJSON("leeway.passenger", data);
  }

  function restorePassenger() {
    var data = readJSON("leeway.passenger");
    if (!data || !form) return;
    PAX1.forEach(function (n) {
      var el = field(form, n);
      if (el && typeof data[n] === "string" && !el.value) el.value = data[n];
    });
  }

  function syncStatefulLabels() {
    if (rememberBtn) {
      var on = rememberOn();
      rememberBtn.setAttribute("aria-pressed", String(on));
      rememberBtn.textContent = t(on ? "reg.rememberOn" : "reg.remember");
    }
    var saved = readJSON("leeway.profile");
    var nameEl = document.querySelector(".settings__name");
    if (nameEl) {
      nameEl.textContent = (saved && (saved.first || saved.last))
        ? [saved.first, saved.last].filter(Boolean).join(" ")
        : t("profile.name");           /* back to the dictionary default */
    }
  }

  if (rememberBtn) {
    rememberBtn.addEventListener("click", function () {
      if (rememberOn()) {
        /* Off means gone, not merely inactive. */
        dropKey("leeway.remember");
        dropKey("leeway.passenger");
      } else {
        writeKey("leeway.remember", "1");
        snapshotPassenger();
      }
      syncStatefulLabels();
    });

    /* While it is on, keep the snapshot current as the traveller types —
       so it survives a crash, not only a successful submit. */
    if (form) form.addEventListener("input", function (e) {
      if (!rememberOn()) return;
      if (PAX1.indexOf(e.target.name) === -1) return;
      window.clearTimeout(snapshotPassenger.timer);
      snapshotPassenger.timer = window.setTimeout(snapshotPassenger, 400);
    });
  }

  /* ---------------------------------------------------------------------
     Profile — "שמור פרטים שלי" now saves. It used to spin and go back.
     --------------------------------------------------------------------- */
  function snapshotProfile() {
    if (!profileForm) return;
    var picked = document.querySelector('.avatar-lane__item[aria-checked="true"]');
    writeJSON("leeway.profile", {
      first: (field(profileForm, "profile-first") || {}).value || "",
      last: (field(profileForm, "profile-last") || {}).value || "",
      passport: (field(profileForm, "profile-passport") || {}).value || "",
      avatar: picked ? picked.dataset.avatar : ""
    });
  }

  /* The profile is the traveller's own details, so editing it should show up
     in "פרטי נוסע" for passenger 1 too — otherwise they type the same name
     twice and wonder which one counts.

     overwrite=true after an explicit save (they just declared these details);
     overwrite=false on load, so a remembered passenger is not clobbered.

     Note it never starts persisting on its own: leeway.passenger is only
     touched when "זכרו אותי" is already on, exactly as the privacy policy says. */
  var PROFILE_TO_PAX = { first: "first-1", last: "last-1", passport: "passport-1" };

  function applyProfileToRegistration(overwrite) {
    var saved = readJSON("leeway.profile");
    if (!saved || !form) return;
    Object.keys(PROFILE_TO_PAX).forEach(function (key) {
      var el = field(form, PROFILE_TO_PAX[key]);
      var val = saved[key];
      if (!el || typeof val !== "string" || !val) return;
      if (overwrite || !el.value) el.value = val;
    });
    if (rememberOn()) snapshotPassenger();
  }

  function restoreProfile() {
    var saved = readJSON("leeway.profile");
    if (!saved || !profileForm) return;
    if (typeof saved.first === "string" && saved.first) field(profileForm, "profile-first").value = saved.first;
    if (typeof saved.last === "string" && saved.last) field(profileForm, "profile-last").value = saved.last;
    if (typeof saved.passport === "string" && saved.passport) field(profileForm, "profile-passport").value = saved.passport;
    if (saved.avatar) {
      var item = document.querySelector('.avatar-lane__item[data-avatar="' + saved.avatar + '"]');
      if (item) item.click();          /* reuses the picker's own paint path */
    }
  }

  if (profileForm) profileForm.addEventListener("submit", function () {
    snapshotProfile();
    applyProfileToRegistration(true);  /* passenger 1 follows the profile */
    syncStatefulLabels();              /* the name under the title follows */
  });

  /* ---------------------------------------------------------------------
     "מחק את כל מה שנשמר" — deletes the four keys and every Cache Storage
     entry this origin holds, then counts again and reports what is left.
     The recount is the point: the button proves itself instead of claiming.
     --------------------------------------------------------------------- */
  var clearBtn = document.querySelector("[data-clear-storage]");
  var clearOut = document.querySelector("[data-clear-result]");

  function countKeys() {
    return STORAGE_KEYS.filter(function (k) { return readKey(k) !== null; }).length;
  }
  function listCaches() {
    if (!window.caches || !caches.keys) return Promise.resolve([]);
    return caches.keys().catch(function () { return []; });
  }

  if (clearBtn) clearBtn.addEventListener("click", function () {
    listCaches().then(function (before) {
      var keysBefore = countKeys();

      STORAGE_KEYS.forEach(dropKey);

      return Promise.all(before.map(function (name) {
        return caches.delete(name).catch(function () { return false; });
      })).then(function () {
        return listCaches().then(function (after) {
          var keysAfter = countKeys();
          var cleared = keysBefore + before.length;

          if (clearOut) {
            if (keysAfter === 0 && after.length === 0) {
              clearOut.removeAttribute("data-failed");
              clearOut.textContent = cleared === 0
                ? t("clear.empty")
                : fmt(t("clear.done"), { k: keysBefore, c: before.length });
            } else {
              clearOut.setAttribute("data-failed", "");
              clearOut.textContent = fmt(t("clear.left"), { k: keysAfter, c: after.length });
            }
          }
          /* The screen has to stop showing what was just deleted, otherwise
             the button reads as a lie. Registration empties; the profile
             goes back to the values the markup ships with. */
          if (form) PAX1.forEach(function (n) { var el = field(form, n); if (el) el.value = ""; });
          if (profileForm) qsa("#profile-form .input").forEach(function (el) { el.value = el.defaultValue; });
          var firstAvatar = document.querySelector(".avatar-lane__item");
          if (firstAvatar) firstAvatar.click();
          syncStatefulLabels();
        });
      });
    });
  });

  restoreProfile();
  restorePassenger();
  applyProfileToRegistration(false);   /* fills only what restore left empty */
  syncStatefulLabels();

  /* A remembered flight number should show its route without being retyped. */
  var bootFlight = document.querySelector('[name="flight-1"]');
  if (bootFlight && bootFlight.value) runFlightLookup(bootFlight.value);

  var routeEl = document.querySelector("[data-route]");
  applyRoutePhoto(routeEl ? routeEl.textContent.trim() : "TLV-SEA");
  captureRouteDefaults();      /* after the shipped photo is in place */
})();
