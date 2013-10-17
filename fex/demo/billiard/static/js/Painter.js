function Painter ( scale ) {
    var scale = scale;


	this.drawWorld = function ( ctx, billiard ) {
        var i, ball, x, y, r;

        ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );

        i = 0; 
        r = billiard.BALL_RADIUS;
        while( ball = billiard.balls[i] ) {
            if(!ball.visible && ++i) continue;
            drawBall( ctx, ball, r );            
            ++i;
        }
	}

    function drawBall( ctx, ball, r ) {

        ctx.save();
        ctx.scale(scale, scale);
        x = ball.s.x;
        y = ball.s.y;

        fillCircle( ctx, x, y, r, ball.c );

        if (ball.index < 8) {
            fillCircle( ctx, x, y, r * 0.55, 'white' );
        } 

        fillCircle( ctx, x, y, r, getShadowOverlay( ctx, x, y, r ) );
        fillCircle( ctx, x, y, r, getHilightOverlay( ctx, x, y, r ) );

        ctx.restore();

        if( ball.index > 0 ) {
            ctx.font = '12px Arial'
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'black';
            ctx.fillText( ball.index.toString(), x * scale, y * scale );
        }
    }

    function fillCircle( ctx, x, y, r, style ) {
        ctx.fillStyle = style;
        ctx.beginPath();
        ctx.arc( x, y, r , 0, Math.PI * 2 );
        ctx.fill();
    }
    function getShadowOverlay( ctx, x, y, r ) {
        var ballOverlay = ctx.createRadialGradient( x, y, r * 0.1, x, y, r );
        ballOverlay.addColorStop(0, 'rgba(0,0,0,.1)');
        ballOverlay.addColorStop(1, 'rgba(0,0,0,.6)');
        return ballOverlay;
    }    
    function getHilightOverlay( ctx, x, y, r ) {
        var ballOverlay = ctx.createRadialGradient( x - r * 0.4, y - r * 0.4, r * 0.2, x, y, r );
        ballOverlay.addColorStop(0, 'rgba(255,255,255,.5)');
        ballOverlay.addColorStop(1, 'rgba(255,255,255,.0)');
        return ballOverlay;
    }


	this.drawTable = function( ctx, w, h, a, b, d, fw, fh ) {
        var PI = Math.PI,
            RC = PI / 2,
            r = (d / 2) * Math.sqrt(2);

        ctx.scale( scale, scale );

        // Outer edge
        ctx.fillStyle = 'rgb(90, 47, 22)';
        drawRoundedRectangle(ctx, 0, 0, fw, fh, a);
        ctx.fill();

        // Inner edge
        ctx.fillStyle = 'darkgreen';
        drawRoundedRectangle(ctx, a, a, fw - a * 2, fh - a * 2, b);
        ctx.fill();

        // Table Body
        ctx.fillStyle = 'green';
        ctx.fillRect(a + b, a + b, fw-a-a-b-b, fh-a-a-b-b);

        // Holes
        drawCornerHole();
        drawCornerHole([fw, 0], RC);
        drawCornerHole([fw, fh], PI);
        drawCornerHole([0, fh], PI + RC);
        drawMiddleHole();
        drawMiddleHole([fw, fh], PI);

        function drawCornerHole(translate, rotate) {            
            ctx.save();
            if(translate) ctx.translate.apply(ctx, translate);
            if(rotate) ctx.rotate(rotate);

            ctx.beginPath();
            ctx.moveTo(a + b, a);
            ctx.lineTo(a + d, a);
            ctx.lineTo(a + b + d, a + b);
            ctx.lineTo(a + b, a + b + d);
            ctx.lineTo(a, a + d);
            ctx.arcTo(a, a, a + b, a, b);
            ctx.closePath();
            ctx.fillStyle = 'green';
            ctx.fill();

            var holeColor = ctx.createRadialGradient(a + d, a + d, 0, a + b, a + b, r);
            holeColor.addColorStop(0, 'black');
            holeColor.addColorStop(1, '#223322');
            ctx.beginPath();
            ctx.arc(a + b, a + b, r , 0 , PI * 2);
            ctx.fillStyle = holeColor;
            ctx.fill();

            ctx.restore();
        }

        function drawMiddleHole(translate, rotate) {
            ctx.save();
            if(translate) ctx.translate.apply(ctx, translate);
            if(rotate) ctx.rotate(rotate);

            ctx.beginPath();
            ctx.moveTo(fw / 2 - r, a);
            ctx.lineTo(fw / 2 + r, a);
            ctx.lineTo(fw / 2 + r + b / 2, a + b * 2);
            ctx.lineTo(fw /2 - r - b / 2, a + b * 2);
            ctx.lineTo(fw / 2 - r, a );
            ctx.closePath();
            ctx.fillStyle = 'green';
            ctx.fill();
            ctx.beginPath();
            ctx.arc( fw / 2, a, r, 0, PI * 2);
            var holeColor = ctx.createRadialGradient(fw / 2, a + b, 0, fw / 2, a, r);
            holeColor.addColorStop(0, 'black');
            holeColor.addColorStop(1, '#223322');
            ctx.fillStyle = holeColor;
            ctx.fill();

            ctx.restore();
        }
	}

    function drawRoundedRectangle( ctx, x, y, w, h, r ) {
        ctx.save();
        ctx.translate( x, y );
        ctx.beginPath();
        ctx.moveTo( r, 0 );
        ctx.lineTo( w - r, 0);
        ctx.arcTo( w, 0, w, r, r);
        ctx.lineTo( w, h - r );
        ctx.arcTo( w, h, w - r, h, r);
        ctx.lineTo( r, h );
        ctx.arcTo( 0, h, 0, h - r, r);
        ctx.lineTo( 0, r );
        ctx.arcTo(0, 0, r, 0, r);
        ctx.closePath();
        ctx.restore();
    }

    this.drawGuide = function( ctx, billiard, mouseX, mouseY ) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.scale( scale, scale );            
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        ctx.lineWidth = 1 / scale;

        var whiteBall = billiard.balls[0];
        var sw = whiteBall.s;
        var sm = new Vector( mouseX / scale, mouseY / scale );
        var v = Vector.minus( sm, sw );

        ctx.beginPath();
        ctx.arc( sw.x, sw.y, billiard.BALL_RADIUS * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc( sm.x, sm.y, billiard.BALL_RADIUS * 0.2, 0, Math.PI * 2);
        ctx.fill();

        var latestHit;
        if( latestHit = billiard.detectLatestHit( v )) {
            var pw = latestHit.pw,
                vw = latestHit.vw,
                vt = latestHit.vt,
                vwl = vw.length(),
                vtl = vt.length(),
                st = latestHit.ball.s,
                hsw = Vector.add(pw, Vector.normalize(vw, vwl / (vwl + vtl))),
                hst = Vector.add(st, Vector.normalize(vt, vtl / (vwl + vtl)));

            ctx.beginPath();
            ctx.moveTo(sw.x, sw.y); // 白球位置
            ctx.lineTo(pw.x, pw.y); // 白球碰撞位置
            ctx.lineTo(hsw.x, hsw.y); // 白球碰撞后方向所指位置
            ctx.stroke();

            ctx.beginPath();
            ctx.arc( pw.x, pw.y, billiard.BALL_RADIUS * 0.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc( pw.x, pw.y, billiard.BALL_RADIUS, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo( st.x, st.y );
            ctx.lineTo( hst.x, hst.y );
            ctx.stroke();

            ctx.beginPath();
            ctx.arc( st.x, st.y, billiard.BALL_RADIUS * 0.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc( st.x, st.y, billiard.BALL_RADIUS, 0, Math.PI * 2);
            ctx.stroke();

            if(Vector.dot(Vector.minus(pw, sw), Vector.minus(sm, pw)) > 0) {
                ctx.beginPath();
                drawDashed(ctx, pw.x, pw.y, sm.x, sm.y);
                ctx.stroke();
            }
        } else {
            ctx.beginPath();
            drawDashed(ctx, sw.x, sw.y, sm.x, sm.y);
            ctx.stroke();
        }
        ctx.restore();
        drawPower( ctx, Vector.multipy(whiteBall.s, scale), new Vector(mouseX, mouseY) );
    }

    function drawPower( ctx, from, to ) {
        ctx.save();
        ctx.font = "12px Arial";
        ctx.fillStyle = "White";
        var mid = Vector.multipy( Vector.add(from, to), 0.5 ),
            text = "Power: " + Vector.minus(from, to).length().toFixed(2)
            rect = ctx.measureText( text ),
            x = mid.x - rect.width / 2,
            y = mid.y + 5,
            w = rect.width,
            h = 20;
        ctx.clearRect(x - 5, y - 12, w + 10, h);
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    function drawDashed(ctx, sx, sy, ex, ey, stepLength) {
        var stepLength = stepLength || 5 / scale;
        var s = new Vector( ex - sx, ey - sy);
        var step = Vector.normalize( s, stepLength );
        var nx, ny;
        var current = new Vector( sx, sy );
        var count = Math.floor( s.length() / stepLength );
        ctx.moveTo(sx, sy);
        while(count--) {
            count % 2 ? ctx.moveTo( current.x, current.y ) : ctx.lineTo( current.x, current.y);
            current = Vector.add( current, step );
        }
    }
}