export const components = [
    {
        type: 'organism',
        name: 'header',
        props: {
            className: 'bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50',
            slot: [
                {
                    type: 'atom',
                    name: 'link',
                    props: { 
                        className: 'text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-4 py-6 inline-block',
                        slot: 'Home', 
                        url: '/'
                    }
                },
                { 
                    type: 'atom',
                    name: 'link',
                    props: { 
                        className: 'text-blue-600 font-semibold px-4 py-6 inline-block',
                        slot: 'About', 
                        url: '/about'
                    },
                },
                { 
                    type: 'atom',
                    name: 'link',
                    props: { 
                        className: 'text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-4 py-6 inline-block',
                        slot: 'Blog', 
                        url: '/blog'
                    },
                },
                { 
                    type: 'atom',
                    name: 'link',
                    props: { 
                        className: 'text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-4 py-6 inline-block',
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
            className: 'bg-gradient-to-br from-slate-50 to-blue-50 py-16 px-6 text-center',
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h1',
                        className: 'text-5xl md:text-6xl font-bold text-gray-900 mb-6',
                        slot: 'About Us',
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        className: 'text-xl text-gray-600 max-w-3xl mx-auto',
                        slot: 'Learn about our mission to revolutionize web development'
                    }
                },
            ]
        }
    },
    {
        type: 'atom',
        name: 'box',
        props: {
            className: 'max-w-5xl mx-auto py-16 px-6',
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h2',
                        className: 'text-3xl font-bold text-gray-900 mb-6',
                        slot: 'Our Story',
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        className: 'text-lg text-gray-700 mb-8 leading-relaxed',
                        slot: 'Flesh Framework was born from a simple idea: web development should be intuitive, powerful, and enjoyable. We believe in creating tools that empower developers to build exceptional experiences without unnecessary complexity.',
                    }
                },
                {
                    type: 'atom',
                    name: 'image',
                    props: {
                        className: 'rounded-xl shadow-lg w-full object-cover mb-12',
                        src: 'https://picsum.photos/1000/500',
                        alt: 'Our Team'
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h2',
                        className: 'text-3xl font-bold text-gray-900 mb-6',
                        slot: 'Our Values',
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        className: 'text-lg text-gray-700 mb-4 leading-relaxed',
                        slot: 'Innovation: We constantly push boundaries to deliver cutting-edge solutions.',
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        className: 'text-lg text-gray-700 mb-4 leading-relaxed',
                        slot: 'Simplicity: Complex problems deserve elegant solutions.',
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        className: 'text-lg text-gray-700 leading-relaxed',
                        slot: 'Community: We grow together, supporting developers at every step.',
                    }
                },
            ]
        }
    },
    {
        type: 'organism',
        name: 'footer',
        props: {
            className: 'bg-gray-900 text-gray-400 py-8 px-6 text-center border-t border-gray-800',
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        className: 'text-sm',
                        slot: '© 2024 Flesh Framework. All rights reserved.'
                    }
                }
            ]
        }
    }
]
