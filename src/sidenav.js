'use strict';

class SideNav {
  constructor(Hammer, Velocity, options) {
    this.Hammer = Hammer;
    this.Velocity = Velocity;
    this.options = {menuWidth: 240}; // TODO: Extend
    
    this.panning = false;
    this.showing = false;

    this._init();
  }

  _getSideNav() {
    return document.getElementById('side-nav');
  }

  _getSideNavDrag() {
    return document.getElementById('side-nav-drag');
  }

  _getSideNavOverlay() {
    return document.getElementById('side-nav-overlay');
  }

  _setSideNavStyles() {
    var sn = this._getSideNav();

    sn.style.boxSizing = 'border-box';
    sn.style.height = '100%';
    sn.style.left = -1 * (this.options.menuWidth + 10) + 'px';
    sn.style.margin = '0';
    sn.style.overflowY = 'auto';
    sn.style.position = 'fixed';
    sn.style.top = '0';
    sn.style.width = this.options.menuWidth + 'px';
    sn.style.willChange = 'left';
    sn.style.zIndex = '999';
  }

  _setSideNavDragStyles() {
    var snd = this._getSideNavDrag();

    snd.style.height = '100%';
    snd.style.left = '0';
    snd.style.position = 'fixed';
    snd.style.top = '0';
    snd.style.width = '10px';
    snd.style.zIndex = '998';
  }

  _setSideNavOverlayStyles() {
    var sno = this._getSideNavOverlay();

    sno.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
    sno.style.height = '100%';
    sno.style.left = '0';
    sno.style.opacity = '0';
    sno.style.position = 'fixed';
    sno.style.right = '0';
    sno.style.top = '0';
    sno.style.willChange = 'opacity';
    sno.style.zIndex = '997';
  }

  _appendDrag() {
    var drag = document.createElement('div');
    drag.id = 'side-nav-drag';
    drag.addEventListener('click', () => {
      this.hide();
    });
    document.body.appendChild(drag);

    this._setSideNavDragStyles();
  }

  _appendOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'side-nav-overlay';
    overlay.addEventListener('click', () => {
      this.hide();
    });
    document.body.appendChild(overlay);

    this._setSideNavOverlayStyles();
  }

  _enableScrolling() {
    document.body.style.overflow = '';
  }

  _disableScrolling() {
    document.body.style.overflow = 'hidden';
  }

  _onShow() {
    var sn = this._getSideNav();
    var snd = this._getSideNavDrag();
    var sno = this._getSideNavOverlay();

    this.showing = true;
    this.panning = false;

    this.Velocity(sn, {left: 0}, {duration: 300, queue: false, easing: 'easeOutQuad'});
    this.Velocity(sno, {opacity: 1}, {duration: 300, queue: false, easing: 'easeOutQuad'});

    snd.style.width = '50%';
    snd.style.right = '0';
    snd.style.left = '';
  }

  _onHide() {
    var sn = this._getSideNav();
    var snd = this._getSideNavDrag();
    var sno = this._getSideNavOverlay();

    this.showing = false;
    this.panning = false;

    this._enableScrolling();

    this.Velocity(sn, {left: -1 * (this.options.menuWidth + 10)}, {duration: 200, queue: false, easing: 'easeOutQuad'});
    this.Velocity(sno, {opacity: 0}, {duration: 200, queue: false, easing: 'easeOutQuad', complete: () => {
      sno.parentNode.removeChild(sno);
    }});

    snd.style.width = '10px';
    snd.style.right = '';
    snd.style.left = '0';
  }

  _initHammer() {
    var sn = this._getSideNav();
    var snd = this._getSideNavDrag();
    var sno = this._getSideNavOverlay();

    var hammer = new this.Hammer(snd);
    
    hammer.on('pan', (ev) => {
      if (ev.pointerType !== 'touch') {
        return;
      }

      var direction = ev.direction;
      var x = ev.center.x;
      var y = ev.center.y;
      var velocityX = ev.velocityX;

      this.panning = true;

      this._disableScrolling();

      if (!this._getSideNavOverlay()) {
        this._appendOverlay();
        sno = this._getSideNavOverlay();
      }

      // Keep within boundaries
      if (x > this.options.menuWidth) {
        x = this.options.menuWidth;
      } else if (x < 0) {
        x = 0;
      }

      if (x < (this.options.menuWidth / 2)) { // Left Direction
        this.showing = false;
      } else if (x >= (this.options.menuWidth / 2)) { // Right Direction
        this.showing = true;
      }

      this.Velocity(sno, {opacity: x / this.options.menuWidth}, {duration: 50, queue: false, easing: 'easeOutQuad'});

      sn.style.left = (x - this.options.menuWidth) + 'px';
    });

    hammer.on('panend', (ev) => {
      if (ev.pointerType !== 'touch') {
        return;
      }

      var velocityX = ev.velocityX;

      // If velocityX <= 0.3 then the user is flinging the menu closed
      if ((this.showing && velocityX <= 0.3) || (velocityX < -0.5)) {
        this._onShow();
      } else {
        this._onHide();
      }
    });
  }

  _init() {
    this._setSideNavStyles();
    this._appendDrag();
    this._initHammer();
  }

  show() {
    if (this.showing) {
      return;
    }

    this._disableScrolling();
    this._appendOverlay();
    this._onShow();
  }

  hide() {
    if (!this.showing) {
      return;
    }

    this._onHide();
  }
}

export default SideNav;
