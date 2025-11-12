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
                        url: '/',
                        className: 'text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium'
                    }
                },
                {
                    type: 'atom',
                    name: 'link',
                    props: {
                        slot: 'Pico CSS',
                        url: '/pico',
                        className: 'text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium'
                    },
                },
                {
                    type: 'atom',
                    name: 'link',
                    props: {
                        slot: 'Water CSS',
                        url: '/water',
                        className: 'text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium'
                    },
                },
                {
                    type: 'atom',
                    name: 'link',
                    props: {
                        slot: 'Tailwind CSS',
                        url: '/tailwind',
                        className: 'text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium'
                    },
                },
            ],
            className: 'bg-gray-800 p-4 shadow-md flex justify-between items-center' // Tailwind classes for header
        }
    },
    {
        type: 'organism',
        name: 'hero',
        props: {
            attrs: 'id="main-hero"',
            className: 'bg-blue-600 text-white py-20 text-center', // Tailwind classes for hero section
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h1',
                        slot: 'Welcome to b0nes Framework (Tailwind CSS)',
                        className: 'text-5xl font-bold mb-4'
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        slot: 'Build modern web applications with ease and Tailwind CSS styling.',
                        className: 'text-xl mb-8'
                    }
                },
                {
                    type: 'atom',
                    name: 'image',
                    props: {
                        src: 'https://picsum.photos/1200/400',
                        alt: 'Hero Image',
                        className: 'mx-auto rounded-lg shadow-lg my-8 max-w-full h-auto' // Center image, add styling
                    }
                },
                {
                    type: 'atom',
                    name: 'link',
                    props: {
                        url: '/get-started',
                        slot: 'Get Started',
                        className: 'bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300' // Tailwind button
                    }
                },
            ]
        }
    },
    {
        type: 'organism',
        name: 'cta',
        props: {
            className: 'bg-gray-100 py-16 text-center', // Tailwind classes for CTA section
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h2',
                        slot: 'Ready to Dive In?',
                        className: 'text-4xl font-bold mb-4 text-gray-800'
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        slot: 'Join us today and start building amazing web experiences!',
                        className: 'text-lg mb-8 text-gray-600'
                    }
                },
                {
                    type: 'atom',
                    name: 'link',
                    props: {
                        url: '/sign-up',
                        slot: 'Sign Up Now',
                        className: 'bg-green-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-600 transition duration-300' // Tailwind button
                    }
                },
            ]
        }
    },
    {
        type: 'organism',
        name: 'footer',
        props: {
            className: 'bg-gray-800 text-white py-8 text-center', // Tailwind classes for footer
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        slot: ['© 2024 b0nes Framework. All rights reserved. (Tailwind CSS)'],
                        className: 'text-sm text-gray-400'
                    }
                }
            ]
        }
    }
];