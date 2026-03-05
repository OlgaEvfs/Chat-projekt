import { ChatModel } from "../src/models/chatMessage";

describe("ChatModel", () => {
    let model: ChatModel;

    beforeEach(() => {
        model = new ChatModel();
    });

    test("should add a new message correctly", () => {
        const message = model.add("Alice", "Hello world!");
        expect(message).toBeDefined();
        expect(message.author).toBe("Alice");
        expect(message.text).toBe("Hello world!");
        expect(message.id).toBe(1);
        expect(model.getAll()).toHaveLength(1);
    });

    test("should use 'Anonymous' if author is empty", () => {
        const message = model.add("   ", "Hello");
        expect(message.author).toBe("Anonymous");
    });

    test("should throw error if text is empty", () => {
        expect(() => model.add("Alice", "   ")).toThrow("Текст сообщения пуст");
    });

    test("should trim long author and text", () => {
        const longAuthor = "a".repeat(50);
        const longText = "t".repeat(600);
        const message = model.add(longAuthor, longText);
        expect(message.author.length).toBe(30);
        expect(message.text.length).toBe(500);
    });

    test("should limit history to 100 messages", () => {
        for (let i = 1; i <= 110; i++) {
            model.add("User", `Message ${i}`);
        }
        const messages = model.getAll();
        expect(messages).toHaveLength(100);
        expect(messages[0].text).toBe("Message 11");
        expect(messages[99].text).toBe("Message 110");
    });

    test("getAll() should return a copy, not the original array", () => {
        model.add("Alice", "Hello");
        const messages = model.getAll();
        messages.push({ id: 99, author: "Hacker", text: "Malicious", timestamp: Date.now() });
        expect(model.getAll()).toHaveLength(1);
    });
});
