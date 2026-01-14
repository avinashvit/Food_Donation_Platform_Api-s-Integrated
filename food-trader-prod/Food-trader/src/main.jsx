import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './Home.jsx';
import Login from './login.jsx';
import RoleSelection from './RoleSelection.jsx';
import DashboardRouter from './dashboard/DashboardRouter.jsx';
import DonorHistory from './dashboard/DonorHistory.jsx';
import RecipientHistory from './dashboard/RecipientHistory.jsx';
//import { AboutUs, ContactUs } from './StaticPages.jsx';
import AboutUs from './AboutUs.jsx';
import ContactUs from './ContactUs.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

const Router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/select-role',
        element: <RoleSelection />,
    },
    {
        path: '/dashboard',
        element: <DashboardRouter />,
    },
    {
        path: '/donor/history',
        element: <DonorHistory />,
    },
    {
        path: '/recipient/history',
        element: <RecipientHistory />,
    },
    {
        path: '/about-us', 
        element: <AboutUs />,
    },
    {
        path: '/contact', 
        element: <ContactUs />,
    }
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Auth0Provider
            domain="dev-e8w64u7surs6l35j.us.auth0.com"
            clientId="dWhv1ZOA2XS2pkMpO3up4ER1DKJKkUZW"
            authorizationParams={{
                redirect_uri: window.location.origin,
            }}
        >
            <RouterProvider router={Router} />
        </Auth0Provider>
    </StrictMode>
);