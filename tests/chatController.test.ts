import request from "supertest";
import express from "express";
import chatRoutes from "../src/routes/chatRoutes";
import { chatModel } from "../src/models/chatMessage";

describe("ChatController", () => {
    let app: express.Application;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use(chatRoutes);
    });

    test("GET /api/messages should return list of messages", async () => {
        chatModel.add("ControllerTester", "Test message via API");
        const response = await request(app).get("/api/messages");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("messages");
        expect(Array.isArray(response.body.messages)).toBe(true);
        const found = response.body.messages.find(
            (m: any) => m.author === "ControllerTester"
        );
        expect(found).toBeDefined();
        expect(found.text).toBe("Test message via API");
    });
});
