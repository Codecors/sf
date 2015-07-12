'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var instance = null;

var SideNav = (function () {
  function SideNav(Hammer, Velocity, options) {
    _classCallCheck(this, SideNav);

    this.Hammer = Hammer;
    this.Velocity = Velocity;
    this.options = _Object$assign({
      menuWidth: 240,
      zIndex: 999,
      dragZIndex: 998,
      overlayZIndex: 997
    }, options);

    this.panning = false;
    this.showing = false;

    this._init();
  }

  _createClass(SideNav, [{
    key: '_getSideNav',
    value: function _getSideNav() {
      return document.getElementById('side-nav');
    }
  }, {
    key: '_getSideNavDrag',
    value: function _getSideNavDrag() {
      return document.getElementById('side-nav-drag');
    }
  }, {
    key: '_getSideNavOverlay',
    value: function _getSideNavOverlay() {
      return document.getElementById('side-nav-overlay');
    }
  }, {
    key: '_setSideNavStyles',
    value: function _setSideNavStyles() {
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
      sn.style.zIndex = this.options.zIndex;
    }
  }, {
    key: '_setSideNavDragStyles',
    value: function _setSideNavDragStyles() {
      var snd = this._getSideNavDrag();

      snd.style.height = '100%';
      snd.style.left = '0';
      snd.style.position = 'fixed';
      snd.style.top = '0';
      snd.style.width = '10px';
      snd.style.zIndex = this.options.dragZIndex;
    }
  }, {
    key: '_setSideNavOverlayStyles',
    value: function _setSideNavOverlayStyles() {
      var sno = this._getSideNavOverlay();

      sno.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      sno.style.height = '100%';
      sno.style.left = '0';
      sno.style.opacity = '0';
      sno.style.position = 'fixed';
      sno.style.right = '0';
      sno.style.top = '0';
      sno.style.willChange = 'opacity';
      sno.style.zIndex = this.options.overlayZIndex;
    }
  }, {
    key: '_appendDrag',
    value: function _appendDrag() {
      var _this = this;

      var drag = document.createElement('div');
      drag.id = 'side-nav-drag';
      drag.addEventListener('click', function () {
        _this.hide();
      });
      document.body.appendChild(drag);

      this._setSideNavDragStyles();
    }
  }, {
    key: '_appendOverlay',
    value: function _appendOverlay() {
      var _this2 = this;

      var overlay = document.createElement('div');
      overlay.id = 'side-nav-overlay';
      overlay.addEventListener('click', function () {
        _this2.hide();
      });
      document.body.appendChild(overlay);

      this._setSideNavOverlayStyles();
    }
  }, {
    key: '_enableScrolling',
    value: function _enableScrolling() {
      document.body.style.overflow = '';
    }
  }, {
    key: '_disableScrolling',
    value: function _disableScrolling() {
      document.body.style.overflow = 'hidden';
    }
  }, {
    key: '_onShow',
    value: function _onShow() {
      var sn = this._getSideNav();
      var snd = this._getSideNavDrag();
      var sno = this._getSideNavOverlay();

      this.showing = true;
      this.panning = false;

      this.Velocity(sn, { left: 0 }, { duration: 300, queue: false, easing: 'easeOutQuad' });
      this.Velocity(sno, { opacity: 1 }, { duration: 300, queue: false, easing: 'easeOutQuad' });

      snd.style.width = '50%';
      snd.style.right = '0';
      snd.style.left = '';
    }
  }, {
    key: '_onHide',
    value: function _onHide() {
      var sn = this._getSideNav();
      var snd = this._getSideNavDrag();
      var sno = this._getSideNavOverlay();

      this.showing = false;
      this.panning = false;

      this._enableScrolling();

      this.Velocity(sn, { left: -1 * (this.options.menuWidth + 10) }, { duration: 200, queue: false, easing: 'easeOutQuad' });
      this.Velocity(sno, { opacity: 0 }, { duration: 200, queue: false, easing: 'easeOutQuad', complete: function complete() {
          sno.parentNode.removeChild(sno);
        } });

      snd.style.width = '10px';
      snd.style.right = '';
      snd.style.left = '0';
    }
  }, {
    key: '_initHammer',
    value: function _initHammer() {
      var _this3 = this;

      var sn = this._getSideNav();
      var snd = this._getSideNavDrag();
      var sno = this._getSideNavOverlay();

      var hammer = new this.Hammer(snd);

      hammer.on('pan', function (ev) {
        if (ev.pointerType !== 'touch') {
          return;
        }

        var direction = ev.direction;
        var x = ev.center.x;
        var y = ev.center.y;
        var velocityX = ev.velocityX;

        _this3.panning = true;

        _this3._disableScrolling();

        if (!_this3._getSideNavOverlay()) {
          _this3._appendOverlay();
          sno = _this3._getSideNavOverlay();
        }

        // Keep within boundaries
        if (x > _this3.options.menuWidth) {
          x = _this3.options.menuWidth;
        } else if (x < 0) {
          x = 0;
        }

        if (x < _this3.options.menuWidth / 2) {
          // Left Direction
          _this3.showing = false;
        } else if (x >= _this3.options.menuWidth / 2) {
          // Right Direction
          _this3.showing = true;
        }

        _this3.Velocity(sno, { opacity: x / _this3.options.menuWidth }, { duration: 50, queue: false, easing: 'easeOutQuad' });

        sn.style.left = x - _this3.options.menuWidth + 'px';
      });

      hammer.on('panend', function (ev) {
        if (ev.pointerType !== 'touch') {
          return;
        }

        var velocityX = ev.velocityX;

        // If velocityX <= 0.3 then the user is flinging the menu closed
        if (_this3.showing && velocityX <= 0.3 || velocityX < -0.5) {
          _this3._onShow();
        } else {
          _this3._onHide();
        }
      });
    }
  }, {
    key: '_init',
    value: function _init() {
      this._setSideNavStyles();
      this._appendDrag();
      this._initHammer();
    }
  }, {
    key: 'show',
    value: function show() {
      if (this.showing) {
        return;
      }

      this._disableScrolling();
      this._appendOverlay();
      this._onShow();
    }
  }, {
    key: 'hide',
    value: function hide() {
      if (!this.showing) {
        return;
      }

      this._onHide();
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      if (this.showing) {
        this.hide();
      } else {
        this.show();
      }
    }
  }], [{
    key: 'getInstance',
    value: function getInstance(Hammer, Velocity, options) {
      if (!instance) {
        instance = new SideNav(Hammer, Velocity, options);
      }

      return instance;
    }
  }]);

  return SideNav;
})();

exports['default'] = SideNav;
module.exports = exports['default'];
