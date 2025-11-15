export const components = [
    {type: 'atom', name:'box', props: {
                    slot:[
                       {   type: 'atom',
                            name:'text', 
                            props:{
                                is:'h1',
                                slot:['Todo Detail']
                            }
                        },
                        {type: 'atom', 
                            name:'text', 
                            props: {
                                is: 'p', 
                                slot:[
                                    {
                                        type: 'atom', 
                                        name:'text', 
                                        props:{ 
                                            is: 'strong', 
                                            slot: [`${todo.text}`]
                                        }
                                    }
                                ]
                            }},
                        {
                            type: 'atom', 
                            name:'text', 
                            props:{
                                is: 'p', 
                                slot:[`Status: ${todo.done ? 'Done ✅' : 'Not done'}`]}},
                        {
                            type: 'atom', 
                            name:'button', props: {attrs:'data-fsm-event="GOTO_TODOS"', slot:['Back to List']}}
                    ]
                }}]