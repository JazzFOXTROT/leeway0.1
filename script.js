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
      "status.cardTitle": "סטטוס שלי",
      "status.note": "מידע כללי בלבד — ללא רמת עומס חזויה",
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
      "time.passengers": "נוסעים",
      "timeExt.srTitle": "פרטי ההזמנה המלאים",
      "flight.meta": "יום ג׳ · 25.05.2026 · טרמינל 3 · כניסה 03",
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
      "status.cardTitle": "My status",
      "status.note": "General information only — no predicted queue level",
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
      "time.passengers": "Passengers",
      "timeExt.srTitle": "Full booking details",
      "flight.meta": "Tue · 25.05.2026 · Terminal 3 · Gate 03",
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
      "common.continue": "Next",
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
      "status.cardTitle": "Мой статус",
      "status.note": "Только общая информация — без прогноза загруженности",
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
      "time.passengers": "Пассажиры",
      "timeExt.srTitle": "Полные данные брони",
      "flight.meta": "Вт · 25.05.2026 · Терминал 3 · Выход 03",
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
      "status.cardTitle": "حالتي",
      "status.note": "معلومات عامة فقط — بدون توقّع الازدحام",
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
      "time.passengers": "المسافرون",
      "timeExt.srTitle": "تفاصيل الحجز الكاملة",
      "flight.meta": "الثلاثاء · 25.05.2026 · المبنى 3 · البوابة 03",
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

  function applyLanguage(code) {
    if (!LANGS[code]) return;
    lang = code;
    var cfg = LANGS[code], root = document.documentElement;
    root.lang = code;
    root.dir = cfg.dir;
    root.style.setProperty("--typography-family-heading", cfg.heading);
    root.style.setProperty("--typography-family-body", cfg.body);

    qsa("[data-i18n]").forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    qsa("[data-i18n-ph]").forEach(function (el) { el.placeholder = t(el.dataset.i18nPh); });
    qsa("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    qsa("[data-i18n-alt]").forEach(function (el) { el.alt = t(el.dataset.i18nAlt); });
    qsa("[data-lang]").forEach(function (b) { b.setAttribute("aria-checked", String(b.dataset.lang === code)); });

    if (lastSlot) applySlot(lastSlot);
    applyTheme(theme);
    var photo = document.getElementById("route-photo");
    if (photo) photo.alt = t("alt.route");
    /* applyLanguage() has just overwritten every [data-i18n] node with the
       dictionary default, including the two that carry state: the
       "remember me" label and the saved profile name. Put them back. */
    if (typeof syncStatefulLabels === "function") syncStatefulLabels();
  }

  /* ---------------------------------------------------------------------
     Destination photo per flight route.
     Add a route = add one line here and one file in assets/images/.
     --------------------------------------------------------------------- */
  var ROUTE_PHOTOS = {
    "TLV-SEA": { src: "assets/images/route-tlv-sea.png", altKey: "alt.route" }
  };

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
    "time-choosing>time-extended":    { type: "smart", ms: 500, ease: "out" },
    "time-choosing>success":          { type: "smart", ms: 500, ease: "out" },
    "time-choosing>landing":          { type: "move", dir: "right", ms: 500, ease: "out" },
    "time-extended>success":          { type: "smart", ms: 500, ease: "out" },
    "time-extended>time-choosing":    { type: "smart", ms: 500, ease: "out" },
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
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  var themeChosenByUser = false;
  var theme = systemDark.matches ? "dark" : "light";   /* SYSTEM SEED */

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

  /* keep following the phone until the traveller picks a side themselves */
  var onSystemChange = function (e) {
    if (!themeChosenByUser) applyTheme(e.matches ? "dark" : "light");
  };
  if (systemDark.addEventListener) systemDark.addEventListener("change", onSystemChange);
  else if (systemDark.addListener) systemDark.addListener(onSystemChange);

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
    var t = e.target.closest("[data-menu-open]");
    if (t) { openMenu(); return; }
    if (e.target.closest("[data-menu-close]")) { closeMenu(); return; }

    var goEl = e.target.closest("[data-go]");
    if (goEl) { go(goEl.dataset.go); return; }
    if (e.target.closest("[data-back]")) { back(); return; }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var el = e.target.closest('[data-go][role="button"], [data-go][tabindex]');
    if (el) { e.preventDefault(); go(el.dataset.go); }
  });

  /* ---------------------------------------------------------------------
     Pressed state. On touch this carries the whole load — there is no
     hover. pointercancel matters: if the tap turns into a scroll the
     browser cancels it, and without this the control would stay shrunk.
     --------------------------------------------------------------------- */
  var PRESSABLE = ".btn, .slot, .status-card, .flight-card, .icon-btn, .theme-toggle," +
                  ".lang, .lang-switch__btn, .avatar-lane__item, .settings__link," +
                  ".overlay__link, .add-passenger, .link-btn, .hamburger," +
                  '.logo[role="button"], .pass-shell[role="button"], .slots--masked';

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
     Registration — validation. Bad name / passport / flight number sends
     the traveller to the Fail screen, with the offending fields marked.
     --------------------------------------------------------------------- */
  var RULES = {
    name:     { test: /^[\u0590-\u05FF\u0600-\u06FF\u0400-\u04FFA-Za-z][\u0590-\u05FF\u0600-\u06FF\u0400-\u04FFA-Za-z'\- ]{1,}$/, labelKey: "err.label.name" },
    passport: { test: /^\d{8}$/, labelKey: "err.label.passport" },
    flight:   { test: /^[A-Za-z]{2}\s?\d{1,4}$/, labelKey: "err.label.flight" }
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
      '<h3 class="h3 passenger__title"><span data-i18n="reg.passengerN">' + t("reg.passengerN") + '</span> <em>' + n + '</em></h3>' +
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

  function updatePaxCount() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-pax-count]"), function (el) {
      el.textContent = String(paxCount);
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
     prefix, and STORAGE_KEYS below is the complete list — the same three
     names that docs/PRIVACY.md lists, and the same three the "מחק את כל מה
     שנשמר" button removes. If a key is ever added here it has to be added
     there too; there is no fourth place data can hide.

       leeway.remember   "1" while "זכרו אותי" is on. Absent otherwise.
       leeway.passenger  the first passenger's details, so the form comes
                         back filled. Written only while leeway.remember
                         is "1", removed the moment it is switched off.
       leeway.profile    what the profile screen's save button saves,
                         including the chosen avatar.

     Every access is wrapped. Safari in private mode does not return null
     from localStorage — it throws, and an unguarded read would take the
     whole app down on the splash screen.
     ===================================================================== */

  var STORAGE_KEYS = ["leeway.remember", "leeway.passenger", "leeway.profile"];

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
    syncStatefulLabels();              /* the name under the title follows */
  });

  /* ---------------------------------------------------------------------
     "מחק את כל מה שנשמר" — deletes the three keys and every Cache Storage
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
  syncStatefulLabels();

  var routeEl = document.querySelector("[data-route]");
  applyRoutePhoto(routeEl ? routeEl.textContent.trim() : "TLV-SEA");
})();
