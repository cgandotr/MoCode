import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignIn from './components/SignIn';
import { AuthContext } from './AuthContext';
import { unmountComponentAtNode } from "react-dom";
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';



let container = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

});

afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
});

const renderWithAuthContext = (ui, { providerProps, ...renderOptions }) => {
    return render(
        <MemoryRouter>
            <AuthContext.Provider value={providerProps}>{ui}</AuthContext.Provider>
        </MemoryRouter>,
        renderOptions
    );
};

jest.mock('firebase/auth', () => ({
    GoogleAuthProvider: jest.fn(),
    signInWithPopup: jest.fn(),
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(),
    getAuth: jest.fn(() => ({
        // Mock any methods on auth that you use
    })),
}));

jest.mock('firebase/firestore', () => ({
    doc: jest.fn(),
    setDoc: jest.fn(),
    getDoc: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // Preserve other exports
    useNavigate: jest.fn(), // Mock useNavigate
}));


describe('SignIn Component', () => {
    it('renders sign in button', () => {
        const providerProps = {
            currentUser: null, // or your mock currentUser object
            setCurrentUser: jest.fn(), // mock function for setting current user
        };
        renderWithAuthContext(<SignIn />, { providerProps });
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });

});
