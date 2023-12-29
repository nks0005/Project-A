const { main } = require('./src/main.js');

// main 함수 실행
main();

// 5분마다 main 함수 실행
setInterval(() => {
    main();
}, 50 * 60 * 1000); // 5분을 밀리초로 변환하여 설정
