export const components = (todos) => [{
    type: 'atom', 
    name:'box', 
    props: {
        slot:[
            {type: 'atom', name:'text', props:{is:'h1',slot:['Todos']}},
            {type: 'atom', name:'box', props:{is: 'ul', slot:[
                todos.map(todo =>
                    ({type: 'atom', name: 'box', props:{is: 'li', slot:[
                        {type: 'atom', name:'text', props:{
                            is: 'label', 
                            for: `${todo-id}`, 
                            slot: [
                                {type: 'atom', name:'input', props:{type: "checkbox", attrs:`${todo.done ? 'checked' : ''} data-action="toggle" data-id="${todo.id} id=${todo.id}"`}},
                                `${todo.text}`
                            ],
                        }},
                        {type: 'atom', name:'button', props:{attrs:'data-fsm-event="GOTO_TODO"', slot:['View'], attrs: `data-param=${todo.id}`}}
                    ]}})
                ).join('')
            ]}},
            {
                type: 'atom', 
                name:'button', 
                props:{
                    attrs:'data-fsm-event="GOTO_HOME"', 
                    slot:['Back Home']
                }
            }
        ]
    }}]  