///<-----------------Initialized Deck & Card Class-------------------->///
class Card {
  constructor(name, suit, value, id, index, isRevealed = true) {
    this.name = name;
    this.suit = suit;
    this.value = value;
    this.id = id;
    this.index = index;
    this.isRevealed = isRevealed;
  }
}
class Deck {
  constructor() {
    this.cards = [];
    this.table = [];
    this.hand = [];
    this.initDeck();
    this.shuffle();
  }
  initDeck() {
    const suits = ["Hearts", "Diamonds", "Spades", "Clubs"];
    const spRanks = [
      { name: "Ace", value: 12, id: "A", index: 1 },
      { name: "Jack", value: 11, id: "J", index: 11 },
      { name: "Queen", value: 11, id: "Q", index: 12 },
      { name: "King", value: 11, id: "K", index: 13 },
    ];
    for (const suit of suits) {
      for (const rank of spRanks) {
        const card = new Card(
          `${rank.name} of ${suit}`,
          suit,
          rank.value,
          rank.id,
          rank.index
        );
        this.cards.push(card);
      }
      for (let i = 2; i <= 10; i++) {
        const card = new Card(`${i} of ${suit}`, suit, i, `${i}`, i);
        this.cards.push(card);
      }
    }
  }
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const x = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[x]] = [this.cards[x], this.cards[i]];
    }
  }
  drawCard() {
    return this.cards.pop();
  }
  resetDeck() {
    this.cards = [];
    this.table = [];
    this.initDeck();
    this.shuffle();
  }
  dealTable() {
    while (this.table.length < 10 && this.cards.length > 0) {
      this.table.push(this.drawCard());
    }
  }
  cardsCount() {
    console.log(`Number of cards left in Deck:${this.cards.length}`);
  }
  discard() {
    this.hand = [];
  }
}
///<-----------------Initialized Deck & Card Classes-------------------->///
///<-----------------Calculation Functions------------------------------>///

const rankCounter = (hand) => {
  let rankCount = {};
  for (const card of hand) {
    if (rankCount[card.id]) {
      rankCount[card.id]++;
    } else {
      rankCount[card.id] = 1;
    }
  }
  return rankCount;
};

const pairList = (hand) => {
  let pairs = [];
  let pairCards = [];
  const rankcount = rankCounter(hand);
  for (const [rank, count] of Object.entries(rankcount)) {
    if (count === 2) {
      pairs.push(rank);
    }
  }
  for (let i = 0; i < hand.length; i++) {
    if (pairs.includes(hand[i].id)) {
      pairCards.push(hand[i]);
    }
  }
  return pairCards;
};
const triplesList = (hand) => {
  let triples = [];
  let tripleCards = [];
  const rankcount = rankCounter(hand);
  for (const [rank, count] of Object.entries(rankcount)) {
    if (count === 3) {
      triples.push(rank);
    }
  }
  for (let i = 0; i < hand.length; i++) {
    if (triples.includes(hand[i].id)) {
      tripleCards.push(hand[i]);
    }
  }
  return tripleCards;
};

const foursList = (hand) => {
  let fours = [];
  let foursCards = [];
  const rankcount = rankCounter(hand);
  for (const [rank, count] of Object.entries(rankcount)) {
    if (count === 4) {
      fours.push(rank);
    }
  }
  for (let i = 0; i < hand.length; i++) {
    if (fours.includes(hand[i].id)) {
      foursCards.push(hand[i]);
    }
  }
  return foursCards;
};

const calculateHandType = (hand) => {
  const handType = {
    pair: false,
    twoPair: false,
    threeOfAKind: false,
    straight: false,
    flush: false,
    fourOfAKind: false,
    royal: false,
  };
  const isFiveCard = (hand) => {
    if (hand.length === 5) {
      return true;
    }
    return false;
  };
  const pairCheck = (hand) => {
    const paircards = pairList(hand);
    if (paircards.length === 2) {
      handType.pair = true;
      return true;
    } else if (paircards.length === 4) {
      handType.twoPair = true;
      return true;
    } else {
      return false;
    }
  };
  const triplesCheck = (hand) => {
    const triplecards = triplesList(hand);
    if (triplecards.length === 3) {
      handType.threeOfAKind = true;
      return true;
    } else {
      return false;
    }
  };
  const straightCheck = (hand) => {
    if (isFiveCard(hand)) {
      hand.sort((a, b) => a.index - b.index);
      const indexArray = [...new Set(hand.map((card) => card.index))];
      let count = 0;
      for (let i = 0; i < indexArray.length - 1; i++) {
        if (indexArray[i] === indexArray[i + 1] - 1) {
          count++;
        }
      }
      if (count === 4) {
        handType.straight = true;
        return true;
      }
      const aceHighStraight = [1, 10, 11, 12, 13];
      if (aceHighStraight.every((index) => indexArray.includes(index))) {
        handType.straight = true;
        handType.royal = true;
        return true;
      }
      return false;
    }
    return false;
  };
  const flushCheck = (hand) => {
    if (isFiveCard(hand)) {
      const suit = hand[0].suit;
      if (hand.every((card) => card.suit === suit)) {
        handType.flush = true;
        return true;
      }
      return false;
    }
    return false;
  };
  const foursCheck = (hand) => {
    const fourscards = foursList(hand);
    if (fourscards.length === 4) {
      handType.fourOfAKind = true;
      return true;
    } else {
      return false;
    }
  };
  pairCheck(hand);
  triplesCheck(hand);
  straightCheck(hand);
  flushCheck(hand);
  foursCheck(hand);
  return handType;
};

const calculateMult = (handType) => {
  let multiplier = 1;
  switch (true) {
    case handType.royal && handType.flush:
      multiplier = 30;
      break;
    case handType.straight && handType.flush:
      multiplier = 15;
      break;

    case handType.fourOfAKind:
      multiplier = 12;
      break;

    case handType.threeOfAKind && handType.pair:
      multiplier = 10;
      break;

    case handType.flush:
      multiplier = 8;
      break;

    case handType.straight:
      multiplier = 7;
      break;

    case handType.threeOfAKind:
      multiplier = 5;
      break;

    case handType.twoPair:
      multiplier = 4;
      break;

    case handType.pair:
      multiplier = 2;
      break;

    default:
      multiplier = 1;
      break;
  }
  return multiplier;
};
generateHandtypeText = (hand)=>{
  const handtype = calculateHandType(hand);
  const mult = calculateMult(handtype);
  console.log("Hand type:", handtype);
  console.log("Multiplier:", mult);
 let handTypeText = "";
 switch (mult) {
  case 30:
    handTypeText = "Royal Flush";
    break;

  case 15:
    handTypeText = "Straight Flush";
    break;

  case 12:
    handTypeText = "Four of a Kind";
    break;

  case 10:
    handTypeText = "Full House";
    break;

  case 8:
    handTypeText = "Flush";
    break;

  case 7:
    handTypeText = "Straight";
    break;

  case 5:
    handTypeText = "Three of a Kind";
    break;

  case 4:
    handTypeText = "Two Pair";
    break;

  case 2:
    handTypeText = "Pair";
    break;

  default:
    handTypeText = "High Card";
    break;
}
return handTypeText;
 }
const calculateWinningCards = (hand, multiplier) => {
  hand.sort((a, b) => b.index - a.index);
  let winningCards = [];
  switch (multiplier) {
    case 1:
      winningCards.push(hand[0]);
      break;
    case 2:
      winningCards = winningCards.concat(pairList(hand));
      break;
    case 4:
      winningCards = winningCards.concat(pairList(hand));
      break;
    case 5:
      winningCards = winningCards.concat(triplesList(hand));
      break;
    default:
      winningCards = hand;
      break;
  }
  return winningCards;
};

const calculatePoints = (winningCards) => {
  const pointsArray = winningCards.map((card) => card.value||0);
  const totalPoints = pointsArray.reduce((total, point) => total + point, 0);
  return totalPoints;
};
function calcHandObject(hand){
  if(hand.length>0){
    const handCopy = JSON.parse(JSON.stringify(hand));
    const calcHandObject = {handtype:"",points:0,multi:0}
    const handtype = calculateHandType(handCopy);
    const handtypeText = generateHandtypeText(handCopy);
    const multi = calculateMult(handtype);
    const winningcards = calculateWinningCards(handCopy,multi);
    const points = calculatePoints(winningcards);
    calcHandObject.handtype = handtypeText;
    calcHandObject.points = points;
    calcHandObject.multi = multi;
    return calcHandObject;
  }
  else {
    return {handtype:"",points:0,multi:0};
  }
  }
///<-----------------Calculation Functions------------------------------>///
///<-----------------Joker Functions------------------------------------>///
const jokerList = [
  "CJ",
  "RRJ",
  "HJ",
  "GCJ",
  "TJ",
  "KJ",
  "GJ",
  "DJ",
  "TWJ",
  "BSJ",
];
const spJokerList = ["NJsp", "GJsp"];

const classicJoker = (multiplier) => {
  ///ID:CJ
  multiplier += 4;
  return multiplier;
};
const redRageJoker = (hand) => {
  ///ID:RRJ
  let pointsAdded = 0;
  let redCardsCount = 0;
  let suitsArray = hand.map((card) => card.suit);
  for (let i = 0; i < suitsArray.length; i++) {
    if (suitsArray[i] === "Hearts" || suitsArray[i] === "Diamonds") {
      redCardsCount++;
    }
  }
  if (redCardsCount >= 3) {
    pointsAdded = redCardsCount * 20;
  }
  return pointsAdded;
};
const halfJoker = (hand, multiplier) => {
  ///ID:HJ
  if (hand.length <= 3) {
    multiplier += 15;
  }
  return multiplier;
};
const gigaChadJoker = (hand) => {
  ///ID:GCJ
  const handType = calculateHandType(hand);
  let pointsAdded = 0;
  let pointsArray = hand.map((card) => card.value);
  pointsArray.sort((a, b) => b - a);
  if (handType.straight) {
    pointsAdded += pointsArray[0] * 5;
  }
  if (handType.pair && handType.threeOfAKind) {
    pointsAdded += pointsArray[0] * 5;
  }
  return pointsAdded;
};
const toiletJoker = (hand, multiplier) => {
  ///ID:TJ
  const handType = calculateHandType(hand);
  if (handType.flush) {
    multiplier += 10;
  }
  return multiplier;
};
const knightlyJoker = (hand) => {
  ///ID:KJ
  const pointsArray = hand.map((card) => card.value);
  let pointsAdded = 0;
  if (pointsArray.includes(12) || pointsArray.includes(11)) {
    pointsArray.forEach((value) => {
      pointsAdded += 21 - value;
    });
  }
  return pointsAdded;
};

const ghastlyJoker = (round, multiplier) => {
  ///ID:GJ
  if (round.boss) {
    multiplier = multiplier * 1.5;
  }
  return multiplier;
};

const doggJoker = (hand, table) => {
  ///ID:DJ
  const fullPointsArray = table.map((card) => card.value);
  let pointsAdded = 0;
  fullPointsArray.sort((a, b) => b - a);
  pointsAdded += hand.length * fullPointsArray[0];
  return pointsAdded;
};

const theWorldJoker = (handsLeft) => {
  ///ID:TWJ
  handsLeft += 2;
  return handsLeft;
};

const brimStoneJoker = (discardsLeft) => {
  ///ID:BSJ
  discardsLeft += 2;
  return discardsLeft;
};

const negativeJoker = (hand, handPlayed, handsLeft, discardsLeft) => {
  ///ID:NJsp
  const pointsMultToAdd = { pointsAdded: 0, multiplierAdded: 0 };
  const handPoints = hand.reduce((total, card) => total + card.value, 0);
  const handPlayedPoints = handPlayed.reduce(
    (total, card) => total + card.value,
    0
  );
  pointsMultToAdd.pointsAdded = handPlayedPoints - handPoints;
  pointsMultToAdd.multiplierAdded = (handsLeft + discardsLeft) * 2;
  return pointsMultToAdd;
};

const godJoker = (hand, multiplier) => {
  ///ID:GJsp
  const pointsMultToAdd = { pointsAdded: 0, multiplierAdded: 0 };
  pointsMultToAdd.multiplierAdded = multiplier * 4;
  pointsMultToAdd.pointsAdded = hand.length * 50;
  return pointsMultToAdd;
};
///<-----------------Joker Functions------------------------------------>///
///<-----------------Boss Functions------------------------------------->///
const bossList = ["TWB", "ILTB", "HBB", "BB", "GLB"];
const bonusBossList = ["NMSBsp", "ITBsp"];

const theWallBoss = (pointsRequired) => {
  ///ID:TWB
  return pointsRequired * 1.5;
};
const iLoveTwosBoss = (hand) => {
  ///ID:ILTB
  const handType = calculateHandType(hand);
  if (handType.pair || handType.twoPair) {
    return true;
  }
  return false;
};
const heartBreakBoss = (hand) => {
  ///ID:HBB
  let pointsDeducted = 0;
  const suitsArray = hand.map((card) => card.suit);
  const pointsArray = hand.map((card) => card.value);
  for (let i = 0; i < hand.length; i++) {
    if (suitsArray[i] === "Hearts") {
      pointsDeducted += pointsArray[i];
    }
  }
  return pointsDeducted;
};

const brailleBoss = (deck) => {
  ///ID:BB
  deck.forEach((card) => {
    if (card.value === 11 || card.value === 12) {
      card.isRevealed = false;
    }
  });
};

const goodLuckBoss = (handsLeft, discardsLeft) => {
  ///ID:GLB
  handsLeft--;
  discardsLeft++;
  const handsDiscardsLeft = {
    handsLeft: handsLeft,
    discardsLeft: discardsLeft,
  };
  return handsDiscardsLeft;
};
const noMoneyforASuitBoss = (deck) => {
  ///ID:NMSBsp
  deck.forEach((card) => {
    card.suit = "???";
  });
};
const insiderTradingBoss = (pointsTotal) => {
  ///ID:ITBsp
  pointsTotal = pointsTotal * 0.9;
  return pointsTotal;
};

///<-----------------Boss Functions------------------------------------->///
///<-----------------Gameplay Functions--------------------------------->///

const round = { smallBlind: true, bigBlind: false, bossBlind: false };
let roundNo = 1;
let ante = {
  AnteOne: true,
  AnteTwo: false,
  AnteThree: false,
  BonusAnte: false,
};
let anteNo = 1;
let roundComplete = false;
let anteComplete = false;
let pointsRequirement = 0;
let handsLeft = 0;
let discardsLeft = 0;
let playerPoints = 0;
let handPoints = 0;
let multiplier = 0;
const boss = { id: "" };
const jokers = { idOne: "", idTwo: "" };
const testDeck = new Deck();

function randomSelector(array) {
  const randomIdx = Math.floor(Math.random() * array.length);
  return array[randomIdx];
}

function setRound(roundNo) {
  switch (roundNo) {
    case 1:
      round.smallBlind = true;
      round.bigBlind = false;
      round.bossBlind = false;
      break;
    case 2:
      round.smallBlind = false;
      round.bigBlind = true;
      round.bossBlind = false;
      break;
    case 3:
      round.smallBlind = false;
      round.bigBlind = false;
      round.bossBlind = true;
      break;
  }
}

function setAnte(anteNo) {
  switch (anteNo) {
    case 1:
      ante.AnteOne = true;
      ante.AnteTwo = false;
      ante.AnteThree = false;
      ante.BonusAnte = false;
      break;
    case 2:
      ante.AnteOne = false;
      ante.AnteTwo = true;
      ante.AnteThree = false;
      ante.BonusAnte = false;
      break;
    case 3:
      ante.AnteOne = false;
      ante.AnteTwo = false;
      ante.AnteThree = true;
      ante.BonusAnte = false;
      break;
    case 4:
      ante.AnteOne = false;
      ante.AnteTwo = false;
      ante.AnteThree = false;
      ante.BonusAnte = true;
      break;
  }
}
function newGame() {
  setAnte(1);
  setRound(1);
  pointsRequirement = 150;
  handsLeft = 5;
  discardsLeft = 5;
  playerPoints = 0;
  handPoints = 0;
  multiplier = 0;
  boss.id = "";
  jokers.idOne = "";
  jokers.idTwo = "";
  roundComplete = false;
  anteComplete = false;
  deck.resetDeck();
}

function selectBoss() {
  boss.id = randomSelector(bossList);
}
function selectBonusBoss() {
  boss.id = randomSelector(bonusBossList);
}
function generateSelectableJokers() {
  const jokerSelection = [];
  for (let i = 0; i < 3; i++) {
    jokerSelection.push(randomSelector(jokerList));
  }
  return jokerSelection;
}
function addSpecialJokers() {
  const bonusJokerSelection = generateSelectableJokers();
  bonusJokerSelection.concat(spJokerList);
  return bonusJokerSelection;
}
function newRound() {
  switch (roundNo) {
    case 3:
      roundNo = 1;
      break;
    default:
      roundNo++;
      break;
  }
  setRound(roundNo);
  handsLeft = 5;
  discardsLeft = 5;
  playerPoints = 0;
  handPoints = 0;
  multiplier = 0;
  roundComplete = false;
  pointsRequirement += 100;
  deck.resetDeck();
}

function newAnte() {
  switch (AnteNo) {
    case 3:
      ///Function to ask to attempt Bonus Boss

      selectBonusBoss();
      AnteNo++;
      setAnte(AnteNo);
      anteComplete = false;
      newRound();
      anteComplete = false;
      pointsRequirement = pointsRequirement * 1.5;
    case 4:
      newGame();
    ///Game Complete Function
    default:
      newRound();
      selectBoss();
      anteComplete = false;
      pointsRequirement = pointsRequirement * 1.2;
  }
}

function checkRoundComplete() {
  if (playerPoints >= pointsRequirement) {
    roundComplete = true;
  }
}

function checkAnteComplete() {
  if (roundComplete && round.bossBlind) {
    anteComplete = true;
  }
}
///<-----------------Gameplay Functions--------------------------------->///
///<-----------------Constants Declarations----------------------------->///
const roundClearPointsEl = document.querySelector("#round-clear-points");
const playerPointsEl = document.querySelector("#player-points");
const handTypeEl = document.querySelector("#handtype");
const handPointsEl = document.querySelector("#hand-points");
const handMultiEl = document.querySelector("#hand-multi");
const handTotalEl = document.querySelector("#hand-total");
const bossInfoEl = document.querySelector("#boss-info");
const anteNumberEl = document.querySelector("#ante-number");
const roundTypeEl = document.querySelector("#round-type");
const messageEl = document.querySelector("#message");
const playBtnEl = document.querySelector("#play-button");
const discardBtnEl = document.querySelector("#discard-button");
const handEl = document.querySelector("#hand");
const tableEl = document.querySelector("#table");
const shuffleBtnEl = document.querySelector("#shuffle-btn");
const arrangeBtnEl = document.querySelector("#arrange-btn");
const cardcountEl = document.querySelector("#card-count");
const newGameBtnEl = document.querySelector("#new-game-btn");
const gameplaySectionsEl = document.querySelectorAll('.gameplay-section')
const messagesectionEl = document.querySelector(".message-box")
function getSuitSymbol(suit) {
  switch (suit) {
    case "Hearts":
      return "♥";
    case "Diamonds":
      return "♦";
    case "Clubs":
      return "♣";
    case "Spades":
      return "♠";
    default:
      return "?";
  }
}
function createCardElement(card) {
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("single-card-container");

  const valueTop = document.createElement("h1");
  valueTop.classList.add("card-value-top");
  valueTop.textContent = card.id;

  const suit = document.createElement("h1");
  suit.classList.add("card-suit");
  suit.textContent = getSuitSymbol(card.suit);

  const valueBottom = document.createElement("h1");
  valueBottom.classList.add("card-value-bottom");
  valueBottom.textContent = card.id;

  if (card.suit === "Hearts" || card.suit === "Diamonds") {
    valueTop.classList.add("red-card");
    suit.classList.add("red-card");
    valueBottom.classList.add("red-card");
  }
  cardContainer.appendChild(valueTop);
  cardContainer.appendChild(suit);
  cardContainer.appendChild(valueBottom);
  return cardContainer;
}

function clearCards(container) {
  container.innerHTML = "";
}

function updateTableDisplay() {
  clearCards(tableEl);
  for (let i = 0; i < testDeck.table.length; i++) {
    tableEl.appendChild(createCardElement(testDeck.table[i]));
  }
}

function updateHandDisplay() {
  clearCards(handEl);
  for (let i = 0; i < testDeck.hand.length; i++) {
    handEl.appendChild(createCardElement(testDeck.hand[i]));
  }
}
function refreshCardDisplays(){
  updateHandDisplay();
  updateTableDisplay();
}

function tableArraytoHandArray(indexOfCard) {
  if(testDeck.hand.length<5){
    const removedCard = testDeck.table.splice(indexOfCard, 1)[0];
    testDeck.hand.push(removedCard);
  }
  else{
    messageEl.textContent = "Can only select 5 cards at most!"
  }
}
function handArrayToTableArray(indexOfCard) {
    const removedCard = testDeck.hand.splice(indexOfCard, 1)[0];
    testDeck.table.push(removedCard);
}

function getElementIndex(element) {
  const parent = element.parentElement;
  const children = Array.from(parent.children);
  return children.indexOf(element);
}
function updateHandtypeAndCalculator(hand){
  const infoObject = calcHandObject(hand);
  const total = infoObject.multi * infoObject.points;
  handTypeEl.textContent = infoObject.handtype;
  handPointsEl.textContent = infoObject.points;
  handMultiEl.textContent = infoObject.multi;
  handTotalEl.textContent = total;
}
tableEl.addEventListener("click", (event) => {
  const clickedCard = event.target.closest(".single-card-container");
  if (!clickedCard) return; // Ignore clicks outside cards

  const cardIndex = getElementIndex(clickedCard);
  console.log(`Table card clicked at index: ${cardIndex}`);
  tableArraytoHandArray(cardIndex);
  refreshCardDisplays();
  updateHandtypeAndCalculator(testDeck.hand);
});
handEl.addEventListener("click", (event) => {
  const clickedCard = event.target.closest(".single-card-container");
  if (!clickedCard) return; // Ignore clicks outside cards

  const cardIndex = getElementIndex(clickedCard);
  console.log(`Hand card clicked at index: ${cardIndex}`);
  handArrayToTableArray(cardIndex);
  refreshCardDisplays();
  updateHandtypeAndCalculator(testDeck.hand);
});
let byNumber = false;
arrangeBtnEl.addEventListener("click",() =>{
  if(!byNumber){
  testDeck.table.sort((a, b) => a.suit.localeCompare(b.suit));
  refreshCardDisplays();
    byNumber = true;
  }else{
  testDeck.table.sort((a, b) => b.index - a.index);
  refreshCardDisplays();
   byNumber = false;
  }
})
shuffleBtnEl.addEventListener("click",()=>{
  for (let i = testDeck.table.length - 1; i > 0; i--) {
    const x = Math.floor(Math.random() * (i + 1));
    [testDeck.table[i], testDeck.table[x]] = [testDeck.table[x], testDeck.table[i]];
  }
  refreshCardDisplays();
})
discardBtnEl.addEventListener("click",()=>{
testDeck.discard();
testDeck.dealTable();
refreshCardDisplays();
cardcountEl.textContent = testDeck.cards.length;
})
newGameBtnEl.addEventListener("click",()=>{
  gameplaySectionsEl.forEach(element => {
  element.classList.toggle("invisible")
})
messagesectionEl.classList.remove("invisible");
;
})
testDeck.dealTable();
refreshCardDisplays();
