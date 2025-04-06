import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { ToastContainer } from "react-toastify";

export default function MainLayout() {
    
    return (
        <div>
            <Navbar/>
            <Outlet/>
            <ToastContainer
                position="bottom-right"
            />
        </div>
    )
}