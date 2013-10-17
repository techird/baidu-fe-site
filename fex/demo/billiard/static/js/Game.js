/**
 * @require Animator.js
 * @require Layer.js
 * @require Billiard.js
 */

function Game() {
    var billiard;
    var scale;
    var width, height;

    var billiardLayer, interactLayer, tableLayer;

    var billiardSpirit, interactSpirit;

    var mouseX, mouseY;

    var painter;

    var playerCurrent, playerForSmall;

    var roundfirsthit;

    function onmousemove( e ) {
        mouseX = e.layerX;
        mouseY = e.layerY;
        if( billiard.getStatus() == 'STATIC' ) renderGuide();
    }

    function onmousedown( e ) {
        var mouseVector = new Vector( e.layerX, e.layerY );
        var ballVector = Vector.multipy( billiard.balls[0].s, scale );
        if(billiard.getStatus() == 'STATIC') {
            var speed = Vector.minus( mouseVector, ballVector );
            hit( speed );
            interactLayer.ctx.clearRect(0, 0, width, height);
        }
    }

    function hit( speed ) {
        roundfirsthit = undefined;
        billiard.hit( Vector.multipy( speed, 3.5 / scale) );
        billiardSpirit.playScene("world");
    }

    function onenterball( e ) {

    }

    function onhitball( balla, ballb ) {
        if (!roundfirsthit && balla.index == 0) {
            if(!playerForSmall) {
                playerForSmall = ballb.index < 8 ? playerCurrent : playerOther();
            } else {
                if ( playerForSmall == playerCurrent && ballb.index > 0 ) {
                    wrongball();
                }
            }
        }
    }

    function playerOther() {
        return playerCurrent == 1 ? 2 : 1;
    }

    function wrongball() {
        console.log("Player" + playerCurrent + ": wrongball");
        breakrule();
    }

    function breakrule() {

    }

    function renderTable( ) {
        var w = billiard.TABLE_WIDTH,
            h = billiard.TABLE_HEIGHT,
            a = billiard.TABLE_OUTER_THICKNESS,
            b = billiard.TABLE_INNER_THICKNESS,
            d = billiard.BALL_DIAMETER,
            fw = w + ( a + b ) * 2,
            fh = h + ( a + b ) * 2,

        tableLayer = new Layer(fw * scale, fh * scale, 0);
        painter.drawTable( tableLayer.ctx, w, h, a, b, d, fw, fh );
    }

    function renderWorld() {
        painter.drawWorld( billiardLayer.ctx, billiard );
    }

    function renderGuide() {
        painter.drawGuide( interactLayer.ctx, billiard, mouseX, mouseY );
    }

    function start() {
        renderTable();
        renderWorld();
    }
    function buildBilliardSpirit() {
        billiardSpirit = new Spirit();
        billiardSpirit.addScene("world", function( info ){
            billiard.go( info.lastFrameLength );
            renderWorld();
            return billiard.getStatus() == "DYNAMIC";
        });
    }
    function buildInteractSpirit() {
        interactSpirit = new Spirit();
        interactSpirit.addScene("enterball", function( info, ball ) {
            var ctx = interactLayer.ctx;
            ctx.save();
            ctx.fontStyle = ""

            ctx.restore();
        }, 1000);
    }
    function init() {
        scale = 300;

        billiard = new Billiard();
        painter = new Painter( scale );

        billiard.on('enterball', onenterball);
        billiard.on('hitball', onhitball);

        buildBilliardSpirit();

        width = billiard.TABLE_WIDTH * scale;
        height = billiard.TABLE_HEIGHT * scale;

        billiardLayer = new Layer( width, height, 1 );
        interactLayer = new Layer( width, height, 2 );

        interactLayer.canvas.addEventListener('mousemove', onmousemove);
        interactLayer.canvas.addEventListener('mousedown', onmousedown);
        
        playerCurrent = 1;
    }
    init();
    this.start = start;
}

var game = new Game();
game.start();