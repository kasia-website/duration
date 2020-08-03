let Duration = (function() {
    function Duration(element, settings) {
        let _ = this, deepProperties;

        _.consts = {
            /* iso */
            DESIGNATOR_YEARS:   'Y',
            DESIGNATOR_MONTHS:  'm',
            DESIGNATOR_WEEKS:   'W',
            DESIGNATOR_DAYS:    'D',
            DESIGNATOR_HOURS:   'H',
            DESIGNATOR_MINUTES: 'M',
            DESIGNATOR_SECONDS: 'S',

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
                years:   'yrs',
                months:  'mo',
                weeks:   'wks',
                days:    'days',
                hours:   'hrs',
                minutes: 'min',
                seconds: 'sec'
            },
            initialValue: {
                years:   '0',
                months:  '0',
                weeks:   '0',
                days:    '0',
                hours:   '0',
                minutes: '0',
                seconds: '0'
            },
            inputs: ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'],
            leadingZeroes: false,
            outputFormat: _.consts.FORMAT_ISO,
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
        deepProperties.forEach(function(property) {
            if (settings.hasOwnProperty(property)) {
                _.options[property] = {
                    ..._.defaults[property],
                    ...settings[property]
                };
            }
        });

        if (_.options.outputFormat === _.consts.FORMAT_DECIMAL) {
            _.options.inputs = ['hours', 'minutes'];
        }

        if (_.options.display === _.consts.DISPLAY_SWITCHER && _.options.switcher.labelShows === _.consts.SHOWS_CURRENT ) {
            let tmp = _.options.switcher.firstLabel;
            _.options.switcher.firstLabel = _.options.switcher.secondLabel;
            _.options.switcher.secondLabel = tmp;
        }

        _.container =  undefined;
        _.containerCssClass = 'duration-container';
        _.hours = undefined;
        _.inputs = [];
        _.minutes = undefined;
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
    let _ = this, container, period;

    container = document.createElement('div');
    container.setAttribute('id', _.generateId());
    container.classList.add(_.containerCssClass);
    _.container = container;

    _.options.inputs.forEach(function(period) {
        _.setupPeriod(period);
    });
    
    if (_.source.closest('label')) {
        _.source.closest('label').insertAdjacentElement('afterend', container);
    } else {
        _.source.insertAdjacentElement('afterend', container);
    }

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

    if (event.target.matches('[data-designator]')) {
        _.setSourceValue();
    }

    if(event.target === _.source) {
        _.setWidgetValue();
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
            value = '0';
            _.inputs.forEach(function(input) {
                if (input.getAttribute('data-designator') === 'H' && input.value > 0) {
                    value = input.value;
                }
                if (input.getAttribute('data-designator') === 'M') {
                    value += '.' + Math.floor(input.value * 100 / 60);
                }
            });
            break;
        case _.consts.FORMAT_ISO:
            value = 'P';
            const designators = ['Y', 'm', 'W', 'D'];
            let insertTime = true;

            _.inputs.forEach(function(input) {
                if (designators.indexOf(input.getAttribute('data-designator')) < 0 && insertTime) {
                   value += 'T';
                   insertTime = false;
                }
                if (input.value > 0) {
                    value += input.value + input.getAttribute('data-designator').toUpperCase();
                }
            });

            if (value === 'PT') {
                value += '0S';
            }

            break;
    }

    _.source.value = value;
}

Duration.prototype.setupPeriod = function(period) {
    let _ = this, periodContainer, periodLabelText, periodInput;

    periodContainer = document.createElement('label');

    periodLabelText = document.createElement('span');
    periodLabelText.innerText = _.options.labels[period];
    periodContainer.appendChild(periodLabelText);

    periodInput = document.createElement('input');

    periodInput.setAttribute('data-designator', _.consts['DESIGNATOR_' + period.toUpperCase()]);
    periodInput.setAttribute('type', 'number');
    periodInput.setAttribute('min', '0');
    periodInput.setAttribute('step', '1');
    periodInput.value = _.options.initialValue[period];
    periodContainer.appendChild(periodInput);
    _.inputs.push(periodInput);

    _.container.appendChild(periodContainer);
}

Duration.prototype.setWidgetValue = function() {
    let _ = this, value;

    switch(_.options.outputFormat) {
        case _.consts.FORMAT_DECIMAL:
            let hours = Math.floor(_.source.value);
            let minutes = _.source.value - hours;

            if (_.inputs[0].getAttribute('data-designator') === _.consts.DESIGNATOR_HOURS) {
                _.inputs[0].value = hours;
            }
            if (_.inputs[1].getAttribute('data-designator') === _.consts.DESIGNATOR_MINUTES) {
                _.inputs[1].value = Math.floor(minutes * 60);
            }
            break;
        case _.consts.FORMAT_ISO:
            let values = _.source.value.split(/([TYMWDHS]|\d+)/);

            values = values.filter(function(value) {
                return value.length > 0;
            });

            _.inputs.forEach(function(input) {
               let designator = input.getAttribute('data-designator');

               if (designator === 'm') {
                   let index = values.indexOf('M');
                   let T = values.indexOf('T');
                   if (index > -1 && index < T && Math.floor(values[index - 1]) > 0) {
                        input.value = Math.floor(values[index - 1]);
                   } else {
                       input.value = 0;
                   }
               } else {
                   let index = values.lastIndexOf(designator);
                   if (index > -1 && Math.floor(values[index - 1]) > 0) {
                       input.value = Math.floor(values[index - 1]);
                   } else {
                       input.value = 0;
                   }
               }
            });
            break;
    }
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
    let _ = this, template, oldLabel, oldLabelText, firstId, secondId, switcherId, containerId, originalInputClone;

    firstId  = _.generateId();
    secondId = _.generateId();
    switcherId = _.generateId();
    containerId = _.generateId();

    originalInputClone = _.source.cloneNode();

    oldLabelText = '';
    if (originalInputClone.hasAttribute('id')) {
        oldLabel = document.querySelector('[for="' + _.source.getAttribute('id') + '"]');
        if (oldLabel) {
            oldLabelText = oldLabel.textContent;
            oldLabel.style.setProperty('display', 'none');
        }
    }

    template = '<fieldset>';

    if (oldLabelText.length > 0) {
        template += '<legend>' + oldLabelText + '</legend>';
    }

    template += '<button type="button" class="switcher" id="' + switcherId + '">' +
                    '<span id="' + firstId + '">' + _.options.switcher.firstLabel +'</span>' +
                    '<span id="' + secondId + '">' + _.options.switcher.secondLabel +'</span>' +
                '</button>';

    originalInputClone.removeAttribute('id');
    originalInputClone.setAttribute('aria-describedby', firstId);

    template += originalInputClone.outerHTML;

    template += '<div class="' + _.options.cssClass + '" id="' + containerId + '">' +
                    '<label>' +
                        '<span>' + _.options.labels.hours + '</span>' +
                        '<input type="number" aria-describedby="' + secondId +'">' +
                    '</label>' +
                    '<label>' +
                        '<span>' + _.options.labels.minutes + '</span>' +
                        '<input type="number" aria-describedby="' + secondId +'">' +
                    '</label>' +
                '</div>'

    template += '</fieldset>';
    _.source.insertAdjacentHTML('afterend', template);

    _.switcher = document.getElementById(switcherId);
    _.container = document.getElementById(containerId);

    if (_.switcherState === _.consts.SWITCHER_STATE_FIRST) {
        _.switcher.lastElementChild.setAttribute('aria-hidden', 'true');
        _.container.style.setProperty('display', 'none');
    } else {
        _.switcher.firstElementChild.setAttribute('aria-hidden', 'true');
        _.source.style.setProperty('display', 'none');
    }

    _.switcher.addEventListener('click', function(event) {
       if (_.switcherState === _.consts.SWITCHER_STATE_FIRST) {
           _.source.style.setProperty('display', 'none');
           _.container.style.removeProperty('display');
           _.switcher.lastElementChild.removeAttribute('aria-hidden');
           _.switcher.firstElementChild.setAttribute('aria-hidden', 'true');
           _.switcher.classList.add(_.consts.SWITCHER_STATE_SECOND);
           _.switcherState = _.consts.SWITCHER_STATE_SECOND;
       } else {
           _.source.style.removeProperty('display');
           _.container.style.setProperty('display', 'none');
           _.switcher.lastElementChild.setAttribute('aria-hidden', 'true');
           _.switcher.firstElementChild.removeAttribute('aria-hidden');
           _.switcher.classList.remove(_.consts.SWITCHER_STATE_SECOND);
           _.switcherState = _.consts.SWITCHER_STATE_FIRST;
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