import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { io as Client, Socket as ClientSocket } from "socket.io-client";
import { SocketService } from "../src/services/socketService";
import { chatModel } from "../src/models/chatMessage";

describe("SocketService", () => {
    let io: SocketServer;
    let server: any;
    let clientSocket: ClientSocket;
    let port: number;

    beforeAll((done) => {
        server = createServer();
        io = new SocketServer(server);
        const service = new SocketService(io);
        service.init();

        server.listen(() => {
            const address = server.address();
            port = address.port;
            done();
        });
    });

    afterAll(() => {
        io.close();
        server.close();
    });

    beforeEach((done) => {
        clientSocket = Client(`http://localhost:${port}`);
        clientSocket.on("connect", done);
    });

    afterEach(() => {
        if (clientSocket.connected) {
            clientSocket.disconnect();
        }
    });

    test("should receive current messages on connection", (done) => {
        const secondClient = Client(`http://localhost:${port}`);
        secondClient.on("chat:init", (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            secondClient.disconnect();
            done();
        });
    });

    test("should broadcast new message to all clients", (done) => {
        const payload = { author: "Tester", text: "Hello Socket!" };
        clientSocket.on("chat:new", (message) => {
            expect(message.author).toBe("Tester");
            expect(message.text).toBe("Hello Socket!");
            done();
        });
        clientSocket.emit("chat:send", payload);
    });

    test("should handle empty message error via callback", (done) => {
        const payload = { author: "Tester", text: "" };
        clientSocket.emit("chat:send", payload, (error?: string) => {
            expect(error).toBe("Текст сообщения пуст");
            done();
        });
    });
});
