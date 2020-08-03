new Duration('#demo-simple', {inputs: ['hours', 'minutes']});

new Duration('#demo-initial-value', {
    initialValue: {
        minutes: '30',
        hours:   '1'
    },
    inputs: ['hours', 'minutes', 'seconds'],
    outputFormat: 'iso'
});

new Duration('#demo-labels', {
    inputs: ['hours', 'minutes'],
    labels: {
        minutes: 'minutes',
        hours  : 'hours'
    },
});

new Duration('#demo-widget', {
    display: 'widget',
    inputs: ['hours', 'minutes'],
    labels: {
        minutes: 'even longer minutes',
        hours  : 'long hours'
    },
});

new Duration('#demo-popup', {
    display: 'popup',
    inputs: ['hours', 'minutes']
});

new Duration('#demo-switcher', {
    display: 'switcher',
    inputs: ['hours', 'minutes'],
    switcher: {
        firstLabel: 'Industriezeit',
        secondLabel: 'normale Zeit'
    }
});