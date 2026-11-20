# SEO Оптимізація — Час для себе (chas.mk.ua)

## ✅ Що вже зроблено:

### 1. **Технічне SEO на головній сторінці** ✅
- [x] `<title>` — унікальний, 59 символів, ключові слова
- [x] `<meta name="description">` — 156 символів
- [x] `<meta name="robots" content="index, follow">`
- [x] `<link rel="canonical" href="https://chas.mk.ua/">`
- [x] `<html lang="uk">`
- [x] `<meta charset="UTF-8">`
- [x] `<meta name="viewport">`
- [x] `<link rel="icon">` — favicon

### 2. **Open Graph (для соцмереж)** ✅
- [x] og:title
- [x] og:description
- [x] og:image — **ПОТРІБНО**: створити файл `og-image.jpg` (1200×630px)
- [x] og:url
- [x] og:type
- [x] twitter:card

### 3. **Schema.org (JSON-LD)** ✅
- [x] LocalBusiness — повна інформація про студію
- [x] telephone: +380996335197
- [x] address: вул. Захисників Миколаєва, 15
- [x] geo координати
- [x] openingHours: 09:00-21:00
- [x] sameAs: Instagram, Telegram
- [x] hasOfferCatalog — всі послуги

### 4. **Файли індексування** ✅
- [x] `robots.txt` — створений
- [x] `sitemap.xml` — створений (всі сторінки)

### 5. **Структура контенту** ✅
- [x] H1 прихований для SEO (головна)
- [x] H1 на кожній сторінці послуг
- [x] `loading="lazy"` на зображеннях (перевірити)
- [x] `font-display: swap` на шрифтах

---

## 📋 TODO — Що потрібно зробити:

### КРИТИЧНО:

#### 1. **Створити OG Image** 🎨
**Файл:** `og-image.jpg` (1200×630px)  
**Вміст:**
- Логотип "Час для себе"
- Текст: "Професійний масаж у Миколаєві"
- Телефон: +380 99 633-51-97
- Адреса: вул. Захисників Миколаєва, 15

**Як зробити:**
1. Canva.com → Template "Facebook Post" (1200×630)
2. Фон — світлий градієнт
3. Додати логотип, текст, контакти
4. Експорт → JPG
5. Покласти в корінь сайту як `og-image.jpg`

#### 2. **Додати alt для всіх зображень**
Перевірити що всі `<img>` мають атрибут `alt`:
```html
<img src="..." alt="Масаж спини в Миколаєві" />
```

#### 3. **Додати на кожну сторінку послуг:**
- Унікальний `<title>` (наприклад: "Класичний масаж у Миколаєві — Час для себе")
- Унікальний `<meta name="description">`
- `<link rel="canonical">`
- Open Graph теги
- Schema.org Service markup

**Шаблон для classic.html:**
```html
<title>Класичний масаж у Миколаєві — Ціна, запис | Час для себе</title>
<meta name="description" content="Класичний масаж всього тіла у Миколаєві ⭐ Професійний майстер, розслаблення, зняття напруги. Записатися ☎️ +380 99 633-51-97" />
<link rel="canonical" href="https://chas.mk.ua/classic.html" />
```

### ВАЖЛИВО:

#### 4. **Google Search Console**
1. Зайти на https://search.google.com/search-console
2. Додати сайт `chas.mk.ua`
3. Підтвердити володіння (HTML файл або meta tag)
4. Сабмітнути `sitemap.xml`

#### 5. **Google Business Profile**
1. https://www.google.com/business/
2. Створити профіль для "Час для себе"
3. Додати адресу, телефон, години роботи
4. Завантажити фото студії
5. Додати послуги та ціни

#### 6. **Breadcrumbs (хлібні крихти)**
Додати на сторінки послуг:
```html
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li><a href="/">Головна</a></li>
    <li>Класичний масаж</li>
  </ol>
</nav>
```

З Schema.org:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Головна",
    "item": "https://chas.mk.ua/"
  }, {
    "@type": "ListItem",
    "position": 2,
    "name": "Класичний масаж"
  }]
}
```

### БАЖАНО:

#### 7. **FAQ секція**
Додати на головну сторінку розділ "Питання-відповіді":
- Скільки коштує масаж?
- Як довго триває сеанс?
- Чи потрібен запис?
- Які протипоказання?

З Schema.org FAQPage markup.

#### 8. **PageSpeed оптимізація**
- Конвертувати всі JPG/PNG → WebP
- Додати `loading="lazy"` на зображення нижче fold
- Перевірити https://pagespeed.web.dev/

#### 9. **Зворотні посилання (backlinks)**
- Додати в каталоги Миколаєва
- Обмін посиланнями з партнерами
- Соцмережі (активний контент)

---

## 🔍 Перевірка SEO:

### Інструменти:
1. **Schema.org validator**: https://validator.schema.org/ — вставити HTML
2. **Google Rich Results Test**: https://search.google.com/test/rich-results
3. **Meta Tags Checker**: https://metatags.io/?url=chas.mk.ua
4. **PageSpeed Insights**: https://pagespeed.web.dev/
5. **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly

### Після запуску:
1. Додати сайт у Google Search Console
2. Через 2-3 дні перевірити індексацію: `site:chas.mk.ua` у Google
3. Моніторити позиції по запитам:
   - "масаж Миколаїв"
   - "студія масажу Миколаїв"
   - "dry needling Миколаїв"
   - "стоун масаж Миколаїв"

---

## 📊 Ключові слова:

**Пріоритетні:**
- масаж Миколаїв
- студія масажу Миколаїв
- класичний масаж
- глибокий тканинний масаж
- стоун терапія
- dry needling Миколаїв
- spa Миколаїв

**Додаткові:**
- масаж спини Миколаїв
- антистрес масаж
- червоне світло терапія
- масаж для спортсменів
- масаж на Захисників

---

## 🎯 Цілі на перші 3 місяці:

1. Попадання в TOP-10 Google по "масаж Миколаїв"
2. 100+ органічних відвідувачів на місяць
3. Середня позиція ≤ 20 по цільових запитах
4. 5+ якісних backlinks
5. Заповнений Google Business Profile з відгуками

