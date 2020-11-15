const Data  = require("./Data");
const Utils  = require("./Utils");

module.exports = class Turn {
    constructor(io, channel, socket) {
        // variables liées au joueur en cours
        this.player = Data.currentPlayer;
        io.in(channel).emit('playerPosition', this.player.dataAttr);

        this.currentPlayerWeapon = this.player.weapon;

        // met à jour dom des joueurs
        this.displayInfosPlayer(io, channel);

        // ajoute les classes can-go aux axes x et y
        this.whereCanGo(io, channel);

        // empêche de traverser les murs
        this.checkWalls(io, channel);

        // // regroupe les évènements au click
        this.initEvent(io, channel, socket);

        // // COMBAT //
        // // check si les joueurs sont face à face, lance le combat
        // this.checkEnemyAllDirections();
    };

    initEvent(io, channel, socket) {
        // au click sur le bouton de défense
        // $(`.players-wrapper .${this.player.dataAttr} .btn-defense`).unbind().on('click', () => {
        //     this.enemy = game.arrOfPlayers.filter(player => this.player.dataAttr !== player.dataAttr);
        //     $(`.players-wrapper .fight-options`).removeClass('active');

        //     this.classOnDefense();

        //     // ajoute true à protect du joueur en cours
        //     this.player.protect = true;

        //     this.fightCondition();
        // });

        // au click sur le bouton d'attaque
    }

    playerOnAttack(io, channel, enemy) {
            this.enemy = enemy;

            this.damagesOnHit();

            // animation css à l'attaque
            io.in(channel).emit('classOnAttack', enemy);

            // retire true à protect de l'ennemi
            this.enemy[0].protect = false;

            // relance un tour ou termine la partie
            // this.fightCondition(io, channel);
    }

    displayInfosPlayer(io, channel) {
        // met à jour l'ecran d'affichage du joueur
        this.playerAttr = this.player.dataAttr;

        io.in(channel).emit('displayInfosPlayer', this.playerAttr)
    };

    whereCanGo(io, channel) {
        // variables pour les déplacements
        io.to(Data.currentPlayer.id).emit('whereCanGo');
    };

    checkWalls(io, channel) {
        // détecte les murs et empêche le joueur de passer à travers
        io.in(channel).emit('checkWalls');
    };

    playerMoveUpdateDom(io, channel, dataCells, game) {
        let dataPlayer = Data.currentPlayer.dataAttr;
        let playersWeapon = [];
        let fightTime = Data.fightTime;

        // envoie les armes aux joueurs à chaque tour
        game.arrOfPlayers.forEach(player => {
            playersWeapon.push(
                {'name': player.dataAttr,
                'weapon':player.weapon.dataAttr
                });
        });

        io.in(channel).emit('playerMoveUpdateDom', dataPlayer, dataCells, playersWeapon, fightTime);

        Utils.selectPlayer(io, channel);
    };

    takeWeapon(io, channel, dataWeapons, weapon) {
        let canTakeWeapon = true;
        let ioC = io;

        if (dataWeapons.cellWeapon) {
            if (this.player.weapon !== 'Aucune') { 

                if (dataWeapons.isWeaponPlayer) {
                    canTakeWeapon = false; 
                };
            };

            console.log(canTakeWeapon);

            let player = this.player;

            // Envoie les infos du joueur et de l'arme au channel
            ioC.in(channel).emit('sendWeaponClient', canTakeWeapon, player, dataWeapons);
            this.tookWeapon = true;
            
            // met à jour l'arme et le tableau du joueur
            this.player.weapon = weapon[0];
            this.player.updatePlayerDom(this.player, ioC, channel);
        };
    };

    enemyPosition(io, channel, attrEnemy, positionEnemy) {
        let player = this.player;

        io.to(channel).emit('enemyPosition', player, attrEnemy, positionEnemy);
    };

    fightCondition(ioC, channel, player, socket) {
        // TO DO
        // TO DO
        if (this.enemy[0].life <= 0) {
            let dataEnemy = $(`[data-player = ${this.enemy[0].dataAttr}]`);

            // met à met la vie de l'ennemi à 0
            this.enemy[0].life = 0;
            this.enemy[0].updatePlayerDom(this.enemy[0]);

            this.endFightAnimations(dataEnemy);
        // TO DO
        // TO DO

        } else {
            let enemyAttr = this.enemy[0].dataAttr

            ioC.in(channel).emit('removeClassCurrentPlayer', player)

            // met les données du tableau du joueur
            this.enemy[0].updatePlayerDom(this.enemy[0], ioC, channel);

            
            // sélectionne l'autre joueur
            Utils.selectPlayer(ioC, channel);
            
            socket.to(channel).emit('fightPlayerOptions', enemyAttr);

            // relance un tour
            // new Turn(ioC, channel, socket);
        };
    };

    classOnDefense() {
        $('.cell').removeClass('attack-now');
        $('.cell').removeClass('attacked');

        $(`[data-player = ${this.player.dataAttr}]`).addClass('protect');
    };

    damagesOnHit() {
        // dégat selon l'arme possédée
        if (this.currentPlayerWeapon.damage) {
            this.enemy[0].protect ? this.enemy[0].life -= this.currentPlayerWeapon.damage / 2 : this.enemy[0].life -= this.currentPlayerWeapon.damage;
        } else {
            this.enemy[0].protect ? this.enemy[0].life -= 1 : this.enemy[0].life -= 2;
        };
    };

    endFightAnimations(dataEnemy) {
        setTimeout(() => {
            $('.cell').removeClass('attacked attack-now');
            dataEnemy.addClass('you-loose');
        }, 500);

        setTimeout(() => {
            $(`[data-player = ${this.player.dataAttr}]`).addClass('you-win');
        }, 700);

        // si l'ennemi n'a plus de vie, affiche l'écran de fin
        setTimeout(() => {
            $('.win-screen').addClass('active');
            $('.img-winner').addClass(this.player.dataAttr);
            $('.winner-win-text').text(`${this.player.name}`);
        }, 3000);
    }
};
