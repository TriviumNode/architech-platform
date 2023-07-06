import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import MainLayout from './Layouts/Main';
import ErrorPage from './Pages/Error';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { UserProvider } from './Contexts/UserContext';
import NftPage from './Pages/NFTs/NFTs';
import { allCollectionsLoader, collectionLoader, tokenLoader, userProfileloader } from './Utils/loaders';
import ProfilePage from './Pages/Profile/Profile';

import 'react-tooltip/dist/react-tooltip.css'
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import ImportPage from './Pages/Import';
import SingleCollection from './Pages/Collection/SingleCollection';
import SingleToken from './Pages/Token/SingleToken';
import CreateSingleNftPage from './Pages/CreateNft/CreateNft';
import CreateCollectionPage from './Pages/CreateCollection/CreateCollection';
import EditCollectionPage from './Pages/CreateCollection/EditCollection';
import Home from './Pages/Home/Home';
import { initClients } from './Utils/queryClient';
import ImportCollectionPage from './Pages/CreateCollection/ImportCollection';
import AdminDashboard from './Pages/Admin/AdminDashboard';


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/nfts",
        element: <NftPage />,
        loader: allCollectionsLoader
      },
      {
        path: "/nfts/:contractAddr/:tokenId",
        element: <SingleToken />,
        loader: tokenLoader
      },
      {
        path: "/nfts/:contractAddr",
        element: <SingleCollection />,
        loader: collectionLoader,
      },
      {
        path: "/nfts/import",
        element: <ImportCollectionPage />,
      },
      {
        path: "/nfts/createcollection",
        element: <CreateCollectionPage />,
      },
      {
        path: "/nfts/create",
        element: <CreateSingleNftPage />,
        loader: collectionLoader,
      },
      {
        path: "/nfts/create/:contractAddr",
        element: <CreateSingleNftPage />,
        loader: collectionLoader,
      },
      {
        path: "/nfts/edit/:contractAddr",
        element: <EditCollectionPage />,
        loader: collectionLoader,
      },
      {
        path: "/nfts/edit/:contractAddr/:page",
        element: <EditCollectionPage />,
        loader: collectionLoader,
      },
      {
        path: "/profile/:userAddress",
        element: <ProfilePage />,
        loader: userProfileloader
      },
      {
        path: "/admindash",
        element: <AdminDashboard />,
      },
    ],
  },
  // {
  //   path: "contacts/:contactId",
  //   element: <Contact />,
  // },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <UserProvider>
      <ToastContainer />
      <RouterProvider router={router} />
    </UserProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
