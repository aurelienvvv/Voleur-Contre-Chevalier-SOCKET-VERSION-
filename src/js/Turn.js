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
        this.whereCanGo(socket, channel);

        // empêche de traverser les murs
        this.checkWalls(io, channel);

        // // regroupe les évènements au click
        this.initEvent(io, channel, socket);

        // // COMBAT //
        // // check si les joueurs sont face à face, lance le combat
        // this.checkEnemyAllDirections();
    };

    initEvent(io, channel, socket) {
        // // au click sur le bouton de défense
        // $(`.players-wrapper .${this.player.dataAttr} .btn-defense`).unbind().on('click', () => {
        //     this.enemy = game.arrOfPlayers.filter(player => this.player.dataAttr !== player.dataAttr);
        //     $(`.players-wrapper .fight-options`).removeClass('active');

        //     this.classOnDefense();

        //     // ajoute true à protect du joueur en cours
        //     this.player.protect = true;

        //     this.fightCondition();
        // });

        // // au click sur le bouton d'attaque
        // $(`.players-wrapper .${this.player.dataAttr} .btn-attack`).unbind().on('click', () => {
        //     // choix d'attaquer ou de defendre
        //     this.enemy = game.arrOfPlayers.filter(player => this.player.dataAttr !== player.dataAttr);
        //     $(`.players-wrapper .fight-options`).removeClass('active');

        //     this.damagesOnHit();

        //     // animation css à l'attaque
        //     this.classOnAttack();

        //     // retire true à protect de l'ennemi
        //     this.enemy[0].protect = false;

        //     // relance un tour ou termine la partie
        //     this.fightCondition();
        // });
    }

    displayInfosPlayer(io, channel) {
        // met à jour l'ecran d'affichage du joueur
        this.playerAttr = this.player.dataAttr;

        io.in(channel).emit('displayInfosPlayer', this.playerAttr)
    };

    whereCanGo(socket, channel) {
        // variables pour les déplacements
        socket.to(channel).emit('whereCanGo');
    };

    checkWalls(io, channel) {
        // détecte les murs et empêche le joueur de passer à travers
        io.in(channel).emit('checkWalls');
    };

    playerMoveUpdateDom(io, channel, dataCells) {
        let dataPlayer = Data.currentPlayer.dataAttr;
        let isWeapon = this.player.weapon;
        let dataWeapon = this.player.weapon.dataAttr;

        io.in(channel).emit('playerMoveUpdateDom', dataPlayer, isWeapon, dataCells, dataWeapon);
    };

    checkEnemyForFight(attrEnemy, positionEnemy, attr, position) {
        if ($(`[data-${attrEnemy} = ${positionEnemy}][data-${attr} = ${position}]`).hasClass('player')) {
            $(`[data-${attrEnemy} = ${positionEnemy}][data-${attr} = ${position}]`).addClass('attack-enemy');

            // detecte la position de l'ennemi et ajoute une classe correspondante
            this.enemyPosition(attrEnemy, positionEnemy);

            // ajout des classes pour le combat
            this.fightTimeDOM();
        };
    };

    enemyPosition(attrEnemy, positionEnemy) {
        // detecte la position de l'ennemi et ajoute une classe correspondante
        if (attrEnemy === "y" && positionEnemy === this.dataY - 1) {
            $(`[data-player=${this.player.dataAttr}]`).addClass('top-enemy');
            $('.cells').addClass('vertical-fight');

        } else if (attrEnemy === "y" && positionEnemy === this.dataY + 1) {
            $(`[data-player=${this.player.dataAttr}]`).addClass('bottom-enemy');
            $('.cells').addClass('vertical-fight');

        } else if (attrEnemy === "x" && positionEnemy === this.dataX + 1) {
            $(`[data-player=${this.player.dataAttr}]`).addClass('right-enemy');
            $(`[data-player=${this.player.dataAttr}]`).removeClass('to-left');

        } else if (attrEnemy === "x" && positionEnemy === this.dataX - 1) {
            $(`[data-player=${this.player.dataAttr}]`).addClass('left-enemy');
            $(`[data-player=${this.player.dataAttr}]`).addClass('to-left');
        }
    };

    fightTimeDOM() {
        $('body').addClass('fight-time');
        $('.cell').removeClass('can-go');
        $('.cell').off('click');
        $(`.players-wrapper .${this.player.dataAttr} .fight-options`).addClass('active');

        // zoom visuel sur les joueurs au moment du combat
        this.zoomOnFight();
    }

    checkEnemyAllDirections() {
        this.checkEnemyForFight('x', this.dataX - 1, 'y', this.dataY);
        this.checkEnemyForFight('x', this.dataX + 1, 'y', this.dataY);
        this.checkEnemyForFight('y', this.dataY - 1, 'x', this.dataX);
        this.checkEnemyForFight('y', this.dataY + 1, 'x', this.dataX);
    };

    fightCondition() {
        if (this.enemy[0].life <= 0) {
            let dataEnemy = $(`[data-player = ${this.enemy[0].dataAttr}]`);

            // met à met la vie de l'ennemi à 0
            this.enemy[0].life = 0;
            this.enemy[0].updatePlayerDom(this.enemy[0]);

            this.endFightAnimations(dataEnemy);
        } else {
            // sinon met à jour les classes du DOM
            $(`[data-player = ${this.player.dataAttr}]`).removeClass('current-player');

            // met les données du tableau du joueur
            this.enemy[0].updatePlayerDom(this.enemy[0]);


            // sélectionne l'autre joueur
            Utils.selectPlayer();

            // relance un tour
            new Turn();
        };
    };

    classOnDefense() {
        $('.cell').removeClass('attack-now');
        $('.cell').removeClass('attacked');

        $(`[data-player = ${this.player.dataAttr}]`).addClass('protect');
    };

    classOnAttack() {
        $('.cell').removeClass('attack-now');
        $('.cell').removeClass('attacked');

        // Retire le bouclier de l'ennemi si il en a un
        $(`[data-player = ${this.enemy[0].dataAttr}]`).removeClass('protect');

        // barre de vie css
        $(`.${this.enemy[0].dataAttr} .life-line`).css('width', `${this.enemy[0].life}%`);

        if (this.enemy[0].life < 20) {
            $(`.${this.enemy[0].dataAttr} .life-line`).addClass('-red').removeClass('-orange');
        }

        else if (this.enemy[0].life < 40) {
            $(`.${this.enemy[0].dataAttr} .life-line`).addClass('-orange').removeClass('-yellow');
        }

        else if (this.enemy[0].life < 60) {
            $(`.${this.enemy[0].dataAttr} .life-line`).addClass('-yellow');
        }

        // classe qui ajoute une animation visuelle
        $('.current-player').addClass('attack-now');
        $(`[data-player = ${this.enemy[0].dataAttr}]`).addClass('attacked');
    };

    damagesOnHit() {
        // dégat selon l'arme possédée
        if (this.currentPlayerWeapon.damage) {
            this.enemy[0].protect ? this.enemy[0].life -= this.currentPlayerWeapon.damage / 2 : this.enemy[0].life -= this.currentPlayerWeapon.damage;
        } else {
            this.enemy[0].protect ? this.enemy[0].life -= 1 : this.enemy[0].life -= 2;
        };
    };

    zoomOnFight() {
        // supprimer toutes les cases qui ne contiennent pas les joueurs
        let hasNotPlayer = $(".cell:not(.player)");

        hasNotPlayer.addClass('disapered');
        $('.fight-time-text').addClass('active');

        setTimeout(() => {
            hasNotPlayer.hide();
            $('.cells').addClass('-flex-cells');
        }, 1000)
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
