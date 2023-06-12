import { WORDS } from "./words.js";

let game = document.querySelector(".container-word");
let charButtons = document.querySelector(".container-buttons-chars");
let image = document.querySelector(".image");
let restartButton = document.querySelector(".restart");
let tries = 0;
let won = false;
let game_state = document.querySelector(".game-state");
let correctWord = document.getElementById("correct_word");
let errores = document.querySelector(".fails");
let pressedKeys = [];
const validKeys = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "Ñ",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

const tildes = { Á: "A", É: "E", Í: "I", Ó: "O", Ú: "U" };

let char = '<div class="char">_</div>';
let palabra = "";
newWord();
addWord();
console.log(palabra);

/*for (let i=0;i<=palabra.length;i++){
    if (tildes[palabra[i]] != undefined){
        palabra[i] = tildes[palabra[i]]
    }
}*/

function newWord() {
  game.innerHTML = "";
  palabra = WORDS[randomNumber()]
    .toUpperCase()
    .split("")
    .map((a) => tildes[a] || a)
    .join("");
  console.log(palabra);
}

function addWord() {
  for (const i of palabra) {
    if (i == " ") {
      char = '<div class="char" style="border: none"></div>';
    }
    game.innerHTML += char;
  }
}

for (let i = 65; i <= 90; i++) {
  charButtons.innerHTML += `<div class="char-button">${String.fromCharCode(
    i
  )}</div>`;
  if (i == 78) {
    charButtons.innerHTML += `<div class="char-button">Ñ</div>`;
  }
}

function randomNumber() {
  return Math.floor(Math.random() * WORDS.length);
}

function checkLetters(char) {
  for (let i = 0; i <= palabra.length; i++) {
    if (!palabra.includes(char)) {
      shake(document.body);
      changeImage();
      changeButton(char, true);
      break;
    }
    if (palabra[i] === char) {
      game.children[i].innerHTML = char;
      changeButton(char, false);
      won = checkWin();
    }
  }
}

function checkWin() {
  let count = 0;
  for (let i = 0; i < game.children.length; i++) {
    if (
      game.children[i].innerHTML == "_" &&
      game.children[i].innerHTML != undefined
    ) {
      count++;
      break;
    }
  }
  return count == 0;
}

function changeImage() {
  if (tries < 6) {
    tries += 1;
    errores.innerHTML = `Errores: ${tries}/6`;
    image.src = `./imgs/${tries}.png`;
  }
}

function changeButton(letra, bool) {
  let c = charButtons.children;
  for (let i = 0; i <= c.length; i++) {
    if (c[i].innerHTML === letra) {
      bool
        ? (c[i].style.backgroundColor = "red")
        : (c[i].style.backgroundColor = "green");
      break;
    }
  }
}

function newGame() {
  let c = charButtons.children;
  tries = -1;
  won = false;
  changeImage();
  newWord();
  addWord();
  for (const child of c) {
    child.style.backgroundColor = "";
  }
  game_state.children[0].classList.add("none");
  game_state.children[1].classList.add("none");
  pressedKeys = [];
  game_state.parentElement.classList.add("none");
}

async function shake(element) {
  element.className = "shake";
  await new Promise((r) => setTimeout(r, 250));
  element.className = "";
}

restartButton.addEventListener("click", newGame);

charButtons.addEventListener("click", (e) => {
  document.dispatchEvent(
    new KeyboardEvent("keypress", { key: `${e.target.innerHTML}` })
  );
});

document.addEventListener("keypress", (e) => {
  let letra = e.key.toUpperCase();
  if (validKeys.includes(letra) && tries < 6 && !won) {
    if (!pressedKeys.includes(letra)) {
      checkLetters(letra);
      pressedKeys.push(letra);
    }
  }
  if (won) {
    game_state.parentElement.classList.remove("none");
    game_state.children[0].classList.remove("none");
    correctWord.innerText = palabra;
  } else if (!won && tries >= 6) {
    game_state.parentElement.classList.remove("none");
    game_state.children[1].classList.remove("none");
    correctWord.innerText = palabra;
  }
});
