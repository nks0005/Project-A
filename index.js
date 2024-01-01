const { main } = require('./src/main.js');

// 5분마다 main 함수 실행
const interval = 1000; // 5분을 밀리초로 변환하여 설정



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function test() {
    
    function getCurrentTime() {
        const now = new Date();
        return now.toTimeString().split(' ')[0]; // 시간 부분만 반환 (HH:MM:SS)
    }

    const cache_check = new Set();
    while (true) {

        const currentTime = getCurrentTime().split(':').slice(0, 2).join(':'); // 시간과 분만 가져오기
        console.log(`Current time (hour:minute): ${currentTime}`);
        console.log('running...');
        console.log('running...');
        await main(cache_check);
        console.log('sleep...');
        await sleep(interval);
    };
};


// 처음에는 지연 없이 main 함수 실행
console.log('Running main function initially...');
test();