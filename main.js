import { WORDS } from './words.js'

let game = document.querySelector(".container-word")
let charButtons = document.querySelector(".container-buttons-chars")

function randomNumber(){
    return Math.floor(Math.random() * WORDS.length)
}

let palabra = WORDS[randomNumber()]

palabra = palabra.toUpperCase().split("")

for (const i of palabra) {
    let char = '<div class="char">_</div>'
    if(i == " "){
        char = '<div class="char" style="border: none"></div>'
    }
    game.innerHTML += char
}

for(let i = 65; i<=90;i++){
    charButtons.innerHTML += `<div class="char-button">${String.fromCharCode(i)}</div>`
    if (i == 78){
        charButtons.innerHTML += `<div class="char-button">Ñ</div>`
    }
}

console.log(palabra)