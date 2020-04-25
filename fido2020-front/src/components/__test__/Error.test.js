import React from 'react';
import ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';

import Error from '../Error.js';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Error />, div);
});

it('shows a specific error message', () => {
    const wrapper = shallow(<Error error="Something went wrong" />);
    expect(wrapper.contains("Something went wrong")).toBe(true);
});

it('matches the previous snapshot', () => {
    const tree = renderer.create(<Error error="test message" />).toJSON();
    expect(tree).toMatchSnapshot();
});

it('clears error', () => {
    let cleared = false;
    const clearErrorFake = () => { cleared = true; };

    const wrapper = shallow(<Error error="test message" clearError={clearErrorFake} />);
    wrapper.find('button').simulate('click');

    expect(cleared).toBe(true);
});

