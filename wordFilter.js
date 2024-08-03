const badWords = ['badword1', 'badword2', 'badword3']; // Add more bad words as needed

function filterBadWords(text) {
    let filteredText = text;
    badWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    });
    return filteredText;
}

module.exports = { filterBadWords };
