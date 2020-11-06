const Data  = require("./Data");
const Utils  = require("./Utils");

module.exports = class Board {
    constructor(arrOfPlayers, arrOfWeapons, io, channel) {
        this.allCells = this.generateAllCells();
        this.addCoordonates(this.allCells);
        this.players = arrOfPlayers;
        this.weapons = arrOfWeapons;
        this.addWeapons(this.allCells, arrOfWeapons);
        this.addPlayers(this.allCells, arrOfPlayers);
        this.playersNoWalls();
        this.displayCells(this.allCells, io, channel);
        this.cells = this.allCells;
    };

    // Création d'une case avec une état
    generateCell() {
        let stateOfCell = [];

        for (let i = 0; i < Data.nbOfWalls; i++) {
            stateOfCell.push('innacessible');
        };

        for (let i = 0; i < Data.nbOfCells - Data.nbOfWalls; i++) {
            stateOfCell.push('vide');
        };

        let state = Utils.selectRandom(stateOfCell);

        return {
            state: state,
            x: 0,
            y: 0
        };
    };

    // Génération de toutes les cases
    generateAllCells() {
        let arrCells = [];

        for (let i = 0; i < Data.nbOfCells; i++) {
            arrCells.push(this.generateCell());
        };

        return arrCells
    };


    // Ajout des coordonnées X et Y aux cases
    addCoordonates(allCells) {
        let cellsWithCoordonates = [];
        let y = 0;
        let x = -1;

        for (let i = 0; i < allCells.length; i++) {

            x += 1;

            if (x > Data.xMaxCells) {
                y += 1;
                x = 0;
            };

            allCells[i].x = x;
            allCells[i].y = y;

            cellsWithCoordonates.push(allCells[i]);
        };


        return cellsWithCoordonates;
    };

    // Ajout des armes aux cases
    addWeapons(cells, weapons) {
        // retourne tableau des cases vides
        let emptyCells = cells.filter(cell => cell.state === 'vide');

        // ajoute les armes aux cases vides au hasard
        weapons.map(weapon => Utils.selectRandom(emptyCells).weapon = weapon);

        // vérifie les armes présentes dans l'objet cells
        let weaponsCheck = cells.filter(cell => cell.weapon);

        // si il n'y a pas assez d'armes, réajout des armes dans cells
        if (weaponsCheck.length !== weapons.length) {
            cells.map(cell => delete cell.weapon);
            weapons.map(weapon => Utils.selectRandom(emptyCells).weapon = weapon);
        };

        // retire la clé 'statut' aux cases avec une arme
        cells.filter(cell => cell.weapon).map(cell => delete cell.state);

        return cells;
    };

    // Ajout des joueurs
    addPlayers(cells, players) {
        // retourne tableau des cases vides
        let emptyCells = cells.filter(cell => cell.state === 'vide');

        // défini une zone en haut et une zone en bas pour l'apparition des joueurs
        for (let cell of cells) {
            if (cell.y < 2) {
                cell.generatePlayer = players[0].dataAttr;
            }
            else if (cell.y > 7) {
                cell.generatePlayer = players[1].dataAttr;
            }
        }

        // selectionne un index au hasard pour l'apparition des joueurs
        let randomNumber = Utils.selectRandom([0, 1]);

        // place chaque joueur dans la partie qui lui est attribuée
        Utils.selectRandom(emptyCells.filter(cell => cell.generatePlayer == players[0].dataAttr)).player = players[randomNumber];
        Utils.selectRandom(emptyCells.filter(cell => cell.generatePlayer == players[1].dataAttr)).player = players[randomNumber == 1 ? 0 : 1];

        // supprime la propriété innutile par la suite
        cells.map(cell => delete cell.generatePlayer)

        // vérifie les joueurs présentes dans l'objet cells
        let playersCheck = cells.filter(cell => cell.player);

        // si il n'y a pas assez de joueurs, réajout des joueurs dans cells
        if (playersCheck.length !== players.length) {
            cells.map(cell => delete cell.player);
            players.map(player => Utils.selectRandom(emptyCells).player = player);
        };

        return cells
    };

    displayCells(cells, io, channel) {
        io.in(channel).emit('displayCells', cells);
    };

    playersNoWalls() {
        let playersCell = this.allCells.filter(cell => cell.player);
        let cellsWithNoWalls = [];

        for (let playerCell of playersCell) {
            // ajoute au tableau les cellules en haut, bas, gauche et droite des joueurs
            let findXRight = cellsWithNoWalls.push(this.allCells.filter(cell => cell.x === playerCell.x + 1 && cell.y === playerCell.y)[0]);
            let findXLeft = cellsWithNoWalls.push(this.allCells.filter(cell => cell.x === playerCell.x - 1 && cell.y === playerCell.y)[0]);
            let findYBottom = cellsWithNoWalls.push(this.allCells.filter(cell => cell.y === playerCell.y + 1 && cell.x === playerCell.x)[0]);
            let findYTop = cellsWithNoWalls.push(this.allCells.filter(cell => cell.y === playerCell.y - 1 && cell.x === playerCell.x)[0]);

            // filtre les cellules présentes et leur met leur state à vide
            let filterCells = cellsWithNoWalls.filter(cell => cell !== undefined);
            let mapNoWalls = filterCells.map(cell => cell.state = "vide");
        };
    };
};


