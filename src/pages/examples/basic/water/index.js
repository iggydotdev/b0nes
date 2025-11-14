import { stylesheetPresets } from '../../../../framework/config/stylesheets.js';

export const meta = {
    title: 'Water.css Example',
    description: 'An example page styled with Water.css framework.',
    stylesheets:  stylesheetPresets.water()
   
}
export const components = [
    {
        type: 'organism',
        name: 'header',
        props: {
            slot: [
                {
                        type: 'atom',
                        name: 'link',
                        props: { 
                            slot: 'Home', 
                            url: '/examples/home'
                        }
                    },
                    { 
                        type: 'atom',
                        name: 'link',
                        props: { 
                            slot: 'Pico CSS', 
                            url: '/examples/pico'
                        },
                    },
                    { 
                        type: 'atom',
                        name: 'link',
                        props: { 
                            slot: 'Water CSS', 
                            url: '/examples/water'
                        },
                    },
                    { 
                        type: 'atom',
                        name: 'link',
                        props: { 
                            slot: 'Tailwind CSS', 
                            url: '/examples/tailwind'
                        },
                    },
            ]
            // Water.css styles <nav> and <a> elements semantically, so few classes needed here.
        }
    },
    {
        type: 'organism',
        name: 'hero',
        props: {
            attrs: 'id="main-hero"',
            className: 'container', // Water.css uses a default max-width for main content
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h1',
                        slot: 'Welcome to b0nes Framework (Water.css)',
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        slot: 'Build modern web applications with ease and Water.css styling.'
                    }
                },
                {
                    type: 'atom',
                    name: 'image',
                    props: {
                        src: 'https://picsum.photos/1200/400',
                        alt: 'Hero Image'
                    }
                },
                {
                    type: 'atom',
                    name: 'link',
                    props: {
                        url: '/get-started',
                        slot: 'Get Started',
                        className: 'button' // Water.css styles <button> and <a> as buttons
                    }
                },
            ]
        }
    },
    {
        type: 'organism',
        name: 'cta',
        props: {
            className: 'container', // Water.css default container
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h2',
                        slot: 'Ready to Dive In?',
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        slot: 'Join us today and start building amazing web experiences!',
                    }
                },
                {
                    type: 'atom',
                    name: 'link',
                    props: {
                        url: '/sign-up',
                        slot: 'Sign Up Now',
                        className: 'button'
                    }
                },
            ]
        }
    },
    {
        type: 'organism',
        name: 'footer',
        props: {
            className: 'container', // Water.css default container
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        slot: ['© 2024 b0nes Framework. All rights reserved. (Water.css)']
                    }
                }
            ]
        }
    }
];