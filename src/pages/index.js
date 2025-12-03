import { stylesheetPresets } from "../framework/config/stylesheets.js"

export const meta = {
    title: 'Pico.css Example',
    description: 'An example page styled with pico.css framework.',
    stylesheets:  stylesheetPresets.pico()
   
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
            }  
        },
        {
            type: 'organism',
            name: 'hero',
            props: {
                attrs: 'id="main-hero"',
                className: 'main-hero',
                slot: [
                    {
                        type: 'atom',
                        name: 'text',
                        props: {
                            is: 'h1',
                            slot: 'Welcome to b0nes Framework',
                        }
                    },
                    {
                        type: 'atom',
                        name: 'text',
                        props: {
                            is: 'p',
                             slot: 'Build modern web applications with ease'
                        }
                    },                  
                    {
                        type: 'atom',
                        name: 'image',
                        props: {
                            src: './b0nes.png',
                            alt: 'b0nes Image',
                            attrs: 'width="160px" height="100px"',
                        }
                    }]
                
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
                        url: '/examples/talk',
                        slot: 'Talk?',
                    }
                },
            ]
        }
        }, 
        {
            type: 'organism',
            name: 'footer',
            props: {
                slot: [
                    {
                        type: 'atom',
                        name: 'text',
                        props: {
                            is: 'p',
                            slot: ['© 2025 b0nes Framework. All rights reserved.']
                        }
                    }
                ]
            }
        }
    ]