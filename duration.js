let Duration = (function() {
    function Duration(element, settings) {
        let _ = this, deepProperties;

        _.consts = {
            /* display */
            DISPLAY_BOTH:     'both',
            DISPLAY_WIDGET:   'widget',
            DISPLAY_POPUP:    'popup',
            DISPLAY_SWITCHER: 'switcher',

            /* output format */
            FORMAT_DECIMAL: 'decimal',
            FORMAT_ISO:     'iso',

            /* switcher states */
            SWITCHER_STATE_FIRST:  'first',
            SWITCHER_STATE_SECOND: 'second',

            /* switcher label assignment */
            SHOWS_ALTERNATIVE: 'alternative',
            SHOWS_CURRENT:     'current'
        }

        _.defaults = {
            cssClass: 'duration-initialized',
            display: _.consts.DISPLAY_BOTH,
            labels: {
                seconds: 'sec',
                minutes: 'min',
                hours  : 'hrs'
            },
            initialValue: {
                seconds: '0',
                minutes: '0',
                hours:   '0'
            },
            leadingZeroes: false,
            outputFormat: _.consts.FORMAT_DECIMAL,
            switcher: {
                labelShows: _.consts.SHOWS_ALTERNATIVE,
                firstLabel: 'Switch to input widget',
                secondLabel: 'Switch to preformatted value input',
                initialState: _.consts.SWITCHER_STATE_FIRST
            }
        }

        if (!settings || !settings instanceof Object) {
            settings = {};
        }

        _.options = {
            ..._.defaults,
            ...settings
        };

        /* deep merge patch */
        deepProperties = ['initialValue', 'labels', 'switcher'];
        for (let property in deepProperties) {
            if (settings.hasOwnProperty(property)) {
                _.options[property] = {
                    ..._.defaults[property],
                    ...settings[property]
                };
            }
        }

        if (_.options.display === _.consts.DISPLAY_SWITCHER && _.options.switcher.labelShows === _.consts.SHOWS_CURRENT ) {
            let tmp = _.options.switcher.firstLabel;
            _.options.switcher.firstLabel = _.options.switcher.secondLabel;
            _.options.switcher.secondLabel = tmp;
        }

        _.container =  undefined;
        _.containerCssClass = 'duration-container';
        _.source    = element instanceof HTMLElement ? element : document.querySelector(element);
        _.switcher = undefined;
        _.switcherState = _.options.display === _.consts.DISPLAY_SWITCHER
            ? _.options.switcher.initialState === _.consts.SWITCHER_STATE_FIRST
                ? _.consts.SWITCHER_STATE_FIRST
                : _.consts.SWITCHER_STATE_SECOND
            : undefined;

        _.init();
    }

    return Duration;
}());

Duration.prototype.buildWidget = function() {
    let _ = this, container, hours, hoursText, hoursInput, minutes, minutesText, minutesInput;

    container = document.createElement('div');
    container.setAttribute('id', _.generateId());
    container.classList.add(_.containerCssClass);

    hours = document.createElement('label');
    hours.setAttribute('data-duration','H');

    hoursText = document.createElement('span');
    hoursText.innerText = _.options.labels['hours'];
    hours.appendChild(hoursText);

    hoursInput = document.createElement('input');
    hoursInput.setAttribute('type', 'number');
    hoursInput.setAttribute('min', '0');
    hoursInput.setAttribute('step', '1');
    hoursInput.value = _.options.initialValue['hours'];
    _.hours = hoursInput;
    hours.appendChild(hoursInput);

    container.appendChild(hours);

    minutes = document.createElement('label');
    minutes.setAttribute('data-duration', 'M');

    minutesText = document.createElement('span');
    minutesText.innerText = _.options.labels['minutes'];
    minutes.appendChild(minutesText);

    minutesInput = document.createElement('input');
    minutesInput.setAttribute('type', 'number');
    minutesInput.setAttribute('min', '0');
    minutesInput.setAttribute('max', '59');
    minutesInput.setAttribute('step', '1');
    minutesInput.value = _.options.initialValue['minutes'];
    _.minutes = minutesInput;
    minutes.appendChild(minutesInput);

    container.appendChild(minutes);

    if (_.source.closest('label')) {
        _.source.closest('label').insertAdjacentElement('afterend', container);
    } else {
        _.source.insertAdjacentElement('afterend', container);
    }

    _.container = container;

    switch (_.options.display) {
        case _.consts.DISPLAY_WIDGET:
            _.source.style.setProperty('display', 'none');
            break;

        case _.consts.DISPLAY_POPUP:
            _.setupPopup();
            break;

        case _.consts.DISPLAY_SWITCHER:
            _.setupSwitcher();
            break;
    }
}

Duration.prototype.destroy = function() {
    let _ = this;

    _.container.parentNode.remove(_.container);
    _.source.classList.remove(_.options.cssClass);
}

Duration.prototype.generateId = function() {
    let id               = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < 10; i++ ) {
        id += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return id;
}

Duration.prototype.handleInput = function(event) {
    let _ = this;

    if (event.target.closest('.' + _.containerCssClass)) {
        _.setSourceValue();
    }
}

Duration.prototype.hidePopup = function() {
    let _ = this;

    _.container.style.setProperty('display', 'none');
}

Duration.prototype.initializeEvents = function() {
    let _ = this;

    document.addEventListener('input', _.handleInput.bind(_));
}

Duration.prototype.setSourceValue = function() {
    let _ = this, value;

    switch(_.options.outputFormat) {
        case _.consts.FORMAT_DECIMAL:
            value = _.hours.value + ',' + Math.floor(_.minutes.value * 100 / 60);
            break;
        case _.consts.FORMAT_ISO:
            value = 'PT';

            if (_.hours.value > 0) {
                value += _.hours.value + 'H';
            }

            if (_.minutes.value > 0) {
                value += _.minutes.value + 'M';
            }

            //value += Math.floor(_.seconds.value) + 'S';
            break;
    }

    _.source.value = value;
}

Duration.prototype.showPopup = function() {
    let _ = this, rect;

    rect = _.source.getBoundingClientRect();

    _.container.style.setProperty('position', 'fixed');
    _.container.style.setProperty('margin', '0');
    _.container.style.setProperty('left', rect.left + 'px');
    _.container.style.setProperty('width', rect.width + 'px');
    _.container.style.setProperty('top', (+rect.top + +rect.height) + 'px');

    _.container.style.removeProperty('display');
}

Duration.prototype.setupPopup = function() {
    let _ = this;

    _.container.style.setProperty('display', 'none');

    _.source.addEventListener('focus', _.showPopup.bind(_));
    window.addEventListener('scroll', _.hidePopup.bind(_));
    window.addEventListener('resize', _.hidePopup.bind(_));
}

Duration.prototype.setupSwitcher = function() {
    let _ = this, switcher;

    switcher = document.createElement('button');
    switcher.setAttribute('type', 'button');
    switcher.classList.add('switcher');
    switcher.classList.add(_.options.switcher.initialState);
    switcher.innerHTML = '<span id="' + _.generateId() +'">' + _.options.switcher.firstLabel + '</span>' +
                         '<span id="' + _.generateId() + '">' + _.options.switcher.secondLabel + '</span>';

    _.switcher = switcher;
    _.source.insertAdjacentElement('beforebegin', switcher);

    if (_.switcherState === 'first') {
        _.switcher.lastElementChild.setAttribute('aria-hidden', 'true');
        _.container.style.setProperty('display', 'none');
    } else {
        _.switcher.firstElementChild.setAttribute('aria-hidden', 'true');
        _.source.style.setProperty('display', 'none');
    }

    switcher.addEventListener('click', function(event) {
       if (_.switcherState === 'first') {
           _.source.style.setProperty('display', 'none');
           _.container.style.removeProperty('display');
           _.switcher.lastElementChild.removeAttribute('aria-hidden');
           _.switcher.firstElementChild.setAttribute('aria-hidden', 'true');
           _.switcher.classList.add('second');
           _.switcherState = 'second';
       } else {
           _.source.style.removeProperty('display');
           _.container.style.setProperty('display', 'none');
           _.switcher.lastElementChild.setAttribute('aria-hidden', 'true');
           _.switcher.firstElementChild.removeAttribute('aria-hidden');
           _.switcher.classList.remove('second');
           _.switcherState = 'first';
       }

    });

}

Duration.prototype.init = function() {
    let _ = this;

    if (!_.source.classList.contains(_.options.cssClass)) {
        _.buildWidget();
        _.setSourceValue();
        _.initializeEvents();

        _.source.dispatchEvent(new Event('durationinitialized'));
    }
}