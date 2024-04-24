const NUM_TIPOS_CARTAS = 51;
var numClicks = 0;
var numAciertos = 0;
var tiempo = 0;
var numCartas = 0;

var tablero = [];
var cartaSeleccionada = null;

var divTablero = null;

var ventanaWin = null;
var ventanaLose = null;
var timeout = null;
var contador = 0;
var tiempo = null;
var ultimotiempoRegistrado = 0;

// Mezcla un array usando el algoritmo de Durstenfeld
function mezclarArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function Temporizador(numCartas){
    if(numCartas==16){
        contador = 60;
    }else if (numCartas==24){
        contador = 90;
    }else{
        contador = 120;
    }
    return contador;
}

function empezarJuego(cartas, numCols) {

    numCartas = cartas;

    // Modifica columnas tablero

    divTablero.css({
        "grid-template-columns": "repeat(" + numCols + ", 1fr)"
    });

    // Crea el array tablero

    for (let i = 0; i < numCartas / 2; i++) {
        let tipoCarta = Math.round(Math.random() * NUM_TIPOS_CARTAS); // Depende de la imagen deck
        tablero.push(tipoCarta);
    }

    tablero = tablero.concat(tablero);
    mezclarArray(tablero);

    // Crea los divs de las 


    for (let i = 0; i < tablero.length; i++) {

        let tipo = tablero[i];

        let offsetY = Math.floor(tipo / 13.);
        let offsetX = (tipo - offsetY * 13) * 80;

        offsetY *= 120;

        const carta = $('<div class="carta amagada" data-id="' + tipo + '"><div class="cara darrera"></div><div style="background-position: ' + -offsetX + 'px ' + -offsetY + 'px" class="cara davant"></div></div>')

        

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
    contador= Temporizador(numCartas);
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
        ultimotiempoRegistrado = contador; 
        $("#completado").html("Has completado el juego en " + ultimotiempoRegistrado + " segundos.");
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
    if (numClicks == 1){ /*Temporitzador*/
        
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
    });
    $("#medio").click(function() {
        empezarJuego(24, 6);
    });
    $("#dificil").click(function() {
        empezarJuego(32, 8);
    });
    $(".novaPartida").click(function(){
        location.reload();
    });
    ventanaWin = $("#finestraWin");
    ventanaLose = $("#finestraLose");
    tiempo = $("#tiempo");
    
});


function puntuacion() {

}

function startIntro() {
    var intro = introJs();
    intro.setOptions({
        steps: [
            {
                element: '#dificultadBtn',
                intro: "Seleccione un nivel de dificultad para empezar a jugar. " 
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
                element: '#mc-mute',
                intro: "Si desea activar/desactivar la música general, presione este botón inferior. "
            }    

        ],
        nextLabel: 'Siguiente',
        prevLabel: 'Anterior',
        skipLabel: 'Omitir',
        doneLabel: 'Hecho',
        exitOnOverlayClick: false
    });
    intro.start();


}

