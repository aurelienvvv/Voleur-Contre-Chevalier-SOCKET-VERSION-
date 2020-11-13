// Affichage des cases can-go
socket.on('whereCanGo', () => {
    let dataXMin = positionPlayer.playerDataX - 3;
    let dataXMax = positionPlayer.playerDataX + 4;
    let dataYMin = positionPlayer.playerDataY - 3;
    let dataYMax = positionPlayer.playerDataY + 4;

    // donne accès aux cases, 3 cases en y, 3 cases en x
    $(`[data-x = ${positionPlayer.playerDataX}], [data-y = ${positionPlayer.playerDataY}]`).addClass('can-go');
    $(`[data-x = ${positionPlayer.playerDataX}][data-y = ${positionPlayer.playerDataY}]`).removeClass('can-go');
    $('.can-go.player').removeClass('can-go');

    loopCanGo(0, dataXMin, 'data-x');
    loopCanGo(dataXMax, 10, 'data-x');
    loopCanGo(0, dataYMin, 'data-y');
    loopCanGo(dataYMax, 11, 'data-y');
});

// Affichage des cases can-go
function loopCanGo(startLoop, endLoop, dataAttr) {
    // limites can-go à 3 cases en x et en y
    for (let i = startLoop; i < endLoop; i++) {
        $(`[${dataAttr} = ${i}]`).removeClass('can-go');
    };
};

// Affichage des cases can-go
socket.on('checkWalls', () => {
    // détecte les murs et empêche le joueur de passer à travers
    let wallsOnWay = $('.can-go.innacessible');

    wallsOnWay.each((index, elem) => {
        let dataWallX = $(elem).data('x');
        let dataWallY = $(elem).data('y');


        if (positionPlayer.playerDataX < dataWallX) {
            for (let i = dataWallX; i < 10; i++) {
                $(`[data-x = ${i}]`).removeClass('can-go');
            }
        }

        else if (positionPlayer.playerDataX > dataWallX) {
            for (let i = dataWallX; i > -1; i--) {
                $(`[data-x = ${i}]`).removeClass('can-go');
            }
        }

        else if (positionPlayer.playerDataY < dataWallY) {
            for (let i = dataWallY; i < 11; i++) {
                $(`[data-y = ${i}]`).removeClass('can-go');
            }
        }

        else if (positionPlayer.playerDataY > dataWallY) {
            for (let i = dataWallY; i > -1; i--) {
                $(`[data-y = ${i}]`).removeClass('can-go');
            }
        }
    })
});
