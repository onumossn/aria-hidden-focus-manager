(function(document) {
  var ARIA_HIDDEN_SELECTOR = '[aria-hidden="true"]';
  var VALID_TABBABLE_SELECTOR = [ 'button', 'input', 'textarea', 'select', '[tabindex]', 'a[href]' ]
    .map(function(selector) {
      return '*:not(' + ARIA_HIDDEN_SELECTOR + ') ' + 
        selector + ':not(' + ARIA_HIDDEN_SELECTOR + ')' + ':not([tabindex="-1"])';
    });
  var prevFocus;
  var resetTimeoutId;

  function firstParentSelector(el, condFn) {
    while (el !== document && !condFn(el)) {
      el = el.parentNode;
    }
    return el === document ? null : el;
  }

  function binarySearch(list, cmpFn) {
    var li = 0;
    var ri = list.length - 1;
    var i;
    var cmpResult;

    do {
      if (cmpResult === 1) {
        li = i + 1;
      } else if(cmpResult === -1) {
        ri = i;
      }

      i = Math.floor(0.5 * (ri + li));
      cmpResult = cmpFn(list[i]);
    } while (cmpResult !== 0 && ri - li !== 0);

    return i;
  }

  function nodeRelativePositionComparator(left, right) {
    var result = left.compareDocumentPosition(right);

    if (result & (Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINS)) {
      return -1;
    } else if(result & (Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINED_BY)) {
      return 1;
    }

    return 0;
  }

  document.addEventListener('blur', function(e) {
    if (resetTimeoutId) {
      clearTimeout(resetTimeoutId);
    }

    prevFocus = e.target;

    resetTimeoutId = setTimeout(function() {
      prevFocus = null;
    }, 100);
  }, true);

  document.addEventListener('focus', function(e) {
    var target = e.target;
    var localPrevFocus = prevFocus;
    var hiddenExists = !!document.querySelector(ARIA_HIDDEN_SELECTOR);
    var isHidden;
    var shouldFocus;
    var validFoci;
    var relativeShouldFocusPosition;
    var direction;
    var i;

    if (hiddenExists) {
      isHidden = !!firstParentSelector(target, function(el) {
        return el.getAttribute('aria-hidden') === 'true';
      });

      if (isHidden) {
        validFoci = document.querySelectorAll(VALID_TABBABLE_SELECTOR);

        i = binarySearch(validFoci, function(left) {
          return nodeRelativePositionComparator(left, target);
        });

        relativeShouldFocusPosition = nodeRelativePositionComparator(target, validFoci[i]);

        if (localPrevFocus) {
          direction = nodeRelativePositionComparator(localPrevFocus, target);

          if (direction === -1 && relativeShouldFocusPosition === 1) {
            i = i === 0 ? validFoci.length - 1 : i - 1;
          } else if (direction === 1 && relativeShouldFocusPosition === -1) {
            i = i === validFoci.length - 1 ? 0 : i + 1;
          }

        } else if(relativeShouldFocusPosition === -1) {
          i = i === validFoci.length - 1 ? 0 : i + 1;
        }

        shouldFocus = validFoci[i];

        if (shouldFocus) {
          shouldFocus.focus();
        }
      }
    }
  }, true);
})(document);
