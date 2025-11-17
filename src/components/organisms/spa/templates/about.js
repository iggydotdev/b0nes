import { fromConfig } from "/utils/mapper.js"

export const components = fromConfig([
    {type: 'atom', name:'box', props:{
                    slot:[
                        {type: 'atom', name:'text', props:{is:'h1',slot:['About']}},
                        {type: 'atom', name:'text', props:{is: 'p', slot: ['b0nes is the best framework ever. Fight me.']}},
                        {type: 'atom', name:'button', props:{attrs:'data-fsm-event="GOTO_HOME"', slot:['HOME']}}
                    ]
                }}])
