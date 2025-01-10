/************************************************
 Deck & Card Classes
 ************************************************/
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
    this.hand = [];
    this.initDeck();
    this.shuffle();
  }

  dealTable() {
    while (this.table.length < 10 && this.cards.length > 0) {
      this.table.push(this.drawCard());
    }
  }

  cardsCount() {
    console.log(`Number of cards left in Deck: ${this.cards.length}`);
  }

  discard() {
    this.hand = [];
  }
}
/************************************************
 Calculation / Poker Hand Logic
 ************************************************/
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
    } else if (paircards.length === 4) {
      handType.twoPair = true;
    }
  };
  const triplesCheck = (hand) => {
    const triplecards = triplesList(hand);
    if (triplecards.length === 3) {
      handType.threeOfAKind = true;
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
      }
      // Ace-high check
      const aceHighStraight = [1, 10, 11, 12, 13];
      if (aceHighStraight.every((index) => indexArray.includes(index))) {
        handType.straight = true;
        handType.royal = true;
      }
    }
  };
  const flushCheck = (hand) => {
    if (isFiveCard(hand)) {
      const suit = hand[0].suit;
      if (hand.every((card) => card.suit === suit)) {
        handType.flush = true;
      }
    }
  };
  const foursCheck = (hand) => {
    const fourscards = foursList(hand);
    if (fourscards.length === 4) {
      handType.fourOfAKind = true;
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

function generateHandtypeText(hand) {
  const handTypeObj = calculateHandType(hand);
  const mult = calculateMult(handTypeObj);
  switch (mult) {
    case 30:
      return "Royal Flush";
    case 15:
      return "Straight Flush";
    case 12:
      return "Four of a Kind";
    case 10:
      return "Full House";
    case 8:
      return "Flush";
    case 7:
      return "Straight";
    case 5:
      return "Three of a Kind";
    case 4:
      return "Two Pair";
    case 2:
      return "Pair";
    default:
      return "High Card";
  }
}

function calculateWinningCards(hand, multiplier) {
  hand.sort((a, b) => b.index - a.index);
  let winningCards = [];
  switch (multiplier) {
    case 1:
      winningCards.push(hand[0]);
      break;
    case 2:
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
}

function calculatePoints(winningCards) {
  const pointsArray = winningCards.map((card) => card.value || 0);
  return pointsArray.reduce((total, point) => total + point, 0);
}

function calcHandObject(hand) {
  if (hand.length === 0) {
    return { handtype: "", points: 0, multi: 0 };
  }
  const handCopy = JSON.parse(JSON.stringify(hand));
  const handTypeObj = calculateHandType(handCopy);
  const handtypeText = generateHandtypeText(handCopy);
  const multi = calculateMult(handTypeObj);
  const winners = calculateWinningCards(handCopy, multi);
  const pts = calculatePoints(winners);

  return {
    handtype: handtypeText,
    points: pts,
    multi: multi,
  };
}

/************************************************
 DOM Elements & Global Variables
 ************************************************/
const tableEl = document.querySelector("#table");
const handEl = document.querySelector("#hand");
const cardcountEl = document.querySelector("#card-count");

const roundClearPointsEl = document.querySelector("#round-clear-points");
const playerPointsEl = document.querySelector("#player-points");
const handTypeEl = document.querySelector("#handtype");
const handPointsEl = document.querySelector("#hand-points");
const handMultiEl = document.querySelector("#hand-multi");
const handTotalEl = document.querySelector("#hand-total");

const bossInfoEl = document.querySelector("#boss-info");
const bossNameEl = document.querySelector("#boss-name");
const anteNumberEl = document.querySelector("#ante-number");
const roundTypeEl = document.querySelector("#round-type");
const messageEl = document.querySelector("#message");

const jokersInPlayEl = document.querySelector("#jokers-play-cards");
const jokersAvailableEl = document.querySelector("#jokers-available-cards");
const gameplayInfoBox = document.querySelector("#gameplay-info");
const joker1NameEl = document.querySelector("#joker-1-title");
const joker1InfoEl = document.querySelector("#joker-1-info");
const joker2NameEl = document.querySelector("#joker-2-title");
const joker2InfoEl = document.querySelector("#joker-2-info");
const handsLeftEl = document.querySelector("#hands-left");
const discardsLeftEl = document.querySelector("#discards-left");

const playBtnEl = document.querySelector("#play-button");
const discardBtnEl = document.querySelector("#discard-button");

const menuBtn1 = document.querySelector("#menuBtn-1");
const menuBtn2 = document.querySelector("#menuBtn-2");
const menuBtn3 = document.querySelector("#menuBtn-3");
const menuBtn4 = document.querySelector("#menuBtn-4");
const menuBtn5 = document.querySelector("#menuBtn-5");

const gameplaySectionsEl = document.querySelectorAll(".gameplay-section");
const messagesectionEl = document.querySelector(".message-box");

const testDeck = new Deck();

let gameStartedState = false;
let jokerSelectionMode = false;
let keepJokers = false;
let roundNo = 1;
let anteNo = 1;
let playerPoints = 0;
let pointsRequirement = 300;
let handsLeft = 5;
let discardsLeft = 5;
let currentBoss = { id: "" };
let jokersPlay = { idOne: "", idTwo: "" };

let jokersAvailable = [];
/************************************************
 Joker & Boss Logic
 ************************************************/
///Jokers
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
  "NJsp",
  "GJsp",
];
let jokersGameList = JSON.parse(JSON.stringify(jokerList));

const CJ = ["Classic Joker", "x4 multiplier."];
const RRJ = [
  "Red Rage Joker",
  "+20 points per red card if 3+ red cards in the hand.",
];
const HJ = ["Half Joker", "x15 multiplier if hand has 3 or fewer cards."];
const GCJ = [
  "Gigachad Joker",
  "+Highest card value for each card in a Straight or Full House.",
];
const TJ = [
  "Toilet Joker",
  "x10 multiplier for Flush, Straight Flush, or Royal Flush.",
];
const KJ = [
  "Knightly Joker",
  "Face cards (incl. Ace) make all winning cards worth 21 points.",
];
const GJ = ["Ghastly Joker", "x1.5 multiplier in Boss Rounds."];
const DJ = [
  "Dogg Joker",
  "All cards take the value of the highest card in your table.",
];
const TWJ = ["The World Joker", "2 extra hands this round."];
const BSJ = ["Brimstone Joker", "2 extra discards this round."];

const NJsp = [
  "Negative Joker",
  "+1 multiplier per discard/hand left; all cards count for points.",
];
const GJsp = [
  "God Joker",
  "x5 multiplier and +50 points per card in the winning hand.",
];

// Bosses
const bossList = ["TWB", "ILTB", "HBB", "BB", "GLB", "NMSBsp", "ITBsp"];
let bossGameList = JSON.parse(JSON.stringify(bossList));
const TWB = ["The Wall", "Point requirement is 1.5 times higher than usual."];
const ILTB = ["I Love Twos", "Only Pairs or Two Pairs are allowed."];
const HBB = ["HeartBreak", "Heart cards have no value."];
const BB = ["Braille", "Face cards (including Ace) are not revealed."];
const GLB = ["Good Luck", "One less hand, one more discard."];
const NMSBsp = ["No Money for a Suit", "Suits are not revealed."];
const ITBsp = ["Insider Trading", "Each hand reduces points by 10%."];

///---------------Joker Functions-----------------///
function classicJoker(hand) {
  return {
    pointsAdded: 0,
    multiplierAdded: 4,
  };
}

function redRageJoker(hand) {
  let pointsAdded = 0;
  let redCardsCount = 0;

  for (let card of hand) {
    if (card.suit === "Hearts" || card.suit === "Diamonds") {
      redCardsCount++;
    }
  }

  if (redCardsCount >= 3) {
    pointsAdded = redCardsCount * 20;
  }

  return {
    pointsAdded: pointsAdded,
    multiplierAdded: 0,
  };
}

function halfJoker(hand) {
  let multiplierAdded = 0;
  if (hand.length <= 3) {
    multiplierAdded = 15;
  }
  return {
    pointsAdded: 0,
    multiplierAdded: multiplierAdded,
  };
}

function gigaChadJoker(hand) {
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

  return {
    pointsAdded: pointsAdded,
    multiplierAdded: 0,
  };
}

function toiletJoker(hand) {
  const handType = calculateHandType(hand);
  let multiplierAdded = 0;
  if (handType.flush) {
    multiplierAdded = 10;
  }
  return {
    pointsAdded: 0,
    multiplierAdded: multiplierAdded,
  };
}

function knightlyJoker(hand) {
  let pointsAdded = 0;
  let handObject = calcHandObject(hand);
  let winningCards = calculateWinningCards(hand, handObject.multi);
  const hasFaceCard = hand.some(
    (card) =>
      card.id === "J" || card.id === "Q" || card.id === "K" || card.id === "A"
  );

  if (hasFaceCard) {
    winningCards.forEach((card) => {
      pointsAdded += 21 - card.value;
    });
  }

  return {
    pointsAdded: pointsAdded,
    multiplierAdded: 0,
  };
}

function ghastlyJoker(hand) {
  let multiplierAdded = 0;
  const handType = calculateHandType(hand);
  const multiplier = calculateMult(handType);

  const isBossRound = roundNo === 3 && currentBoss.id;

  if (isBossRound) {
    multiplierAdded = multiplier * 1.5;
  }
  return {
    pointsAdded: 0,
    multiplierAdded: multiplierAdded,
  };
}

function doggJoker(hand) {
  if (testDeck.table.length === 0)
    return {
      pointsAdded: 0,
      multiplierAdded: 0,
    };

  const highestTableCardValue = Math.max(
    ...testDeck.table.map((card) => card.value)
  );
  const pointsAdded = hand.length * highestTableCardValue;

  return {
    pointsAdded: pointsAdded,
    multiplierAdded: 0,
  };
}

function negativeJoker(hand) {
  const handPoints = hand.reduce((total, card) => total + card.value, 0);

  const handObject = calcHandObject(hand);
  const winningCards = calculateWinningCards(hand, handObject.multi);
  const handPlayedPoints = winningCards.reduce(
    (total, card) => total + card.value,
    0
  );

  const pointsAdded = handPoints - handPlayedPoints;
  const multiplierAdded = discardsLeft + handsLeft;

  return {
    pointsAdded: pointsAdded,
    multiplierAdded: multiplierAdded,
  };
}

function godJoker(hand) {
  const pointsAdded = hand.length * 50;
  const handType = calculateHandType(hand);
  const multiplier = calculateMult(handType);
  const multiplierAdded = multiplier * 5;

  return {
    pointsAdded: pointsAdded,
    multiplierAdded: multiplierAdded,
  };
}
function addBSJandTWJEffect() {
  const finalHandsDiscardsAdded = { handsAdded: 0, discardsAdded: 0 };
  switch (jokersPlay.idOne) {
    case "BSJ":
      finalHandsDiscardsAdded.discardsAdded += 2;
      break;
    case "TWJ":
      finalHandsDiscardsAdded.handsAdded += 2;
      break;
    default:
      break;
  }
  switch (jokersPlay.idTwo) {
    case "BSJ":
      finalHandsDiscardsAdded.discardsAdded += 2;
      break;
    case "TWJ":
      finalHandsDiscardsAdded.handsAdded += 2;
      break;
    default:
      break;
  }
  return finalHandsDiscardsAdded;
}
function getJokerEffect(jokerID, hand) {
  const jokerEffects = {
    CJ: classicJoker,
    RRJ: redRageJoker,
    HJ: halfJoker,
    GCJ: gigaChadJoker,
    TJ: toiletJoker,
    KJ: knightlyJoker,
    GJ: ghastlyJoker,
    DJ: doggJoker,
    NJsp: negativeJoker,
    GJsp: godJoker,
  };

  if (jokerEffects[jokerID]) {
    return jokerEffects[jokerID](hand);
  } else {
    console.log(`No effect function defined for Joker ID: ${jokerID}`);
    return { pointsAdded: 0, multiplierAdded: 0 };
  }
}

function CalculateJokerAdditions(hand) {
  const jokerOneEffect = getJokerEffect(jokersPlay.idOne, hand);
  const jokerTwoEffect = getJokerEffect(jokersPlay.idTwo, hand);
  const pointsAddedinTotal =
    jokerOneEffect.pointsAdded + jokerTwoEffect.pointsAdded;
  const multiplierAddedinTotal =
    jokerOneEffect.multiplierAdded + jokerTwoEffect.multiplierAdded;
  messageEl.textContent = `Joker One has added ${jokerOneEffect.pointsAdded} points and ${jokerOneEffect.multiplierAdded}x multiplier\n
  Joker Two has added ${jokerTwoEffect.pointsAdded} points and ${jokerTwoEffect.multiplierAdded}x multiplier`;
  console.log(messageEl.textContent);
  return {
    pointsAdded: pointsAddedinTotal,
    multiplierAdded: multiplierAddedinTotal,
  };
}

///---------------Boss Functions-----------------///

const bossState = {
  TWB: false,
  ILTB: false,
  HBB: false,
  BB: false,
  GLB: false,
  NMSBsp: false,
  ITBsp: false,
};

function selectBoss() {
  if (bossGameList.length === 0) {
    console.error("No bosses left to select.");
    resetBossState();
    return;
  }

  const randomIdx = Math.floor(Math.random() * bossGameList.length);
  currentBoss.id = bossGameList[randomIdx];
  bossGameList.splice(randomIdx, 1);

  for (let boss in bossState) {
    bossState[boss] = false;
  }

  if (bossState.hasOwnProperty(currentBoss.id)) {
    bossState[currentBoss.id] = true;
  } else {
    console.error("Invalid boss ID:", currentBoss.id);
  }

  updateBossDisplay();
}

function resetBossState() {
  for (let boss in bossState) {
    bossState[boss] = false;
  }
  currentBoss.id = null;
  updateBossDisplay();
}
function updateBossDisplay() {
  const bosses = {
    TWB: ["The Wall Boss", "Increases points requirement by x1.5."],
    ILTB: ["I Love Twos Boss", "Only allows pair or two-pair to be valid."],
    HBB: ["Heart Break Boss", "Subtracts the value of Heart cards from total."],
    BB: ["Braille Boss", "Face cards J,Q,K,A are not revealed."],
    GLB: ["Good Luck Boss", "One less hand and Two more discards"],
    NMSBsp: [
      "No Money for a Suit Boss",
      "Hides the suit of all cards in the deck.",
    ],
    ITBsp: ["Insider Trading Boss", "Reduces total points by 10%."],
  };

  if (bosses[currentBoss.id]) {
    bossNameEl.textContent = bosses[currentBoss.id][0];
    bossInfoEl.textContent = bosses[currentBoss.id][1];
  } else {
    bossNameEl.textContent = "No Boss";
    bossInfoEl.textContent = "-";
  }
}
function theWallBoss() {
  if (bossState.TWB) {
    pointsRequirement = pointsRequirement * 1.5;
  }
}

function iLoveTwosBoss() {
  const handType = calculateHandType(testDeck.hand);
  if (handType.pair || handType.twoPair) {
    return true;
  }
  return false;
}

function heartBreakBoss() {
  if (bossState.HBB) {
    let pointsDeducted = 0;
    const suitsArray = testDeck.hand.map(function (card) {
      return card.suit;
    });
    const pointsArray = testDeck.hand.map(function (card) {
      return card.value;
    });

    for (let i = 0; i < testDeck.hand.length; i++) {
      if (suitsArray[i] === "Hearts") {
        pointsDeducted += pointsArray[i];
      }
    }
    return pointsDeducted;
  }
  return 0;
}

function brailleBoss() {
  if (bossState.BB) {
    // Hide face cards in table and hand
    testDeck.table.forEach((card) => {
      if (card.value === 11 || card.value === 12) {
        card.isRevealed = false;
      }
      refreshCardDisplays();
    });

    testDeck.hand.forEach((card) => {
      if (card.value === 11 || card.value === 12) {
        card.isRevealed = false;
      }
      refreshCardDisplays();
    });
  }
}

function goodLuckBoss() {
  if (bossState.GLB) {
    return { handsAdded: -2, discardsAdded: +2 };
  }
  return { handsAdded: 0, discardsAdded: 0 };
}

function noMoneyforASuitBoss() {
  if (bossState.NMSBsp) {
    testDeck.table.forEach((card) => {
      card.suit = "???";
    });
    refreshCardDisplays();
    testDeck.hand.forEach((card) => {
      card.suit = "???";
    });
    refreshCardDisplays();
  }
}

function insiderTradingBoss() {
  if (bossState.ITBsp) {
    playerPoints = playerPoints * 0.9;
  }
}

/************************************************
 Display Functions
 ************************************************/
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

  if (!card.isRevealed) {
    const text = document.createElement("h1");
    text.classList.add("card-suit");
    text.textContent = "???";
    cardContainer.classList.add("card-facedown");
    cardContainer.appendChild(text);
    return cardContainer;
  }
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
function refreshCardDisplays() {
  tableEl.innerHTML = "";
  testDeck.table.forEach((card) => {
    tableEl.appendChild(createCardElement(card));
  });
  handEl.innerHTML = "";
  testDeck.hand.forEach((card) => {
    handEl.appendChild(createCardElement(card));
  });
  cardcountEl.textContent = testDeck.cards.length;
}

function updateHandInfoDisplay() {
  const info = calcHandObject(testDeck.hand);
  handTypeEl.textContent = info.handtype;
  handPointsEl.textContent = info.points;
  handMultiEl.textContent = info.multi;
  handTotalEl.textContent = info.points * info.multi;
}

function updatePointsDisplay() {
  roundClearPointsEl.textContent = pointsRequirement;
  playerPointsEl.textContent = playerPoints;
  handsLeftEl.textContent = handsLeft;
  discardsLeftEl.textContent = discardsLeft;
}

function updateAnteDisplay() {
  if (anteNo < 4) {
    anteNumberEl.textContent = anteNo.toString();
    anteNumberEl.style.color = "white";
  } else {
    anteNumberEl.textContent = "BONUS";
    anteNumberEl.style.color = "red";
  }
}

function updateRoundDisplay() {
  switch (roundNo) {
    case 1:
      roundTypeEl.textContent = "Small Blind";
      roundTypeEl.style.color = "white";
      break;
    case 2:
      roundTypeEl.textContent = "Big Blind";
      roundTypeEl.style.color = "yellow";
      break;
    case 3:
      roundTypeEl.textContent = "Boss Blind";
      roundTypeEl.style.color = "red";
      break;
  }
}

function createJokerElement(jokerID) {
  const container = document.createElement("div");
  container.classList.add("single-joker-container");

  const hiddenText = document.createElement("span");
  hiddenText.classList.add("hiddentext");
  hiddenText.textContent = jokerID;
  container.appendChild(hiddenText);

  const img = document.createElement("img");
  img.classList.add("jokerimage");
  img.src = `./assets/${jokerID}.png`;
  container.appendChild(img);

  return container;
}

function jokersAvailableSelector() {
  const selected = [];
  moveJokerstoGameList();
  for (let i = 0; i < 3; i++) {
    if (jokersGameList.length === 0) break;
    const r = Math.floor(Math.random() * jokersGameList.length);
    selected.push(jokersGameList[r]);
    jokersGameList.splice(r, 1);
  }
  return selected;
}

function moveJokerstoPlay(jokerID) {
  if (jokersPlay.idOne && jokersPlay.idTwo) {
    messageEl.textContent = "Both joker slots are full!";
    return;
  }
  if (!jokersPlay.idOne) {
    jokersPlay.idOne = jokerID;
  } else if (!jokersPlay.idTwo) {
    jokersPlay.idTwo = jokerID;
  }
  jokersAvailable = jokersAvailable.filter((j) => j !== jokerID);
  updateJokersDisplay();
  updateJokerInfoDisplay();
}

function moveJokerstoAvail(jokerSlotIndex) {
  if (jokerSlotIndex === 0 && jokersPlay.idOne) {
    jokersAvailable.push(jokersPlay.idOne);
    jokersPlay.idOne = jokersPlay.idTwo;
    jokersPlay.idTwo = "";
  } else if (jokerSlotIndex === 1 && jokersPlay.idTwo) {
    jokersAvailable.push(jokersPlay.idTwo);
    jokersPlay.idTwo = "";
  }
  updateJokersDisplay();
  updateJokerInfoDisplay();
}

function moveJokerstoGameList() {
  for (let i = 0; i < jokersAvailable.length; i++) {
    jokersGameList.push(jokersAvailable[i]);
  }
  jokersAvailable = [];
}
function updateJokersDisplay() {
  jokersInPlayEl.innerHTML = "";
  if (jokersPlay.idOne) {
    jokersInPlayEl.appendChild(createJokerElement(jokersPlay.idOne));
  }
  if (jokersPlay.idTwo) {
    jokersInPlayEl.appendChild(createJokerElement(jokersPlay.idTwo));
  }

  jokersAvailableEl.innerHTML = "";
  jokersAvailable.forEach((jk) => {
    jokersAvailableEl.appendChild(createJokerElement(jk));
  });
}
function updateJokerInfoDisplay() {
  const jokerObject = {
    CJ: CJ,
    RRJ: RRJ,
    HJ: HJ,
    GCJ: GCJ,
    TJ: TJ,
    KJ: KJ,
    GJ: GJ,
    DJ: DJ,
    TWJ: TWJ,
    BSJ: BSJ,
    NJsp: NJsp,
    GJsp: GJsp,
  };

  let jokerOneName = "Joker 1 Name";
  let jokerOneInfo = "";
  if (jokersPlay.idOne && jokerObject[jokersPlay.idOne]) {
    jokerOneName = jokerObject[jokersPlay.idOne][0];
    jokerOneInfo = jokerObject[jokersPlay.idOne][1];
  }
  let jokerTwoName = "Joker 2 Name";
  let jokerTwoInfo = "";

  if (jokersPlay.idTwo && jokerObject[jokersPlay.idTwo]) {
    jokerTwoName = jokerObject[jokersPlay.idTwo][0];
    jokerTwoInfo = jokerObject[jokersPlay.idTwo][1];
  }
  joker1NameEl.textContent = jokersPlay.idOne ? jokerOneName : "Joker 1 Name";
  joker1InfoEl.textContent = jokersPlay.idOne ? jokerOneInfo : "";
  joker2NameEl.textContent = jokersPlay.idTwo ? jokerTwoName : "Joker 2 Name";
  joker2InfoEl.textContent = jokersPlay.idTwo ? jokerTwoInfo : "";
}

/************************************************
 Gameplay Flow
 ************************************************/

function newGame() {
  gameStartedState = true;
  anteNo = 1;
  roundNo = 1;

  enterJokerSelection();
  messageEl.textContent = "Game started. Select your Jokers and press KEEP!";
  menuBtn1.textContent = "Reset Game";
  menuBtn2.textContent = "Start Round";
}

function enterJokerSelection() {
  testDeck.resetDeck();
  testDeck.table = [];
  testDeck.hand = [];
  jokersAvailable = jokersAvailableSelector();

  menuBtn3.textContent = "-";
  menuBtn4.textContent = "-";
  jokersAvailableEl.classList.remove("invisible");

  gameplayInfoBox.classList.add("invisible");

  gameplaySectionsEl.forEach((section) => {});

  jokerSelectionMode = true;
  playBtnEl.textContent = "KEEP";
  handsLeft = 0;
  discardsLeft = 0;
  playerPoints = 0;

  updateAllUI();
}

function startRound() {
  jokerSelectionMode = false;
  jokersAvailableEl.classList.add("invisible");
  gameplayInfoBox.classList.remove("invisible");

  testDeck.resetDeck();
  testDeck.dealTable();
  moveJokerstoGameList();

  handsLeft = 5 + addBSJandTWJEffect().handsAdded;
  discardsLeft = 5 + addBSJandTWJEffect().discardsAdded;
  menuBtn3.textContent = "Arrange Cards";
  menuBtn4.textContent = "Shuffle Cards";

  pointsRequirement = 500 + 200 * (anteNo - 1) + 100 * (roundNo - 1);

  playerPoints = 0;

  if (roundNo === 3) {
    selectBoss();
  } else {
    currentBoss.id = "";
  }
  brailleBoss();
  noMoneyforASuitBoss();
  refreshCardDisplays();
  theWallBoss();
  goodLuckBoss();
  jokerSelectionMode = false;
  playBtnEl.textContent = "PLAY";

  updateAllUI();
  messageEl.textContent = `Round ${roundNo} (Ante ${anteNo}) started! Play or discard up to 5 times.`;
}

function finalizeHandPlay() {
  const info = calcHandObject(testDeck.hand);
  const addedValues = CalculateJokerAdditions(testDeck.hand);

  info.points += addedValues.pointsAdded - heartBreakBoss();
  info.multi += addedValues.multiplierAdded;

  if (bossState.ILTB) {
    if (!iLoveTwosBoss()) {
      info.points = 0;
      messageEl.textContent = "No points added! Your hand must contain a Pair.";
    }
  }

  playerPoints += info.points * info.multi;

  insiderTradingBoss();
  playerPoints = Math.round(playerPoints);
  handsLeft--;

  testDeck.hand = [];
  testDeck.dealTable();
  brailleBoss();
  noMoneyforASuitBoss();
  refreshCardDisplays();
  if (playerPoints >= pointsRequirement) {
    endRound(true);
    return;
  }

  if (handsLeft <= 0 && playerPoints < pointsRequirement) {
    endRound(false);
    return;
  }

  updateAllUI();
}

function endRound(win) {
  if (win) {
    messageEl.textContent = `You cleared Round ${roundNo}!`;

    if (roundNo < 3) {
      roundNo++;
    } else {
      if (anteNo < 4) {
        resetBossState();
        anteNo++;
        roundNo = 1;
      } else {
        gameplaySectionsEl.forEach((element) => {
          element.classList.toggle("invisible");
        });
        messagesectionEl.classList.remove("invisible");
        messageEl.style.fontSize = "2em";
        messageEl.textContent =
          "Congratulations!\nYou've Completed JOKERPOKER!";
        return;
      }
    }

    enterJokerSelection();
  } else {
    messageEl.textContent =
      "You did not meet the requirement. Press Reset Game to Retry Round.";
    testDeck.resetDeck();
    testDeck.table = [];
    testDeck.hand = [];
    jokersAvailable = jokersAvailableSelector();
  }

  updateAllUI();
}

function retryRound() {
  messageEl.textContent = "Retrying the same round. Select Jokers again.";
  enterJokerSelection();
}

function updateAllUI() {
  refreshCardDisplays();
  updateHandInfoDisplay();
  updatePointsDisplay();
  updateBossDisplay();
  updateAnteDisplay();
  updateRoundDisplay();
  updateJokersDisplay();
  updateJokerInfoDisplay();
}

/************************************************
 Event Listeners
 ************************************************/

menuBtn1.addEventListener("click", () => {
  if (!gameStartedState) {
    newGame();
  } else {
    retryRound();
  }
});

menuBtn2.addEventListener("click", () => {
  if (!gameStartedState) return;
  if (menuBtn2.textContent === "Start Round") {
    startRound();
    noMoneyforASuitBoss();
    brailleBoss();
    refreshCardDisplays();
  }
});

let arrangeBysuit = false;

menuBtn3.addEventListener("click", () => {
  if (arrangeBysuit) {
    testDeck.table.sort((a, b) => a.suit.localeCompare(b.suit));
    refreshCardDisplays();
    messageEl.textContent = "Arranged by suit!";
  } else {
    testDeck.table.sort((a, b) => b.index - a.index);
    refreshCardDisplays();
    messageEl.textContent = "Arranged by value!";
  }
  arrangeBysuit = !arrangeBysuit;
});

menuBtn4.addEventListener("click", () => {
  for (let i = testDeck.table.length - 1; i > 0; i--) {
    const x = Math.floor(Math.random() * (i + 1));
    [testDeck.table[i], testDeck.table[x]] = [
      testDeck.table[x],
      testDeck.table[i],
    ];
  }
  refreshCardDisplays();
  messageEl.textContent = "Table cards shuffled!";
});
let messageView = false;
menuBtn5.addEventListener("click", () => {
  messageView = !messageView;
  gameplaySectionsEl.forEach((element) => {
    element.classList.toggle("invisible");
  });
  messagesectionEl.classList.remove("invisible");
  if (messageView) {
    messageEl.textContent =
      "Welcome to JOKERPOKER!\n\n" +
      "Game Overview:\n" +
      "- The game consists of 4 Antes, each with 3 rounds.\n" +
      "- Every 3rd round is a Boss Round with special conditions.\n\n" +
      "Rules:\n" +
      "1. At the start of each round, select Jokers to influence gameplay.\n" +
      "2. Form poker hands during each round to score points.\n" +
      "3. Stronger hands give higher multipliers.\n" +
      "4. Meet the points requirement within the hands left to win the round.\n\n" +
      "Tips:\n" +
      "- Use Jokers strategically to maximize your score.\n" +
      "- Plan ahead for Boss Rounds and their unique challenges.\n\n" +
      "Good luck and have fun!";
  } else {
    messageEl.textContent = "Check here for messages about your game!";
  }
});

tableEl.addEventListener("click", (event) => {
  const clicked = event.target.closest(".single-card-container");
  if (!clicked) return;

  if (testDeck.hand.length < 5) {
    const idx = Array.from(tableEl.children).indexOf(clicked);
    const card = testDeck.table.splice(idx, 1)[0];
    testDeck.hand.push(card);
    noMoneyforASuitBoss();
    brailleBoss();
    updateAllUI();
  } else {
    messageEl.textContent = "You already have 5 cards!";
  }
});

handEl.addEventListener("click", (event) => {
  const clicked = event.target.closest(".single-card-container");
  if (!clicked) return;

  const idx = Array.from(handEl.children).indexOf(clicked);
  const card = testDeck.hand.splice(idx, 1)[0];
  testDeck.table.push(card);
  noMoneyforASuitBoss();
  brailleBoss();
  updateAllUI();
});

playBtnEl.addEventListener("click", () => {
  if (jokerSelectionMode) {
    if (!keepJokers) {
      messageEl.textContent = "Jokers locked in! Press 'Start Round' to begin.";
      playBtnEl.textContent = "PLAY";
    } else {
      messageEl.textContent = "Jokers Unlocked!Press KEEP to finalize Jokers";
      playBtnEl.textContent = "KEEP";
    }
    keepJokers = !keepJokers;
  } else {
    finalizeHandPlay();
  }
});

discardBtnEl.addEventListener("click", () => {
  if (jokerSelectionMode) {
    messageEl.textContent = "Can't discard in Joker selection!";
    return;
  }
  if (discardsLeft > 0) {
    testDeck.hand = [];
    discardsLeft--;
    testDeck.dealTable();
    updateAllUI();
    messageEl.textContent = "Hand discarded! No points gained.";
  } else {
    messageEl.textContent = "No discards left!";
  }
});

jokersAvailableEl.addEventListener("click", (event) => {
  if (!jokerSelectionMode || keepJokers) {
    messageEl.textContent = "Joker selection is locked!";
    return;
  }

  const clickedJoker = event.target.closest(".single-joker-container");
  if (!clickedJoker) return;
  moveJokerstoPlay(clickedJoker.textContent);
});

jokersInPlayEl.addEventListener("click", (event) => {
  if (!jokerSelectionMode) {
    messageEl.textContent = "Joker selection is locked!";
    return;
  }

  const clickedJoker = event.target.closest(".single-joker-container");
  if (!clickedJoker) return;

  const idx = Array.from(jokersInPlayEl.children).indexOf(clickedJoker);
  moveJokerstoAvail(idx);
});
