let game = {
  techs: [
    ["lixeiraVerde", "garrafaVerde", "verde"],
    ["lixeiraAmarelo", "lataAmarelo", "amarelo"],
    ["lixeiraMarrom", "ovoMarrom", "marrom"],
    ["lixeiraAzul", "jornalAzul", "azul"],
    ["lixeiraBranco", "lixoBranco", "branco"],
    ["lixeiraCinza", "lampadaCinza", "cinza"],
    ["lixeiraLaranja", "pilhaLaranja", "laranja"],
    ["lixeiraPreto", "palletPreto", "preto"],
    ["lixeiraRoxo", "barrilRoxo", "roxo"],
    ["lixeiraVermelho", "copoVermelho", "vermelho"],
  ],
  cards: null,

  createCardsFromTechs: function () {
    this.cards = [];
    this.techs.forEach((tech) => {
      this.cards.push(this.createPairFromTech(tech));
    });
    this.cards = this.cards.flatMap((pair) => pair);
    this.shuffleCards();
    return this.cards;
  },

  createPairFromTech: function (tech) {
    return [
      {
        id: this.createIdWithTech(tech[1]),
        icon: tech[0],
        value: tech[2],
        flipped: false,
      },
      {
        id: this.createIdWithTech(tech[1]),
        icon: tech[1],
        value: tech[2],
        flipped: false,
      },
    ];
  },

  createIdWithTech: function (tech) {
    return tech + parseInt(Math.random() * 1000);
  },

  shuffleCards: function (cards) {
    let currentIndex = this.cards.length;
    let randomIndex = 0;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [this.cards[randomIndex], this.cards[currentIndex]] = [
        this.cards[currentIndex],
        this.cards[randomIndex],
      ];
    }
  },

  lockMode: false,
  firstCard: null,
  secondCard: null,

  setCard: function (id) {
    let card = this.cards.filter((card) => card.id === id)[0];

    if (card.flipped || this.lockMode) {
      return false;
    }

    if (!this.firstCard) {
      this.firstCard = card;
      this.firstCard.flipped = true;
      return true;
    } else {
      this.secondCard = card;
      this.secondCard.flipped = true;
      this.lockMode = true;
      return true;
    }
  },

  checkMatch: function () {
    if (!this.firstCard || !this.secondCard) {
      return false;
    }
    return this.firstCard.value === this.secondCard.value;
  },

  clearCards: function () {
    this.firstCard = null;
    this.secondCard = null;
    this.lockMode = false;
  },

  unflipCards() {
    this.firstCard.flipped = false;
    this.secondCard.flipped = false;
    this.clearCards();
  },

  checkGameOver() {
    return this.cards.filter((card) => !card.flipped).length == 0;
  },
};
