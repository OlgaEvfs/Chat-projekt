import express, { Application } from "express";
import http from "http";
import path from "path";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import chatRoutes from "./routes/chatRoutes";
import { SocketService } from "./services/socketService";

// Порт приложения; можно переопределить через переменную
const PORT = Number(process.env.PORT) || 3000;

// Создаем и настраиваем экземпляр Express
const app: Application = express();

// Обработка CORS = если фронтенд будет открыт на другом домене
app.use(cors());
// Позволяем читать JSON из тела запросов (например, если захотим добавить POST API)
app.use(express.json());

// Восстанавливаем путь до статической папки; используем process.cwd(),
// чтобы путь был корректен и в dev (ts-node), и в прод-сборке (node dist/...).
const publicDir = path.resolve(process.cwd(), "public");
app.use(express.static(publicDir));

// Подключаем REST-маршруты
app.use(chatRoutes);

// Простейший healthcheck для текстов
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// Создаем HTTP-сервер и навешиваем на него Socket.io
const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: "*",
    },
});

// Инициализируем сервис работы с сокетами
const socketService = new SocketService(io);
socketService.init();

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("chat:typing", (data) => {
    // пересылаем всем остальным
    socket.broadcast.emit("chat:typing", data);
  });

  socket.on("chat:reaction", ({ messageId, emoji, author }) => {
    // Здесь можно сохранить реакцию в БД или в память, если нужно
    
    // Рассылаем всем клиентам (включая того, кто кликнул)
    io.emit("chat:reaction", { messageId, emoji, author });
  });
});

// Запускаем сервер
server.listen(PORT, () => {
    console.log(`Mario chat is running on http://localhost:${PORT}`);
});
