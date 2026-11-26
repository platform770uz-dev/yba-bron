// Настройки сайта брони «Yosh Blogerlar Akademiyasi».
// Меняйте значения здесь — сайт подхватит их сам. Подробности — в README.md.
window.SAYT_CONFIG = {
  // Демо-режим: заявки никуда не отправляются, сверху жёлтая полоска «Demo». Для настоящих броней — false.
  demo: false,

  // Адрес функции приёма броней в Supabase (yba-sayt-bron, проект zamonaviy-kasblar).
  endpoint: 'https://uzivivmrixstxjvzkksz.supabase.co/functions/v1/yba-sayt-bron',

  // Цена одного месяца в сумах. На сайте: цена и цена со скидкой за первый месяц.
  narx: 600000,

  // Скидка после каждого шага: 3 экрана о курсе, выбор возраста, бронь. Последнее число — итоговая скидка.
  chegirmalar: [3, 6, 10, 15, 20],

  // Варианты возраста ребёнка на экране брони.
  yoshlar: ['6–8', '9–11', '12–14', '15+'],

  // Сезоны курса (по 3 месяца, без перерыва). Сайт сам выбирает ближайший сезон по дате:
  // зима — декабрь–февраль, весна — март–май, лето — июнь–август, осень — сентябрь–ноябрь.
  mavsumlar: { qish: 'Qorbo‘ron', bahor: 'Uyg‘onish', yoz: 'Olov', kuz: 'Shamol' },

  // Факты о курсе — экран «Darslar qanday o‘tadi». Пустая строка = строка не показывается.
  joy: 'Farg‘ona, offlayn markaz',
  davomiylik: 'Har mavsum 3 oy, tanaffussiz',
  jadval: '',                  // расписание не показываем — время группы скажет менеджер
  guruh: '10 nafargacha bola',
  yosh: '',                    // возраст курса не показываем

  // Экран «Rahmat» (после брони).
  ishVaqti: 'dushanba–shanba, 13:00–19:00', // часы работы операторов (как в operator-notify)
  manzil: '',   // адрес не показываем — скажет менеджер
  xarita: '',   // ссылка на карту (Google / Yandex); пусто — ссылки нет
  aloqaTelefon: '', // номер для связи, если интернет подвёл, например '+998 90 123 45 67'

  // Meta Pixel: ID из Events Manager (только цифры). Пусто — пиксель не подключается.
  metaPixelId: '',

  // Оплата брони через Payme. Включать, когда касса заработает (и в функции секрет SAYT_PAYME=on).
  payme: { enabled: false, summa: 100000 },
};
