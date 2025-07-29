import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
  vus: 100,              // 并发用户数
  duration: '30s',       // 压测持续时间
};

export default function () {
  const url = 'ws://127.0.0.1:9001';

  const res = ws.connect(url, {}, function (socket) {
    socket.on('open', function () {
      console.log('🟢 Connected');
      socket.send(JSON.stringify({
        symbol: "BTCUSDT",
        interval_ms: 1000
      }));
    });

    socket.on('message', function (msg) {
      console.log('📥 Received:', msg);
    });

    socket.setTimeout(function () {
      socket.close();
      console.log('⛔ Closing');
    }, 5000);
  });

  check(res, { 'status is 101': (r) => r && r.status === 101 });
}