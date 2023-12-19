const axios = require('axios');

const fetchDataFromUrl = async (url) => {
    try {
        const response = await axios.get(url);
        const statusGroup = Math.floor(response.status / 100);

        if (statusGroup === 4 || statusGroup === 5) {
            console.error(`Error status code from ${url}: ${response.status}`);
            return null;
        }

        return response.data;
    } catch (error) {
        console.error(`Error fetching data from ${url}: ${error}`);
        return null;
    }
}


module.exports = {
    fetchDataFromUrl
};