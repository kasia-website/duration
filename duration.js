let Duration = (function() {
    function Duration(element, settings) {
        let _ = this;

        _.defaults = {
            whatever: false
        }

        if (!settings || !settings instanceof Object) {
            settings = {}
        }

        _.options = {
            ..._.defaults,
            ...settings
        };

        _.container =  undefined;
        _.source    = element instanceof HTMLElement ? element : document.querySelector(element);

        _.init();
    }

    return Duration;
}());

Duration.prototype.buildWidget = function() {
    let _ = this, container;

    container = document.createElement('div');
    container.setAttribute('id', _.generateId());
    container.classList.add('duration-container');

    document.body.appendChild(container);
    _.container = container;

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

Duration.prototype.handleClick = function(event) {}

Duration.prototype.init = function() {
    let _ = this;

    if (!_.source.classList.contains('duration-initialized')) {
        _.buildWidget();
        _.initializeEvents();

        console.log('Duration successfully initialized!');

        _.source.dispatchEvent(new Event('durationinitialized'));
    }
}

Duration.prototype.initializeEvents = function() {
    let _ = this;

    document.addEventListener('click', _.handleClick.bind(_));
}
