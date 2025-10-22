import { video } from "./index.js";

export const show = () => {
    return video({ attrs: 'controls', className: 'custom-video', slot: '<source srcset="video.mp4" class="video-src custom-video" controls id="video-source"/>' });
};