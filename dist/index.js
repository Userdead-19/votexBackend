"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateResultVote = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const ElectionRouter_1 = __importDefault(require("./router/ElectionRouter"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const ElectionModel_1 = require("./model/ElectionModel");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
app.use((0, morgan_1.default)('dev'));
io.on('connect', (socket) => {
    console.log('A user connected');
    socket.on('user', (data) => {
        console.log('Received user data:', data);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
const mongoURI = process.env.MONGO_URL || '';
mongoose_1.default.connect(mongoURI)
    .then(() => console.log('Connected to the database'))
    .catch((err) => console.error('Error connecting to the database:', err));
app.use('/api', ElectionRouter_1.default);
app.get('/socket', (req, res) => {
    res.json('Hello World');
    io.emit('message', 'hello world');
});
app.get('/', (req, res) => {
    res.json('Hello World');
});
const updateResultVote = (ElectionURl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, ElectionModel_1.exportVotings)(ElectionURl);
        io.emit(`result/${ElectionURl}`, data);
    }
    catch (error) {
        console.log(error);
    }
});
exports.updateResultVote = updateResultVote;
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
