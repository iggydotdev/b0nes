import test from 'node:test';
import assert from 'node:assert';
import source from './index.js';

const testVideoSource = () => {
    const actual = source({ type: 'video', srcset: 'video.mp4', attrs: 'controls id="video-source"', className: 'custom-video' });
    const expected = '<source srcset="video.mp4" class="video-src custom-video" controls id="video-source"/>';
    assert.strictEqual(actual, expected);
}
testVideoSource();

const testImageSource = () => {
    const actual = source({ type: 'image', src: 'image.jpg', attrs: 'id="image-source"', className: 'custom-image' });
    const expected = '<source src="image.jpg" class="img-src custom-image" id="image-source"/>';
    assert.strictEqual(actual, expected);
}
testImageSource();


test('source rendering', () => {
    return testImageSource() && testVideoSource();
});