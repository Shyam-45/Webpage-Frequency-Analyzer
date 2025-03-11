const mongoose = require("mongoose");

const urlHistorySchema = new mongoose.Schema ({

    url: {
        type: String,
        required: true,
        unique: true
    },
    wordsData: [
        {
            word: {
                type: String
            },

            count: {
                type: Number,
                required: true,
                default: 0
            }
        }
    ]
});

const UrlHistory = mongoose.model("UrlHistory", urlHistorySchema);

module.exports = UrlHistory;