(() => {
    // Находим нужные элементы DOM заранее
    const messagesEl = document.getElementById("messages");
    const authorEl = document.getElementById("author");
    const messageEl = document.getElementById("message");
    const sendBtn = document.getElementById("send");
    const feedbackEl = document.getElementById("feedback");
    const statusPill = document.getElementById("status-pill");

    // Создаем подключение к серверу Socket.io
    const tunnelUrl = "https://dashboard.ngrok.com/get-started/your-authtoken";
    const socket = io();

    // Загружаем ранее выбранное имя из localStorage, если оно было
    const savedName = localStorage.getItem("mkchat:name");
    if (savedName && authorEl instanceof HTMLInputElement) {
        authorEl.value = savedName;
    }

    // Утилита для смены статуса сервера
    const setStatus = (text, online) => {
        statusPill.textContent = text;
        statusPill.classList.toggle("status-pill--online", online);
        statusPill.classList.toggle("status-pill--offline", !online);
    };

    // при вводе текста отправляем событие "typing"
    messageEl.addEventListener("input", () => {
        socket.emit("chat:typing", { author: authorEl.value.trim() || "Anonymous" });
    });

    // слушаем событие от сервера
    socket.on("chat:typing", (data) => {
        showTypingIndicator(data.author);
    });

    // функция отображения индикатора
    function showTypingIndicator(name) {
        let indicator = document.getElementById("typing-indicator");
        if (!indicator) { indicator = document.createElement("div");
            indicator.id = "typing-indicator";
            document.body.appendChild(indicator);
        }
        indicator.textContent = `${name} печатает...`;

        // убираем через 2 секунды, если нет новых событий
        clearTimeout(indicator.timeout);
        indicator.timeout = setTimeout(() => {
            indicator.textContent = "";
        }, 2000);
    }
    

    // Сопоставление имён с аватарками (будет пополняться)
    let userAvatars = JSON.parse(localStorage.getItem("mkchat:avatars") || "{}");

    // Функция получения аватарки
    function getAvatar(name) {
        const avatarList = ["🍄", "👑", "🐢", "⭐", "🌸", "🎩", "⚡", "🪙"];
        const index = name
                .split("")
                .map(c => c.charCodeAt(0))
                .reduce((a, b) => a + b, 0) % avatarList.length;
        return avatarList[index];
    }

    // Форматирование времени в локальный формат
    const formatTime = (timestamp) => {
        try {
            return new Intl.DateTimeFormat(undefined, {
                hour: "2-digit",
                minute: "2-digit",
            }).format(new Date(timestamp));
        } catch {
            return "";
        }
    };

    // Создание DOM-элемента сообщения для вставки в список
    const createMessageElement = (message) => {
        const container = document.createElement("article");
        container.className = "message";
        container.dataset.id = message.id;

        const meta = document.createElement("div");
        meta.className = "message-meta";

        const avatar = document.createElement("span");
        avatar.className = "message__avatar";
        avatar.textContent = getAvatar(message.author);

        const author = document.createElement("span");
        author.className = "message__author";
        author.textContent = message.author;

        const time = document.createElement("time");
        time.className = "message__time";
        time.textContent = formatTime(message.timestamp);

        meta.append(avatar, author, time);

        const text = document.createElement("p");
        text.className = "message__text";
        text.textContent = message.text;

        // --- Панель реакций справа ---
        const reactionBar = document.createElement("div");
        reactionBar.className = "reaction-bar";

        ["😀","😂","🍄","⭐","🐢","❤️"].forEach((emoji) => {
            const btn = document.createElement("span");
            btn.className = "reaction-btn";
            btn.textContent = emoji;
            btn.addEventListener("click", () => {
                socket.emit("chat:reaction", {
                    messageId: message.id,
                    emoji,
                    author: authorEl.value.trim() || "Anonymous"
                });
            });

            reactionBar.appendChild(btn);
        });

        const reactions = document.createElement("div");
        reactions.className = "message-reactions";

        // обертка для текста + реакции справа
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "message-content";
        contentWrapper.append(text, reactions);

        container.append(meta, contentWrapper, reactionBar);
        return container;
    };

    // Рендер всей истории
    const renderMessages = (messages) => {
        messagesEl.innerHTML = "";
        messages.forEach((m) => {
            messagesEl.appendChild(createMessageElement(m));
        });
        messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    // Добавление одного сообщения в конец
    const appendMessage = (message) => {
        messagesEl.appendChild(createMessageElement(message));
        messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    // Показ подсказки об ошибке/успехе
    const showFeedback = (text, isError = false) => {
        feedbackEl.textContent = text;
        feedbackEl.classList.toggle("feedback--error", isError);
    };

    // Получаем историю через REST, чтобы сразу показать уже отправленные сообщения
    const loadHistory = async () => {
        try {
            const response = await fetch("/api/messages");
            if (!response.ok) {
                throw new Error("Failed to load history");
            }
            const data = await response.json();
            renderMessages(data.messages || []); showFeedback("Loaded history");
        } catch (error) {
            console.error(error);
            showFeedback("Could not load history", true);
        }
    };

    // Отправка сообщения на сервер
    const sendMessage = () => {
        const author = authorEl.value.trim() || "Anonymous";
        const text = messageEl.value.trim();

        if (!text) {
            showFeedback("Type something before sending", true);
            return;
        }

        // Сохраняем имя, чтобы не вводить его каждый раз
        localStorage.setItem("mkchat:name", author);

        sendBtn.disabled = true;
        showFeedback("Sending...");

        socket.emit("chat:send", { author, text }, (err) => {
            sendBtn.disabled = false;
            if (err) {
                showFeedback(err, true);
                return;
            }
            
            messageEl.value = "";
            messageEl.focus();
            showFeedback("Sent!");
        });
    };

    // Инициализация: загрузка истории и подключение событий UI
    const init = () => {
        loadHistory();

        sendBtn.addEventListener("click", sendMessage);

        messageEl.addEventListener("keydown", (event) => {
            // Отправляем по Ctrl/Cmd + Enter, чтобы было похоже на мессенджеры
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                sendMessage();
            }
        });
    };

    // Подписки на сокет-события
    socket.on("connect", () => setStatus("Online", true));
    socket.on("disconnect", () => setStatus("Offline", false));

    // Сервер присылает всю историю при подключении
    socket.on("chat:init", (messages) => renderMessages(messages));

    // Новое сообщение от любого пользователя
    socket.on("chat:new", (message) => appendMessage(message));

    // реакция от других пользователей
    socket.on("chat:reaction", ({ messageId, emoji }) => {
        const msgEl = document.querySelector(`article[data-id="${messageId}"]`);
        if (!msgEl) return;

        const box = msgEl.querySelector(".message-reactions");
        const r = document.createElement("span");
        r.className = "reaction";
        r.textContent = emoji;
        box.appendChild(r);
    });


    // Если сервер вернул ошибку не через callback
    socket.on("chat:error", (msg) => showFeedback(msg, true));

    // Запускаем инициализацию, когда DOM готов (скрипт подключен в конце, но на всякий случай)
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();