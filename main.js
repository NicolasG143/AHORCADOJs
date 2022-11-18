import { WORDS } from './words.js'

let game = document.querySelector(".container-word")
let charButtons = document.querySelector(".container-buttons-chars")
let image = document.querySelector(".image")
let tries = 0
let won = false
let errores = document.querySelector(".fails")
let pressedKeys = []
let validKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

let tildes = {'Á': 'A', 'É': 'E', 'Í' : 'I', 'Ó': 'O', 'Ú': 'U'}

let palabra = WORDS[randomNumber()]

palabra = palabra.toUpperCase().split("")

for (let i=0;i<=palabra.length;i++){
    if (tildes[palabra[i]] != undefined){
        palabra[i] = tildes[palabra[i]]
    }
}

for (const i of palabra) {
    let char = '<div class="char">_</div>'
    if(i == " "){
        char = '<div class="char" style="border: none"></div>'
    }
    game.innerHTML += char
}

console.log(palabra.join(''))

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
        for(let i = 0;i<=palabra.length;i++){
            if (!palabra.includes(char)){
                changeImage()
                changeButton(char, true)
                break
            }
            if (palabra[i] === char){
                console.log(game.children[i]);
                game.children[i].innerHTML = char
                changeButton(char, false)
                won = checkWin()
            }
        }
}

function checkWin(){
    let count = 0
    for(let i=0;i<game.children.length;i++){
        if (game.children[i].innerHTML == '_' && game.children[i].innerHTML != undefined){
            count++
            break
        }
    }
    return count == 0
}

function changeImage(){
    if (tries < 6){
        tries += 1
        errores.innerHTML = `Errores: ${tries}/6`
        console.log(tries)
        image.setAttribute('src', `./imgs/${tries}.png`)
    }
}

function changeButton(letra, bool){
    let c = charButtons.children
    for (let i = 0;i<=c.length;i++){
        if (c[i].innerHTML === letra){
            bool ? c[i].style.backgroundColor = "red" : c[i].style.backgroundColor = "green"
            break
        }
    }
}

charButtons.addEventListener('click', (e) => {
    document.dispatchEvent(new KeyboardEvent('keypress', {'key': `${e.target.innerHTML}`}));
})

document.addEventListener('keypress', (e) => {
    let letra = e.key.toUpperCase()
    if (validKeys.includes(letra) && tries < 6 && !won){
        if (!pressedKeys.includes(letra)){
            checkLetters(letra)
            pressedKeys.push(letra)
            console.log(letra)
        }
    }
})
