import video from './index.js';
import source from '../source/index.js';

export const test = () => {
    const actual = video({ attrs: 'controls id="video-player"', className: 'custom-video', slot: [source({ type: 'video', srcset: 'video.mp4', attrs: 'controls id="video-source"', className: 'custom-video' })] });
    const expected = '<video class="video custom-video" controls id="video-player"><source srcset="video.mp4" class="video-src custom-video" controls id="video-source"/></video>';
    return actual === expected? true : console.error({actual, expected}) || false;
};
