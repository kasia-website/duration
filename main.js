new Duration('#demo-simple');

new Duration('#demo-initial-value', {
    initialValue: {
        minutes: '30',
        hours:   '1'
    }
});

new Duration('#demo-labels', {
    labels: {
        minutes: 'minutes',
        hours  : 'hours'
    },
});

new Duration('#demo-widget', {
    display: 'widget'
});

new Duration('#demo-popup', {
    display: 'popup'
});

new Duration('#demo-switcher', {
    display: 'switcher',
    switcher: {
        firstLabel: 'Industriezeit',
        secondLabel: 'normale Zeit'
    }
});