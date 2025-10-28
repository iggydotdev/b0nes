import componentName from './index.js';

export const test = () => {
    const actual = componentName({ /* props go here */  });
    const expected = '...expected value goes here...';
    return actual === expected? true : console.error({actual, expected}) || false;
};
