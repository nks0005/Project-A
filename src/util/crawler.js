const axios = require('axios');


const WAIT_TIME = 10 * 1000; // second * mils

const fetchDataFromUrl = async (url) => {
    try {
        const response = await axios.get(url);
        const statusGroup = Math.floor(response.status / 100);

        if (statusGroup === 4 || statusGroup === 5) {
            console.error(`Error status code from ${url}: ${response.status}`);
            return retryFetch(url); // Error status code이면 재시도
        }

        return response.data;
    } catch (error) {
        console.error(`Error fetching data from ${url}: ${error}`);
        return retryFetch(url); // 에러 발생 시 재시도
    }
}

const retryFetch = async (url) => {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const response = await axios.get(url);
                const statusGroup = Math.floor(response.status / 100);

                if (statusGroup === 4 || statusGroup === 5) {
                    console.error(`Error status code from ${url}: ${response.status}`);
                    resolve(null);
                }

                resolve(response.data);
            } catch (error) {
                console.error(`Error fetching data from ${url}: ${error}`);
                resolve(null);
            }
        }, WAIT_TIME); // WAIT_TIME 이후 재시도 
    });
}



module.exports = {
    fetchDataFromUrl
};