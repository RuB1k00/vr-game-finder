# VR Game Finder — версия с серверной админ-панелью для Netlify

## Что внутри

- `index.html` — фронтенд сайта.
- `data/default-games.json` — исходный каталог из 78 игр.
- `netlify/functions/games.js` — публичная загрузка каталога.
- `netlify/functions/admin-login.js` — вход администратора.
- `netlify/functions/admin-session.js` — проверка сессии.
- `netlify/functions/admin-logout.js` — выход.
- `netlify/functions/admin-games.js` — добавление, редактирование, удаление, импорт и сброс каталога.
- `netlify/functions/_utils/` — авторизация, работа с Netlify Blobs, проверка данных.
- `scripts/hash-password.js` — генерация безопасного хеша пароля.

## Что изменено по сравнению с прошлой версией

1. Убрана карточка `средняя сложность`.
2. Фильтры `Жанры` и `Теги` теперь скрыты в выпадающих списках.
3. Редактор больше не доступен как обычная вкладка.
4. Управление каталогом вынесено в защищённую серверную админ-панель.
5. Изменения каталога сохраняются на сервере и видны всем пользователям.
6. Пароль администратора не хранится в HTML и не отправляется пользователям.
7. Сессия администратора хранится в `HttpOnly` cookie.
8. Добавлены импорт/экспорт JSON, экспорт CSV и сброс каталога.

## Важное ограничение

Обычная загрузка папки через Netlify Drop подходит только для статических сайтов. В этой версии есть серверные функции, поэтому проект нужно разворачивать через GitHub/GitLab/Bitbucket или через Netlify CLI с build-процессом.

## Локальный запуск

Установи Node.js 20+.

```bash
npm install
npm run hash-password
```

Скрипт выведет две строки:

```env
ADMIN_PASSWORD_HASH=...
ADMIN_SESSION_SECRET=...
```

Создай файл `.env` в корне проекта и вставь туда эти значения.

Запуск:

```bash
npm run dev
```

Обычно сайт откроется на адресе:

```text
http://localhost:8888
```

## Настройка на Netlify

1. Создай новый проект на Netlify.
2. Подключи репозиторий с этим проектом.
3. В настройках проекта открой Environment variables.
4. Добавь переменные:

```env
ADMIN_PASSWORD_HASH=значение_из_скрипта
ADMIN_SESSION_SECRET=значение_из_скрипта
```

5. Убедись, что переменные доступны для Functions/runtime.
6. Сделай deploy.

## Как пользоваться админ-панелью

1. Открой сайт.
2. Нажми кнопку `🔐 Админ`.
3. Введи пароль.
4. После входа откроется серверный редактор.
5. Добавленные/изменённые/удалённые игры сохраняются в Netlify Blobs и будут видны всем посетителям сайта.

## API

### Публичный каталог

```text
GET /.netlify/functions/games
```

### Вход администратора

```text
POST /.netlify/functions/admin-login
Body: { "password": "..." }
```

### Проверка сессии

```text
GET /.netlify/functions/admin-session
```

### Выход

```text
POST /.netlify/functions/admin-logout
```

### Админ-управление каталогом

```text
GET    /.netlify/functions/admin-games
POST   /.netlify/functions/admin-games
PUT    /.netlify/functions/admin-games?id=ID
DELETE /.netlify/functions/admin-games?id=ID
PATCH  /.netlify/functions/admin-games
POST   /.netlify/functions/admin-games?action=reset
```

`PATCH` заменяет весь каталог и используется для импорта JSON.

## Безопасность

- Админ-пароль не лежит в клиентском коде.
- В HTML нет Firebase URL и нет открытого токена управления.
- Пароль хранится только как `scrypt`-хеш в переменной окружения.
- Сессия подписывается через `ADMIN_SESSION_SECRET`.
- Cookie имеет флаги `HttpOnly`, `SameSite=Lax`, а на Netlify также `Secure`.
- Запросы изменения каталога дополнительно проверяют `Origin`.

## Если сайт не входит в админку

Проверь:

1. Заданы ли `ADMIN_PASSWORD_HASH` и `ADMIN_SESSION_SECRET`.
2. Нет ли лишних пробелов в переменных окружения.
3. Был ли выполнен redeploy после добавления переменных.
4. Открываешь ли сайт по HTTPS-домену Netlify.
5. Не заблокированы ли cookies в браузере.

## Если каталог не сохраняется

Проверь Netlify Functions logs. Если функции не запускаются, значит проект был загружен как чистая статическая папка без build-процесса. Разверни через Git или Netlify CLI.
