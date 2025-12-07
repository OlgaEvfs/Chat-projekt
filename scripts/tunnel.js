require('dotenv').config();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const token = process.env.NGROK_TOKEN;
const envPath = path.resolve(__dirname, '..', '.env');

console.log('Записываем в файл:', envPath);

if (!token) {
    console.error('NGROK_TOKEN не найден в переменных окружения');
    process.exit(1);
}

// Запуск ngrok c выводом логов JSON в stdout
const args = [
    'ngrok',
    'http',
    '3000',
    '--log=stdout',
    '--log-format=json'
];

console.log('Запускаю: npx ' + args.join(' '));

const ngrokProc = spawn('npx', args, {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NGROK_AUTHTOKEN: token } // ← добавляем токен через env
});

let foundUrl = null;

ngrokProc.stdout.on('data', (data) => {
    const text = data.toString();
    try {
        const json = JSON.parse(text);
        if (json.msg === 'started tunnel' && json.url) {
            const url = json.url;
            console.log('🔗 Tunnel URL:', url);
            writeTunnelUrl(url);
        }
    } catch {
        // игнорируем все остальные строки
    }
});

ngrokProc.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
});

ngrokProc.on('exit', (code) => {
    console.log('ngrok завершён. Код:', code);
});

function writeTunnelUrl(url) {
    try {
        let envText = '';

        try {
            envText = fs.readFileSync(envPath, 'utf8');
        } catch {
            envText = '';
        }

        const key = 'TUNNEL_URL';
        const line = `${key}=${url.trim()}`;

        if (envText.match(new RegExp(`^${key}=.*$`, 'm'))) {
            envText = envText.replace(new RegExp(`^${key}=.*$`, 'm'), line);
        } else {
            if (envText && !envText.endsWith('\n')) envText += '\n';
            envText += line + '\n';
        }

        fs.writeFileSync(envPath, envText, 'utf8');
        console.log(`✅ Записано в ${envPath}: ${line}`);
        console.log('Нажмите Ctrl+C чтобы остановить туннель.');
    } catch (e) {
        console.error('❌ Ошибка записи в .env:', e);
    }
}
