export const components = (data) => [
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
                            slot: 'About', 
                            url: '/about'
                        },
                    },
                    { 
                        type: 'atom',
                        name: 'link',
                        props: { 
                            slot: 'Blog', 
                            url: '/blog'
                        },
                    },
                    { 
                        type: 'atom',
                        name: 'link',
                        props: { 
                            slot: 'Contact', 
                            url: '/contact'
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
            type: 'atom',
            name: 'text',
            props: {
                is: 'h2',
                slot: `Ready to Dive In? Blog post ${data.answer}`,
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