function Billiard() {
    Event.apply(this);

    var me = this;

    var TABLE_WIDTH = this.TABLE_WIDTH = 2.88
      , TABLE_HEIGHT = this.TABLE_HEIGHT = 1.60
      , BALL_RADIUS = this.BALL_RADIUS = 0.042
      , BALL_DIAMETER = this.BALL_DIAMETER = BALL_RADIUS * 2
      , TABLE_INNER_THICKNESS = this.TABLE_INNER_THICKNESS = BALL_RADIUS
      , TABLE_OUTER_THICKNESS = this.TABLE_OUTER_THICKNESS = BALL_DIAMETER
      , BALL_COUNT = 16
      , BALL_COLORS = [
            'white',    // 0
            'yellow',   // 1
            'blue',     // 2
            'red',      // 3
            'purple',   // 4
            'orange',   // 5
            'darkgreen',// 6
            'brown',    // 7
            'black',    // 8
            'yellow',   // 9
            'blue',     // 10
            'red',      // 11
            'purple',   // 12
            'orange',   // 13
            'darkgreen',// 14
            'brown']    // 15
      , FRICTION_ACCELERATION = 0.2
      , ZERO = 0.0005
      , BALL_HIT_LOSE = 0.1
      , WALL_HIT_LOSE = 0.46;
    
    var balls = [], dynamicBalls = new Set();

    function layoutOnStart() {
        var classified = {
              '-1': [1, 2, 3, 4, 5, 6, 7],
               '0': [8],
               '1': [9, 10, 11, 12, 13, 14, 15]
            }
          , queue

          , triangle = [ [-1],
                        [1,-1], 
                       [-1,0,1],
                     [1,-1,1,-1],
                    [-1,1,1,-1,1]] // large numbers is seperated with small numbers

          , row, type, index, back

          , nextRowVector = new Vector( Math.sqrt(3) * BALL_RADIUS, -BALL_RADIUS )
          , nextElemVector = new Vector( 0, BALL_DIAMETER )
          , currentPos = new Vector( 0.75 * TABLE_WIDTH, 0.5 * TABLE_HEIGHT );

        balls[0].s = new Vector( 0.25 * TABLE_WIDTH, 0.5 * TABLE_HEIGHT );
        back = 1;
        while( row = triangle.shift() ) {
            while( (type = row.shift()) !== undefined ) {
                queue = classified[type];
                index = Math.floor(Math.random() * queue.length);
                index = queue.splice( index, 1 )[0];
                balls[index].s = currentPos;
                currentPos = Vector.add( currentPos, nextElemVector );
            }
            currentPos = Vector.add( currentPos, new Vector( 0, -BALL_DIAMETER * back++) );
            currentPos = Vector.add( currentPos, nextRowVector );
        }
    }

    function detectCollision() {
        var i, j, a, b, n, detected;
        for(i = 0; i < balls.length; i++) {
            a = balls[i]; 
            for(j = i + 1; j < balls.length ; j++) {
                b = balls[j];
                if( detectTwo( a, b ) ) {
                    dynamicBalls.add(a);
                    dynamicBalls.add(b);
                    me.fire('hitball', [a, b]);
                }
            }
        }
    }

    function detectTwo( a, b ) {
        if( a.v.length() <= ZERO && b.v.length() <= ZERO ) return false;
        if( !a.visible || !b.visible ) return false;

        // a connect from a to b
        var connect = Vector.minus( b.s, a.s );

        // v projection on the connect
        var avc = Vector.projection( a.v, connect ),
            bvc = Vector.projection( b.v, connect );

        // v delta on the connect
        var dvc = Vector.minus( avc, bvc );

        // should check the dcv same direction with the connect
        // and the two ball is close enougth
        if( Vector.dot(dvc, connect) > 0
            && connect.length() - BALL_DIAMETER <= ZERO ) {

            var normal = Vector.verticalVector( connect );

            var avn = Vector.projection( a.v, normal ),
                bvn = Vector.projection( b.v, normal );

            // 连线方向速度交换，垂直方向速度不变
            var factor = 1 - BALL_HIT_LOSE;
            a.v = Vector.multipy( Vector.add( avn , bvc ), factor);
            b.v = Vector.multipy( Vector.add( bvn , avc ), factor);

            // console.log('detected collision: ', a.index, b.index);
            return true;
        }
        return false;
    }

    function detectWall() {
        var ball, i = 0;
        while( ball = dynamicBalls[i] ) {
            var x = ball.s.x,
                y = ball.s.y,
                va = Vector.multipy( ball.v, (1 - WALL_HIT_LOSE) )
                vx = va.x,
                vy = va.y;
            if( x < BALL_RADIUS && vx < 0 || x > TABLE_WIDTH - BALL_RADIUS && vx > 0 ) {
                if( y < BALL_DIAMETER || y > TABLE_HEIGHT - BALL_DIAMETER ) {
                    ball.visible = false;
                    dynamicBalls.remove(ball);
                    me.fire('enterball', [ball]);
                } else {
                    ball.v = new Vector( -vx, vy);
                }
            }
            if( y < BALL_RADIUS && vy < 0 || y > TABLE_HEIGHT - BALL_RADIUS && vy > 0 ) {
                if( x < BALL_DIAMETER || x > TABLE_WIDTH - BALL_DIAMETER || Math.abs(x - TABLE_WIDTH / 2) < BALL_RADIUS ) {
                    ball.visible = false;
                    dynamicBalls.remove(ball);
                    me.fire('enterball', [ball]);
                } else {
                    ball.v = new Vector( vx , -vy  );
                }
            }
            ++i;
        }
    }

    function detectLatestHit( v ) {
        var latestHit, hit, i;
        for(i = 1; i < balls.length; i++) {
            if( !balls[i].visible ) continue;
            hit = detectHitTo( balls[i], v );
            if(!latestHit || hit.t < latestHit.t) {
                latestHit = hit;
            }
        }
        return latestHit;
    }

    /**
     * 检测白球到一个静止的球的碰撞轨迹，不碰撞返回false，碰撞返回：
     * {
     *     pw: Vector, // 碰撞时白球的位置
     *     vw: Vector, // 碰撞后白球的速度,
     *     vt: Vector, // 碰撞后目标球的速度
     *     t: int      // 碰撞点离白球的距离因子
     * }
     */
    function detectHitTo( targetBall, v ) {
        /**
         * 解法：
         * 白球位置为sw，速度为v；目标球位置为st，速度为0
         * 球的半径为r
         * 设碰撞时白球位置为pw
         * 白球直线运动，则有
         *     pw = sw + t * v    (1)
         * 碰撞时两球位置差距为2r：
         *     | pw - st | = 2 * r      (2)
         * 把 (1) 代入 (2)，两边平方，有：
         *     ( sw - st + t * v ) ^ 2 = 4 * r ^ 2   (3)
         * 记 ds = sw - st，平方展开 （3）
         *     ds ^ 2 + 2 * ds * t * v + t ^ 2 * v ^ 2 = 4 * r ^ 2
         * 整理成关于t的一元二次方程：
         *     (v^2) * t^2 + (2 * ds * v) * t + (ds^2 - 4*r^2) = 0
         * 方程中，令：
         *     a = v ^ 2
         *     b = 2 * ds * v
         *     c = ds ^ 2 - 4 * r ^ 2
         * 先判断有解的条件为：
         *     d = b^2 - 4*a*c > 0
         * 因为 d > 0，t 要取较小值，所以
         *     t = (-b + sqrt(d)) / (2*a)
         */
        var whiteBall = balls[0],
            sw = whiteBall.s, 
            st = targetBall.s,
            ds = Vector.minus( sw, st ),
            r = BALL_RADIUS,
            a = Vector.square(v),
            b = 2 * Vector.dot( ds, v ),
            c = Vector.square(ds) - 4 * r * r,
            d = b * b - 4 * a * c;

        if( d <= 0 ) return false;

        var t = (-b - Math.sqrt(d)) / (2 * a);
        if( t <= 0 ) return false;

        var pw = Vector.add(sw, Vector.multipy( v, t )),
            connect = Vector.minus(st, pw),
            normal = Vector.verticalVector( connect );
        return {
            pw: pw,
            vw: Vector.projection( v, normal ),
            vt: Vector.projection( v, connect ),
            t: t,
            ball: targetBall
        }
    }

    function step() {
        var ball, i = 0, nStatic = 0;
        while( ball = dynamicBalls[i++] ) {
            if(!ball.visible) continue;
            ball.a = Vector.multipy( Vector.normalize( ball.v ), -FRICTION_ACCELERATION);
            ball.v = Vector.add( ball.v, Vector.multipy( ball.a, 1 / 1000 ) );
            ball.s = Vector.add( ball.s, Vector.multipy( ball.v, 1 / 1000 ) );
            if( ball.v.length() <= ZERO ) {
                ball.v = new Vector(0, 0);
                dynamicBalls.remove(ball);
            }
        }
        detectCollision();
        detectWall();
    }

    function go( ms ) {
        while(dynamicBalls.length && ms--) step();
    }

    function hit( speed ) {
        balls[0].v = speed;
        dynamicBalls.add(balls[0]);
    }

    function reset() {
        balls = [];
        for(var i = 0; i < BALL_COUNT; i++) {
            balls.push({
                index: i,
                s: new Vector( 0, 0 ),
                v: new Vector( 0, 0 ),
                a: new Vector( 0, 0 ),
                c: BALL_COLORS[i],
                visible: true
            });
        }
        layoutOnStart();
    }

    reset();
    this.go = go;
    this.balls = balls;
    this.hit = hit;
    this.detectLatestHit = detectLatestHit;
    this.getStatus = function() {
        return dynamicBalls.length > 0 ? 'DYNAMIC' : 'STATIC';
    }
}