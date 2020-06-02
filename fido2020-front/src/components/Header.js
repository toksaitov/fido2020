import React from 'react';
import { Link } from 'react-router-dom';

import UserToolbar from '../containers/UserToolbar.js';

const Header = ({ showUserToolbar }) =>
    <header>
        <nav className="navbar navbar-dark bg-primary">
            <Link className="navbar-brand" to="/">
                <h1>Fido2020</h1>
            </Link>
            {showUserToolbar && <UserToolbar />}
        </nav>
    </header>;

export default Header;
