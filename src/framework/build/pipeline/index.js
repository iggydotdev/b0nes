import { build } from './ssg.js';

// give me on cli what do you need
const outputDir = 'public';

build(outputDir)
   .then(result => process.exit(result.errors.length > 0 ? 1 : 0))
   .catch(error => {
    console.error(error)
    process.exit(1)
   });
