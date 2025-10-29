/**
 * Demo page showcasing interactive components
 * Demonstrates tabs, modal, and dropdown components
 */

export const components = [
    {
        type: 'organism',
        name: 'header',
        props: {
            slot: [
                { type: 'atom', name: 'link', props: { url: '/', slot: 'Home' } },
                { type: 'atom', name: 'link', props: { url: '/demo', slot: 'Demo' } },
                { type: 'atom', name: 'link', props: { url: '/blog/test', slot: 'Blog' } }
            ]
        }
    },
    {
        type: 'organism',
        name: 'hero',
        props: {
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h1',
                        slot: 'Interactive Components Demo'
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        slot: 'Explore the client-side interactivity powered by b0nes.js'
                    }
                }
            ]
        }
    },
    {
        type: 'atom',
        name: 'box',
        props: {
            is: 'section',
            className: 'demo-section',
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h2',
                        slot: 'Tabs Component'
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        slot: 'Click tabs to switch content. Use keyboard arrows for navigation.'
                    }
                },
                {
                    type: 'molecule',
                    name: 'tabs',
                    props: {
                        tabs: [
                            {
                                label: 'Overview',
                                content: '<p>This is the <strong>Overview</strong> tab. Tabs provide an easy way to organize content into separate views.</p>'

                                /// 
                                /*

                                content: {
                                    type: 'atom',
                                    name: 'text',
                                    props: {
                                        is: 'p',
                                        slot: [
                                            'This is the ',
                                            {
                                                type: 'atom',
                                                name: 'text',
                                                props: {
                                                    is: 'strong',
                                                    slot: ['Overview']
                                                }
                                            },
                                            ' tab. Tabs provide an easy way to organize content into separate views.'
                                        ]
                                    }
                                },
                                */
                            },
                            {
                                label: 'Features',
                                content: '<ul><li>Keyboard accessible</li><li>ARIA compliant</li><li>Zero dependencies</li><li>Progressive enhancement</li></ul>'
                            },
                            {
                                label: 'Usage',
                                content: '<pre>{ type: "molecule", name: "tabs", props: { tabs: [...] } }</pre>'
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        type: 'atom',
        name: 'box',
        props: {
            is: 'section',
            className: 'demo-section',
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h2',
                        slot: 'Modal Component'
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        slot: 'Click the button below to open a modal dialog. Close with X, overlay click, or Escape key.'
                    }
                },
                {
                    type: 'atom',
                    name: 'button',
                    props: {
                        attrs: 'data-modal-open="demo-modal"',
                        slot: 'Open Modal',
                        className: 'btn-primary'
                    }
                },
                {
                    type: 'molecule',
                    name: 'modal',
                    props: {
                        id: 'demo-modal',
                        title: 'Welcome to b0nes!',
                        slot: [
                            {
                                type: 'atom',
                                name: 'text',
                                props: {
                                    is: 'p',
                                    slot: 'This is a modal dialog built with zero dependencies. It features:'
                                }
                            },
                            {
                                type: 'atom',
                                name: 'text',
                                props: {
                                    is: 'ul',
                                    slot: '<li>Overlay backdrop</li><li>Focus management</li><li>Escape key support</li><li>Accessible markup</li>'
                                }
                            },
                            {
                                type: 'atom',
                                name: 'button',
                                props: {
                                    slot: 'Got it!',
                                    attrs: 'data-modal-close',
                                    className: 'btn-primary'
                                }
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        type: 'atom',
        name: 'box',
        props: {
            is: 'section',
            className: 'demo-section',
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h2',
                        slot: 'Dropdown Component'
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        slot: 'Click the dropdown to see menu items. Closes on outside click or Escape.'
                    }
                },
                {
                    type: 'molecule',
                    name: 'dropdown',
                    props: {
                        trigger: 'Actions ▾',
                        slot: [{
                            type: 'atom',
                            name: 'link',
                            props: {
                                url: '#edit',
                                slot: 'Edit',
                            }
                        },
                        {
                            type: 'atom',
                            name: 'link',
                            props: {
                                url: '#duplicate',
                                slot: 'Duplicate',
                            }
                        },
                        {
                            type: 'atom',
                            name: 'link',
                            props: {
                                url: '#delete',
                                slot: 'Delete',
                            }
                        },]
                            
                    }
                }
            ]
        }
    },
    {
        type: 'organism',
        name: 'cta',
        props: {
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h2',
                        slot: 'Ready to Build?'
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        slot: 'All these components are built with zero dependencies using pure JavaScript.'
                    }
                },
                {
                    type: 'atom',
                    name: 'button',
                    props: {
                        slot: 'View Documentation',
                        className: 'cta-button'
                    }
                }
            ]
        }
    },
    {
        type: 'organism',
        name: 'footer',
        props: {
            slot: [{
                type: 'atom',
                name: 'text',
                props: {
                    is: 'p',
                    slot: ['© 2025 b0nes Framework. Built with zero dependencies. ']
                }
            }]
        }
    }
];
