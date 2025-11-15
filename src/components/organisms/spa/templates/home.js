export const components = [{
    type: 'atom',
    name: 'box',
    props: {
        slot:[
            {
                type: 'atom',
                name: 'text',
                props:{
                    is:'h1',
                    slot:['Home']
                }
            },
            {
                type: 'atom',
                name: 'text',
                props:{
                    is: 'h1',
                    slot:['Welcome !']
                }
            },
            {
                type:'atom',
                name: 'button',
                props:{
                    attrs:'data-fsm-event="GOTO_TODOS"', 
                    slot:['Go to Todos']
                }
            }
        ]
    }
}]