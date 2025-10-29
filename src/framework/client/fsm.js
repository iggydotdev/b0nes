// FSM = Finite State Machine
// Lets figure this out with a demo for a multi step form
(function fsm() {
    // State
    const b0nesFSMNode = document.querySelector('[data-bones-fsm]');
    const states = {
        "START": {
            template: "<h1>FSM Demo</h1><button id='actionBtn' onclick='trigger('NEXT')'>Perform Action</button>",
            url: "/demo/fsm/start",
            on: {
                "RESET": {
                    state: "START",
                    url: "/demo/fsm/start"
                },
                "NEXT": {
                    state: "STEP2",
                    url: '/demo/fsm/step2'
                },
            }
        },
        "STEP2": {
            template: "<h1>Step 2</h1>\
                       <button id='actionBtn1' onclick=`trigger('BACK')`>Perform Action1</button>\
                       <button id='actionBtn2' onclick=`trigger('SUCCESS')`>Perform Action2</button>",
            url: "/demo/fsm/step2",
            on: {
                "BACK": {
                    state: "START",
                    url: "/demo/fsm/start",
                },
                "SEND": {
                    state: "SUCCESS",
                    url:  '/demo/fsm/success'
                }
            }
        },
        "SUCCESS": {
            template: "<h1>Step 2</h1><button id='actionBtn'>Perform Action</button>",
            url: "/demo/fsm/success",
        }
    }

    let currentState = null;

    const setup = () => {
        b0nesFSMNode.innerHTML = currentState.template;
        currentState = states["START"]
    }


    const trigger = (action) => {
        const newState = currentState.on[action].state;
        const transitionTo = newState.url;
        currentState = states[newState];
        window.history.pushState(null, "", transitionTo);
        //render();
    }
    

})();