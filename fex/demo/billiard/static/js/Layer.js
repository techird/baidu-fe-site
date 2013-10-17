function Layer(width, height, zIndex) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style['position'] = 'absolute';
    this.canvas.style['zIndex'] = zIndex;
    this.canvas.style['left'] = '50%';
    this.canvas.style['top'] = '50%';
    this.canvas.style['margin-left'] = -width / 2 + 'px';
    this.canvas.style['margin-top'] = -height / 2 + 'px';
    document.body.appendChild(this.canvas);
}
