// App.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App'; // Adjust the import path as necessary

// Mock child components and hooks
jest.mock('./components/NavBar', () => () => <div>NavBar</div>);
jest.mock('./components/Footer', () => () => <div>Footer</div>);
jest.mock('./components/Contact', () => () => <div>Contact</div>);
jest.mock('./components/QandA', () => () => <div>QandA</div>);
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // Preserve other exports
    useNavigate: () => jest.fn(), // Mock useNavigate
}));

describe('App Component is properly rendering child components', () => {
    test('renders without crashing', () => {
        render(<App />);
        //Check whether smaller components are properly rendering
        expect(screen.getByText(/The Best Way to Code/i)).toBeInTheDocument();      
        expect(screen.getByText('NavBar')).toBeInTheDocument();
        expect(screen.getByText('Footer')).toBeInTheDocument();
        expect(screen.getByText('QandA')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
        
    });
});
