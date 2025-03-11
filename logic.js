const UrlHistory = require("./models/urlHistory.js");

// Function to calculate n most frequent words
function calculateWordFrequency(content) {
    let words = content.toLowerCase().match(/\b\w+\b/g);   
    let frequencies = {};

    for(let word of words) {
        frequencies[word] = (frequencies[word] || 0) + 1;
    }

    let sortedWords = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);

    return sortedWords;
};


// Function to store the word frequencies in the database
async function storeWords(sortedWords, url) {

    try {

        const existingUrl = await UrlHistory.findOne( {url});
        if (existingUrl) {
            console.log("Url already exists in history, no need to store the data in FrequencyTable.");
            return;
        }

        const frequencyData = sortedWords.map(([word, count]) => ({ word, count }));
        await UrlHistory.create({url, wordsData: frequencyData });
        console.log("Url added to history.")
    }
    catch (dbError) {
       console.error("Error storing word frequencies:", dbError);
       throw dbError;
    }

}

// Function to fetch Url data from database
async function fetchUrlData(url) {
    
    try {
      const urlData = await UrlHistory.findOne({ url });
      return urlData;
    }
    catch (err) {
      console.error("Error fetching URL data:", err);
      throw err;
    }
}

module.exports = { calculateWordFrequency, storeWords, fetchUrlData };