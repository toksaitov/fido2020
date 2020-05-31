import React from 'react';
import ReactDOM from 'react-dom';
import UserToolbar from '../UserToolbar.js';
import { BrowserRouter } from 'react-router-dom';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<BrowserRouter><UserToolbar /></BrowserRouter>, div);
});
