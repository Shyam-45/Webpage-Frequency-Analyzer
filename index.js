const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

const mongoose = require('mongoose');
const { calculateWordFrequency, storeWords, fetchUrlData } = require("./logic.js");

main().catch(err => console.log(err));

main()
    .then ( () =>{
        console.log("Connection Successful!");
    }) 
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wordFrequencyAnalyzer');
}

const axios = require("axios");
const cheerio = require("cheerio");

app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')))

// Home Route
app.get("/", (req, res) =>  {
    res.render("index.ejs");
})

// Analysis Route
app.post("/analyze", async (req, res) => {

    let {url, nVal} = req.body;

    try {

        const existingUrlData = await fetchUrlData(url);

        if (existingUrlData) {
            console.log("URL already analyzed. Using existing data.");
            const mostFrequentWords = existingUrlData.wordsData.slice(0, nVal);
            return res.render('analysis.ejs', {mostFrequentWords, url, nVal});
        }

        let urlResponse = await axios.get(url);
        let htmlData = urlResponse.data;
        let $ = cheerio.load(htmlData);
        let textContent = $('body').text();

        let wordsData = calculateWordFrequency(textContent);
        await storeWords(wordsData, url);

        const mostFrequentWords = wordsData.slice(0, nVal).map(([word, count]) => ({ word, count }));
        res.render('analysis.ejs', {mostFrequentWords, url, nVal});
    }
    catch(er) {
        // Render error page if any issue arises
        console.log("Error while analyzing.");
        res.render('error.ejs', {er});
    }

})


// Error Handling Middleware
app.use((err, req, res, next) => {

    console.log("Error caught by middleware.");
    res.status(500).render("error.ejs", { er: err.message || "An error occurred" });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})