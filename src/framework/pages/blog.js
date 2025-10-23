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
                        className: 'text-blue-600 font-semibold px-4 py-6 inline-block',
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
            className: 'bg-gradient-to-br from-blue-50 to-slate-50 py-16 px-6 text-center',
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h1',
                        className: 'text-5xl md:text-6xl font-bold text-gray-900 mb-6',
                        slot: 'Our Blog',
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        className: 'text-xl text-gray-600 max-w-3xl mx-auto',
                        slot: 'Insights, tutorials, and updates from the Flesh Framework team'
                    }
                },
            ]
        }
    },
    {
        type: 'organism',
        name: 'content',
        props: {
            className: 'max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-8',
            slot: [
                {
                    type: 'molecule',
                    name: 'card',
                    props: {
                        className: 'bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden',
                        slot: [
                            {
                                type: 'atom',
                                name: 'image',
                                props: {
                                    className: 'w-full h-48 object-cover',
                                    src: 'https://picsum.photos/400/300?random=1',
                                    alt: 'Blog Post 1'
                                }
                            },
                            {
                                type: 'atom',
                                name: 'text',
                                props: {
                                    is: 'h3',
                                    className: 'text-2xl font-bold text-gray-900 px-6 pt-6 mb-3',
                                    slot: 'Getting Started with Flesh Framework',
                                }
                            },
                            {
                                type: 'atom',
                                name: 'text',
                                props: {
                                    is: 'p',
                                    className: 'text-gray-600 px-6 pb-4 mb-4',
                                    slot: 'A comprehensive guide to building your first application with Flesh Framework.',
                                }
                            },
                            {
                                type: 'atom',
                                name: 'link',
                                props: {
                                    className: 'text-blue-600 hover:text-blue-700 font-medium px-6 pb-6 inline-block',
                                    url: '/blog/getting-started',
                                    slot: 'Read More →',
                                }
                            },
                        ]
                    }
                },
                {
                    type: 'molecule',
                    name: 'card',
                    props: {
                        className: 'bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden',
                        slot: [
                            {
                                type: 'atom',
                                name: 'image',
                                props: {
                                    className: 'w-full h-48 object-cover',
                                    src: 'https://picsum.photos/400/300?random=2',
                                    alt: 'Blog Post 2'
                                }
                            },
                            {
                                type: 'atom',
                                name: 'text',
                                props: {
                                    is: 'h3',
                                    className: 'text-2xl font-bold text-gray-900 px-6 pt-6 mb-3',
                                    slot: 'Advanced Component Patterns',
                                }
                            },
                            {
                                type: 'atom',
                                name: 'text',
                                props: {
                                    is: 'p',
                                    className: 'text-gray-600 px-6 pb-4 mb-4',
                                    slot: 'Learn how to create reusable, scalable components for complex applications.',
                                }
                            },
                            {
                                type: 'atom',
                                name: 'link',
                                props: {
                                    className: 'text-blue-600 hover:text-blue-700 font-medium px-6 pb-6 inline-block',
                                    url: '/blog/advanced-patterns',
                                    slot: 'Read More →',
                                }
                            },
                        ]
                    }
                },
                {
                    type: 'molecule',
                    name: 'card',
                    props: {
                        className: 'bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden',
                        slot: [
                            {
                                type: 'atom',
                                name: 'image',
                                props: {
                                    className: 'w-full h-48 object-cover',
                                    src: 'https://picsum.photos/400/300?random=3',
                                    alt: 'Blog Post 3'
                                }
                            },
                            {
                                type: 'atom',
                                name: 'text',
                                props: {
                                    is: 'h3',
                                    className: 'text-2xl font-bold text-gray-900 px-6 pt-6 mb-3',
                                    slot: 'Performance Optimization Tips',
                                }
                            },
                            {
                                type: 'atom',
                                name: 'text',
                                props: {
                                    is: 'p',
                                    className: 'text-gray-600 px-6 pb-4 mb-4',
                                    slot: 'Discover best practices for building lightning-fast web applications.',
                                }
                            },
                            {
                                type: 'atom',
                                name: 'link',
                                props: {
                                    className: 'text-blue-600 hover:text-blue-700 font-medium px-6 pb-6 inline-block',
                                    url: '/blog/performance',
                                    slot: 'Read More →',
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
