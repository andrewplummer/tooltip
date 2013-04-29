(function($) {

  var tooltip;
  var arrow;
  var arrowWidth;
  var arrowHeight;
  var content;
  var win;

  function getInverseDirection(dir) {
    switch(dir) {
      case 'top':    return 'bottom';
      case 'bottom': return 'top';
      case 'left':   return 'right';
      case 'right':  return 'left';
    }
  }

  function unescapeHTML(html) {
    if(/&/.test(html)) {
      html = $('<p/>').html(html).text();
    }
    return html;
  }

  function getDefault(name, options, el, defaultValue) {
    return alternate(options[name], el.data('tooltip-'+name), defaultValue);
  }

  function alternate() {
    for(var i = 0; i < arguments.length; i++) {
      if(arguments[i] !== undefined) {
        return arguments[i];
      }
    }
  }

  jQuery.fn.tooltip = function(options) {
    options = options || {};
    this.each(function() {
      var el, title, timer, delay, margin;
      var elementDimensions, tooltipDimensions;

      el = $(this);
      delay  = getDefault('delay', options, el, 300);
      margin = getDefault('margin', options, el, 20);

      function getTitle() {
        title = el.attr('title') || title;
        el.removeAttr('title');
      }

      function setContent() {
        var html;
        getTitle();
        try {
          var source = $(title);
        } catch(e) {
          // May throw a malfolmed selector error
        }
        if(source && source.length > 0) {
          html = source.html();
        } else {
          html = unescapeHTML(title);
        }
        content.html(html);
      }

      function setElementDimensions() {
        var d = {};
        var elementHeight = el.outerHeight();
        var elementWidth  = el.outerWidth();
        var offset        = el.offset();
        d.top     = offset.top;
        d.left    = offset.left;
        d.right   = d.left + elementWidth;
        d.bottom  = d.top  + elementHeight;
        d.hCenter = d.left + Math.floor(elementWidth / 2);
        d.vCenter = d.top  + Math.floor(elementHeight / 2);
        elementDimensions = d;
      }

      function setTooltipDimensions() {
        var d = {};
        // Reset tooltip to the top left so the dimensions aren't impacted.
        tooltip.css({ left: 0, top: 0 });
        d.width  = tooltip.outerWidth(true);
        d.height = tooltip.outerHeight(true);
        tooltipDimensions = d;
      }

      function getTooltipPosition(direction, testBounds) {
        var pos = {}, protrusion;
        switch(direction) {
          case 'top':
            pos.top    = elementDimensions.top - tooltipDimensions.height - margin;
            pos.left   = getCenterAlignedOffset(pos, true);
            protrusion = getProtrusion(pos.top, direction);
            break;
          case 'right':
            pos.top    = getCenterAlignedOffset(pos, false);
            pos.left   = elementDimensions.right + margin;
            protrusion = getProtrusion(pos.left, direction);
            break;
          case 'bottom':
            pos.top    = elementDimensions.bottom + margin;
            pos.left   = getCenterAlignedOffset(pos, true);
            protrusion = getProtrusion(pos.top, direction);
            break;
          case 'left':
            pos.top    = getCenterAlignedOffset(pos, false);
            pos.left   = elementDimensions.left - tooltipDimensions.width - margin;
            protrusion = getProtrusion(pos.top, direction);
            break;
        }
        if(testBounds && protrusion > 0) {
          pos = getTooltipPosition(getInverseDirection(direction));
        } else {
          pos.direction = direction;
        }
        return pos;
      }

      function getProtrusion(px, dir) {
        switch(dir) {
          case 'top':
            px = -px + win.scrollTop();
            break;
          case 'right':
            px = px + tooltipDimensions.width + margin - win.scrollLeft() - win.width();
            break;
          case 'bottom':
            px = px + tooltipDimensions.height - win.scrollTop() - win.height();
            break;
          case 'left':
            px = -px + margin + win.scrollLeft();
            break;
        }
        return Math.max(0, px);
      }

      function getCenterAlignedOffset(pos, horizontal) {
        var px, offset = 0;
        if(horizontal) {
          px = elementDimensions.hCenter + (-tooltipDimensions.width / 2);
          offset += getProtrusion(px, 'left');
          offset -= getProtrusion(px, 'right');
        } else {
          px = elementDimensions.vCenter + (-tooltipDimensions.height / 2);
          offset += getProtrusion(px, 'top');
          offset -= getProtrusion(px, 'bottom');
        }
        pos.offset = offset;
        return px + offset;
      }

      function setArrowPosition(pos) {
        var css = {}, dir = pos.direction;
        if(dir == 'left' || dir == 'right') {
          css.top = Math.floor((tooltipDimensions.height / 2) - (arrowHeight / 2));
          css.top -= pos.offset;
        } else {
          css.left = Math.floor((tooltipDimensions.width / 2) - (arrowWidth / 2));
          css.left -= pos.offset;
        }
        css[getInverseDirection(dir)] = 0;
        arrow.attr('style', '').css(css);
      }

      el.mouseenter(function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
          var direction = getDefault('direction', options, el, 'top'), pos;
          var classes   = getDefault('class', options, el, '');
          setContent();
          setElementDimensions();
          setTooltipDimensions();
          pos = getTooltipPosition(direction, true);
          setArrowPosition(pos);
          tooltip.css(pos).attr('class', classes + ' in ' + pos.direction);
        }, delay);
      });
      el.mouseleave(function() {
        clearTimeout(timer);
        tooltip.removeClass('in');
      });
    });
  };

  $(document).ready(function() {
    tooltip = $('<div id="tooltip" />').appendTo(document.body);
    arrow   = $('<div class="arrow" />').appendTo(tooltip);
    content = $('<div class="content" />').appendTo(tooltip);
    win     = $(window);
    arrowWidth  = arrow.width();
    arrowHeight = arrow.height();
  });

})(jQuery);
