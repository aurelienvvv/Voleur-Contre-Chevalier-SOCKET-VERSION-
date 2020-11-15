const Data  = require("./Data");
const Utils  = require("./Utils");
const Weapon  = require("./Weapon");
const Player  = require("./Player");
const Board  = require("./Board");
const Turn  = require("./Turn");

module.exports = class Game {
    constructor(io, channel, users, socket) {
        this.weapon = new Weapon;
        this.arrOfWeapons = this.weapon.generateWeapon(Data.nbOfWeapons);

        this.definePlayers(users, io, channel, socket);

        // if (Utils.isMobile()) {
        //     Data.nbOfCells = 66;
        //     Data.xMaxCells = 5;
        //     Data.nbOfWalls = 10;
        // };

        new Board(this.arrOfPlayers, this.arrOfWeapons, io, channel);
        this.turn = new Turn(io, channel, socket);
    };

    clearGame() {
        $('li').remove('.cell');

        $('.win-screen').removeClass('active');
        $('.img-winner').removeClass('player1');
        $('.img-winner').removeClass('player2');
        $('.winner-win-text').text(``);
        $('body').removeClass('fight-time');
        $('.cells').removeClass('vertical-fight')
        $('.fight-time-text').removeClass('active');
        $('.cells').removeClass('-flex-cells');
        $(`.player .life-line`).css('width', `100%`);
        $(`.player .life-line`).removeClass('-red -orange -yellow');
    }

    definePlayers(users, io, channel) {        
        users.map(user => user.status = 'onPlay');
        let player1 = users[0];
        let player2 = users[1];
    
        this.playerOne = new Player(player1.name, player1.id, 100, 'player1', 'Aucune');
        this.playerTwo = new Player(player2.name, player2.id, 100, 'player2', 'Aucune');
        this.arrOfPlayers = [this.playerOne, this.playerTwo];
        Data.arrOfPlayers = [this.playerOne, this.playerTwo];
        Data.currentPlayer = Utils.selectRandom(this.arrOfPlayers);
        this.arrOfPlayers.map(player => player.updatePlayerDom(player, io, channel));
    };
};