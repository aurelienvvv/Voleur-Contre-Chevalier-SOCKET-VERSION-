const socket = io();

// Utils.firstScreenStyle();

// Launch Game //
let game;

$('#name-form').on('submit', (e) => {
    e.preventDefault();
    name = $('#name').val();
    socket.emit('newUser', name);
    $('.chat-screen').addClass('active');
    $('#name-form').removeClass('active');
});

$('.select-channel').on('click', () => {
    let dataChannel = $("input[type='radio'][name='channel']:checked");
    
    if (dataChannel.length > 0) {
        dataChannel = dataChannel.val();
    };

    socket.emit('newGame', dataChannel);
});


// $('.reload-btn').on('click', () => {
//     $('.win-screen').removeClass('active');
//     game.clearGame();
//     game = new Game();
// });

socket.on('countUsersChannel', channels => {
    // Met à jour l'accès au channel
    for (let channel of channels) {
        $(`input#${channel.name}`).attr('disabled', false);
        
        if (channel.userOn === undefined) {
            channel.userOn = 0;
            
        } else if (channel.userOn === 2) {
            $(`input#${channel.name}`).attr('disabled', 'disabled');
        }

        $(`label[for=${channel.name}]`).text(`${channel.name} (${channel.userOn}/2)`)
    }
});

socket.on('newGame', () => {
    $('.start-screen').removeClass('active');

    setTimeout(() => {
        $('.start-screen').css('display', 'none');
    }, 1000);
});

socket.on('error message', msg => {
    alert(msg);
});

socket.on('disconnect channel', () => {
    // Quand un joueur quitte le jeu en cours
    alert(`Votre adversaire a quitter la partie`);

    $('.start-btn').prop("disabled", false);
    $('.start-screen').css('display', 'flex');

    $('.start-screen').addClass('active');
    game.clearGame();
});
