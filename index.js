const { main } = require('./src/main.js');

// main 함수 실행
main();

// 5분마다 main 함수 실행
const interval = 5 * 60 * 1000; // 5분을 밀리초로 변환하여 설정
setInterval(() => {
    main();
}, interval);

// 시간을 보여주고 남은 시간을 출력하는 함수
function showRemainingTime() {
    const now = new Date().getTime();
    const nextRun = now + interval;

    const remainingMilliseconds = nextRun - now;
    const remainingMinutes = Math.floor(remainingMilliseconds / (1000 * 60));

    console.log(`Next run in approximately ${remainingMinutes} minutes.`);
}

// 맨 처음과 각 인터벌 이후에 시간 출력
showRemainingTime();
setInterval(() => {
    showRemainingTime();
}, interval);
