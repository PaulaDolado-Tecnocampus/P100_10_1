const NUM_TIPOS_CARTAS = 51;

const decks = {
    poker: {
        numTiposCartas: 51,
        columnas: 13,
        pixHorizontales: 80,
        pixVerticales: 120
    },
    pokemon: {
        numTiposCartas: 21,
        columnas: 7,
        pixHorizontales: 111,
        pixVerticales: 111,
    }
}
var numClicks = 0;
var numAciertos = 0;
var tiempo = 0;
var numCartas = 0;

var tablero = [];
var cartaSeleccionada = null;
var deckActual = "poker";

var divTablero = null;

var ventanaWin = null;
var ventanaLose = null;
var timeout = null;
var contador = 0;
var tiempo = null;
var ultimotiempoRegistrado = 0;
var tiempoInicial = 0;

// Mezcla un array usando el algoritmo de Durstenfeld
function mezclarArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
function temporizador(numCartas){
    if(numCartas==16){
        return 60;
    }else if (numCartas==24){
        return 90;
    }
    return 120;
}

function empezarJuego(cartas, numCols) {

    numCartas = cartas;

    // Modifica columnas tablero

    divTablero.css({
        "grid-template-columns": "repeat(" + numCols + ", 1fr)"
    });

    // Crea el array tablero

    for (let i = 0; i < numCartas / 2; i++) {
        let tipoCarta = Math.round(Math.random() * decks[deckActual].numTiposCartas); // Depende de la imagen deck
        tablero.push(tipoCarta);
    }

    tablero = tablero.concat(tablero);
    mezclarArray(tablero);

    // Crea los divs de las 


    for (let i = 0; i < tablero.length; i++) {

        let tipo = tablero[i];

        let offsetY = Math.floor(tipo / decks[deckActual].columnas);
        let offsetX = (tipo - offsetY * 13) * decks[deckActual].pixHorizontales;

        offsetY *= decks[deckActual].pixVerticales;

        const carta = $('<div class="carta amagada ' + deckActual + '" data-id="' + tipo + '"><div class="cara darrera ' + deckActual + '"></div><div style="background-position: ' + -offsetX + 'px ' + -offsetY + 'px" class="cara davant ' + deckActual + '"></div></div>')

        setTimeout(function() {
            carta.removeClass("amagada");
        }, 100 * i);

        divTablero.append(carta);
    };

    $(".carta").on("click", function() {
        cartaClick($(this));
    });

    const gameStartEvent = new CustomEvent("gameStart");
    document.dispatchEvent(gameStartEvent);
    contador = temporizador(numCartas);
    tiempoInicial = contador;
}

function acierto(carta) {
    carta.off("click");
    cartaSeleccionada.off("click");
    carta.toggleClass("emparejada"); 
    cartaSeleccionada.toggleClass("emparejada");
    cartaSeleccionada = null;
    numAciertos++;

    setTimeout(function() {
        reproducirEfecto("correct");
    }, 500);
}


function finalizar() {
    var condicio1 = numAciertos*2 ==  numCartas; 
    var condicio2 = numClicks >= (numCartas*3);
    if (condicio1){
        clearInterval(timeout);
        ultimotiempoRegistrado = Math.round(tiempoInicial - contador);
        $("#completado").html("Has completado el juego en " + ultimotiempoRegistrado + " segundos.");

        if (contador >= 30) {
            numEstrellas = 3;
        } else if (contador >= 15) {
            numEstrellas = 2;
        } else {
            numEstrellas = 1;
        }
        var estrellasHtml = "";
        for (var i = 0; i < numEstrellas; i++) {
            estrellasHtml += "<i class='bi bi-star-fill'></i>";
        }
        for (var i = numEstrellas; i < 3; i++) {
            estrellasHtml += "<i class='bi bi-star'></i>";
        }
        $("#estrellas").html(estrellasHtml);
        $("#numEstrellas").html(numEstrellas);

        ventanaWin.addClass("abrir");
        
    }
    if(condicio2){
        ventanaLose.addClass("abrir");
    }
}

function cartaClick(carta) {

    carta.toggleClass("carta-girada");
    const id = parseInt(carta.attr("data-id"));
    numClicks++;
    reproducirEfecto("woosh");

    if (cartaSeleccionada != null) {

        const idSeleccionada = parseInt(cartaSeleccionada.attr("data-id"));

        if (cartaSeleccionada[0] == carta[0]) {
            carta.removeClass("carta-girada");
            cartaSeleccionada = null;
        } else if (id == idSeleccionada) {
            acierto(carta);
        } else {
            let temp = cartaSeleccionada;
            cartaSeleccionada = null;

            setTimeout(function() {
                carta.effect("shake", {distance: 5});
                temp.effect("shake", {distance: 5});
                reproducirEfecto("wrong");
            }, 250);

            setTimeout(function() {
                carta.removeClass("carta-girada");
                temp.removeClass("carta-girada");
            }, 1000);
        }

    } else {
        cartaSeleccionada = carta;
    }
    if (numClicks == 1){
        timeout = setInterval(function(){
            if(contador==0){
                numClicks = numCartas*3;
                clearInterval(timeout);
            }else{
                tiempo.addClass("iniciado");
                contador = contador-1;
                $("#cuentaAtras").html(contador + " segundos");
            }
            finalizar();
        }, 1000); 
    }    
}

function reproducirEfecto(nombre) {
    let soundEvent = new CustomEvent("playEffect", {
        detail: {
            name: nombre
        }
    });
    document.dispatchEvent(soundEvent);
}

$(function() {
    $("#dificultadBtn").click(function() {
        $("#menu").hide();
        $("#tauler").show();
    });   
    divTablero = $("#tauler");
    $("#facil").click(function() {
        empezarJuego(16, 4);
        $("#ayuda").hide();
    });
    $("#medio").click(function() {
        empezarJuego(24, 6);
        $("#ayuda").hide();
    });
    $("#dificil").click(function() {
        empezarJuego(32, 8);
        $("#ayuda").hide();
    });
    $("#reloadWin").click(function(){
        location.reload();
    });
    $("#reloadLose").click(function(){
        location.reload();
    });

    $(".decksel").on("click", function() {
        $(this).parent().children().each(function() {
            $(this).removeClass("selected");
        });

        $(this).toggleClass("selected");
        deckActual = $(this).attr("data-name");
        localStorage.setItem("deckActual", deckActual);
    });

    ventanaWin = $("#finestraWin");
    ventanaLose = $("#finestraLose");
    tiempo = $("#tiempo");

    startIntro();

    // Carrega deck actual guardat
    let deckGuardat = localStorage.getItem("deckActual");
    if (deckGuardat !== null) {
        deckActual = deckGuardat;
        $($(".decksel")[0]).parent().children().each(function() {
            let cdeck = $(this).attr("data-name");
            if (cdeck == deckActual) $(this).addClass("selected");
            else $(this).removeClass("selected");
        });
    }

    particulas();
    
});



function startIntro() {
    var intro = introJs();
    $('#ayuda').click(function(){
    intro.setOptions({
        steps: [
            {
                element: '#menu',
                intro: "¡Bienvenidos al juego de cartas! Seleccione un nivel de dificultad para empezar a jugar. " 
            },
            {
                element: '#facil',
                intro: "El nivel fácil contiene 16 cartas para emparejar. "
            },
            {
                element: '#medio',
                intro: "El nivel medio contiene 24 cartas para emparejar. "
            },
            {
                element: '#dificil',
                intro: "¡Este nivel es tan solo para los mejores! Contiene 32 cartas para emparejar. "
            },
            {
                element: '#menu',
                intro: "Debajo de la dificultad de juego, puede seleccionar la baraja inicial con la que desee jugar. La de la izquierda es la baraja de póker tradicional y la que muestra la derecha es una baraja con temática de Pokémon"
            },
            {
                element: '#mc-mute',
                intro: "Si desea activar/desactivar la música general, presione este botón inferior. "
            }
            

        ],
        nextLabel: 'Siguiente',
        prevLabel: 'Anterior',
        skipLabel: 'x',
        doneLabel: 'Hecho',
        exitOnOverlayClick: true
    });
    intro.start();
});
    
}


function particulas() {
    // https://codepen.io/mrkhdly/pen/yVGwdm
    particlesJS("particles-js", {"particles":{"number":{"value":160,"density":{"enable":true,"value_area":800}},"color":{"value":"#000000"},"shape":{"type":"circle","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":"img/github.svg","width":100,"height":100}},"opacity":{"value":1,"random":true,"anim":{"enable":true,"speed":1,"opacity_min":0,"sync":false}},"size":{"value":3,"random":true,"anim":{"enable":false,"speed":4,"size_min":0.3,"sync":false}},"line_linked":{"enable":false,"distance":150,"color":"#ffffff","opacity":0.4,"width":1},"move":{"enable":true,"speed":1,"direction":"none","random":true,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":600,"rotateY":600}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":false,"mode":"bubble"},"onclick":{"enable":false,"mode":"repulse"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":1}},"bubble":{"distance":250,"size":0,"duration":2,"opacity":0,"speed":3},"repulse":{"distance":400,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true});
}