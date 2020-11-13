// ********************* //
// DETECTION DE L'ENNEMI //
// ********************* //
function checkEnemyForFightAllDirections() {
    checkEnemyForFight('x', dataCells.endPlayerDataX - 1, 'y', dataCells.endPlayerDataY);
    checkEnemyForFight('x', dataCells.endPlayerDataX + 1, 'y', dataCells.endPlayerDataY);
    checkEnemyForFight('y', dataCells.endPlayerDataY - 1, 'x', dataCells.endPlayerDataX);
    checkEnemyForFight('y', dataCells.endPlayerDataY + 1, 'x', dataCells.endPlayerDataX);
};

function checkEnemyForFight(attrEnemy, positionEnemy, attr, position) {
    if ($(`[data-${attrEnemy} = ${positionEnemy}][data-${attr} = ${position}]`).hasClass('player')) {
        if ($(`[data-${attrEnemy} = ${positionEnemy}][data-${attr} = ${position}]`).hasClass('current-player')) {
        } else {
            $(`[data-${attrEnemy} = ${positionEnemy}][data-${attr} = ${position}]`).addClass('attack-enemy');

            // Envoie la position de l'ennemi au serveur
            socket.emit('fightTimeDOM', (attrEnemy, positionEnemy));
        };
    };
};

socket.on('enemyPosition', (player, attrEnemy, positionEnemy) => {
    // detecte la position de l'ennemi et ajoute une classe correspondante
    if (attrEnemy === "y" && positionEnemy === positionPlayer.playerDataY - 1) {
        console.log('enemy position 1')
        $(`[data-player=${player.dataAttr}]`).addClass('top-enemy');
        $('.cells').addClass('vertical-fight');
        
    } else if (attrEnemy === "y" && positionEnemy === positionPlayer.playerDataY + 1) {
        console.log('enemy position 2')
        $(`[data-player=${player.dataAttr}]`).addClass('bottom-enemy');
        $('.cells').addClass('vertical-fight');
        
    } else if (attrEnemy === "x" && positionEnemy === positionPlayer.playerDataX + 1) {
        console.log('enemy position 3')
        $(`[data-player=${player.dataAttr}]`).addClass('right-enemy');
        $(`[data-player=${player.dataAttr}]`).removeClass('to-left');

    } else if (attrEnemy === "x" && positionEnemy === positionPlayer.playerDataX - 1) {
        console.log('enemy position 4')
        $(`[data-player=${player.dataAttr}]`).addClass('left-enemy');
        $(`[data-player=${player.dataAttr}]`).addClass('to-left');
    }
});

socket.on('fightPlayerOptions', (playerAttr)=> {
    $(`.players-wrapper .${playerAttr} .fight-options`).addClass('active');
});

// *********************** //
// AU CLICK BOUTON ATTAQUE //
// *********************** //
$(`.players-wrapper .btn-attack`).unbind().on('click', () => {
    // choix d'attaquer ou de defendre
    $(`.players-wrapper .fight-options`).removeClass('active');

    socket.emit('clickAttack', '');
});

socket.on('classOnAttack', (enemy) => {
        $('.cell').removeClass('attack-now');
        $('.cell').removeClass('attacked');

        // Retire le bouclier de l'ennemi si il en a un
        $(`[data-player = ${enemy[0].dataAttr}]`).removeClass('protect');

        // barre de vie css
        $(`.${enemy[0].dataAttr} .life-line`).css('width', `${enemy[0].life}%`);

        if (enemy[0].life < 20) {
            $(`.${enemy[0].dataAttr} .life-line`).addClass('-red').removeClass('-orange');
        }

        else if (enemy[0].life < 40) {
            $(`.${enemy[0].dataAttr} .life-line`).addClass('-orange').removeClass('-yellow');
        }

        else if (enemy[0].life < 60) {
            $(`.${enemy[0].dataAttr} .life-line`).addClass('-yellow');
        }

        // classe qui ajoute une animation visuelle
        $('.current-player').addClass('attack-now');
        $(`[data-player = ${enemy[0].dataAttr}]`).addClass('attacked');
});

socket.on('removeClassCurrentPlayer', (player) => {
    $(`[data-player = ${player.dataAttr}]`).removeClass('current-player');
});