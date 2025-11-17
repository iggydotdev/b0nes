import { box, input, text, button, progress } from "../../atoms/index.js"

export const multiStepForm = ({ className = '', attrs = '' } = {}) => {
  
  return box({ 
    is: 'div', 
    className,
    attrs: `data-b0nes="organisms:multi-step-form" ${attrs}`,
    slot: [
      progress({ max: 3, value: 1, className: 'form-progress',
      attrs: 'id="form-progress" aria-label="Form completion progress"'}),
      // All steps are rendered, client will hide/show
      box({ attrs: 'data-step="step1"', slot: [
        text({ is: 'h3', slot: 'Step 1 – Name' }),
        input({ type: 'text', attrs:"name='name' placeholder='Your name' required" }),
        button({ slot: 'Next →', attrs:"data-action='next'" }),
      ]}),

      box({ attrs:"data-step='step2' hidden", slot: [
        text({is: 'h3', slot: 'Step 2 – Email' }),
        input({ type: 'email', attrs:"name='email' placeholder='you@example.com' required" }),
        button({ slot: '← Back', attrs:"data-action='back'" }),
        button({ slot: 'Next →', attrs:"data-action='next'" })
      ]}),

      box({ attrs:"data-step='step3' hidden", slot: [
        text({ is: 'h3', slot: 'Step 3 – Age' }),
        input({ type: 'number', attrs: "name='age' placeholder='42'" }),
        button({ slot: '← Back', attrs:"data-action='back'" }),
        button({ slot: 'Submit', attrs:"data-action='submit'" })
      ]}),

      box({ attrs:"data-step='success' hidden", slot: [
        text({ is: 'h3', slot: '🎉 Success!' }),
        box({ slot: [
          text({is: 'p', slot: [
            'Name: ',
            text({is: 'strong', attrs:"data-field='name'", slot: [""] })
          ]}),
        ]}),

        box({ slot: [
          text({is:'p', slot: [
            'Email: ', 
            text({is: 'strong', attrs:"data-field='email'", slot: [''] })
        ]}),

        box({ slot: [
          text({is:'p', slot: [
            'Age: ',
            text({is:'strong', attrs:"data-field='age'", slot: ['']})
          ]}),
          button({slot: 'Start Over', attrs:"data-action='reset'"})
        ]}),
      ]}),
      text({ is:'p', slot: [
            'FSM state: ',
            text({ is:'strong', attrs:"data-status=''", slot: 'step1' })
        ]})
      ]})
    ]})
  }
