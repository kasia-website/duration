let Duration = (function() {
    function Duration(element, settings) {
        let _ = this;

        _.defaults = {
            cssClass: 'duration-initialized',
            labels: {
                'seconds': 'sec',
                'minutes': 'min',
                'hours'  : 'hrs'
            },
            initialValue: {
                'seconds': '0',
                'minutes': '0',
                'hours':   '0'
            },
            leadingZeroes: false,
            outputFormat: 'industriestunden' // or 'iso'
        }

        if (!settings || !settings instanceof Object) {
            settings = {};
        }

        _.options = {
            ..._.defaults,
            ...settings
        };

        _.container =  undefined;
        _.containerCssClass = 'duration-container';
        _.source    = element instanceof HTMLElement ? element : document.querySelector(element);

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
    
    _.source.insertAdjacentElement('afterend', container);
    _.container = container;
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

Duration.prototype.initializeEvents = function() {
    let _ = this;

    document.addEventListener('input', _.handleInput.bind(_));
}

Duration.prototype.setSourceValue = function() {
    let _ = this, value;

    switch(_.options.outputFormat) {
        case 'industriestunden':
            value = _.hours.value + ',' + Math.floor(_.minutes.value * 100 / 60);
            break;
        case 'iso':
            value = 'PT';

            if (_.hours.value > 0) {
                value += _.hours.value + 'H';
            }

            if (_.minutes.value > 0) {
                value += _.minutes.value + 'M';
            }

            value += Math.floor(_.seconds.value) + 'S';
            break;
    }

    _.source.value = value;
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