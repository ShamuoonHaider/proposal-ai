import { ToastContainer as ReactToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastContainer() {
  return (
    <ReactToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />
  );
}
