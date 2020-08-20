new Duration('#demo-simple', {
    outputFormat: 'decimal'
});

new Duration('#demo-initial-value', {
    initialValue: {
        minutes: '30',
        hours:   '1'
    },
    inputs: ['hours', 'minutes', 'seconds'],
    outputFormat: 'iso'
});

new Duration('#demo-labels', {
    inputs: ['hours', 'minutes', 'seconds'],
    labels: {
        seconds: 'seconds',
        minutes: 'minutes',
        hours  : 'hours'
    },
    outputFormat: 'decimal',
    precision: 6
});

new Duration('#demo-widget', {
    display: 'widget',
    labels: {
        minutes: 'even longer minutes',
        hours  : 'long hours'
    },
    outputFormat: 'decimal'
});

new Duration('#demo-popup', {
    display: 'popup',
    outputFormat: 'decimal',
    sizingElement: 'wrapper'
});

new Duration('#demo-switcher', {
    display: 'switcher',
    outputFormat: 'decimal',
    switcher: {
        firstLabel: 'decimal time',
        secondLabel: 'normal time'
    }
});