// export const components = [
//         {
//             type: 'organism',
//             name: 'header',
//             props: {
//                 slot: [
//                     {
//                         type: 'atom',
//                         name: 'link',
//                         props: { 
//                             slot: 'Home', 
//                             url: '/'
//                         }
//                     },
//                     { 
//                         type: 'atom',
//                         name: 'link',
//                         props: { 
//                             slot: 'About', 
//                             url: '/about'
//                         },
//                     },
//                     { 
//                         type: 'atom',
//                         name: 'link',
//                         props: { 
//                             slot: 'Blog', 
//                             url: '/blog'
//                         },
//                     },
//                     { 
//                         type: 'atom',
//                         name: 'link',
//                         props: { 
//                             slot: 'Contact', 
//                             url: '/contact'
//                         },
//                     },
//                 ]
//             }  
//         },
//         {
//             type: 'organism',
//             name: 'hero',
//             props: {
//                 attrs: 'id="main-hero"',
//                 className: 'main-hero',
//                 slot: [
//                     {
//                         type: 'atom',
//                         name: 'text',
//                         props: {
//                             is: 'h1',
//                             slot: 'Welcome to Flesh Framework',
//                         }
//                     },
//                     {
//                         type: 'atom',
//                         name: 'text',
//                         props: {
//                             is: 'p',
//                              slot: 'Build modern web applications with ease'
//                         }
//                     },                  
//                     {
//                         type: 'atom',
//                         name: 'image',
//                         props: {
//                             src: 'https://picsum.photos/1200/400',
//                             alt: 'Hero Image'
//                         }
//                     },
//                     {
//                     type: 'atom',
//                     name: 'link',
//                     props: {
//                         url: '/get-started',
//                         slot: 'Get Started',
//                     }
//                 },
//                 ]
//             }
//         }, 
//         {
//         type: 'organism',
//         name: 'cta',
//         props: {
//             slot: [
//                 {
//                     type: 'atom',
//                     name: 'text',
//                     props: {
//                         is: 'h2',
//                         slot: 'Ready to Dive In?',
//                     }
//                 },
//                 {
//                     type: 'atom',
//                     name: 'text',
//                     props: {
//                         is: 'p',
//                         slot: 'Join us today and start building amazing web experiences!',
//                     }
//                 },            
                
//                 {
//                     type: 'atom',
//                     name: 'link',
//                     props: {
//                         url: '/sign-up',
//                         slot: 'Sign Up Now',
//                     }
//                 },
//             ]
//         }
//         }, 
//         {
//             type: 'organism',
//             name: 'footer',
//             props: {
//                 slot: [
//                     {
//                         type: 'atom',
//                         name: 'text',
//                         props: {
//                             is: 'p',
//                             slot: ['© 2024 Flesh Framework. All rights reserved.']
//                         }
//                     }
//                 ]
//             }
//         }
//     ]


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
            attrs: 'id="main-hero"',
            className: 'main-hero bg-gradient-to-br from-blue-50 to-slate-100 py-20 px-6 text-center',
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h1',
                        className: 'text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight',
                        slot: 'Welcome to b0nes Framework',
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        className: 'text-xl text-gray-600 mb-10 max-w-2xl mx-auto',
                        slot: 'Build modern web applications with ease'
                    }
                },                  
                {
                    type: 'atom',
                    name: 'image',
                    props: {
                        className: 'rounded-2xl shadow-2xl max-w-5xl mx-auto mb-10 w-full object-cover',
                        src: 'https://picsum.photos/1200/400',
                        alt: 'Hero Image'
                    }
                },
                {
                    type: 'atom',
                    name: 'link',
                    props: {
                        className: 'inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105',
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
            className: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 px-6 text-center',
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'h2',
                        className: 'text-4xl md:text-5xl font-bold mb-4',
                        slot: 'Ready to Dive In?',
                    }
                },
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        className: 'text-xl text-blue-100 mb-8 max-w-2xl mx-auto',
                        slot: 'Join us today and start building amazing web experiences!',
                    }
                },            
                {
                    type: 'atom',
                    name: 'link',
                    props: {
                        className: 'inline-block bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105',
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
            className: 'bg-gray-900 text-gray-400 py-8 px-6 text-center border-t border-gray-800',
            slot: [
                {
                    type: 'atom',
                    name: 'text',
                    props: {
                        is: 'p',
                        className: 'text-sm',
                        slot: ['© 2024 b0nes Framework. All rights reserved.']
                    }
                }
            ]
        }
    }
]
