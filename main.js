import { WORDS } from './words.js'

let game = document.querySelector(".container-word")
let charButtons = document.querySelector(".container-buttons-chars")
let image = document.querySelector(".image")
let tries = 0
let pressedKeys = []
let validKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

let palabra = WORDS[randomNumber()]

palabra = palabra.toUpperCase().split("")

for (const i of palabra) {
    let char = '<div class="char">_</div>'
    if(i == " "){
        char = '<div class="char" style="border: none"></div>'
    }
    game.innerHTML += char
}

palabra = palabra.join('')

for(let i = 65; i<=90;i++){
    charButtons.innerHTML += `<div class="char-button">${String.fromCharCode(i)}</div>`
    if (i == 78){
        charButtons.innerHTML += `<div class="char-button">Ñ</div>`
    }
}

function randomNumber(){
    return Math.floor(Math.random() * WORDS.length)
}

function checkLetters(char){
        for(let i = 0;i<= palabra.length;i++){
            if (!palabra.includes(char)){
                changeImage()
                break
            }
            if (palabra[i] === char){
                console.log(game.children[i]);
                game.children[i].innerHTML = char
            }
        }
}

function changeImage(){
    if (tries < 6){
        tries += 1
        console.log(tries)
        image.setAttribute('src', `./imgs/${tries}.png`)
    }
}



document.addEventListener('keypress', (e) => {
    let letra = e.key.toUpperCase()
    if (validKeys.includes(letra)){
        if (!pressedKeys.includes(letra)){
            checkLetters(letra);
            pressedKeys.push(letra)
            console.log(letra)
        }
    }
})
