void function($){
    var self = {};
    self._timeoutOrientationNotChanged = 0;    
    self._$window = $(window);    
    self._orientationLast = -1;

    self.hasUpsideDownOrientation = function() {
        return !(navigator.userAgent.match(/iPhone/i)) && 
            !(navigator.userAgent.match(/iPod/i));
    };

    self.onOrientationNotChanged = function() {        
        self._$window.trigger('orientationchange');
    };
    
    self.getVectorNormalize = function(vector) {
        var length = Math.sqrt(vector.x*vector.x + vector.y*vector.y + vector.z*vector.z);
        
        vector.x /= length;
        vector.y /= length;
        vector.z /= length;
        
        return vector;
    };

    self.init = function() {
        if(typeof(window.orientation) == 'undefined')
            return;

        self._orientationLast = window.orientation;

        self._$window.bind("devicemotion", function(event) {
            var accelerometerWithoutGravity = self.getVectorNormalize( event.accelerationIncludingGravity );
            var orientationCalculation = -1; 
            
            if( Math.abs(accelerometerWithoutGravity.z) < 0.7 &&
                accelerometerWithoutGravity.x > 0.5 &&
                Math.abs(accelerometerWithoutGravity.y) < 0.4 )
                orientationCalculation = -90;
            else if( Math.abs(accelerometerWithoutGravity.z) < 0.7 &&
                accelerometerWithoutGravity.x < -0.5 &&
                Math.abs(accelerometerWithoutGravity.y) < 0.4 )
                orientationCalculation = 90;
            else if( Math.abs(accelerometerWithoutGravity.z) < 0.7 &&
                accelerometerWithoutGravity.y > 0.5 &&
                Math.abs(accelerometerWithoutGravity.x) < 0.4 )
                orientationCalculation = 180; 
            else if( Math.abs(accelerometerWithoutGravity.z) < 0.7 &&
                accelerometerWithoutGravity.y < -0.5 &&
                Math.abs(accelerometerWithoutGravity.x) < 0.4 )
                orientationCalculation = 0;
            
            if( self._orientationLast != orientationCalculation && 
                orientationCalculation != -1 &&
                (orientationCalculation != 180 || (self.hasUpsideDownOrientation() && orientationCalculation == 180)) ){
                self._orientationLast = orientationCalculation;
                
                
                self._$window.trigger('beforeorientationchange');
                
                clearTimeout(self._timeoutOrientationNotChanged);
                self._timeoutOrientationNotChanged = setTimeout(self.onOrientationNotChanged, 1000);                
            }
            
        });
         
        self._$window.bind('orientationchange', function(event) {            
            clearTimeout(self._timeoutOrientationNotChanged);           
        });
    };
    
    $(document).ready(function(){
        self.init();       
    });    
}( $ );