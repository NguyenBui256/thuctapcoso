import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { ToastContainer } from "react-toastify";

export default function MainLayout() {

    return (
        <div className="w-full overflow-x-hidden">
            <style>
                {`
                /* Global CSS to ensure dropdowns are always on top */
                .navbar-dropdown {
                    z-index: 9999 !important;
                    position: relative;
                }

                /* Make sure content takes full width */
                body, html {
                    width: 100%;
                    max-width: 100%;
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                }

                .outlet-container {
                    width: 100%;
                    max-width: 100%;
                    padding: 0;
                    margin: 0;
                }
                `}
            </style>
            <Navbar />
            <div className="outlet-container">
                <Outlet />
            </div>
            <ToastContainer
                position="bottom-right"
            />
        </div>
    )
}