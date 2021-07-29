// Here is where you can write some funny functions to call from inside of your .ejs files :]

function changeColor() {
    let array = ['#1c1c1c', '#eb4034', '#34a8eb', '#a134eb', '#34eb7a', '#eb3486'];
    let random = array[Math.floor(array.length * Math.random())];
    return `<style> body { background-color: ${random}; } </style>`;
}

module.exports = {
    changeColor: changeColor
};