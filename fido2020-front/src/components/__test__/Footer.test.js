import React from 'react';
import ReactDOM from 'react-dom';

import Footer from '../Footer.js';

it('renders without crashing', () => {
    const nav = document.createElement('nav');
    ReactDOM.render(<Footer />, nav);
});
