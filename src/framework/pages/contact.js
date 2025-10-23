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
                        className: 'text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 px-4 py-6 inline-block',
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
                        className: 'text-blue-600 font-semibold px-4 py-6 inline-block',
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
                        slot: 'Get in Touch',
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        className: 'text-xl text-gray-600 max-w-3xl mx-auto',
                        slot: 'Have questions? We\'d love to hear from you.'
                    }
                },
            ]
        }
    },
    {
        type: 'organism',
        name: 'content',
        props: {
            className: 'max-w-4xl mx-auto py-16 px-6',
            slot: [
                {
                    type: 'molecule',
                    name: 'form',
                    props: {
                        className: 'bg-white rounded-2xl shadow-xl p-8 md:p-12',
                        slot: [
                            {
                                type: 'atom',
                                name: 'text',
                                props: {
                                    is: 'h2',
                                    className: 'text-3xl font-bold text-gray-900 mb-8',
                                    slot: 'Send us a message',
                                }
                            },
                            {
                                type: 'atom',
                                name: 'input',
                                props: {
                                    className: 'w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                    placeholder: 'Your Name',
                                    type: 'text'
                                }
                            },
                            {
                                type: 'atom',
                                name: 'input',
                                props: {
                                    className: 'w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                    placeholder: 'Your Email',
                                    type: 'email'
                                }
                            },
                            {
                                type: 'atom',
                                name: 'textarea',
                                props: {
                                    className: 'w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-40 resize-none',
                                    placeholder: 'Your Message'
                                }
                            },
                            {
                                type: 'atom',
                                name: 'button',
                                props: {
                                    className: 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105',
                                    slot: 'Send Message'
                                }
                            },
                        ]
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h3',
                        className: 'text-2xl font-bold text-gray-900 mt-16 mb-6 text-center',
                        slot: 'Other Ways to Reach Us',
                    }
                },
                {
                    type: 'molecule',
                    name: 'info',
                    props: {
                        className: 'grid md:grid-cols-3 gap-6 text-center',
                        slot: [
                            {
                                type: 'atom',
                                name: 'text',
                                props: {
                                    is: 'p',
                                    className: 'text-gray-700',
                                    slot: 'Email: hello@fleshframework.com',
                                }
                            },
                            {
                                type: 'atom',
                                name: 'text',
                                props: {
                                    is: 'p',
                                    className: 'text-gray-700',
                                    slot: 'Phone: +1 (555) 123-4567',
                                }
                            },
                            {
                                type: 'atom',
                                name: 'text',
                                props: {
                                    is: 'p',
                                    className: 'text-gray-700',
                                    slot: 'Twitter: @FleshFramework',
                                }
                            },
                        ]
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
