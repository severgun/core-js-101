/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class Builder {
  constructor() {
    this.elem = '';
    this.idTag = '';
    this.classes = [];
    this.attributes = [];
    this.pseudoClasses = [];
    this.pseudoElem = '';
    this.order = [];
  }

  isAlreadyDefined(selectorType, value) {
    switch (selectorType) {
      case 'element':
        return this.elem !== '';
      case 'id':
        return this.idTag !== '';
      case 'class':
        return this.classes.includes(value);
      case 'attr':
        return this.attributes.includes(value);
      case 'pseudoClass':
        return this.pseudoClasses.includes(value);
      case 'pseudoElement':
        return this.pseudoElem !== '';

      default:
        return false;
    }
  }

  checkOrder() {
    return this.order.reduce((res, val) => {
      if (val >= res) {
        return val;
      }
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }, 0);
  }

  stringify() {
    return Object.entries(this).reduce((res, el) => {
      if (el[1].length > 0 && el[0] !== 'order') {
        res.push(el[1]);
      }
      return res;
    }, []).flat().join('');
  }

  element(value) {
    if (this.isAlreadyDefined('element')) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.elem = value;
    this.order.push(1);
    this.checkOrder();
    return this;
  }

  id(value) {
    if (this.isAlreadyDefined('id')) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.idTag = `#${value}`;
    this.order.push(2);
    this.checkOrder();
    return this;
  }

  class(value) {
    this.classes.push(`.${value}`);
    this.order.push(3);
    this.checkOrder();
    return this;
  }

  attr(value) {
    this.attributes.push(`[${value}]`);
    this.order.push(4);
    this.checkOrder();
    return this;
  }

  pseudoClass(value) {
    this.pseudoClasses.push(`:${value}`);
    this.order.push(5);
    this.checkOrder();
    return this;
  }

  pseudoElement(value) {
    if (this.isAlreadyDefined('pseudoElement')) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.pseudoElem = `::${value}`;
    this.order.push(6);
    this.checkOrder();
    return this;
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new Builder().element(value);
  },

  id(value) {
    return new Builder().id(value);
  },

  class(value) {
    return new Builder().class(value);
  },

  attr(value) {
    return new Builder().attr(value);
  },

  pseudoClass(value) {
    return new Builder().pseudoClass(value);
  },

  pseudoElement(value) {
    return new Builder().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return {
      result: `${selector1.stringify()} ${combinator} ${selector2.stringify()}`,
      stringify() {
        return this.result;
      },
    };
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
