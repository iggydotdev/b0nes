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
                            url: '/'
                        }
                    },
                    { 
                        type: 'atom',
                        name: 'link',
                        props: { 
                            slot: 'Pico CSS', 
                            url: '/pico'
                        },
                    },
                    { 
                        type: 'atom',
                        name: 'link',
                        props: { 
                            slot: 'Water CSS', 
                            url: '/water'
                        },
                    },
                    { 
                        type: 'atom',
                        name: 'link',
                        props: { 
                            slot: 'Tailwind CSS', 
                            url: '/tailwind'
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
                            slot: 'Welcome to Flesh Framework',
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
                    }
                },
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
                            slot: ['© 2024 Flesh Framework. All rights reserved.']
                        }
                    }
                ]
            }
        }
    ]