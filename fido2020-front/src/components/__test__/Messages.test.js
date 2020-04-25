import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import thunkMiddleware from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

const middlewares = [thunkMiddleware];
const mockStore = configureStore(middlewares)

import Messages from '../Messages.js';
import MessagesWrapped from '../../containers/Messages.js';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Messages messages={[]} loadMessages={() => {}} />, div);
});

it('renders without and requests to load the message', () => {
    const mockFunction = jest.fn(() => {});

    const div = document.createElement('div');
    ReactDOM.render(<Messages messages={[]} loadMessages={mockFunction} />, div);

    expect(mockFunction.mock.calls.length).toBe(1);
});

it('matches the previous snapshot', () => {
    const initialState = {
        'messages': [
            {
                "id": 1, 
                "content": "hello",
                "createdAt": "2020-05-24T14:01:41.000Z",
                "updatedAt": "2020-05-24T14:01:41.000Z",
                "user":  {
                    "id": 1,
                    "login": "admin"
                }
            }
        ]
    };
    const store = mockStore(initialState)

    const tree = renderer.create(
        <Provider store={store}>
            <MessagesWrapped />
        </Provider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
});

it('shows a specific message', () => {
    const initialState = {
        'messages': [
            {
                "id": 1, 
                "content": "hello",
                "createdAt": "2020-05-24T14:01:41.000Z",
                "updatedAt": "2020-05-24T14:01:41.000Z",
                "user":  {
                    "id": 1,
                    "login": "admin"
                }
            }
        ]
    };
    const store = mockStore(initialState)

    const wrapper = mount(
        <Provider store={store}>
            <MessagesWrapped />
        </Provider>
    );
    expect(wrapper.contains("hello")).toBe(true);
});

it('shows editing buttons for admin', () => {
    const initialState = {
        'messages': [
            {
                "id": 1, 
                "content": "hello",
                "createdAt": "2020-05-24T14:01:41.000Z",
                "updatedAt": "2020-05-24T14:01:41.000Z",
                "user":  {
                    "id": 1,
                    "login": "admin"
                }
            }
        ],
        'user': {
            "id": 1,
            "login": "admin",
            "authorized": true,
            "administrator": true
        }
    };
    const store = mockStore(initialState)

    const wrapper = mount(
        <Provider store={store}>
            <MessagesWrapped />
        </Provider>
    );
    expect(wrapper.find('.edit-button').length).toBe(1);
    expect(wrapper.find('.delete-button').length).toBe(1);
});